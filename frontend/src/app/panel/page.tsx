'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Home, 
  Layers, 
  ShoppingBag, 
  BarChart2, 
  Settings, 
  Upload, 
  Mail, 
  Phone, 
  MapPin, 
  Store, 
  Check, 
  ExternalLink,
  Plus,
  Trash2,
  Package,
  ShieldCheck,
  Clock,
  ChevronDown,
  MessageSquare
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import { fetchAPI } from '@/lib/api';
import { subirImagen } from '@/lib/imageUtils';
import PanelCatalogo from '@/components/PanelCatalogo';
import dynamic from 'next/dynamic';

const MapaPicker = dynamic(() => import('@/components/MapaPicker'), { ssr: false });

export default function PanelComerciantePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Active Sidebar Nav
  const [activeNav, setActiveNav] = useState<'panel' | 'catalogo' | 'pedidos' | 'analiticas' | 'configuracion'>('panel');

  useEffect(() => {
    const userStored = localStorage.getItem('user');
    if (!userStored) {
      router.replace('/login');
      return;
    }
    try {
      const user = JSON.parse(userStored);
      if (!user.roles?.includes('comerciante')) {
        toast.error('Acceso denegado: Esta sección es solo para comerciantes');
        router.replace('/');
      }
    } catch {
      router.replace('/login');
    }
  }, [router]);

  // Stores from Database
  const [comerciosList, setComerciosList] = useState<any[]>([]);
  const [loadingStores, setLoadingStores] = useState(true);

  // Store profile states
  const [storeId, setStoreId] = useState('');
  const [nombreTienda, setNombreTienda] = useState('');
  const [categoria, setCategoria] = useState('Celulares y Tecnología');
  const [descripcion, setDescripcion] = useState('');
  const [direccion, setDireccion] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [linkInstagram, setLinkInstagram] = useState('');
  const [linkWhatsapp, setLinkWhatsapp] = useState('');
  
  // Banner and Thumbnail images
  const [bannerUrl, setBannerUrl] = useState(
    'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=1600&auto=format&fit=crop&q=80'
  );
  const [thumbUrl, setThumbUrl] = useState(
    'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80'
  );

  const [mapaCoordinates, setMapaCoordinates] = useState<[number, number] | null>(null); // [lng, lat]
  const [showMapaPicker, setShowMapaPicker] = useState(false);

  const [guardando, setGuardando] = useState(false);

  const selectStore = (comercio: any) => {
    if (!comercio) return;
    setStoreId(comercio._id);
    setNombreTienda(comercio.nombre || '');
    setDescripcion(comercio.descripcion || '');
    setDireccion(comercio.direccion || '');
    setEmail(comercio.contacto?.email || '');
    setTelefono(comercio.contacto?.telefono || '');
    setLinkWhatsapp(comercio.contacto?.whatsapp || '');
    setLinkInstagram(comercio.contacto?.redes?.[0] || '');
    if (comercio.vidriera?.bannerPrincipal) {
      setBannerUrl(comercio.vidriera.bannerPrincipal);
    }
    if (comercio.vidriera?.logo) {
      setThumbUrl(comercio.vidriera.logo);
    }
    if (comercio.categorias && comercio.categorias[0]) {
      const cat = comercio.categorias[0];
      setCategoria(typeof cat === 'object' ? cat.nombre : cat);
    }
    if (comercio.ubicacion?.coordinates) {
      setMapaCoordinates([comercio.ubicacion.coordinates[0], comercio.ubicacion.coordinates[1]]);
    } else {
      setMapaCoordinates(null);
    }
  };

  // Load real stores on mount
  useEffect(() => {
    const fetchStores = async () => {
      setLoadingStores(true);
      try {
        const res = await fetchAPI('/comercios/me/mis-tiendas');
        const list = res.data || (Array.isArray(res) ? res : []);
        setComerciosList(list);

        if (list.length > 0) {
          let selected = list[0];
          try {
            const saved = localStorage.getItem('mi_tienda_data');
            if (saved) {
              const parsed = JSON.parse(saved);
              if (parsed.storeId) {
                const found = list.find((c: any) => c._id === parsed.storeId);
                if (found) selected = found;
              }
            }
          } catch {}
          selectStore(selected);
        }
      } catch (err) {
        console.error('Error cargando comercios:', err);
      } finally {
        setLoadingStores(false);
      }
    };
    fetchStores();
  }, []);

  const handleGuardarCambios = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setGuardando(true);

    const storePayload = {
      nombre: nombreTienda || 'Mi Nueva Tienda',
      descripcion,
      direccion,
      categorias: [categoria],
      ubicacion: mapaCoordinates ? { type: 'Point', coordinates: mapaCoordinates } : undefined,
      contacto: {
        telefono,
        email,
        whatsapp: linkWhatsapp,
        redes: linkInstagram ? [linkInstagram] : []
      },
      vidriera: {
        bannerPrincipal: bannerUrl,
        logo: thumbUrl
      }
    };

    try {
      let savedStoreId = storeId;
      
      if (storeId) {
        // 1. Persist directly to MongoDB (Update)
        await fetchAPI(`/comercios/${storeId}`, {
          method: 'PUT',
          body: JSON.stringify(storePayload)
        });
        
        // Update local state
        setComerciosList(prev => prev.map(c => c._id === storeId ? {
          ...c,
          ...storePayload,
          vidriera: { ...c.vidriera, ...storePayload.vidriera },
          categorias: [categoria]
        } : c));
      } else {
        // 1. Create a new store
        const newStore = await fetchAPI('/comercios', {
          method: 'POST',
          body: JSON.stringify(storePayload)
        });
        savedStoreId = newStore._id;
        setStoreId(savedStoreId);
        setComerciosList([newStore, ...comerciosList]);
      }

      // 2. Cache in localStorage for immediate visual sync
      localStorage.setItem('mi_tienda_data', JSON.stringify({
        ...storePayload,
        nombreTienda: storePayload.nombre,
        categoria,
        bannerUrl,
        thumbUrl,
        linkInstagram,
        linkWhatsapp,
        storeId: savedStoreId
      }));

      try {
        confetti({
          particleCount: 60,
          spread: 50,
          origin: { y: 0.6 }
        });
      } catch {}
      toast.success(storeId ? '¡Cambios guardados con éxito!' : '¡Tienda creada exitosamente y en revisión!');
    } catch (err: any) {
      console.error('Error al guardar en el servidor:', err);
      toast.error(err.message || 'Error al guardar los cambios en la base de datos.');
    } finally {
      setGuardando(false);
    }
  };

  const handleUploadBannerClick = () => {
    fileInputRef.current?.click();
  };

  const handleBannerFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        toast.loading('Subiendo banner...', { id: 'upload-banner' });
        // Fix 19: subir al backend → recibir URL → guardar URL (no base64)
        const url = await subirImagen(file);
        setBannerUrl(url);
        toast.success('Banner subido. Hacé clic en "Guardar Cambios" para sincronizarlo.', { id: 'upload-banner' });
      } catch (error: any) {
        toast.error(error.message || 'Error al subir el banner', { id: 'upload-banner' });
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleUploadThumbClick = () => {
    logoInputRef.current?.click();
  };

  const handleThumbFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        toast.loading('Subiendo logo...', { id: 'upload-thumb' });
        // Fix 19: subir al backend → recibir URL → guardar URL (no base64)
        const url = await subirImagen(file);
        setThumbUrl(url);
        toast.success('Logo subido. Hacé clic en "Guardar Cambios" para sincronizarlo.', { id: 'upload-thumb' });
      } catch (error: any) {
        toast.error(error.message || 'Error al subir el logo', { id: 'upload-thumb' });
      }
      if (logoInputRef.current) logoInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-120px)] bg-[#f0f6fa] select-none py-6 sm:py-8">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ========================================================================= */}
          {/* LEFT SIDEBAR: ADMINISTRACIÓN                                              */}
          {/* ========================================================================= */}
          <aside className="lg:col-span-3 xl:col-span-2 space-y-4">
            <h2 className="font-bold text-gray-900 text-base">
              Administración
            </h2>

            <nav className="space-y-1.5 text-sm">
              {/* 1. Panel de Control */}
              <button
                onClick={() => setActiveNav('panel')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors text-left cursor-pointer ${
                  activeNav === 'panel'
                    ? 'bg-white text-gray-900 font-bold shadow-xs border border-gray-100'
                    : 'text-gray-700 hover:bg-white/60 hover:text-gray-900'
                }`}
              >
                <Home className="w-4 h-4 text-[#38bdf8]" />
                <span>Panel de Control</span>
              </button>

              {/* 2. Catálogo */}
              <button
                onClick={() => setActiveNav('catalogo')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors text-left cursor-pointer ${
                  activeNav === 'catalogo'
                    ? 'bg-white text-gray-900 font-bold shadow-xs border border-gray-100'
                    : 'text-gray-700 hover:bg-white/60 hover:text-gray-900'
                }`}
              >
                <Layers className="w-4 h-4 text-gray-600" />
                <span>Catálogo</span>
              </button>

              {/* 3. Mensajes */}
              <Link
                href="/panel/mensajes"
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors text-left cursor-pointer ${
                  activeNav === 'mensajes'
                    ? 'bg-white text-gray-900 font-bold shadow-xs border border-gray-100'
                    : 'text-gray-700 hover:bg-white/60 hover:text-gray-900'
                }`}
              >
                <MessageSquare className="w-4 h-4 text-gray-600" />
                <span>Mensajes</span>
              </Link>

              {/* 4. Analíticas */}
              <button
                onClick={() => setActiveNav('analiticas')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors text-left cursor-pointer ${
                  activeNav === 'analiticas'
                    ? 'bg-white text-gray-900 font-bold shadow-xs border border-gray-100'
                    : 'text-gray-700 hover:bg-white/60 hover:text-gray-900'
                }`}
              >
                <BarChart2 className="w-4 h-4 text-gray-600" />
                <span>Analíticas</span>
              </button>

              {/* 5. Configuración */}
              <button
                onClick={() => setActiveNav('configuracion')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors text-left cursor-pointer ${
                  activeNav === 'configuracion'
                    ? 'bg-white text-gray-900 font-bold shadow-xs border border-gray-100'
                    : 'text-gray-700 hover:bg-white/60 hover:text-gray-900'
                }`}
              >
                <Settings className="w-4 h-4 text-gray-600" />
                <span>Configuración</span>
              </button>
            </nav>
          </aside>

          {/* ========================================================================= */}
          {/* MAIN CONTENT AREA: BANNER, INFORMACIÓN GENERAL, 3 CARDS                   */}
          {/* ========================================================================= */}
          <main className="lg:col-span-9 xl:col-span-10 space-y-6">
            
            {activeNav === 'panel' && (
              <>
                {/* 0. SECCIÓN: SELECTOR DE COMERCIO ACTIVO */}
                <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-[#0284c7] flex-shrink-0">
                      <Store className="w-5 h-5" />
                    </div>
                    <div>
                      <label htmlFor="store-switcher" className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                        Gestionando Vidriera Digital
                      </label>
                      <div className="relative mt-0.5">
                        <select
                          id="store-switcher"
                          value={storeId}
                          onChange={(e) => {
                            const found = comerciosList.find(c => c._id === e.target.value);
                            if (found) selectStore(found);
                          }}
                          className="font-bold text-gray-900 text-sm sm:text-base bg-transparent border-0 focus:ring-0 cursor-pointer pr-8 py-0.5 appearance-none focus:outline-none"
                        >
                          {comerciosList.length === 0 ? (
                            <option value="">Borrador: Nueva Tienda</option>
                          ) : (
                            comerciosList.map((c) => (
                              <option key={c._id} value={c._id}>
                                {c.nombre} ({c.tipo === 'servicio' ? 'Servicio' : 'Local'} • {c.estado === 'aprobado' ? 'Verificado' : 'Sin verificar'})
                              </option>
                            ))
                          )}
                        </select>
                        <ChevronDown className="w-4 h-4 text-gray-400 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 self-start sm:self-auto">
                    {comerciosList.find(c => c._id === storeId)?.estado === 'aprobado' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Verificado</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>{storeId ? 'Pendiente de Auditoría' : 'Completa los datos'}</span>
                      </span>
                    )}

                    {storeId && (
                      <Link
                        href={`/comercio/${storeId}`}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-semibold transition-colors"
                        title="Ver vidriera pública en vivo"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Ver Vidriera</span>
                      </Link>
                    )}
                  </div>
                </div>

                {/* 1. SECCIÓN: MI BANNER DEL LOCAL */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-900 text-lg">
                      Mi Banner del Local
                    </h3>
                    <span className="text-xs text-gray-500 font-medium">
                      Este banner es la cabecera oficial de tu vidriera
                    </span>
                  </div>

                  {/* Banner container */}
                  <div className="relative w-full h-[190px] sm:h-[230px] rounded-2xl overflow-hidden shadow-xs border border-gray-200 bg-gray-900 flex items-center justify-center group">
                    <img
                      src={bannerUrl}
                      alt="Banner del Local"
                      className="absolute inset-0 w-full h-full object-cover filter blur-[1px] brightness-90 group-hover:scale-102 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/25" />

                    {/* Hidden inputs for uploading files */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleBannerFileChange}
                      className="hidden"
                    />
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleThumbFileChange}
                      className="hidden"
                    />

                    {/* Center Pill Button: Subir/Cambiar Banner */}
                    <div className="relative z-10 flex flex-col items-center">
                      <button
                        type="button"
                        onClick={handleUploadBannerClick}
                        className="px-5 py-2.5 bg-white/85 hover:bg-white text-gray-900 font-bold text-xs sm:text-sm rounded-xl shadow-md backdrop-blur-md flex items-center gap-2 transition-all transform hover:-translate-y-0.5 cursor-pointer border border-white/50"
                      >
                        <Upload className="w-4 h-4 text-gray-800" />
                        <span>Subir/Cambiar Banner</span>
                      </button>
                      <span className="text-xs text-white/95 mt-2 font-medium drop-shadow-md">
                        Tamaño recomendado: 1200x300 px
                      </span>
                    </div>

                    {/* Bottom-right Store Thumbnail / Photo Card */}
                    <div 
                      onClick={handleUploadThumbClick}
                      title="Cambiar foto de la vidriera"
                      className="absolute right-4 bottom-4 w-28 h-20 sm:w-36 sm:h-24 rounded-xl overflow-hidden border-2 border-white shadow-lg bg-white cursor-pointer hover:opacity-90 transition-opacity z-10"
                    >
                      <img
                        src={thumbUrl}
                        alt="Miniatura del comercio"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Banner URL direct input */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1 text-xs">
                    <span className="font-semibold text-gray-600 flex-shrink-0">URL del Banner:</span>
                    <input
                      type="url"
                      value={bannerUrl}
                      onChange={(e) => setBannerUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-800 text-xs focus:outline-none focus:border-[#38bdf8]"
                    />
                  </div>
                </div>

                {/* 2. SECCIÓN: INFORMACIÓN GENERAL */}
                <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-xs border border-gray-100">
                  
                  {/* Card Header: Title and Action Buttons */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                    <h3 className="font-bold text-gray-900 text-lg">
                      Información General
                    </h3>

                    <div className="flex items-center gap-2.5 self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() => handleGuardarCambios()}
                        disabled={guardando}
                        className="py-2 px-5 bg-[#38bdf8] hover:bg-[#0ea5e9] text-white font-medium text-sm rounded-xl transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        {guardando ? 'Guardando...' : 'Guardar Cambios'}
                      </button>

                      {storeId && (
                        <Link
                          href={`/comercio/${storeId}`}
                          className="py-2 px-4 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium text-sm rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <span>Vista Previa</span>
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Card Content Grid (2 columns: left textarea, right inputs) */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* Left Column: Descripción del Local */}
                    <div className="lg:col-span-7 flex flex-col">
                      <label className="font-bold text-sm text-gray-800 mb-1.5 block">
                        Descripción del Local
                      </label>
                      <textarea
                        rows={6}
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        placeholder="Cuéntanos qué hace tu tienda:&#10;Ej: Ofrecemos repuestos de electrónica de alta calidad y servicio técnico especializado en Goya."
                        className="w-full flex-1 p-3.5 border border-[#38bdf8] rounded-xl text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#38bdf8] bg-white leading-relaxed resize-y min-h-[140px]"
                      />
                    </div>

                    {/* Right Column: Nombre de la Tienda + Categoría */}
                    <div className="lg:col-span-5 space-y-4">
                      {/* Nombre de la Tienda */}
                      <div>
                        <label className="font-bold text-sm text-gray-800 mb-1.5 block">
                          Nombre de la Tienda
                        </label>
                        <input
                          type="text"
                          value={nombreTienda}
                          onChange={(e) => setNombreTienda(e.target.value)}
                          placeholder="Nombre de la Tienda"
                          className="w-full p-2.5 border border-gray-300 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#38bdf8] bg-white"
                        />
                      </div>

                      {/* Categoría */}
                      <div>
                        <label className="font-bold text-sm text-gray-800 mb-1.5 block">
                          Categoría
                        </label>
                        <select
                          value={categoria}
                          onChange={(e) => setCategoria(e.target.value)}
                          className="w-full p-2.5 border border-gray-300 rounded-xl text-sm text-gray-800 bg-white focus:outline-none focus:border-[#38bdf8] cursor-pointer"
                        >
                          <option value="Celulares y Tecnología">Celulares y Tecnología</option>
                          <option value="Alimentos y Bebidas">Alimentos y Bebidas</option>
                          <option value="Supermercado y Almacén">Supermercado y Almacén</option>
                          <option value="Ropa y Calzado">Ropa y Calzado</option>
                          <option value="Hogar y Bazar">Hogar y Bazar</option>
                          <option value="Servicios y Reparaciones">Servicios y Reparaciones</option>
                          <option value="Cafeterías">Cafeterías</option>
                          <option value="Equipamiento">Equipamiento</option>
                          <option value="Temporarios">Temporarios</option>
                        </select>
                      </div>
                    </div>

                  </div>
                </div>

                {/* 3. SECCIÓN: TRES TARJETAS INFERIORES (Ubicación, Contacto, Nuestras Redes Sociales) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* Tarjeta 1: Ubicación */}
                  <div className="bg-white rounded-2xl p-5 shadow-xs border border-gray-100 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-gray-800 mb-2">
                        Ubicación
                      </h4>

                      {/* Folded map SVG icon matching screenshot */}
                      <div className="py-2 flex items-center justify-start">
                        <svg
                          width="56"
                          height="44"
                          viewBox="0 0 64 50"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="text-[#38bdf8]"
                        >
                          {/* Folded Map Shape */}
                          <path
                            d="M6 14L22 8L42 14L58 8V38L42 44L22 38L6 44V14Z"
                            stroke="#38bdf8"
                            strokeWidth="2.5"
                            strokeLinejoin="round"
                            fill="#f0f9ff"
                          />
                          <line x1="22" y1="8" x2="22" y2="38" stroke="#38bdf8" strokeWidth="2" />
                          <line x1="42" y1="14" x2="42" y2="44" stroke="#38bdf8" strokeWidth="2" />
                          {/* Map Pin inside Map */}
                          <circle cx="32" cy="20" r="5" fill="#38bdf8" />
                          <path
                            d="M32 15C29.2 15 27 17.2 27 20C27 24 32 30 32 30C32 30 37 24 37 20C37 17.2 34.8 15 32 15Z"
                            stroke="#0284c7"
                            strokeWidth="1.5"
                            fill="#38bdf8"
                          />
                          <circle cx="32" cy="20" r="2" fill="white" />
                        </svg>
                      </div>
                    </div>

                    <input
                      type="text"
                      value={direccion}
                      onChange={(e) => setDireccion(e.target.value)}
                      placeholder="Dirección del local..."
                      className="w-full mt-2 text-xs text-gray-700 border-b border-gray-200 focus:border-[#38bdf8] focus:outline-none pb-1 bg-transparent truncate"
                    />

                    <button
                      type="button"
                      onClick={() => setShowMapaPicker(true)}
                      className={`mt-4 flex items-center justify-center gap-2 w-full py-2 rounded-xl text-xs font-semibold transition-colors border shadow-sm ${
                        mapaCoordinates 
                          ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-100' 
                          : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-100'
                      }`}
                    >
                      <MapPin className="w-4 h-4" />
                      {mapaCoordinates ? 'Modificar Ubicación Exacta' : 'Fijar Coordenadas en el Mapa'}
                    </button>
                    {mapaCoordinates && (
                      <p className="mt-2 text-center text-[10px] text-gray-400 font-mono">
                        GPS: {mapaCoordinates[1].toFixed(5)}, {mapaCoordinates[0].toFixed(5)}
                      </p>
                    )}
                  </div>

                  {/* Tarjeta 2: Contacto */}
                  <div className="bg-white rounded-2xl p-5 shadow-xs border border-gray-100 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-gray-800 mb-3">
                        Contacto
                      </h4>

                      <div className="space-y-2.5 text-sm">
                        {/* Email */}
                        <div className="flex items-center gap-2 text-gray-700">
                          <Mail className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="email@email.com"
                            className="text-xs sm:text-sm text-gray-800 focus:outline-none focus:border-b focus:border-[#38bdf8] w-full bg-transparent"
                          />
                        </div>

                        {/* Phone */}
                        <div className="flex items-center gap-2 text-gray-700">
                          <Phone className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          <input
                            type="text"
                            value={telefono}
                            onChange={(e) => setTelefono(e.target.value)}
                            placeholder="(423) 547-6788"
                            className="text-xs sm:text-sm text-gray-800 focus:outline-none focus:border-b focus:border-[#38bdf8] w-full bg-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tarjeta 3: Nuestras Redes Sociales */}
                  <div className="bg-white rounded-2xl p-5 shadow-xs border border-gray-100 flex flex-col justify-between">
                    <h4 className="font-bold text-sm text-gray-800 mb-2">
                      Nuestras Redes Sociales
                    </h4>

                    <div className="flex items-center gap-3">
                      {/* 3 Colored Social Icons */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {/* Facebook */}
                        <div className="w-7 h-7 rounded-lg bg-[#1877F2] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                          f
                        </div>

                        {/* Instagram */}
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white flex items-center justify-center shadow-xs">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                          </svg>
                        </div>

                        {/* WhatsApp */}
                        <div className="w-7 h-7 rounded-lg bg-[#25D366] text-white flex items-center justify-center shadow-xs">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2Z" />
                          </svg>
                        </div>
                      </div>

                      {/* Right: 2 Link Inputs */}
                      <div className="flex-1 space-y-1.5 min-w-0">
                        <input
                          type="text"
                          value={linkInstagram}
                          onChange={(e) => setLinkInstagram(e.target.value)}
                          placeholder="Agregar link..."
                          className="w-full px-2.5 py-1 text-xs border border-dashed border-gray-300 rounded-lg text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-[#38bdf8] bg-gray-50/50 truncate"
                        />
                        <input
                          type="text"
                          value={linkWhatsapp}
                          onChange={(e) => setLinkWhatsapp(e.target.value)}
                          placeholder="Agregar link..."
                          className="w-full px-2.5 py-1 text-xs border border-dashed border-gray-300 rounded-lg text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-[#38bdf8] bg-gray-50/50 truncate"
                        />
                      </div>
                    </div>
                  </div>

                </div>
              </>
            )}

            {/* TAB: Catálogo */}
            {activeNav === 'catalogo' && (
              <div className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100 space-y-6">
                <PanelCatalogo storeId={storeId} />
              </div>
            )}

            {/* TAB: Pedidos */}
            {activeNav === 'pedidos' && (
              <div className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100 space-y-6">
                <h3 className="font-bold text-gray-900 text-lg">Bandeja de Pedidos y Consultas</h3>
                <p className="text-xs text-gray-500">Mensajes entrantes de vecinos interesados en tus productos</p>
                <div className="p-8 rounded-xl bg-gray-50 border border-gray-200 text-center">
                  <ShoppingBag className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-gray-800">Bandeja al día</p>
                  <p className="text-xs text-gray-500 mt-1">Todas las consultas directas por WhatsApp y Chat se notifican en tiempo real.</p>
                </div>
              </div>
            )}

            {/* TAB: Analíticas */}
            {activeNav === 'analiticas' && (
              <div className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100 space-y-6">
                <h3 className="font-bold text-gray-900 text-lg">Rendimiento de tu Vidriera</h3>
                <p className="text-xs text-gray-500">Métricas de visitas, clics en WhatsApp y ranking vecinal</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-sky-50 border border-sky-100">
                    <span className="text-xs font-semibold text-[#0284c7]">Visitas a la Vidriera</span>
                    <p className="text-2xl font-black text-gray-900 mt-1">0</p>
                  </div>
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                    <span className="text-xs font-semibold text-emerald-700">Contactos por WhatsApp</span>
                    <p className="text-2xl font-black text-gray-900 mt-1">0</p>
                  </div>
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
                    <span className="text-xs font-semibold text-amber-700">Calificación Promedio</span>
                    <p className="text-2xl font-black text-gray-900 mt-1">
                      ★ {comerciosList.find(c => c._id === storeId)?.calificacionPromedio?.toFixed(1) || '0.0'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: Configuración */}
            {activeNav === 'configuracion' && (
              <div className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100 space-y-6">
                <h3 className="font-bold text-gray-900 text-lg">Configuración de la Cuenta</h3>
                <p className="text-xs text-gray-500">Preferencias de notificaciones y horarios de atención</p>
                <div className="space-y-3 max-w-md text-xs text-gray-700">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-[#38bdf8]" />
                    <span>Recibir alertas sonoras ante nuevos mensajes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-[#38bdf8]" />
                    <span>Mostrar estado "Abierto ahora" automáticamente según horario</span>
                  </label>
                </div>
              </div>
            )}

          </main>

        </div>

      </div>

      {showMapaPicker && (
        <MapaPicker
          initialLat={mapaCoordinates ? mapaCoordinates[1] : -38.7183}
          initialLng={mapaCoordinates ? mapaCoordinates[0] : -62.2642}
          onLocationSelected={(lat, lng, address) => {
            setMapaCoordinates([lng, lat]);
            if (address) {
              setDireccion(address);
              toast.success('Ubicación y dirección actualizadas');
            }
          }}
          onClose={() => setShowMapaPicker(false)}
        />
      )}
    </div>
  );
}
