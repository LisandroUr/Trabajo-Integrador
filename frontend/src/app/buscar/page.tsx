'use client';

import { useEffect, useState, useMemo } from 'react';
import { fetchAPI } from '@/lib/api';
import Link from 'next/link';
import { 
  Store, 
  Search, 
  MapPin, 
  Star, 
  ArrowRight,
  ShieldCheck,
  Building2,
  Filter,
  LayoutGrid,
  List,
  Sparkles,
  Phone,
  CheckCircle2,
  ExternalLink
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
  contacto?: {
    telefono?: string;
    email?: string;
  };
}

export default function BuscarPage() {
  const [comercios, setComercios] = useState<Comercio[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>('todas');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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

  const filteredComercios = useMemo(() => {
    return comercios.filter((comercio) => {
      const matchSearch =
        comercio.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (comercio.descripcion || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (comercio.direccion || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchCat =
        categoriaSeleccionada === 'todas' ||
        (comercio.categorias &&
          comercio.categorias.some((c) => c._id === categoriaSeleccionada || c.nombre === categoriaSeleccionada));

      return matchSearch && matchCat;
    });
  }, [comercios, searchTerm, categoriaSeleccionada]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border border-white/10 p-8 sm:p-12 mb-10 shadow-2xl">
        <div className="max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-4">
            <Store className="w-3.5 h-3.5 text-indigo-400" />
            <span>Directorio de Vidrieras Habilitadas</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Comercios & Negocios de Cercanía
          </h1>
          <p className="mt-3 text-sm text-slate-300 leading-relaxed">
            Descubre emprendimientos, panaderías, almacenes y supermercados de Bahía Blanca con catálogos actualizados y habilitación oficial municipal.
          </p>
        </div>
      </div>

      {/* Search and Filter Panel */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 shadow-xl backdrop-blur-xl mb-10 space-y-5">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nombre de comercio, rubro o dirección..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-white/10 rounded-2xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>

          <div className="flex items-center space-x-2 self-end md:self-auto">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2.5 rounded-xl border transition-all ${
                viewMode === 'grid'
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                  : 'bg-slate-950/60 text-slate-400 border-white/10 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2.5 rounded-xl border transition-all ${
                viewMode === 'list'
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                  : 'bg-slate-950/60 text-slate-400 border-white/10 hover:text-white'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Categories Carousel / Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-white/5">
          <span className="text-xs text-slate-400 font-bold mr-1">Rubro:</span>
          <button
            onClick={() => setCategoriaSeleccionada('todas')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              categoriaSeleccionada === 'todas'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            Todos ({comercios.length})
          </button>
          {categorias.map((cat) => (
            <button
              key={cat._id}
              onClick={() => setCategoriaSeleccionada(cat._id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                categoriaSeleccionada === cat._id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {cat.nombre}
            </button>
          ))}
        </div>
      </div>

      {/* Store Listings */}
      {loading ? (
        <div className="p-20 text-center text-slate-400">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm font-semibold">Cargando vidrieras comerciales habilitadas...</p>
        </div>
      ) : filteredComercios.length === 0 ? (
        <div className="p-16 rounded-3xl bg-slate-900/50 border border-white/5 text-center text-slate-400">
          <Store className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <p className="text-base font-bold text-white">No se encontraron comercios</p>
          <p className="text-xs text-slate-400 mt-1">Prueba con otro rubro o búsqueda de texto.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredComercios.map((comercio) => (
            <div
              key={comercio._id}
              className="p-6 rounded-3xl bg-slate-900/70 border border-white/10 hover:border-indigo-500/40 transition-all shadow-xl backdrop-blur-xl flex flex-col justify-between group"
            >
              <div>
                {/* Store Avatar + Verified Badge */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white font-black text-lg flex items-center justify-center shadow-lg shadow-indigo-600/25 group-hover:scale-105 transition-transform">
                    {comercio.nombre.charAt(0).toUpperCase()}
                  </div>
                  <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full text-[10px] font-bold">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Habilitado</span>
                  </span>
                </div>

                <h3 className="text-lg font-black text-white group-hover:text-indigo-300 transition-colors">
                  {comercio.nombre}
                </h3>

                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {comercio.descripcion || 'Sin descripción disponible.'}
                </p>

                {/* Rating & Reviews */}
                <div className="mt-4 flex items-center space-x-2">
                  <div className="flex items-center text-amber-400">
                    <Star className="w-4 h-4 fill-amber-400" />
                    <span className="ml-1 text-xs font-black text-white">
                      {comercio.calificacionPromedio ? comercio.calificacionPromedio.toFixed(1) : 'Nuevo'}
                    </span>
                  </div>
                  <span className="text-slate-600">•</span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {comercio.cantidadResenas ? `${comercio.cantidadResenas} opiniones` : 'Sin opiniones aún'}
                  </span>
                </div>

                {/* Address info */}
                {comercio.direccion && (
                  <div className="mt-3 flex items-center space-x-1.5 text-xs text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                    <span className="truncate">{comercio.direccion}</span>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="mt-6 pt-5 border-t border-white/5 flex items-center justify-between">
                <Link
                  href="/mapa"
                  className="text-xs font-semibold text-slate-400 hover:text-white flex items-center space-x-1 transition-colors"
                >
                  <MapPin className="w-3 h-3 text-cyan-400" />
                  <span>Ver en mapa</span>
                </Link>

                <Link
                  href={`/comercio/${comercio._id}`}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all flex items-center space-x-1.5"
                >
                  <span>Explorar Vidriera</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredComercios.map((comercio) => (
            <div
              key={comercio._id}
              className="p-5 rounded-2xl bg-slate-900/70 border border-white/10 hover:border-indigo-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center space-x-4">
                <div className="w-11 h-11 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 font-black flex items-center justify-center text-base flex-shrink-0">
                  {comercio.nombre.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-sm text-white">{comercio.nombre}</h3>
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold rounded-md">
                      Verificado
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1">
                    <span className="flex items-center space-x-1 text-amber-400">
                      <Star className="w-3 h-3 fill-amber-400" />
                      <span className="font-bold text-white">{comercio.calificacionPromedio?.toFixed(1) || 'Nuevo'}</span>
                    </span>
                    {comercio.direccion && (
                      <span className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        <span>{comercio.direccion}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 self-end sm:self-auto">
                <Link
                  href={`/comercio/${comercio._id}`}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/25 transition-all flex items-center space-x-1"
                >
                  <span>Ver Vidriera</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
