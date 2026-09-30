const mongoose = require('mongoose');
const Producto = require('../models/Producto');


const getProductos = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const skip = parseInt(req.query.skip) || 0;
    const comercioId = req.query.comercioId;
    const q = req.query.q;
    const categoria = req.query.categoria;
    const tipo = req.query.tipo;
    
    // Solo mostramos productos activos (disponibles y no eliminados)
    const query = { deletedAt: null, disponible: true };
    if (comercioId) {
      if (mongoose.Types.ObjectId.isValid(comercioId)) {
        query.comercioId = comercioId;
      } else {
        const words = comercioId.split('-').filter(w => w.toLowerCase() !== 'tienda' && w.trim().length > 0);
        const searchRegex = new RegExp(words.join('.*'), 'i');
        const foundCom = await Comercio.findOne({ nombre: searchRegex });
        if (foundCom) {
          query.comercioId = foundCom._id;
        }
      }
    }
    if (categoria) query.categoria = categoria;
    if (tipo) query.tipo = tipo;
    if (q && q.trim()) {
      query.$or = [
        { nombre: { $regex: q.trim(), $options: 'i' } },
        { descripcion: { $regex: q.trim(), $options: 'i' } }
      ];
    }

    const productos = await Producto.find(query)
      .populate('categoria')
      .populate({
        path: 'comercioId',
        match: { estado: { $in: ['aprobado', 'pendiente'] }, deletedAt: null },
        select: 'nombre direccion ubicacion contacto calificacionPromedio vidriera estado tipo'
      })
      .skip(skip)
      .limit(limit);
      
    const total = await Producto.countDocuments(query);
    
    res.json({ total, limit, skip, data: productos });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Endpoint central para TFI: Comparador y Ranking de Precios
const getRankingPrecios = async (req, res) => {
  try {
    const { q, categoria, orden = 'asc', minPrecio, maxPrecio, tipo } = req.query;
    const limit = parseInt(req.query.limit) || 50;

    const query = { deletedAt: null, disponible: true };

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
      query.categoria = categoria;
    }

    if (minPrecio || maxPrecio) {
      query.precio = {};
      if (minPrecio) query.precio.$gte = parseFloat(minPrecio);
      if (maxPrecio) query.precio.$lte = parseFloat(maxPrecio);
    }

    const sortOrder = orden === 'desc' ? -1 : 1;

    // Buscar productos y popular la tienda (aprobada o pendiente, no rechazada)
    const productosEncontrados = await Producto.find(query)
      .populate({
        path: 'comercioId',
        match: { estado: { $in: ['aprobado', 'pendiente'] }, deletedAt: null },
        select: 'nombre direccion ubicacion contacto calificacionPromedio vidriera estado tipo'
      })
      .populate('categoria', 'nombre icono')
      .sort({ precio: sortOrder })
      .limit(limit);

    // Filtrar aquellos donde comercioId no coincida con el match (es decir, esté rechazado o eliminado)
    const productosValidos = productosEncontrados.filter(p => p.comercioId !== null);

    // Calcular estadísticas del ranking comparativo
    let estadisticas = {
      totalOfertas: productosValidos.length,
      precioMinimo: 0,
      precioMaximo: 0,
      precioPromedio: 0,
      ahorroMaximo: 0,
      porcentajeAhorro: 0
    };

    if (productosValidos.length > 0) {
      const precios = productosValidos.map(p => p.precio);
      const min = Math.min(...precios);
      const max = Math.max(...precios);
      const suma = precios.reduce((acc, curr) => acc + curr, 0);
      const promedio = Number((suma / precios.length).toFixed(2));
      const ahorro = Number((max - min).toFixed(2));
      const porcentaje = max > 0 ? Number(((ahorro / max) * 100).toFixed(1)) : 0;

      estadisticas = {
        totalOfertas: productosValidos.length,
        precioMinimo: min,
        precioMaximo: max,
        precioPromedio: promedio,
        ahorroMaximo: ahorro,
        porcentajeAhorro: porcentaje
      };
    }

    res.json({
      criterioBusqueda: q || '',
      estadisticas,
      productos: productosValidos
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createProducto = async (req, res) => {
  try {
    const { comercioId, categoria } = req.body;
    
    // Verificar que el comercio exista
    const comercio = await Comercio.findById(comercioId);
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
      return res.status(403).json({ error: 'No tienes permisos para agregar productos a este comercio' });
    }

    if (categoria) {
      const isHexObjectId = typeof categoria === 'string' && /^[0-9a-fA-F]{24}$/.test(categoria);
      
      let catId = null;
      if (isHexObjectId) {
        const catExistente = await Categoria.findById(categoria);
        if (catExistente) catId = catExistente._id;
      }
      
      if (!catId && typeof categoria === 'string' && categoria.trim()) {
        const catNombre = categoria.trim();
        let cat = await Categoria.findOne({ nombre: new RegExp(`^${catNombre}$`, 'i') });
        if (!cat) {
          cat = await Categoria.create({ nombre: catNombre });
        }
        catId = cat._id;
      }

      if (catId) {
        req.body.categoria = catId;
      } else {
        delete req.body.categoria;
      }
    }

    const nuevoProducto = await Producto.create(req.body);
    res.status(201).json(nuevoProducto);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { categoria } = req.body;

    if (categoria) {
      const isHexObjectId = typeof categoria === 'string' && /^[0-9a-fA-F]{24}$/.test(categoria);
      
      let catId = null;
      if (isHexObjectId) {
        const catExistente = await Categoria.findById(categoria);
        if (catExistente) catId = catExistente._id;
      }
      
      if (!catId && typeof categoria === 'string' && categoria.trim()) {
        const catNombre = categoria.trim();
        let cat = await Categoria.findOne({ nombre: new RegExp(`^${catNombre}$`, 'i') });
        if (!cat) {
          cat = await Categoria.create({ nombre: catNombre });
        }
        catId = cat._id;
      }

      if (catId) {
        req.body.categoria = catId;
      } else {
        delete req.body.categoria;
      }
    }

    const producto = await Producto.findById(id);
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });

    const comercio = await Comercio.findById(producto.comercioId);

    // Fix 11: si no existe el comercio, denegar acceso en lugar de saltear la verificación
    if (!comercio) {
      return res.status(403).json({ error: 'No tienes permisos para actualizar este producto (comercio no encontrado)' });
    }

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
      return res.status(403).json({ error: 'No tienes permisos para actualizar este producto' });
    }

    const productoActualizado = await Producto.findByIdAndUpdate(id, req.body, { new: true });
    res.json(productoActualizado);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const producto = await Producto.findById(id);
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });

    const comercio = await Comercio.findById(producto.comercioId);

    // Fix 11: si no existe el comercio, denegar acceso en lugar de saltear la verificación
    if (!comercio) {
      return res.status(403).json({ error: 'No tienes permisos para eliminar este producto (comercio no encontrado)' });
    }

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
      return res.status(403).json({ error: 'No tienes permisos para eliminar este producto' });
    }

    producto.deletedAt = new Date();
    await producto.save();
    res.json({ message: 'Producto eliminado (borrado lógico)', id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getProductos,
  getRankingPrecios,
  createProducto,
  updateProducto,
  deleteProducto
};
