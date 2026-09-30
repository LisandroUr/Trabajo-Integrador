const express = require('express');
const router = express.Router();
const {
  getProductos,
  getRankingPrecios,
  createProducto,
  updateProducto,
  deleteProducto
} = require('../controllers/productoController');
const { protegerRuta } = require('../middlewares/authMiddleware');

// Endpoint de comparación y ranking de precios (público)
router.get('/ranking', getRankingPrecios);

// Listado general de productos (público)
router.get('/', getProductos);

// Comerciante (Gestión de su catálogo)
router.post('/', protegerRuta, createProducto);
router.put('/:id', protegerRuta, updateProducto);
router.delete('/:id', protegerRuta, deleteProducto);

module.exports = router;
