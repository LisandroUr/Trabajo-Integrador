'use client';

import { useState, useEffect } from 'react';
import { fetchDjangoAPI } from '@/lib/api';
import MapaComercios from '@/components/MapaComercios';
import Link from 'next/link';
import { 
  MapPin, 
  Store, 
  Search, 
  Star, 
  ArrowRight, 
  Navigation,
  Compass,
  Filter,
  ShieldCheck
} from 'lucide-react';

export default function MapaPage() {
  const [comercios, setComercios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroTexto, setFiltroTexto] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [categorias, setCategorias] = useState<any[]>([]);
  const [selectedCenter, setSelectedCenter] = useState<[number, number]>([-29.1436, -59.2658]);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [comerciosRes, categoriasRes] = await Promise.all([
          fetchDjangoAPI('/comercios/'),
          fetchDjangoAPI('/categorias/')
        ]);
        setComercios(comerciosRes || []);
        setCategorias(categoriasRes || []);
      } catch (err) {
        console.error('Error cargando mapa:', err);
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, []);

  const comerciosFiltrados = comercios.filter((c) => {
    const matchTexto = 
      c.nombre.toLowerCase().includes(filtroTexto.toLowerCase()) ||
      (c.direccion && c.direccion.toLowerCase().includes(filtroTexto.toLowerCase()));
    
    const matchCat = categoriaSeleccionada
      ? c.categorias?.some((cat: any) => (cat._id || cat) === categoriaSeleccionada)
      : true;

    return matchTexto && matchCat;
  });

  const handleFocusComercio = (c: any) => {
    if (c.ubicacion?.coordinates) {
      // In GeoJSON: [longitude, latitude]. In Leaflet: [latitude, longitude]
      setSelectedCenter([c.ubicacion.coordinates[1], c.ubicacion.coordinates[0]]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header Banner - Institutional Muted Graphite */}
      <div className="rounded-2xl bg-white border border-slate-200 p-8 sm:p-10 mb-8 shadow-sm">
        <div className="max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full badge-steel text-xs font-semibold tracking-wider mb-3">
            <Compass className="w-3.5 h-3.5" />
            <span>Georreferenciación Comercial</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-700 tracking-tight">
            Mapa de Vidrieras Habilitadas
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
            Explora las vidrieras comerciales habilitadas de tu ciudad en la cuadrícula georreferenciada. Selecciona cualquier comercio para ubicarlo y consultar su catálogo.
          </p>
        </div>
      </div>

      {/* Main Split Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 5 Cols: Search & Interactive List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Filtrar por comercio o calle..."
                value={filtroTexto}
                onChange={(e) => setFiltroTexto(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#f0f6fa] border border-slate-200 rounded-xl text-xs text-slate-700 placeholder:text-slate-500/60 focus:outline-none focus:border-sky-500 transition-colors"
              />
            </div>

            {/* Category selection */}
            {categorias.length > 0 && (
              <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
                <button
                  onClick={() => setCategoriaSeleccionada('')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors flex-shrink-0 ${
                    categoriaSeleccionada === ''
                      ? 'bg-[#4b6cb7] text-slate-700'
                      : 'bg-[#1d222b] text-slate-500 hover:text-slate-700 border border-slate-200'
                  }`}
                >
                  Todos ({comercios.length})
                </button>
                {categorias.map((cat) => (
                  <button
                    key={cat.id || cat._id || cat.nombre}
                    onClick={() => setCategoriaSeleccionada(cat.id || cat._id)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors flex-shrink-0 ${
                      categoriaSeleccionada === (cat.id || cat._id)
                        ? 'bg-[#4b6cb7] text-slate-700'
                        : 'bg-[#1d222b] text-slate-500 hover:text-slate-700 border border-slate-200'
                    }`}
                  >
                    {cat.nombre}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Store List */}
          <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
            {loading ? (
              <div className="p-10 text-center text-slate-500 text-xs font-medium">
                Cargando mapa y puntos comerciales...
              </div>
            ) : comerciosFiltrados.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs rounded-xl bg-white border border-slate-200">
                No hay comercios que coincidan con la búsqueda.
              </div>
            ) : (
              comerciosFiltrados.map((comercio) => (
                <div
                  key={comercio.id || comercio._id}
                  onClick={() => handleFocusComercio(comercio)}
                  className="p-4 rounded-xl bg-white border border-slate-200 hover:border-sky-500/60 transition-colors shadow-xs cursor-pointer group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-700 group-hover:text-slate-500 transition-colors">
                        {comercio.nombre}
                      </h4>
                      <div className="flex items-center space-x-1.5 text-xs text-slate-500 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-sky-600 flex-shrink-0" />
                        <span className="truncate max-w-[220px]">{comercio.direccion || 'Ubicación local'}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 text-[#b8860b] text-xs font-bold">
                      <Star className="w-3 h-3 fill-[#b8860b]" />
                      <span>{comercio.calificacionPromedio ? comercio.calificacionPromedio.toFixed(1) : 'Nuevo'}</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-[11px] text-[#7dafb5] font-semibold flex items-center space-x-1">
                      <Navigation className="w-3 h-3" />
                      <span>Centrar en mapa</span>
                    </span>

                    <Link
                      href={`/comercio/${comercio.id || comercio._id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="px-3 py-1 rounded-lg bg-[#4b6cb7] hover:bg-[#3d5a99] text-slate-700 text-xs font-semibold transition-colors flex items-center space-x-1"
                    >
                      <span>Ver Vidriera</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right 7 Cols: Map View */}
        <div className="lg:col-span-7 rounded-2xl overflow-hidden border border-slate-200 shadow-xs bg-white relative">
          <div className="h-[680px] w-full">
            <MapaComercios
              comercios={comerciosFiltrados}
              centro={selectedCenter}
              zoom={14}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
