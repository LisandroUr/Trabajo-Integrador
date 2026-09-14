const Resena = require('../models/Resena');
const Comercio = require('../models/Comercio');
const PerfilComerciante = require('../models/PerfilComerciante');

// Función auxiliar para recalcular calificación promedio
const actualizarCalificacionComercio = async (comercioId) => {
  const resenas = await Resena.find({ comercioId, deletedAt: null });
  const cantidadResenas = resenas.length;
  const sumaPuntajes = resenas.reduce((acc, curr) => acc + curr.puntaje, 0);
  const calificacionPromedio = cantidadResenas > 0 ? Number((sumaPuntajes / cantidadResenas).toFixed(1)) : 0;
  
  await Comercio.findByIdAndUpdate(comercioId, {
    calificacionPromedio,
    cantidadResenas
  });

  return { calificacionPromedio, cantidadResenas };
};

// Obtener reseñas públicas de un comercio
const getResenasComercio = async (req, res) => {
  try {
    const { comercioId } = req.params;
    const resenas = await Resena.find({ comercioId, deletedAt: null })
      .populate('usuarioId', 'nombre email')
      .sort({ createdAt: -1 });

    res.json(resenas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Crear nueva reseña (Cliente autenticado)
const createResena = async (req, res) => {
  try {
    const { comercioId, puntaje, comentario } = req.body;
    const usuarioId = req.usuario._id;

    if (!puntaje || puntaje < 1 || puntaje > 5) {
      return res.status(400).json({ error: 'El puntaje debe ser un número entre 1 y 5' });
    }

    const comercio = await Comercio.findById(comercioId);
    if (!comercio || comercio.deletedAt !== null) {
      return res.status(404).json({ error: 'Comercio no encontrado' });
    }

    // Verificar si el usuario ya opinó sobre este comercio
    const resenaExistente = await Resena.findOne({ comercioId, usuarioId, deletedAt: null });
    let resenaFinal;

    if (resenaExistente) {
      resenaExistente.puntaje = puntaje;
      resenaExistente.comentario = comentario;
      resenaFinal = await resenaExistente.save();
    } else {
      resenaFinal = await Resena.create({
        comercioId,
        usuarioId,
        puntaje,
        comentario
      });
    }

    const { calificacionPromedio, cantidadResenas } = await actualizarCalificacionComercio(comercioId);

    const resenaPoblada = await Resena.findById(resenaFinal._id).populate('usuarioId', 'nombre email');

    res.status(201).json({
      resena: resenaPoblada,
      calificacionPromedio,
      cantidadResenas
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Comerciante responde a una reseña
const responderResena = async (req, res) => {
  try {
    const { id } = req.params;
    const { respuesta } = req.body;

    const resena = await Resena.findById(id);
    if (!resena || resena.deletedAt !== null) {
      return res.status(404).json({ error: 'Reseña no encontrada' });
    }

    // Validar que el comerciante sea el dueño del comercio
    const perfil = await PerfilComerciante.findOne({ usuarioId: req.usuario._id });
    if (!perfil || !perfil.comerciosIds.some(cId => cId.toString() === resena.comercioId.toString())) {
      return res.status(403).json({ error: 'No tienes permisos para responder en este comercio' });
    }

    resena.respuestaComerciante = respuesta;
    await resena.save();

    res.json(resena);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Reportar reseña ofensiva (Cualquier usuario autenticado o comerciante)
const reportarResena = async (req, res) => {
  try {
    const { id } = req.params;
    const resena = await Resena.findById(id);
    if (!resena) return res.status(404).json({ error: 'Reseña no encontrada' });

    resena.reportada = true;
    await resena.save();

    res.json({ message: 'Reseña reportada para moderación', id: resena._id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin: Listar reseñas reportadas
const getResenasReportadasAdmin = async (req, res) => {
  try {
    const resenas = await Resena.find({ reportada: true, deletedAt: null })
      .populate('comercioId', 'nombre')
      .populate('usuarioId', 'nombre email')
      .sort({ updatedAt: -1 });

    res.json(resenas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin: Moderar reseña reportada ('eliminar' o 'descartar')
const moderarResenaAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { accion } = req.body; // 'eliminar' | 'descartar'

    const resena = await Resena.findById(id);
    if (!resena) return res.status(404).json({ error: 'Reseña no encontrada' });

    if (accion === 'eliminar') {
      resena.deletedAt = new Date();
      resena.reportada = false;
      await resena.save();
      await actualizarCalificacionComercio(resena.comercioId);
      return res.json({ message: 'Reseña eliminada por el administrador', accion: 'eliminada' });
    } else if (accion === 'descartar') {
      resena.reportada = false;
      await resena.save();
      return res.json({ message: 'Reporte descartado', accion: 'descartado' });
    }

    res.status(400).json({ error: "Acción inválida. Debe ser 'eliminar' o 'descartar'" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getResenasComercio,
  createResena,
  responderResena,
  reportarResena,
  getResenasReportadasAdmin,
  moderarResenaAdmin
};
