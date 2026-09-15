'use client';

import { useEffect, useState } from 'react';
import { fetchAPI } from '@/lib/api';
import Link from 'next/link';
import { 
  Building2, 
  Plus, 
  MessageSquare, 
  Package, 
  ExternalLink, 
  Clock, 
  CheckCircle2, 
  MapPin,
  Store, 
  X, 
  Send, 
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';

interface Comercio {
  _id: string;
  nombre: string;
  estado: string;
  descripcion: string;
  direccion?: string;
  calificacionPromedio?: number;
}

export default function PanelComerciantePage() {
  const [comercios, setComercios] = useState<Comercio[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [direccion, setDireccion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [enviando, setEnviando] = useState(false);

  const loadMisComercios = async () => {
    setLoading(true);
    try {
      const res = await fetchAPI('/comercios/me/mis-tiendas'); 
      setComercios(res || []);
    } catch (err: any) {
      console.error(err);
      toast.error('Error cargando comercios: ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMisComercios();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    setEnviando(true);
    try {
      await fetchAPI('/comercios', {
        method: 'POST',
        body: JSON.stringify({
          nombre: nombre.trim(),
          descripcion: descripcion.trim(),
          direccion: direccion.trim(),
          contacto: { telefono, whatsapp }
        })
      });

      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch {}

      toast.success('Solicitud de vidriera digital enviada a auditoría municipal');
      setShowForm(false);
      setNombre('');
      setDescripcion('');
      setDireccion('');
      setTelefono('');
      setWhatsapp('');
      loadMisComercios();
    } catch (err: any) {
      toast.error(err.message || 'Error al enviar la solicitud');
    } finally {
      setEnviando(false);
    }
  };

  const aprobados = comercios.filter((c) => c.estado === 'aprobado').length;
  const pendientes = comercios.filter((c) => c.estado === 'pendiente').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header Banner */}
      <div className="rounded-2xl bg-[#171b22] border border-[#262d3a] p-8 sm:p-10 mb-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full badge-steel text-xs font-semibold tracking-wider mb-3">
              <Store className="w-3.5 h-3.5" />
              <span>Portal de Autogestión Comercial</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#d5d9e0] tracking-tight">
              Mis Vidrieras & Catálogos
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-[#8d94a1] leading-relaxed">
              Administra tus tiendas, publica productos con precios actualizados para el observatorio y responde consultas de vecinos en tiempo real.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/panel/mensajes"
              className="px-4 py-2.5 rounded-xl bg-[#1d222b] hover:bg-[#232934] text-[#d5d9e0] border border-[#262d3a] text-xs font-semibold transition-colors flex items-center space-x-2"
            >
              <MessageSquare className="w-4 h-4 text-[#7dafb5]" />
              <span>Bandeja de Consultas</span>
            </Link>

            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2.5 rounded-xl bg-[#4b6cb7] hover:bg-[#3d5a99] text-[#d5d9e0] text-xs font-semibold transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Vidriera</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="p-5 rounded-2xl bg-[#171b22] border border-[#262d3a] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8d94a1]">Total Locales</span>
            <div className="w-9 h-9 rounded-xl bg-[#1d222b] border border-[#262d3a] text-[#7dafb5] flex items-center justify-center font-bold">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-[#d5d9e0] mt-3 tabular-nums">{comercios.length}</p>
          <p className="text-xs text-[#8d94a1] mt-1">Establecimientos asociados a tu cuenta</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#171b22] border border-[#262d3a] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8bb59b]">Vidrieras Activas</span>
            <div className="w-9 h-9 rounded-xl badge-sage flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-[#8bb59b] mt-3 tabular-nums">{aprobados}</p>
          <p className="text-xs text-[#8d94a1] mt-1">Visibles para los vecinos y en el ranking</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#171b22] border border-[#262d3a] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#d1ab77]">En Fiscalización</span>
            <div className="w-9 h-9 rounded-xl badge-ochre flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-[#d1ab77] mt-3 tabular-nums">{pendientes}</p>
          <p className="text-xs text-[#8d94a1] mt-1">En espera de resolución municipal</p>
        </div>
      </div>

      {/* Stores List */}
      {loading ? (
        <div className="p-16 text-center text-[#8d94a1]">
          <div className="w-8 h-8 border-2 border-[#4b6cb7] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs font-semibold">Cargando tus establecimientos...</p>
        </div>
      ) : comercios.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#171b22] border border-[#262d3a] text-center text-[#8d94a1]">
          <Store className="w-10 h-10 text-[#8d94a1] mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#d5d9e0]">Aún no registraste ninguna vidriera digital</h3>
          <p className="text-xs text-[#8d94a1] mt-1 max-w-sm mx-auto">
            Da de alta tu primer comercio para empezar a publicar precios y conectar con los vecinos.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-5 px-4 py-2 bg-[#4b6cb7] hover:bg-[#3d5a99] text-[#d5d9e0] rounded-xl text-xs font-semibold transition-colors"
          >
            Crear Primera Vidriera
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {comercios.map((comercio) => {
            const esAprobado = comercio.estado === 'aprobado';
            const esPendiente = comercio.estado === 'pendiente';

            return (
              <div
                key={comercio._id}
                className="p-5 rounded-2xl bg-[#171b22] border border-[#262d3a] hover:border-[#4b6cb7]/50 transition-colors shadow-xs flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-[#1d222b] border border-[#262d3a] text-[#7dafb5] font-bold text-sm flex items-center justify-center">
                      {(comercio?.nombre || 'C').charAt(0).toUpperCase()}
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center space-x-1.5 ${
                        esAprobado
                          ? 'badge-sage'
                          : esPendiente
                          ? 'badge-ochre'
                          : 'badge-wine'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        esAprobado ? 'bg-[#4a7c59]' : esPendiente ? 'bg-[#b8860b]' : 'bg-[#8b3a4a]'
                      }`} />
                      <span>{comercio.estado}</span>
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#d5d9e0] group-hover:text-[#9cb1ce] transition-colors">
                    {comercio.nombre}
                  </h3>

                  <p className="text-xs text-[#8d94a1] mt-1 line-clamp-2 leading-relaxed">
                    {comercio.descripcion || 'Sin descripción registrada.'}
                  </p>

                  {comercio.direccion && (
                    <div className="mt-3 flex items-center space-x-1.5 text-xs text-[#8d94a1]">
                      <MapPin className="w-3.5 h-3.5 text-[#4b6cb7] flex-shrink-0" />
                      <span className="truncate">{comercio.direccion}</span>
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-4 border-t border-[#262d3a] space-y-2">
                  <Link
                    href={`/panel/comercio/${comercio._id}`}
                    className="w-full py-2 rounded-xl bg-[#4b6cb7] hover:bg-[#3d5a99] text-[#d5d9e0] font-semibold text-xs transition-colors flex items-center justify-center space-x-1.5"
                  >
                    <Package className="w-3.5 h-3.5" />
                    <span>Administrar Catálogo</span>
                  </Link>

                  {esAprobado && (
                    <Link
                      href={`/comercio/${comercio._id}`}
                      className="w-full py-2 rounded-xl bg-[#1d222b] hover:bg-[#232934] text-[#8d94a1] hover:text-[#d5d9e0] border border-[#262d3a] text-xs font-semibold transition-colors flex items-center justify-center space-x-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Ver Vidriera Pública</span>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Store Request Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-[#0d0f14]/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#171b22] border border-[#262d3a] rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-xl relative">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-5 right-5 text-[#8d94a1] hover:text-[#d5d9e0] p-1 rounded-lg hover:bg-[#1d222b]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-5">
              <h3 className="text-lg font-bold text-[#d5d9e0]">Solicitud de Nueva Vidriera</h3>
              <p className="text-xs text-[#8d94a1] mt-1">
                La solicitud pasará por la fiscalización de la Dirección de Comercio municipal.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#8d94a1] mb-1">Nombre de Fantasía *</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Panadería La Espiga"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full p-2.5 bg-[#12151b] border border-[#262d3a] rounded-xl text-xs text-[#d5d9e0] placeholder:text-[#8d94a1]/50 focus:outline-none focus:border-[#4b6cb7]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8d94a1] mb-1">Descripción del Negocio</label>
                <textarea
                  rows={2}
                  placeholder="Breve reseña de la actividad y especialidades..."
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="w-full p-2.5 bg-[#12151b] border border-[#262d3a] rounded-xl text-xs text-[#d5d9e0] placeholder:text-[#8d94a1]/50 focus:outline-none focus:border-[#4b6cb7] resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8d94a1] mb-1">Dirección en Bahía Blanca</label>
                <input
                  type="text"
                  placeholder="ej. Alsina 150"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  className="w-full p-2.5 bg-[#12151b] border border-[#262d3a] rounded-xl text-xs text-[#d5d9e0] placeholder:text-[#8d94a1]/50 focus:outline-none focus:border-[#4b6cb7]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#8d94a1] mb-1">Teléfono</label>
                  <input
                    type="text"
                    placeholder="291-..."
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    className="w-full p-2.5 bg-[#12151b] border border-[#262d3a] rounded-xl text-xs text-[#d5d9e0] placeholder:text-[#8d94a1]/50 focus:outline-none focus:border-[#4b6cb7]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#8d94a1] mb-1">WhatsApp</label>
                  <input
                    type="text"
                    placeholder="291-..."
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full p-2.5 bg-[#12151b] border border-[#262d3a] rounded-xl text-xs text-[#d5d9e0] placeholder:text-[#8d94a1]/50 focus:outline-none focus:border-[#4b6cb7]"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-xs font-medium text-[#8d94a1] hover:text-[#d5d9e0]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={enviando || !nombre.trim()}
                  className="px-4 py-2 rounded-xl bg-[#4b6cb7] hover:bg-[#3d5a99] text-[#d5d9e0] font-semibold text-xs transition-colors disabled:opacity-50"
                >
                  {enviando ? 'Enviando...' : 'Enviar Solicitud'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
