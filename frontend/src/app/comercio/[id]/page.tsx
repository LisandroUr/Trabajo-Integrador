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
  Check, 
  Send,
  Clock,
  Share2,
  ExternalLink,
  Package,
  Wrench,
  CreditCard,
  CheckCircle2,
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import ChatWidget from '@/components/ChatWidget';
import MapaComercios from '@/components/MapaComercios';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';

interface ProductoItem {
  _id: string;
  nombre: string;
  precio: number;
  descripcion: string;
  disponible: boolean;
  imagen?: string;
  categoria?: any;
  tipo?: 'producto' | 'servicio';
}

interface ResenaItem {
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

interface ComercioDetalle {
  _id: string;
  nombre: string;
  descripcion: string;
  rubro?: string;
  direccion?: string;
  zona?: string;
  ubicacion?: {
    coordinates: [number, number]; // [lng, lat]
  };
  contacto?: {
    telefono?: string;
    whatsapp?: string;
    email?: string;
    redes?: string[];
  };
  horariosTexto?: string;
  vidriera?: {
    bannerPrincipal?: string;
    logo?: string;
    colores?: string[];
  };
  calificacionPromedio: number;
  cantidadResenas?: number;
  mediosDePago?: string[];
  esOficial?: boolean;
  verificado?: boolean;
  estado?: string;
}

export default function ComercioDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const comercioId = resolvedParams.id;

  const [comercio, setComercio] = useState<ComercioDetalle | null>(null);
  const [productos, setProductos] = useState<ProductoItem[]>([]);
  const [resenas, setResenas] = useState<ResenaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedProd, setSelectedProd] = useState<ProductoItem | null>(null);
  const [searchProd, setSearchProd] = useState('');
  const [activeCatalogTab, setActiveCatalogTab] = useState<'todos' | 'productos' | 'servicios'>('todos');

  // Form Reseña
  const [nuevoPuntaje, setNuevoPuntaje] = useState(5);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [enviandoResena, setEnviandoResena] = useState(false);
  const [hoverStar, setHoverStar] = useState(0);

  const loadData = async () => {
    setLoading(true);

    try {
      const [comRes, prodRes, resenasRes] = await Promise.all([
        fetchAPI(`/comercios/${comercioId}`),
        fetchAPI(`/productos?comercioId=${comercioId}&limit=100`),
        fetchAPI(`/resenas/comercio/${comercioId}`)
      ]);

      if (comRes && comRes._id) {
        const isVerif = comRes.verificado === true || comRes.estado === 'aprobado';
        const rawRubro = comRes.categorias && comRes.categorias[0] ? (comRes.categorias[0].nombre || comRes.categorias[0]) : (comRes.tipo === 'servicio' ? 'Servicios Profesionales' : 'Comercio Local');

        // Check if there is an in-browser local edit from /panel for instant preview
        let activeBanner = comRes.vidriera?.bannerPrincipal;
        let activeLogo = comRes.vidriera?.logo;
        try {
          const saved = localStorage.getItem('mi_tienda_data');
          if (saved) {
            const parsed = JSON.parse(saved);
            if ((parsed.storeId === comRes._id || parsed.storeId === comercioId) && parsed.bannerUrl) {
              activeBanner = parsed.bannerUrl;
            }
            if ((parsed.storeId === comRes._id || parsed.storeId === comercioId) && parsed.thumbUrl) {
              activeLogo = parsed.thumbUrl;
            }
          }
        } catch {}

        setComercio({
          ...comRes,
          rubro: rawRubro,
          zona: comRes.direccion?.split(',')[1]?.trim() || 'CABA',
          verificado: isVerif,
          vidriera: {
            bannerPrincipal: activeBanner || 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=1600&auto=format&fit=crop&q=80',
            logo: activeLogo || comRes.vidriera?.logo
          }
        });
        setProductos(prodRes.data || (Array.isArray(prodRes) ? prodRes : []));
        setResenas(resenasRes || []);
        return;
      }
      setComercio(null);
    } catch (err) {
      console.warn('Comercio no encontrado en backend API:', err);
      setComercio(null);
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

      toast.success('¡Opinión publicada exitosamente en la vidriera!');
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 }
        });
      } catch {}

      setNuevoComentario('');
      setNuevoPuntaje(5);
      loadData();
    } catch (err) {
      toast.error('Error al publicar la opinión. Verifica tu conexión o inicia sesión.');
    } finally {
      setEnviandoResena(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: comercio?.nombre || 'Vidriera Digital',
        text: `Mirá la vidriera digital de ${comercio?.nombre} en Vidriera Digital`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.info('Enlace de la vidriera copiado al portapapeles');
    }
  };

  // Filter products by tab and query
  const productosFiltrados = productos.filter((p) => {
    if (activeCatalogTab === 'productos' && p.tipo === 'servicio') return false;
    if (activeCatalogTab === 'servicios' && p.tipo === 'producto') return false;

    const catName = typeof p.categoria === 'object' && p.categoria ? p.categoria.nombre : (p.categoria || '');
    return (
      (p.nombre || '').toLowerCase().includes(searchProd.toLowerCase()) ||
      (p.descripcion || '').toLowerCase().includes(searchProd.toLowerCase()) ||
      String(catName).toLowerCase().includes(searchProd.toLowerCase())
    );
  });

  const rawTel = comercio?.contacto?.whatsapp || comercio?.contacto?.telefono || '';
  const waDigits = rawTel.replace(/\D/g, '');
  const waDirectUrl = waDigits
    ? `https://wa.me/${waDigits.startsWith('54') ? waDigits : '549' + waDigits}?text=${encodeURIComponent(
        `Hola ${comercio?.nombre}, vi su vidriera en Vidriera Digital y quería consultarles:`
      )}`
    : null;

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-gray-500 gap-3">
        <div className="w-8 h-8 border-3 border-[#38bdf8] border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm font-medium">Cargando vidriera digital...</span>
      </div>
    );
  }

  if (!comercio) {
    return (
      <div className="max-w-lg mx-auto my-16 p-8 rounded-2xl bg-white border border-gray-200 text-center shadow-xs">
        <Store className="w-12 h-12 text-[#38bdf8] mx-auto mb-3" />
        <h2 className="text-xl font-bold text-gray-900">Vidriera no disponible</h2>
        <p className="text-sm text-gray-500 mt-1">El comercio solicitado no existe o fue suspendido temporalmente.</p>
        <Link href="/" className="mt-5 inline-block px-5 py-2.5 bg-[#38bdf8] text-white rounded-xl text-sm font-semibold hover:bg-[#0ea5e9] transition-colors">
          Volver al Inicio
        </Link>
      </div>
    );
  }

  const mapStores = comercio.ubicacion?.coordinates ? [{
    _id: comercio._id,
    nombre: comercio.nombre,
    descripcion: comercio.descripcion,
    direccion: comercio.direccion,
    ubicacion: comercio.ubicacion,
    calificacionPromedio: comercio.calificacionPromedio,
    contacto: comercio.contacto
  }] : [];

  return (
    <div className="min-h-screen pb-16 bg-[#f0f6fa]">

      {/* ========================================================================= */}
      {/* 1. STORE BANNER (BANNER PRINCIPAL DE LA VIDRIERA) */}
      {/* ========================================================================= */}
      <div className="relative w-full h-[220px] sm:h-[300px] lg:h-[340px] bg-slate-900 overflow-hidden select-none">
        <img
          src={comercio.vidriera?.bannerPrincipal || 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=1600&auto=format&fit=crop&q=80'}
          alt={`Banner de ${comercio.nombre}`}
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />

        {/* Back Link on Top of Banner */}
        <div className="absolute top-4 left-4 sm:top-6 sm:left-8 z-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md text-xs font-semibold transition-all border border-white/20"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver al Ranking</span>
          </Link>
        </div>

        {/* Share Button on Top Right */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-8 z-10">
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md text-xs font-semibold transition-all border border-white/20 cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Compartir Vidriera</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. STORE PROFILE BAR & DETALLES DE LA TIENDA */}
      {/* ========================================================================= */}
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 -mt-16 sm:-mt-20 relative z-20">
        <div className="bg-white rounded-2xl p-5 sm:p-7 shadow-md border border-gray-100 flex flex-col md:flex-row md:items-start justify-between gap-6">
          
          <div className="flex flex-col sm:flex-row items-start gap-5 flex-1">
            {/* Store Avatar / Logo */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white border-2 border-white shadow-lg overflow-hidden flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-sky-50 to-sky-100">
              {comercio.vidriera?.logo ? (
                <img src={comercio.vidriera.logo} alt={comercio.nombre} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#38bdf8] font-black text-3xl">
                  {comercio.nombre.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Store Details */}
            <div className="space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                {comercio.verificado || comercio.estado === 'aprobado' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Vidriera Oficial Verificada</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Pendiente de Verificación</span>
                  </span>
                )}

                {comercio.rubro && (
                  <span className="px-2.5 py-0.5 rounded-full bg-sky-50 border border-sky-100 text-[#0284c7] text-[11px] font-semibold">
                    {comercio.rubro}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                {comercio.nombre}
              </h1>

              <p className="text-xs sm:text-sm text-gray-600 max-w-2xl leading-relaxed">
                {comercio.descripcion}
              </p>

              {/* Meta tags: Location, Rating, Hours */}
              <div className="pt-2 flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-gray-600">
                {/* Rating */}
                <div className="flex items-center gap-1 font-bold text-gray-900">
                  <span className="text-amber-400 text-sm">★</span>
                  <span>{comercio.calificacionPromedio ? comercio.calificacionPromedio.toFixed(1) : '4.8'}</span>
                  <span className="text-gray-400 font-normal">
                    ({comercio.cantidadResenas ? comercio.cantidadResenas.toLocaleString() : '120'} opiniones)
                  </span>
                </div>

                {/* Location */}
                {comercio.direccion && (
                  <div className="flex items-center gap-1 text-gray-600">
                    <MapPin className="w-3.5 h-3.5 text-[#38bdf8] flex-shrink-0" />
                    <span>{comercio.direccion}</span>
                  </div>
                )}

                {/* Hours */}
                {comercio.horariosTexto && (
                  <div className="flex items-center gap-1 text-gray-600">
                    <Clock className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>{comercio.horariosTexto}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Contact & Action Buttons */}
          <div className="flex flex-row md:flex-col gap-2.5 sm:gap-3 flex-shrink-0 w-full md:w-56 pt-2 md:pt-0">
            <button
              onClick={() => {
                setSelectedProd(null);
                setChatOpen(true);
              }}
              className="flex-1 py-2.5 px-4 bg-[#38bdf8] hover:bg-[#0ea5e9] text-white rounded-xl text-xs sm:text-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Consultar por Chat</span>
            </button>

            {waDirectUrl && (
              <a
                href={waDirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 px-4 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl text-xs sm:text-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <Phone className="w-4 h-4" />
                <span>WhatsApp Directo</span>
              </a>
            )}

            {(comercio.direccion || comercio.ubicacion?.coordinates) && (
              <a
                href={
                  comercio.direccion && comercio.direccion.startsWith('http') 
                    ? comercio.direccion 
                    : comercio.ubicacion?.coordinates && comercio.ubicacion.coordinates.length === 2
                      ? `https://www.google.com/maps/search/?api=1&query=${comercio.ubicacion.coordinates[1]},${comercio.ubicacion.coordinates[0]}`
                      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(comercio.direccion || '')}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 px-4 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100 rounded-xl text-xs sm:text-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <MapPin className="w-4 h-4" />
                <span>Cómo Llegar</span>
              </a>
            )}

            {comercio.contacto?.telefono && (
              <a
                href={`tel:${comercio.contacto.telefono.replace(/[^0-9+]/g, '')}`}
                className="hidden sm:flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-semibold text-gray-700 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-gray-500" />
                <span>Llamar: {comercio.contacto.telefono}</span>
              </a>
            )}
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MAIN SECTION: CATALOG (LEFT) & UBICACIÓN / OPINIONES (RIGHT) */}
      {/* ========================================================================= */}
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ==================== LEFT COLUMN: STORE CATALOG (8 COLS) ==================== */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Catalog Header & Filter Tabs */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-extrabold text-gray-900 tracking-tight">
                    Catálogo de la Vidriera ({productosFiltrados.length})
                  </h2>
                  <p className="text-xs text-gray-500">
                    Precios transparentes y artículos publicados por {comercio.nombre}
                  </p>
                </div>

                {/* Filter Tabs: Todos / Productos / Servicios */}
                <div className="inline-flex rounded-xl bg-gray-100 p-1 text-xs font-semibold">
                  <button
                    onClick={() => setActiveCatalogTab('todos')}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      activeCatalogTab === 'todos'
                        ? 'bg-white text-gray-900 shadow-xs font-bold'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Todos ({productos.length})
                  </button>
                  <button
                    onClick={() => setActiveCatalogTab('productos')}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                      activeCatalogTab === 'productos'
                        ? 'bg-[#38bdf8] text-white shadow-xs font-bold'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <ShoppingBag className="w-3 h-3" />
                    <span>Productos</span>
                  </button>
                  <button
                    onClick={() => setActiveCatalogTab('servicios')}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                      activeCatalogTab === 'servicios'
                        ? 'bg-[#38bdf8] text-white shadow-xs font-bold'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Wrench className="w-3 h-3" />
                    <span>Servicios</span>
                  </button>
                </div>
              </div>

              {/* Search Inside Store */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar en el catálogo de este comercio..."
                  value={searchProd}
                  onChange={(e) => setSearchProd(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#38bdf8] focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Catalog Grid */}
            {productosFiltrados.length === 0 ? (
              <div className="p-12 rounded-2xl bg-white border border-gray-100 text-center text-gray-500 shadow-xs">
                <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="font-semibold text-gray-800 text-sm">No se encontraron artículos con esa búsqueda.</p>
                <button
                  onClick={() => {
                    setSearchProd('');
                    setActiveCatalogTab('todos');
                  }}
                  className="mt-3 text-xs text-[#0284c7] font-bold hover:underline cursor-pointer"
                >
                  Ver todo el catálogo
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {productosFiltrados.map((prod) => (
                  <div
                    key={prod._id}
                    className="p-4 rounded-2xl bg-white border border-gray-100 hover:border-[#38bdf8] hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Image if available */}
                      {prod.imagen && (
                        <div className="w-full aspect-[16/10] rounded-xl overflow-hidden bg-gray-50 mb-3 flex items-center justify-center p-2">
                          <img
                            src={prod.imagen}
                            alt={prod.nombre}
                            className="w-full h-full object-contain mix-blend-multiply"
                          />
                        </div>
                      )}

                      <div className="flex justify-between items-start gap-2">
                        <span className="text-[10px] font-bold text-[#0284c7] bg-sky-50 px-2.5 py-0.5 rounded-full">
                          {typeof prod.categoria === 'object' && prod.categoria ? prod.categoria.nombre : (prod.categoria || 'General')}
                        </span>
                        
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          prod.disponible
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {prod.disponible ? 'En Stock' : 'Agotado'}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-gray-900 mt-2 line-clamp-1" title={prod.nombre}>
                        {prod.nombre}
                      </h3>

                      <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                        {prod.descripcion || 'Artículo verificado en mostrador.'}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-gray-400 block uppercase font-bold">Precio</span>
                        <span className="text-lg font-black text-gray-900 tabular-nums">
                          ${prod.precio ? prod.precio.toLocaleString('es-AR') : 'Consultar'}
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedProd(prod);
                          setChatOpen(true);
                        }}
                        className="px-3.5 py-2 bg-[#38bdf8] hover:bg-[#0ea5e9] text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Consultar</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ==================== REVIEWS ACCORDION / SECTION ==================== */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-gray-900 tracking-tight">
                    Opiniones y Calificaciones de Vecinos
                  </h3>
                  <p className="text-xs text-gray-500">
                    Experiencias reales de compra y atención en esta vidriera
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/comercio/${comercio._id}/opiniones`}
                    className="px-3.5 py-1.5 bg-[#38bdf8] hover:bg-[#0ea5e9] text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>Ver Estadísticas & Opinar</span>
                  </Link>

                  <div className="flex items-center gap-1 text-sm font-bold text-amber-500 bg-amber-50 px-3 py-1 rounded-full">
                    <span>★</span>
                    <span>{comercio.calificacionPromedio ? comercio.calificacionPromedio.toFixed(1) : '4.8'}</span>
                  </div>
                </div>
              </div>

              {/* Write Review Form */}
              <form onSubmit={handleCrearResena} className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
                <span className="block text-xs font-bold text-gray-800">
                  ¿Compraste en este local? Dejá tu valoración:
                </span>
                
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNuevoPuntaje(star)}
                      onMouseEnter={() => setHoverStar(star)}
                      onMouseLeave={() => setHoverStar(0)}
                      className="p-0.5 cursor-pointer"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= (hoverStar || nuevoPuntaje)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-gray-700 ml-2">
                    {nuevoPuntaje} de 5 estrellas
                  </span>
                </div>

                <textarea
                  rows={2}
                  required
                  placeholder="Escribí sobre la atención, los precios y la calidad del producto..."
                  value={nuevoComentario}
                  onChange={(e) => setNuevoComentario(e.target.value)}
                  className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#38bdf8] resize-none"
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={enviandoResena || !nuevoComentario.trim()}
                    className="py-2 px-5 bg-[#38bdf8] hover:bg-[#0ea5e9] text-white disabled:opacity-50 text-xs font-bold rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <span>{enviandoResena ? 'Publicando...' : 'Publicar Reseña'}</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>

              {/* Reviews List */}
              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {resenas.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">Aún no hay opiniones cargadas para este comercio.</p>
                ) : (
                  resenas.map((r) => (
                    <div key={r._id} className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-900">{r.usuarioId?.nombre || 'Vecino'}</span>
                        <span className="text-amber-500 font-bold flex items-center gap-0.5">
                          <Star className="w-3 h-3 fill-current" />
                          <span>{r.puntaje}</span>
                        </span>
                      </div>

                      <p className="text-gray-600 italic leading-relaxed">"{r.comentario}"</p>

                      {r.respuestaComerciante && (
                        <div className="mt-2 pl-2.5 border-l-2 border-[#38bdf8] text-[11px] text-gray-600 bg-white p-2 rounded-r-lg">
                          <span className="text-[#0284c7] block font-bold">Respuesta del comercio:</span>
                          <span>{typeof r.respuestaComerciante === 'object' ? (r.respuestaComerciante as any)?.contenido : r.respuestaComerciante}</span>
                        </div>
                      )}

                      <div className="text-[10px] text-gray-400 pt-1">
                        {r.createdAt ? new Date(r.createdAt).toLocaleDateString('es-AR') : 'Reciente'}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* ==================== RIGHT COLUMN: UBICACIÓN & INFORMACIÓN (4 COLS) ==================== */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Ubicación & Mapa */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#38bdf8]" />
                <h3 className="text-base font-extrabold text-gray-900 tracking-tight">
                  Ubicación & Cercanía
                </h3>
              </div>

              <div>
                <p className="text-xs font-bold text-gray-900">{comercio.direccion || 'Ubicación céntrica'}</p>
                <p className="text-xs text-gray-500 mt-0.5">{comercio.zona || 'Comercio local'}</p>
              </div>

              {/* Interactive Map Preview */}
              {comercio.ubicacion?.coordinates && (
                <div className="w-full h-56 rounded-xl overflow-hidden border border-gray-200 shadow-xs">
                  <MapaComercios
                    comercios={mapStores}
                    centro={[comercio.ubicacion.coordinates[1], comercio.ubicacion.coordinates[0]]}
                    zoom={15}
                  />
                </div>
              )}

              {/* Google Maps Route Button */}
              {comercio.direccion && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${comercio.nombre}, ${comercio.direccion}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#38bdf8]" />
                  <span>Abrir en Google Maps</span>
                </a>
              )}
            </div>

            {/* Medios de Pago y Confianza */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-3.5">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#38bdf8]" />
                <h3 className="text-sm font-extrabold text-gray-900 tracking-tight">
                  Medios de Pago Aceptados
                </h3>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {(comercio.mediosDePago || ['Efectivo', 'Tarjeta de Débito', 'Transferencia Bancaria', 'QR']).map((medio) => (
                  <span
                    key={medio}
                    className="px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 font-medium flex items-center gap-1.5"
                  >
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span>{medio}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Datos Institucionales */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-3 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-[#38bdf8]" />
                <h3 className="text-sm font-extrabold text-gray-900 tracking-tight">
                  Compromiso de la Vidriera
                </h3>
              </div>

              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Precios transparentes y sin intermediarios abusivos.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Atención directa en mostrador o mediante WhatsApp.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Participación en el ranking vecinal de calidad.</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Realtime Chat Widget */}
      {chatOpen && comercio && (
        <ChatWidget
          comercioId={comercio._id}
          comercioNombre={comercio.nombre}
          comercioTelefono={comercio.contacto?.whatsapp || comercio.contacto?.telefono}
          productoNombre={selectedProd?.nombre}
          productoPrecio={selectedProd?.precio}
          isOpen={chatOpen}
          onClose={() => {
            setChatOpen(false);
            setSelectedProd(null);
          }}
        />
      )}

    </div>
  );
}
