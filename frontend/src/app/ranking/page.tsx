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
  Award, 
  DollarSign, 
  Percent, 
  AlertCircle,
  MessageSquare
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
      setError(err.message || 'Error al buscar el ranking');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Carga inicial con término popular (Leche)
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Cabecera Principal */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
          <TrendingUp className="w-4 h-4 text-green-600" />
          <span>Observatorio de Precios y Transparencia Municipal</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
          Comparador y Ranking de Precios
        </h1>
        <p className="mt-2 text-base sm:text-lg text-gray-600">
          Encuentra qué comercio de la ciudad tiene el producto que necesitas al menor precio y ahorra en tus compras diarias.
        </p>
      </div>

      {/* Buscador y Filtros */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-8">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" />
            <input
              type="text"
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
              placeholder="¿Qué producto deseas comparar? (Ej. Leche, Pan, Aceite...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-2"
          >
            <Search className="w-4 h-4" />
            <span>Comparar Precios</span>
          </button>
          <button
            type="button"
            onClick={toggleOrden}
            className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors flex items-center justify-center space-x-2 border border-gray-200"
            title="Cambiar orden de precio"
          >
            <ArrowUpDown className="w-4 h-4 text-gray-500" />
            <span className="text-sm">
              {orden === 'asc' ? 'Menor precio primero' : 'Mayor precio primero'}
            </span>
          </button>
        </form>

        {/* Sugerencias Rápidas */}
        <div className="mt-4 flex flex-wrap items-center gap-2 pt-3 border-t border-gray-100">
          <span className="text-xs font-semibold text-gray-500 flex items-center">
            <Tag className="w-3.5 h-3.5 mr-1" />
            Búsquedas frecuentes:
          </span>
          {sugerencias.map((sug) => (
            <button
              key={sug}
              onClick={() => handleSugerenciaClick(sug)}
              className="px-3 py-1 bg-gray-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-gray-200 rounded-full text-xs font-medium text-gray-700 transition-colors"
            >
              {sug}
            </button>
          ))}
        </div>
      </div>

      {/* Métricas de Estadísticas */}
      {estadisticas && estadisticas.totalOfertas > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 border border-green-200 bg-green-50/40 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-green-700 uppercase">Mejor Precio</span>
              <Award className="w-5 h-5 text-green-600" />
            </div>
            <p className="mt-2 text-2xl font-black text-green-700">
              ${estadisticas.precioMinimo.toLocaleString('es-AR')}
            </p>
            <p className="text-[11px] text-green-600 font-medium">Opción más económica</p>
          </div>

          <div className="bg-white rounded-xl p-4 border border-blue-200 bg-blue-50/40 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-700 uppercase">Precio Promedio</span>
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <p className="mt-2 text-2xl font-black text-blue-700">
              ${estadisticas.precioPromedio.toLocaleString('es-AR')}
            </p>
            <p className="text-[11px] text-blue-600 font-medium">Promedio en la ciudad</p>
          </div>

          <div className="bg-white rounded-xl p-4 border border-purple-200 bg-purple-50/40 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-700 uppercase">Ahorro Potencial</span>
              <Percent className="w-5 h-5 text-purple-600" />
            </div>
            <p className="mt-2 text-2xl font-black text-purple-700">
              {estadisticas.porcentajeAhorro}%
            </p>
            <p className="text-[11px] text-purple-600 font-medium">Hasta ${estadisticas.ahorroMaximo.toLocaleString('es-AR')} menos</p>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200 bg-gray-50 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700 uppercase">Comercios con Stock</span>
              <Store className="w-5 h-5 text-gray-600" />
            </div>
            <p className="mt-2 text-2xl font-black text-gray-800">
              {estadisticas.totalOfertas}
            </p>
            <p className="text-[11px] text-gray-500 font-medium">Opciones comparadas</p>
          </div>
        </div>
      )}

      {/* Listado del Ranking */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center space-x-3 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-gray-200 rounded-2xl"></div>
          ))}
        </div>
      ) : productos.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-xs">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
            🔍
          </div>
          <h3 className="text-xl font-bold text-gray-800">No encontramos ofertas para "{searchTerm}"</h3>
          <p className="text-gray-500 max-w-md mx-auto mt-2 text-sm">
            Prueba buscando con palabras más genéricas como "leche", "aceite", "pan", "harina" o "café".
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {productos.map((prod, index) => {
            const isBestPrice = index === 0 && orden === 'asc';
            return (
              <div
                key={prod._id}
                className={`bg-white rounded-2xl border transition-all p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  isBestPrice 
                    ? 'border-green-400 ring-2 ring-green-100 shadow-md bg-gradient-to-r from-green-50/30 to-white' 
                    : 'border-gray-200 shadow-xs hover:border-blue-300'
                }`}
              >
                {/* Posición y Datos del Producto */}
                <div className="flex items-start space-x-4 flex-1">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-base flex-shrink-0 ${
                    isBestPrice 
                      ? 'bg-green-600 text-white shadow-sm' 
                      : index === 1 ? 'bg-gray-200 text-gray-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {isBestPrice ? '1°' : `${index + 1}°`}
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-gray-900 leading-snug">{prod.nombre}</h3>
                      {isBestPrice && (
                        <span className="bg-green-100 text-green-800 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center space-x-1">
                          <Award className="w-3 h-3 text-green-600" />
                          <span>¡Más Económico!</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-1 mb-2">{prod.descripcion}</p>

                    {/* Información del Comercio */}
                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-gray-600">
                      <Link 
                        href={`/comercio/${prod.comercioId?._id}`} 
                        className="font-bold text-blue-600 hover:underline flex items-center space-x-1"
                      >
                        <Store className="w-3.5 h-3.5" />
                        <span>{prod.comercioId?.nombre}</span>
                      </Link>

                      {prod.comercioId?.direccion && (
                        <span className="flex items-center space-x-1 text-gray-500">
                          <MapPin className="w-3.5 h-3.5 text-red-400" />
                          <span>{prod.comercioId?.direccion}</span>
                        </span>
                      )}

                      <span className="bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded font-bold">
                        ★ {prod.comercioId?.calificacionPromedio > 0 ? prod.comercioId.calificacionPromedio.toFixed(1) : 'Nuevo'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Precio y Botones de Acción */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-0 border-gray-100 gap-2">
                  <div className="text-left sm:text-right">
                    <span className="text-xs text-gray-400 block font-medium">Precio por unidad</span>
                    <span className={`text-2xl sm:text-3xl font-black ${isBestPrice ? 'text-green-600' : 'text-gray-900'}`}>
                      ${prod.precio.toLocaleString('es-AR')}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/comercio/${prod.comercioId?._id}`}
                      className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg transition-colors"
                    >
                      Ver Vidriera
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
