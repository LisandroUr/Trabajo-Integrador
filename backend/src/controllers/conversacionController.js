const Conversacion = require('../models/Conversacion');
const Mensaje = require('../models/Mensaje');
const Comercio = require('../models/Comercio');
const PerfilComerciante = require('../models/PerfilComerciante');

// Obtener todas las conversaciones del usuario actual (sea cliente o comerciante)
const getMisConversaciones = async (req, res) => {
  try {
    const usuarioId = req.usuario._id;

    // Obtener comercios de los cuales el usuario es dueño
    const perfilComerciante = await PerfilComerciante.findOne({ usuarioId });
    const misComerciosIds = perfilComerciante ? perfilComerciante.comerciosIds : [];

    const conversaciones = await Conversacion.find({
      $or: [
        { participantes: usuarioId },
        { comercioId: { $in: misComerciosIds } }
      ]
    })
      .populate('participantes', 'nombre email')
      .populate('comercioId', 'nombre vidriera direccion')
      .sort({ fechaUltimoMensaje: -1 });

    res.json(conversaciones);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener o inicializar una conversación entre un cliente y un comercio
const obtenerOCrearConversacion = async (req, res) => {
  try {
    const { comercioId } = req.body;
    const clienteId = req.usuario._id;

    const comercio = await Comercio.findById(comercioId);
    if (!comercio) return res.status(404).json({ error: 'Comercio no encontrado' });

    // Buscar si ya existe una conversación entre este cliente y este comercio
    let conversacion = await Conversacion.findOne({
      comercioId,
      participantes: clienteId
    })
      .populate('participantes', 'nombre email')
      .populate('comercioId', 'nombre vidriera direccion');

    if (!conversacion) {
      // Determinar el usuario comerciante dueño de la tienda
      const perfilDueno = await PerfilComerciante.findOne({ comerciosIds: comercioId });
      const participantes = [clienteId];
      if (perfilDueno && perfilDueno.usuarioId && perfilDueno.usuarioId.toString() !== clienteId.toString()) {
        participantes.push(perfilDueno.usuarioId);
      }

      conversacion = await Conversacion.create({
        comercioId,
        participantes,
        ultimoMensaje: 'Conversación iniciada',
        fechaUltimoMensaje: new Date()
      });

      conversacion = await Conversacion.findById(conversacion._id)
        .populate('participantes', 'nombre email')
        .populate('comercioId', 'nombre vidriera direccion');
    }

    res.status(200).json(conversacion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener mensajes de una conversación
const getMensajesConversacion = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario._id;

    const conversacion = await Conversacion.findById(id)
      .populate('participantes', 'nombre email')
      .populate('comercioId', 'nombre vidriera');

    if (!conversacion) return res.status(404).json({ error: 'Conversación no encontrada' });

    // Marcar como leídos los mensajes no enviados por este usuario
    await Mensaje.updateMany(
      { conversacionId: id, emisorId: { $ne: usuarioId }, leido: false },
      { $set: { leido: true } }
    );

    const mensajes = await Mensaje.find({ conversacionId: id })
      .populate('emisorId', 'nombre')
      .sort({ createdAt: 1 });

    res.json({ conversacion, mensajes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Enviar un mensaje (vía REST)
const enviarMensajeREST = async (req, res) => {
  try {
    const { id } = req.params;
    const { contenido } = req.body;
    const emisorId = req.usuario._id;

    if (!contenido || !contenido.trim()) {
      return res.status(400).json({ error: 'El contenido del mensaje no puede estar vacío' });
    }

    const conversacion = await Conversacion.findById(id);
    if (!conversacion) return res.status(404).json({ error: 'Conversación no encontrada' });

    const nuevoMensaje = await Mensaje.create({
      conversacionId: id,
      emisorId,
      contenido: contenido.trim(),
      leido: false
    });

    conversacion.ultimoMensaje = contenido.trim();
    conversacion.fechaUltimoMensaje = new Date();
    await conversacion.save();

    const mensajePoblado = await Mensaje.findById(nuevoMensaje._id).populate('emisorId', 'nombre');

    res.status(201).json(mensajePoblado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getMisConversaciones,
  obtenerOCrearConversacion,
  getMensajesConversacion,
  enviarMensajeREST
};
