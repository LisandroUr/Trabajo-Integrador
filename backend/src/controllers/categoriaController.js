const Categoria = require('../models/Categoria');

const getCategorias = async (req, res) => {
  try {
    const categorias = await Categoria.find().populate('categoriaPadre');
    res.json(categorias);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createCategoria = async (req, res) => {
  try {
    const { nombre, icono, categoriaPadre } = req.body;
    const nuevaCategoria = await Categoria.create({ nombre, icono, categoriaPadre });
    res.status(201).json(nuevaCategoria);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const categoria = await Categoria.findByIdAndUpdate(id, req.body, { new: true });
    if (!categoria) return res.status(404).json({ error: 'Categoría no encontrada' });
    res.json(categoria);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const categoria = await Categoria.findByIdAndDelete(id);
    if (!categoria) return res.status(404).json({ error: 'Categoría no encontrada' });
    res.json({ message: 'Categoría eliminada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getCategorias, createCategoria, updateCategoria, deleteCategoria };
