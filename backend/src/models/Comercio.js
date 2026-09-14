const mongoose = require('mongoose');

const historialEstadoSchema = new mongoose.Schema({
  estadoAnterior: String,
  nuevoEstado: String,
  fecha: {
    type: Date,
    default: Date.now
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario'
  },
  motivo: String
}, { _id: false });

const horarioSchema = new mongoose.Schema({
  dia: Number, // 0 = Domingo, 1 = Lunes, etc.
  horaApertura: String,
  horaCierre: String
}, { _id: false });

const comercioSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  descripcion: String,
  categorias: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Categoria'
  }],
  direccion: String,
  ubicacion: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitud, latitud] - mongoose requiere orden Longitud primero
      index: '2dsphere'
    }
  },
  contacto: {
    telefono: String,
    whatsapp: String,
    email: String,
    redes: [String]
  },
  horarios: [horarioSchema],
  vidriera: {
    logo: String,
    bannerPrincipal: String,
    colores: [String],
    galeria: [String]
  },
  estado: {
    type: String,
    enum: ['pendiente', 'aprobado', 'rechazado', 'suspendido'],
    default: 'pendiente'
  },
  historialEstados: [historialEstadoSchema], // Audit Log
  calificacionPromedio: {
    type: Number,
    default: 0
  },
  cantidadResenas: {
    type: Number,
    default: 0
  },
  destacado: {
    type: Boolean,
    default: false
  },
  deletedAt: { // Soft Delete
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

comercioSchema.index({ ubicacion: '2dsphere' });

module.exports = mongoose.model('Comercio', comercioSchema);
