'use client';

import { useState, useEffect } from 'react';
import { fetchAPI } from '@/lib/api';
import MapaComercios from '@/components/MapaComercios';
import Link from 'next/link';
import { MapPin, Store, Search, Filter, Phone, Star, ChevronRight, Building2 } from 'lucide-react';

export default function MapaPage() {
  const [comercios, setComercios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroTexto, setFiltroTexto] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [categorias, setCategorias] = useState<any[]>([]);

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold uppercase tracking-wider mb-2">
            <MapPin className="w-3.5 h-3.5 text-indigo-600" />
            <span>Cartografía Abierta Municipal</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Mapa Interactivo de Comercios
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1">
            Localiza los establecimientos comerciales georreferenciados en la ciudad sobre OpenStreetMap.
          </p>
        </div>

        {/* Category Filter Selector */}
        <div className="flex items-center space-x-2 self-start md:self-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={categoriaSeleccionada}
            onChange={(e) => setCategoriaSeleccionada(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold bg-white text-slate-700 shadow-2xs focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 focus:outline-none"
          >
            <option value="">Todas las Categorías</option>
            {categorias.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid: Map + Sidebar Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Map View */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="w-full h-[600px] bg-slate-100 rounded-2xl animate-pulse flex flex-col items-center justify-center text-slate-400 text-xs">
              <div className="w-8 h-8 border-3 border-slate-200 border-t-slate-800 rounded-full animate-spin mb-3"></div>
              <span>Cargando mapa interactivo...</span>
            </div>
          ) : (
            <MapaComercios comercios={comerciosFiltrados} />
          )}
        </div>

        {/* Sidebar Store Drawer */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 flex flex-col h-[600px] shadow-xs">
          <div className="mb-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Filtrar por nombre o calle..."
                value={filtroTexto}
                onChange={(e) => setFiltroTexto(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 focus:outline-none transition-all"
              />
            </div>
            <div className="flex justify-between items-center mt-2 px-1 text-[11px] text-slate-400 font-medium">
              <span>{comerciosFiltrados.length} locales en pantalla</span>
              {categoriaSeleccionada && (
                <button
                  onClick={() => setCategoriaSeleccionada('')}
                  className="text-indigo-600 hover:underline font-semibold"
                >
                  Restablecer
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {comerciosFiltrados.length === 0 ? (
              <div className="text-center py-16 text-slate-400 text-xs font-normal">
                No se encontraron locales para los filtros seleccionados.
              </div>
            ) : (
              comerciosFiltrados.map((c) => (
                <div
                  key={c._id}
                  className="p-3.5 border border-slate-100 rounded-xl bg-slate-50/60 hover:bg-slate-50 hover:border-slate-300 transition-colors"
                >
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-xs text-slate-900 line-clamp-1">{c.nombre}</h3>
                    <span className="flex items-center text-[11px] font-bold text-slate-800 ml-2 flex-shrink-0">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400 mr-1" />
                      {c.calificacionPromedio > 0 ? c.calificacionPromedio.toFixed(1) : 'Nuevo'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 flex items-center mb-2.5 font-normal">
                    <MapPin className="w-3 h-3 text-slate-400 mr-1 flex-shrink-0" />
                    <span className="truncate">{c.direccion || 'Sin dirección'}</span>
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[11px]">
                    <span className="text-slate-400">
                      {c.contacto?.telefono || 'Disponible online'}
                    </span>
                    <Link
                      href={`/comercio/${c._id}`}
                      className="font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-0.5"
                    >
                      <span>Ver vidriera</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
