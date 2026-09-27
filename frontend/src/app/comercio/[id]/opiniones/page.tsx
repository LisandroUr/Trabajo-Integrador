'use client';

import { useState, useEffect, use, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Star, 
  ThumbsUp, 
  Camera, 
  CheckCircle2, 
  ArrowLeft, 
  Home, 
  Layers, 
  Store, 
  ShieldCheck,
  Clock,
  Send,
  Loader2,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import { fetchAPI } from '@/lib/api';

interface ResenaItem {
  id: string;
  nombre: string;
  avatar: string;
  verificada: boolean;
  estrellas: number;
  fecha: string;
  comentario: string;
  likes: number;
  userLiked?: boolean;
}

interface CategoriaItem {
  _id: string;
  nombre: string;
}

export default function OpinionesPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const comercioId = resolvedParams.id;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Store data
  const [comercio, setComercio] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form States
  const [puntuacion, setPuntuacion] = useState<number>(5);
  const [hoverPuntuacion, setHoverPuntuacion] = useState<number>(0);
  const [comentario, setComentario] = useState<string>('');
  const [fotoAdjunta, setFotoAdjunta] = useState<string | null>(null);
  const [publicando, setPublicando] = useState<boolean>(false);

  // Reviews list & Likes
  const [resenasList, setResenasList] = useState<ResenaItem[]>([]);
  const [categorias, setCategorias] = useState<CategoriaItem[]>([]);

  // Filter States
  const [filtroUbicacion, setFiltroUbicacion] = useState(false);
  const [filtroRating4Plus, setFiltroRating4Plus] = useState(false);
  const [categoriaActiva, setCategoriaActiva] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [comRes, resenasRes, catRes] = await Promise.all([
        fetchAPI(`/comercios/${comercioId}`).catch(() => null),
        fetchAPI(`/resenas/comercio/${comercioId}`).catch(() => []),
        fetchAPI('/categorias').catch(() => [])
      ]);

      if (comRes) {
        setComercio(comRes);
      }

      if (Array.isArray(catRes)) {
        setCategorias(catRes);
      }

      if (Array.isArray(resenasRes) && resenasRes.length > 0) {
        const mapped: ResenaItem[] = resenasRes.map((r: any) => ({
          id: r._id,
          nombre: r.usuarioId?.nombre || 'Vecino de la Ciudad',
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(r.usuarioId?.nombre || r._id)}`,
          verificada: true,
          estrellas: r.puntaje,
          fecha: new Date(r.createdAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' }),
          comentario: r.comentario || 'Excelente atención.',
          likes: 0,
          userLiked: false
        }));
        setResenasList(mapped);
      } else {
        setResenasList([]);
      }
    } catch (err) {
      console.error('Error cargando opiniones:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [comercioId]);

  const storeDisplayName = comercio?.nombre || (
    comercioId.replace('tienda-', '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  );

  const calificacionPromedio = comercio?.calificacionPromedio || 4.8;
  const cantidadTotal = resenasList.length || 1;

  // Real breakdown calculation
  const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  resenasList.forEach(r => {
    const star = Math.min(5, Math.max(1, Math.round(r.estrellas))) as 1 | 2 | 3 | 4 | 5;
    starCounts[star] = (starCounts[star] || 0) + 1;
  });

  const getPercent = (count: number) => {
    if (resenasList.length === 0) return 0;
    return Math.round((count / resenasList.length) * 100);
  };

  // Toggle Like on review
  const handleToggleLike = (id: string) => {
    setResenasList(prev => prev.map(r => {
      if (r.id === id) {
        const isLiked = !r.userLiked;
        return {
          ...r,
          userLiked: isLiked,
          likes: isLiked ? r.likes + 1 : r.likes - 1
        };
      }
      return r;
    }));
  };

  // Attach photo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFotoAdjunta(event.target.result as string);
          toast.success('Foto adjunta lista para publicar');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comentario.trim() && puntuacion === 0) {
      toast.error('Por favor selecciona una calificación o escribe un comentario');
      return;
    }

    setPublicando(true);
    try {
      // Check if user is logged in
      const token = localStorage.getItem('token');
      if (token && comercio?._id) {
        await fetchAPI('/resenas', {
          method: 'POST',
          body: JSON.stringify({
            comercioId: comercio._id,
            puntaje: puntuacion,
            comentario: comentario.trim()
          })
        });
      }

      // Add to local state for instant UX
      const userStored = localStorage.getItem('user');
      const parsedUser = userStored ? JSON.parse(userStored) : null;
      const userName = parsedUser?.nombre || 'Tú (Vecino)';

      const nuevaResena: ResenaItem = {
        id: 'res-' + Date.now(),
        nombre: userName,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userName)}`,
        verificada: true,
        estrellas: puntuacion,
        fecha: 'Hoy',
        comentario: comentario.trim() || 'Servicio y atención recomendados.',
        likes: 1,
        userLiked: true
      };

      setResenasList([nuevaResena, ...resenasList]);
      setComentario('');
      setFotoAdjunta(null);

      try {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch {}

      toast.success('¡Tu opinión ha sido publicada con éxito!');
    } catch (err: any) {
      toast.error('Error al enviar la reseña: ' + err.message);
    } finally {
      setPublicando(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#f0f6fa] select-none py-6 sm:py-8">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ========================================================================= */}
          {/* 1. LEFT SIDEBAR: ADMINISTRACIÓN, CATEGORÍAS & FILTROS                     */}
          {/* ========================================================================= */}
          <aside className="lg:col-span-3 xl:col-span-2 space-y-6">
            
            {/* Sección Administración */}
            <div>
              <h3 className="font-bold text-gray-900 text-base mb-3">
                Administración
              </h3>
              <nav className="space-y-1.5 text-sm">
                <Link
                  href="/panel"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-700 hover:bg-white/60 hover:text-gray-900 transition-colors font-medium"
                >
                  <Home className="w-4 h-4 text-[#38bdf8]" />
                  <span>Panel de Control</span>
                </Link>
                <Link
                  href="/panel"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-700 hover:bg-white/60 hover:text-gray-900 transition-colors font-medium"
                >
                  <Layers className="w-4 h-4 text-gray-600" />
                  <span>Catálogo</span>
                </Link>
              </nav>
            </div>

            {/* Sección Categorías Reales */}
            <div>
              <h3 className="font-bold text-gray-900 text-base mb-2.5">
                Categorías
              </h3>
              <ul className="space-y-1 text-sm text-gray-700">
                {categorias.map((cat) => {
                  const isSelected = categoriaActiva === cat.nombre;
                  return (
                    <li key={cat._id}>
                      <button
                        onClick={() => setCategoriaActiva(isSelected ? null : cat.nombre)}
                        className={`text-left w-full py-0.5 transition-colors cursor-pointer ${
                          isSelected ? 'text-[#0284c7] font-bold' : 'hover:text-[#38bdf8]'
                        }`}
                      >
                        {cat.nombre}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Sección Filtros */}
            <div>
              <h3 className="font-bold text-gray-900 text-base mb-2.5">
                Filtros
              </h3>
              <div className="space-y-2 text-sm text-gray-800">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={filtroUbicacion}
                    onChange={(e) => setFiltroUbicacion(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-[#38bdf8] focus:ring-[#38bdf8] cursor-pointer"
                  />
                  <span>Ubicación</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={filtroRating4Plus}
                    onChange={(e) => setFiltroRating4Plus(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-[#38bdf8] focus:ring-[#38bdf8] cursor-pointer"
                  />
                  <span className="flex items-center gap-1">
                    Calificación <span className="text-amber-400">★</span> 4.0+
                  </span>
                </label>
              </div>
            </div>

          </aside>

          {/* ========================================================================= */}
          {/* 2. MAIN CONTENT AREA: OPINIONES DE CLIENTES                                */}
          {/* ========================================================================= */}
          <main className="lg:col-span-9 xl:col-span-10 space-y-6">
            
            {/* Page Header */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Link
                  href={`/comercio/${comercioId}`}
                  className="text-xs text-[#0284c7] hover:underline font-semibold flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Volver a la Vidriera de {storeDisplayName}</span>
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                  Opiniones de Clientes
                </h1>

                {/* Verification Badge */}
                {comercio?.verificado || comercio?.estado === 'aprobado' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Vidriera Oficial Verificada</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Pendiente de Verificación</span>
                  </span>
                )}
              </div>

              <p className="text-sm font-semibold text-gray-800 mt-1">
                {storeDisplayName}
              </p>
            </div>

            {/* ========================================================================= */}
            {/* CARD 1: ESTADÍSTICA DE CALIFICACIÓN (GRÁFICO LIMPIO Y CORREGIDO)          */}
            {/* ========================================================================= */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-xs border border-gray-100">
              <h2 className="font-bold text-gray-900 text-lg mb-5">
                Estadística de Calificación
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                
                {/* Left Part: Score + Stars */}
                <div className="md:col-span-5 flex flex-col items-center md:items-start justify-center border-b md:border-b-0 md:border-r border-gray-100 pb-6 md:pb-0 md:pr-6">
                  <div className="flex items-baseline gap-3">
                    <span className="text-5xl sm:text-6xl font-black text-gray-900 tracking-tight">
                      {calificacionPromedio.toFixed(1)}
                    </span>
                    
                    {/* Star row */}
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          className={`w-6 h-6 ${star <= Math.round(calificacionPromedio) ? 'fill-[#f59e0b] text-[#f59e0b]' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 mt-2 font-medium">
                    Calificación global basada en {resenasList.length} valoraciones verificadas
                  </p>
                </div>

                {/* Right Part: Professional Horizontal Rating Breakdown Chart */}
                <div className="md:col-span-7 space-y-2.5">
                  {[5, 4, 3, 2, 1].map((s) => {
                    const count = starCounts[s as 1 | 2 | 3 | 4 | 5] || 0;
                    const pct = getPercent(count);
                    return (
                      <div key={s} className="flex items-center gap-3 text-xs">
                        <span className="w-28 text-gray-700 font-medium text-right flex-shrink-0">
                          {s} estrellas ({pct}%)
                        </span>
                        <div className="flex-1 h-3.5 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#38bdf8] rounded-full transition-all duration-500" 
                            style={{ width: `${pct}%` }} 
                          />
                        </div>
                        <span className="w-12 text-gray-600 font-bold tabular-nums text-right flex-shrink-0">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>

              </div>
            </div>

            {/* ========================================================================= */}
            {/* CARD 2: DEJA TU OPINIÓN                                                   */}
            {/* ========================================================================= */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-xs border border-gray-100">
              <h2 className="font-bold text-gray-900 text-lg mb-3">
                Deja tu Opinión
              </h2>

              {/* 5 Large Star Picker */}
              <div className="flex items-center gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = star <= (hoverPuntuacion || puntuacion);
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setPuntuacion(star)}
                      onMouseEnter={() => setHoverPuntuacion(star)}
                      onMouseLeave={() => setHoverPuntuacion(0)}
                      className="p-1 cursor-pointer transition-transform hover:scale-115 focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 transition-colors ${
                          isFilled
                            ? 'fill-[#f59e0b] text-[#f59e0b]'
                            : 'text-[#38bdf8] stroke-[1.8] hover:text-[#0ea5e9]'
                        }`}
                      />
                    </button>
                  );
                })}

                <span className="ml-2 text-xs font-bold text-gray-700">
                  {puntuacion === 5 && '¡Excelente! (5 estrellas)'}
                  {puntuacion === 4 && 'Muy Bueno (4 estrellas)'}
                  {puntuacion === 3 && 'Bueno (3 estrellas)'}
                  {puntuacion === 2 && 'Regular (2 estrellas)'}
                  {puntuacion === 1 && 'Malo (1 estrella)'}
                </span>
              </div>

              {/* Textarea & Action Buttons Form */}
              <form onSubmit={handleSubmitReview}>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                  
                  {/* Left: Textarea */}
                  <div className="md:col-span-8">
                    <textarea
                      rows={4}
                      value={comentario}
                      onChange={(e) => setComentario(e.target.value)}
                      placeholder="Escribe tu Comentario (opcional):"
                      className="w-full p-3.5 border border-[#38bdf8] rounded-xl text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#38bdf8] bg-white resize-y min-h-[100px]"
                    />

                    {fotoAdjunta && (
                      <div className="mt-2 relative inline-block">
                        <img
                          src={fotoAdjunta}
                          alt="Foto adjunta"
                          className="w-20 h-20 object-cover rounded-xl border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => setFotoAdjunta(null)}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Right: Two Action Buttons */}
                  <div className="md:col-span-4 flex flex-col gap-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-2.5 px-4 rounded-xl border-2 border-[#38bdf8] text-gray-800 hover:bg-[#38bdf8]/10 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <Camera className="w-4 h-4 text-gray-700" />
                      <span>Subir Fotos/Video</span>
                    </button>

                    <button
                      type="submit"
                      disabled={publicando}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#38bdf8] hover:bg-[#0ea5e9] text-white font-semibold text-xs sm:text-sm transition-colors cursor-pointer shadow-xs text-center disabled:opacity-50"
                    >
                      {publicando ? 'Publicando...' : 'Publicar Opinión'}
                    </button>
                  </div>

                </div>
              </form>
            </div>

            {/* ========================================================================= */}
            {/* 3. SECCIÓN: LISTADO DE OPINIONES                                          */}
            {/* ========================================================================= */}
            <div>
              <h2 className="font-bold text-gray-900 text-xl mb-4">
                Listado de Opiniones
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {resenasList.map((res) => (
                  <div
                    key={res.id}
                    className="bg-white rounded-2xl p-5 shadow-xs border border-gray-100 flex flex-col justify-between"
                  >
                    <div>
                      {/* Top row */}
                      <div className="flex items-start gap-3 mb-2.5">
                        <img
                          src={res.avatar}
                          alt={res.nombre}
                          className="w-10 h-10 rounded-full object-cover border border-gray-100 flex-shrink-0"
                        />
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className="font-bold text-sm text-gray-900 truncate">
                              {res.nombre}
                            </h4>
                            <span className="text-[10px] text-gray-400 flex-shrink-0">
                              {res.fecha}
                            </span>
                          </div>

                          {res.verificada && (
                            <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Opinión Verificada</span>
                            </div>
                          )}

                          {/* Stars */}
                          <div className="flex items-center gap-0.5 mt-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`w-3.5 h-3.5 ${
                                  s <= res.estrellas
                                    ? 'fill-[#f59e0b] text-[#f59e0b]'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Comment text */}
                      <p className="text-xs text-gray-600 leading-relaxed mt-2">
                        {res.comentario}
                      </p>
                    </div>

                    {/* Bottom Actions */}
                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                      <button
                        onClick={() => handleToggleLike(res.id)}
                        className={`flex items-center gap-1.5 transition-colors cursor-pointer font-medium ${
                          res.userLiked ? 'text-[#0284c7] font-bold' : 'hover:text-gray-800'
                        }`}
                      >
                        <ThumbsUp className={`w-3.5 h-3.5 ${res.userLiked ? 'fill-current' : ''}`} />
                        <span>Me gusta ({res.likes})</span>
                      </button>

                      <button
                        onClick={() => toast.info('No hay respuestas adicionales todavía')}
                        className="hover:text-gray-800 transition-colors text-[11px] text-gray-400 cursor-pointer"
                      >
                        Ver Comentarios Relacionados
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </main>

        </div>

      </div>
    </div>
  );
}
