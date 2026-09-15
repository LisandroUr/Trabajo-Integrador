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
  ChevronRight,
  ShieldCheck,
  AlertCircle
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

interface ComercioOferta {
  comercioId: string;
  nombreComercio: string;
  direccion?: string;
  precio: number;
  disponible: boolean;
}

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
  todosPrecios: ComercioOferta[];
}

interface EstadisticasRanking {
  totalOfertas: number;
  precioMinimo: number;
  precioMaximo: number;
  precioPromedio: number;
  ahorroMaximo: number;
  porcentajeAhorro: number;
}

export default function RankingPage() {
  const [ranking, setRanking] = useState<ItemRanking[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasRanking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState('todas');
  const [sortBy, setSortBy] = useState<'ahorro' | 'precio' | 'nombre'>('ahorro');
  const [viewMode, setViewMode] = useState<'cards' | 'chart'>('cards');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const q = params.get('q');
      if (q) setSearchTerm(q);
    }

    const loadRanking = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await fetchAPI('/productos/ranking');
        
        if (data?.estadisticas) {
          setEstadisticas(data.estadisticas);
        }

        // Extraer lista de productos en bruto del endpoint
        const rawProducts: any[] = Array.isArray(data) ? data : (data?.productos || []);

        // Si los items ya están agrupados con mejorComercio (formato ItemRanking previo)
        if (rawProducts.length > 0 && rawProducts[0]?.mejorComercio && typeof rawProducts[0].mejorComercio === 'object') {
          setRanking(rawProducts);
        } else {
          // Agrupar los productos por nombre canónico para construir la comparativa multi-comercio
          const groupsMap = new Map<string, any[]>();
          
          rawProducts.forEach((prod) => {
            if (!prod || typeof prod !== 'object') return;
            const rawName = typeof prod.nombre === 'string' ? prod.nombre.trim() : 'Artículo';
            const key = rawName.toLowerCase();
            
            if (!groupsMap.has(key)) {
              groupsMap.set(key, []);
            }
            groupsMap.get(key)!.push(prod);
          });

          const aggregated: ItemRanking[] = Array.from(groupsMap.values()).map((offers) => {
            // Ordenar de menor a mayor precio para detectar la mejor oferta local
            offers.sort((a, b) => (Number(a.precio) || 0) - (Number(b.precio) || 0));
            const bestOffer = offers[0] || {};
            
            const prices = offers.map((o) => Number(o.precio) || 0).filter((p) => p > 0);
            const min = prices.length > 0 ? Math.min(...prices) : (Number(bestOffer.precio) || 0);
            const max = prices.length > 0 ? Math.max(...prices) : min;
            const sum = prices.reduce((acc, curr) => acc + curr, 0);
            const avg = prices.length > 0 ? sum / prices.length : min;
            const ahorro = max > min && max > 0 ? Math.round(((max - min) / max) * 100) : 0;

            // Extraer denominación de categoría de forma segura
            let catName = 'Canasta Básica';
            if (bestOffer.categoria) {
              if (typeof bestOffer.categoria === 'object' && bestOffer.categoria?.nombre) {
                catName = bestOffer.categoria.nombre;
              } else if (typeof bestOffer.categoria === 'string') {
                catName = bestOffer.categoria;
              }
            }

            // Extraer comercio titular con valores por defecto a prueba de fallos
            const com = bestOffer.comercioId || {};
            const comId = typeof com === 'object' ? (com._id || bestOffer._id || '') : String(com);
            const comNombre = typeof com === 'object' ? (com.nombre || 'Comercio Local') : 'Comercio Local';
            const comDireccion = typeof com === 'object' ? (com.direccion || 'Bahía Blanca') : 'Bahía Blanca';

            // Mapear todas las ofertas del artículo
            const todos: ComercioOferta[] = offers.map((o) => {
              const c = o.comercioId || {};
              return {
                comercioId: typeof c === 'object' ? (c._id || o._id || '') : String(c),
                nombreComercio: typeof c === 'object' ? (c.nombre || 'Comercio') : 'Comercio',
                direccion: typeof c === 'object' ? (c.direccion || '') : '',
                precio: Number(o.precio) || 0,
                disponible: o.disponible ?? true
              };
            });

            return {
              nombre: bestOffer.nombre || 'Artículo',
              categoria: catName,
              precioMin: min,
              precioMax: max,
              precioPromedio: avg,
              ahorroPorcentaje: ahorro,
              mejorComercio: {
                _id: comId,
                nombre: comNombre,
                direccion: comDireccion
              },
              comerciosTotal: offers.length,
              todosPrecios: todos
            };
          });

          setRanking(aggregated);
        }
      } catch (err: any) {
        console.error('Error cargando observatorio de precios:', err);
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
        if (r && r.categoria) setCat.add(r.categoria);
      });
    }
    return Array.from(setCat);
  }, [ranking]);

  const filteredItems = useMemo(() => {
    if (!Array.isArray(ranking)) return [];
    return ranking
      .filter((item) => {
        if (!item || !item.nombre) return false;
        const matchesName = item.nombre.toLowerCase().includes((searchTerm || '').toLowerCase());
        const matchesCat = selectedCategoria === 'todas' || item.categoria === selectedCategoria;
        return matchesName && matchesCat;
      })
      .sort((a, b) => {
        if (sortBy === 'ahorro') return (b.ahorroPorcentaje || 0) - (a.ahorroPorcentaje || 0);
        if (sortBy === 'precio') return (a.precioMin || 0) - (b.precioMin || 0);
        return (a.nombre || '').localeCompare(b.nombre || '');
      });
  }, [ranking, searchTerm, selectedCategoria, sortBy]);

  // Preparación de datos para Recharts sin colores neón
  const chartData = useMemo(() => {
    if (!Array.isArray(filteredItems)) return [];
    return filteredItems.slice(0, 8).map((item) => ({
      name: (item.nombre || '').length > 15 ? (item.nombre || '').slice(0, 15) + '...' : (item.nombre || ''),
      'Precio Mínimo': item.precioMin || 0,
      'Precio Promedio': Math.round(item.precioPromedio || 0),
      'Precio Máximo': item.precioMax || 0,
    }));
  }, [filteredItems]);

  const maxAhorro = useMemo(() => {
    if (estadisticas?.porcentajeAhorro) return estadisticas.porcentajeAhorro;
    if (!Array.isArray(ranking) || ranking.length === 0) return 0;
    const ahorros = ranking.map((r) => r?.ahorroPorcentaje || 0);
    return Math.max(...ahorros, 0);
  }, [estadisticas, ranking]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Institucional */}
      <div className="border-b border-[#262d3a] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-[#7dafb5] mb-2">
            <BarChart2 className="w-4 h-4" />
            <span>Dirección de Estadística y Defensa del Consumidor</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#d5d9e0]">
            Observatorio Municipal de Precios
          </h1>
          <p className="text-xs text-[#8d94a1] mt-1 max-w-xl">
            Relevamiento comparativo continuo sobre bienes de primera necesidad en comercios habilitados de Bahía Blanca.
          </p>
        </div>

        {/* Selector de Vistas */}
        <div className="flex items-center space-x-1 p-1 rounded-xl bg-[#171b22] border border-[#262d3a]">
          <button
            onClick={() => setViewMode('cards')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              viewMode === 'cards'
                ? 'bg-[#1d222b] text-[#d5d9e0]'
                : 'text-[#8d94a1] hover:text-[#d5d9e0]'
            }`}
          >
            Matriz de Artículos
          </button>
          <button
            onClick={() => setViewMode('chart')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              viewMode === 'chart'
                ? 'bg-[#1d222b] text-[#d5d9e0]'
                : 'text-[#8d94a1] hover:text-[#d5d9e0]'
            }`}
          >
            Gráfico Analítico
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#171b22] border border-[#262d3a] shadow-xs">
          <span className="text-[10px] uppercase tracking-wider text-[#8d94a1] font-semibold block">Artículos en Seguimiento</span>
          <span className="text-2xl font-bold text-[#d5d9e0] tabular-nums mt-1 block">
            {ranking.length}
          </span>
          <span className="text-[11px] text-[#8d94a1] mt-0.5 block">Canasta representativa</span>
        </div>

        <div className="p-4 rounded-xl bg-[#171b22] border border-[#262d3a] shadow-xs">
          <span className="text-[10px] uppercase tracking-wider text-[#8bb59b] font-semibold block">Dispersión Máxima</span>
          <span className="text-2xl font-bold text-[#8bb59b] tabular-nums mt-1 block">
            {maxAhorro}%
          </span>
          <span className="text-[11px] text-[#8d94a1] mt-0.5 block">Diferencia entre extremos</span>
        </div>

        <div className="p-4 rounded-xl bg-[#171b22] border border-[#262d3a] shadow-xs">
          <span className="text-[10px] uppercase tracking-wider text-[#8d94a1] font-semibold block">Metodología</span>
          <span className="text-sm font-bold text-[#d5d9e0] mt-1 block">Datos Verificados</span>
          <span className="text-[11px] text-[#8d94a1] mt-0.5 block">Declarados por comercios</span>
        </div>

        <div className="p-4 rounded-xl bg-[#171b22] border border-[#262d3a] shadow-xs">
          <span className="text-[10px] uppercase tracking-wider text-[#8d94a1] font-semibold block">Jurisdicción</span>
          <span className="text-sm font-bold text-[#d5d9e0] mt-1 block">Bahía Blanca</span>
          <span className="text-[11px] text-[#8d94a1] mt-0.5 block">Zona Urbana y Periférica</span>
        </div>
      </div>

      {/* Consola de Búsqueda y Filtros */}
      <div className="p-4 rounded-2xl bg-[#171b22] border border-[#262d3a] space-y-3 shadow-xs">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8d94a1]" />
            <input
              type="text"
              placeholder="Buscar por denominación de producto (ej. Leche, Pan, Harina)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#12151b] border border-[#262d3a] rounded-xl text-xs text-[#d5d9e0] placeholder:text-[#8d94a1]/50 focus:outline-none focus:border-[#4b6cb7] transition-colors"
            />
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#8d94a1] flex-shrink-0" />
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-[#12151b] border border-[#262d3a] rounded-xl px-3 py-2 text-xs text-[#d5d9e0] focus:outline-none focus:border-[#4b6cb7]"
            >
              <option value="ahorro">Mayor ahorro potencial (%)</option>
              <option value="precio">Precio mínimo más bajo ($)</option>
              <option value="nombre">Denominación A-Z</option>
            </select>
          </div>
        </div>

        {/* Filtro por Categorías */}
        {categorias.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#262d3a]">
            <span className="text-[11px] text-[#8d94a1] mr-1">Rubro:</span>
            <button
              onClick={() => setSelectedCategoria('todas')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                selectedCategoria === 'todas'
                  ? 'bg-[#4b6cb7] text-[#d5d9e0]'
                  : 'bg-[#12151b] text-[#8d94a1] hover:text-[#d5d9e0] border border-[#262d3a]'
              }`}
            >
              Todos ({ranking.length})
            </button>
            {categorias.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategoria(cat)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors capitalize ${
                  selectedCategoria === cat
                    ? 'bg-[#4b6cb7] text-[#d5d9e0]'
                    : 'bg-[#12151b] text-[#8d94a1] hover:text-[#d5d9e0] border border-[#262d3a]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Vista de Gráfico Analítico (Recharts sobrio) */}
      {viewMode === 'chart' && (
        <div className="p-6 rounded-2xl bg-[#171b22] border border-[#262d3a] shadow-xs">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-[#d5d9e0]">Dispersión Comparativa ($ ARS)</h3>
            <p className="text-xs text-[#8d94a1]">
              Rango entre el precio más bajo detectado, el promedio del mercado local y el precio máximo registrado.
            </p>
          </div>

          <div className="h-[340px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 15, right: 20, left: 0, bottom: 15 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262d3a" />
                <XAxis dataKey="name" stroke="#8d94a1" fontSize={11} tickLine={false} />
                <YAxis stroke="#8d94a1" fontSize={11} tickLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#171b22', 
                    borderColor: '#262d3a', 
                    borderRadius: '8px',
                    color: '#d5d9e0',
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

      {/* Vista de Tarjetas Comparativas */}
      {loading ? (
        <div className="p-16 text-center text-[#8d94a1] text-xs">
          <div className="w-8 h-8 border-2 border-[#4b6cb7] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <span>Procesando relevamiento del observatorio de precios...</span>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-[#171b22] border border-[#262d3a] text-center text-[#d48a97] space-y-2">
          <AlertCircle className="w-6 h-6 mx-auto text-[#d48a97]" />
          <p className="text-xs font-semibold">{error}</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#171b22] border border-[#262d3a] text-center text-[#8d94a1]">
          <p className="text-sm font-bold text-[#d5d9e0]">No se encontraron artículos</p>
          <p className="text-xs text-[#8d94a1] mt-1">Modifica los términos de búsqueda o el rubro seleccionado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredItems.map((item, idx) => {
            const min = item.precioMin || 0;
            const max = item.precioMax || min;
            const diferencia = Math.max(0, max - min);
            const mejorCom = item.mejorComercio || { _id: '', nombre: 'Comercio Local', direccion: 'Bahía Blanca' };
            const otrosPrecios = (item.todosPrecios || []).filter(
              (c) => c && c.comercioId !== mejorCom._id
            );

            return (
              <div
                key={item.nombre || idx}
                className="p-5 rounded-2xl bg-[#171b22] border border-[#262d3a] hover:border-[#4b6cb7]/50 transition-colors flex flex-col justify-between shadow-xs"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider badge-steel px-2 py-0.5 rounded">
                        {item.categoria || 'Canasta Básica'}
                      </span>
                      <h3 className="text-base font-bold text-[#d5d9e0] mt-1.5">
                        {item.nombre}
                      </h3>
                      <p className="text-[11px] text-[#8d94a1] mt-0.5">
                        {item.comerciosTotal || 1} {item.comerciosTotal === 1 ? 'comercio relevado' : 'comercios relevados'}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded badge-sage text-xs font-bold">
                        <span>Ahorro {item.ahorroPorcentaje || 0}%</span>
                      </span>
                      {diferencia > 0 && (
                        <span className="text-[10px] text-[#8d94a1] block mt-1">
                          Brecha: ${diferencia.toLocaleString('es-AR')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Barra de Dispersión */}
                  <div className="my-4 p-3 rounded-xl bg-[#12151b] border border-[#262d3a] space-y-2">
                    <div className="flex justify-between items-baseline text-xs">
                      <div>
                        <span className="text-[10px] uppercase text-[#8bb59b] font-semibold block">Precio Mínimo</span>
                        <span className="text-base font-bold text-[#d5d9e0] tabular-nums">
                          ${min.toLocaleString('es-AR')}
                        </span>
                      </div>
                      <div className="text-center">
                        <span className="text-[10px] uppercase text-[#8d94a1] font-semibold block">Promedio</span>
                        <span className="text-xs font-semibold text-[#d5d9e0] tabular-nums">
                          ${Math.round(item.precioPromedio || min).toLocaleString('es-AR')}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase text-[#d48a97] font-semibold block">Precio Máximo</span>
                        <span className="text-xs text-[#8d94a1] line-through tabular-nums">
                          ${max.toLocaleString('es-AR')}
                        </span>
                      </div>
                    </div>

                    <div className="w-full h-1.5 rounded-full bg-[#1d222b] overflow-hidden">
                      <div className="h-full bg-[#4b6cb7] w-full opacity-60"></div>
                    </div>
                  </div>

                  {/* Mejor Oferta Local (Completamente a prueba de fallos) */}
                  <div className="p-3 rounded-xl bg-[#12151b] border border-[#262d3a] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#8bb59b] font-bold block uppercase tracking-wider">
                        Mejor Oferta Local
                      </span>
                      <p className="text-xs font-bold text-[#d5d9e0] mt-0.5">
                        {mejorCom.nombre || 'Comercio Local'}
                      </p>
                      {mejorCom.direccion && (
                        <p className="text-[10px] text-[#8d94a1] truncate max-w-[200px]">
                          {mejorCom.direccion}
                        </p>
                      )}
                    </div>

                    {mejorCom._id ? (
                      <Link
                        href={`/comercio/${mejorCom._id}`}
                        className="px-3 py-1.5 rounded-lg bg-[#4b6cb7] hover:bg-[#3d5a99] text-[#d5d9e0] text-xs font-semibold transition-colors flex items-center space-x-1"
                      >
                        <span>Ver Vidriera</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    ) : (
                      <span className="text-xs text-[#8d94a1]">Disponible</span>
                    )}
                  </div>
                </div>

                {/* Otros Comercios con Stock del Artículo */}
                {otrosPrecios.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-[#262d3a] flex flex-wrap gap-1.5 text-[11px] text-[#8d94a1]">
                    <span className="font-semibold text-[#8d94a1]">Otras opciones:</span>
                    {otrosPrecios.map((p, pIdx) => (
                      <span 
                        key={p.comercioId || pIdx} 
                        className="px-2 py-0.5 rounded bg-[#12151b] border border-[#262d3a] text-xs"
                      >
                        {p.nombreComercio || 'Comercio'}: <strong className="text-[#d5d9e0] font-semibold">${(p.precio || 0).toLocaleString('es-AR')}</strong>
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
