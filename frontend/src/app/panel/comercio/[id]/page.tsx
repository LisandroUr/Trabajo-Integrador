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
  AlertCircle
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
          particleCount: 60,
          spread: 50,
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

  const productosFiltrados = productos.filter((p) => {
    const catName = typeof p.categoria === 'object' && p.categoria ? p.categoria.nombre : (p.categoria || '');
    return (
      (p.nombre || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(catName).toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/panel"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-[#8d94a1] hover:text-[#d5d9e0] transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Volver al Panel Principal</span>
        </Link>
        <span className="text-xs text-[#8d94a1]">Gestión de Catálogo & Precios</span>
      </div>

      {/* Header Banner */}
      <div className="rounded-2xl bg-[#171b22] border border-[#262d3a] p-8 sm:p-10 mb-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full badge-steel text-xs font-semibold tracking-wider mb-3">
              <Store className="w-3.5 h-3.5" />
              <span>{comercio?.nombre || 'Comercio'}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#d5d9e0] tracking-tight">
              Catálogo de Precios
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-[#8d94a1]">
              Los precios cargados impactan automáticamente en el Observatorio Municipal de Precios y ranking de canastas barriales.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 rounded-xl bg-[#4b6cb7] hover:bg-[#3d5a99] text-[#d5d9e0] font-semibold text-xs transition-colors flex items-center space-x-2 self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Producto</span>
          </button>
        </div>
      </div>

      {/* Search Filter */}
      <div className="p-4 rounded-xl bg-[#171b22] border border-[#262d3a] shadow-xs mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8d94a1]" />
          <input
            type="text"
            placeholder="Filtrar por nombre o rubro..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#12151b] border border-[#262d3a] rounded-xl text-xs text-[#d5d9e0] placeholder:text-[#8d94a1]/50 focus:outline-none focus:border-[#4b6cb7]"
          />
        </div>
        <span className="text-xs text-[#8d94a1] font-semibold">
          {productos.length} artículos en catálogo
        </span>
      </div>

      {/* Catalog Table */}
      <div className="bg-[#171b22] rounded-2xl shadow-xs border border-[#262d3a] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#262d3a]">
            <thead className="bg-[#12151b] text-[11px] font-bold text-[#8d94a1] uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 text-left">Artículo / Producto</th>
                <th className="px-6 py-4 text-left">Categoría</th>
                <th className="px-6 py-4 text-left">Precio Unitario</th>
                <th className="px-6 py-4 text-center">Disponibilidad</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262d3a] text-xs">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[#8d94a1]">
                    Cargando catálogo...
                  </td>
                </tr>
              ) : productosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[#8d94a1]">
                    No hay productos cargados en este comercio aún.
                  </td>
                </tr>
              ) : (
                productosFiltrados.map((prod) => (
                  <tr key={prod._id} className="hover:bg-[#1d222b] transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-[#d5d9e0] text-sm">{prod.nombre}</div>
                      <div className="text-[11px] text-[#8d94a1] truncate max-w-xs">{prod.descripcion || 'Sin descripción'}</div>
                    </td>
                    <td className="px-6 py-4 text-[#8d94a1] whitespace-nowrap font-medium">
                      <span className="px-2.5 py-1 bg-[#1d222b] border border-[#262d3a] rounded-lg text-[#d5d9e0]">
                        {typeof prod.categoria === 'object' && prod.categoria ? prod.categoria.nombre : (prod.categoria || 'General')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#8bb59b] font-bold text-base tabular-nums whitespace-nowrap">
                      ${prod.precio.toLocaleString('es-AR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleToggleStock(prod)}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${
                          prod.disponible
                            ? 'badge-sage'
                            : 'badge-wine'
                        }`}
                      >
                        {prod.disponible ? 'Disponible' : 'Agotado'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleEliminarProducto(prod._id, prod.nombre)}
                        className="p-2 text-[#8d94a1] hover:text-[#d48a97] hover:bg-[#8b3a4a]/10 rounded-lg transition-colors"
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
        <div className="fixed inset-0 bg-[#0d0f14]/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#171b22] border border-[#262d3a] rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 text-[#8d94a1] hover:text-[#d5d9e0] p-1 rounded-lg hover:bg-[#1d222b]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-5">
              <h3 className="text-lg font-bold text-[#d5d9e0]">Nuevo Artículo en Catálogo</h3>
              <p className="text-xs text-[#8d94a1] mt-1">
                El precio ingresado se reflejará de inmediato en la canasta comparativa municipal.
              </p>
            </div>

            <form onSubmit={handleCrearProducto} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#8d94a1] mb-1">Nombre del Producto *</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Leche Entera 1L"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full p-2.5 bg-[#12151b] border border-[#262d3a] rounded-xl text-xs text-[#d5d9e0] placeholder:text-[#8d94a1]/50 focus:outline-none focus:border-[#4b6cb7]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#8d94a1] mb-1">Precio ($ ARS) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="1200"
                    value={precio}
                    onChange={(e) => setPrecio(e.target.value)}
                    className="w-full p-2.5 bg-[#12151b] border border-[#262d3a] rounded-xl text-xs text-[#d5d9e0] placeholder:text-[#8d94a1]/50 focus:outline-none focus:border-[#4b6cb7] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#8d94a1] mb-1">Rubro / Categoría</label>
                  <input
                    type="text"
                    placeholder="Lácteos, Panadería..."
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    className="w-full p-2.5 bg-[#12151b] border border-[#262d3a] rounded-xl text-xs text-[#d5d9e0] placeholder:text-[#8d94a1]/50 focus:outline-none focus:border-[#4b6cb7]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8d94a1] mb-1">Descripción / Presentación</label>
                <textarea
                  rows={2}
                  placeholder="Marca, peso neto o detalles..."
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="w-full p-2.5 bg-[#12151b] border border-[#262d3a] rounded-xl text-xs text-[#d5d9e0] placeholder:text-[#8d94a1]/50 focus:outline-none focus:border-[#4b6cb7] resize-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-medium text-[#8d94a1] hover:text-[#d5d9e0]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando || !nombre.trim() || !precio}
                  className="px-4 py-2 rounded-xl bg-[#4b6cb7] hover:bg-[#3d5a99] text-[#d5d9e0] font-semibold text-xs transition-colors disabled:opacity-50"
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
