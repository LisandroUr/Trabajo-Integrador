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
  BarChart3,
  Search,
  Sparkles,
  ChevronRight
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
  const [filtroTexto, setFiltroTexto] = useState('');

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [nombre, setNombre] = useState('');
  const [rubro, setRubro] = useState('Alimentos y Bebidas');
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

      toast.success('Solicitud de vidriera digital enviada a auditoría municipal con éxito');
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

  const comerciosFiltrados = comercios.filter(c => 
    c.nombre.toLowerCase().includes(filtroTexto.toLowerCase()) ||
    (c.direccion || '').toLowerCase().includes(filtroTexto.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Merchant Profile & Navigation Header */}
      <div className="mb-8 rounded-2xl bg-[#161a22] border border-[#2b3342] p-6 sm:p-8 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#182630] border border-[#294354] text-[#9bc5cc] text-xs font-semibold tracking-wide">
              <ShieldCheck className="w-3.5 h-3.5 text-[#7dafb5]" />
              <span>Portal Oficial de Autogestión Comercial &bull; Bahía Blanca</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#f3f5f8] tracking-tight">
              Mis Vidrieras & Catálogos
            </h1>
            <p className="text-sm sm:text-base text-[#b8c0cc] leading-relaxed max-w-3xl">
              Publica tus artículos con precios transparentes para alimentar el Observatorio Municipal de Precios, gestionar tu inventario y atender consultas de vecinos en tiempo real.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start lg:self-center">
            <Link
              href="/panel/mensajes"
              className="px-4 py-2.5 rounded-xl bg-[#1d232e] hover:bg-[#252c3a] text-[#f3f5f8] border border-[#343e50] text-xs font-semibold transition-all flex items-center space-x-2 shadow-xs"
            >
              <MessageSquare className="w-4 h-4 text-[#7dafb5]" />
              <span>Bandeja de Consultas</span>
            </Link>

            <Link
              href="/ranking"
              className="px-4 py-2.5 rounded-xl bg-[#1d232e] hover:bg-[#252c3a] text-[#b8c0cc] hover:text-[#f3f5f8] border border-[#343e50] text-xs font-semibold transition-all flex items-center space-x-2 shadow-xs"
            >
              <BarChart3 className="w-4 h-4 text-[#e0b980]" />
              <span>Ver Ranking Municipal</span>
            </Link>

            <button
              onClick={() => setShowForm(true)}
              className="px-5 py-2.5 rounded-xl bg-[#4568b4] hover:bg-[#395697] text-[#f3f5f8] text-xs font-bold transition-all flex items-center space-x-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Vidriera</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards (High Contrast & Clarity) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="p-6 rounded-2xl bg-[#161a22] border border-[#2b3342] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#9eb1cb]">Total Establecimientos</span>
            <div className="w-9 h-9 rounded-xl bg-[#1d232e] border border-[#343e50] text-[#7dafb5] flex items-center justify-center font-bold">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-[#f3f5f8] mt-3 tabular-nums">{comercios.length}</p>
          <p className="text-xs text-[#b8c0cc] mt-1.5 font-medium">Comercios vinculados a tu titularidad</p>
        </div>

        <div className="p-6 rounded-2xl bg-[#161a22] border border-[#2b3342] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#93cca5]">Vidrieras Activas</span>
            <div className="w-9 h-9 rounded-xl bg-[#192b22] border border-[#2b4c39] text-[#93cca5] flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-[#93cca5] mt-3 tabular-nums">{aprobados}</p>
          <p className="text-xs text-[#b8c0cc] mt-1.5 font-medium">Habilitadas y visibles en el Observatorio y Mapa</p>
        </div>

        <div className="p-6 rounded-2xl bg-[#161a22] border border-[#2b3342] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#e0b980]">En Fiscalización</span>
            <div className="w-9 h-9 rounded-xl bg-[#2f2416] border border-[#544023] text-[#e0b980] flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-[#e0b980] mt-3 tabular-nums">{pendientes}</p>
          <p className="text-xs text-[#b8c0cc] mt-1.5 font-medium">En cola de revisión por la Dirección de Comercio</p>
        </div>
      </div>

      {/* Filter and Store List Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-[#f3f5f8]">Tus Establecimientos Comerciales</h2>
          <p className="text-xs text-[#b8c0cc]">Selecciona un comercio para gestionar precios o responder mensajes.</p>
        </div>

        {comercios.length > 1 && (
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#7d8799]" />
            <input
              type="text"
              placeholder="Buscar por nombre o calle..."
              value={filtroTexto}
              onChange={(e) => setFiltroTexto(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#161a22] border border-[#2b3342] rounded-xl text-xs text-[#f3f5f8] placeholder-[#7d8799] focus:outline-none focus:border-[#4568b4]"
            />
          </div>
        )}
      </div>

      {/* Stores Grid */}
      {loading ? (
        <div className="p-16 text-center text-[#b8c0cc] rounded-2xl bg-[#161a22] border border-[#2b3342]">
          <div className="w-8 h-8 border-2 border-[#4568b4] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm font-semibold text-[#f3f5f8]">Cargando tus establecimientos...</p>
          <p className="text-xs text-[#b8c0cc] mt-1">Conectando con la base de datos municipal</p>
        </div>
      ) : comercios.length === 0 ? (
        <div className="p-12 sm:p-16 rounded-2xl bg-[#161a22] border border-[#2b3342] text-center shadow-md">
          <div className="w-14 h-14 rounded-2xl bg-[#1d232e] border border-[#343e50] text-[#7dafb5] flex items-center justify-center mx-auto mb-4">
            <Store className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-[#f3f5f8]">Aún no registraste ninguna vidriera digital</h3>
          <p className="text-sm text-[#b8c0cc] mt-2 max-w-md mx-auto leading-relaxed">
            Da de alta tu primer comercio local para comenzar a publicar precios de referencia, mejorar tu visibilidad barrial y recibir consultas de vecinos.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-6 px-6 py-3 bg-[#4568b4] hover:bg-[#395697] text-[#f3f5f8] rounded-xl text-xs font-bold transition-all shadow-sm inline-flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Primera Vidriera</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {comerciosFiltrados.map((comercio) => {
            const esAprobado = comercio.estado === 'aprobado';
            const esPendiente = comercio.estado === 'pendiente';

            return (
              <div
                key={comercio._id}
                className="p-6 rounded-2xl bg-[#161a22] border border-[#2b3342] hover:border-[#4568b4]/60 transition-all shadow-sm flex flex-col justify-between group"
              >
                <div>
                  {/* Top Status & Avatar */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-[#1d232e] border border-[#343e50] text-[#9bc5cc] font-extrabold text-base flex items-center justify-center">
                      {(comercio?.nombre || 'C').charAt(0).toUpperCase()}
                    </div>
                    
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider inline-flex items-center space-x-1.5 ${
                        esAprobado
                          ? 'bg-[#192b22] text-[#93cca5] border border-[#2b4c39]'
                          : esPendiente
                          ? 'bg-[#2f2416] text-[#e0b980] border border-[#544023]'
                          : 'bg-[#2d1b22] text-[#e094a2] border border-[#522934]'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${
                        esAprobado ? 'bg-[#4a7c59]' : esPendiente ? 'bg-[#b8860b]' : 'bg-[#8b3a4a]'
                      }`} />
                      <span>{comercio.estado}</span>
                    </span>
                  </div>

                  {/* Store Title */}
                  <h3 className="text-lg font-bold text-[#f3f5f8] group-hover:text-[#adc4eb] transition-colors">
                    {comercio.nombre}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-[#b8c0cc] mt-2 line-clamp-2 leading-relaxed">
                    {comercio.descripcion || 'Establecimiento comercial sin descripción detallada registrada.'}
                  </p>

                  {/* Location */}
                  {comercio.direccion && (
                    <div className="mt-4 flex items-center space-x-2 text-xs text-[#d8dfea] bg-[#1d232e] px-3 py-2 rounded-xl border border-[#2b3342]">
                      <MapPin className="w-4 h-4 text-[#7dafb5] flex-shrink-0" />
                      <span className="truncate font-medium">{comercio.direccion}</span>
                    </div>
                  )}

                  {/* Observatory status badge */}
                  <div className="mt-4 text-[11px] text-[#9eb1cb] flex items-center space-x-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-[#93cca5]" />
                    <span>Vinculado al Observatorio de Precios</span>
                  </div>
                </div>

                {/* Actions Button Group */}
                <div className="mt-6 pt-5 border-t border-[#2b3342] space-y-2.5">
                  <Link
                    href={`/panel/comercio/${comercio._id}`}
                    className="w-full py-2.5 rounded-xl bg-[#4568b4] hover:bg-[#395697] text-[#f3f5f8] font-bold text-xs transition-colors flex items-center justify-center space-x-2 shadow-xs"
                  >
                    <Package className="w-4 h-4" />
                    <span>Administrar Catálogo & Precios</span>
                  </Link>

                  <div className="grid grid-cols-2 gap-2">
                    {esAprobado ? (
                      <Link
                        href={`/comercio/${comercio._id}`}
                        className="py-2 px-3 rounded-xl bg-[#1d232e] hover:bg-[#252c3a] text-[#b8c0cc] hover:text-[#f3f5f8] border border-[#343e50] text-xs font-semibold transition-colors flex items-center justify-center space-x-1.5 text-center"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Ver Vidriera</span>
                      </Link>
                    ) : (
                      <div className="py-2 px-3 rounded-xl bg-[#1d232e]/50 border border-[#2b3342] text-[11px] text-[#7d8799] font-medium flex items-center justify-center text-center">
                        <span>En Revisión</span>
                      </div>
                    )}

                    <Link
                      href="/panel/mensajes"
                      className="py-2 px-3 rounded-xl bg-[#1d232e] hover:bg-[#252c3a] text-[#b8c0cc] hover:text-[#f3f5f8] border border-[#343e50] text-xs font-semibold transition-colors flex items-center justify-center space-x-1.5 text-center"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-[#7dafb5]" />
                      <span>Chat Vecinos</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Store Request Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-[#0c0e12]/85 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#161a22] border border-[#2b3342] rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-5 right-5 text-[#b8c0cc] hover:text-[#f3f5f8] p-1.5 rounded-lg hover:bg-[#1d232e] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#182630] border border-[#294354] text-[#9bc5cc] text-[11px] font-semibold mb-2">
                <Store className="w-3 h-3 text-[#7dafb5]" />
                <span>Trámite Municipal de Alta</span>
              </div>
              <h3 className="text-xl font-extrabold text-[#f3f5f8]">Solicitud de Nueva Vidriera Digital</h3>
              <p className="text-xs text-[#b8c0cc] mt-1 leading-relaxed">
                El comercio será registrado en el sistema municipal para ser admitido por la Dirección de Comercio e Industria de Bahía Blanca.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#f3f5f8] mb-1.5">
                  Nombre de Fantasía o Razón Social *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. Panadería La Central"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full p-3 bg-[#13161d] border border-[#343e50] rounded-xl text-xs text-[#f3f5f8] placeholder-[#7d8799] focus:outline-none focus:border-[#4568b4]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#f3f5f8] mb-1.5">
                  Rubro Comercial Principal
                </label>
                <select
                  value={rubro}
                  onChange={(e) => setRubro(e.target.value)}
                  className="w-full p-3 bg-[#13161d] border border-[#343e50] rounded-xl text-xs text-[#f3f5f8] focus:outline-none focus:border-[#4568b4]"
                >
                  <option value="Alimentos y Bebidas">Alimentos y Bebidas</option>
                  <option value="Supermercado y Almacén">Supermercado y Almacén</option>
                  <option value="Farmacia y Salud">Farmacia y Salud</option>
                  <option value="Ferretería y Hogar">Ferretería y Hogar</option>
                  <option value="Indumentaria y Calzado">Indumentaria y Calzado</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#f3f5f8] mb-1.5">
                  Descripción Comercial
                </label>
                <textarea
                  rows={2}
                  placeholder="Breve detalle de los productos y especialidades que ofreces..."
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="w-full p-3 bg-[#13161d] border border-[#343e50] rounded-xl text-xs text-[#f3f5f8] placeholder-[#7d8799] focus:outline-none focus:border-[#4568b4] resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#f3f5f8] mb-1.5">
                  Dirección Física en Bahía Blanca
                </label>
                <input
                  type="text"
                  placeholder="ej. Alsina 240, Centro"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  className="w-full p-3 bg-[#13161d] border border-[#343e50] rounded-xl text-xs text-[#f3f5f8] placeholder-[#7d8799] focus:outline-none focus:border-[#4568b4]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#f3f5f8] mb-1.5">Teléfono Fijo / Móvil</label>
                  <input
                    type="text"
                    placeholder="291-4567890"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    className="w-full p-3 bg-[#13161d] border border-[#343e50] rounded-xl text-xs text-[#f3f5f8] placeholder-[#7d8799] focus:outline-none focus:border-[#4568b4]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#f3f5f8] mb-1.5">WhatsApp Comercial</label>
                  <input
                    type="text"
                    placeholder="291-5123456"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full p-3 bg-[#13161d] border border-[#343e50] rounded-xl text-xs text-[#f3f5f8] placeholder-[#7d8799] focus:outline-none focus:border-[#4568b4]"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-[#2b3342]">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-[#b8c0cc] hover:text-[#f3f5f8] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={enviando || !nombre.trim()}
                  className="px-5 py-2.5 rounded-xl bg-[#4568b4] hover:bg-[#395697] text-[#f3f5f8] font-bold text-xs transition-colors disabled:opacity-50 shadow-sm"
                >
                  {enviando ? 'Enviando Solicitud...' : 'Presentar Solicitud de Alta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
