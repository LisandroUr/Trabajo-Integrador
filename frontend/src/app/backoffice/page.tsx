'use client';

import { useEffect, useState, useMemo } from 'react';
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
  Calendar,
  Star,
  RefreshCw,
  PauseCircle,
  Flag,
  PieChart as PieChartIcon
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { toast } from 'sonner';

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

const COLORS = ['#10b981', '#f59e0b', '#f43f5e', '#6366f1'];

export default function BackofficePage() {
  const [tabActiva, setTabActiva] = useState<'comercios' | 'resenas'>('comercios');
  const [comercios, setComercios] = useState<Comercio[]>([]);
  const [resenasReportadas, setResenasReportadas] = useState<ResenaReportada[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterQuery, setFilterQuery] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<'todos' | 'pendiente' | 'aprobado' | 'rechazado' | 'suspendido'>('todos');

  const loadData = async () => {
    setLoading(true);
    try {
      const [comRes, resenasRes] = await Promise.all([
        fetchAPI('/comercios/admin/all?limit=100'),
        fetchAPI('/resenas/admin/reportadas')
      ]);
      setComercios(comRes.data || []);
      setResenasReportadas(resenasRes || []);
    } catch (err: any) {
      toast.error('Error cargando datos de fiscalización: ' + err.message);
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
      toast.success(`Estado del comercio actualizado a "${nuevoEstado}"`);
      loadData();
    } catch (err: any) {
      toast.error('Error cambiando estado: ' + err.message);
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
      toast.success(`Reseña ${accion === 'eliminar' ? 'eliminada' : 'reporte descartado'}`);
      loadData();
    } catch (err: any) {
      toast.error('Error al moderar reseña: ' + err.message);
    }
  };

  // KPIs
  const totalComercios = comercios.length;
  const pendientes = comercios.filter((c) => c.estado === 'pendiente').length;
  const aprobados = comercios.filter((c) => c.estado === 'aprobado').length;
  const rechazados = comercios.filter((c) => c.estado === 'rechazado').length;

  const pieData = useMemo(() => {
    return [
      { name: 'Aprobados', value: aprobados },
      { name: 'Pendientes', value: pendientes },
      { name: 'Rechazados', value: rechazados },
    ].filter((d) => d.value > 0);
  }, [aprobados, pendientes, rechazados]);

  const comerciosFiltrados = comercios.filter((c) => {
    const matchQuery = c.nombre.toLowerCase().includes(filterQuery.toLowerCase()) || 
                       (c.direccion || '').toLowerCase().includes(filterQuery.toLowerCase());
    const matchEstado = estadoFilter === 'todos' ? true : c.estado === estadoFilter;
    return matchQuery && matchEstado;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* GovTech Institutional Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-purple-950/60 to-slate-900 border border-white/10 p-8 sm:p-12 mb-10 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider mb-4">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              <span>Dirección de Comercio e Industria • Municipalidad de Bahía Blanca</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Control & Fiscalización Cívica
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
              Panel institucional de admisión de vidrieras digitales, verificación normativa y moderación de comentarios de la ciudadanía.
            </p>
          </div>

          <button
            onClick={loadData}
            disabled={loading}
            className="px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-bold transition-all flex items-center space-x-2 self-start md:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-purple-400' : ''}`} />
            <span>Actualizar Datos</span>
          </button>
        </div>
      </div>

      {/* KPI Cards & Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 mb-10">
        <div className="p-6 rounded-3xl bg-slate-900/70 border border-white/10 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Solicitudes</span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold">
              <Store className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-white mt-3 tabular-nums">{totalComercios}</p>
          <p className="text-xs text-slate-400 mt-1">Registrados en el sistema</p>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/70 border border-amber-500/30 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Pendientes</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-amber-400 mt-3 tabular-nums">{pendientes}</p>
          <p className="text-xs text-slate-400 mt-1">Requieren resolución de admisión</p>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/70 border border-rose-500/30 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400">Reseñas Reportadas</span>
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center font-bold">
              <Flag className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-rose-400 mt-3 tabular-nums">{resenasReportadas.length}</p>
          <p className="text-xs text-slate-400 mt-1">En cola de fiscalización</p>
        </div>

        {/* Mini Pie Chart */}
        <div className="p-4 rounded-3xl bg-slate-900/70 border border-white/10 shadow-xl backdrop-blur-xl flex items-center justify-center">
          <div className="h-28 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={25}
                  outerRadius={45}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    fontSize: '11px',
                    color: '#fff'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-3 border-b border-white/10 mb-8 pb-px">
        <button
          onClick={() => setTabActiva('comercios')}
          className={`pb-4 px-4 font-bold text-xs uppercase tracking-wider flex items-center space-x-2 border-b-2 transition-all ${
            tabActiva === 'comercios'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Vidrieras Comerciales ({comercios.length})</span>
        </button>

        <button
          onClick={() => setTabActiva('resenas')}
          className={`pb-4 px-4 font-bold text-xs uppercase tracking-wider flex items-center space-x-2 border-b-2 transition-all ${
            tabActiva === 'resenas'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Moderación de Reseñas ({resenasReportadas.length})</span>
        </button>
      </div>

      {/* Tab: Comercios */}
      {tabActiva === 'comercios' && (
        <div className="bg-slate-900/80 rounded-3xl shadow-2xl border border-white/10 overflow-hidden backdrop-blur-xl">
          {/* Table Header Filter Bar */}
          <div className="p-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950/40">
            <div>
              <h3 className="font-bold text-base text-white">Registro General de Vidrieras</h3>
              <p className="text-xs text-slate-400 mt-0.5">Control de admisión, vigencia y cumplimiento normativo</p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Status Filter */}
              <div className="flex items-center bg-slate-950 rounded-xl p-1 border border-white/10 text-xs">
                {(['todos', 'pendiente', 'aprobado', 'rechazado', 'suspendido'] as const).map((est) => (
                  <button
                    key={est}
                    onClick={() => setEstadoFilter(est)}
                    className={`px-2.5 py-1 rounded-lg font-semibold capitalize transition-all ${
                      estadoFilter === est 
                        ? 'bg-purple-600 text-white shadow-xs' 
                        : 'text-slate-400 hover:text-white'
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
                  placeholder="Buscar comercio..."
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/5">
              <thead className="bg-slate-950/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 text-left">Comercio</th>
                  <th className="px-6 py-4 text-left">Fecha Registro</th>
                  <th className="px-6 py-4 text-left">Estado</th>
                  <th className="px-6 py-4 text-right">Acciones de Auditoría</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
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
                      <tr key={comercio._id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-300 font-black flex items-center justify-center text-sm flex-shrink-0">
                              {comercio.nombre.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-white text-sm">{comercio.nombre}</div>
                              <div className="text-[11px] text-slate-400">{comercio.direccion || 'Sin dirección registrada'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-400 whitespace-nowrap">
                          <div className="flex items-center space-x-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                            <span>{new Date(comercio.createdAt).toLocaleDateString()}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 inline-flex items-center space-x-1.5 text-[10px] font-extrabold rounded-full uppercase tracking-wider ${
                              esAprobado
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : esPendiente
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse'
                                : esSuspendido
                                ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              esAprobado ? 'bg-emerald-400' : esPendiente ? 'bg-amber-400' : esSuspendido ? 'bg-orange-400' : 'bg-rose-400'
                            }`} />
                            <span>{comercio.estado}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                          {!esAprobado && (
                            <button
                              onClick={() => cambiarEstado(comercio._id, 'aprobado')}
                              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/30 transition-all inline-flex items-center space-x-1.5"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Aprobar</span>
                            </button>
                          )}
                          {!esRechazado && (
                            <button
                              onClick={() => cambiarEstado(comercio._id, 'rechazado')}
                              className="px-3.5 py-1.5 bg-white/5 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-semibold transition-all inline-flex items-center space-x-1.5"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Rechazar</span>
                            </button>
                          )}
                          {esAprobado && (
                            <button
                              onClick={() => cambiarEstado(comercio._id, 'suspendido')}
                              className="px-3.5 py-1.5 bg-white/5 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-semibold transition-all inline-flex items-center space-x-1.5"
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
        <div className="bg-slate-900/80 rounded-3xl shadow-2xl border border-white/10 overflow-hidden backdrop-blur-xl">
          <div className="p-6 border-b border-white/5 flex items-center justify-between bg-rose-500/10">
            <div>
              <h3 className="font-bold text-base text-white">Bandeja de Moderación de Comentarios</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Reseñas reportadas por la comunidad por vocabulario impropio o contenido calumnioso.
              </p>
            </div>
            <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold px-3 py-1 rounded-full text-xs">
              {resenasReportadas.length} reportes
            </span>
          </div>

          <div className="divide-y divide-white/5">
            {resenasReportadas.length === 0 ? (
              <div className="p-16 text-center text-slate-400">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-7 h-7 stroke-[1.5]" />
                </div>
                <p className="font-bold text-white text-sm">No hay reseñas reportadas pendientes</p>
                <p className="text-xs text-slate-400 mt-1">
                  La comunidad se mantiene en armonía y respeto mutuo.
                </p>
              </div>
            ) : (
              resenasReportadas.map((r) => (
                <div key={r._id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 hover:bg-white/5 transition-colors">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="font-bold text-[11px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2.5 py-0.5 rounded-lg">
                        {r.comercioId?.nombre || 'Comercio'}
                      </span>
                      <span className="text-xs text-slate-400">
                        Publicado por: <strong className="text-white">{r.usuarioId?.nombre || 'Vecino'}</strong> ({r.usuarioId?.email})
                      </span>
                      <div className="flex items-center space-x-0.5 text-amber-400 text-xs">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star 
                            key={s} 
                            className={`w-3.5 h-3.5 ${s <= r.puntaje ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`} 
                          />
                        ))}
                      </div>
                    </div>
                    
                    <div className="text-xs text-slate-200 bg-slate-950 p-3.5 rounded-2xl border border-white/10 italic">
                      "{r.comentario}"
                    </div>

                    <span className="text-[10px] text-slate-500 mt-2 block font-medium">
                      Fecha de reporte: {new Date(r.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2.5 flex-shrink-0">
                    <button
                      onClick={() => moderarResena(r._id, 'descartar')}
                      className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 font-bold rounded-xl text-xs transition-colors flex items-center space-x-1.5"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Descartar Reporte</span>
                    </button>
                    <button
                      onClick={() => moderarResena(r._id, 'eliminar')}
                      className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs shadow-md shadow-rose-600/30 transition-all flex items-center space-x-1.5"
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
