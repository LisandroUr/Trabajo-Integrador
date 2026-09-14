# Reglas Estrictas de Refactorización y Modificación (WatchlistPlus)

Estas reglas son de cumplimiento **OBLIGATORIO** para el Agente (IA) en todo momento para evitar corrupciones de base de datos y errores de sintaxis.

1. **PROHIBIDO EL USO DE POWERSHELL PARA REEMPLAZOS MULTILÍNEA:**
   Nunca utilices $ -replace en PowerShell para modificar código en archivos .js o .html. Utiliza EXCLUSIVAMENTE la herramienta eplace_file_content proporcionada por el sistema.

2. **VERIFICACIÓN DE SINTAXIS OBLIGATORIA (Node.js):**
   Después de cualquier modificación a un archivo .js, TIENES que ejecutar el comprobador de sintaxis de Node.js en la terminal usando BypassSandbox: true (por restricciones de seguridad):
   
ode -c tu_archivo.js
   No puedes dar por finalizado tu turno ni responder al usuario si la sintaxis está rota.

3. **EFECTO DOMINÓ (CHECKLIST DE REFERENCIAS):**
   Si modificas la estructura de datos en storage.js:
   - Debes buscar (con grep) TODAS las funciones en ackground.js y library.js que dependan de esa estructura.
   Si agregas un evento en la Interfaz (Frontend):
   - Debes asegurar que existe su case correspondiente en el switch de mensajes en ackground.js.

## Estado Actual (Última sesión)
- **Monetización PRO Completada:** Se enlazó un producto digital en Ko-fi (https://ko-fi.com/s/26808d8d0c) a la extensión. Se conectó exitosamente el Webhook de Ko-fi con Google Apps Script (Google Sheets) para validar pagos instantáneos sin comisiones usando JSON.parse(e.parameter.data).
- **Sync con Google Drive:** Agregados botones manuales ("Subir a la nube" / "Descargar") en la UI de "Mi Cuenta" (library.html y library.js).
- **Seguridad "Anti-Ratas" Implementada:** Se inyectó código en ackground.js que verifica manifest.update_url y chrome.runtime.id. Si alguien resube la extensión a la Chrome Web Store, el sistema detecta que el ID no coincide con el oficial y destruye la base de datos local y el background script. 
  - *Nota para el desarrollador:* Antes de publicar en la Web Store oficial, debe reemplazar "PONER_TU_ID_OFICIAL_AQUI" en ackground.js por su ID definitivo.

