const express = require('express');
const router = express.Router();
const { 
  getComercios, 
  getComerciosCercanos,
  getComerciosAdmin,
  getMisComercios,
  getComercioById, 
  createComercio, 
  updateComercio,
  cambiarEstadoComercio, 
  deleteComercio 
} = require('../controllers/comercioController');
const { protegerRuta, requierePermiso } = require('../middlewares/authMiddleware');

// Admin (Auditoría / Aprobaciones) - Caso de uso 02
router.get('/admin/all', protegerRuta, requierePermiso('aprobar_comercio'), getComerciosAdmin);
router.patch('/:id/estado', protegerRuta, requierePermiso('aprobar_comercio'), cambiarEstadoComercio);

// Comerciante (Mis tiendas)
router.get('/me/mis-tiendas', protegerRuta, getMisComercios);

// Búsqueda geoespacial por cercanía (Público)
router.get('/cercanos', getComerciosCercanos);

// Público general
router.get('/', getComercios);
router.get('/:id', getComercioById);

// Comerciante (Alta, edición e inhabilitación/borrado lógico)
router.post('/', protegerRuta, createComercio);
router.put('/:id', protegerRuta, updateComercio);
router.patch('/:id', protegerRuta, updateComercio);
router.delete('/:id', protegerRuta, deleteComercio);

module.exports = router;
