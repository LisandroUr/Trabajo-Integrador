const mongoose = require('mongoose');

const perfilComercianteSchema = new mongoose.Schema({
  usuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    unique: true,
    required: true
  },
  cuit: {
    type: String,
    required: true,
    trim: true
  },
  razonSocial: {
    type: String,
    required: true,
    trim: true
  },
  comerciosIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comercio'
  }],
  fechaAlta: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PerfilComerciante', perfilComercianteSchema);
