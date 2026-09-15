'use client';

import { useEffect, useState, use } from 'react';
import { fetchAPI } from '@/lib/api';
import Link from 'next/link';
import { 
  Store, 
  MapPin, 
  Phone, 
  Star, 
  ShieldCheck, 
  MessageSquare, 
  ArrowLeft, 
  Search, 
  Flag, 
  Check, 
  Send,
  Coins
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

  // Form Reseña
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

      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch {}

      toast.success('Reseña compartida con la comunidad');
      setNuevoComentario('');
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Error al publicar opinión');
    } finally {
      setEnviandoResena(false);
    }
  };

  const handleReportarResena = async (resenaId: string) => {
    const motivo = prompt('Motivo del reporte para fiscalización municipal:');
    if (!motivo) return;

    try {
      await fetchAPI(`/resenas/${resenaId}/reportar`, {
        method: 'PATCH',
        body: JSON.stringify({ motivo })
      });
      toast.info('Comentario reportado para moderación');
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
      <div className="min-h-[50vh] flex items-center justify-center text-[#78808f] text-xs">
        Cargando vidriera digital...
      </div>
    );
  }

  if (error || !comercio) {
    return (
      <div className="max-w-lg mx-auto my-16 p-6 rounded-2xl bg-[#171b22] border border-[#232833] text-center">
        <h2 className="text-base font-semibold text-[#e2e5eb]">Comercio no disponible</h2>
        <p className="text-xs text-[#8d94a1] mt-1">{error || 'El comercio solicitado no existe o no está habilitado.'}</p>
        <Link href="/buscar" className="mt-4 inline-block px-4 py-2 bg-[#252c38] text-[#e2e5eb] rounded-lg text-xs font-medium">
          Volver al directorio
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <Link href="/buscar" className="inline-flex items-center space-x-1.5 text-xs text-[#8d94a1] hover:text-[#e2e5eb] transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver al Directorio de Comercios</span>
        </Link>
      </div>

      {/* Hero Header */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#171b22] border border-[#232833] flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="flex items-start space-x-4">
          <div className="w-16 h-16 rounded-xl bg-[#1f2633] border border-[#2b3547] text-[#9cb1ce] flex items-center justify-center text-2xl font-semibold flex-shrink-0">
            {comercio.nombre.charAt(0).toUpperCase()}
          </div>

          <div>
            <div className="flex items-center space-x-2 mb-1.5">
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-[#1e2a23] border border-[#2b3e34] text-[#8bb59b] text-[10px] font-medium">
                <ShieldCheck className="w-3 h-3" />
                <span>Habilitación Municipal Oficial</span>
              </span>
              <span className="text-xs text-[#6b7280]">• Bahía Blanca</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-semibold text-[#e2e5eb]">
              {comercio.nombre}
            </h1>

            <p className="text-xs text-[#8d94a1] mt-1.5 max-w-xl leading-relaxed">
              {comercio.descripcion || 'Establecimiento local adherido al programa de transparencia.'}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[#78808f]">
              {comercio.direccion && (
                <span className="flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-[#6b7280]" />
                  <span>{comercio.direccion}</span>
                </span>
              )}
              {comercio.contacto?.telefono && (
                <span className="flex items-center space-x-1">
                  <Phone className="w-3.5 h-3.5 text-[#6b7280]" />
                  <span>{comercio.contacto.telefono}</span>
                </span>
              )}
              <div className="flex items-center space-x-1 text-[#d1ab77]">
                <Star className="w-3.5 h-3.5 fill-[#d1ab77]" />
                <span className="font-semibold text-[#e2e5eb]">
                  {comercio.calificacionPromedio ? comercio.calificacionPromedio.toFixed(1) : 'Nuevo'}
                </span>
                <span className="text-[#6b7280]">({comercio.cantidadResenas || 0} reseñas)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row md:flex-col gap-2 flex-shrink-0">
          <button
            onClick={() => setChatOpen(true)}
            className="px-4 py-2.5 bg-[#2c3749] hover:bg-[#344157] text-[#e2e5eb] border border-[#3d4b63] rounded-lg text-xs font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <MessageSquare className="w-4 h-4 text-[#9cb1ce]" />
            <span>Consultar por Chat</span>
          </button>
          <Link
            href="/mapa"
            className="px-4 py-2 bg-[#12151b] hover:bg-[#181c24] text-[#8d94a1] border border-[#232833] rounded-lg text-xs font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Ubicar en Mapa</span>
          </Link>
        </div>
      </div>

      {/* Catalog & Reviews Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Catalog */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#232833]">
            <div>
              <h2 className="text-base font-semibold text-[#e2e5eb]">Catálogo Declarado</h2>
              <p className="text-xs text-[#78808f]">Precios al consumidor vigentes en el local</p>
            </div>

            <div className="relative w-full sm:w-60">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]" />
              <input
                type="text"
                placeholder="Buscar artículo..."
                value={searchProd}
                onChange={(e) => setSearchProd(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-[#171b22] border border-[#232833] rounded-lg text-xs text-[#e2e5eb] placeholder:text-[#5f6674] focus:outline-none focus:border-[#384354]"
              />
            </div>
          </div>

          {productosFiltrados.length === 0 ? (
            <div className="p-10 rounded-xl bg-[#171b22] border border-[#232833] text-center text-[#78808f] text-xs">
              No hay artículos cargados con esa búsqueda.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {productosFiltrados.map((prod) => (
                <div
                  key={prod._id}
                  className="p-4 rounded-xl bg-[#171b22] border border-[#232833] flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] text-[#9cb1ce] bg-[#1f2633] border border-[#2b3547] px-2 py-0.5 rounded">
                        {prod.categoria || 'General'}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded border ${
                        prod.disponible
                          ? 'bg-[#1e2a23] text-[#8bb59b] border-[#2b3e34]'
                          : 'bg-[#281c22] text-[#d48a97] border-[#3e252d]'
                      }`}>
                        {prod.disponible ? 'Disponible' : 'Agotado'}
                      </span>
                    </div>

                    <h4 className="text-sm font-semibold text-[#e2e5eb] mt-2">{prod.nombre}</h4>
                    <p className="text-xs text-[#8d94a1] mt-1 line-clamp-2">
                      {prod.descripcion || 'Sin descripción adicional.'}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#232833] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#6b7280] block">Precio</span>
                      <span className="text-base font-semibold text-[#e2e5eb] tabular-nums">${prod.precio}</span>
                    </div>

                    <button
                      onClick={() => setChatOpen(true)}
                      className="px-2.5 py-1 bg-[#252c38] hover:bg-[#2e3745] text-[#9cb1ce] border border-[#343e4f] rounded-lg text-xs font-medium transition-colors"
                    >
                      Consultar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reviews */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-[#171b22] border border-[#232833]">
            <h3 className="text-sm font-semibold text-[#e2e5eb]">Opiniones Comunitarias</h3>
            <p className="text-xs text-[#78808f] mt-0.5">Experiencias compartidas por vecinos</p>

            <form onSubmit={handleCrearResena} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs text-[#8d94a1] mb-1">Calificación:</label>
                <div className="flex items-center space-x-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNuevoPuntaje(star)}
                      onMouseEnter={() => setHoverStar(star)}
                      onMouseLeave={() => setHoverStar(0)}
                      className="p-0.5"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= (hoverStar || nuevoPuntaje)
                            ? 'fill-[#d1ab77] text-[#d1ab77]'
                            : 'text-[#384252]'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-medium text-[#c8cdd6] ml-2">
                    {nuevoPuntaje}/5
                  </span>
                </div>
              </div>

              <div>
                <textarea
                  rows={2}
                  required
                  placeholder="Tu comentario sobre atención o precios..."
                  value={nuevoComentario}
                  onChange={(e) => setNuevoComentario(e.target.value)}
                  className="w-full p-2.5 bg-[#12151b] border border-[#232833] rounded-lg text-xs text-[#e2e5eb] placeholder:text-[#5f6674] focus:outline-none focus:border-[#384354] resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={enviandoResena || !nuevoComentario.trim()}
                className="w-full py-2 bg-[#2c3749] hover:bg-[#344157] text-[#e2e5eb] border border-[#3d4b63] disabled:opacity-50 text-xs font-medium rounded-lg transition-colors flex items-center justify-center space-x-1.5"
              >
                <span>{enviandoResena ? 'Enviando...' : 'Publicar Opinión'}</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-[#232833] space-y-3 max-h-[380px] overflow-y-auto">
              {resenas.length === 0 ? (
                <p className="text-xs text-[#78808f] text-center py-2">Sin opiniones todavía.</p>
              ) : (
                resenas.map((r) => (
                  <div key={r._id} className="p-3 rounded-lg bg-[#14171e] border border-[#1f242e] space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[#c8cdd6]">{r.usuarioId?.nombre || 'Vecino'}</span>
                      <span className="text-[#d1ab77] flex items-center space-x-0.5">
                        <Star className="w-3 h-3 fill-[#d1ab77]" />
                        <span>{r.puntaje}</span>
                      </span>
                    </div>

                    <p className="text-[#8d94a1] italic">"{r.comentario}"</p>

                    {r.respuestaComerciante && (
                      <div className="mt-1 pl-2 border-l border-[#3d5a7d] text-[11px] text-[#78808f]">
                        <span className="text-[#9cb1ce] block font-medium">Respuesta:</span>
                        <span>{r.respuestaComerciante.contenido}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1 text-[10px] text-[#5f6674]">
                      <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                      <button
                        onClick={() => handleReportarResena(r._id)}
                        className="hover:text-[#d48a97] transition-colors"
                      >
                        Reportar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

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
