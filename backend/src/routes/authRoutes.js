const express = require('express');
const router = express.Router();
const { 
  registrarUsuario, 
  loginUsuario, 
  getPerfil,
  actualizarPerfil,
  solicitarRecuperacionPassword,
  resetearPassword
} = require('../controllers/authController');
const { protegerRuta } = require('../middlewares/authMiddleware');

// Público
router.post('/registro', registrarUsuario);
router.post('/login', loginUsuario);
router.post('/olvide-password', solicitarRecuperacionPassword);
router.post('/reset-password', resetearPassword);

// Autenticado
router.get('/perfil', protegerRuta, getPerfil);
router.put('/perfil', protegerRuta, actualizarPerfil);

module.exports = router;
