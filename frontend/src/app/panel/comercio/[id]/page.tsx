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
  TrendingUp,
  Tag,
  CheckCircle2,
  PauseCircle,
  ExternalLink,
  ShieldCheck,
  Filter
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';

interface Producto {
  _id: string;
  nombre: string;
  precio: number;
  descripcion: string;
  disponible: boolean;
  categoria?: any;
}

interface Comercio {
  _id: string;
  nombre: string;
  estado: string;
  direccion?: string;
}

export default function GestionCatalogoPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const comercioId = resolvedParams.id;

  const [comercio, setComercio] = useState<Comercio | null>(null);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filtroStock, setFiltroStock] = useState<'todos' | 'disponibles' | 'agotados'>('todos');

  // Form New Product
  const [showModal, setShowModal] = useState(false);
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoria, setCategoria] = useState('Alimentos y Bebidas');
  const [guardando, setGuardando] = useState(false);

  const router = require('next/navigation').useRouter();

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
    const userStored = localStorage.getItem('user');
    if (!userStored) {
      router.replace('/login');
      return;
    }
    try {
      const user = JSON.parse(userStored);
      if (!user.roles?.includes('comerciante')) {
        toast.error('Acceso denegado: Solo comerciantes');
        router.replace('/');
        return;
      }
    } catch {
      router.replace('/login');
      return;
    }
    loadData();
  }, [comercioId, router]);

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
          categoria: categoria.trim() || 'Alimentos y Bebidas',
          disponible: true
        })
      });

      try {
        confetti({
          particleCount: 60,
          spread: 50,
          origin: { y: 0.6 }
        });
      } catch {}

      toast.success(`Artículo "${nombre}" publicado en el catálogo e integrado al ranking`);
      setShowModal(false);
      setNombre('');
      setPrecio('');
      setDescripcion('');
      setCategoria('Alimentos y Bebidas');
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
      toast.info(`Stock de "${prod.nombre}" conmutado a ${!prod.disponible ? 'Disponible' : 'Agotado'}`);
      loadData();
    } catch (err: any) {
      toast.error('Error actualizando disponibilidad: ' + err.message);
    }
  };

  const handleEliminarProducto = async (prodId: string, prodNombre: string) => {
    if (!confirm(`¿Confirmas que deseas eliminar "${prodNombre}" de tu catálogo?`)) return;

    try {
      await fetchAPI(`/productos/${prodId}`, {
        method: 'DELETE'
      });
      toast.success(`Artículo "${prodNombre}" eliminado del catálogo`);
      loadData();
    } catch (err: any) {
      toast.error('Error al eliminar: ' + err.message);
    }
  };

  // KPIs
  const totalArticulos = productos.length;
  const disponibles = productos.filter(p => p.disponible).length;
  const agotados = productos.filter(p => !p.disponible).length;
  const precioPromedio = totalArticulos > 0
    ? Math.round(productos.reduce((acc, curr) => acc + (curr.precio || 0), 0) / totalArticulos)
    : 0;

  const productosFiltrados = productos.filter((p) => {
    const catName = typeof p.categoria === 'object' && p.categoria ? p.categoria.nombre : (p.categoria || '');
    const matchQuery = (p.nombre || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(catName).toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchQuery) return false;
    if (filtroStock === 'disponibles') return p.disponible;
    if (filtroStock === 'agotados') return !p.disponible;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Top Breadcrumbs */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          href="/panel"
          className="inline-flex items-center space-x-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Volver a Mis Vidrieras</span>
        </Link>
        <div className="flex items-center space-x-2">
          <span className="text-xs font-medium text-[#9eb1cb]">Área Comercial:</span>
          <span className="text-xs font-bold text-slate-900">Gestión de Catálogo & Precios</span>
        </div>
      </div>

      {/* Header Banner */}
      <div className="rounded-2xl bg-[#161a22] border border-slate-300 p-6 sm:p-8 mb-8 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#182630] border border-[#294354] text-[#9bc5cc] text-xs font-bold">
                <Store className="w-3.5 h-3.5 text-[#7dafb5]" />
                <span>{comercio?.nombre || 'Comercio Registrado'}</span>
              </span>

              {comercio?.estado === 'aprobado' && (
                <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#192b22] border border-[#2b4c39] text-[#93cca5] text-xs font-bold">
                  <CheckCircle2 className="w-3 h-3 text-[#4a7c59]" />
                  <span>Vidriera Habilitada</span>
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Catálogo de Precios
            </h1>
            
            <p className="text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
              Los precios cargados impactan automáticamente en el <strong className="text-slate-900 font-bold">Observatorio de Precios</strong> de tu ciudad para defender la economía de los vecinos.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start lg:self-center">
            {comercio && (
              <Link
                href={`/comercio/${comercioId}`}
                className="px-4 py-2.5 rounded-xl bg-[#1d232e] hover:bg-[#252c3a] text-slate-600 hover:text-slate-900 border border-[#343e50] text-xs font-bold transition-all flex items-center space-x-2 shadow-xs"
              >
                <ExternalLink className="w-4 h-4 text-[#7dafb5]" />
                <span>Ver Vidriera Pública</span>
              </Link>
            )}

            <button
              onClick={() => setShowModal(true)}
              className="px-5 py-2.5 rounded-xl bg-[#4568b4] hover:bg-[#395697] text-slate-900 font-bold text-xs transition-all flex items-center space-x-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Publicar Nuevo Producto</span>
            </button>
          </div>
        </div>
      </div>

      {/* Catalog KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
        <div className="p-5 rounded-2xl bg-[#161a22] border border-slate-300 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-[#9eb1cb]">Total Artículos</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 tabular-nums">{totalArticulos}</p>
          <p className="text-xs text-slate-600 mt-1">Cargados en inventario</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#161a22] border border-slate-300 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-[#93cca5]">En Stock Activo</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#93cca5] mt-2 tabular-nums">{disponibles}</p>
          <p className="text-xs text-slate-600 mt-1">Visibles en ranking</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#161a22] border border-slate-300 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-[#e094a2]">Stock Pausado</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#e094a2] mt-2 tabular-nums">{agotados}</p>
          <p className="text-xs text-slate-600 mt-1">Agotados temporalmente</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#161a22] border border-slate-300 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-[#9bc5cc]">Precio Promedio</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#9bc5cc] mt-2 tabular-nums">
            ${precioPromedio.toLocaleString('es-AR')}
          </p>
          <p className="text-xs text-slate-600 mt-1">Media de tu catálogo</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#161a22] border border-slate-300 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7d8799]" />
          <input
            type="text"
            placeholder="Filtrar por nombre de artículo o rubro..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#13161d] border border-[#343e50] rounded-xl text-xs text-slate-900 placeholder-[#7d8799] focus:outline-none focus:border-[#4568b4]"
          />
        </div>

        <div className="flex items-center space-x-2 self-start md:self-auto">
          <div className="inline-flex rounded-xl bg-[#13161d] p-1 border border-[#343e50] text-xs font-semibold">
            <button
              onClick={() => setFiltroStock('todos')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filtroStock === 'todos'
                  ? 'bg-[#4568b4] text-slate-900'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos ({totalArticulos})
            </button>
            <button
              onClick={() => setFiltroStock('disponibles')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filtroStock === 'disponibles'
                  ? 'bg-[#192b22] text-[#93cca5] border border-[#2b4c39]'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              En Stock ({disponibles})
            </button>
            <button
              onClick={() => setFiltroStock('agotados')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filtroStock === 'agotados'
                  ? 'bg-[#2d1b22] text-[#e094a2] border border-[#522934]'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Agotados ({agotados})
            </button>
          </div>
        </div>
      </div>

      {/* Catalog Table (Clean, Ultra High Contrast) */}
      <div className="bg-[#161a22] rounded-2xl shadow-sm border border-slate-300 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#2b3342]">
            <thead className="bg-[#1d232e] text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 text-left">Artículo / Denominación</th>
                <th className="px-6 py-4 text-left">Rubro / Categoría</th>
                <th className="px-6 py-4 text-left">Precio Unitario</th>
                <th className="px-6 py-4 text-center">Estado de Stock</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2b3342] text-xs">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-600">
                    <div className="w-7 h-7 border-2 border-[#4568b4] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="font-semibold text-slate-900">Cargando catálogo...</p>
                  </td>
                </tr>
              ) : productosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-600">
                    <Package className="w-8 h-8 text-[#7d8799] mx-auto mb-2" />
                    <p className="font-bold text-sm text-slate-900">No hay artículos que coincidan con la búsqueda</p>
                    <p className="text-xs text-slate-600 mt-1">Crea tu primer producto para comenzar a participar del observatorio.</p>
                  </td>
                </tr>
              ) : (
                productosFiltrados.map((prod) => (
                  <tr key={prod._id} className="hover:bg-[#1d232e]/70 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 text-sm">{prod.nombre}</div>
                      <div className="text-xs text-slate-600 mt-0.5 truncate max-w-sm">
                        {prod.descripcion || 'Sin descripción adicional.'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 bg-[#182630] border border-[#294354] rounded-lg text-[#9bc5cc] font-semibold text-[11px]">
                        {typeof prod.categoria === 'object' && prod.categoria ? prod.categoria.nombre : (prod.categoria || 'General')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-[#93cca5] font-extrabold text-base tabular-nums">
                        ${prod.precio.toLocaleString('es-AR')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleToggleStock(prod)}
                        title="Haz clic para alternar disponibilidad"
                        className={`px-3 py-1.5 rounded-full text-xs font-bold inline-flex items-center space-x-1.5 transition-all cursor-pointer shadow-xs ${
                          prod.disponible
                            ? 'bg-[#192b22] hover:bg-[#20362b] text-[#93cca5] border border-[#2b4c39]'
                            : 'bg-[#2d1b22] hover:bg-[#38222a] text-[#e094a2] border border-[#522934]'
                        }`}
                      >
                        {prod.disponible ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#4a7c59]" />
                            <span>En Stock</span>
                          </>
                        ) : (
                          <>
                            <PauseCircle className="w-3.5 h-3.5 text-[#8b3a4a]" />
                            <span>Sin Stock</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleEliminarProducto(prod._id, prod.nombre)}
                        className="p-2 text-slate-600 hover:text-[#e094a2] hover:bg-[#2d1b22] rounded-lg transition-colors"
                        title="Eliminar artículo del catálogo"
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
        <div className="fixed inset-0 bg-[#0c0e12]/85 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#161a22] border border-slate-300 rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 text-slate-600 hover:text-slate-900 p-1.5 rounded-lg hover:bg-[#1d232e] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#182630] border border-[#294354] text-[#9bc5cc] text-[11px] font-semibold mb-2">
                <Tag className="w-3 h-3 text-[#7dafb5]" />
                <span>Observatorio Municipal</span>
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">Publicar Nuevo Artículo</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                El precio ingresado se reflejará de inmediato en la canasta comparativa y ranking vecinal.
              </p>
            </div>

            <form onSubmit={handleCrearProducto} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1.5">Nombre del Producto *</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Leche Entera Clásica 1L"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full p-3 bg-[#13161d] border border-[#343e50] rounded-xl text-xs text-slate-900 placeholder-[#7d8799] focus:outline-none focus:border-[#4568b4]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1.5">Precio Unitario ($ ARS) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="1200"
                    value={precio}
                    onChange={(e) => setPrecio(e.target.value)}
                    className="w-full p-3 bg-[#13161d] border border-[#343e50] rounded-xl text-xs text-slate-900 placeholder-[#7d8799] focus:outline-none focus:border-[#4568b4] font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1.5">Rubro / Categoría</label>
                  <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    className="w-full p-3 bg-[#13161d] border border-[#343e50] rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#4568b4]"
                  >
                    <option value="Alimentos y Bebidas">Alimentos y Bebidas</option>
                    <option value="Supermercado y Almacén">Supermercado y Almacén</option>
                    <option value="Farmacia y Salud">Farmacia y Salud</option>
                    <option value="Ferretería y Hogar">Ferretería y Hogar</option>
                    <option value="Indumentaria y Calzado">Indumentaria y Calzado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1.5">Descripción / Presentación</label>
                <textarea
                  rows={2}
                  placeholder="Detalles de marca, peso neto o condición de venta..."
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="w-full p-3 bg-[#13161d] border border-[#343e50] rounded-xl text-xs text-slate-900 placeholder-[#7d8799] focus:outline-none focus:border-[#4568b4] resize-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-300">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando || !nombre.trim() || !precio}
                  className="px-5 py-2.5 rounded-xl bg-[#4568b4] hover:bg-[#395697] text-slate-900 font-bold text-xs transition-colors disabled:opacity-50 shadow-sm"
                >
                  {guardando ? 'Publicando...' : 'Publicar en Catálogo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
