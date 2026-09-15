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
  Package, 
  Send, 
  AlertTriangle, 
  CheckCircle2,
  MessageSquare,
  ShieldCheck,
  ChevronLeft,
  Calendar,
  UserCheck
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

  // Form states for review
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
      alert('Debes iniciar sesión con tu cuenta para calificar este comercio.');
      return;
    }

    setEnviandoResena(true);
    setMensajeResena('');

    try {
      await fetchAPI('/resenas', {
        method: 'POST',
        body: JSON.stringify({
          comercioId: id,
          puntaje,
          comentario
        })
      });

      setComentario('');
      setMensajeResena('Tu opinión fue registrada y publicada exitosamente.');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Error al enviar la reseña');
    } finally {
      setEnviandoResena(false);
    }
  };

  const handleReportarResena = async (resenaId: string) => {
    if (!confirm('¿Deseas reportar este comentario para revisión por parte de la administración municipal?')) return;
    try {
      await fetchAPI(`/resenas/${resenaId}/reportar`, { method: 'PATCH' });
      alert('Comentario reportado para moderación.');
    } catch (err: any) {
      alert('Error al reportar: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-3 border-slate-200 border-t-slate-900 rounded-full animate-spin mb-3"></div>
        <span className="text-xs text-slate-500 font-medium">Cargando vidriera...</span>
      </div>
    );
  }

  if (!comercio) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
        <Store className="w-12 h-12 text-slate-300 mb-3" />
        <h2 className="text-base font-bold text-slate-800">Comercio no encontrado</h2>
        <p className="text-slate-500 text-xs mt-1 mb-4">El establecimiento solicitado no existe o fue dado de baja.</p>
        <Link href="/buscar" className="text-indigo-600 font-semibold text-xs hover:underline flex items-center space-x-1">
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Volver al directorio</span>
        </Link>
      </div>
    );
  }

  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(filtroProd.toLowerCase()) ||
    (p.descripcion && p.descripcion.toLowerCase().includes(filtroProd.toLowerCase()))
  );

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      {/* Top Banner Hero */}
      <div className="bg-slate-900 text-white border-b border-slate-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-4">
            <Link 
              href="/buscar"
              className="inline-flex items-center space-x-1 text-slate-400 hover:text-white text-xs font-semibold transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Volver a Comercios</span>
            </Link>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex-1">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 text-slate-200 text-xs font-semibold mb-3 border border-white/10">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Establecimiento Oficial Verificado</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-2">
                {comercio.nombre}
              </h1>
              <p className="text-slate-300 text-sm max-w-2xl leading-relaxed mb-5 font-normal">
                {comercio.descripcion || 'Comercio de proximidad habilitado por la Dirección de Comercio e Industria.'}
              </p>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
                {comercio.direccion && (
                  <span className="flex items-center space-x-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{comercio.direccion}</span>
                  </span>
                )}
                <span className="flex items-center space-x-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg font-semibold text-white">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>
                    {comercio.calificacionPromedio > 0
                      ? `${comercio.calificacionPromedio.toFixed(1)} (${comercio.cantidadResenas || resenas.length} opiniones)`
                      : 'Nuevo'}
                  </span>
                </span>
              </div>
            </div>

            {/* Direct Contact Actions */}
            <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 min-w-[200px]">
              <button
                onClick={() => setChatOpen(true)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-2 text-xs"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Iniciar Consulta</span>
              </button>

              {comercio.contacto?.whatsapp && (
                <a
                  href={`https://wa.me/${comercio.contacto.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-semibold py-2.5 px-4 rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-2 text-xs text-center"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <span>WhatsApp</span>
                </a>
              )}

              {comercio.contacto?.telefono && (
                <a
                  href={`tel:${comercio.contacto.telefono}`}
                  className="w-full bg-white/5 hover:bg-white/10 text-slate-300 font-medium py-2 px-4 rounded-xl transition-colors flex items-center justify-center space-x-2 text-xs text-center border border-white/5"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{comercio.contacto.telefono}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        {/* Products Catalog Section */}
        <div className="mb-14">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
                <Package className="w-5 h-5 text-indigo-600" />
                <span>Catálogo Oficial de Productos y Precios</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 font-normal">
                {productos.length} artículos publicados por el comerciante
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar en el catálogo..."
                value={filtroProd}
                onChange={(e) => setFiltroProd(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
              />
            </div>
          </div>

          {productosFiltrados.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200/80 shadow-xs">
              <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-700 font-semibold text-xs">
                {filtroProd ? 'No hay productos que coincidan con la búsqueda.' : 'No hay productos publicados actualmente en esta vidriera.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {productosFiltrados.map((p) => (
                <div
                  key={p._id}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 hover:shadow-md transition-all flex flex-col p-4"
                >
                  <div className="h-28 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 mb-3 border border-slate-100">
                    <Package className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 leading-snug line-clamp-1">{p.nombre}</h3>
                  <p className="text-xs text-slate-500 mt-1 mb-4 flex-1 line-clamp-2 font-normal">
                    {p.descripcion || 'Sin descripción detallada.'}
                  </p>
                  <div className="flex items-end justify-between mt-auto pt-3 border-t border-slate-100">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Precio</span>
                      <span className="text-lg font-black text-slate-900 font-mono tabular-nums">
                        ${p.precio.toLocaleString('es-AR')}
                      </span>
                    </div>
                    <button
                      onClick={() => setChatOpen(true)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg text-xs transition-colors"
                    >
                      Consultar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Citizen Reviews & Ratings Section */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                <span>Opiniones y Calificaciones</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 font-normal">
                Comentarios y experiencias compartidas por vecinos verificados.
              </p>
            </div>

            <div className="flex items-center space-x-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
              <span className="text-2xl font-black text-slate-900 font-mono">
                {comercio.calificacionPromedio > 0 ? comercio.calificacionPromedio.toFixed(1) : '0.0'}
              </span>
              <div className="text-left">
                <div className="flex text-amber-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3.5 h-3.5 ${
                        s <= Math.round(comercio.calificacionPromedio || 0)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[11px] text-slate-500 font-medium">
                  {resenas.length} {resenas.length === 1 ? 'opinión' : 'opiniones'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Rating Submission Form */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-3">Dejar una calificación</h3>
              <form onSubmit={handleEnviarResena} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Puntaje:</label>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setPuntaje(star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= puntaje ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Comentario:</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Describe tu experiencia sobre atención, higiene, precios o calidad..."
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                  />
                </div>

                {mensajeResena && (
                  <div className="p-2.5 bg-emerald-50 text-emerald-700 text-xs rounded-xl flex items-center space-x-1.5 border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>{mensajeResena}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={enviandoResena}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold rounded-xl text-xs shadow-xs transition-colors flex items-center justify-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{enviandoResena ? 'Publicando...' : 'Publicar Opinión'}</span>
                </button>
              </form>
            </div>

            {/* Reviews Stream */}
            <div className="lg:col-span-2 space-y-3">
              {resenas.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  Aún no hay opiniones registradas para este comercio. Sé el primero en dejar tu valoración.
                </div>
              ) : (
                resenas.map((r) => (
                  <div key={r._id} className="p-4 rounded-xl border border-slate-200/80 bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center">
                          {r.usuarioId?.nombre?.charAt(0).toUpperCase() || 'V'}
                        </div>
                        <span className="font-bold text-xs text-slate-800">{r.usuarioId?.nombre || 'Vecino'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex text-amber-400">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3 h-3 ${
                                s <= r.puntaje ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed pl-9 font-normal">{r.comentario}</p>

                    {/* Merchant Official Reply */}
                    {r.respuestaComerciante && (
                      <div className="mt-3 ml-9 p-3 bg-slate-50 border-l-2 border-slate-900 rounded-r-lg text-xs">
                        <span className="font-bold text-slate-800 block text-[11px] mb-0.5">Respuesta oficial del comercio:</span>
                        <p className="text-slate-600 font-normal">{r.respuestaComerciante}</p>
                      </div>
                    )}

                    <div className="flex justify-end mt-2">
                      <button
                        onClick={() => handleReportarResena(r._id)}
                        className="text-[10px] text-slate-400 hover:text-rose-600 flex items-center space-x-1"
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

      {/* Floating Chat Messenger */}
      <ChatWidget
        comercioId={id}
        comercioNombre={comercio.nombre}
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
      />
    </div>
  );
}
