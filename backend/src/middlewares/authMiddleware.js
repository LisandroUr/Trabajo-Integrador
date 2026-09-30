const jwt = require('jsonwebtoken');

const protegerRuta = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      // Verificamos el token firmado por Django
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // En microservicios confiamos en el contenido del JWT (stateless)
      // SimpleJWT de Django usa 'user_id' por defecto
      req.usuario = {
        _id: decoded.user_id, // Mantenemos _id por retrocompatibilidad con controladores viejos
        id: decoded.user_id,
        ...decoded
      };
      
      return next();
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
    // Si Django no incluyó permisos en el JWT, esto fallará por seguridad.
    // Asumimos que el token trae un array 'permisos' o que lo adaptaremos luego en el API Gateway
    const permisos = req.usuario.permisos || [];

    if (!permisos.includes(permisoRequerido)) {
      return res.status(403).json({ error: `Permiso denegado: se requiere el permiso '${permisoRequerido}'` });
    }

    next();
  };
};

module.exports = { protegerRuta, requierePermiso };
