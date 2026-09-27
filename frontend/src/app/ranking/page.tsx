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
  AlertCircle,
  MessageSquare,
  Sparkles,
  Percent,
  CheckCircle2
} from 'lucide-react';
import ChatWidget from '@/components/ChatWidget';
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
  contacto?: {
    telefono?: string;
    whatsapp?: string;
  };
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
    contacto?: {
      telefono?: string;
      whatsapp?: string;
    };
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
  const [chatComercio, setChatComercio] = useState<{
    id: string;
    nombre: string;
    telefono?: string;
    productoNombre?: string;
    productoPrecio?: number;
  } | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const q = params.get('q');
      if (q) setSearchTerm(q);
    }

    const loadRanking = async () => {
      setLoading(true);
      try {
        const data = await fetchAPI('/productos/ranking');
        if (data && data.ranking && data.ranking.length > 0) {
          setRanking(data.ranking);
          setEstadisticas(data.estadisticas || null);
        } else {
          // Try products endpoint
          const resProd = await fetchAPI('/productos?limit=100');
          const prods = resProd?.data || (Array.isArray(resProd) ? resProd : []);
          if (Array.isArray(prods) && prods.length > 0) {
            const groupsMap = new Map<string, any[]>();
            prods.forEach((prod: any) => {
              const key = (prod.nombre || '').trim().toLowerCase();
              if (!groupsMap.has(key)) groupsMap.set(key, []);
              groupsMap.get(key)!.push(prod);
            });

            const aggregated: ItemRanking[] = Array.from(groupsMap.values()).map((offers) => {
              offers.sort((a, b) => (Number(a.precio) || 0) - (Number(b.precio) || 0));
              const bestOffer = offers[0] || {};
              const prices = offers.map((o) => Number(o.precio) || 0).filter((p) => p > 0);
              const min = prices.length > 0 ? Math.min(...prices) : (Number(bestOffer.precio) || 0);
              const max = prices.length > 0 ? Math.max(...prices) : min;
              const sum = prices.reduce((acc, curr) => acc + curr, 0);
              const avg = prices.length > 0 ? sum / prices.length : min;
              const ahorro = max > min && max > 0 ? Math.round(((max - min) / max) * 100) : 0;

              let catName = 'Canasta Básica';
              if (bestOffer.categoria) {
                if (typeof bestOffer.categoria === 'object' && bestOffer.categoria?.nombre) {
                  catName = bestOffer.categoria.nombre;
                } else if (typeof bestOffer.categoria === 'string') {
                  catName = bestOffer.categoria;
                }
              }

              const com = bestOffer.comercioId || {};
              const comId = typeof com === 'object' ? (com._id || bestOffer._id || '') : String(com);
              const comNombre = typeof com === 'object' ? (com.nombre || 'Comercio Local') : 'Comercio Local';
              const comDireccion = typeof com === 'object' ? (com.direccion || 'Bahía Blanca') : 'Bahía Blanca';

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
                mejorComercio: { _id: comId, nombre: comNombre, direccion: comDireccion },
                comerciosTotal: offers.length,
                todosPrecios: todos
              };
            });

            setRanking(aggregated);
          }
        }
      } catch (err: any) {
        // Fallback ranking will remain active
      } finally {
        setLoading(false);
      }
    };

    loadRanking();
  }, []);

  const categorias = useMemo(() => {
    if (!Array.isArray(ranking)) return [];
    const set = new Set<string>();
    ranking.forEach((r) => {
      if (r?.categoria) {
        const catStr = typeof r.categoria === 'object' ? (r.categoria as any).nombre : String(r.categoria);
        if (catStr) set.add(catStr);
      }
    });
    return Array.from(set);
  }, [ranking]);

  const filteredItems = useMemo(() => {
    if (!Array.isArray(ranking)) return [];
    return ranking
      .filter((item) => {
        if (!item || !item.nombre) return false;
        const matchesTerm =
          item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.mejorComercio?.nombre || '').toLowerCase().includes(searchTerm.toLowerCase());

        let matchesCat = true;
        if (selectedCategoria !== 'todas') {
          const catStr = typeof item.categoria === 'object' ? (item.categoria as any).nombre : String(item.categoria);
          matchesCat = catStr === selectedCategoria;
        }

        return matchesTerm && matchesCat;
      })
      .sort((a, b) => {
        if (sortBy === 'ahorro') return (b?.ahorroPorcentaje || 0) - (a?.ahorroPorcentaje || 0);
        if (sortBy === 'precio') return (a?.precioMin || 0) - (b?.precioMin || 0);
        if (sortBy === 'nombre') return (a?.nombre || '').localeCompare(b?.nombre || '');
        return 0;
      });
  }, [ranking, searchTerm, selectedCategoria, sortBy]);

  const chartData = useMemo(() => {
    if (!Array.isArray(filteredItems)) return [];
    return filteredItems.slice(0, 10).map((item) => ({
      name: (item?.nombre || 'Art.').length > 15 ? (item?.nombre || '').slice(0, 14) + '...' : item?.nombre,
      'Precio Mínimo': item?.precioMin || 0,
      'Precio Promedio': Math.round(item?.precioPromedio || 0),
      'Precio Máximo': item?.precioMax || item?.precioMin || 0
    }));
  }, [filteredItems]);

  const maxAhorro = useMemo(() => {
    if (estadisticas?.porcentajeAhorro) return estadisticas.porcentajeAhorro;
    if (!Array.isArray(ranking) || ranking.length === 0) return 0;
    const ahorros = ranking.map((r) => r?.ahorroPorcentaje || 0);
    return Math.max(...ahorros, 0);
  }, [estadisticas, ranking]);

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8 space-y-6">
      {/* Header Institucional */}
      <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-[#2d3277] uppercase tracking-wider mb-1">
            <BarChart2 className="w-4 h-4 text-[#3483fa]" />
            <span>Observatorio Cívico • Municipalidad de Bahía Blanca</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Observatorio Municipal de Precios
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Relevamiento estadístico neutral de precios de la canasta familiar en comercios barriales habilitados.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center space-x-1 p-1 rounded-md bg-gray-100 border border-gray-200">
          <button
            onClick={() => setViewMode('cards')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
              viewMode === 'cards' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Matriz de Artículos
          </button>
          <button
            onClick={() => setViewMode('chart')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
              viewMode === 'chart' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Gráfico Comparativo
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-white border border-gray-200 shadow-xs">
          <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold block">Artículos en Seguimiento</span>
          <span className="text-2xl font-bold text-gray-900 tabular-nums mt-1 block">
            {ranking.length}
          </span>
          <span className="text-[11px] text-gray-500 mt-0.5 block">Canasta representativa</span>
        </div>

        <div className="p-4 rounded-lg bg-white border border-gray-200 shadow-xs">
          <span className="text-[10px] uppercase tracking-wider text-[#00a650] font-bold block">Dispersión Máxima</span>
          <span className="text-2xl font-bold text-[#00a650] tabular-nums mt-1 block">
            {maxAhorro}%
          </span>
          <span className="text-[11px] text-gray-500 mt-0.5 block">Ahorro potencial entre locales</span>
        </div>

        <div className="p-4 rounded-lg bg-white border border-gray-200 shadow-xs">
          <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold block">Metodología</span>
          <span className="text-sm font-bold text-gray-900 mt-1 block">Datos Verificados</span>
          <span className="text-[11px] text-gray-500 mt-0.5 block">Declarados por comercios</span>
        </div>

        <div className="p-4 rounded-lg bg-white border border-gray-200 shadow-xs">
          <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold block">Jurisdicción</span>
          <span className="text-sm font-bold text-gray-900 mt-1 block">Bahía Blanca</span>
          <span className="text-[11px] text-gray-500 mt-0.5 block">Comercio de cercanía</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-lg bg-white border border-gray-200 space-y-3 shadow-xs">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por denominación de producto (ej. Leche, Pan, Harina, Aceite)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-[3px] text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#3483fa] focus:bg-white transition-all shadow-xs"
            />
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <ArrowUpDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-gray-50 border border-gray-300 rounded-md px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-[#3483fa]"
            >
              <option value="ahorro">Mayor ahorro potencial (%)</option>
              <option value="precio">Precio mínimo más bajo ($)</option>
              <option value="nombre">Denominación A-Z</option>
            </select>
          </div>
        </div>

        {categorias.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-gray-100">
            <span className="text-xs text-gray-500 mr-1 font-medium">Rubro:</span>
            <button
              onClick={() => setSelectedCategoria('todas')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedCategoria === 'todas'
                  ? 'bg-[#2d3277] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todos ({ranking.length})
            </button>
            {categorias.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategoria(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors capitalize ${
                  selectedCategoria === cat
                    ? 'bg-[#2d3277] text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chart View */}
      {viewMode === 'chart' && (
        <div className="p-6 rounded-lg bg-white border border-gray-200 shadow-xs">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-gray-900">Dispersión Comparativa ($ ARS)</h3>
            <p className="text-xs text-gray-500">
              Rango entre el precio más bajo detectado, el promedio del mercado local y el precio máximo registrado.
            </p>
          </div>

          <div className="h-[340px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 15, right: 20, left: 0, bottom: 15 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#666666" fontSize={11} tickLine={false} />
                <YAxis stroke="#666666" fontSize={11} tickLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    borderColor: '#e0e0e0', 
                    borderRadius: '6px',
                    color: '#333333',
                    fontSize: '11px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                  formatter={(value: any) => [`$${value}`, '']}
                />
                <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />
                <Bar dataKey="Precio Mínimo" fill="#00a650" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Precio Promedio" fill="#3483fa" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Precio Máximo" fill="#e04f5f" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Product Cards Comparison View */}
      {loading ? (
        <div className="p-16 text-center text-gray-500 text-xs bg-white rounded-lg border border-gray-200">
          <div className="w-8 h-8 border-2 border-[#3483fa] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <span>Procesando relevamiento del observatorio de precios...</span>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-12 rounded-lg bg-white border border-gray-200 text-center text-gray-600 shadow-xs">
          <p className="text-base font-bold text-gray-900">No se encontraron artículos</p>
          <p className="text-xs text-gray-500 mt-1">Modificá los términos de búsqueda o el rubro seleccionado.</p>
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
                className="p-5 rounded-lg bg-white border border-gray-200 hover:border-[#3483fa] hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                        {typeof item.categoria === 'object' && item.categoria ? (item.categoria as any).nombre : (item.categoria || 'Canasta Básica')}
                      </span>
                      <h3 className="text-base font-bold text-gray-900 mt-1.5">
                        {item.nombre}
                      </h3>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {item.comerciosTotal || 1} {item.comerciosTotal === 1 ? 'comercio relevado' : 'comercios relevados'}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded bg-green-50 text-[#00a650] border border-green-200 text-xs font-bold">
                        <span>Ahorro {item.ahorroPorcentaje || 0}%</span>
                      </span>
                      {diferencia > 0 && (
                        <span className="text-[10px] text-gray-400 block mt-1">
                          Brecha: ${diferencia.toLocaleString('es-AR')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Dispersion details */}
                  <div className="my-4 p-3 rounded-lg bg-gray-50 border border-gray-200 space-y-2">
                    <div className="flex justify-between items-baseline text-xs">
                      <div>
                        <span className="text-[10px] uppercase text-[#00a650] font-bold block">Precio Mínimo</span>
                        <span className="text-base font-bold text-gray-900 tabular-nums">
                          ${min.toLocaleString('es-AR')}
                        </span>
                      </div>
                      <div className="text-center">
                        <span className="text-[10px] uppercase text-gray-500 font-bold block">Promedio</span>
                        <span className="text-xs font-semibold text-gray-700 tabular-nums">
                          ${Math.round(item.precioPromedio || min).toLocaleString('es-AR')}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase text-red-600 font-bold block">Precio Máximo</span>
                        <span className="text-base font-bold text-gray-900 tabular-nums">
                          ${max.toLocaleString('es-AR')}
                        </span>
                      </div>
                    </div>

                    {/* Visual Bar */}
                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden flex">
                      <div className="bg-[#00a650] h-full" style={{ width: '35%' }} title="Mínimo"></div>
                      <div className="bg-[#3483fa] h-full" style={{ width: '40%' }} title="Promedio"></div>
                      <div className="bg-[#e04f5f] h-full" style={{ width: '25%' }} title="Máximo"></div>
                    </div>
                  </div>

                  {/* Best Offer Store */}
                  <div className="p-3 rounded-lg bg-green-50/70 border border-green-200/80 flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-1 text-[10px] font-bold text-[#00a650] uppercase tracking-wider">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Mejor precio relevado en</span>
                      </div>
                      <h4 className="text-xs font-bold text-gray-900 mt-0.5">{mejorCom.nombre}</h4>
                      {mejorCom.direccion && (
                        <p className="text-[10px] text-gray-500">{mejorCom.direccion}</p>
                      )}
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-black text-[#00a650] block">
                        ${min.toLocaleString('es-AR')}
                      </span>
                      <span className="text-[9px] bg-[#00a650] text-white px-1.5 py-0.2 rounded font-bold uppercase">
                        Más bajo
                      </span>
                    </div>
                  </div>

                  {/* Other Stores Comparison */}
                  {otrosPrecios.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-gray-100">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                        Otros locales con este artículo:
                      </span>
                      <div className="space-y-1">
                        {otrosPrecios.slice(0, 2).map((op, idx2) => (
                          <div key={idx2} className="flex items-center justify-between text-xs text-gray-600">
                            <span className="truncate max-w-[200px]">{op.nombreComercio}</span>
                            <span className="font-semibold text-gray-800">${op.precio.toLocaleString('es-AR')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Action */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <Link
                    href={`/buscar?q=${encodeURIComponent(mejorCom.nombre)}`}
                    className="text-xs text-[#3483fa] hover:underline font-semibold"
                  >
                    Ver comercio en directorio
                  </Link>

                  <button
                    onClick={() => setChatComercio({
                      id: mejorCom._id,
                      nombre: mejorCom.nombre,
                      productoNombre: item.nombre,
                      productoPrecio: min
                    })}
                    className="px-3.5 py-1.5 bg-[#ffe600] hover:bg-[#ebd300] text-[#2d3277] text-xs font-bold rounded shadow-xs transition-colors flex items-center space-x-1"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Consultar Stock</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Chat Widget */}
      {chatComercio && (
        <ChatWidget
          comercioId={chatComercio.id}
          comercioNombre={chatComercio.nombre}
          comercioTelefono={chatComercio.telefono}
          productoNombre={chatComercio.productoNombre}
          productoPrecio={chatComercio.productoPrecio}
          isOpen={true}
          onClose={() => setChatComercio(null)}
        />
      )}
    </div>
  );
}
