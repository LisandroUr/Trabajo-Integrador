const mongoose = require('mongoose');

const perfilClienteSchema = new mongoose.Schema({
  usuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    unique: true,
    required: true
  },
  comerciosFavoritos: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comercio'
  }],
  direccionPredeterminada: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PerfilCliente', perfilClienteSchema);
