const express = require('express');
const router = express.Router();
const {
  getResenasComercio,
  createResena,
  responderResena,
  reportarResena,
  getResenasReportadasAdmin,
  moderarResenaAdmin
} = require('../controllers/resenaController');
const { protegerRuta, requierePermiso } = require('../middlewares/authMiddleware');

// Público: ver reseñas de un comercio
router.get('/comercio/:comercioId', getResenasComercio);

// Cliente autenticado: crear o actualizar su reseña
router.post('/', protegerRuta, createResena);

// Comerciante dueño: responder a una reseña
router.patch('/:id/respuesta', protegerRuta, responderResena);

// Cualquier usuario: reportar reseña inapropiada
router.patch('/:id/reportar', protegerRuta, reportarResena);

// Admin: listar reseñas reportadas y moderar
router.get('/admin/reportadas', protegerRuta, requierePermiso('aprobar_comercio'), getResenasReportadasAdmin);
router.patch('/admin/moderar/:id', protegerRuta, requierePermiso('aprobar_comercio'), moderarResenaAdmin);

module.exports = router;
