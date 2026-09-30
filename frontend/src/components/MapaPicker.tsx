'use client';

import { useEffect, useRef, useState } from 'react';
import { X, MapPin } from 'lucide-react';

interface MapaPickerProps {
  initialLat?: number;
  initialLng?: number;
  onLocationSelected: (lat: number, lng: number, address?: string) => void;
  onClose: () => void;
}

export default function MapaPicker({
  initialLat = -29.1436, // Goya, Corrientes
  initialLng = -59.2658,
  onLocationSelected,
  onClose
}: MapaPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerInstanceRef = useRef<any>(null);
  
  const [currentLat, setCurrentLat] = useState(initialLat);
  const [currentLng, setCurrentLng] = useState(initialLng);

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
      }).setView([currentLat, currentLng], 15);
      
      mapInstanceRef.current = map;

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);

      const iconHtml = `
        <div style="position: relative; width: 36px; height: 44px;">
          <div style="
            position: absolute; top: 0; left: 0; width: 36px; height: 36px;
            background: #171b22; border: 2px solid #38bdf8;
            border-radius: 50% 50% 50% 0; transform: rotate(-45deg);
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.35);
            display: flex; align-items: center; justify-content: center;
          ">
            <div style="transform: rotate(45deg); width: 12px; height: 12px; background: #38bdf8; border-radius: 50%;"></div>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-picker-pin',
        html: iconHtml,
        iconSize: [36, 44],
        iconAnchor: [18, 40]
      });

      const marker = L.marker([currentLat, currentLng], {
        icon: customIcon,
        draggable: true
      }).addTo(map);

      markerInstanceRef.current = marker;

      marker.on('dragend', function () {
        const position = marker.getLatLng();
        setCurrentLat(position.lat);
        setCurrentLng(position.lng);
      });

      map.on('click', function(e: any) {
        marker.setLatLng(e.latlng);
        setCurrentLat(e.latlng.lat);
        setCurrentLng(e.latlng.lng);
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
  }, []); // Remove dependencies to avoid re-rendering map completely

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Tu navegador no soporta geolocalización.');
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setCurrentLat(lat);
        setCurrentLng(lng);
        
        // Update map view and marker if map is ready
        if (mapInstanceRef.current && markerInstanceRef.current) {
          mapInstanceRef.current.setView([lat, lng], 16);
          markerInstanceRef.current.setLatLng([lat, lng]);
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('No pudimos acceder a tu ubicación. Por favor, revisa los permisos de tu navegador.');
      },
      { enableHighAccuracy: true }
    );
  };

  const [confirming, setConfirming] = useState(false);

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${currentLat}&lon=${currentLng}`);
      const data = await res.json();
      let address = '';
      if (data && data.address) {
        const road = data.address.road || '';
        const houseNumber = data.address.house_number || '';
        const neighbourhood = data.address.neighbourhood || data.address.suburb || '';
        const city = data.address.city || data.address.town || data.address.village || '';
        
        const parts = [road, houseNumber].filter(Boolean).join(' ');
        const finalParts = [parts, neighbourhood, city].filter(Boolean).join(', ');
        address = finalParts || data.name || '';
      }
      onLocationSelected(currentLat, currentLng, address);
    } catch (e) {
      console.error('Error fetching address:', e);
      onLocationSelected(currentLat, currentLng);
    } finally {
      setConfirming(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0c0e12]/85 backdrop-blur-xs flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col overflow-hidden">
        
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Ajustar Ubicación Exacta</h3>
            <p className="text-xs text-gray-500">Arrastra el marcador o haz clic en el mapa para ubicar tu comercio.</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="w-full h-[400px] relative z-0 group">
          <div ref={mapContainerRef} className="w-full h-full" />
          
          <button
            onClick={handleGetCurrentLocation}
            title="Usar mi ubicación actual"
            className="absolute bottom-4 left-4 z-[999] bg-white border border-gray-200 p-2.5 rounded-xl shadow-md text-gray-700 hover:text-[#38bdf8] hover:bg-gray-50 transition-all flex items-center justify-center"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </button>
        </div>

        <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
          <div className="text-xs text-gray-500 font-mono">
            {currentLat.toFixed(5)}, {currentLng.toFixed(5)}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={confirming}
              className="px-5 py-2 rounded-xl bg-[#38bdf8] text-white text-xs font-bold hover:bg-[#0ea5e9] transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <MapPin className="w-4 h-4" />
              {confirming ? 'Calculando dirección...' : 'Confirmar Ubicación'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
