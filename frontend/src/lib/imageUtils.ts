const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

/**
 * Fix 19: Sube una imagen al backend (multipart/form-data) y devuelve la URL pública.
 * Ya no se guarda base64 en MongoDB — el archivo queda en disco en el backend.
 */
export const subirImagen = async (file: File): Promise<string> => {
  // Validar tipo
  if (!file.type.startsWith('image/')) {
    throw new Error('El archivo seleccionado no es una imagen válida.');
  }

  // Validar tamaño (máximo 10MB)
  const MAX_SIZE_MB = 10;
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    throw new Error(`La imagen es demasiado pesada (máximo ${MAX_SIZE_MB}MB).`);
  }

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const formData = new FormData();
  formData.append('imagen', file);

  const response = await fetch(`${API_URL}/uploads`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
      // No incluir Content-Type: el navegador lo setea solo con el boundary de multipart
    },
    body: formData
  });

  const data = await response.json().catch(() => ({ error: 'Respuesta inválida del servidor' }));

  if (!response.ok) {
    throw new Error(data.error || 'Error al subir la imagen');
  }

  return data.url as string;
};

/**
 * @deprecated Usar subirImagen() en su lugar.
 * Mantenida solo para retrocompatibilidad durante la transición.
 * Convierte imagen a WebP base64 en el cliente (NO recomendado: carga MongoDB).
 */
export const procesarImagenWebP = (file: File, maxDim: number = 1200): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      return reject(new Error('El archivo seleccionado no es una imagen válida.'));
    }

    const MAX_SIZE_MB = 10;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return reject(new Error(`La imagen es demasiado pesada (máximo ${MAX_SIZE_MB}MB).`));
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('No se pudo inicializar el procesador de imágenes.'));
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/webp', 0.75);
        resolve(dataUrl);
      };

      img.onerror = () => reject(new Error('El archivo de imagen está corrupto o es ilegible.'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Hubo un error al leer el archivo.'));
    reader.readAsDataURL(file);
  });
};
