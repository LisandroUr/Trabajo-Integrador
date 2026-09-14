const express = require('express');
const router = express.Router();
const {
  getMisConversaciones,
  obtenerOCrearConversacion,
  getMensajesConversacion,
  enviarMensajeREST
} = require('../controllers/conversacionController');
const { protegerRuta } = require('../middlewares/authMiddleware');

// Todas las rutas de chat requieren autenticación
router.use(protegerRuta);

router.get('/', getMisConversaciones);
router.post('/', obtenerOCrearConversacion);
router.get('/:id/mensajes', getMensajesConversacion);
router.post('/:id/mensajes', enviarMensajeREST);

module.exports = router;
