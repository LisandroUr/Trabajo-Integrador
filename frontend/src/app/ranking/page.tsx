'use client';

import { useState, useEffect } from 'react';
import { fetchAPI } from '@/lib/api';
import Link from 'next/link';
import { 
  TrendingUp, 
  Search, 
  Tag, 
  Store, 
  MapPin, 
  ArrowUpDown, 
  Trophy, 
  DollarSign, 
  Percent, 
  AlertCircle,
  Building2,
  CheckCircle2,
  ChevronRight,
  SlidersHorizontal,
  Star,
  ExternalLink
} from 'lucide-react';

interface ProductoRanking {
  _id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria?: {
    _id: string;
    nombre: string;
    icono: string;
  };
  comercioId: {
    _id: string;
    nombre: string;
    direccion: string;
    calificacionPromedio: number;
    contacto?: {
      telefono?: string;
      whatsapp?: string;
    };
  };
}

interface Estadisticas {
  totalOfertas: number;
  precioMinimo: number;
  precioMaximo: number;
  precioPromedio: number;
  ahorroMaximo: number;
  porcentajeAhorro: number;
}

export default function RankingPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [orden, setOrden] = useState<'asc' | 'desc'>('asc');
  const [productos, setProductos] = useState<ProductoRanking[]>([]);
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const sugerencias = ['Leche', 'Pan', 'Aceite', 'Harina', 'Café', 'Paracetamol'];

  const buscarRanking = async (termino: string, ordenActual: 'asc' | 'desc' = orden) => {
    setLoading(true);
    setError('');
    try {
      const url = `/productos/ranking?q=${encodeURIComponent(termino)}&orden=${ordenActual}&limit=50`;
      const res = await fetchAPI(url);
      setProductos(res.productos || []);
      setEstadisticas(res.estadisticas || null);
    } catch (err: any) {
      setError(err.message || 'Error al consultar el observatorio de precios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarRanking('Leche');
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    buscarRanking(searchTerm);
  };

  const handleSugerenciaClick = (sug: string) => {
    setSearchTerm(sug);
    buscarRanking(sug);
  };

  const toggleOrden = () => {
    const nuevoOrden = orden === 'asc' ? 'desc' : 'asc';
    setOrden(nuevoOrden);
    buscarRanking(searchTerm, nuevoOrden);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-10 max-w-3xl">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold uppercase tracking-wider mb-3">
          <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
          <span>Observatorio de Precios y Transparencia Local</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Ranking y Comparador de Precios
        </h1>
        <p className="mt-2 text-sm text-slate-500 font-normal leading-relaxed">
          Consulta la dispersión de precios en tiempo real de los artículos de la canasta básica y ubica las ofertas más convenientes de la ciudad.
        </p>
      </div>

      {/* Control Panel: Search & Filters */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs mb-8">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 focus:outline-none transition-all"
              placeholder="¿Qué producto deseas comparar? (Ej. Leche, Pan, Aceite, Café...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-xs transition-colors flex items-center justify-center space-x-2"
          >
            <Search className="w-4 h-4" />
            <span>Comparar</span>
          </button>
          <button
            type="button"
            onClick={toggleOrden}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-semibold rounded-xl text-xs sm:text-sm transition-colors flex items-center justify-center space-x-2 border border-slate-200"
            title="Alternar criterio de ordenamiento"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
            <span>{orden === 'asc' ? 'Menor precio' : 'Mayor precio'}</span>
          </button>
        </form>

        {/* Quick Search Chips */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 flex items-center mr-1">
            <Tag className="w-3.5 h-3.5 mr-1 text-slate-400" />
            Consultas frecuentes:
          </span>
          {sugerencias.map((sug) => (
            <button
              key={sug}
              onClick={() => handleSugerenciaClick(sug)}
              className="px-3 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 transition-colors"
            >
              {sug}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Stats Widgets */}
      {estadisticas && estadisticas.totalOfertas > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Mejor Precio</span>
              <Trophy className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tabular-nums">
              ${estadisticas.precioMinimo.toLocaleString('es-AR')}
            </div>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">Opción más económica</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Precio Promedio</span>
              <DollarSign className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tabular-nums">
              ${estadisticas.precioPromedio.toLocaleString('es-AR')}
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-1">Media en la ciudad</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Ahorro Potencial</span>
              <Percent className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-indigo-600 font-mono tabular-nums">
              {estadisticas.porcentajeAhorro}%
            </div>
            <p className="text-[11px] text-indigo-600 font-medium mt-1">
              Hasta ${estadisticas.ahorroMaximo.toLocaleString('es-AR')} menos
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Muestras</span>
              <Store className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tabular-nums">
              {estadisticas.totalOfertas}
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-1">Comercios comparados</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 mb-6 flex items-center space-x-3 text-rose-700 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Results Ranking Stream */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : productos.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No se registraron ofertas para "{searchTerm}"</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Prueba buscando con términos como "leche", "aceite", "pan" o "harina".
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {productos.map((prod, index) => {
            const isBestPrice = index === 0 && orden === 'asc';
            return (
              <div
                key={prod._id}
                className={`rounded-2xl p-5 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  isBestPrice
                    ? 'bg-white border-2 border-emerald-500 shadow-md ring-4 ring-emerald-50'
                    : 'bg-white border border-slate-200/80 shadow-xs hover:border-slate-300'
                }`}
              >
                {/* Ranking Position & Product Info */}
                <div className="flex items-start space-x-4 flex-1">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 font-mono ${
                    isBestPrice
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {`${index + 1}°`}
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-base font-bold text-slate-900 leading-snug">{prod.nombre}</h3>
                      {isBestPrice && (
                        <span className="inline-flex items-center space-x-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          <Trophy className="w-3 h-3 text-emerald-600" />
                          <span>Opción Más Económica</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1 mb-2 font-normal">{prod.descripcion}</p>

                    {/* Store Metadata */}
                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-600">
                      <Link 
                        href={`/comercio/${prod.comercioId?._id}`}
                        className="font-bold text-slate-900 hover:text-indigo-600 flex items-center space-x-1"
                      >
                        <Store className="w-3.5 h-3.5 text-slate-400" />
                        <span>{prod.comercioId?.nombre}</span>
                      </Link>

                      {prod.comercioId?.direccion && (
                        <span className="flex items-center space-x-1 text-slate-500">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{prod.comercioId?.direccion}</span>
                        </span>
                      )}

                      <span className="flex items-center space-x-1 text-slate-700 font-semibold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>
                          {prod.comercioId?.calificacionPromedio > 0 ? prod.comercioId.calificacionPromedio.toFixed(1) : 'Nuevo'}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Pricing & CTA */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-0 border-slate-100 gap-3">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">Precio Unitario</span>
                    <span className={`text-2xl font-black font-mono tabular-nums ${isBestPrice ? 'text-emerald-600' : 'text-slate-900'}`}>
                      ${prod.precio.toLocaleString('es-AR')}
                    </span>
                  </div>

                  <Link
                    href={`/comercio/${prod.comercioId?._id}`}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center space-x-1"
                  >
                    <span>Ver vidriera</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
