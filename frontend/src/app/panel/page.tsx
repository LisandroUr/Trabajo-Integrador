'use client';

import { useEffect, useState } from 'react';
import { fetchAPI } from '@/lib/api';
import Link from 'next/link';
import { 
  Store, 
  Plus, 
  MessageSquare, 
  Package, 
  ExternalLink, 
  Clock, 
  CheckCircle, 
  XCircle, 
  MapPin,
  Briefcase
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
      alert('¡Solicitud enviada a la municipalidad! Tu vidriera quedará visible apenas sea auditada.');
    } catch (err: any) {
      alert(err.message || 'Error al enviar solicitud');
    }
  };

  const aprobadas = comercios.filter(c => c.estado === 'aprobado').length;
  const enRevision = comercios.filter(c => c.estado === 'pendiente').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header del Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center space-x-2 bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <Briefcase className="w-4 h-4 text-indigo-600" />
            <span>Portal del Comerciante y Emprendedor</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900">Mis Vidrieras y Tiendas</h1>
          <p className="text-sm text-gray-500 mt-1">
            Administra tus locales, actualiza tus catálogos de precios y comunícate con tus clientes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/panel/mensajes"
            className="px-4 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold rounded-xl text-sm shadow-xs transition-colors flex items-center space-x-2"
          >
            <MessageSquare className="w-4 h-4 text-blue-600" />
            <span>Bandeja de Consultas</span>
          </Link>

          <button 
            onClick={() => setShowForm(!showForm)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-xs transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>{showForm ? 'Cerrar Formulario' : 'Solicitar Nueva Vidriera'}</span>
          </button>
        </div>
      </div>

      {/* Tarjetas KPI del Comerciante */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex justify-between items-center">
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase">Vidrieras Activas</span>
            <p className="text-3xl font-black text-green-600 mt-1">{aprobadas}</p>
          </div>
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex justify-between items-center">
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase">En Revisión Municipal</span>
            <p className="text-3xl font-black text-yellow-600 mt-1">{enRevision}</p>
          </div>
          <Clock className="w-10 h-10 text-yellow-500" />
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex justify-between items-center">
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase">Consultas en Vivo</span>
            <p className="text-sm font-bold text-blue-600 mt-2">Chat WebSockets Activo</p>
          </div>
          <MessageSquare className="w-10 h-10 text-blue-500" />
        </div>
      </div>

      {/* Formulario de Alta de Vidriera */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm mb-8 border border-indigo-100 ring-2 ring-indigo-50">
          <h3 className="text-lg font-black text-gray-900 mb-2">Solicitud de Alta de Nueva Vidriera</h3>
          <p className="text-xs text-gray-500 mb-6">
            La municipalidad revisará la información antes de publicarla en el buscador y el mapa.
          </p>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Nombre Comercial del Establecimiento *</label>
              <input 
                type="text" required 
                placeholder="Ej. Panadería Del Sol, Ferretería Norte..."
                className="w-full p-2.5 border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-indigo-500" 
                value={nombre} onChange={e => setNombre(e.target.value)} 
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Dirección Física (Calle y Número) *</label>
              <input 
                type="text" required 
                placeholder="Ej. San Martín 450, Centro"
                className="w-full p-2.5 border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-indigo-500" 
                value={direccion} onChange={e => setDireccion(e.target.value)} 
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Teléfono de Contacto</label>
              <input 
                type="text"
                placeholder="Ej. 0291-4500000"
                className="w-full p-2.5 border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-indigo-500" 
                value={telefono} onChange={e => setTelefono(e.target.value)} 
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">WhatsApp para Clientes</label>
              <input 
                type="text"
                placeholder="Ej. +5492914500000"
                className="w-full p-2.5 border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-indigo-500" 
                value={whatsapp} onChange={e => setWhatsapp(e.target.value)} 
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">Breve Descripción o Rubro Principal *</label>
              <textarea 
                required 
                rows={3}
                placeholder="Cuéntale a los vecinos qué ofreces, especialidades, medios de pago, etc."
                className="w-full p-2.5 border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-indigo-500" 
                value={descripcion} onChange={e => setDescripcion(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button 
              type="button" 
              onClick={() => setShowForm(false)} 
              className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-800"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              Enviar a Revisión Municipal
            </button>
          </div>
        </form>
      )}

      {/* Grid de Tiendas del Usuario */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2].map(i => <div key={i} className="h-56 bg-gray-200 rounded-2xl"></div>)}
        </div>
      ) : comercios.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl shadow-xs border border-gray-200">
          <Store className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-bold text-lg text-gray-800">No tienes vidrieras registradas</h3>
          <p className="text-gray-500 text-xs mt-1 mb-6 max-w-sm mx-auto">
            Comienza dando de alta tu primer comercio para publicar tus productos y precios.
          </p>
          <button 
            onClick={() => setShowForm(true)} 
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-xs"
          >
            + Solicitar Primera Vidriera
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {comercios.map((comercio) => (
            <div 
              key={comercio._id} 
              className="bg-white rounded-2xl shadow-xs border border-gray-200 p-6 flex flex-col hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-bold text-gray-900 leading-snug">{comercio.nombre}</h3>
                <span className={`px-2.5 py-0.5 inline-flex text-[10px] font-black uppercase tracking-wider rounded-full 
                  ${comercio.estado === 'aprobado' ? 'bg-green-100 text-green-800' : 
                    comercio.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-red-100 text-red-800'}`}>
                  {comercio.estado}
                </span>
              </div>

              <p className="text-xs text-gray-500 line-clamp-2 mb-3 flex-1">
                {comercio.descripcion || 'Sin descripción.'}
              </p>

              {comercio.direccion && (
                <p className="text-xs text-gray-400 flex items-center mb-4">
                  <MapPin className="w-3.5 h-3.5 text-red-400 mr-1 flex-shrink-0" />
                  <span className="truncate">{comercio.direccion}</span>
                </p>
              )}

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
                {comercio.estado === 'aprobado' ? (
                  <>
                    <Link 
                      href={`/panel/comercio/${comercio._id}`} 
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
                    >
                      <Package className="w-4 h-4" />
                      <span>Gestionar Catálogo</span>
                    </Link>

                    <Link
                      href={`/comercio/${comercio._id}`}
                      target="_blank"
                      className="text-xs text-gray-400 hover:text-blue-600 flex items-center space-x-1"
                      title="Ver vidriera pública"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </>
                ) : (
                  <span className="text-xs text-yellow-700 bg-yellow-50 px-2.5 py-1 rounded-md flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
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
