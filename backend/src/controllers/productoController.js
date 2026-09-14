const Producto = require('../models/Producto');
const Comercio = require('../models/Comercio');

const getProductos = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const skip = parseInt(req.query.skip) || 0;
    const comercioId = req.query.comercioId;
    const q = req.query.q;
    const categoria = req.query.categoria;
    
    // Solo mostramos productos activos (disponibles y no eliminados)
    const query = { deletedAt: null, disponible: true };
    if (comercioId) query.comercioId = comercioId;
    if (categoria) query.categoria = categoria;
    if (q) {
      query.nombre = { $regex: q, $options: 'i' };
    }

    const productos = await Producto.find(query)
      .populate('categoria')
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
    const { q, categoria, orden = 'asc', minPrecio, maxPrecio } = req.query;
    const limit = parseInt(req.query.limit) || 50;

    const query = { deletedAt: null, disponible: true };

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

    // Buscar productos y popular la tienda
    const productosEncontrados = await Producto.find(query)
      .populate({
        path: 'comercioId',
        match: { estado: 'aprobado', deletedAt: null },
        select: 'nombre direccion ubicacion contacto calificacionPromedio vidriera'
      })
      .populate('categoria', 'nombre icono')
      .sort({ precio: sortOrder })
      .limit(limit);

    // Filtrar aquellos donde comercioId no coincida con el match (es decir, no esté aprobado o esté eliminado)
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
    const { comercioId } = req.body;
    
    // Verificar que el comercio exista
    const comercio = await Comercio.findById(comercioId);
    if (!comercio) return res.status(404).json({ error: 'Comercio no encontrado' });

    const nuevoProducto = await Producto.create(req.body);
    res.status(201).json(nuevoProducto);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const producto = await Producto.findByIdAndUpdate(id, req.body, { new: true });
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(producto);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteProducto = async (req, res) => {
  try {
    const { id } = req.params;
    // Soft Delete
    const producto = await Producto.findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true });
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
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
