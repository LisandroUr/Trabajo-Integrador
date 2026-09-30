const mongoose = require('mongoose');

const resenaSchema = new mongoose.Schema({
  comercioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comercio',
    required: true
  },
  usuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  puntaje: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comentario: {
    type: String,
    trim: true
  },
  respuestaComerciante: {
    type: String,
    trim: true
  },
  reportada: {
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

module.exports = mongoose.model('Resena', resenaSchema);
