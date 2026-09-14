const Comercio = require('../models/Comercio');
const PerfilComerciante = require('../models/PerfilComerciante');

const getComercios = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const skip = parseInt(req.query.skip) || 0;
    const { q, categoria } = req.query;
    
    // Público: Solo ver comercios aprobados y no eliminados lógicamente
    const query = { deletedAt: null, estado: 'aprobado' };

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
    const { lat, lng, maxDistancia = 20000, categoria } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitud (lat) y Longitud (lng) son requeridas' });
    }

    const query = {
      estado: 'aprobado',
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
    const comercio = await Comercio.findOne({ _id: req.params.id, deletedAt: null }).populate('categorias');
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
    // Filtrar los que no están eliminados lógicamente
    const comercios = perfil.comerciosIds.filter(c => c && c.deletedAt === null);
    res.json(comercios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createComercio = async (req, res) => {
  try {
    const nuevoComercio = new Comercio({
      ...req.body,
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
    const comercio = await Comercio.findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true });
    if (!comercio) return res.status(404).json({ error: 'Comercio no encontrado' });
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

module.exports = {
  getComercios,
  getComerciosCercanos,
  getComerciosAdmin,
  getMisComercios,
  getComercioById,
  createComercio,
  cambiarEstadoComercio,
  deleteComercio
};
