const mongoose = require('mongoose');

const categoriaSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  icono: {
    type: String
  },
  categoriaPadre: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Categoria'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Categoria', categoriaSchema);
