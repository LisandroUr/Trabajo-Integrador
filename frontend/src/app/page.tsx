'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  TrendingDown, 
  MapPin, 
  Store, 
  MessageSquare, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  BarChart3, 
  Layers, 
  Users, 
  ArrowUpRight,
  DollarSign
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/ranking?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const quickSearches = ['Leche', 'Pan', 'Café', 'Harina', 'Aceite'];

  return (
    <div className="relative overflow-hidden pt-6 pb-24">
      {/* Background ambient decorative shapes */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[850px] h-[350px] bg-gradient-to-r from-indigo-600/15 via-cyan-500/10 to-purple-600/15 blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16">
        <div className="text-center max-w-4xl mx-auto">
          {/* Municipal Pill */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-white/10 shadow-lg text-xs font-bold text-slate-300 mb-6 backdrop-blur-md">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span className="text-indigo-300 font-extrabold uppercase tracking-wider text-[11px]">
              Observatorio Cívico Oficial
            </span>
            <span className="text-slate-600">•</span>
            <span>Bahía Blanca Abierta</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.08]">
            Compara precios locales.{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
              Defiende tu economía.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Plataforma municipal gratuita para relevar la canasta barrial, ubicar comercios de cercanía y consultar disponibilidad en tiempo real sin intermediarios ni comisiones.
          </p>

          {/* Instant Search Bar */}
          <form onSubmit={handleSearch} className="mt-10 max-w-2xl mx-auto relative group">
            <div className="relative flex items-center p-2 rounded-3xl bg-slate-900/90 border border-white/15 shadow-2xl shadow-indigo-950/50 backdrop-blur-xl transition-all focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/20">
              <div className="pl-4 text-slate-400">
                <Search className="w-5 h-5 text-indigo-400" />
              </div>
              <input
                type="text"
                placeholder="Busca un producto (ej. Leche Entera, Pan, Café, Harina)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center space-x-2 flex-shrink-0"
              >
                <span>Comparar</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Filter Tags */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
              <span className="text-slate-500 font-medium">Búsquedas frecuentes:</span>
              {quickSearches.map((item) => (
                <Link
                  key={item}
                  href={`/ranking?q=${encodeURIComponent(item)}`}
                  className="px-3 py-1 rounded-xl bg-white/5 hover:bg-indigo-500/15 border border-white/10 text-slate-300 hover:text-indigo-300 text-xs font-semibold transition-colors"
                >
                  {item}
                </Link>
              ))}
            </div>
          </form>
        </div>

        {/* Live Discrepancy Preview Card */}
        <div className="mt-16 max-w-4xl mx-auto rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-white/10 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                Observatorio en Directo
              </span>
              <h3 className="text-lg font-bold text-white mt-1">Dispersión de Precios en Bahía Blanca</h3>
              <p className="text-xs text-slate-400">Relevamiento sobre productos idénticos en comercios habilitados</p>
            </div>
            <Link
              href="/ranking"
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors group"
            >
              <span>Ver todas las comparativas</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-emerald-500/30 transition-all">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-slate-400">Leche Entera 1L</span>
                <span className="text-[11px] font-black text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-md">
                  Ahorro 18%
                </span>
              </div>
              <p className="text-2xl font-black text-white mt-2 tabular-nums">$1.150</p>
              <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Panadería La Espiga</span>
                <span className="text-slate-500 line-through">$1.400</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-emerald-500/30 transition-all">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-slate-400">Pan Francés 1kg</span>
                <span className="text-[11px] font-black text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-md">
                  Ahorro 21%
                </span>
              </div>
              <p className="text-2xl font-black text-white mt-2 tabular-nums">$1.100</p>
              <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Panadería del Sol</span>
                <span className="text-slate-500 line-through">$1.400</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-emerald-500/30 transition-all">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-slate-400">Aceite Girasol 900ml</span>
                <span className="text-[11px] font-black text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-md">
                  Ahorro 15%
                </span>
              </div>
              <p className="text-2xl font-black text-white mt-2 tabular-nums">$1.450</p>
              <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Almacén Don Mario</span>
                <span className="text-slate-500 line-through">$1.700</span>
              </div>
            </div>
          </div>
        </div>

        {/* Statistical Ticker */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/5 text-center">
            <p className="text-3xl font-black text-indigo-400 tabular-nums">5+</p>
            <p className="text-xs font-semibold text-slate-400 mt-1">Comercios Auditados</p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/5 text-center">
            <p className="text-3xl font-black text-emerald-400 tabular-nums">18.3%</p>
            <p className="text-xs font-semibold text-slate-400 mt-1">Ahorro Promedio Vecinal</p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/5 text-center">
            <p className="text-3xl font-black text-cyan-400 tabular-nums">&lt; 10 cuadras</p>
            <p className="text-xs font-semibold text-slate-400 mt-1">Radio de Cercanía</p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/5 text-center">
            <p className="text-3xl font-black text-purple-400 tabular-nums">0%</p>
            <p className="text-xs font-semibold text-slate-400 mt-1">Comisiones al Comerciante</p>
          </div>
        </div>

        {/* Core Pillars */}
        <div className="mt-24 max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Herramientas de Soberanía Comercial
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Una plataforma integral diseñada para resolver las asimetrías de información barriales.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="p-8 rounded-3xl bg-slate-900/70 border border-white/10 hover:border-indigo-500/40 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Observatorio de Precios</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Algoritmo estadístico que compara la canasta en tiempo real, calculando el precio mínimo, promedio y el porcentaje exacto de ahorro en pesos.
                </p>
              </div>
              <div className="mt-6 pt-6 border-t border-white/5">
                <Link href="/ranking" className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1">
                  <span>Explorar observatorio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Card 2 */}
            <div className="p-8 rounded-3xl bg-slate-900/70 border border-white/10 hover:border-cyan-500/40 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <MapPin className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Geolocalización Inmediata</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Cartografía interactiva basada en OpenStreetMap con cálculo de distancia geoespacial nativa para priorizar el compre de barrio y a pie.
                </p>
              </div>
              <div className="mt-6 pt-6 border-t border-white/5">
                <Link href="/mapa" className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1">
                  <span>Abrir mapa de Bahía Blanca</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Card 3 */}
            <div className="p-8 rounded-3xl bg-slate-900/70 border border-white/10 hover:border-emerald-500/40 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Mensajería en Vivo</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Conexión directa vía WebSockets entre vecinos y comerciantes para consultar stock, horarios o encargos sin compartir teléfonos personales.
                </p>
              </div>
              <div className="mt-6 pt-6 border-t border-white/5">
                <Link href="/buscar" className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1">
                  <span>Contactar comercios</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Merchant Callout Banner */}
        <div className="mt-24 max-w-5xl mx-auto rounded-3xl bg-gradient-to-r from-indigo-900/50 via-slate-900 to-cyan-950/40 border border-indigo-500/30 p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl">
          <div className="max-w-2xl mx-auto space-y-4">
            <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-xs font-bold uppercase tracking-wider">
              Para Comercios & Emprendedores
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white">
              Suma tu negocio a la vidriera municipal
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Obtén visibilidad directa frente a miles de vecinos de Bahía Blanca. Publica tu catálogo, actualiza precios y recibe consultas sin pagar comisiones.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/registro"
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2"
              >
                <span>Solicitar Habilitación Digital</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 font-bold text-xs transition-all"
              >
                Ya tengo cuenta
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
