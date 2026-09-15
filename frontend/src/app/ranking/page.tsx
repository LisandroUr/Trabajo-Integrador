'use client';

import { useState, useEffect, useMemo } from 'react';
import { fetchAPI } from '@/lib/api';
import Link from 'next/link';
import { 
  BarChart2, 
  Search, 
  Store, 
  ArrowUpRight, 
  ArrowUpDown,
  TrendingDown,
  Building,
  Calendar,
  Layers,
  SlidersHorizontal,
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
        const items = Array.isArray(data) ? data : (data?.productos || []);
        setRanking(items);
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
    if (Array.isArray(ranking)) {
      ranking.forEach((r) => {
        if (r.categoria) setCat.add(r.categoria);
      });
    }
    return Array.from(setCat);
  }, [ranking]);

  const filteredItems = useMemo(() => {
    if (!Array.isArray(ranking)) return [];
    return ranking
      .filter((item) => {
        const matchesName = item.nombre.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCat = selectedCategoria === 'todas' || item.categoria === selectedCategoria;
        return matchesName && matchesCat;
      })
      .sort((a, b) => {
        if (sortBy === 'ahorro') return (b.ahorroPorcentaje || 0) - (a.ahorroPorcentaje || 0);
        if (sortBy === 'precio') return (a.precioMin || 0) - (b.precioMin || 0);
        return a.nombre.localeCompare(b.nombre);
      });
  }, [ranking, searchTerm, selectedCategoria, sortBy]);

  // Chart data preparation
  const chartData = useMemo(() => {
    return filteredItems.slice(0, 7).map((item) => ({
      name: item.nombre.length > 14 ? item.nombre.slice(0, 14) + '...' : item.nombre,
      'Precio Mínimo': item.precioMin || 0,
      'Precio Promedio': Math.round(item.precioPromedio || 0),
      'Precio Máximo': item.precioMax || 0,
    }));
  }, [filteredItems]);

  const maxAhorro = useMemo(() => {
    if (!Array.isArray(ranking) || ranking.length === 0) return 0;
    return Math.max(...ranking.map((r) => r.ahorroPorcentaje || 0));
  }, [ranking]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Institutional Header Console */}
      <div className="border-b border-[#232833] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-medium text-[#7a93b5] mb-2">
            <BarChart2 className="w-4 h-4" />
            <span>Dirección de Estadística y Defensa del Consumidor</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#e2e5eb]">
            Observatorio Municipal de Precios
          </h1>
          <p className="text-xs text-[#8d94a1] mt-1 max-w-xl">
            Relevamiento comparativo continuo sobre bienes de primera necesidad en comercios habilitados de Bahía Blanca.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center space-x-1 p-1 rounded-xl bg-[#171b22] border border-[#232833]">
          <button
            onClick={() => setViewMode('cards')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              viewMode === 'cards'
                ? 'bg-[#252c38] text-[#e2e5eb]'
                : 'text-[#8d94a1] hover:text-[#d5d9e0]'
            }`}
          >
            Matriz de Artículos
          </button>
          <button
            onClick={() => setViewMode('chart')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              viewMode === 'chart'
                ? 'bg-[#252c38] text-[#e2e5eb]'
                : 'text-[#8d94a1] hover:text-[#d5d9e0]'
            }`}
          >
            Gráfico Analítico
          </button>
        </div>
      </div>

      {/* Analytical KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#171b22] border border-[#232833]">
          <span className="text-[10px] uppercase tracking-wider text-[#6b7280] font-medium block">Productos Relevados</span>
          <span className="text-2xl font-semibold text-[#e2e5eb] tabular-nums mt-1 block">{ranking.length}</span>
          <span className="text-[11px] text-[#8d94a1] mt-0.5 block">Canasta representativa</span>
        </div>

        <div className="p-4 rounded-xl bg-[#171b22] border border-[#232833]">
          <span className="text-[10px] uppercase tracking-wider text-[#8bb59b] font-medium block">Dispersión Máxima</span>
          <span className="text-2xl font-semibold text-[#8bb59b] tabular-nums mt-1 block">{maxAhorro}%</span>
          <span className="text-[11px] text-[#8d94a1] mt-0.5 block">Diferencia entre extremos</span>
        </div>

        <div className="p-4 rounded-xl bg-[#171b22] border border-[#232833]">
          <span className="text-[10px] uppercase tracking-wider text-[#6b7280] font-medium block">Metodología</span>
          <span className="text-sm font-semibold text-[#e2e5eb] mt-1 block">Datos Verificados</span>
          <span className="text-[11px] text-[#8d94a1] mt-0.5 block">Declarados por comercios</span>
        </div>

        <div className="p-4 rounded-xl bg-[#171b22] border border-[#232833]">
          <span className="text-[10px] uppercase tracking-wider text-[#6b7280] font-medium block">Jurisdicción</span>
          <span className="text-sm font-semibold text-[#c8cdd6] mt-1 block">Bahía Blanca</span>
          <span className="text-[11px] text-[#8d94a1] mt-0.5 block">Zona Urbana y Periférica</span>
        </div>
      </div>

      {/* Filter and Query Console */}
      <div className="p-4 rounded-2xl bg-[#171b22] border border-[#232833] space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6b7280]" />
            <input
              type="text"
              placeholder="Buscar por denominación de producto (ej. Leche, Pan, Harina)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#12151b] border border-[#232833] rounded-xl text-xs text-[#e2e5eb] placeholder:text-[#5f6674] focus:outline-none focus:border-[#384354]"
            />
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#6b7280] flex-shrink-0" />
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-[#12151b] border border-[#232833] rounded-xl px-3 py-2 text-xs text-[#c8cdd6] focus:outline-none focus:border-[#384354]"
            >
              <option value="ahorro">Mayor ahorro potencial (%)</option>
              <option value="precio">Precio mínimo más bajo ($)</option>
              <option value="nombre">Denominación A-Z</option>
            </select>
          </div>
        </div>

        {/* Category Filter Pills */}
        {categorias.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#232833]">
            <span className="text-[11px] text-[#6b7280] mr-1">Rubro:</span>
            <button
              onClick={() => setSelectedCategoria('todas')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                selectedCategoria === 'todas'
                  ? 'bg-[#252c38] text-[#e2e5eb] border border-[#374254]'
                  : 'bg-[#12151b] text-[#8d94a1] hover:text-[#d5d9e0] border border-[#232833]'
              }`}
            >
              Todos ({ranking.length})
            </button>
            {categorias.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategoria(cat)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors capitalize ${
                  selectedCategoria === cat
                    ? 'bg-[#252c38] text-[#e2e5eb] border border-[#374254]'
                    : 'bg-[#12151b] text-[#8d94a1] hover:text-[#d5d9e0] border border-[#232833]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chart View (Muted, Non-Neon Recharts) */}
      {viewMode === 'chart' && (
        <div className="p-6 rounded-2xl bg-[#171b22] border border-[#232833]">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-[#e2e5eb]">Dispersión Comparativa ($ ARS)</h3>
            <p className="text-xs text-[#8d94a1]">
              Rango entre el precio más bajo detectado, el promedio del mercado local y el precio máximo registrado.
            </p>
          </div>

          <div className="h-[340px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 15, right: 20, left: 0, bottom: 15 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#232833" />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={11} tickLine={false} />
                <YAxis stroke="#6b7280" fontSize={11} tickLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#181c24', 
                    borderColor: '#29303c', 
                    borderRadius: '8px',
                    color: '#e2e5eb',
                    fontSize: '11px'
                  }}
                  formatter={(value: any) => [`$${value}`, '']}
                />
                <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />
                <Bar dataKey="Precio Mínimo" fill="#4a7c59" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Precio Promedio" fill="#4b6cb7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Precio Máximo" fill="#8b3a4a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Cards / Matrix View */}
      {loading ? (
        <div className="p-16 text-center text-[#78808f] text-xs">
          Procesando datos del observatorio...
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#171b22] border border-[#232833] text-center text-[#8d94a1]">
          <p className="text-sm font-semibold text-[#e2e5eb]">No se encontraron artículos</p>
          <p className="text-xs text-[#78808f] mt-1">Modifica los términos de búsqueda o el rubro seleccionado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredItems.map((item) => {
            const diferencia = (item.precioMax || 0) - (item.precioMin || 0);

            return (
              <div
                key={item.nombre}
                className="p-5 rounded-2xl bg-[#171b22] border border-[#232833] hover:border-[#2f3745] transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <span className="text-[10px] font-medium uppercase tracking-wider text-[#9cb1ce] bg-[#1f2633] border border-[#2d374a] px-2 py-0.5 rounded">
                        {item.categoria || 'Canasta Básica'}
                      </span>
                      <h3 className="text-base font-semibold text-[#e2e5eb] mt-1.5">
                        {item.nombre}
                      </h3>
                      <p className="text-[11px] text-[#78808f] mt-0.5">
                        {item.comerciosTotal} comercios relevados
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded bg-[#1e2a23] border border-[#2b3e34] text-[#8bb59b] text-xs font-semibold">
                        <span>Ahorro {item.ahorroPorcentaje}%</span>
                      </span>
                      <span className="text-[10px] text-[#6b7280] block mt-1">
                        Diferencia: ${diferencia}
                      </span>
                    </div>
                  </div>

                  {/* Spread Bar */}
                  <div className="my-4 p-3 rounded-xl bg-[#13161c] border border-[#1f242e] space-y-2">
                    <div className="flex justify-between items-baseline text-xs">
                      <div>
                        <span className="text-[10px] uppercase text-[#8bb59b] font-medium block">Precio Mínimo</span>
                        <span className="text-base font-semibold text-[#e2e5eb] tabular-nums">${item.precioMin}</span>
                      </div>
                      <div className="text-center">
                        <span className="text-[10px] uppercase text-[#78808f] font-medium block">Promedio</span>
                        <span className="text-xs font-medium text-[#c8cdd6] tabular-nums">${Math.round(item.precioPromedio)}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase text-[#9e7078] font-medium block">Precio Máximo</span>
                        <span className="text-xs text-[#78808f] line-through tabular-nums">${item.precioMax}</span>
                      </div>
                    </div>

                    <div className="w-full h-1.5 rounded-full bg-[#20252f] overflow-hidden">
                      <div className="h-full bg-[#3d5a7d] w-full opacity-70"></div>
                    </div>
                  </div>

                  {/* Best Store Callout */}
                  <div className="p-3 rounded-xl bg-[#1a231d] border border-[#27382c] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#8bb59b] font-medium block uppercase tracking-wider">
                        Mejor Oferta Local
                      </span>
                      <p className="text-xs font-medium text-[#e2e5eb] mt-0.5">{item.mejorComercio.nombre}</p>
                      {item.mejorComercio.direccion && (
                        <p className="text-[10px] text-[#78808f] truncate max-w-[200px]">
                          {item.mejorComercio.direccion}
                        </p>
                      )}
                    </div>

                    <Link
                      href={`/comercio/${item.mejorComercio._id}`}
                      className="px-3 py-1.5 rounded-lg bg-[#243529] hover:bg-[#2e4334] text-[#8bb59b] border border-[#364f3d] text-xs font-medium transition-colors flex items-center space-x-1"
                    >
                      <span>Ver Vidriera</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Other Stores List */}
                {item.todosPrecios && item.todosPrecios.length > 1 && (
                  <div className="mt-4 pt-3 border-t border-[#232833] flex flex-wrap gap-1.5 text-[11px] text-[#78808f]">
                    <span className="font-medium text-[#6b7280]">Otros comercios:</span>
                    {item.todosPrecios
                      .filter((c) => c.comercioId !== item.mejorComercio._id)
                      .map((p) => (
                        <span key={p.comercioId} className="px-1.5 py-0.2 rounded bg-[#13161c] border border-[#20252f]">
                          {p.nombreComercio}: <strong className="text-[#c8cdd6]">${p.precio}</strong>
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
