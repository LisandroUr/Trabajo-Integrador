'use client';

import { useEffect, useRef } from 'react';

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
      const L = (await import('leaflet')).default;

      if (!isMounted || !mapContainerRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        scrollWheelZoom: true
      }).setView(centro, zoom);
      
      mapInstanceRef.current = map;

      // CartoDB Voyager raster tiles for clean street level clarity
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 19
      }).addTo(map);

      // Elegant SVG pin marker matching municipal graphite palette
      const createStoreIcon = () => {
        return L.divIcon({
          className: 'custom-pin-marker',
          html: `
            <div style="position: relative; width: 36px; height: 44px; cursor: pointer;">
              <div style="
                position: absolute;
                top: 0;
                left: 0;
                width: 36px;
                height: 36px;
                background: #171b22;
                border: 2px solid #4b6cb7;
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                box-shadow: 0 4px 10px rgba(0, 0, 0, 0.35);
                display: flex;
                align-items: center;
                justify-content: center;
              ">
                <svg style="transform: rotate(45deg); width: 16px; height: 16px; color: #d5d9e0;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          `,
          iconSize: [36, 44],
          iconAnchor: [18, 40],
          popupAnchor: [0, -38]
        });
      };

      comercios.forEach((c) => {
        if (
          c.ubicacion &&
          c.ubicacion.coordinates &&
          c.ubicacion.coordinates.length === 2
        ) {
          const lng = c.ubicacion.coordinates[0];
          const lat = c.ubicacion.coordinates[1];

          if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
            const popupHtml = `
              <div style="font-family: inherit; padding: 6px 2px; min-width: 210px; background: #171b22; color: #d5d9e0;">
                <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
                  <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #4a7c59;"></span>
                  <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #8bb59b;">Vidriera Habilitada</span>
                </div>
                <h4 style="margin: 0 0 4px; font-weight: 700; font-size: 14px; color: #d5d9e0; line-height: 1.3;">
                  ${c.nombre}
                </h4>
                <p style="margin: 0 0 10px; font-size: 12px; color: #8d94a1; line-height: 1.4;">
                  ${c.direccion || 'Ubicación céntrica'}
                </p>
                <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid #262d3a; padding-top: 8px;">
                  <div style="display: flex; align-items: center; gap: 4px;">
                    <svg style="width: 13px; height: 13px; color: #b8860b; fill: #b8860b;" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                    <span style="font-size: 12px; font-weight: 700; color: #d5d9e0;">
                      ${c.calificacionPromedio ? c.calificacionPromedio.toFixed(1) : 'Nuevo'}
                    </span>
                  </div>
                  <a href="/comercio/${c._id}" style="
                    display: inline-flex;
                    align-items: center;
                    background: #4b6cb7;
                    color: #d5d9e0;
                    padding: 5px 12px;
                    border-radius: 6px;
                    font-size: 11px;
                    font-weight: 600;
                    text-decoration: none;
                  ">
                    Ver vidriera
                  </a>
                </div>
              </div>
            `;

            const marker = L.marker([lat, lng], {
              icon: createStoreIcon()
            }).addTo(map);

            marker.bindPopup(popupHtml, {
              maxWidth: 280,
              className: 'modern-leaflet-popup'
            });
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
    <div className="relative w-full h-[680px] rounded-2xl overflow-hidden border border-[#262d3a] shadow-xs z-0">
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
}
