'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { fetchAPI } from '@/lib/api';
import Link from 'next/link';
import ChatWidget from '@/components/ChatWidget';
import { 
  Store, 
  MapPin, 
  Phone, 
  MessageCircle, 
  Star, 
  Search, 
  ShoppingBag, 
  Send, 
  AlertTriangle, 
  CheckCircle,
  MessageSquare
} from 'lucide-react';

interface Producto {
  _id: string;
  nombre: string;
  precio: number;
  descripcion: string;
}

interface Resena {
  _id: string;
  usuarioId: {
    _id: string;
    nombre: string;
  };
  puntaje: number;
  comentario: string;
  respuestaComerciante?: string;
  createdAt: string;
}

export default function VidrieraPublicaPage() {
  const params = useParams();
  const id = params?.id as string;

  const [comercio, setComercio] = useState<any>(null);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [resenas, setResenas] = useState<Resena[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroProd, setFiltroProd] = useState('');
  const [chatOpen, setChatOpen] = useState(false);

  // Estados del Formulario de Reseña
  const [puntaje, setPuntaje] = useState(5);
  const [comentario, setComentario] = useState('');
  const [enviandoResena, setEnviandoResena] = useState(false);
  const [mensajeResena, setMensajeResena] = useState('');

  const loadData = async () => {
    if (!id) return;
    try {
      const [comRes, prodRes, resenasRes] = await Promise.all([
        fetchAPI(`/comercios/${id}`),
        fetchAPI(`/productos?comercioId=${id}&limit=100`),
        fetchAPI(`/resenas/comercio/${id}`)
      ]);
      setComercio(comRes);
      setProductos(prodRes.data || []);
      setResenas(resenasRes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleEnviarResena = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Debes iniciar sesión con una cuenta de vecino para dejar tu reseña.');
      return;
    }

    setEnviandoResena(true);
    setMensajeResena('');

    try {
      const res = await fetchAPI('/resenas', {
        method: 'POST',
        body: JSON.stringify({
          comercioId: id,
          puntaje,
          comentario
        })
      });

      setComentario('');
      setMensajeResena('¡Gracias! Tu opinión fue registrada con éxito.');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Error al enviar la reseña');
    } finally {
      setEnviandoResena(false);
    }
  };

  const handleReportarResena = async (resenaId: string) => {
    if (!confirm('¿Deseas reportar este comentario por contenido inadecuado u ofensivo?')) return;
    try {
      await fetchAPI(`/resenas/${resenaId}/reportar`, { method: 'PATCH' });
      alert('Reseña reportada para moderación por parte del equipo municipal.');
    } catch (err: any) {
      alert('Error al reportar: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!comercio) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
        <Store className="w-16 h-16 text-gray-400 mb-3" />
        <h2 className="text-xl font-bold text-gray-800">Comercio no encontrado</h2>
        <p className="text-gray-500 text-sm mt-1 mb-4">La vidriera solicitada no existe o fue dada de baja.</p>
        <Link href="/buscar" className="text-blue-600 font-semibold hover:underline">
          &larr; Volver al directorio de comercios
        </Link>
      </div>
    );
  }

  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(filtroProd.toLowerCase()) ||
    (p.descripcion && p.descripcion.toLowerCase().includes(filtroProd.toLowerCase()))
  );

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      {/* Hero Header Municipal del Comercio */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white py-12 px-4 sm:px-6 lg:px-8 shadow-md">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex-1">
              <div className="inline-flex items-center space-x-1.5 bg-white/15 px-3 py-1 rounded-full text-xs font-semibold mb-3">
                <Store className="w-3.5 h-3.5 text-blue-200" />
                <span>Vidriera Oficial Verificada</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-2">{comercio.nombre}</h1>
              <p className="text-blue-100 text-base max-w-2xl leading-relaxed mb-4">
                {comercio.descripcion || 'Comercio local adherido a la red de vidrieras digitales de la ciudad.'}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-blue-200">
                {comercio.direccion && (
                  <span className="flex items-center space-x-1 bg-white/10 px-3 py-1 rounded-lg">
                    <MapPin className="w-4 h-4 text-red-300" />
                    <span>{comercio.direccion}</span>
                  </span>
                )}
                <span className="flex items-center space-x-1 bg-yellow-400/20 text-yellow-300 font-bold px-3 py-1 rounded-lg">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>
                    {comercio.calificacionPromedio > 0
                      ? `${comercio.calificacionPromedio.toFixed(1)} (${comercio.cantidadResenas || resenas.length} opiniones)`
                      : 'Comercio Nuevo'}
                  </span>
                </span>
              </div>
            </div>

            {/* Acciones de Contacto Inmediato */}
            <div className="flex flex-col sm:flex-row md:flex-col gap-3 min-w-[220px]">
              <button
                onClick={() => setChatOpen(true)}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-5 rounded-xl shadow-lg transition-transform hover:scale-102 flex items-center justify-center space-x-2 text-sm"
              >
                <MessageSquare className="w-4 h-4" />
                <span>💬 Chatear en Vivo</span>
              </button>

              {comercio.contacto?.whatsapp && (
                <a
                  href={`https://wa.me/${comercio.contacto.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-md transition-colors flex items-center justify-center space-x-2 text-sm text-center"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp Directo</span>
                </a>
              )}

              {comercio.contacto?.telefono && (
                <a
                  href={`tel:${comercio.contacto.telefono}`}
                  className="w-full bg-white/15 hover:bg-white/25 text-white font-medium py-2 px-4 rounded-xl transition-colors flex items-center justify-center space-x-2 text-xs text-center"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{comercio.contacto.telefono}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Catálogo de Productos */}
        <div className="mb-14">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-black text-gray-900 flex items-center space-x-2">
                <ShoppingBag className="w-6 h-6 text-blue-600" />
                <span>Catálogo de Productos y Precios</span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">Precios informados directamente por el comerciante</p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar en el catálogo..."
                value={filtroProd}
                onChange={(e) => setFiltroProd(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {productosFiltrados.length === 0 ? (
            <div className="bg-white p-10 text-center rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-4xl mb-3 block">📦</span>
              <p className="text-gray-600 font-semibold text-sm">
                {filtroProd ? 'No hay productos que coincidan con la búsqueda.' : 'Este comercio aún no ha publicado productos en su catálogo.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {productosFiltrados.map((p) => (
                <div
                  key={p._id}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col group"
                >
                  <div className="h-36 bg-gradient-to-br from-gray-50 to-blue-50/50 flex items-center justify-center text-4xl group-hover:scale-105 transition-transform duration-300">
                    🛍️
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-bold text-base text-gray-900 leading-snug line-clamp-1">{p.nombre}</h3>
                    <p className="text-xs text-gray-500 mt-1 mb-4 flex-1 line-clamp-2">{p.descripcion || 'Sin descripción detallada.'}</p>
                    <div className="flex items-end justify-between mt-auto pt-3 border-t border-gray-100">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-gray-400 block">Precio</span>
                        <span className="text-xl font-black text-green-600">
                          ${p.precio.toLocaleString('es-AR')}
                        </span>
                      </div>
                      <button
                        onClick={() => setChatOpen(true)}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg text-xs transition-colors"
                      >
                        Consultar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sección de Reseñas y Calificaciones (Etapa 5) */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-gray-100">
            <div>
              <h2 className="text-2xl font-black text-gray-900 flex items-center space-x-2">
                <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                <span>Opiniones de la Comunidad</span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Calificaciones y comentarios de vecinos que visitaron este comercio.
              </p>
            </div>

            <div className="flex items-center space-x-3 bg-yellow-50/80 px-4 py-2.5 rounded-xl border border-yellow-200">
              <span className="text-3xl font-black text-yellow-700">
                {comercio.calificacionPromedio > 0 ? comercio.calificacionPromedio.toFixed(1) : 'Nuevo'}
              </span>
              <div className="text-left">
                <div className="flex text-yellow-400 text-xs">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span key={s}>{s <= Math.round(comercio.calificacionPromedio || 0) ? '★' : '☆'}</span>
                  ))}
                </div>
                <span className="text-[11px] text-yellow-800 font-bold">
                  {resenas.length} {resenas.length === 1 ? 'opinión' : 'opiniones'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Formulario para Dejar Opinión */}
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
              <h3 className="font-bold text-base text-gray-900 mb-3">Deja tu opinión</h3>
              <form onSubmit={handleEnviarResena} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Calificación (Estrellas):</label>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setPuntaje(star)}
                        className={`text-2xl transition-transform hover:scale-125 ${
                          star <= puntaje ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Comentario sobre el comercio:</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Comparte tu experiencia: atención, precios, calidad..."
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {mensajeResena && (
                  <div className="p-2.5 bg-green-50 text-green-700 text-xs rounded-lg flex items-center space-x-1.5">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{mensajeResena}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={enviandoResena}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-xs transition-colors flex items-center justify-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{enviandoResena ? 'Enviando...' : 'Publicar Opinión'}</span>
                </button>
              </form>
            </div>

            {/* Listado de Opiniones */}
            <div className="lg:col-span-2 space-y-4">
              {resenas.length === 0 ? (
                <div className="text-center py-10 text-gray-500 text-xs">
                  Aún no hay opiniones sobre este comercio. ¡Sé el primero en calificarlo!
                </div>
              ) : (
                resenas.map((r) => (
                  <div key={r._id} className="p-4 rounded-xl border border-gray-200 bg-white shadow-xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                          {r.usuarioId?.nombre?.charAt(0) || 'V'}
                        </div>
                        <span className="font-bold text-xs text-gray-900">{r.usuarioId?.nombre || 'Vecino'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-yellow-500 text-xs font-bold">
                          {'★'.repeat(Math.min(5, Math.floor(r.puntaje)))}
                          {'☆'.repeat(Math.max(0, 5 - Math.floor(r.puntaje)))}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-700 leading-relaxed pl-9">{r.comentario}</p>

                    {/* Respuesta del Comerciante si existe */}
                    {r.respuestaComerciante && (
                      <div className="mt-3 ml-9 p-3 bg-blue-50/70 border-l-3 border-blue-600 rounded-r-lg text-xs">
                        <span className="font-bold text-blue-900 block mb-0.5">Respuesta del Comercio:</span>
                        <p className="text-blue-800">{r.respuestaComerciante}</p>
                      </div>
                    )}

                    <div className="flex justify-end mt-2">
                      <button
                        onClick={() => handleReportarResena(r._id)}
                        className="text-[10px] text-gray-400 hover:text-red-500 flex items-center space-x-1"
                        title="Reportar comentario inapropiado"
                      >
                        <AlertTriangle className="w-3 h-3" />
                        <span>Reportar</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Widget flotante de Chat en tiempo real */}
      <ChatWidget
        comercioId={id}
        comercioNombre={comercio.nombre}
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
      />
    </div>
  );
}
