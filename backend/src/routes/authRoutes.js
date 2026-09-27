const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { 
  registrarUsuario, 
  loginUsuario, 
  getPerfil,
  actualizarPerfil,
  solicitarRecuperacionPassword,
  resetearPassword,
  registroRapido
} = require('../controllers/authController');
const { protegerRuta } = require('../middlewares/authMiddleware');

// Fix 9: Rate limiting para endpoints de autenticación (máx. 10 intentos por 15 minutos)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos. Por favor esperá 15 minutos e intentá de nuevo.' }
});

// Límite más estricto para recuperación de contraseña
const passwordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas solicitudes de recuperación. Intentá en 1 hora.' }
});

// Público
router.post('/registro', authLimiter, registrarUsuario);
router.post('/registro-rapido', authLimiter, registroRapido);
router.post('/login', authLimiter, loginUsuario);
router.post('/olvide-password', passwordLimiter, solicitarRecuperacionPassword);
router.post('/reset-password', passwordLimiter, resetearPassword);

// Autenticado
router.get('/perfil', protegerRuta, getPerfil);
router.put('/perfil', protegerRuta, actualizarPerfil);

module.exports = router;
