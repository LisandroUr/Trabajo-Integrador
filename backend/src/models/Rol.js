const mongoose = require('mongoose');

const rolSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  descripcion: {
    type: String,
    trim: true
  },
  permisos: [{
    type: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Rol', rolSchema);
