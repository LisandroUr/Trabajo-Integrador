require('dotenv').config();
const express = require('express');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const http = require('http');
const path = require('path');
const socketIo = require('socket.io');
const connectDB = require('./config/db');
const initChatSocket = require('./sockets/chatSocket');

// Conectar a MongoDB
connectDB();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*', // En desarrollo permitimos todo. En producción, configurar dominio específico
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
  }
});

// Middlewares globales
app.use(cors());
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api/', limiter);
app.use(express.json({ limit: '10mb' })); // Fix 19: reducido a 10mb (imágenes ya no viajan como base64)
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Fix 19: Servir imágenes subidas como archivos estáticos públicos
// Las URLs quedan como: http://localhost:5001/uploads/filename.jpg
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Rutas de la API
const productoRoutes = require('./routes/productoRoutes');
const resenaRoutes = require('./routes/resenaRoutes');
const conversacionRoutes = require('./routes/conversacionRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

// Nota: /api/auth y endpoints principales de usuarios ahora viven en el servicio Django
app.use('/api/productos', productoRoutes);
app.use('/api/resenas', resenaRoutes);
app.use('/api/conversaciones', conversacionRoutes);
app.use('/api/uploads', uploadRoutes); // Fix 19: endpoint de upload de imágenes

// Ruta base de estado
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    servicio: 'API Vidriera Digital Municipal y Ranking de Precios',
    version: '1.0.0',
    timestamp: new Date()
  });
});

// Inicializar sockets de chat en tiempo real
initChatSocket(io);

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5001;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor Express corriendo en el puerto ${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`ERROR FATAL: El puerto ${PORT} ya se encuentra ocupado.`);
    process.exit(1);
  } else {
    throw err;
  }
});
