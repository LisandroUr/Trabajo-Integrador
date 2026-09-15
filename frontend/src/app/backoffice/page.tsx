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
  Search,
  Calendar,
  Star,
  RefreshCw,
  PauseCircle,
  Flag
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
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

// Muted Municipal Palette (Sage, Ochre, Wine, Denim)
const COLORS = ['#4a7c59', '#b8860b', '#8b3a4a', '#4b6cb7'];

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
        body: JSON.stringify({ estado: nuevoEstado, motivo: motivo || `Actualizado por fiscalización a ${nuevoEstado}` })
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
      <div className="rounded-2xl bg-[#171b22] border border-[#262d3a] p-8 sm:p-10 mb-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full badge-steel text-xs font-semibold tracking-wider mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Dirección de Comercio e Industria • Municipalidad de Bahía Blanca</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#d5d9e0] tracking-tight">
              Control & Fiscalización Cívica
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-[#8d94a1] leading-relaxed max-w-2xl">
              Panel institucional de admisión de vidrieras digitales, verificación normativa y moderación de comentarios de la ciudadanía.
            </p>
          </div>

          <button
            onClick={loadData}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-[#1d222b] hover:bg-[#232934] text-[#d5d9e0] border border-[#262d3a] text-xs font-semibold transition-colors flex items-center space-x-2 self-start md:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#7dafb5]' : ''}`} />
            <span>Actualizar Datos</span>
          </button>
        </div>
      </div>

      {/* KPI Cards & Chart */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="p-5 rounded-2xl bg-[#171b22] border border-[#262d3a] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8d94a1]">Total Solicitudes</span>
            <div className="w-9 h-9 rounded-xl bg-[#1d222b] border border-[#262d3a] text-[#7dafb5] flex items-center justify-center font-bold">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-[#d5d9e0] mt-3 tabular-nums">{totalComercios}</p>
          <p className="text-xs text-[#8d94a1] mt-1">Registrados en el sistema</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#171b22] border border-[#262d3a] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#d1ab77]">Pendientes</span>
            <div className="w-9 h-9 rounded-xl badge-ochre flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-[#d1ab77] mt-3 tabular-nums">{pendientes}</p>
          <p className="text-xs text-[#8d94a1] mt-1">Requieren resolución de admisión</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#171b22] border border-[#262d3a] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#d48a97]">Reseñas Reportadas</span>
            <div className="w-9 h-9 rounded-xl badge-wine flex items-center justify-center font-bold">
              <Flag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-[#d48a97] mt-3 tabular-nums">{resenasReportadas.length}</p>
          <p className="text-xs text-[#8d94a1] mt-1">En cola de fiscalización</p>
        </div>

        {/* Mini Pie Chart */}
        <div className="p-3 rounded-2xl bg-[#171b22] border border-[#262d3a] shadow-xs flex items-center justify-center">
          <div className="h-24 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={22}
                  outerRadius={38}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#171b22',
                    border: '1px solid #262d3a',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#d5d9e0'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-3 border-b border-[#262d3a] mb-6 pb-px">
        <button
          onClick={() => setTabActiva('comercios')}
          className={`pb-3 px-3 font-semibold text-xs uppercase tracking-wider flex items-center space-x-2 border-b-2 transition-colors ${
            tabActiva === 'comercios'
              ? 'border-[#4b6cb7] text-[#9cb1ce]'
              : 'border-transparent text-[#8d94a1] hover:text-[#d5d9e0]'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Vidrieras Comerciales ({comercios.length})</span>
        </button>

        <button
          onClick={() => setTabActiva('resenas')}
          className={`pb-3 px-3 font-semibold text-xs uppercase tracking-wider flex items-center space-x-2 border-b-2 transition-colors ${
            tabActiva === 'resenas'
              ? 'border-[#4b6cb7] text-[#9cb1ce]'
              : 'border-transparent text-[#8d94a1] hover:text-[#d5d9e0]'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Moderación de Reseñas ({resenasReportadas.length})</span>
        </button>
      </div>

      {/* Tab: Comercios */}
      {tabActiva === 'comercios' && (
        <div className="bg-[#171b22] rounded-2xl shadow-xs border border-[#262d3a] overflow-hidden">
          {/* Table Header Filter Bar */}
          <div className="p-4 sm:p-5 border-b border-[#262d3a] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#14181f]">
            <div>
              <h3 className="font-bold text-sm text-[#d5d9e0]">Registro General de Vidrieras</h3>
              <p className="text-xs text-[#8d94a1] mt-0.5">Control de admisión, vigencia y cumplimiento normativo</p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Status Filter */}
              <div className="flex items-center bg-[#12151b] rounded-xl p-1 border border-[#262d3a] text-xs">
                {(['todos', 'pendiente', 'aprobado', 'rechazado', 'suspendido'] as const).map((est) => (
                  <button
                    key={est}
                    onClick={() => setEstadoFilter(est)}
                    className={`px-2.5 py-1 rounded-lg font-semibold capitalize transition-colors ${
                      estadoFilter === est 
                        ? 'bg-[#4b6cb7] text-[#d5d9e0]' 
                        : 'text-[#8d94a1] hover:text-[#d5d9e0]'
                    }`}
                  >
                    {est}
                  </button>
                ))}
              </div>

              {/* Search input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8d94a1]" />
                <input
                  type="text"
                  placeholder="Buscar comercio..."
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-[#12151b] border border-[#262d3a] rounded-xl text-xs text-[#d5d9e0] placeholder:text-[#8d94a1]/50 focus:outline-none focus:border-[#4b6cb7] transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#262d3a]">
              <thead className="bg-[#12151b] text-[11px] font-bold text-[#8d94a1] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 text-left">Comercio</th>
                  <th className="px-6 py-4 text-left">Fecha Registro</th>
                  <th className="px-6 py-4 text-left">Estado</th>
                  <th className="px-6 py-4 text-right">Acciones de Auditoría</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262d3a] text-xs">
                {comerciosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-[#8d94a1]">
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
                      <tr key={comercio._id} className="hover:bg-[#1d222b] transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-9 h-9 rounded-xl bg-[#1d222b] border border-[#262d3a] text-[#7dafb5] font-bold flex items-center justify-center text-xs flex-shrink-0">
                              {(comercio?.nombre || 'C').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-[#d5d9e0] text-sm">{comercio.nombre}</div>
                              <div className="text-[11px] text-[#8d94a1]">{comercio.direccion || 'Sin dirección registrada'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[#8d94a1] whitespace-nowrap">
                          <div className="flex items-center space-x-1.5">
                            <Calendar className="w-3.5 h-3.5 text-[#8d94a1]" />
                            <span>{new Date(comercio.createdAt).toLocaleDateString()}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-0.5 inline-flex items-center space-x-1.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                              esAprobado
                                ? 'badge-sage'
                                : esPendiente
                                ? 'badge-ochre'
                                : esSuspendido
                                ? 'badge-ochre'
                                : 'badge-wine'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              esAprobado ? 'bg-[#4a7c59]' : esPendiente ? 'bg-[#b8860b]' : esSuspendido ? 'bg-[#b8860b]' : 'bg-[#8b3a4a]'
                            }`} />
                            <span>{comercio.estado}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                          {!esAprobado && (
                            <button
                              onClick={() => cambiarEstado(comercio._id, 'aprobado')}
                              className="px-3 py-1.5 bg-[#4a7c59] hover:bg-[#3d664a] text-[#d5d9e0] rounded-lg text-xs font-semibold transition-colors inline-flex items-center space-x-1"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Aprobar</span>
                            </button>
                          )}
                          {!esRechazado && (
                            <button
                              onClick={() => cambiarEstado(comercio._id, 'rechazado')}
                              className="px-3 py-1.5 bg-[#1d222b] hover:bg-[#8b3a4a]/20 text-[#d48a97] border border-[#8b3a4a]/30 rounded-lg text-xs font-semibold transition-colors inline-flex items-center space-x-1"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Rechazar</span>
                            </button>
                          )}
                          {esAprobado && (
                            <button
                              onClick={() => cambiarEstado(comercio._id, 'suspendido')}
                              className="px-3 py-1.5 bg-[#1d222b] hover:bg-[#b8860b]/20 text-[#d1ab77] border border-[#b8860b]/30 rounded-lg text-xs font-semibold transition-colors inline-flex items-center space-x-1"
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
        <div className="bg-[#171b22] rounded-2xl shadow-xs border border-[#262d3a] overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-[#262d3a] flex items-center justify-between bg-[#14181f]">
            <div>
              <h3 className="font-bold text-sm text-[#d5d9e0]">Bandeja de Moderación de Comentarios</h3>
              <p className="text-xs text-[#8d94a1] mt-0.5">
                Reseñas reportadas por la comunidad por vocabulario impropio o contenido calumnioso.
              </p>
            </div>
            <span className="badge-wine font-bold px-2.5 py-0.5 rounded-full text-xs">
              {resenasReportadas.length} reportes
            </span>
          </div>

          <div className="divide-y divide-[#262d3a]">
            {resenasReportadas.length === 0 ? (
              <div className="p-12 text-center text-[#8d94a1]">
                <div className="w-10 h-10 rounded-xl badge-sage flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-5 h-5 stroke-[1.5]" />
                </div>
                <p className="font-bold text-[#d5d9e0] text-sm">No hay reseñas reportadas pendientes</p>
                <p className="text-xs text-[#8d94a1] mt-1">
                  La comunidad se mantiene en armonía y respeto mutuo.
                </p>
              </div>
            ) : (
              resenasReportadas.map((r) => (
                <div key={r._id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#1d222b] transition-colors">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="font-bold text-[11px] badge-steel px-2 py-0.5 rounded-md">
                        {r.comercioId?.nombre || 'Comercio'}
                      </span>
                      <span className="text-xs text-[#8d94a1]">
                        Publicado por: <strong className="text-[#d5d9e0]">{r.usuarioId?.nombre || 'Vecino'}</strong> ({r.usuarioId?.email})
                      </span>
                      <div className="flex items-center space-x-0.5 text-[#b8860b] text-xs">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star 
                            key={s} 
                            className={`w-3.5 h-3.5 ${s <= r.puntaje ? 'fill-[#b8860b] text-[#b8860b]' : 'text-[#262d3a]'}`} 
                          />
                        ))}
                      </div>
                    </div>
                    
                    <div className="text-xs text-[#d5d9e0] bg-[#12151b] p-3 rounded-xl border border-[#262d3a] italic">
                      "{r.comentario}"
                    </div>

                    <span className="text-[10px] text-[#8d94a1] mt-2 block font-medium">
                      Fecha de reporte: {new Date(r.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <button
                      onClick={() => moderarResena(r._id, 'descartar')}
                      className="px-3 py-2 bg-[#1d222b] hover:bg-[#262d3a] text-[#8d94a1] hover:text-[#d5d9e0] border border-[#262d3a] font-semibold rounded-xl text-xs transition-colors flex items-center space-x-1.5"
                    >
                      <Check className="w-3.5 h-3.5 text-[#8bb59b]" />
                      <span>Descartar Reporte</span>
                    </button>
                    <button
                      onClick={() => moderarResena(r._id, 'eliminar')}
                      className="px-3 py-2 bg-[#8b3a4a] hover:bg-[#722f3c] text-[#d5d9e0] font-semibold rounded-xl text-xs transition-colors flex items-center space-x-1.5"
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
