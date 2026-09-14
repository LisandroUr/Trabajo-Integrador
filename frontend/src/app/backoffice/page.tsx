'use client';

import { useEffect, useState } from 'react';
import { fetchAPI } from '@/lib/api';
import { 
  ShieldCheck, 
  Store, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Check, 
  Trash2,
  BarChart3
} from 'lucide-react';

interface Comercio {
  _id: string;
  nombre: string;
  estado: string;
  createdAt: string;
  direccion?: string;
  contacto?: {
    telefono?: string;
    email?: string;
  };
}

interface ResenaReportada {
  _id: string;
  comercioId: {
    _id: string;
    nombre: string;
  };
  usuarioId: {
    _id: string;
    nombre: string;
    email: string;
  };
  puntaje: number;
  comentario: string;
  createdAt: string;
}

export default function BackofficePage() {
  const [tabActiva, setTabActiva] = useState<'comercios' | 'resenas'>('comercios');
  const [comercios, setComercios] = useState<Comercio[]>([]);
  const [resenasReportadas, setResenasReportadas] = useState<ResenaReportada[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [comRes, resenasRes] = await Promise.all([
        fetchAPI('/comercios/admin/all?limit=100'),
        fetchAPI('/resenas/admin/reportadas')
      ]);
      setComercios(comRes.data || []);
      setResenasReportadas(resenasRes || []);
    } catch (err: any) {
      setError(err.message || 'Error cargando datos administrativos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const cambiarEstado = async (id: string, nuevoEstado: string) => {
    const motivo = prompt(`Ingresa el motivo para cambiar el estado a '${nuevoEstado}':`, `Resolución municipal ${nuevoEstado}`);
    if (motivo === null) return; // cancelado por usuario

    try {
      await fetchAPI(`/comercios/${id}/estado`, {
        method: 'PATCH',
        body: JSON.stringify({ estado: nuevoEstado, motivo: motivo || `Actualizado por admin a ${nuevoEstado}` })
      });
      loadData();
    } catch (err: any) {
      alert('Error cambiando estado: ' + err.message);
    }
  };

  const moderarResena = async (id: string, accion: 'eliminar' | 'descartar') => {
    const confirmMsg = accion === 'eliminar' 
      ? '¿Confirmas la eliminación permanente de esta reseña ofensiva?' 
      : '¿Deseas descartar el reporte y mantener la reseña visible?';
    
    if (!confirm(confirmMsg)) return;

    try {
      await fetchAPI(`/resenas/admin/moderar/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ accion })
      });
      alert(`Acción realizada: Reseña ${accion === 'eliminar' ? 'eliminada' : 'reporte descartado'}.`);
      loadData();
    } catch (err: any) {
      alert('Error al moderar reseña: ' + err.message);
    }
  };

  // KPIs
  const totalComercios = comercios.length;
  const pendientes = comercios.filter((c) => c.estado === 'pendiente').length;
  const aprobados = comercios.filter((c) => c.estado === 'aprobado').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Backoffice */}
      <div className="mb-8">
        <div className="inline-flex items-center space-x-2 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
          <ShieldCheck className="w-4 h-4 text-purple-600" />
          <span>Dirección de Comercio e Industria Municipal</span>
        </div>
        <h1 className="text-3xl font-black text-gray-900">Panel de Control y Moderación</h1>
        <p className="text-sm text-gray-500 mt-1">
          Supervisión de solicitudes de vidrieras digitales, verificación de establecimientos y moderación de contenidos.
        </p>
      </div>

      {/* Tarjetas KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase">Total Solicitudes</span>
            <p className="text-3xl font-black text-gray-900 mt-1">{totalComercios}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Store className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-yellow-200 bg-yellow-50/30 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-yellow-700 uppercase">Pendientes de Revisión</span>
            <p className="text-3xl font-black text-yellow-700 mt-1">{pendientes}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-yellow-100 text-yellow-800 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-red-200 bg-red-50/30 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-red-700 uppercase">Reseñas Reportadas</span>
            <p className="text-3xl font-black text-red-700 mt-1">{resenasReportadas.length}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-100 text-red-800 flex items-center justify-center font-bold">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Selector de Pestañas */}
      <div className="flex border-b border-gray-200 mb-6 space-x-4">
        <button
          onClick={() => setTabActiva('comercios')}
          className={`pb-3 font-bold text-sm flex items-center space-x-2 border-b-2 transition-colors ${
            tabActiva === 'comercios'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Comercios y Vidrieras ({comercios.length})</span>
        </button>

        <button
          onClick={() => setTabActiva('resenas')}
          className={`pb-3 font-bold text-sm flex items-center space-x-2 border-b-2 transition-colors ${
            tabActiva === 'resenas'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Moderación de Reseñas ({resenasReportadas.length})</span>
        </button>
      </div>

      {error && <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm mb-6">{error}</div>}

      {/* Pestaña: Comercios */}
      {tabActiva === 'comercios' && (
        <div className="bg-white rounded-2xl shadow-xs border border-gray-200 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-bold text-base text-gray-800">Listado Maestro de Comercios</h3>
            <span className="text-xs text-gray-500">Ordenados por fecha de solicitud</span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5 text-left">Comercio</th>
                  <th className="px-6 py-3.5 text-left">Fecha Solicitud</th>
                  <th className="px-6 py-3.5 text-left">Estado</th>
                  <th className="px-6 py-3.5 text-right">Acciones de Auditoría</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {comercios.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                      No hay comercios registrados.
                    </td>
                  </tr>
                ) : (
                  comercios.map((comercio) => (
                    <tr key={comercio._id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{comercio.nombre}</div>
                        <div className="text-xs text-gray-500">{comercio.direccion || 'Sin dirección'}</div>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500 whitespace-nowrap">
                        {new Date(comercio.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs font-extrabold rounded-full uppercase tracking-wider ${
                            comercio.estado === 'aprobado'
                              ? 'bg-green-100 text-green-800'
                              : comercio.estado === 'pendiente'
                              ? 'bg-yellow-100 text-yellow-800 animate-pulse'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {comercio.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                        {comercio.estado !== 'aprobado' && (
                          <button
                            onClick={() => cambiarEstado(comercio._id, 'aprobado')}
                            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                          >
                            ✓ Aprobar
                          </button>
                        )}
                        {comercio.estado !== 'rechazado' && (
                          <button
                            onClick={() => cambiarEstado(comercio._id, 'rechazado')}
                            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-semibold transition-colors"
                          >
                            ✕ Rechazar
                          </button>
                        )}
                        {comercio.estado === 'aprobado' && (
                          <button
                            onClick={() => cambiarEstado(comercio._id, 'suspendido')}
                            className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 rounded-lg text-xs font-semibold transition-colors"
                          >
                            Suspender
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pestaña: Reseñas Reportadas (Etapa 5) */}
      {tabActiva === 'resenas' && (
        <div className="bg-white rounded-2xl shadow-xs border border-gray-200 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-red-50/40">
            <div>
              <h3 className="font-bold text-base text-gray-900">Bandeja de Reseñas Reportadas</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Comentarios marcados por usuarios como potencialmente ofensivos o inadecuados.
              </p>
            </div>
            <span className="bg-red-100 text-red-800 font-bold px-3 py-1 rounded-full text-xs">
              {resenasReportadas.length} reportadas
            </span>
          </div>

          <div className="divide-y divide-gray-200">
            {resenasReportadas.length === 0 ? (
              <div className="p-12 text-center text-gray-400 text-sm">
                <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
                <p className="font-bold text-gray-700">No hay reseñas reportadas pendientes de moderación.</p>
                <p className="text-xs text-gray-400 mt-1">La comunidad se mantiene en armonía.</p>
              </div>
            ) : (
              resenasReportadas.map((r) => (
                <div key={r._id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="font-bold text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                        Comercio: {r.comercioId?.nombre || 'Comercio'}
                      </span>
                      <span className="text-xs text-gray-500">
                        Por: <strong>{r.usuarioId?.nombre || 'Vecino'}</strong> ({r.usuarioId?.email})
                      </span>
                      <span className="text-yellow-500 text-xs font-bold">
                        {'★'.repeat(r.puntaje)} ({r.puntaje}/5)
                      </span>
                    </div>
                    <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded-xl border border-gray-200 italic">
                      "{r.comentario}"
                    </p>
                    <span className="text-[10px] text-gray-400 mt-1 block">
                      Fecha de publicación: {new Date(r.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3 flex-shrink-0">
                    <button
                      onClick={() => moderarResena(r._id, 'descartar')}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-colors flex items-center space-x-1"
                    >
                      <Check className="w-3.5 h-3.5 text-green-600" />
                      <span>Descartar Reporte</span>
                    </button>
                    <button
                      onClick={() => moderarResena(r._id, 'eliminar')}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow-xs transition-colors flex items-center space-x-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Eliminar Reseña</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
