const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

// Directorio donde se guardan las imágenes subidas
const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads');

// Crear el directorio si no existe
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    // Nombre único: timestamp + hash aleatorio + extensión original
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const unique = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;
    cb(null, unique);
  }
});

const fileFilter = (_req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes (JPEG, PNG, WebP, GIF)'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB máximo
  }
});

// POST /api/uploads  → sube una imagen y devuelve su URL pública
const uploadImagen = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se recibió ningún archivo' });
  }

  // La URL pública donde el cliente puede acceder a la imagen
  const protocol = req.protocol;
  const host = req.get('host');
  const url = `${protocol}://${host}/uploads/${req.file.filename}`;

  res.status(201).json({
    url,
    filename: req.file.filename,
    size: req.file.size,
    mimetype: req.file.mimetype
  });
};

module.exports = { upload, uploadImagen };
