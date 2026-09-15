'use client';

import { useState, useEffect, useMemo } from 'react';
import { fetchAPI } from '@/lib/api';
import Link from 'next/link';
import { 
  BarChart3, 
  TrendingDown, 
  Search, 
  Store, 
  ArrowUpRight, 
  Filter, 
  ArrowUpDown,
  DollarSign,
  Award,
  Sparkles,
  PieChart as PieChartIcon,
  ChevronRight
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface ItemRanking {
  nombre: string;
  categoria: string;
  precioMin: number;
  precioMax: number;
  precioPromedio: number;
  ahorroPorcentaje: number;
  mejorComercio: {
    _id: string;
    nombre: string;
    direccion?: string;
  };
  comerciosTotal: number;
  todosPrecios: Array<{
    comercioId: string;
    nombreComercio: string;
    precio: number;
    disponible: boolean;
  }>;
}

export default function RankingPage() {
  const [ranking, setRanking] = useState<ItemRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState('todas');
  const [sortBy, setSortBy] = useState<'ahorro' | 'precio' | 'nombre'>('ahorro');
  const [viewMode, setViewMode] = useState<'cards' | 'chart'>('cards');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q) setSearchTerm(q);

    const loadRanking = async () => {
      try {
        const data = await fetchAPI('/productos/ranking');
        setRanking(data || []);
      } catch (err: any) {
        setError(err.message || 'Error cargando datos del observatorio de precios');
      } finally {
        setLoading(false);
      }
    };

    loadRanking();
  }, []);

  const categorias = useMemo(() => {
    const setCat = new Set<string>();
    ranking.forEach((r) => {
      if (r.categoria) setCat.add(r.categoria);
    });
    return Array.from(setCat);
  }, [ranking]);

  const filteredItems = useMemo(() => {
    return ranking
      .filter((item) => {
        const matchesName = item.nombre.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCat = selectedCategoria === 'todas' || item.categoria === selectedCategoria;
        return matchesName && matchesCat;
      })
      .sort((a, b) => {
        if (sortBy === 'ahorro') return b.ahorroPorcentaje - a.ahorroPorcentaje;
        if (sortBy === 'precio') return a.precioMin - b.precioMin;
        return a.nombre.localeCompare(b.nombre);
      });
  }, [ranking, searchTerm, selectedCategoria, sortBy]);

  // Chart data preparation
  const chartData = useMemo(() => {
    return filteredItems.slice(0, 8).map((item) => ({
      name: item.nombre.length > 14 ? item.nombre.slice(0, 14) + '...' : item.nombre,
      'Precio Mínimo': item.precioMin,
      'Precio Promedio': Math.round(item.precioPromedio),
      'Precio Máximo': item.precioMax,
    }));
  }, [filteredItems]);

  const maxAhorro = useMemo(() => {
    if (ranking.length === 0) return 0;
    return Math.max(...ranking.map((r) => r.ahorroPorcentaje));
  }, [ranking]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-white/10 p-8 sm:p-12 mb-10 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-4">
              <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Observatorio Oficial de Precios de Bahía Blanca</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Ranking & Dispersión de Precios
            </h1>
            <p className="mt-3 text-sm text-slate-300 leading-relaxed">
              Métricas comparativas calculadas automáticamente sobre los catálogos vigentes de los comercios de cercanía registrados.
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-slate-900/80 p-2 rounded-2xl border border-white/10 self-start md:self-auto">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'cards'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Tarjetas Detalladas
            </button>
            <button
              onClick={() => setViewMode('chart')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                viewMode === 'chart'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <PieChartIcon className="w-3.5 h-3.5" />
              <span>Gráfico Comparativo</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
        <div className="p-6 rounded-3xl bg-slate-900/70 border border-white/10 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Canasta Relevada</span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold">
              <Store className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-white mt-3 tabular-nums">{ranking.length}</p>
          <p className="text-xs text-slate-400 mt-1">Productos básicos con precios comparados</p>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/70 border border-emerald-500/30 shadow-xl backdrop-blur-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Ahorro Máximo</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-emerald-400 mt-3 tabular-nums">Hasta {maxAhorro}%</p>
          <p className="text-xs text-slate-400 mt-1">Diferencia entre el comercio más caro y el más barato</p>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/70 border border-white/10 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Criterio Oficial</span>
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xl font-bold text-white mt-3">Comercio Justo</p>
          <p className="text-xs text-slate-400 mt-1">Precios reportados directamente por cada negocio</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-5 rounded-3xl bg-slate-900/80 border border-white/10 mb-8 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filtrar por nombre de producto (ej. Leche, Pan, Café)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-white/10 rounded-2xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center space-x-2">
            <ArrowUpDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-slate-950/80 border border-white/10 rounded-2xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="ahorro">Mayor porcentaje de ahorro</option>
              <option value="precio">Precio mínimo más bajo</option>
              <option value="nombre">Orden alfabético A-Z</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        {categorias.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
            <span className="text-xs text-slate-400 font-semibold mr-1">Categoría:</span>
            <button
              onClick={() => setSelectedCategoria('todas')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                selectedCategoria === 'todas'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              Todas ({ranking.length})
            </button>
            {categorias.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategoria(cat)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors capitalize ${
                  selectedCategoria === cat
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chart View (Recharts) */}
      {viewMode === 'chart' && (
        <div className="p-8 rounded-3xl bg-slate-900/80 border border-white/10 mb-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-6">
            <h3 className="text-base font-bold text-white">Dispersión Visual de Precios ($ ARS)</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Comparación directa del precio mínimo vs precio promedio vs precio máximo en los productos destacados.
            </p>
          </div>

          <div className="h-[380px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderColor: 'rgba(255,255,255,0.1)', 
                    borderRadius: '16px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                  formatter={(value: any) => [`$${value}`, '']}
                />
                <Legend wrapperStyle={{ paddingTop: '15px' }} />
                <Bar dataKey="Precio Mínimo" fill="#10b981" radius={[8, 8, 0, 0]} />
                <Bar dataKey="Precio Promedio" fill="#6366f1" radius={[8, 8, 0, 0]} />
                <Bar dataKey="Precio Máximo" fill="#f43f5e" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Cards View */}
      {loading ? (
        <div className="p-20 text-center text-slate-400">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm font-semibold">Procesando canasta y métricas del observatorio...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-16 rounded-3xl bg-slate-900/50 border border-white/5 text-center text-slate-400">
          <Search className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <p className="text-base font-bold text-white">No se encontraron productos coincidentes</p>
          <p className="text-xs text-slate-400 mt-1">Prueba con otro término de búsqueda o categoría.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredItems.map((item) => {
            const diferenciaPesos = item.precioMax - item.precioMin;
            
            return (
              <div
                key={item.nombre}
                className="p-6 rounded-3xl bg-slate-900/70 border border-white/10 hover:border-indigo-500/40 transition-all shadow-xl backdrop-blur-xl flex flex-col justify-between group"
              >
                <div>
                  {/* Top Bar of Card */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-[10px] font-bold uppercase tracking-wide">
                        {item.categoria || 'Alimento'}
                      </span>
                      <h3 className="text-lg font-black text-white mt-1.5 group-hover:text-indigo-300 transition-colors">
                        {item.nombre}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Relevado en <strong className="text-slate-200">{item.comerciosTotal} comercios</strong> locales
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-black">
                        <TrendingDown className="w-3.5 h-3.5" />
                        <span>Ahorro {item.ahorroPorcentaje}%</span>
                      </span>
                      <p className="text-[10px] text-slate-400 mt-1">Ahorras hasta ${diferenciaPesos}</p>
                    </div>
                  </div>

                  {/* Price Dispersion Meter */}
                  <div className="my-6 p-4 rounded-2xl bg-slate-950/80 border border-white/5 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-emerald-400 block">Mejor Precio</span>
                        <span className="text-xl font-black text-white tabular-nums">${item.precioMin}</span>
                      </div>
                      <div className="text-center">
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">Promedio</span>
                        <span className="text-sm font-bold text-slate-300 tabular-nums">
                          ${Math.round(item.precioPromedio)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold uppercase text-rose-400 block">Precio Máximo</span>
                        <span className="text-sm font-bold text-slate-400 line-through tabular-nums">
                          ${item.precioMax}
                        </span>
                      </div>
                    </div>

                    {/* Visual Range Indicator */}
                    <div className="relative w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-emerald-400 via-indigo-400 to-rose-400 w-full opacity-80"></div>
                    </div>
                  </div>

                  {/* Best Store Callout */}
                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                        <Store className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide">
                          Comercio Recomendado
                        </span>
                        <p className="text-xs font-bold text-white">{item.mejorComercio.nombre}</p>
                        {item.mejorComercio.direccion && (
                          <p className="text-[10px] text-slate-400 truncate max-w-[200px]">
                            {item.mejorComercio.direccion}
                          </p>
                        )}
                      </div>
                    </div>

                    <Link
                      href={`/comercio/${item.mejorComercio._id}`}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center space-x-1"
                    >
                      <span>Ver Vidriera</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Other stores breakdown */}
                {item.todosPrecios && item.todosPrecios.length > 1 && (
                  <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap gap-2 text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-500">Otros comercios:</span>
                    {item.todosPrecios
                      .filter((c) => c.comercioId !== item.mejorComercio._id)
                      .map((p) => (
                        <span key={p.comercioId} className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5">
                          {p.nombreComercio}: <strong className="text-slate-300">${p.precio}</strong>
                        </span>
                      ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
