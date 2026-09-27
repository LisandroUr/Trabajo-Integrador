const express = require('express');
const router = express.Router();
const { upload, uploadImagen } = require('../controllers/uploadController');
const { protegerRuta } = require('../middlewares/authMiddleware');

// POST /api/uploads — sube una imagen (requiere autenticación)
// Campo del FormData: "imagen"
router.post('/', protegerRuta, upload.single('imagen'), uploadImagen);

module.exports = router;
