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
  Building,
  LayoutGrid,
  List
} from 'lucide-react';

interface Categoria {
  _id: string;
  nombre: string;
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-[#232833] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-medium text-[#7a93b5] mb-2">
            <Store className="w-4 h-4" />
            <span>Padrón Comercial Oficial • Bahía Blanca</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#e2e5eb]">
            Directorio de Vidrieras Digitales
          </h1>
          <p className="text-xs text-[#8d94a1] mt-1 max-w-xl">
            Establecimientos y pequeños emprendimientos barriales con habilitación e información de precios verificada.
          </p>
        </div>

        <div className="flex items-center space-x-1 p-1 rounded-xl bg-[#171b22] border border-[#232833]">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg text-xs transition-colors ${
              viewMode === 'grid' ? 'bg-[#252c38] text-[#e2e5eb]' : 'text-[#8d94a1] hover:text-[#d5d9e0]'
            }`}
            title="Vista Cuadrícula"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg text-xs transition-colors ${
              viewMode === 'list' ? 'bg-[#252c38] text-[#e2e5eb]' : 'text-[#8d94a1] hover:text-[#d5d9e0]'
            }`}
            title="Vista Lista"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-[#171b22] border border-[#232833] space-y-3">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6b7280]" />
          <input
            type="text"
            placeholder="Buscar por denominación de comercio, rubro o calle..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#12151b] border border-[#232833] rounded-xl text-xs text-[#e2e5eb] placeholder:text-[#5f6674] focus:outline-none focus:border-[#384354]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#232833]">
          <span className="text-[11px] text-[#6b7280] mr-1">Rubro:</span>
          <button
            onClick={() => setCategoriaSeleccionada('todas')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              categoriaSeleccionada === 'todas'
                ? 'bg-[#252c38] text-[#e2e5eb] border border-[#374254]'
                : 'bg-[#12151b] text-[#8d94a1] hover:text-[#d5d9e0] border border-[#232833]'
            }`}
          >
            Todos ({comercios.length})
          </button>
          {categorias.map((cat) => (
            <button
              key={cat._id}
              onClick={() => setCategoriaSeleccionada(cat._id)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                categoriaSeleccionada === cat._id
                  ? 'bg-[#252c38] text-[#e2e5eb] border border-[#374254]'
                  : 'bg-[#12151b] text-[#8d94a1] hover:text-[#d5d9e0] border border-[#232833]'
              }`}
            >
              {cat.nombre}
            </button>
          ))}
        </div>
      </div>

      {/* Store Listings */}
      {loading ? (
        <div className="p-16 text-center text-[#78808f] text-xs">
          Cargando vidrieras habilitadas...
        </div>
      ) : filteredComercios.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#171b22] border border-[#232833] text-center text-[#8d94a1]">
          <p className="text-sm font-semibold text-[#e2e5eb]">No se hallaron locales con ese criterio</p>
          <p className="text-xs text-[#78808f] mt-1">Prueba con otro rubro o búsqueda de texto.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredComercios.map((comercio) => (
            <div
              key={comercio._id}
              className="p-5 rounded-2xl bg-[#171b22] border border-[#232833] hover:border-[#2f3745] transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-[#1f2633] border border-[#2b3547] text-[#9cb1ce] flex items-center justify-center font-medium text-sm">
                    {comercio.nombre.charAt(0).toUpperCase()}
                  </div>
                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-[#1e2a23] border border-[#2b3e34] text-[#8bb59b] text-[10px] font-medium">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Habilitado</span>
                  </span>
                </div>

                <h3 className="text-base font-semibold text-[#e2e5eb]">
                  {comercio.nombre}
                </h3>

                <p className="text-xs text-[#8d94a1] mt-1 line-clamp-2 leading-relaxed">
                  {comercio.descripcion || 'Comercio adherido al programa de transparencia municipal.'}
                </p>

                <div className="mt-3 flex items-center space-x-2 text-xs">
                  <div className="flex items-center space-x-1 text-[#d1ab77]">
                    <Star className="w-3.5 h-3.5 fill-[#d1ab77]" />
                    <span className="font-semibold text-[#e2e5eb]">
                      {comercio.calificacionPromedio ? comercio.calificacionPromedio.toFixed(1) : 'Nuevo'}
                    </span>
                  </div>
                  <span className="text-[#6b7280]">•</span>
                  <span className="text-[11px] text-[#78808f]">
                    {comercio.cantidadResenas ? `${comercio.cantidadResenas} opiniones` : 'Sin opiniones'}
                  </span>
                </div>

                {comercio.direccion && (
                  <div className="mt-2.5 flex items-center space-x-1.5 text-xs text-[#78808f]">
                    <MapPin className="w-3 h-3 text-[#6b7280] flex-shrink-0" />
                    <span className="truncate">{comercio.direccion}</span>
                  </div>
                )}
              </div>

              <div className="mt-5 pt-4 border-t border-[#232833] flex items-center justify-between">
                <Link
                  href="/mapa"
                  className="text-xs text-[#78808f] hover:text-[#c8cdd6] transition-colors"
                >
                  Ubicación
                </Link>

                <Link
                  href={`/comercio/${comercio._id}`}
                  className="px-3 py-1.5 bg-[#252c38] hover:bg-[#2e3745] text-[#e2e5eb] border border-[#343e4f] rounded-lg text-xs font-medium transition-colors flex items-center space-x-1.5"
                >
                  <span>Ver Vidriera</span>
                  <ArrowRight className="w-3 h-3 text-[#9cb1ce]" />
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
              className="p-4 rounded-xl bg-[#171b22] border border-[#232833] hover:border-[#2f3745] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-center space-x-3.5">
                <div className="w-9 h-9 rounded-lg bg-[#1f2633] border border-[#2b3547] text-[#9cb1ce] flex items-center justify-center font-medium text-xs flex-shrink-0">
                  {comercio.nombre.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-semibold text-[#e2e5eb]">{comercio.nombre}</h3>
                    <span className="text-[10px] text-[#8bb59b] bg-[#1e2a23] border border-[#2b3e34] px-1.5 py-0.2 rounded">
                      Habilitado
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 text-xs text-[#78808f] mt-0.5">
                    <span className="flex items-center space-x-1 text-[#d1ab77]">
                      <Star className="w-3 h-3 fill-[#d1ab77]" />
                      <span className="text-[#e2e5eb]">{comercio.calificacionPromedio ? comercio.calificacionPromedio.toFixed(1) : 'Nuevo'}</span>
                    </span>
                    {comercio.direccion && <span>{comercio.direccion}</span>}
                  </div>
                </div>
              </div>

              <Link
                href={`/comercio/${comercio._id}`}
                className="px-3 py-1.5 bg-[#252c38] hover:bg-[#2e3745] text-[#e2e5eb] border border-[#343e4f] rounded-lg text-xs font-medium transition-colors self-end sm:self-auto flex items-center space-x-1"
              >
                <span>Ver Vidriera</span>
                <ArrowRight className="w-3 h-3 text-[#9cb1ce]" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
