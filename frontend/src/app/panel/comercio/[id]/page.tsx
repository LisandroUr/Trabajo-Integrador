'use client';

import { useEffect, useState, use } from 'react';
import { fetchAPI } from '@/lib/api';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Package, 
  Store, 
  Search, 
  Check, 
  X, 
  AlertCircle,
  TrendingDown,
  DollarSign,
  Tag,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';

interface Producto {
  _id: string;
  nombre: string;
  precio: number;
  descripcion: string;
  disponible: boolean;
  categoria?: string;
}

interface Comercio {
  _id: string;
  nombre: string;
  estado: string;
}

export default function GestionCatalogoPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const comercioId = resolvedParams.id;

  const [comercio, setComercio] = useState<Comercio | null>(null);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Form New Product
  const [showModal, setShowModal] = useState(false);
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoria, setCategoria] = useState('');
  const [guardando, setGuardando] = useState(false);

  const loadData = async () => {
    try {
      const [comRes, prodRes] = await Promise.all([
        fetchAPI(`/comercios/${comercioId}`),
        fetchAPI(`/productos?comercioId=${comercioId}&limit=100`)
      ]);
      setComercio(comRes);
      setProductos(prodRes.data || []);
    } catch (err: any) {
      toast.error('Error cargando catálogo: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [comercioId]);

  const handleCrearProducto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !precio) return;

    setGuardando(true);
    try {
      await fetchAPI('/productos', {
        method: 'POST',
        body: JSON.stringify({
          comercioId,
          nombre: nombre.trim(),
          precio: parseFloat(precio),
          descripcion: descripcion.trim(),
          categoria: categoria.trim() || 'Alimento',
          disponible: true
        })
      });

      try {
        confetti({
          particleCount: 75,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch {}

      toast.success(`Producto "${nombre}" agregado al catálogo exitosamente`);
      setShowModal(false);
      setNombre('');
      setPrecio('');
      setDescripcion('');
      setCategoria('');
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Error al crear producto');
    } finally {
      setGuardando(false);
    }
  };

  const handleToggleStock = async (prod: Producto) => {
    try {
      await fetchAPI(`/productos/${prod._id}`, {
        method: 'PUT',
        body: JSON.stringify({ disponible: !prod.disponible })
      });
      toast.info(`Stock de "${prod.nombre}" actualizado a ${!prod.disponible ? 'Disponible' : 'Agotado'}`);
      loadData();
    } catch (err: any) {
      toast.error('Error actualizando disponibilidad: ' + err.message);
    }
  };

  const handleEliminarProducto = async (prodId: string, prodNombre: string) => {
    if (!confirm(`¿Eliminar "${prodNombre}" del catálogo?`)) return;

    try {
      await fetchAPI(`/productos/${prodId}`, {
        method: 'DELETE'
      });
      toast.success(`Producto "${prodNombre}" eliminado correctamente`);
      loadData();
    } catch (err: any) {
      toast.error('Error al eliminar: ' + err.message);
    }
  };

  const productosFiltrados = productos.filter((p) =>
    p.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.categoria || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/panel"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Volver al Panel Principal</span>
        </Link>
        <span className="text-xs text-slate-500">Gestión de Catálogo & Precios</span>
      </div>

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border border-white/10 p-8 sm:p-10 mb-8 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-3">
              <Store className="w-3.5 h-3.5 text-indigo-400" />
              <span>{comercio?.nombre || 'Comercio'}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Catálogo de Precios
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-300">
              Los precios cargados impactan automáticamente en el Observatorio Municipal de Precios.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center space-x-2 self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Producto</span>
          </button>
        </div>
      </div>

      {/* Search Filter */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 shadow-xl backdrop-blur-xl mb-6 flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Filtrar por nombre o rubro..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <span className="text-xs text-slate-400 font-bold">
          {productos.length} artículos en catálogo
        </span>
      </div>

      {/* Catalog Table */}
      <div className="bg-slate-900/80 rounded-3xl shadow-xl border border-white/10 overflow-hidden backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/5">
            <thead className="bg-slate-950/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 text-left">Artículo / Producto</th>
                <th className="px-6 py-4 text-left">Categoría</th>
                <th className="px-6 py-4 text-left">Precio Unitario</th>
                <th className="px-6 py-4 text-center">Disponibilidad</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    Cargando catálogo...
                  </td>
                </tr>
              ) : productosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    No hay productos cargados en este comercio aún.
                  </td>
                </tr>
              ) : (
                productosFiltrados.map((prod) => (
                  <tr key={prod._id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-white text-sm">{prod.nombre}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-xs">{prod.descripcion || 'Sin descripción'}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-300 whitespace-nowrap font-medium">
                      <span className="px-2.5 py-1 bg-white/5 border border-white/5 rounded-lg text-slate-300">
                        {prod.categoria || 'General'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-emerald-400 font-black text-base tabular-nums whitespace-nowrap">
                      ${prod.precio}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleToggleStock(prod)}
                        className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider transition-all ${
                          prod.disponible
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {prod.disponible ? 'Disponible' : 'Agotado'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleEliminarProducto(prod._id, prod.nombre)}
                        className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
                        title="Eliminar artículo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-white/15 rounded-3xl max-w-md w-full p-8 shadow-2xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white p-1 rounded-xl hover:bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <h3 className="text-xl font-black text-white">Nuevo Artículo en Catálogo</h3>
              <p className="text-xs text-slate-400 mt-1">
                El precio ingresado se reflejará de inmediato en la canasta comparativa municipal.
              </p>
            </div>

            <form onSubmit={handleCrearProducto} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Nombre del Producto *</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Leche Entera 1L"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Precio ($ ARS) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="1200"
                    value={precio}
                    onChange={(e) => setPrecio(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Rubro / Categoría</label>
                  <input
                    type="text"
                    placeholder="Lácteos, Panadería..."
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Descripción / Presentación</label>
                <textarea
                  rows={2}
                  placeholder="Marca, peso neto o detalles..."
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando || !nombre.trim() || !precio}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all"
                >
                  {guardando ? 'Guardando...' : 'Publicar Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
