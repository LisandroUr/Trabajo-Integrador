'use client';

import { useEffect, useState } from 'react';
import { fetchAPI } from '@/lib/api';
import { 
  ShieldCheck, 
  Store, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Check, 
  Trash2,
  BarChart3,
  Search,
  Building2,
  Calendar,
  Eye,
  Star,
  RefreshCw,
  PauseCircle,
  Flag
} from 'lucide-react';

interface Comercio {
  _id: string;
  nombre: string;
  estado: string;
  createdAt: string;
  direccion?: string;
  categoria?: string;
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
  const [filterQuery, setFilterQuery] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<'todos' | 'pendiente' | 'aprobado' | 'rechazado' | 'suspendido'>('todos');

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
    if (motivo === null) return;

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
      loadData();
    } catch (err: any) {
      alert('Error al moderar reseña: ' + err.message);
    }
  };

  // KPIs
  const totalComercios = comercios.length;
  const pendientes = comercios.filter((c) => c.estado === 'pendiente').length;
  const aprobados = comercios.filter((c) => c.estado === 'aprobado').length;

  const comerciosFiltrados = comercios.filter((c) => {
    const matchQuery = c.nombre.toLowerCase().includes(filterQuery.toLowerCase()) || 
                       (c.direccion || '').toLowerCase().includes(filterQuery.toLowerCase());
    const matchEstado = estadoFilter === 'todos' ? true : c.estado === estadoFilter;
    return matchQuery && matchEstado;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* GovTech Institutional Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-8 md:p-10 mb-8 border border-slate-800 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-indigo-400 text-xs font-bold tracking-wide uppercase mb-3">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>Auditoría & Fiscalización Municipal</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Backoffice y Moderación
            </h1>
            <p className="text-sm text-slate-400 mt-2 max-w-2xl leading-relaxed">
              Supervisión de solicitudes de vidrieras digitales, verificación de establecimientos comerciales y fiscalización de comentarios ciudadanos.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={loadData}
              disabled={loading}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center space-x-2 shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
              <span>Actualizar datos</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Comercios</span>
              <p className="text-3xl font-black text-slate-900 mt-1 tabular-nums">{totalComercios}</p>
              <p className="text-xs text-slate-500 mt-1">Registrados en la plataforma</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
              <Store className="w-6 h-6 stroke-[1.75]" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-amber-200 bg-amber-50/20 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Pendientes de Aprobación</span>
              <p className="text-3xl font-black text-amber-700 mt-1 tabular-nums">{pendientes}</p>
              <p className="text-xs text-amber-600 mt-1">Requieren verificación legal</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Clock className="w-6 h-6 stroke-[1.75]" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-rose-200 bg-rose-50/20 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">Reseñas Reportadas</span>
              <p className="text-3xl font-black text-rose-700 mt-1 tabular-nums">{resenasReportadas.length}</p>
              <p className="text-xs text-rose-600 mt-1">En cola de moderación</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold">
              <Flag className="w-6 h-6 stroke-[1.75]" />
            </div>
          </div>
        </div>
      </div>

      {/* Modern Segmented Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 mb-8 pb-px">
        <button
          onClick={() => setTabActiva('comercios')}
          className={`pb-4 px-4 font-bold text-xs uppercase tracking-wider flex items-center space-x-2.5 border-b-2 transition-all ${
            tabActiva === 'comercios'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Vidrieras Comerciales ({comercios.length})</span>
        </button>

        <button
          onClick={() => setTabActiva('resenas')}
          className={`pb-4 px-4 font-bold text-xs uppercase tracking-wider flex items-center space-x-2.5 border-b-2 transition-all ${
            tabActiva === 'resenas'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Moderación de Reseñas ({resenasReportadas.length})</span>
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl text-xs font-semibold mb-6 flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Tab: Comercios */}
      {tabActiva === 'comercios' && (
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/80 overflow-hidden">
          {/* Table Header Filter Bar */}
          <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-50/40">
            <div>
              <h3 className="font-bold text-base text-slate-900 tracking-tight">Registro General de Vidrieras</h3>
              <p className="text-xs text-slate-400 mt-0.5">Control de admisión, vigencia y cumplimiento normativo</p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Status Filter */}
              <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200 text-xs">
                {(['todos', 'pendiente', 'aprobado', 'rechazado', 'suspendido'] as const).map((est) => (
                  <button
                    key={est}
                    onClick={() => setEstadoFilter(est)}
                    className={`px-2.5 py-1 rounded-lg font-semibold capitalize transition-all ${
                      estadoFilter === est 
                        ? 'bg-white text-slate-900 shadow-xs' 
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {est}
                  </button>
                ))}
              </div>

              {/* Search input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar comercio o dirección..."
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50/75 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 text-left">Comercio</th>
                  <th className="px-6 py-4 text-left">Fecha Registro</th>
                  <th className="px-6 py-4 text-left">Estado</th>
                  <th className="px-6 py-4 text-right">Acciones de Fiscalización</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {comerciosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                      No se encontraron comercios con los criterios seleccionados.
                    </td>
                  </tr>
                ) : (
                  comerciosFiltrados.map((comercio) => {
                    const esAprobado = comercio.estado === 'aprobado';
                    const esPendiente = comercio.estado === 'pendiente';
                    const esRechazado = comercio.estado === 'rechazado';
                    const esSuspendido = comercio.estado === 'suspendido';

                    return (
                      <tr key={comercio._id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 font-black flex items-center justify-center text-sm flex-shrink-0">
                              {comercio.nombre.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 text-sm">{comercio.nombre}</div>
                              <div className="text-[11px] text-slate-400">{comercio.direccion || 'Sin dirección registrada'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                          <div className="flex items-center space-x-1.5 text-slate-600 font-medium">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{new Date(comercio.createdAt).toLocaleDateString()}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 inline-flex items-center space-x-1.5 text-[10px] font-extrabold rounded-full uppercase tracking-wider ${
                              esAprobado
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : esPendiente
                                ? 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
                                : esSuspendido
                                ? 'bg-orange-50 text-orange-700 border border-orange-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              esAprobado ? 'bg-emerald-500' : esPendiente ? 'bg-amber-500' : esSuspendido ? 'bg-orange-500' : 'bg-rose-500'
                            }`} />
                            <span>{comercio.estado}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                          {!esAprobado && (
                            <button
                              onClick={() => cambiarEstado(comercio._id, 'aprobado')}
                              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-emerald-600/20 transition-all inline-flex items-center space-x-1.5"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Aprobar</span>
                            </button>
                          )}
                          {!esRechazado && (
                            <button
                              onClick={() => cambiarEstado(comercio._id, 'rechazado')}
                              className="px-3.5 py-1.5 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition-all inline-flex items-center space-x-1.5"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Rechazar</span>
                            </button>
                          )}
                          {esAprobado && (
                            <button
                              onClick={() => cambiarEstado(comercio._id, 'suspendido')}
                              className="px-3.5 py-1.5 bg-white hover:bg-amber-50 text-amber-700 border border-amber-200 rounded-xl text-xs font-semibold transition-all inline-flex items-center space-x-1.5"
                            >
                              <PauseCircle className="w-3.5 h-3.5" />
                              <span>Suspender</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Reseñas Reportadas */}
      {tabActiva === 'resenas' && (
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/80 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-rose-50/20">
            <div>
              <h3 className="font-bold text-base text-slate-900 tracking-tight">Bandeja de Moderación de Comentarios</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Reseñas marcadas por los vecinos por contener vocabulario inapropiado o acusaciones no verificadas.
              </p>
            </div>
            <span className="bg-rose-100 text-rose-800 border border-rose-200 font-bold px-3 py-1 rounded-full text-xs">
              {resenasReportadas.length} reportes
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {resenasReportadas.length === 0 ? (
              <div className="p-16 text-center text-slate-400">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-7 h-7 stroke-[1.5]" />
                </div>
                <p className="font-bold text-slate-800 text-sm">No hay reseñas reportadas pendientes</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  La comunidad se mantiene en armonía y con respeto mutuo entre comerciantes y vecinos.
                </p>
              </div>
            ) : (
              resenasReportadas.map((r) => (
                <div key={r._id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 hover:bg-slate-50/50 transition-colors">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="font-bold text-[11px] bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-0.5 rounded-lg">
                        {r.comercioId?.nombre || 'Comercio'}
                      </span>
                      <span className="text-xs text-slate-400">
                        Publicado por: <strong className="text-slate-700">{r.usuarioId?.nombre || 'Vecino'}</strong> ({r.usuarioId?.email})
                      </span>
                      <div className="flex items-center space-x-0.5 text-amber-500 text-xs">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star 
                            key={s} 
                            className={`w-3.5 h-3.5 ${s <= r.puntaje ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} 
                          />
                        ))}
                      </div>
                    </div>
                    
                    <div className="text-xs text-slate-800 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 italic">
                      "{r.comentario}"
                    </div>

                    <span className="text-[10px] text-slate-400 mt-2 block font-medium">
                      Fecha de reporte: {new Date(r.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2.5 flex-shrink-0">
                    <button
                      onClick={() => moderarResena(r._id, 'descartar')}
                      className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold rounded-xl text-xs transition-colors flex items-center space-x-1.5 shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Descartar Reporte</span>
                    </button>
                    <button
                      onClick={() => moderarResena(r._id, 'eliminar')}
                      className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-md shadow-rose-600/20 transition-all flex items-center space-x-1.5"
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
