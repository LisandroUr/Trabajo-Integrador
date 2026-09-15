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
  ChevronRight,
  Store,
  X,
  Send,
  AlertCircle
} from 'lucide-react';

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

  const loadMisComercios = async () => {
    setLoading(true);
    try {
      const res = await fetchAPI('/comercios/me/mis-tiendas'); 
      setComercios(res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMisComercios();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchAPI('/comercios', {
        method: 'POST',
        body: JSON.stringify({ 
          nombre, 
          descripcion,
          direccion,
          contacto: { telefono, whatsapp }
        })
      });
      setShowForm(false);
      setNombre('');
      setDescripcion('');
      setDireccion('');
      setTelefono('');
      setWhatsapp('');
      loadMisComercios();
      alert('Solicitud enviada a la municipalidad. El local se publicará una vez auditado.');
    } catch (err: any) {
      alert(err.message || 'Error al registrar la solicitud');
    }
  };

  const aprobadas = comercios.filter(c => c.estado === 'aprobado').length;
  const enRevision = comercios.filter(c => c.estado === 'pendiente').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Dashboard Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold uppercase tracking-wider mb-2">
            <Building2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Gestión Comercial</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Mis Vidrieras y Locales</h1>
          <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1">
            Administra tus establecimientos, publica catálogos y responde consultas ciudadanas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/panel/mensajes"
            className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs shadow-2xs transition-colors flex items-center space-x-2"
          >
            <MessageSquare className="w-4 h-4 text-slate-500" />
            <span>Bandeja de Consultas</span>
          </Link>

          <button 
            onClick={() => setShowForm(!showForm)}
            className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl font-semibold text-xs shadow-xs transition-colors flex items-center space-x-2"
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{showForm ? 'Cerrar Formulario' : 'Solicitar Nueva Vidriera'}</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex justify-between items-center">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Vidrieras Activas</span>
            <p className="text-3xl font-black text-slate-900 mt-1 font-mono tabular-nums">{aprobadas}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex justify-between items-center">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">En Evaluación</span>
            <p className="text-3xl font-black text-amber-600 mt-1 font-mono tabular-nums">{enRevision}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex justify-between items-center">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Canal en Vivo</span>
            <p className="text-xs font-bold text-emerald-600 mt-1.5 flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
              <span>WebSockets Operativo</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <MessageSquare className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Store Request Form Drawer */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm mb-8 border border-slate-300">
          <div className="mb-6 pb-4 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Solicitud de Habilitación de Vidriera</h3>
            <p className="text-xs text-slate-500 mt-0.5 font-normal">
              La dirección municipal de comercio validará los datos para certificar el establecimiento.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Nombre Comercial *</label>
              <input 
                type="text" required 
                placeholder="Ej. Panadería Central, Supermercado Norte..."
                className="w-full p-2.5 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 focus:outline-none" 
                value={nombre} onChange={e => setNombre(e.target.value)} 
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Dirección Física *</label>
              <input 
                type="text" required 
                placeholder="Ej. San Martín 450, Centro"
                className="w-full p-2.5 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 focus:outline-none" 
                value={direccion} onChange={e => setDireccion(e.target.value)} 
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Teléfono Fijo</label>
              <input 
                type="text"
                placeholder="Ej. 0291-4500000"
                className="w-full p-2.5 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 focus:outline-none" 
                value={telefono} onChange={e => setTelefono(e.target.value)} 
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">WhatsApp Comercial</label>
              <input 
                type="text"
                placeholder="Ej. +5492914500000"
                className="w-full p-2.5 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 focus:outline-none" 
                value={whatsapp} onChange={e => setWhatsapp(e.target.value)} 
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Descripción de la Actividad *</label>
              <textarea 
                required 
                rows={3}
                placeholder="Describe el rubro, especialidades y servicios ofrecidos..."
                className="w-full p-2.5 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 focus:outline-none" 
                value={descripcion} onChange={e => setDescripcion(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button 
              type="button" 
              onClick={() => setShowForm(false)} 
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              Enviar a Auditoría
            </button>
          </div>
        </form>
      )}

      {/* Stores Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2].map(i => <div key={i} className="h-52 bg-slate-100 rounded-2xl animate-pulse"></div>)}
        </div>
      ) : comercios.length === 0 ? (
        <div className="bg-white p-14 text-center rounded-2xl shadow-xs border border-slate-200">
          <Store className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-sm text-slate-900">No posees vidrieras registradas</h3>
          <p className="text-xs text-slate-500 mt-1 mb-5 max-w-xs mx-auto font-normal">
            Da de alta tu primer establecimiento para publicar tu catálogo con precios oficiales.
          </p>
          <button 
            onClick={() => setShowForm(true)} 
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-xs shadow-xs transition-colors"
          >
            Solicitar Nueva Vidriera
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {comercios.map((comercio) => (
            <div 
              key={comercio._id} 
              className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-6 flex flex-col hover:border-slate-300 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-base font-bold text-slate-900 leading-snug">{comercio.nombre}</h3>
                <span className={`px-2.5 py-0.5 inline-flex text-[10px] font-bold uppercase tracking-wider rounded-full border ${
                  comercio.estado === 'aprobado' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 
                  comercio.estado === 'pendiente' ? 'bg-amber-50 text-amber-800 border-amber-200' : 
                  'bg-rose-50 text-rose-800 border-rose-200'}`}>
                  {comercio.estado}
                </span>
              </div>

              <p className="text-xs text-slate-500 line-clamp-2 mb-3 flex-1 font-normal leading-relaxed">
                {comercio.descripcion || 'Sin descripción ingresada.'}
              </p>

              {comercio.direccion && (
                <div className="text-xs text-slate-400 flex items-center mb-5 truncate font-normal">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 mr-1 flex-shrink-0" />
                  <span className="truncate">{comercio.direccion}</span>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                {comercio.estado === 'aprobado' ? (
                  <>
                    <Link 
                      href={`/panel/comercio/${comercio._id}`} 
                      className="text-xs font-bold text-slate-900 hover:text-indigo-600 flex items-center space-x-1"
                    >
                      <Package className="w-3.5 h-3.5 text-slate-500" />
                      <span>Gestionar Catálogo</span>
                    </Link>

                    <Link
                      href={`/comercio/${comercio._id}`}
                      target="_blank"
                      className="text-xs text-slate-400 hover:text-slate-700 flex items-center space-x-1 p-1 rounded-md hover:bg-slate-50"
                      title="Ver vidriera pública"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </>
                ) : (
                  <span className="text-xs text-amber-700 flex items-center space-x-1 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    <span>En evaluación por el municipio</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
