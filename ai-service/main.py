from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import httpx
import os

app = FastAPI(title="AI Microservice for TFI")

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434/api/generate")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3")

class TextoInput(BaseModel):
    texto: str

class ResenasInput(BaseModel):
    resenas: list[str]

@app.get("/")
def read_root():
    return {"status": "online", "service": "AI Microservice"}

@app.post("/clasificar")
async def clasificar_texto(payload: TextoInput):
    prompt = f"Clasifica el siguiente texto de un producto en una categoría general (ej: Electrónica, Ropa, Alimentos). Responde SOLO con la categoría:\n\n{payload.texto}"
    return await llamar_ollama(prompt)

@app.post("/resumir-resenas")
async def resumir_resenas(payload: ResenasInput):
    texto_resenas = "\n".join([f"- {r}" for r in payload.resenas])
    prompt = f"Genera un breve resumen (máximo 3 oraciones) de los siguientes comentarios de clientes:\n\n{texto_resenas}"
    return await llamar_ollama(prompt)

async def llamar_ollama(prompt: str):
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                OLLAMA_URL,
                json={
                    "model": OLLAMA_MODEL,
                    "prompt": prompt,
                    "stream": False
                },
                timeout=30.0
            )
            response.raise_for_status()
            data = response.json()
            return {"resultado": data.get("response", "").strip()}
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Error comunicandose con Ollama: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
