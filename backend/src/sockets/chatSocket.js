const jwt = require('jsonwebtoken');
const Mensaje = require('../models/Mensaje');
const Conversacion = require('../models/Conversacion');

const initChatSocket = (io) => {
  // Fix 2: Middleware de autenticación JWT para el socket.
  // El cliente debe enviar el token en el handshake: io({ auth: { token } })
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) {
      // Permitir conexión sin token pero marcar como anónimo (para guests)
      socket.userId = null;
      return next();
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      // Token inválido: rechazar conexión
      return next(new Error('Token inválido o expirado'));
    }
  });

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
        const { conversacionId, contenido } = data;
        if (!conversacionId || !contenido || !contenido.trim()) return;

        // Fix 2: usar el userId del token verificado, NO el que manda el cliente
        const emisorId = socket.userId;
        if (!emisorId) {
          return socket.emit('error_message', { error: 'No autorizado: token requerido para enviar mensajes' });
        }

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
