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
    // req.usuario viene del middleware protegerRuta
    res.json(req.usuario);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  registrarUsuario,
  loginUsuario,
  getPerfil
};
