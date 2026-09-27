'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Star, 
  MapPin, 
  X, 
  Phone, 
  MessageSquare, 
  Check, 
  Store,
  Share2,
  ExternalLink,
  ShieldCheck,
  Clock,
  AlertCircle
} from 'lucide-react';
import { fetchAPI } from '@/lib/api';

interface RankingItem {
  id: string;
  title: string;
  price: string;
  rawPrice: number;
  location: string;
  rating: number;
  reviewCount: number | string;
  rank: number;
  image: string;
  freeShipping: boolean;
  category: string;
  description: string;
  provider: string;
  comercioId: string;
  phone?: string;
  type: 'producto' | 'servicio';
  verificado: boolean;
  estado: string;
}

interface CategoriaItem {
  _id: string;
  nombre: string;
  icono?: string;
}

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'productos' | 'servicios'>('productos');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filterUbicacion, setFilterUbicacion] = useState(false);
  const [filterRating4Plus, setFilterRating4Plus] = useState(false);
  const [selectedItem, setSelectedItem] = useState<RankingItem | null>(null);

  // Dynamic state from Backend MongoDB
  const [items, setItems] = useState<RankingItem[]>([]);
  const [categorias, setCategorias] = useState<CategoriaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'servicios') {
      setActiveTab('servicios');
    } else if (tabParam === 'productos') {
      setActiveTab('productos');
    }
  }, [searchParams]);

  // Load Real Data from Backend API
  useEffect(() => {
    const loadRealData = async () => {
      setLoading(true);
      setError(null);
      try {
        const queryParam = searchParams.get('q') || '';
        const tipoQuery = activeTab === 'productos' ? 'producto' : 'servicio';
        
        const [rankingRes, categoriasRes] = await Promise.all([
          fetchAPI(`/productos/ranking?tipo=${tipoQuery}${queryParam ? `&q=${encodeURIComponent(queryParam)}` : ''}`),
          fetchAPI('/categorias')
        ]);

        if (categoriasRes && Array.isArray(categoriasRes)) {
          setCategorias(categoriasRes);
        }

        const rawList = rankingRes.productos || [];
        const mappedItems: RankingItem[] = rawList.map((p: any, index: number) => {
          const com = p.comercioId || {};
          const isVerif = com.verificado === true || com.estado === 'aprobado';
          const catName = p.categoria && typeof p.categoria === 'object' ? p.categoria.nombre : (p.categoria || 'General');
          
          return {
            id: p._id,
            title: p.nombre,
            price: `$${p.precio.toLocaleString('es-AR')}`,
            rawPrice: p.precio,
            location: com.direccion ? com.direccion.split(',').slice(-2).join(',').trim() || com.direccion : 'CABA',
            rating: com.calificacionPromedio || 4.8,
            reviewCount: com.cantidadResenas || 10,
            rank: index + 1,
            image: p.imagen || '/placeholder.webp',
            freeShipping: true,
            category: catName,
            description: p.descripcion || '',
            provider: com.nombre || 'Comercio Registrado',
            comercioId: com._id || com.id,
            phone: com.contacto?.whatsapp || com.contacto?.telefono,
            type: p.tipo || 'producto',
            verificado: isVerif,
            estado: com.estado || 'pendiente'
          };
        });

        setItems(mappedItems);
      } catch (err: any) {
        console.error('Error cargando datos reales:', err);
        setError('No se pudo conectar con el servidor. Verifica que el backend esté en ejecución.');
      } finally {
        setLoading(false);
      }
    };

    loadRealData();
  }, [activeTab, searchParams]);

  // Only display categories that actually contain items in the current active tab
  const activeCategories = useMemo(() => {
    const catsInItems = new Set(items.map(it => it.category.toLowerCase().trim()));
    return categorias.filter(c => catsInItems.has(c.nombre.toLowerCase().trim()));
  }, [items, categorias]);

  const filteredItems = items.filter(item => {
    if (selectedCategory) {
      if (item.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }
    }
    // Fix 13: umbral coherente con el nombre del filtro (4.0+ en lugar de 4.8)
    if (filterRating4Plus && item.rating < 4.0) {
      return false;
    }
    // Fix 14: buscar términos de Bahía Blanca, no de CABA
    if (filterUbicacion && !item.location.toLowerCase().includes('bahia') && !item.location.toLowerCase().includes('bahía') && !item.location.toLowerCase().includes('blanca')) {
      return false;
    }
    return true;
  });

  return (
    <div className="w-full min-h-[calc(100vh-120px)] select-none">
      
      {/* Centered Page Heading */}
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-4">
        <h1 className="text-2xl sm:text-[34px] font-extrabold text-[#0f172a] text-center tracking-tight leading-tight">
          Encontrá lo mejor en tu ciudad y más
        </h1>
      </div>

      {/* Two Large Toggle Buttons: [ PRODUCTOS ] and [ SERVICIOS ] */}
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 mb-6 sm:mb-8">
        <div className="grid grid-cols-2 gap-3 sm:gap-6 max-w-3xl mx-auto">
          {/* PRODUCTOS BUTTON */}
          <button
            onClick={() => {
              setActiveTab('productos');
              setSelectedCategory(null);
            }}
            className={`w-full py-3 sm:py-3.5 px-4 sm:px-8 rounded-xl font-bold text-sm sm:text-base tracking-wider transition-all duration-150 cursor-pointer shadow-xs text-center uppercase ${
              activeTab === 'productos'
                ? 'bg-[#38bdf8] text-white shadow-sm'
                : 'bg-white border-2 border-[#38bdf8] text-[#38bdf8] hover:bg-[#38bdf8]/10'
            }`}
          >
            [ PRODUCTOS ]
          </button>

          {/* SERVICIOS BUTTON */}
          <button
            onClick={() => {
              setActiveTab('servicios');
              setSelectedCategory(null);
            }}
            className={`w-full py-3 sm:py-3.5 px-4 sm:px-8 rounded-xl font-bold text-sm sm:text-base tracking-wider transition-all duration-150 cursor-pointer shadow-xs text-center uppercase ${
              activeTab === 'servicios'
                ? 'bg-[#38bdf8] text-white shadow-sm'
                : 'bg-white border-2 border-[#38bdf8] text-[#38bdf8] hover:bg-[#38bdf8]/10'
            }`}
          >
            [ SERVICIOS ]
          </button>
        </div>
      </div>

      {/* Main Grid: Sidebar (Left) + Ranking Cards (Right) */}
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT SIDEBAR: Categorías & Filtros */}
          <aside className="lg:col-span-3 xl:col-span-2 space-y-6 pt-1">
            {/* Categorías Reales desde MongoDB */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-gray-900 text-base">
                  Categorías
                </h3>
                {selectedCategory && (
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="text-xs text-[#0284c7] hover:underline font-semibold cursor-pointer"
                  >
                    Limpiar
                  </button>
                )}
              </div>
              <ul className="space-y-1 text-sm">
                {activeCategories.map((cat) => {
                  const isSelected = selectedCategory === cat.nombre;
                  const count = items.filter(it => it.category.toLowerCase() === cat.nombre.toLowerCase()).length;
                  return (
                    <li key={cat._id}>
                      <button
                        onClick={() => setSelectedCategory(isSelected ? null : cat.nombre)}
                        className={`text-left w-full py-1.5 px-2.5 rounded-xl transition-colors cursor-pointer flex items-center justify-between ${
                          isSelected 
                            ? 'bg-[#38bdf8]/15 text-[#0284c7] font-bold' 
                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                      >
                        <span className="truncate">{cat.nombre}</span>
                        <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{count}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Filtros */}
            <div>
              <h3 className="font-bold text-gray-900 text-base mb-2.5">
                Filtros
              </h3>
              <div className="space-y-2 text-sm text-gray-800">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={filterUbicacion}
                    onChange={(e) => setFilterUbicacion(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-[#38bdf8] focus:ring-[#38bdf8] cursor-pointer"
                  />
                  <span>Ubicación (CABA)</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={filterRating4Plus}
                    onChange={(e) => setFilterRating4Plus(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-[#38bdf8] focus:ring-[#38bdf8] cursor-pointer"
                  />
                  <span className="flex items-center gap-1">
                    Calificación <span className="text-amber-400">★</span> 4.0+
                  </span>
                </label>
              </div>
            </div>
          </aside>

          {/* RIGHT SECTION: Header + 4-Column Cards */}
          <section className="lg:col-span-9 xl:col-span-10">
            {/* Section Title */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 text-base sm:text-lg tracking-wide uppercase">
                {activeTab === 'productos' 
                  ? 'RANKING DE LOS MEJORES LUGARES (PRODUCTOS)' 
                  : 'RANKING DE LOS MEJORES LUGARES (SERVICIOS)'}
              </h2>
              <span className="text-xs text-gray-500 font-medium">
                {filteredItems.length} {activeTab === 'productos' ? 'productos' : 'servicios'} disponibles
              </span>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="min-h-[300px] flex flex-col items-center justify-center text-gray-400 gap-3">
                <div className="w-8 h-8 border-3 border-[#38bdf8] border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm font-medium">Cargando ranking de precios real...</span>
              </div>
            )}

            {/* Error State */}
            {!loading && error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl text-center">
                <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <p className="font-semibold text-sm">{error}</p>
              </div>
            )}

            {/* Cards Grid */}
            {!loading && !error && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl p-4 shadow-xs border border-gray-100 flex flex-col justify-between relative hover:shadow-md transition-shadow duration-200"
                  >
                    {/* Floating Rating Pill in Top-Right */}
                    <div className="absolute top-3.5 right-3.5 bg-white/95 backdrop-blur-xs px-2.5 py-0.5 rounded-full shadow-xs border border-gray-100 flex items-center gap-1 text-xs font-bold text-gray-900 z-10">
                      <span className="text-amber-400">★</span>
                      <span>{item.rating.toFixed(1)}</span>
                    </div>

                    <div>
                      {/* Image */}
                      <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 relative">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      {/* Price */}
                      <div className="text-xl font-bold text-gray-900 mt-3">
                        {item.price}
                      </div>

                      {/* Title */}
                      <h3 className="font-medium text-sm text-gray-900 line-clamp-1 mt-0.5" title={item.title}>
                        {item.title}
                      </h3>

                      {/* Store Vidriera Link + Badge Verificado / Pendiente */}
                      <div className="mt-1 flex items-center justify-between gap-1">
                        <Link
                          href={`/comercio/${item.comercioId}`}
                          className="text-xs text-[#0284c7] hover:underline flex items-center gap-1 font-medium group truncate"
                          title={`Ver vidriera de ${item.provider}`}
                        >
                          <Store className="w-3.5 h-3.5 flex-shrink-0 text-[#38bdf8] group-hover:scale-110 transition-transform" />
                          <span className="truncate">{item.provider}</span>
                        </Link>
                      </div>

                      {/* Badges: Verificado (Verde) vs Pendiente (Ámbar) */}
                      <div className="mt-1">
                        {item.verificado ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            <span>Verificado</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>Sin verificar</span>
                          </span>
                        )}
                      </div>

                      {/* Location */}
                      <div className="text-xs text-gray-500 mt-1">
                        {item.location}
                      </div>

                      {/* Free shipping / service badge */}
                      <div className="text-xs font-semibold text-emerald-600 flex items-center gap-1 mt-1">
                        <span>✓</span>
                        <span>{item.type === 'servicio' ? 'Presupuesto Online' : 'Envío Gratis'}</span>
                      </div>

                      {/* Rating rank subtext */}
                      <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <span className="text-amber-400">★</span>
                        <span>{item.rating.toFixed(1)} ({item.reviewCount}) - {item.rank}°</span>
                      </div>
                    </div>

                    {/* Ver Detalles Button */}
                    <button
                      onClick={() => setSelectedItem(item)}
                      className="w-full mt-3 py-2 px-4 bg-[#38bdf8] hover:bg-[#0ea5e9] text-white font-medium text-sm rounded-xl transition-colors cursor-pointer text-center shadow-xs"
                    >
                      Ver detalles
                    </button>
                  </div>
                ))}
              </div>
            )}

            {!loading && !error && filteredItems.length === 0 && (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
                <p className="text-gray-600 font-medium text-base">
                  No se encontraron {activeTab} con los filtros seleccionados.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setFilterUbicacion(false);
                    setFilterRating4Plus(false);
                  }}
                  className="mt-3 px-4 py-2 bg-[#38bdf8] text-white rounded-lg text-sm font-semibold cursor-pointer"
                >
                  Restablecer filtros
                </button>
              </div>
            )}
          </section>

        </div>
      </div>

      {/* Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative border border-gray-100">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1 cursor-pointer rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex gap-4 items-start">
              <div className="w-28 h-28 rounded-xl bg-gray-50 overflow-hidden flex-shrink-0 flex items-center justify-center p-2">
                <img
                  src={selectedItem.image}
                  alt={selectedItem.title}
                  className="w-full h-full object-contain mix-blend-multiply"
                />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-1 text-xs font-bold text-amber-500 mb-1">
                  <span>★</span>
                  <span>{selectedItem.rating.toFixed(1)}</span>
                  <span className="text-gray-400 font-normal">({selectedItem.reviewCount} opiniones)</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 leading-tight">
                  {selectedItem.title}
                </h3>
                <div className="text-2xl font-black text-gray-900 mt-1">
                  {selectedItem.price}
                </div>
                <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#38bdf8]" />
                  <span>{selectedItem.location}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-600">
              <p className="leading-relaxed">{selectedItem.description}</p>
            </div>

            {/* Store Information Card with Verification Status */}
            <div className="mt-4 p-3.5 bg-gray-50 rounded-xl flex items-center justify-between text-xs border border-gray-100">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-[#38bdf8]" />
                <span className="font-bold text-gray-900">{selectedItem.provider}</span>
              </div>
              
              {selectedItem.verificado ? (
                <span className="text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Vidriera Oficial Verificada</span>
                </span>
              ) : (
                <span className="text-amber-800 font-semibold flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Pendiente de Verificación</span>
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-5 flex flex-col sm:flex-row gap-2.5">
              <Link
                href={`/comercio/${selectedItem.comercioId}`}
                className="flex-1 py-2.5 px-4 bg-[#38bdf8] hover:bg-[#0ea5e9] text-white font-semibold text-xs sm:text-sm rounded-xl text-center flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <Store className="w-4 h-4" />
                <span>Ver Vidriera Completa</span>
              </Link>

              {selectedItem.phone && (
                <a
                  href={`https://wa.me/${selectedItem.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-4 bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold text-xs sm:text-sm rounded-xl text-center flex items-center justify-center gap-2 transition-colors shadow-xs"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>WhatsApp</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-400">Cargando...</div>}>
      <HomeContent />
    </Suspense>
  );
}
