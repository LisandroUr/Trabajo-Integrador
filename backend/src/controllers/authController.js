const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Usuario = require('../models/Usuario');
const Rol = require('../models/Rol');

const generarToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// Regex de validación de email
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const registrarUsuario = async (req, res) => {
  try {
    const { nombre, email, password, tipoUsuario } = req.body;

    // Validación básica y sanitización de caracteres especiales para evitar inyecciones
    const regexEspeciales = /[<>$%&\'"*;]/g;
    if (regexEspeciales.test(nombre) || regexEspeciales.test(email)) {
      return res.status(400).json({ error: 'No se permiten caracteres especiales en nombre o email' });
    }

    // Fix 17: Validar formato de email
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Formato de email inválido' });
    }

    const usuarioExiste = await Usuario.findOne({ email });
    if (usuarioExiste) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Seleccionar rol dinámicamente según lo que indique el usuario
    const rolNombre = tipoUsuario === 'comerciante' ? 'comerciante' : 'cliente';
    const rolAsignar = await Rol.findOne({ nombre: rolNombre });
    const roles = rolAsignar ? [rolAsignar._id] : [];

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
        fotoPerfil: null,
        telefono: null,
        roles: [rolNombre],
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
        fotoPerfil: usuario.fotoPerfil,
        telefono: usuario.telefono,
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
    const { nombre, email, password, fotoPerfil, telefono } = req.body;
    const usuario = await Usuario.findById(req.usuario._id);

    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    if (nombre) usuario.nombre = nombre;
    if (email) usuario.email = email;
    if (fotoPerfil !== undefined) usuario.fotoPerfil = fotoPerfil;
    if (telefono !== undefined) usuario.telefono = telefono;
    
    if (password) {
      const salt = await bcrypt.genSalt(10);
      usuario.password = await bcrypt.hash(password, salt);
    }

    const actualizado = await usuario.save();
    
    // Devolvemos el usuario con sus nuevos datos, similar a login
    res.json({
      _id: actualizado._id,
      nombre: actualizado.nombre,
      email: actualizado.email,
      fotoPerfil: actualizado.fotoPerfil,
      telefono: actualizado.telefono,
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

    // Fix 3: El token NO se devuelve en la respuesta HTTP.
    // En producción, enviar vía SendGrid / Resend / Nodemailer al email del usuario.
    // Para entornos de desarrollo, ver el log del servidor.
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEV] Token de reseteo para ${email}: ${resetToken}`);
    }

    res.json({
      message: 'Instrucciones enviadas al correo electrónico registrado.'
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

// Acceso rápido sin fricción para vecinos/clientes en consultas directas
const registroRapido = async (req, res) => {
  try {
    const { nombre, contacto } = req.body;

    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ error: 'Por favor indica tu nombre' });
    }

    const cleanNombre = nombre.trim();
    let email = '';
    
    if (contacto && contacto.includes('@')) {
      email = contacto.trim().toLowerCase();
    } else if (contacto && contacto.trim()) {
      const safeTel = contacto.replace(/[^0-9a-zA-Z]/g, '');
      email = `${safeTel || Date.now()}@vecino.bahia.gob.ar`;
    } else {
      email = `vecino_${Date.now()}_${Math.floor(Math.random() * 1000)}@vecino.bahia.gob.ar`;
    }

    let usuarioExistente = await Usuario.findOne({ email }).populate('roles');

    // Fix 10: rastrear si el usuario fue creado o ya existía
    let esNuevo = false;
    let usuario;

    if (!usuarioExistente) {
      esNuevo = true;
      const randomPassword = crypto.randomBytes(16).toString('hex');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(randomPassword, salt);

      const rolCliente = await Rol.findOne({ nombre: 'cliente' });
      const roles = rolCliente ? [rolCliente._id] : [];

      const creado = await Usuario.create({
        nombre: cleanNombre,
        email,
        password: hashedPassword,
        roles
      });
      usuario = await Usuario.findById(creado._id).populate('roles');
    } else {
      usuario = usuarioExistente;
    }

    res.status(200).json({
      _id: usuario._id,
      nombre: usuario.nombre,
      email: usuario.email,
      roles: usuario.roles && usuario.roles.length > 0 ? usuario.roles.map(r => r.nombre || 'cliente') : ['cliente'],
      token: generarToken(usuario._id),
      esNuevo
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  registrarUsuario,
  loginUsuario,
  getPerfil,
  actualizarPerfil,
  solicitarRecuperacionPassword,
  resetearPassword,
  registroRapido
};
