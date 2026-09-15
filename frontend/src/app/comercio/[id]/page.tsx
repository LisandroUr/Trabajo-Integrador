'use client';

import { useEffect, useState, use } from 'react';
import { fetchAPI } from '@/lib/api';
import Link from 'next/link';
import { 
  Store, 
  MapPin, 
  Phone, 
  Mail, 
  Star, 
  ShieldCheck, 
  MessageSquare, 
  ArrowLeft, 
  Search, 
  Flag, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Sparkles,
  Send,
  MessageCircle,
  Share2
} from 'lucide-react';
import ChatWidget from '@/components/ChatWidget';
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

interface Resena {
  _id: string;
  usuarioId: {
    _id: string;
    nombre: string;
  };
  puntaje: number;
  comentario: string;
  respuestaComerciante?: {
    contenido: string;
    fecha: string;
  };
  createdAt: string;
}

interface Comercio {
  _id: string;
  nombre: string;
  descripcion: string;
  direccion?: string;
  contacto?: {
    telefono?: string;
    whatsapp?: string;
    email?: string;
  };
  calificacionPromedio: number;
  cantidadResenas?: number;
}

export default function ComercioDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const comercioId = resolvedParams.id;

  const [comercio, setComercio] = useState<Comercio | null>(null);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [resenas, setResenas] = useState<Resena[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [chatOpen, setChatOpen] = useState(false);
  const [searchProd, setSearchProd] = useState('');

  // Formulario Reseña
  const [nuevoPuntaje, setNuevoPuntaje] = useState(5);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [enviandoResena, setEnviandoResena] = useState(false);
  const [hoverStar, setHoverStar] = useState(0);

  const loadData = async () => {
    try {
      const [comRes, prodRes, resenasRes] = await Promise.all([
        fetchAPI(`/comercios/${comercioId}`),
        fetchAPI(`/productos?comercioId=${comercioId}&limit=100`),
        fetchAPI(`/resenas/comercio/${comercioId}`)
      ]);
      setComercio(comRes);
      setProductos(prodRes.data || []);
      setResenas(resenasRes || []);
    } catch (err: any) {
      setError(err.message || 'Error cargando datos del comercio');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [comercioId]);

  const handleCrearResena = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoComentario.trim()) return;

    setEnviandoResena(true);
    try {
      await fetchAPI('/resenas', {
        method: 'POST',
        body: JSON.stringify({
          comercioId,
          puntaje: nuevoPuntaje,
          comentario: nuevoComentario.trim()
        })
      });

      // Celebratory Confetti!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {}

      toast.success('¡Tu reseña ha sido publicada con éxito!');
      setNuevoComentario('');
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Error publicando la reseña');
    } finally {
      setEnviandoResena(false);
    }
  };

  const handleReportarResena = async (resenaId: string) => {
    const motivo = prompt('Motivo del reporte para auditoría municipal (ej. vocabulario ofensivo, spam):');
    if (!motivo) return;

    try {
      await fetchAPI(`/resenas/${resenaId}/reportar`, {
        method: 'PATCH',
        body: JSON.stringify({ motivo })
      });
      toast.info('Reseña reportada para fiscalización municipal.');
      loadData();
    } catch (err: any) {
      toast.error('Error al reportar: ' + err.message);
    }
  };

  const productosFiltrados = productos.filter((p) =>
    p.nombre.toLowerCase().includes(searchProd.toLowerCase()) ||
    (p.descripcion || '').toLowerCase().includes(searchProd.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-400 space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold">Cargando vidriera digital...</p>
      </div>
    );
  }

  if (error || !comercio) {
    return (
      <div className="max-w-xl mx-auto my-20 p-8 rounded-3xl bg-slate-900 border border-rose-500/30 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-white">Comercio no encontrado</h2>
        <p className="text-xs text-slate-400 mt-2">{error || 'La vidriera solicitada no existe o no se encuentra habilitada.'}</p>
        <Link href="/buscar" className="mt-6 inline-block px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold">
          Volver al directorio
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Back link */}
      <div className="mb-6">
        <Link href="/buscar" className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors group">
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Volver a Comercios</span>
        </Link>
      </div>

      {/* Hero Storefront Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border border-white/10 p-8 sm:p-12 mb-10 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
          <div className="flex items-start space-x-5">
            <div className="w-18 h-18 sm:w-22 sm:h-22 rounded-3xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-[2px] shadow-2xl shadow-indigo-600/30 flex-shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center text-3xl font-black text-white">
                {comercio.nombre.charAt(0).toUpperCase()}
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Vidriera Oficial Habilitada</span>
                </span>
                <span className="text-xs text-slate-500">•</span>
                <span className="text-xs text-slate-400 font-semibold">Bahía Blanca</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {comercio.nombre}
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
                {comercio.descripcion || 'Comercio local verificado por el Municipio de Bahía Blanca.'}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                {comercio.direccion && (
                  <span className="flex items-center space-x-1.5">
                    <MapPin className="w-4 h-4 text-cyan-400" />
                    <span>{comercio.direccion}</span>
                  </span>
                )}
                {comercio.contacto?.telefono && (
                  <span className="flex items-center space-x-1.5">
                    <Phone className="w-4 h-4 text-indigo-400" />
                    <span>{comercio.contacto.telefono}</span>
                  </span>
                )}
                <div className="flex items-center space-x-1 text-amber-400 font-bold">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span className="text-white">{comercio.calificacionPromedio ? comercio.calificacionPromedio.toFixed(1) : 'Nuevo'}</span>
                  <span className="text-slate-500">({comercio.cantidadResenas || 0} reseñas)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Contact CTA */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-3 flex-shrink-0">
            <button
              onClick={() => setChatOpen(true)}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2.5"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Consultar en Tiempo Real</span>
            </button>
            <Link
              href="/mapa"
              className="px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 font-bold text-xs transition-all flex items-center justify-center space-x-2"
            >
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span>Ver Ubicación en Mapa</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Catalog & Reviews 2-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left 2 Cols: Product Catalog */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-white">Catálogo de Productos</h2>
              <p className="text-xs text-slate-400 mt-0.5">Precios vigentes declarados por el comerciante</p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar producto en catálogo..."
                value={searchProd}
                onChange={(e) => setSearchProd(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {productosFiltrados.length === 0 ? (
            <div className="p-12 rounded-3xl bg-slate-900/50 border border-white/5 text-center text-slate-400">
              <Store className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-white">No hay productos en esta búsqueda</p>
              <p className="text-xs text-slate-400 mt-1">El comercio aún no cargó productos con ese nombre.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {productosFiltrados.map((prod) => (
                <div
                  key={prod._id}
                  className="p-5 rounded-2xl bg-slate-900/70 border border-white/10 hover:border-indigo-500/40 transition-all shadow-xl backdrop-blur-xl flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md">
                        {prod.categoria || 'Alimento'}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        prod.disponible ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {prod.disponible ? 'En stock' : 'Sin stock'}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-white mt-2">{prod.nombre}</h4>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {prod.descripcion || 'Sin descripción detallada.'}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Precio</span>
                      <span className="text-xl font-black text-emerald-400 tabular-nums">${prod.precio}</span>
                    </div>

                    <button
                      onClick={() => setChatOpen(true)}
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-indigo-300 hover:text-white border border-white/10 text-xs font-semibold transition-all flex items-center space-x-1"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Consultar</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Reviews & Rating Module */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 shadow-2xl backdrop-blur-xl">
            <h3 className="text-base font-bold text-white">Opiniones de la Comunidad</h3>
            <p className="text-xs text-slate-400 mt-0.5">Califica tu experiencia de compra vecinal</p>

            {/* Review Form */}
            <form onSubmit={handleCrearResena} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2">Puntuación:</label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNuevoPuntaje(star)}
                      onMouseEnter={() => setHoverStar(star)}
                      onMouseLeave={() => setHoverStar(0)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-6 h-6 transition-colors ${
                          star <= (hoverStar || nuevoPuntaje)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-600'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-black text-amber-400 ml-2">
                    {nuevoPuntaje} de 5
                  </span>
                </div>
              </div>

              <div>
                <textarea
                  rows={3}
                  required
                  placeholder="Escribe tu opinión constructiva sobre la atención, frescura o precios..."
                  value={nuevoComentario}
                  onChange={(e) => setNuevoComentario(e.target.value)}
                  className="w-full p-3 bg-slate-950/80 border border-white/10 rounded-2xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={enviandoResena || !nuevoComentario.trim()}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center space-x-1.5"
              >
                <span>{enviandoResena ? 'Publicando...' : 'Publicar Reseña'}</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Reviews List */}
            <div className="mt-8 pt-6 border-t border-white/10 space-y-4 max-h-[500px] overflow-y-auto">
              {resenas.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">
                  Sé el primero en compartir tu experiencia en esta vidriera.
                </p>
              ) : (
                resenas.map((r) => (
                  <div key={r._id} className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-300 font-bold text-xs flex items-center justify-center">
                          {r.usuarioId?.nombre?.charAt(0).toUpperCase() || 'V'}
                        </div>
                        <span className="text-xs font-bold text-white">{r.usuarioId?.nombre || 'Vecino'}</span>
                      </div>
                      <div className="flex items-center text-amber-400">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span className="ml-1 text-xs font-bold text-white">{r.puntaje}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed italic">"{r.comentario}"</p>

                    {r.respuestaComerciante && (
                      <div className="mt-2 pl-3 border-l-2 border-indigo-500/50 py-1 text-[11px] text-slate-400">
                        <span className="font-bold text-indigo-300 block">Respuesta del comercio:</span>
                        <span>{r.respuestaComerciante.contenido}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 text-[10px] text-slate-500">
                      <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                      <button
                        onClick={() => handleReportarResena(r._id)}
                        className="hover:text-rose-400 transition-colors flex items-center space-x-1"
                        title="Reportar comentario inapropiado"
                      >
                        <Flag className="w-3 h-3" />
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

      {/* Floating Real-Time Chat Widget Modal */}
      {chatOpen && comercio && (
        <ChatWidget
          comercioId={comercio._id}
          comercioNombre={comercio.nombre}
          isOpen={chatOpen}
          onClose={() => setChatOpen(false)}
        />
      )}
    </div>
  );
}
