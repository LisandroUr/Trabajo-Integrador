'use client';

import { useState, useEffect } from 'react';
import { fetchAPI } from '@/lib/api';
import MapaComercios from '@/components/MapaComercios';
import Link from 'next/link';
import { MapPin, Store, Search, Filter, Phone, Star } from 'lucide-react';

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Encabezado */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-red-600 font-bold text-xs uppercase tracking-wider mb-1">
            <MapPin className="w-4 h-4" />
            <span>Geolocalización Municipal</span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">
            Mapa de Comercios y Emprendedores
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Localiza en el mapa interactivo todos los locales habilitados en la ciudad.
          </p>
        </div>

        {/* Filtro rápido por Categoría */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={categoriaSeleccionada}
            onChange={(e) => setCategoriaSeleccionada(e.target.value)}
            className="p-2 border border-gray-300 rounded-xl text-sm bg-white text-gray-700 shadow-xs focus:ring-2 focus:ring-blue-500"
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

      {/* Grid: Mapa y Lista de Comercios */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mapa Interactivo */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="w-full h-[550px] bg-gray-200 rounded-2xl animate-pulse flex items-center justify-center text-gray-400">
              Cargando mapa interactivo...
            </div>
          ) : (
            <MapaComercios comercios={comerciosFiltrados} />
          )}
        </div>

        {/* Panel lateral con listado de comercios filtrados */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-col h-[550px] shadow-xs">
          <div className="mb-3">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Filtrar por nombre o calle..."
                value={filtroTexto}
                onChange={(e) => setFiltroTexto(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-between items-center mt-2 px-1 text-[11px] text-gray-500">
              <span>{comerciosFiltrados.length} comercios visibles</span>
              {categoriaSeleccionada && (
                <button
                  onClick={() => setCategoriaSeleccionada('')}
                  className="text-blue-600 hover:underline"
                >
                  Limpiar filtro
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {comerciosFiltrados.length === 0 ? (
              <div className="text-center py-12 text-gray-500 text-xs">
                No hay comercios con las coordenadas especificadas o los filtros aplicados.
              </div>
            ) : (
              comerciosFiltrados.map((c) => (
                <div
                  key={c._id}
                  className="p-3 border border-gray-100 rounded-xl bg-gray-50/50 hover:bg-blue-50/50 hover:border-blue-200 transition-colors"
                >
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-sm text-gray-900 line-clamp-1">{c.nombre}</h3>
                    <span className="flex items-center text-xs font-bold text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded">
                      <Star className="w-3 h-3 mr-0.5 fill-yellow-400 text-yellow-400" />
                      {c.calificacionPromedio > 0 ? c.calificacionPromedio.toFixed(1) : 'Nuevo'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 flex items-center mb-2">
                    <MapPin className="w-3 h-3 text-red-400 mr-1 flex-shrink-0" />
                    <span className="line-clamp-1">{c.direccion || 'Sin dirección'}</span>
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200/60">
                    <span className="text-[11px] text-gray-500">
                      {c.contacto?.telefono || c.contacto?.whatsapp || 'Consultas online'}
                    </span>
                    <Link
                      href={`/comercio/${c._id}`}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800"
                    >
                      Ver Vidriera &rarr;
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
