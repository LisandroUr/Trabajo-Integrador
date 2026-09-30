const mongoose = require('mongoose');

const perfilAdminSchema = new mongoose.Schema({
  usuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    unique: true,
    required: true
  },
  cargo: {
    type: String,
    required: true
  },
  area: {
    type: String,
    required: true
  },
  activo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PerfilAdminMunicipal', perfilAdminSchema);
