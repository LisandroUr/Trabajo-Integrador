'use client';

import { useEffect, useState, useMemo } from 'react';
import { fetchAPI, fetchGraphQL } from '@/lib/api';
import Link from 'next/link';
import { 
  Store, 
  Search, 
  MapPin, 
  Star, 
  ArrowRight, 
  ShieldCheck, 
  LayoutGrid, 
  List,
  ArrowUpDown,
  TrendingUp,
  MessageSquare,
  SortAsc
} from 'lucide-react';

interface Categoria {
  _id: string;
  id?: string;
  nombre: string;
}

interface Comercio {
  _id: string;
  id?: string;
  nombre: string;
  descripcion: string;
  direccion?: string;
  rubro?: Categoria;
  contacto?: {
    telefono?: string;
    whatsapp?: string;
  };
  calificacionPromedio: number;
  cantidadResenas?: number;
  categorias: Categoria[];
}

type OrdenTipo = 'calificacion' | 'resenas' | 'nombre' | 'recientes';

export default function BuscarPage() {
  const [comercios, setComercios] = useState<Comercio[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>('todas');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [ordenActivo, setOrdenActivo] = useState<OrdenTipo>('calificacion');

  const loadData = async () => {
    setLoading(true);
    try {
      const [comerciosData, categoriasData] = await Promise.all([
        fetchGraphQL(`query { comercios { id nombre descripcion direccion estado calificacionPromedio rubro { id nombre } categorias { id nombre } logo } }`),
        fetchGraphQL(`query { categorias { id nombre icono } }`)
      ]);
      if (comerciosData && comerciosData.comercios) {
        setComercios(comerciosData.comercios);
      }
      if (categoriasData && categoriasData.categorias) {
        setCategorias(categoriasData.categorias);
      }
    } catch (err) {
      console.error('Error cargando comercios reales:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredComercios = useMemo(() => {
    let resultado = comercios.filter((comercio) => {
      const matchSearch =
        comercio.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (comercio.descripcion || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (comercio.direccion || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchCat =
        categoriaSeleccionada === 'todas' ||
        (comercio.rubro && ((comercio.rubro.id || comercio.rubro._id) === categoriaSeleccionada || comercio.rubro.nombre === categoriaSeleccionada)) ||
        (comercio.categorias &&
          comercio.categorias.some((c) => (c.id || c._id) === categoriaSeleccionada || c.nombre === categoriaSeleccionada));

      return matchSearch && matchCat;
    });

    // Ordenamiento
    switch (ordenActivo) {
      case 'calificacion':
        resultado.sort((a, b) => (b.calificacionPromedio || 0) - (a.calificacionPromedio || 0));
        break;
      case 'resenas':
        resultado.sort((a, b) => (b.cantidadResenas || 0) - (a.cantidadResenas || 0));
        break;
      case 'nombre':
        resultado.sort((a, b) => a.nombre.localeCompare(b.nombre));
        break;
      case 'recientes':
        resultado.sort((a, b) => {
          const idA = Number(a.id || a._id) || 0;
          const idB = Number(b.id || b._id) || 0;
          return idB - idA;
        });
        break;
    }

    return resultado;
  }, [comercios, searchTerm, categoriaSeleccionada, ordenActivo]);

  const ordenOpciones: { key: OrdenTipo; label: string; icon: React.ReactNode }[] = [
    { key: 'calificacion', label: 'Mejor calificación', icon: <Star className="w-3.5 h-3.5" /> },
    { key: 'resenas', label: 'Más reseñas', icon: <MessageSquare className="w-3.5 h-3.5" /> },
    { key: 'nombre', label: 'Nombre A-Z', icon: <SortAsc className="w-3.5 h-3.5" /> },
    { key: 'recientes', label: 'Más recientes', icon: <TrendingUp className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-sky-700 uppercase tracking-wider mb-1">
            <Store className="w-4 h-4 text-sky-500" />
            <span>Directorio Comercial • Vidriera Digital</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Encontrá tu comercio de confianza
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Explorá los comercios adheridos, compará precios y elegí el mejor.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/mapa"
            className="px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-md text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <MapPin className="w-3.5 h-3.5 text-sky-500" />
            <span>Ver mapa</span>
          </Link>

          <div className="flex items-center space-x-1 p-1 rounded-md bg-gray-100 border border-gray-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded text-xs transition-colors ${
                viewMode === 'grid' ? 'bg-white text-gray-900 shadow-xs font-bold' : 'text-gray-500 hover:text-gray-900'
              }`}
              title="Vista Cuadrícula"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded text-xs transition-colors ${
                viewMode === 'list' ? 'bg-white text-gray-900 shadow-xs font-bold' : 'text-gray-500 hover:text-gray-900'
              }`}
              title="Vista Lista"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter, Search & Sort Console */}
      <div className="p-4 rounded-lg bg-white border border-gray-200 shadow-xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre de comercio, rubro o dirección..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-[3px] text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#3483fa] focus:bg-white transition-all shadow-xs"
          />
        </div>

        {categorias.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-gray-100">
            <span className="text-xs text-gray-500 mr-1 font-medium">Rubro:</span>
            <button
              onClick={() => setCategoriaSeleccionada('todas')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                categoriaSeleccionada === 'todas'
                  ? 'bg-[#2d3277] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todos ({comercios.length})
            </button>
            {categorias.map((cat) => (
              <button
                key={cat.id || cat._id || cat.nombre}
                onClick={() => setCategoriaSeleccionada(cat.id || cat._id)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  categoriaSeleccionada === (cat.id || cat._id)
                    ? 'bg-[#2d3277] text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.nombre}
              </button>
            ))}
          </div>
        )}

        {/* Ordenar por */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-gray-100">
          <span className="text-xs text-gray-500 mr-1 font-medium flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5" />
            Ordenar:
          </span>
          {ordenOpciones.map((opcion) => (
            <button
              key={opcion.key}
              onClick={() => setOrdenActivo(opcion.key)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                ordenActivo === opcion.key
                  ? 'bg-sky-500 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {opcion.icon}
              {opcion.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      {!loading && (
        <div className="flex items-center justify-between px-1">
          <p className="text-xs text-gray-500">
            {filteredComercios.length} {filteredComercios.length === 1 ? 'comercio encontrado' : 'comercios encontrados'}
          </p>
        </div>
      )}

      {/* Store Listings */}
      {loading ? (
        <div className="p-16 text-center text-gray-500 text-xs sm:text-sm bg-white rounded-lg border border-gray-200">
          Cargando vidrieras...
        </div>
      ) : filteredComercios.length === 0 ? (
        <div className="p-12 rounded-lg bg-white border border-gray-200 text-center text-gray-600 shadow-xs">
          <p className="text-base font-bold text-gray-900">No se encontraron comercios con ese criterio</p>
          <p className="text-xs text-gray-500 mt-1">Probá con otro rubro o término de búsqueda.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredComercios.map((comercio) => (
            <div
              key={comercio.id || comercio._id}
              className="p-5 rounded-lg bg-white border border-gray-200 hover:border-[#3483fa] hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-11 h-11 rounded-lg bg-blue-50 border border-blue-100 text-sky-700 flex items-center justify-center font-bold text-base shadow-xs">
                    {(comercio?.nombre || 'C').charAt(0).toUpperCase()}
                  </div>
                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-green-50 border border-green-200 text-[#00a650] text-[10px] font-bold">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Habilitado</span>
                  </span>
                </div>

                <h3 className="text-base font-bold text-gray-900 group-hover:text-sky-500 transition-colors">
                  {comercio.nombre}
                </h3>

                <p className="text-xs text-gray-600 mt-1 line-clamp-2 leading-relaxed">
                  {comercio.descripcion || 'Comercio adherido a la plataforma de transparencia comercial.'}
                </p>

                <div className="mt-3 flex items-center space-x-2 text-xs">
                  <div className="flex items-center space-x-1 text-amber-500 font-bold">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>
                      {comercio.calificacionPromedio ? comercio.calificacionPromedio.toFixed(1) : 'Nuevo'}
                    </span>
                  </div>
                  <span className="text-gray-300">•</span>
                  <span className="text-[11px] text-gray-500">
                    {comercio.cantidadResenas ? `${comercio.cantidadResenas} opiniones` : 'Sin opiniones aún'}
                  </span>
                </div>

                {comercio.direccion && (
                  <div className="mt-2.5 flex items-center space-x-1.5 text-xs text-gray-500">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{comercio.direccion}</span>
                  </div>
                )}
              </div>

              <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                <Link
                  href="/mapa"
                  className="text-xs text-sky-500 hover:underline font-medium"
                >
                  Ver en mapa
                </Link>

                <Link
                  href={`/comercio/${comercio.id || comercio._id}`}
                  className="px-3.5 py-1.5 bg-sky-500 hover:bg-[#2968c8] text-white rounded-md text-xs font-semibold transition-colors flex items-center space-x-1.5 shadow-xs"
                >
                  <span>Ver Vidriera</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredComercios.map((comercio) => (
            <div
              key={comercio.id || comercio._id}
              className="p-4 rounded-lg bg-white border border-gray-200 hover:border-[#3483fa] hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 text-sky-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {(comercio?.nombre || 'C').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-bold text-gray-900">{comercio.nombre}</h3>
                    <span className="text-[10px] font-bold text-[#00a650] bg-green-50 border border-green-200 px-1.5 py-0.2 rounded">
                      Habilitado
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 text-xs text-gray-500 mt-0.5">
                    <span className="flex items-center space-x-1 text-amber-500 font-bold">
                      <Star className="w-3 h-3 fill-current" />
                      <span>{comercio.calificacionPromedio ? comercio.calificacionPromedio.toFixed(1) : 'Nuevo'}</span>
                    </span>
                    {comercio.direccion && <span>• {comercio.direccion}</span>}
                  </div>
                </div>
              </div>

              <Link
                href={`/comercio/${comercio.id || comercio._id}`}
                className="px-3.5 py-1.5 bg-sky-500 hover:bg-[#2968c8] text-white rounded-md text-xs font-semibold transition-colors self-end sm:self-auto flex items-center space-x-1 shadow-xs"
              >
                <span>Ver Vidriera</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
