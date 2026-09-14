const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  roles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rol'
  }],
  activo: {
    type: Boolean,
    default: true
  },
  fechaRegistro: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Usuario', usuarioSchema);
