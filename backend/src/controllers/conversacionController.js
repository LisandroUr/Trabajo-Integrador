const Conversacion = require('../models/Conversacion');
const Mensaje = require('../models/Mensaje');

// Obtener todas las conversaciones del usuario actual (sea cliente o comerciante)
const getMisConversaciones = async (req, res) => {
  try {
    const usuarioId = req.usuario._id;

    // Obtener comercios de los cuales el usuario es dueño
    const perfilComerciante = await PerfilComerciante.findOne({ usuarioId });
    const misComerciosIds = perfilComerciante ? perfilComerciante.comerciosIds : [];

    let conversaciones = await Conversacion.find({
      $or: [
        { participantes: usuarioId },
        { comercioId: { $in: misComerciosIds } }
      ]
    })
      .populate('participantes', 'nombre email fotoPerfil')
      .populate('comercioId', 'nombre vidriera direccion contacto')
      .sort({ fechaUltimoMensaje: -1 });

    // Auto-heal: Eliminar conversaciones duplicadas generadas por el bug de concurrencia
    const vistas = new Set();
    const paraEliminar = [];
    const conversacionesUnicas = [];

    for (const c of conversaciones) {
      // Creamos una clave única basada en el comercio y los IDs de los participantes ordenados
      const parts = c.participantes.map(p => p._id.toString()).sort().join('_');
      const key = `${c.comercioId?._id}_${parts}`;

      if (vistas.has(key)) {
        paraEliminar.push(c._id);
      } else {
        vistas.add(key);
        conversacionesUnicas.push(c);
      }
    }

    if (paraEliminar.length > 0) {
      // Fix 5: Soft delete en lugar de hard delete para no perder mensajes irreversiblemente
      await Conversacion.updateMany(
        { _id: { $in: paraEliminar } },
        { $set: { deletedAt: new Date() } }
      );
      await Mensaje.updateMany(
        { conversacionId: { $in: paraEliminar } },
        { $set: { deletedAt: new Date() } }
      );
    }

    res.json(conversacionesUnicas);
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

    // Determinar el usuario comerciante dueño de la tienda
    const perfilDueno = await PerfilComerciante.findOne({ comerciosIds: comercioId });
    const participantes = [clienteId];
    if (perfilDueno && perfilDueno.usuarioId && perfilDueno.usuarioId.toString() !== clienteId.toString()) {
      participantes.push(perfilDueno.usuarioId);
    }

    // Usar findOneAndUpdate con upsert para evitar race conditions (React Strict Mode)
    let conversacion = await Conversacion.findOneAndUpdate(
      {
        comercioId,
        participantes: clienteId // El cliente siempre está en esta conversación
      },
      {
        $setOnInsert: {
          comercioId,
          participantes,
          ultimoMensaje: 'Conversación iniciada',
          fechaUltimoMensaje: new Date()
        }
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true
      }
    );
    conversacion = await Conversacion.findById(conversacion._id)
      .populate('participantes', 'nombre email fotoPerfil')
      .populate('comercioId', 'nombre vidriera direccion contacto');


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
      .populate('participantes', 'nombre email fotoPerfil')
      .populate('comercioId', 'nombre vidriera direccion contacto');

    if (!conversacion) return res.status(404).json({ error: 'Conversación no encontrada' });

    // Marcar como leídos los mensajes no enviados por este usuario
    await Mensaje.updateMany(
      { conversacionId: id, emisorId: { $ne: usuarioId }, leido: false },
      { $set: { leido: true } }
    );

    const mensajes = await Mensaje.find({ conversacionId: id })
      .populate('emisorId', 'nombre fotoPerfil')
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

    const mensajePoblado = await Mensaje.findById(nuevoMensaje._id).populate('emisorId', 'nombre fotoPerfil');

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
