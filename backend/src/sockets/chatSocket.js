const Mensaje = require('../models/Mensaje');
const Conversacion = require('../models/Conversacion');

const initChatSocket = (io) => {
  io.on('connection', (socket) => {
    // Unirse a una sala específica de conversación
    socket.on('join_conversation', (conversacionId) => {
      if (!conversacionId) return;
      socket.join(`room_${conversacionId}`);
    });

    // Salir de una sala
    socket.on('leave_conversation', (conversacionId) => {
      if (!conversacionId) return;
      socket.leave(`room_${conversacionId}`);
    });

    // Enviar mensaje en tiempo real
    socket.on('send_message', async (data) => {
      try {
        const { conversacionId, emisorId, contenido } = data;
        if (!conversacionId || !emisorId || !contenido || !contenido.trim()) return;

        // Persistir en MongoDB
        const nuevoMensaje = await Mensaje.create({
          conversacionId,
          emisorId,
          contenido: contenido.trim(),
          leido: false
        });

        // Actualizar último mensaje en la conversación
        await Conversacion.findByIdAndUpdate(conversacionId, {
          ultimoMensaje: contenido.trim(),
          fechaUltimoMensaje: new Date()
        });

        const mensajePoblado = await Mensaje.findById(nuevoMensaje._id).populate('emisorId', 'nombre');

        // Emitir a todos los miembros de la sala (incluyendo el emisor para confirmación inmediata)
        io.to(`room_${conversacionId}`).emit('receive_message', mensajePoblado);
      } catch (err) {
        socket.emit('error_message', { error: err.message });
      }
    });

    // Indicador de escritura
    socket.on('typing', ({ conversacionId, usuarioNombre, isTyping }) => {
      if (!conversacionId) return;
      socket.to(`room_${conversacionId}`).emit('user_typing', { usuarioNombre, isTyping });
    });

    socket.on('disconnect', () => {
      // Desconexión limpia
    });
  });
};

module.exports = initChatSocket;
