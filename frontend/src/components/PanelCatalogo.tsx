'use client';

import { useState, useEffect, useRef } from 'react';
import { Package, Plus, Edit2, Trash2, Image as ImageIcon } from 'lucide-react';
import { fetchAPI } from '@/lib/api';
import { toast } from 'sonner';
import { subirImagen } from '@/lib/imageUtils';

export default function PanelCatalogo({ storeId }: { storeId: string }) {
  const [productos, setProductos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  // Edit state
  const [editId, setEditId] = useState<string | null>(null);
  
  // Form fields
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [tipo, setTipo] = useState('producto');
  const [categoria, setCategoria] = useState('');
  const [imagen, setImagen] = useState('');
  const [disponible, setDisponible] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (storeId) {
      loadProductos();
    }
  }, [storeId]);

  const loadProductos = async () => {
    if (!storeId) return;
    setLoading(true);
    try {
      const res = await fetchAPI(`/productos?comercioId=${storeId}&limit=100`);
      setProductos(res.data || res.productos || res || []);
    } catch (err: any) {
      toast.error('Error al cargar productos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (prod: any = null) => {
    if (prod) {
      setEditId(prod._id);
      setNombre(prod.nombre);
      setDescripcion(prod.descripcion || '');
      setPrecio(prod.precio.toString());
      setTipo(prod.tipo || 'producto');
      setCategoria(prod.categoria?.nombre || prod.categoria || '');
      setImagen(prod.imagen || '');
      setDisponible(prod.disponible ?? true);
    } else {
      setEditId(null);
      setNombre('');
      setDescripcion('');
      setPrecio('');
      setTipo('producto');
      setCategoria('');
      setImagen('');
      setDisponible(true);
    }
    setShowModal(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        toast.loading('Subiendo imagen...', { id: 'upload-producto' });
        // Fix 19: subir al backend → recibir URL → guardar URL (no base64)
        const url = await subirImagen(file);
        setImagen(url);
        toast.success('Imagen subida correctamente', { id: 'upload-producto' });
      } catch (err: any) {
        toast.error(err.message || 'Error al subir imagen', { id: 'upload-producto' });
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeId) return toast.error('Debe seleccionar un comercio primero');
    
    try {
      const payload = {
        comercioId: storeId,
        nombre,
        descripcion,
        precio: Number(precio),
        tipo,
        categoria,
        imagen,
        disponible
      };

      if (editId) {
        await fetchAPI(`/productos/${editId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        toast.success('Producto actualizado');
      } else {
        await fetchAPI('/productos', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        toast.success('Producto agregado');
      }
      
      setShowModal(false);
      loadProductos();
    } catch (err: any) {
      toast.error('Error al guardar: ' + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar este producto?')) return;
    try {
      await fetchAPI(`/productos/${id}`, { method: 'DELETE' });
      toast.success('Producto eliminado');
      loadProductos();
    } catch (err: any) {
      toast.error('Error al eliminar: ' + err.message);
    }
  };

  if (!storeId) {
    return (
      <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-xl border border-gray-200">
        Primero crea o selecciona una tienda para gestionar su catálogo.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-900 text-lg">Catálogo de Productos</h3>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#38bdf8] text-white text-sm font-bold rounded-xl shadow hover:bg-[#0ea5e9] transition-colors"
        >
          <Plus className="w-4 h-4" /> Agregar Producto
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-500">Cargando catálogo...</div>
      ) : productos.length === 0 ? (
        <div className="p-8 rounded-xl bg-gray-50 border border-gray-200 text-center">
          <Package className="w-10 h-10 text-gray-400 mx-auto mb-2" />
          <p className="text-sm font-bold text-gray-800">Tu catálogo está vacío</p>
          <p className="text-xs text-gray-500 mt-1">Hacé clic en "Agregar Producto" para publicar tu primer artículo.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {productos.map(p => (
            <div key={p._id} className="bg-white border border-gray-100 shadow-xs rounded-xl overflow-hidden flex flex-col">
              <div className="h-32 bg-gray-100 relative group">
                {p.imagen ? (
                  <img src={p.imagen} alt={p.nombre} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <ImageIcon className="w-8 h-8 opacity-50" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button onClick={() => handleOpenModal(p)} className="p-2 bg-white text-gray-900 rounded-full hover:bg-gray-100">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(p._id)} className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-3 flex flex-col flex-1">
                <div className="flex justify-between items-start gap-2">
                  <h4 className="font-bold text-gray-900 text-sm line-clamp-1">{p.nombre}</h4>
                  <span className="font-black text-[#38bdf8] text-sm">${p.precio}</span>
                </div>
                <span className="text-[10px] uppercase font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded w-fit mt-1">
                  {p.tipo}
                </span>
                <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">{p.descripcion || 'Sin descripción'}</p>
                <div className="mt-auto pt-3">
                  <span className={`text-xs font-semibold ${p.disponible ? 'text-emerald-600' : 'text-red-600'}`}>
                    {p.disponible ? '• Disponible' : '• Pausado'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-900">{editId ? 'Editar Producto' : 'Agregar Producto'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 font-bold px-2">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Nombre del Producto / Servicio *</label>
                <input required type="text" value={nombre} onChange={e => setNombre(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:border-[#38bdf8] focus:outline-none" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Precio ($) *</label>
                  <input required type="number" min="0" step="0.01" value={precio} onChange={e => setPrecio(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:border-[#38bdf8] focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Tipo</label>
                  <select value={tipo} onChange={e => setTipo(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:border-[#38bdf8] focus:outline-none">
                    <option value="producto">Producto (Físico)</option>
                    <option value="servicio">Servicio</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Categoría / Rubro</label>
                <input type="text" placeholder="Ej: Electrónica, Repostería..." value={categoria} onChange={e => setCategoria(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:border-[#38bdf8] focus:outline-none" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Descripción Corta</label>
                <textarea rows={2} value={descripcion} onChange={e => setDescripcion(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:border-[#38bdf8] focus:outline-none resize-none"></textarea>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700">Imagen</label>
                {imagen && (
                  <div className="relative w-full h-32 rounded-xl overflow-hidden border border-gray-200">
                    <img src={imagen} alt="Preview" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setImagen('')} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600"><Trash2 className="w-3 h-3" /></button>
                  </div>
                )}
                {!imagen && (
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 flex flex-col items-center hover:bg-gray-50 hover:border-[#38bdf8]">
                    <ImageIcon className="w-6 h-6 mb-1 opacity-50" />
                    <span className="text-xs font-medium">Subir foto (se convertirá a WebP)</span>
                  </button>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" id="disponible" checked={disponible} onChange={e => setDisponible(e.target.checked)} className="w-4 h-4 rounded text-[#38bdf8] focus:ring-[#38bdf8]" />
                <label htmlFor="disponible" className="text-sm font-semibold text-gray-700 select-none cursor-pointer">Artículo disponible al público</label>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50">Cancelar</button>
                <button type="submit" className="flex-1 py-2.5 bg-[#38bdf8] text-white font-bold rounded-xl hover:bg-[#0ea5e9]">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
