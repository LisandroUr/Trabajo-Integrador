const mongoose = require('mongoose');

const conversacionSchema = new mongoose.Schema({
  participantes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario'
  }],
  comercioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comercio',
    required: true
  },
  ultimoMensaje: {
    type: String
  },
  fechaUltimoMensaje: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Conversacion', conversacionSchema);
