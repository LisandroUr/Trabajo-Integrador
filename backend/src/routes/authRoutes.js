const express = require('express');
const router = express.Router();
const { registrarUsuario, loginUsuario, getPerfil } = require('../controllers/authController');
const { protegerRuta } = require('../middlewares/authMiddleware');

// /api/auth/registro
router.post('/registro', registrarUsuario);

// /api/auth/login
router.post('/login', loginUsuario);

// /api/auth/perfil - Ruta protegida
router.get('/perfil', protegerRuta, getPerfil);

module.exports = router;
