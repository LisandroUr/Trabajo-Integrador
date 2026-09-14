const mongoose = require('mongoose');

const mensajeSchema = new mongoose.Schema({
  conversacionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversacion',
    required: true
  },
  emisorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  contenido: {
    type: String,
    required: true
  },
  leido: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true // Añade automáticamente createdAt y updatedAt
});

module.exports = mongoose.model('Mensaje', mensajeSchema);
