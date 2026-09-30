'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
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
  Flag,
  X,
  Building,
  UserCheck
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
  tipo?: string;
  createdAt: string;
  direccion?: string;
  categoria?: any;
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

const PIE_COLORS = ['#059669', '#d97706', '#dc2626', '#4f46e5'];

export default function BackofficePage() {
  const router = useRouter();
  const [tabActiva, setTabActiva] = useState<'comercios' | 'resenas'>('comercios');

  useEffect(() => {
    const userStored = localStorage.getItem('user');
    if (!userStored) {
      router.replace('/login');
      return;
    }
    try {
      const user = JSON.parse(userStored);
      if (!user.roles?.includes('superadmin') && !user.roles?.includes('admin') && !user.roles?.includes('moderador')) {
        toast.error('Acceso denegado: Se requieren privilegios de administración');
        router.replace('/');
      }
    } catch {
      router.replace('/login');
    }
  }, [router]);
  const [comercios, setComercios] = useState<Comercio[]>([]);
  const [resenasReportadas, setResenasReportadas] = useState<ResenaReportada[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterQuery, setFilterQuery] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<'todos' | 'pendiente' | 'aprobado' | 'rechazado' | 'suspendido'>('todos');
  const [authError, setAuthError] = useState(false);

  // Modern In-App Modal State (replaces native window.prompt)
  const [modalEstado, setModalEstado] = useState<{
    isOpen: boolean;
    comercioId: string;
    nombreComercio: string;
    nuevoEstado: string;
    motivo: string;
  }>({
    isOpen: false,
    comercioId: '',
    nombreComercio: '',
    nuevoEstado: '',
    motivo: ''
  });

  // Modal Moderación Reseña (replaces native window.confirm)
  const [modalResena, setModalResena] = useState<{
    isOpen: boolean;
    resenaId: string;
    accion: 'eliminar' | 'descartar';
  }>({
    isOpen: false,
    resenaId: '',
    accion: 'descartar'
  });

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
      console.warn('Error cargando datos de backoffice:', err.message);
      toast.error('Error cargando datos de fiscalización: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Open the custom modern in-app modal instead of browser prompt
  const abrirModalCambioEstado = (comercio: Comercio, nuevoEstado: string) => {
    const defaultMotivo = nuevoEstado === 'aprobado'
      ? 'Habilitación técnica e inspección municipal aprobada'
      : nuevoEstado === 'suspendido'
      ? 'Suspensión preventiva por revisión de normativa'
      : 'Rechazado por inconsistencia en la documentación';

    setModalEstado({
      isOpen: true,
      comercioId: comercio._id,
      nombreComercio: comercio.nombre,
      nuevoEstado,
      motivo: defaultMotivo
    });
  };

  // Submit the status change
  const confirmarCambioEstado = async () => {
    if (!modalEstado.comercioId || !modalEstado.nuevoEstado) return;

    try {
      await fetchAPI(`/comercios/${modalEstado.comercioId}/estado`, {
        method: 'PATCH',
        body: JSON.stringify({ 
          estado: modalEstado.nuevoEstado, 
          motivo: modalEstado.motivo || `Actualización administrativa a ${modalEstado.nuevoEstado}` 
        })
      });
      toast.success(`Estado de "${modalEstado.nombreComercio}" actualizado a "${modalEstado.nuevoEstado}"`);
      setModalEstado(prev => ({ ...prev, isOpen: false }));
      loadData();
    } catch (err: any) {
      toast.error('Error cambiando estado: ' + err.message);
    }
  };

  // Confirm review moderation
  const confirmarModerarResena = async () => {
    if (!modalResena.resenaId) return;

    try {
      await fetchAPI(`/resenas/admin/moderar/${modalResena.resenaId}`, {
        method: 'PATCH',
        body: JSON.stringify({ accion: modalResena.accion })
      });
      toast.success(`Reseña ${modalResena.accion === 'eliminar' ? 'eliminada correctamente' : 'reporte descartado'}`);
      setModalResena(prev => ({ ...prev, isOpen: false }));
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
  const suspendidos = comercios.filter((c) => c.estado === 'suspendido').length;

  const pieData = useMemo(() => {
    return [
      { name: 'Aprobados', value: aprobados },
      { name: 'Pendientes', value: pendientes },
      { name: 'Suspendidos', value: suspendidos },
      { name: 'Rechazados', value: rechazados },
    ].filter((d) => d.value > 0);
  }, [aprobados, pendientes, suspendidos, rechazados]);

  const comerciosFiltrados = comercios.filter((c) => {
    const matchQuery = c.nombre.toLowerCase().includes(filterQuery.toLowerCase()) || 
                       (c.direccion || '').toLowerCase().includes(filterQuery.toLowerCase());
    const matchEstado = estadoFilter === 'todos' ? true : c.estado === estadoFilter;
    return matchQuery && matchEstado;
  });

  return (
    <div className="min-h-screen bg-[#f0f6fa] py-8 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ========================================================================= */}
        {/* 1. HERO INSTITUCIONAL - ALTO CONTRASTE Y COLORES NÍTIDOS                  */}
        {/* ========================================================================= */}
        <div className="rounded-2xl bg-white border border-gray-200 p-6 sm:p-8 mb-8 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold tracking-wide mb-3">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Dirección de Comercio e Industria • Municipio</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Control & Fiscalización Cívica
              </h1>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl font-medium">
                Panel institucional para la verificación de vidrieras digitales, fiscalización normativa de locales y moderación cívica.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 self-start md:self-auto">
              <button
                onClick={loadData}
                disabled={loading}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-gray-50 text-slate-700 border border-gray-300 text-xs font-bold transition-colors flex items-center justify-center space-x-2 shadow-xs cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 text-[#38bdf8] ${loading ? 'animate-spin' : ''}`} />
                <span>Actualizar Datos</span>
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. KPI CARDS & DONUT CHART CON MÁXIMO CONTRASTE                           */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {/* Total Solicitudes */}
          <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                Total Solicitudes
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
                <Store className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-black text-slate-900 mt-2.5 tabular-nums">
              {totalComercios}
            </p>
            <p className="text-xs text-slate-500 font-medium mt-1">Registrados en la plataforma</p>
          </div>

          {/* Pendientes */}
          <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-700">
                Pendientes
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-black text-amber-600 mt-2.5 tabular-nums">
              {pendientes}
            </p>
            <p className="text-xs text-slate-500 font-medium mt-1">Requieren resolución de admisión</p>
          </div>

          {/* Reseñas Reportadas */}
          <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-rose-700">
                Reseñas Reportadas
              </span>
              <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
                <Flag className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-black text-rose-600 mt-2.5 tabular-nums">
              {resenasReportadas.length}
            </p>
            <p className="text-xs text-slate-500 font-medium mt-1">En cola de moderación cívica</p>
          </div>

          {/* Donut Chart */}
          <div className="p-3 rounded-2xl bg-white border border-gray-200 shadow-xs flex items-center justify-center">
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
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '11px',
                      color: '#0f172a',
                      fontWeight: 'bold',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. TABS DE NAVEGACIÓN                                                    */}
        {/* ========================================================================= */}
        <div className="flex items-center space-x-4 border-b border-gray-200 mb-6 pb-px">
          <button
            onClick={() => setTabActiva('comercios')}
            className={`pb-3 px-3 font-bold text-xs uppercase tracking-wider flex items-center space-x-2 border-b-2 transition-colors cursor-pointer ${
              tabActiva === 'comercios'
                ? 'border-[#0284c7] text-[#0284c7]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Vidrieras Comerciales ({comercios.length})</span>
          </button>

          <button
            onClick={() => setTabActiva('resenas')}
            className={`pb-3 px-3 font-bold text-xs uppercase tracking-wider flex items-center space-x-2 border-b-2 transition-colors cursor-pointer ${
              tabActiva === 'resenas'
                ? 'border-[#0284c7] text-[#0284c7]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Moderación de Reseñas ({resenasReportadas.length})</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* 4. TAB 1: COMERCIOS - TABLA CON MÁXIMO CONTRASTE Y CLARIDAD               */}
        {/* ========================================================================= */}
        {tabActiva === 'comercios' && (
          <div className="bg-white rounded-2xl shadow-xs border border-gray-200 overflow-hidden">
            {/* Filter Bar */}
            <div className="p-4 sm:p-5 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/70">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">Registro General de Vidrieras</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Control de admisión, vigencia y cumplimiento normativo</p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* Status Filter Buttons */}
                <div className="flex items-center bg-white rounded-xl p-1 border border-gray-300 text-xs shadow-xs">
                  {(['todos', 'pendiente', 'aprobado', 'rechazado', 'suspendido'] as const).map((est) => (
                    <button
                      key={est}
                      onClick={() => setEstadoFilter(est)}
                      className={`px-3 py-1.5 rounded-lg font-bold capitalize transition-colors cursor-pointer ${
                        estadoFilter === est 
                          ? 'bg-[#38bdf8] text-white shadow-xs' 
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {est}
                    </button>
                  ))}
                </div>

                {/* Search input */}
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar comercio..."
                    value={filterQuery}
                    onChange={(e) => setFilterQuery(e.target.value)}
                    className="pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#38bdf8] transition-colors shadow-xs"
                  />
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-slate-100 text-xs font-black text-slate-700 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 text-left">Comercio / Servicio</th>
                    <th className="px-6 py-4 text-left">Fecha Registro</th>
                    <th className="px-6 py-4 text-left">Estado Actual</th>
                    <th className="px-6 py-4 text-right">Acciones de Auditoría</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-xs bg-white">
                  {comerciosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-500 font-medium">
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
                        <tr key={comercio._id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-[#0284c7] font-black flex items-center justify-center text-sm flex-shrink-0">
                                {(comercio?.nombre || 'C').charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-extrabold text-slate-900 text-sm">
                                  {comercio.nombre}
                                </div>
                                <div className="text-xs text-slate-500 font-medium mt-0.5">
                                  {comercio.direccion || 'Sin dirección registrada'} • <span className="font-bold text-[#0284c7]">{comercio.tipo === 'servicio' ? 'Servicio' : 'Local'}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4 text-slate-600 whitespace-nowrap font-medium">
                            <div className="flex items-center space-x-1.5">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              <span>{new Date(comercio.createdAt).toLocaleDateString('es-AR')}</span>
                            </div>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            {esAprobado && (
                              <span className="px-3 py-1 inline-flex items-center space-x-1.5 text-xs font-extrabold rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 uppercase tracking-wide">
                                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                                <span>Aprobado</span>
                              </span>
                            )}
                            {esPendiente && (
                              <span className="px-3 py-1 inline-flex items-center space-x-1.5 text-xs font-extrabold rounded-full bg-amber-100 text-amber-950 border border-amber-300 uppercase tracking-wide">
                                <span className="w-2 h-2 rounded-full bg-amber-600" />
                                <span>Pendiente</span>
                              </span>
                            )}
                            {esSuspendido && (
                              <span className="px-3 py-1 inline-flex items-center space-x-1.5 text-xs font-extrabold rounded-full bg-orange-100 text-orange-950 border border-orange-300 uppercase tracking-wide">
                                <span className="w-2 h-2 rounded-full bg-orange-600" />
                                <span>Suspendido</span>
                              </span>
                            )}
                            {esRechazado && (
                              <span className="px-3 py-1 inline-flex items-center space-x-1.5 text-xs font-extrabold rounded-full bg-rose-100 text-rose-950 border border-rose-300 uppercase tracking-wide">
                                <span className="w-2 h-2 rounded-full bg-rose-600" />
                                <span>Rechazado</span>
                              </span>
                            )}
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                            {!esAprobado && (
                              <button
                                onClick={() => abrirModalCambioEstado(comercio, 'aprobado')}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs inline-flex items-center space-x-1 cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Aprobar</span>
                              </button>
                            )}

                            {!esRechazado && (
                              <button
                                onClick={() => abrirModalCambioEstado(comercio, 'rechazado')}
                                className="px-3 py-1.5 bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 rounded-xl text-xs font-bold transition-all inline-flex items-center space-x-1 cursor-pointer"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Rechazar</span>
                              </button>
                            )}

                            {esAprobado && (
                              <button
                                onClick={() => abrirModalCambioEstado(comercio, 'suspendido')}
                                className="px-3 py-1.5 bg-white hover:bg-amber-50 text-amber-800 border border-amber-300 rounded-xl text-xs font-bold transition-all inline-flex items-center space-x-1 cursor-pointer"
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

        {/* ========================================================================= */}
        {/* 5. TAB 2: RESEÑAS REPORTADAS                                              */}
        {/* ========================================================================= */}
        {tabActiva === 'resenas' && (
          <div className="bg-white rounded-2xl shadow-xs border border-gray-200 overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-gray-200 flex items-center justify-between bg-slate-50/70">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">Bandeja de Moderación de Comentarios</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Reseñas reportadas por la ciudadanía para fiscalización cívica.
                </p>
              </div>
              <span className="bg-rose-100 text-rose-800 border border-rose-200 font-bold px-3 py-0.5 rounded-full text-xs">
                {resenasReportadas.length} reportes
              </span>
            </div>

            <div className="divide-y divide-gray-200 bg-white">
              {resenasReportadas.length === 0 ? (
                <div className="p-12 text-center text-slate-500">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="w-6 h-6 stroke-[1.5]" />
                  </div>
                  <p className="font-extrabold text-slate-900 text-base">No hay reseñas reportadas pendientes</p>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    La comunidad de vecinos se mantiene en armonía y respeto mutuo.
                  </p>
                </div>
              ) : (
                resenasReportadas.map((r) => (
                  <div key={r._id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="font-bold text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-md">
                          {r.comercioId?.nombre || 'Comercio'}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          Publicado por: <strong className="text-slate-900">{r.usuarioId?.nombre || 'Vecino'}</strong> ({r.usuarioId?.email})
                        </span>
                        <div className="flex items-center space-x-0.5 text-amber-500 text-xs">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star 
                              key={s} 
                              className={`w-3.5 h-3.5 ${s <= r.puntaje ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                      </div>
                      
                      <div className="text-xs text-slate-800 bg-slate-50 p-3.5 rounded-xl border border-gray-200 italic font-medium">
                        "{r.comentario}"
                      </div>

                      <span className="text-[11px] text-slate-400 mt-2 block font-medium">
                        Fecha de reporte: {new Date(r.createdAt).toLocaleString('es-AR')}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <button
                        onClick={() => setModalResena({ isOpen: true, resenaId: r._id, accion: 'descartar' })}
                        className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-gray-300 font-bold rounded-xl text-xs transition-colors flex items-center space-x-1.5 cursor-pointer shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Descartar Reporte</span>
                      </button>
                      <button
                        onClick={() => setModalResena({ isOpen: true, resenaId: r._id, accion: 'eliminar' })}
                        className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center space-x-1.5 cursor-pointer shadow-xs"
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

      {/* ========================================================================= */}
      {/* 6. MODAL MODERNO IN-APP (REEMPLAZA EL PROMPT NATIVO DEL NAVEGADOR)        */}
      {/* ========================================================================= */}
      {modalEstado.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 relative">
            <button
              onClick={() => setModalEstado(prev => ({ ...prev, isOpen: false }))}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1 cursor-pointer rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold ${
                modalEstado.nuevoEstado === 'aprobado'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : modalEstado.nuevoEstado === 'suspendido'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}>
                {modalEstado.nuevoEstado === 'aprobado' ? <Check className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 leading-tight">
                  Cambiar Estado a "{modalEstado.nuevoEstado.toUpperCase()}"
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {modalEstado.nombreComercio}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                Motivo de la resolución municipal:
              </label>
              <textarea
                rows={3}
                value={modalEstado.motivo}
                onChange={(e) => setModalEstado(prev => ({ ...prev, motivo: e.target.value }))}
                placeholder="Ingresa el motivo administrativo o normativo..."
                className="w-full p-3 border border-gray-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8] bg-white resize-y"
              />
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setModalEstado(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2.5 rounded-xl border border-gray-300 text-slate-700 font-bold text-xs hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={confirmarCambioEstado}
                className={`px-5 py-2.5 rounded-xl text-white font-bold text-xs transition-colors cursor-pointer shadow-xs ${
                  modalEstado.nuevoEstado === 'aprobado'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : modalEstado.nuevoEstado === 'suspendido'
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                Confirmar Resolución
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Moderar Reseña */}
      {modalResena.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100">
            <h3 className="text-base font-black text-slate-900 mb-2">
              {modalResena.accion === 'eliminar' ? '¿Eliminar reseña ofensiva?' : '¿Descartar reporte?'}
            </h3>
            <p className="text-xs text-slate-600 mb-5">
              {modalResena.accion === 'eliminar' 
                ? 'Esta acción dará de baja la reseña permanentemente de la vidriera.'
                : 'La reseña permanecerá visible y el reporte será archivado.'}
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setModalResena(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 rounded-xl border border-gray-300 text-slate-700 font-bold text-xs hover:bg-gray-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarModerarResena}
                className={`px-4 py-2 rounded-xl text-white font-bold text-xs cursor-pointer ${
                  modalResena.accion === 'eliminar' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
