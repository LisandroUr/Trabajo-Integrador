require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
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
app.use(express.json());

// Rutas de la API
const authRoutes = require('./routes/authRoutes');
const categoriaRoutes = require('./routes/categoriaRoutes');
const comercioRoutes = require('./routes/comercioRoutes');
const productoRoutes = require('./routes/productoRoutes');
const resenaRoutes = require('./routes/resenaRoutes');
const conversacionRoutes = require('./routes/conversacionRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/comercios', comercioRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/resenas', resenaRoutes);
app.use('/api/conversaciones', conversacionRoutes);

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

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
