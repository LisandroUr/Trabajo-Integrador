'use client';

import { useEffect, useState } from 'react';
import { fetchAPI } from '@/lib/api';
import Link from 'next/link';
import { 
  Store, 
  Search, 
  MapPin, 
  Star, 
  Filter, 
  TrendingUp, 
  ArrowRight,
  ShoppingBag
} from 'lucide-react';

interface Categoria {
  _id: string;
  nombre: string;
  icono?: string;
}

interface Comercio {
  _id: string;
  nombre: string;
  descripcion: string;
  direccion?: string;
  calificacionPromedio: number;
  cantidadResenas?: number;
  categorias: Categoria[];
}

export default function BuscarPage() {
  const [comercios, setComercios] = useState<Comercio[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [comerciosRes, categoriasRes] = await Promise.all([
        fetchAPI('/comercios?limit=100'),
        fetchAPI('/categorias')
      ]);
      setComercios(comerciosRes.data || []);
      setCategorias(categoriasRes || []);
    } catch (err) {
      console.error('Error cargando comercios:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const comerciosFiltrados = comercios.filter((c) => {
    const matchNombre = c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (c.descripcion && c.descripcion.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.direccion && c.direccion.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchCategoria = categoriaSeleccionada
      ? c.categorias?.some((cat) => (cat._id || cat) === categoriaSeleccionada)
      : true;

    return matchNombre && matchCategoria;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Header */}
      <div className="text-center py-8 sm:py-12 max-w-3xl mx-auto">
        <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
          <Store className="w-4 h-4 text-blue-600" />
          <span>Directorio Comercial Oficial</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-gray-900">
          Descubre los Comercios de tu Ciudad
        </h1>
        <p className="mt-3 text-base text-gray-600 max-w-2xl mx-auto">
          Apoya la economía local. Encuentra productos de calidad, compara precios y contacta a los emprendedores de tu barrio.
        </p>

        {/* Barra de Búsqueda */}
        <div className="mt-8 max-w-xl mx-auto flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" />
            <input
              type="text"
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 shadow-xs focus:ring-2 focus:ring-blue-500 text-base"
              placeholder="¿Qué comercio o producto buscas?"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="px-4 py-3 text-sm text-gray-500 hover:text-gray-800 bg-gray-100 rounded-xl"
            >
              Limpiar
            </button>
          )}
        </div>

        {/* Chips de Categorías */}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => setCategoriaSeleccionada('')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors ${
              categoriaSeleccionada === ''
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
            }`}
          >
            Todas
          </button>
          {categorias.map((cat) => (
            <button
              key={cat._id}
              onClick={() => setCategoriaSeleccionada(cat._id === categoriaSeleccionada ? '' : cat._id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors flex items-center space-x-1.5 ${
                categoriaSeleccionada === cat._id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span>{cat.nombre}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Banner de acceso directo al Ranking de Precios */}
      <div className="mb-10 bg-gradient-to-r from-green-600 to-emerald-700 rounded-2xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-white">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black leading-tight">¿Buscas el precio más bajo?</h3>
            <p className="text-xs text-green-100">
              Compara en tiempo real los precios de alimentos, limpieza y farmacia entre comercios.
            </p>
          </div>
        </div>
        <Link
          href="/ranking"
          className="px-5 py-2.5 bg-white text-green-800 text-xs font-black rounded-xl hover:bg-green-50 shadow-xs transition-colors flex-shrink-0"
        >
          Ir al Ranking de Precios &rarr;
        </Link>
      </div>

      {/* Grilla de Vidrieras */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black text-gray-900">
            Vidrieras Activas ({comerciosFiltrados.length})
          </h2>
          <Link href="/mapa" className="text-xs font-bold text-blue-600 hover:underline flex items-center space-x-1">
            <MapPin className="w-3.5 h-3.5" />
            <span>Ver todas en el mapa &rarr;</span>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-200 h-64 rounded-2xl"></div>
            ))}
          </div>
        ) : comerciosFiltrados.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 shadow-xs">
            <Store className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-600 font-bold text-base">No se encontraron comercios</p>
            <p className="text-gray-400 text-xs mt-1">Prueba con otro término o categoría.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {comerciosFiltrados.map((comercio) => (
              <Link href={`/comercio/${comercio._id}`} key={comercio._id} className="group flex flex-col">
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs group-hover:shadow-lg group-hover:border-blue-400 transition-all flex flex-col h-full">
                  <div className="h-32 bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center overflow-hidden">
                    <span className="text-5xl group-hover:scale-110 transition-transform duration-300">🏪</span>
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                        {comercio.categorias?.[0]?.nombre || 'Comercio'}
                      </span>
                      <div className="flex items-center text-xs font-bold text-yellow-700 bg-yellow-50 px-2 py-0.5 rounded">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-1" />
                        <span>
                          {comercio.calificacionPromedio > 0 ? comercio.calificacionPromedio.toFixed(1) : 'Nuevo'}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1 mb-1">
                      {comercio.nombre}
                    </h3>
                    
                    <p className="text-xs text-gray-500 line-clamp-2 mb-3 flex-1">
                      {comercio.descripcion || 'Sin descripción detallada.'}
                    </p>

                    {comercio.direccion && (
                      <p className="text-[11px] text-gray-400 flex items-center mb-3">
                        <MapPin className="w-3 h-3 text-red-400 mr-1 flex-shrink-0" />
                        <span className="truncate">{comercio.direccion}</span>
                      </p>
                    )}

                    <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-blue-600">
                      <span>Ver Vidriera</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
