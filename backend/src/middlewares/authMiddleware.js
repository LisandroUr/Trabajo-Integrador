const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

const protegerRuta = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Buscar usuario y excluir password
      req.usuario = await Usuario.findById(decoded.id).select('-password').populate('roles');
      
      if (!req.usuario || !req.usuario.activo) {
        return res.status(401).json({ error: 'Usuario no encontrado o inactivo' });
      }

      next();
    } catch (error) {
      return res.status(401).json({ error: 'No autorizado, token inválido o expirado' });
    }
  }

  if (!token) {
    return res.status(401).json({ error: 'No autorizado, no se proporcionó token' });
  }
};

const requierePermiso = (permisoRequerido) => {
  return (req, res, next) => {
    if (!req.usuario || !req.usuario.roles) {
      return res.status(403).json({ error: 'No autorizado - Sin roles asignados' });
    }

    const tienePermiso = req.usuario.roles.some(rol => 
      rol.permisos && rol.permisos.includes(permisoRequerido)
    );

    if (!tienePermiso) {
      return res.status(403).json({ error: `Permiso denegado: se requiere el permiso '${permisoRequerido}'` });
    }

    next();
  };
};

module.exports = { protegerRuta, requierePermiso };
