'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';

interface ComercioMapa {
  _id: string;
  nombre: string;
  descripcion?: string;
  direccion?: string;
  ubicacion?: {
    coordinates: [number, number]; // [lng, lat]
  };
  calificacionPromedio?: number;
  contacto?: {
    telefono?: string;
    whatsapp?: string;
  };
}

interface MapaComerciosProps {
  comercios: ComercioMapa[];
  centro?: [number, number]; // [lat, lng]
  zoom?: number;
}

export default function MapaComercios({
  comercios,
  centro = [-38.7183, -62.2642], // Bahía Blanca por defecto
  zoom = 14
}: MapaComerciosProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    let isMounted = true;

    const initMap = async () => {
      // Importación dinámica de Leaflet solo en el cliente
      const L = (await import('leaflet')).default;

      if (!isMounted || !mapContainerRef.current) return;

      // Si ya existe instancia de mapa, limpiarla antes de recrear
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Crear mapa
      const map = L.map(mapContainerRef.current).setView(centro, zoom);
      mapInstanceRef.current = map;

      // Agregar capa de OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> colaboradores'
      }).addTo(map);

      // Marcador personalizado con HTML/CSS (evita problemas de assets de imágenes)
      const createStoreIcon = (nombre: string) => {
        return L.divIcon({
          className: 'custom-store-marker',
          html: `
            <div style="
              background: linear-gradient(135deg, #2563eb, #1d4ed8);
              color: white;
              width: 38px;
              height: 38px;
              border-radius: 12px;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 4px 10px rgba(37, 99, 235, 0.4);
              border: 2.5px solid white;
              font-size: 18px;
              cursor: pointer;
              transition: transform 0.2s;
            ">
              🏪
            </div>
          `,
          iconSize: [38, 38],
          iconAnchor: [19, 19],
          popupAnchor: [0, -20]
        });
      };

      // Agregar marcadores para cada comercio con coordenadas válidas
      comercios.forEach((c) => {
        if (
          c.ubicacion &&
          c.ubicacion.coordinates &&
          c.ubicacion.coordinates.length === 2
        ) {
          const lng = c.ubicacion.coordinates[0];
          const lat = c.ubicacion.coordinates[1];

          // Validar rango de latitud y longitud
          if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
            const popupContent = `
              <div style="font-family: inherit; padding: 4px; min-width: 200px;">
                <h4 style="margin: 0 0 4px; font-weight: 800; font-size: 15px; color: #111827;">${c.nombre}</h4>
                <p style="margin: 0 0 6px; font-size: 12px; color: #4b5563;">${c.direccion || 'Sin dirección especificada'}</p>
                <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 8px;">
                  <span style="background: #fef3c7; color: #b45309; font-weight: 700; font-size: 11px; padding: 2px 6px; border-radius: 4px;">
                    ★ ${c.calificacionPromedio ? c.calificacionPromedio.toFixed(1) : 'Nuevo'}
                  </span>
                  <a href="/comercio/${c._id}" style="background: #2563eb; color: white; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; text-decoration: none;">
                    Ver Vidriera &rarr;
                  </a>
                </div>
              </div>
            `;

            const marker = L.marker([lat, lng], {
              icon: createStoreIcon(c.nombre)
            }).addTo(map);

            marker.bindPopup(popupContent);
          }
        }
      });
    };

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [comercios, centro, zoom]);

  return (
    <div className="relative w-full h-[550px] rounded-2xl overflow-hidden border border-gray-200 shadow-sm z-0">
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
}
