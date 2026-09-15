'use client';

import { useState, useEffect } from 'react';
import { fetchAPI } from '@/lib/api';
import MapaComercios from '@/components/MapaComercios';
import Link from 'next/link';
import { 
  MapPin, 
  Store, 
  Search, 
  Star, 
  ArrowRight, 
  Phone, 
  ShieldCheck, 
  Navigation,
  Compass
} from 'lucide-react';

export default function MapaPage() {
  const [comercios, setComercios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroTexto, setFiltroTexto] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [categorias, setCategorias] = useState<any[]>([]);
  const [selectedCenter, setSelectedCenter] = useState<[number, number]>([-38.7183, -62.2642]);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [comerciosRes, categoriasRes] = await Promise.all([
          fetchAPI('/comercios?limit=100'),
          fetchAPI('/categorias')
        ]);
        setComercios(comerciosRes.data || []);
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
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-white/10 p-8 sm:p-10 mb-8 shadow-2xl backdrop-blur-xl">
        <div className="max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-3">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>Cartografía Abierta y Georreferenciación Municipal</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Mapa Interactivo de Comercios
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
            Explora las vidrieras comerciales habilitadas de Bahía Blanca en el mapa interactivo. Selecciona cualquier comercio para ubicarlo al instante.
          </p>
        </div>
      </div>

      {/* Main Split Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 5 Cols: Search & Interactive List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-3xl bg-slate-900/80 border border-white/10 shadow-xl backdrop-blur-xl space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Filtrar por comercio o calle..."
                value={filtroTexto}
                onChange={(e) => setFiltroTexto(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-white/10 rounded-2xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Category selection */}
            {categorias.length > 0 && (
              <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
                <button
                  onClick={() => setCategoriaSeleccionada('')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
                    categoriaSeleccionada === ''
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  Todos ({comercios.length})
                </button>
                {categorias.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => setCategoriaSeleccionada(cat._id)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
                      categoriaSeleccionada === cat._id
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'bg-white/5 text-slate-400 hover:text-white'
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
              <div className="p-10 text-center text-slate-400 text-xs font-semibold">
                Cargando mapa y puntos comerciales...
              </div>
            ) : comerciosFiltrados.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs rounded-2xl bg-slate-900/50 border border-white/5">
                No hay comercios que coincidan con la búsqueda.
              </div>
            ) : (
              comerciosFiltrados.map((comercio) => (
                <div
                  key={comercio._id}
                  onClick={() => handleFocusComercio(comercio)}
                  className="p-4 rounded-2xl bg-slate-900/70 border border-white/10 hover:border-cyan-500/40 transition-all shadow-md backdrop-blur-xl cursor-pointer group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {comercio.nombre}
                      </h4>
                      <div className="flex items-center space-x-1.5 text-xs text-slate-400 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                        <span className="truncate max-w-[220px]">{comercio.direccion || 'Bahía Blanca'}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 text-amber-400 text-xs font-bold">
                      <Star className="w-3 h-3 fill-amber-400" />
                      <span>{comercio.calificacionPromedio ? comercio.calificacionPromedio.toFixed(1) : 'Nuevo'}</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[10px] text-cyan-400 font-semibold flex items-center space-x-1">
                      <Navigation className="w-3 h-3" />
                      <span>Centrar en mapa</span>
                    </span>

                    <Link
                      href={`/comercio/${comercio._id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="px-3 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold shadow-xs transition-all flex items-center space-x-1"
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
        <div className="lg:col-span-7 rounded-3xl overflow-hidden border border-white/15 shadow-2xl bg-slate-900 relative">
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
