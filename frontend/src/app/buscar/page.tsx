'use client';

import { useEffect, useState } from 'react';
import { fetchAPI } from '@/lib/api';
import Link from 'next/link';
import { 
  Store, 
  Search, 
  MapPin, 
  Star, 
  TrendingUp, 
  ArrowRight,
  ShieldCheck,
  Building2,
  ChevronRight,
  Filter
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page Header */}
      <div className="max-w-3xl mb-10">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold uppercase tracking-wider mb-3">
          <Store className="w-3.5 h-3.5 text-slate-500" />
          <span>Registro Comercial Municipal</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Directorio de Comercios y Emprendedores
        </h1>
        <p className="mt-2 text-sm text-slate-500 font-normal leading-relaxed">
          Encuentra los locales habilitados en tu barrio, consulta sus catálogos con precios oficiales y conoce la opinión de otros vecinos.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs mb-8 space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 focus:outline-none transition-all"
            placeholder="Buscar comercio por nombre, rubro o dirección..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-400 flex items-center mr-1">
            <Filter className="w-3 h-3 mr-1" />
            Categoría:
          </span>
          <button
            onClick={() => setCategoriaSeleccionada('')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              categoriaSeleccionada === ''
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            Todas
          </button>
          {categorias.map((cat) => (
            <button
              key={cat._id}
              onClick={() => setCategoriaSeleccionada(cat._id === categoriaSeleccionada ? '' : cat._id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                categoriaSeleccionada === cat._id
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              {cat.nombre}
            </button>
          ))}
        </div>
      </div>

      {/* Callout: Ranking de Precios */}
      <div className="mb-10 rounded-2xl bg-slate-900 p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 flex-shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold leading-snug">¿Buscas el mejor precio en un producto específico?</h3>
            <p className="text-xs text-slate-400 font-normal">
              Utiliza el Observatorio de Precios para comparar artículos idénticos entre diferentes comercios.
            </p>
          </div>
        </div>
        <Link
          href="/ranking"
          className="px-4 py-2 bg-white text-slate-900 text-xs font-bold rounded-xl hover:bg-slate-100 shadow-xs transition-colors flex items-center space-x-1 flex-shrink-0"
        >
          <span>Ir al Comparador</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Store Cards Grid */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            {comerciosFiltrados.length} {comerciosFiltrados.length === 1 ? 'comercio registrado' : 'comercios registrados'}
          </h2>
          <Link href="/mapa" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1">
            <MapPin className="w-3.5 h-3.5" />
            <span>Ver mapa</span>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 bg-slate-100 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : comerciosFiltrados.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-14 text-center shadow-xs">
            <Store className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800">No se encontraron comercios</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              Intenta con otra búsqueda o limpia el filtro de categorías.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {comerciosFiltrados.map((comercio) => (
              <Link
                key={comercio._id}
                href={`/comercio/${comercio._id}`}
                className="group flex flex-col bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
              >
                {/* Visual Cover Banner */}
                <div className="h-28 bg-gradient-to-br from-slate-900 to-slate-800 p-4 flex flex-col justify-between text-white relative">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-white/10 backdrop-blur-xs px-2.5 py-0.5 rounded-md border border-white/10">
                      {comercio.categorias?.[0]?.nombre || 'Comercio'}
                    </span>
                    <span className="flex items-center space-x-1 text-xs font-bold text-white bg-black/30 px-2 py-0.5 rounded-md backdrop-blur-xs">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{comercio.calificacionPromedio > 0 ? comercio.calificacionPromedio.toFixed(1) : 'Nuevo'}</span>
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-lg bg-white text-slate-900 flex items-center justify-center font-bold text-xs">
                      <Store className="w-3.5 h-3.5 text-slate-800" />
                    </div>
                    <span className="text-xs text-slate-300 font-medium">Habilitado</span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 mb-1">
                    {comercio.nombre}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-4 font-normal leading-relaxed flex-1">
                    {comercio.descripcion || 'Comercio adherido a la red de vidrieras municipales.'}
                  </p>

                  {comercio.direccion && (
                    <div className="flex items-center text-xs text-slate-400 mb-4 truncate">
                      <MapPin className="w-3.5 h-3.5 mr-1 flex-shrink-0 text-slate-400" />
                      <span className="truncate">{comercio.direccion}</span>
                    </div>
                  )}

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-900 group-hover:text-indigo-600">
                    <span>Ver catálogo</span>
                    <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
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
