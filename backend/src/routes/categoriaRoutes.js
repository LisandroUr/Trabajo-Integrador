const express = require('express');
const router = express.Router();
const { getCategorias, createCategoria, updateCategoria, deleteCategoria } = require('../controllers/categoriaController');
const { protegerRuta, requierePermiso } = require('../middlewares/authMiddleware');

// Público: ver categorías
router.get('/', getCategorias);

// Admin: crear, editar, eliminar (Requieren permiso 'gestionar_categorias')
router.post('/', protegerRuta, requierePermiso('gestionar_categorias'), createCategoria);
router.put('/:id', protegerRuta, requierePermiso('gestionar_categorias'), updateCategoria);
router.delete('/:id', protegerRuta, requierePermiso('gestionar_categorias'), deleteCategoria);

module.exports = router;
