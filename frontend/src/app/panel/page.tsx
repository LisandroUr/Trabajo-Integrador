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
  TrendingUp,
  Layers,
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
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {}

      toast.success('¡Solicitud de vidriera digital enviada a auditoría municipal!');
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
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border border-white/10 p-8 sm:p-12 mb-10 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-4">
              <Store className="w-3.5 h-3.5 text-indigo-400" />
              <span>Portal de Autogestión Comercial</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Mis Vidrieras & Catálogos
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
              Administra tus tiendas, publica productos con precios actualizados para el observatorio y responde consultas de vecinos en tiempo real.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/panel/mensajes"
              className="px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-bold transition-all flex items-center space-x-2"
            >
              <MessageSquare className="w-4 h-4 text-indigo-400" />
              <span>Bandeja de Consultas</span>
            </Link>

            <button
              onClick={() => setShowForm(true)}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Vidriera</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
        <div className="p-6 rounded-3xl bg-slate-900/70 border border-white/10 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Locales</span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold">
              <Store className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-white mt-3 tabular-nums">{comercios.length}</p>
          <p className="text-xs text-slate-400 mt-1">Establecimientos asociados a tu cuenta</p>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/70 border border-emerald-500/30 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Vidrieras Activas</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-emerald-400 mt-3 tabular-nums">{aprobados}</p>
          <p className="text-xs text-slate-400 mt-1">Visibles para los vecinos y en el ranking</p>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/70 border border-amber-500/30 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">En Fiscalización</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-amber-400 mt-3 tabular-nums">{pendientes}</p>
          <p className="text-xs text-slate-400 mt-1">En espera de resolución municipal</p>
        </div>
      </div>

      {/* Stores List */}
      {loading ? (
        <div className="p-20 text-center text-slate-400">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm font-semibold">Cargando tus establecimientos...</p>
        </div>
      ) : comercios.length === 0 ? (
        <div className="p-16 rounded-3xl bg-slate-900/50 border border-white/5 text-center text-slate-400">
          <Store className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">Aún no registraste ninguna vidriera digital</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Da de alta tu primer comercio para empezar a publicar precios y conectar con los vecinos.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-6 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold"
          >
            Crear Primera Vidriera
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {comercios.map((comercio) => {
            const esAprobado = comercio.estado === 'aprobado';
            const esPendiente = comercio.estado === 'pendiente';

            return (
              <div
                key={comercio._id}
                className="p-6 rounded-3xl bg-slate-900/70 border border-white/10 hover:border-indigo-500/40 transition-all shadow-xl backdrop-blur-xl flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-black text-lg flex items-center justify-center">
                      {comercio.nombre.charAt(0).toUpperCase()}
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider inline-flex items-center space-x-1.5 ${
                        esAprobado
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : esPendiente
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        esAprobado ? 'bg-emerald-400' : esPendiente ? 'bg-amber-400' : 'bg-rose-400'
                      }`} />
                      <span>{comercio.estado}</span>
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-white group-hover:text-indigo-300 transition-colors">
                    {comercio.nombre}
                  </h3>

                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {comercio.descripcion || 'Sin descripción.'}
                  </p>

                  {comercio.direccion && (
                    <div className="mt-3 flex items-center space-x-1.5 text-xs text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                      <span className="truncate">{comercio.direccion}</span>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-5 border-t border-white/5 space-y-2">
                  <Link
                    href={`/panel/comercio/${comercio._id}`}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center space-x-1.5"
                  >
                    <Package className="w-3.5 h-3.5" />
                    <span>Administrar Catálogo</span>
                  </Link>

                  {esAprobado && (
                    <Link
                      href={`/comercio/${comercio._id}`}
                      className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-semibold transition-all flex items-center justify-center space-x-1.5"
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-white/15 rounded-3xl max-w-lg w-full p-8 shadow-2xl relative">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white p-1 rounded-xl hover:bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <h3 className="text-xl font-black text-white">Solicitud de Nueva Vidriera</h3>
              <p className="text-xs text-slate-400 mt-1">
                La solicitud pasará por la auditoría de la Dirección de Comercio municipal.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Nombre de Fantasía *</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Panadería La Espiga"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Descripción del Negocio</label>
                <textarea
                  rows={2}
                  placeholder="Breve reseña de la actividad y especialidades..."
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Dirección en Bahía Blanca</label>
                <input
                  type="text"
                  placeholder="ej. Alsina 150"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Teléfono</label>
                  <input
                    type="text"
                    placeholder="291-..."
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">WhatsApp</label>
                  <input
                    type="text"
                    placeholder="291-..."
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={enviando || !nombre.trim()}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all"
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
