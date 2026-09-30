const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
  comercioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comercio',
    required: true
  },
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  descripcion: String,
  precio: {
    type: Number,
    required: true,
    min: 0
  },
  imagen: String,
  categoria: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Categoria'
  },
  disponible: {
    type: Boolean,
    default: true
  },
  tipo: {
    type: String,
    enum: ['producto', 'servicio'],
    default: 'producto'
  },
  destacado: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Producto', productoSchema);
