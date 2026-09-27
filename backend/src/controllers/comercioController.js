const mongoose = require('mongoose');
const Comercio = require('../models/Comercio');
const PerfilComerciante = require('../models/PerfilComerciante');
const Categoria = require('../models/Categoria');

async function procesarCategorias(categoriasRaw) {
  if (!categoriasRaw || !Array.isArray(categoriasRaw)) return [];
  const catIds = [];
  for (const cat of categoriasRaw) {
    if (mongoose.Types.ObjectId.isValid(cat)) {
      catIds.push(cat);
    } else if (typeof cat === 'string' && cat.trim() !== '') {
      let catDoc = await Categoria.findOne({ nombre: cat.trim() });
      if (!catDoc) {
        catDoc = await Categoria.create({ nombre: cat.trim() });
      }
      catIds.push(catDoc._id);
    }
  }
  return catIds;
}

const getComercios = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const skip = parseInt(req.query.skip) || 0;
    const { q, categoria, tipo } = req.query;
    
    // Público: Ver comercios activos (aprobados y pendientes, excluye rechazados/suspendidos/eliminados)
    // El frontend sabrá si está verificado con comercio.verificado (estado === 'aprobado')
    const query = { deletedAt: null, estado: { $in: ['aprobado', 'pendiente'] } };

    if (tipo) {
      query.tipo = tipo;
    }

    if (q && q.trim()) {
      query.$or = [
        { nombre: { $regex: q.trim(), $options: 'i' } },
        { descripcion: { $regex: q.trim(), $options: 'i' } }
      ];
    }

    if (categoria) {
      query.categorias = categoria;
    }

    const comercios = await Comercio.find(query)
      .populate('categorias')
      .skip(skip)
      .limit(limit);
      
    const total = await Comercio.countDocuments(query);
    
    res.json({
      total,
      limit,
      skip,
      data: comercios
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getComerciosCercanos = async (req, res) => {
  try {
    const { lat, lng, maxDistancia = 20000, categoria, tipo } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitud (lat) y Longitud (lng) son requeridas' });
    }

    const query = {
      estado: { $ne: 'rechazado' },
      deletedAt: null,
      ubicacion: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(maxDistancia)
        }
      }
    };

    if (tipo) {
      query.tipo = tipo;
    }

    if (categoria) {
      query.categorias = categoria;
    }

    const comercios = await Comercio.find(query).populate('categorias');
    res.json(comercios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getComercioById = async (req, res) => {
  try {
    let query = { deletedAt: null };
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      query._id = req.params.id;
    } else {
      const words = req.params.id.split('-').filter(w => w.toLowerCase() !== 'tienda' && w.trim().length > 0);
      const searchRegex = new RegExp(words.join('.*'), 'i');
      query.nombre = searchRegex;
    }

    const comercio = await Comercio.findOne(query).populate('categorias');
    if (!comercio) return res.status(404).json({ error: 'Comercio no encontrado' });
    res.json(comercio);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMisComercios = async (req, res) => {
  try {
    const perfil = await PerfilComerciante.findOne({ usuarioId: req.usuario._id }).populate('comerciosIds');
    if (!perfil) return res.json([]);
    // Fix 8: usar !c.deletedAt en lugar de === null para manejar undefined y Date correctamente
    const comercios = perfil.comerciosIds.filter(c => c && !c.deletedAt);
    res.json(comercios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createComercio = async (req, res) => {
  try {
    const payload = { ...req.body };
    if (payload.categorias) {
      payload.categorias = await procesarCategorias(payload.categorias);
    }
    
    const nuevoComercio = new Comercio({
      ...payload,
      propietarioId: req.usuario._id,
      estado: 'pendiente',
      historialEstados: [{
        nuevoEstado: 'pendiente',
        motivo: 'Alta inicial solicitada por el usuario'
      }]
    });
    
    const comercioGuardado = await nuevoComercio.save();

    // Buscar o crear PerfilComerciante
    let perfil = await PerfilComerciante.findOne({ usuarioId: req.usuario._id });
    if (!perfil) {
      perfil = new PerfilComerciante({
        usuarioId: req.usuario._id,
        cuit: req.body.cuit || '00-00000000-0',
        razonSocial: req.body.nombre
      });
    }
    perfil.comerciosIds.push(comercioGuardado._id);
    await perfil.save();

    res.status(201).json(comercioGuardado);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Caso de uso: Administrador aprueba/rechaza
const cambiarEstadoComercio = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, motivo } = req.body;
    
    const comercio = await Comercio.findById(id);
    if (!comercio) return res.status(404).json({ error: 'Comercio no encontrado' });
    
    const estadoAnterior = comercio.estado;
    comercio.estado = estado;
    comercio.historialEstados.push({
      estadoAnterior,
      nuevoEstado: estado,
      adminId: req.usuario._id, // Viene del middleware protegerRuta
      motivo: motivo || 'Actualización de estado administrativo'
    });
    
    await comercio.save();
    res.json(comercio);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Caso de uso: Comerciante elimina su vidriera (Soft Delete)
const deleteComercio = async (req, res) => {
  try {
    const { id } = req.params;
    const comercio = await Comercio.findById(id);
    if (!comercio) return res.status(404).json({ error: 'Comercio no encontrado' });

    // Verificar propiedad o rol admin
    let isOwner = comercio.propietarioId?.toString() === req.usuario._id.toString();
    
    if (!isOwner) {
      const perfil = await PerfilComerciante.findOne({ usuarioId: req.usuario._id });
      if (perfil && perfil.comerciosIds.some(cid => cid.toString() === comercio._id.toString())) {
        isOwner = true;
      }
    }

    // Fix 7: comparar r.nombre (no el objeto) para detectar roles admin
    const isAdmin = req.usuario.roles?.some(r => ['superadmin', 'admin', 'moderador'].includes(r.nombre));
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'No tienes permisos para eliminar este comercio' });
    }

    comercio.deletedAt = new Date();
    await comercio.save();

    res.json({ message: 'Comercio eliminado (borrado lógico)', id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getComerciosAdmin = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const skip = parseInt(req.query.skip) || 0;
    
    // Admin ve todos menos los eliminados lógicamente
    const query = { deletedAt: null };

    const comercios = await Comercio.find(query)
      .populate('categorias')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
      
    const total = await Comercio.countDocuments(query);
    
    res.json({
      total,
      limit,
      skip,
      data: comercios
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateComercio = async (req, res) => {
  try {
    const { id } = req.params;
    let query = { deletedAt: null };
    if (mongoose.Types.ObjectId.isValid(id)) {
      query._id = id;
    } else {
      const words = id.split('-').filter(w => w.toLowerCase() !== 'tienda' && w.trim().length > 0);
      const searchRegex = new RegExp(words.join('.*'), 'i');
      query.nombre = searchRegex;
    }

    const comercio = await Comercio.findOne(query);
    if (!comercio) return res.status(404).json({ error: 'Comercio no encontrado' });

    // Verificar propiedad o rol admin
    let isOwner = comercio.propietarioId?.toString() === req.usuario._id.toString();
    
    if (!isOwner) {
      const perfil = await PerfilComerciante.findOne({ usuarioId: req.usuario._id });
      if (perfil && perfil.comerciosIds.some(cid => cid.toString() === comercio._id.toString())) {
        isOwner = true;
        comercio.propietarioId = req.usuario._id; // auto-fix
      }
    }

    // Fix 7: comparar r.nombre (no el objeto) para detectar roles admin
    const isAdmin = req.usuario.roles?.some(r => ['superadmin', 'admin', 'moderador'].includes(r.nombre));
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'No tienes permisos para actualizar este comercio' });
    }

    if (req.body.nombre) comercio.nombre = req.body.nombre;
    if (req.body.descripcion) comercio.descripcion = req.body.descripcion;
    if (req.body.direccion) comercio.direccion = req.body.direccion;
    if (req.body.ubicacion) comercio.ubicacion = req.body.ubicacion;
    if (req.body.tipo) comercio.tipo = req.body.tipo;

    if (req.body.contacto) {
      comercio.contacto = {
        ...(comercio.contacto ? comercio.contacto.toObject() : {}),
        ...req.body.contacto
      };
    }

    if (req.body.vidriera) {
      comercio.vidriera = {
        ...(comercio.vidriera ? comercio.vidriera.toObject() : {}),
        ...req.body.vidriera
      };
    }

    if (req.body.categorias) {
      comercio.categorias = await procesarCategorias(req.body.categorias);
    }
    if (req.body.horarios) comercio.horarios = req.body.horarios;

    await comercio.save();
    res.json(comercio);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getComercios,
  getComerciosCercanos,
  getComerciosAdmin,
  getMisComercios,
  getComercioById,
  createComercio,
  updateComercio,
  cambiarEstadoComercio,
  deleteComercio
};
