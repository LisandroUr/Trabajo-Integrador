const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const Rol = require('../models/Rol');

const generarToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const registrarUsuario = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    const usuarioExiste = await Usuario.findOne({ email });
    if (usuarioExiste) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Asignar rol 'cliente' por defecto si existe
    const rolCliente = await Rol.findOne({ nombre: 'cliente' });
    const roles = rolCliente ? [rolCliente._id] : [];

    const usuario = await Usuario.create({
      nombre,
      email,
      password: hashedPassword,
      roles
    });

    if (usuario) {
      res.status(201).json({
        _id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        roles: ['cliente'],
        token: generarToken(usuario._id),
      });
    } else {
      res.status(400).json({ error: 'Datos de usuario inválidos' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const loginUsuario = async (req, res) => {
  try {
    const { email, password } = req.body;

    const usuario = await Usuario.findOne({ email }).populate('roles');

    if (usuario && (await bcrypt.compare(password, usuario.password))) {
      if (!usuario.activo) {
        return res.status(401).json({ error: 'El usuario se encuentra inactivo' });
      }

      res.json({
        _id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        roles: usuario.roles.map(r => r.nombre),
        token: generarToken(usuario._id),
      });
    } else {
      res.status(401).json({ error: 'Email o contraseña incorrectos' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPerfil = async (req, res) => {
  try {
    res.json(req.usuario);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// CU-22: Gestión de Cuenta (Actualizar datos de perfil)
const actualizarPerfil = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;
    const usuario = await Usuario.findById(req.usuario._id);

    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    if (nombre) usuario.nombre = nombre;
    if (email) usuario.email = email;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      usuario.password = await bcrypt.hash(password, salt);
    }

    const actualizado = await usuario.save();
    res.json({
      _id: actualizado._id,
      nombre: actualizado.nombre,
      email: actualizado.email,
      message: 'Perfil actualizado exitosamente'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// CU-21: Recuperación de Contraseña (Solicitud y simulación de notificación por email)
const solicitarRecuperacionPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      // Por seguridad no revelamos si el email existe
      return res.json({ message: 'Si el correo está registrado, se enviaron las instrucciones de reseteo.' });
    }

    // Generar token temporal de 1 hora para reseteo
    const resetToken = jwt.sign({ id: usuario._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // En producción se enviaría vía SendGrid / Resend / Nodemailer.
    res.json({
      message: 'Instrucciones enviadas al correo electrónico registrado.',
      tokenTemporal: resetToken // Para fines de evaluación y prueba académica
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// CU-21: Restablecer contraseña con token
const resetearPassword = async (req, res) => {
  try {
    const { token, nuevaPassword } = req.body;
    if (!token || !nuevaPassword) {
      return res.status(400).json({ error: 'Token y nueva contraseña son requeridos' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const usuario = await Usuario.findById(decoded.id);
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado o token inválido' });

    const salt = await bcrypt.genSalt(10);
    usuario.password = await bcrypt.hash(nuevaPassword, salt);
    await usuario.save();

    res.json({ message: 'Contraseña restablecida exitosamente. Ya puedes iniciar sesión.' });
  } catch (error) {
    res.status(400).json({ error: 'Token inválido o expirado' });
  }
};

module.exports = {
  registrarUsuario,
  loginUsuario,
  getPerfil,
  actualizarPerfil,
  solicitarRecuperacionPassword,
  resetearPassword
};
