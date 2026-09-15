'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { fetchAPI } from '@/lib/api';
import Link from 'next/link';
import { 
  ChevronLeft, 
  Plus, 
  Trash2, 
  ExternalLink, 
  Package, 
  Check, 
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface Producto {
  _id: string;
  nombre: string;
  precio: number;
  descripcion: string;
  disponible: boolean;
}

export default function GestionComercioPage() {
  const params = useParams();
  const id = params?.id as string;

  const [productos, setProductos] = useState<Producto[]>([]);
  const [comercioNombre, setComercioNombre] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [nuevoProd, setNuevoProd] = useState({ nombre: '', precio: '', descripcion: '' });
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!id) return;
    try {
      const [comercioRes, productosRes] = await Promise.all([
        fetchAPI(`/comercios/${id}`),
        fetchAPI(`/productos?comercioId=${id}&limit=100`)
      ]);
      setComercioNombre(comercioRes.nombre);
      setProductos(productosRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchAPI('/productos', {
        method: 'POST',
        body: JSON.stringify({
          ...nuevoProd,
          precio: Number(nuevoProd.precio),
          comercioId: id,
          disponible: true
        })
      });
      setShowForm(false);
      setNuevoProd({ nombre: '', precio: '', descripcion: '' });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Error al crear producto');
    }
  };

  const handleDelete = async (prodId: string) => {
    if (!confirm('¿Confirmas la eliminación de este artículo del catálogo?')) return;
    try {
      await fetchAPI(`/productos/${prodId}`, { method: 'DELETE' });
      loadData();
    } catch (err) {
      alert('Error al eliminar producto');
    }
  };

  const toggleDisponibilidad = async (prod: Producto) => {
    try {
      await fetchAPI(`/productos/${prod._id}`, {
        method: 'PUT',
        body: JSON.stringify({ disponible: !prod.disponible })
      });
      loadData();
    } catch (err) {
      alert('Error actualizando disponibilidad');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <Link 
          href="/panel" 
          className="text-slate-600 hover:text-slate-900 font-semibold text-xs flex items-center space-x-1"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Volver a Mis Vidrieras</span>
        </Link>

        <Link
          href={`/comercio/${id}`}
          target="_blank"
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center space-x-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs transition-colors"
        >
          <span>Ver vidriera pública</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Catálogo: {comercioNombre || 'Cargando...'}
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-normal">
            Gestiona los productos y precios oficiales que se indexarán en el Ranking Municipal.
          </p>
        </div>

        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl font-semibold text-xs shadow-xs transition-colors flex items-center space-x-1.5 self-start sm:self-auto"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{showForm ? 'Cerrar Formulario' : 'Nuevo Producto'}</span>
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white p-6 rounded-2xl shadow-xs mb-8 border border-slate-300">
          <div className="mb-4 pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Agregar Artículo al Catálogo</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Nombre del Producto *</label>
              <input 
                required 
                type="text" 
                placeholder="Ej. Leche Entera 1L, Harina 000 1kg..."
                className="w-full p-2.5 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900" 
                value={nuevoProd.nombre} 
                onChange={e => setNuevoProd({...nuevoProd, nombre: e.target.value})} 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Precio de Venta ($) *</label>
              <input 
                required 
                type="number" 
                step="0.01" 
                placeholder="Ej. 1250.00"
                className="w-full p-2.5 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900" 
                value={nuevoProd.precio} 
                onChange={e => setNuevoProd({...nuevoProd, precio: e.target.value})} 
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Especificaciones o Marca</label>
              <textarea 
                rows={2}
                placeholder="Detalle contenido neto, marca o presentación..."
                className="w-full p-2.5 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900" 
                value={nuevoProd.descripcion} 
                onChange={e => setNuevoProd({...nuevoProd, descripcion: e.target.value})} 
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-xl font-semibold text-xs shadow-xs transition-colors"
            >
              Guardar en Catálogo
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            {productos.length} {productos.length === 1 ? 'artículo en catálogo' : 'artículos en catálogo'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50/60 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5 text-left">Artículo</th>
                <th className="px-6 py-3.5 text-left">Precio Unitario</th>
                <th className="px-6 py-3.5 text-left">Disponibilidad</th>
                <th className="px-6 py-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80 text-xs">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400 font-normal">Cargando inventario...</td></tr>
              ) : productos.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-normal">
                    <Package className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    No posees artículos cargados en esta vidriera.
                  </td>
                </tr>
              ) : productos.map(p => (
                <tr key={p._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{p.nombre}</div>
                    <div className="text-slate-500 text-[11px] font-normal">{p.descripcion || 'Sin descripción'}</div>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900 font-mono tabular-nums text-sm">
                    ${p.precio.toLocaleString('es-AR')}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleDisponibilidad(p)}
                      className={`inline-flex items-center space-x-1 px-2.5 py-1 text-[11px] font-semibold rounded-full border transition-colors ${
                        p.disponible 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                          : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                      }`}
                      title="Haz clic para alternar estado de stock"
                    >
                      {p.disponible ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      <span>{p.disponible ? 'Disponible' : 'Sin Stock'}</span>
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleDelete(p._id)} 
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors inline-block"
                      title="Eliminar del catálogo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
