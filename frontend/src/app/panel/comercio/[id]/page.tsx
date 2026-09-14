'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { fetchAPI } from '@/lib/api';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  ExternalLink, 
  Package, 
  DollarSign, 
  Tag, 
  Check, 
  X 
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
    if (!confirm('¿Seguro que deseas eliminar este producto del catálogo?')) return;
    try {
      await fetchAPI(`/productos/${prodId}`, { method: 'DELETE' });
      loadData();
    } catch (err) {
      alert('Error al eliminar');
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <Link 
          href="/panel" 
          className="text-indigo-600 hover:underline font-bold text-sm flex items-center space-x-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a Mis Vidrieras</span>
        </Link>

        <Link
          href={`/comercio/${id}`}
          target="_blank"
          className="text-xs font-bold text-gray-600 hover:text-blue-600 flex items-center space-x-1 bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-xs"
        >
          <span>Ver vidriera pública</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
            Catálogo: {comercioNombre || 'Cargando...'}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Administra los productos y precios que los vecinos verán en el Ranking Municipal.
          </p>
        </div>

        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-xs transition-colors flex items-center space-x-1.5 self-start sm:self-auto"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{showForm ? 'Cerrar Formulario' : '+ Nuevo Producto'}</span>
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white p-6 rounded-2xl shadow-xs mb-8 border border-indigo-100 ring-2 ring-indigo-50">
          <h3 className="text-base font-bold mb-4 text-gray-900">Publicar Nuevo Producto</h3>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Nombre del Producto *</label>
              <input 
                required 
                type="text" 
                placeholder="Ej. Leche Entera 1L, Pan Francés kg, etc."
                className="w-full p-2.5 border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-indigo-500" 
                value={nuevoProd.nombre} 
                onChange={e => setNuevoProd({...nuevoProd, nombre: e.target.value})} 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Precio Unitario ($) *</label>
              <input 
                required 
                type="number" 
                step="0.01" 
                placeholder="Ej. 1250.00"
                className="w-full p-2.5 border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-indigo-500" 
                value={nuevoProd.precio} 
                onChange={e => setNuevoProd({...nuevoProd, precio: e.target.value})} 
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">Descripción Breve o Especificaciones</label>
              <textarea 
                rows={2}
                placeholder="Detalla marca, presentación, contenido neto, etc."
                className="w-full p-2.5 border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-indigo-500" 
                value={nuevoProd.descripcion} 
                onChange={e => setNuevoProd({...nuevoProd, descripcion: e.target.value})} 
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-xl font-bold text-xs shadow-xs transition-colors"
            >
              Guardar en Catálogo
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-2xl shadow-xs border border-gray-200 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
          <span className="text-xs font-bold text-gray-700 uppercase">Productos Publicados ({productos.length})</span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50/50 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5 text-left">Producto</th>
                <th className="px-6 py-3.5 text-left">Precio</th>
                <th className="px-6 py-3.5 text-left">Disponibilidad</th>
                <th className="px-6 py-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">Cargando productos...</td></tr>
              ) : productos.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400 text-xs">
                    <Package className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    No tienes productos cargados en este comercio. ¡Agrega el primero arriba!
                  </td>
                </tr>
              ) : productos.map(p => (
                <tr key={p._id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{p.nombre}</div>
                    <div className="text-xs text-gray-500">{p.descripcion || 'Sin descripción'}</div>
                  </td>
                  <td className="px-6 py-4 font-black text-green-600 text-base">
                    ${p.precio.toLocaleString('es-AR')}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleDisponibilidad(p)}
                      className={`px-3 py-1 text-xs font-extrabold rounded-full transition-colors ${
                        p.disponible ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                      title="Haz clic para cambiar disponibilidad"
                    >
                      {p.disponible ? '✓ Disponible' : '✕ Agotado'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button 
                      onClick={() => handleDelete(p._id)} 
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-block"
                      title="Eliminar producto"
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
