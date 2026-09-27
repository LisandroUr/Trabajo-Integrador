'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchAPI } from '@/lib/api';
import { io, Socket } from 'socket.io-client';
import { 
  MessageSquare, 
  Store, 
  MapPin, 
  Phone, 
  Send, 
  CheckCheck, 
  Search, 
  ExternalLink, 
  Clock, 
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  Loader2,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

interface Conversacion {
  _id: string;
  comercioId: {
    _id: string;
    nombre: string;
    direccion?: string;
    contacto?: {
      telefono?: string;
      whatsapp?: string;
      email?: string;
    };
    vidriera?: {
      logo?: string;
    };
  };
  participantes: Array<{
    _id: string;
    nombre: string;
    email: string;
  }>;
  ultimoMensaje: string;
  fechaUltimoMensaje: string;
}

interface Mensaje {
  _id?: string;
  conversacionId: string;
  emisorId: {
    _id: string;
    nombre: string;
  } | string;
  contenido: string;
  createdAt?: string;
}

export default function MisConsultasPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [conversaciones, setConversaciones] = useState<Conversacion[]>([]);
  const [seleccionada, setSeleccionada] = useState<Conversacion | null>(null);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [loadingList, setLoadingList] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const [filtroBusqueda, setFiltroBusqueda] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const userStored = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!token || !userStored) {
      toast.error('Debes identificarte para ver tus consultas');
      router.push('/login');
      return;
    }

    try {
      setUser(JSON.parse(userStored));
    } catch {
      router.push('/login');
      return;
    }

    cargarConversaciones();
  }, []);

  const cargarConversaciones = async () => {
    setLoadingList(true);
    try {
      const data = await fetchAPI('/conversaciones');
      const convList = Array.isArray(data) ? data : [];
      setConversaciones(convList);

      if (convList.length > 0 && !seleccionada) {
        seleccionarConversacion(convList[0]);
      }
    } catch (err: any) {
      console.error('Error cargando conversaciones:', err);
      toast.error('Error al cargar conversaciones: ' + err.message);
    } finally {
      setLoadingList(false);
    }
  };

  // Conectar sockets al seleccionar conversacion
  const seleccionarConversacion = async (conv: Conversacion) => {
    setSeleccionada(conv);
    setLoadingChat(true);

    if (socket) {
      socket.disconnect();
    }

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5001';
    const socketClient = io(socketUrl, {
      transports: ['websocket', 'polling']
    });

    setSocket(socketClient);

    try {
      socketClient.emit('join_conversation', conv._id);

      const res = await fetchAPI(`/conversaciones/${conv._id}/mensajes`);
      setMensajes(res.mensajes || []);
    } catch (err: any) {
      toast.error('Error cargando mensajes de la conversación');
    } finally {
      setLoadingChat(false);
    }

    socketClient.on('receive_message', (msg: Mensaje) => {
      setMensajes((prev) => {
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
      scrollToBottom();
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [mensajes]);

  useEffect(() => {
    return () => {
      if (socket) socket.disconnect();
    };
  }, [socket]);

  const handleEnviarMensaje = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoMensaje.trim() || !seleccionada) return;

    const contenido = nuevoMensaje.trim();
    setNuevoMensaje('');

    try {
      if (socket && socket.connected) {
        socket.emit('send_message', {
          conversacionId: seleccionada._id,
          emisorId: user?._id,
          contenido
        });
      } else {
        const res = await fetchAPI(`/conversaciones/${seleccionada._id}/mensajes`, {
          method: 'POST',
          body: JSON.stringify({ contenido })
        });
        setMensajes((prev) => [...prev, res]);
      }

      // Actualizar último mensaje en la lista lateral
      setConversaciones((prev) =>
        prev.map((c) =>
          c._id === seleccionada._id
            ? { ...c, ultimoMensaje: contenido, fechaUltimoMensaje: new Date().toISOString() }
            : c
        )
      );
    } catch (err: any) {
      toast.error('Error al enviar mensaje: ' + err.message);
    }
  };

  const conversacionesFiltradas = conversaciones.filter((c) => {
    const nombre = c.comercioId?.nombre || '';
    const dir = c.comercioId?.direccion || '';
    const query = filtroBusqueda.toLowerCase();
    return nombre.toLowerCase().includes(query) || dir.toLowerCase().includes(query);
  });

  // Datos de contacto de la tienda activa
  const contactoActivo = seleccionada?.comercioId?.contacto;
  const telLimpio = contactoActivo?.whatsapp || contactoActivo?.telefono || '';
  const waDigits = telLimpio.replace(/\D/g, '');
  const waUrl = waDigits ? `https://wa.me/${waDigits.startsWith('54') ? waDigits : '549' + waDigits}` : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-[#171b22] border border-[#232833] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md bg-[#1d2433] border border-[#2c374d] text-[#9cb1ce] text-[11px] font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Portal Vecinal</span>
            </span>
            <span className="text-xs text-[#78808f]">• Bahía Blanca</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-[#e2e5eb]">
            Mis Consultas a Comercios
          </h1>
          <p className="text-xs text-[#8d94a1] mt-1 max-w-2xl">
            Bandeja unificada de mensajes directos con comerciantes locales. Consulta stock, reservas y medios de pago.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/ranking"
            className="px-3.5 py-2 rounded-xl bg-[#1e2430] hover:bg-[#252d3d] border border-[#2c3749] text-xs font-medium text-[#e2e5eb] transition-colors flex items-center space-x-1.5 shadow-xs"
          >
            <span>Ver Ranking</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#9cb1ce]" />
          </Link>
          <Link
            href="/buscar"
            className="px-3.5 py-2 rounded-xl bg-[#14181f] hover:bg-[#1b2029] border border-[#232833] text-xs font-medium text-[#8d94a1] hover:text-[#e2e5eb] transition-colors"
          >
            <span>Directorio</span>
          </Link>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      {loadingList ? (
        <div className="min-h-[400px] flex flex-col items-center justify-center text-xs text-[#78808f]">
          <Loader2 className="w-6 h-6 animate-spin text-[#9cb1ce] mb-2" />
          <span>Cargando tus conversaciones...</span>
        </div>
      ) : conversaciones.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#171b22] border border-[#232833] text-center max-w-xl mx-auto my-8 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-[#1e2430] border border-[#2c3749] text-[#9cb1ce] flex items-center justify-center mx-auto">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[#e2e5eb]">
              No tienes consultas activas
            </h3>
            <p className="text-xs text-[#8d94a1] mt-1.5 leading-relaxed">
              Cuando consultes a un comercio desde el Observatorio de Precios o las fichas de comercios, tus conversaciones quedarán guardadas aquí para que puedas continuar el diálogo en cualquier momento.
            </p>
          </div>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/ranking"
              className="px-4 py-2 bg-[#2c3749] hover:bg-[#354359] text-[#e2e5eb] border border-[#3e4f69] rounded-xl text-xs font-medium transition-colors inline-flex items-center space-x-1.5"
            >
              <span>Explorar Observatorio de Precios</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/buscar"
              className="px-4 py-2 bg-[#12151b] hover:bg-[#181c24] text-[#8d94a1] hover:text-[#e2e5eb] border border-[#232833] rounded-xl text-xs font-medium transition-colors"
            >
              Buscar Comercios
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px] h-[calc(100vh-280px)]">
          {/* Column 1: Conversations List */}
          <div className="lg:col-span-4 bg-[#171b22] border border-[#232833] rounded-2xl flex flex-col overflow-hidden">
            {/* Search Input */}
            <div className="p-3 border-b border-[#232833] bg-[#14181f]">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#78808f]" />
                <input
                  type="text"
                  placeholder="Filtrar por comercio o dirección..."
                  value={filtroBusqueda}
                  onChange={(e) => setFiltroBusqueda(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-[#12151b] border border-[#262d3a] rounded-xl text-xs text-[#e2e5eb] placeholder:text-[#6b7280] focus:outline-none focus:border-[#4b6cb7]"
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y divide-[#202530]">
              {conversacionesFiltradas.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#78808f]">
                  No se encontraron conversaciones con ese filtro.
                </div>
              ) : (
                conversacionesFiltradas.map((conv) => {
                  const isSelected = seleccionada?._id === conv._id;
                  const storeName = conv.comercioId?.nombre || 'Comercio';
                  const storeAddress = conv.comercioId?.direccion;

                  return (
                    <button
                      key={conv._id}
                      onClick={() => seleccionarConversacion(conv)}
                      className={`w-full text-left p-4 transition-colors flex items-start space-x-3 ${
                        isSelected
                          ? 'bg-[#1e2430] border-l-4 border-l-[#4b6cb7]'
                          : 'hover:bg-[#14181f] border-l-4 border-l-transparent'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-[#14181f] border border-[#262d3a] text-[#9cb1ce] flex items-center justify-center font-semibold text-xs flex-shrink-0">
                        {storeName.charAt(0).toUpperCase()}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-xs font-semibold text-[#e2e5eb] truncate">
                            {storeName}
                          </h4>
                          <span className="text-[10px] text-[#78808f] ml-1 flex-shrink-0">
                            {conv.fechaUltimoMensaje
                              ? new Date(conv.fechaUltimoMensaje).toLocaleDateString([], {
                                  month: 'short',
                                  day: 'numeric'
                                })
                              : ''}
                          </span>
                        </div>

                        {storeAddress && (
                          <div className="flex items-center space-x-1 text-[10px] text-[#78808f] mb-1 truncate">
                            <MapPin className="w-3 h-3 flex-shrink-0 text-[#6b7280]" />
                            <span className="truncate">{storeAddress}</span>
                          </div>
                        )}

                        <p className="text-[11px] text-[#8d94a1] truncate">
                          {conv.ultimoMensaje || 'Conversación abierta'}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Column 2: Active Chat Area */}
          <div className="lg:col-span-8 bg-[#171b22] border border-[#232833] rounded-2xl flex flex-col overflow-hidden">
            {seleccionada ? (
              <>
                {/* Active Chat Header */}
                <div className="px-5 py-3.5 bg-[#14181f] border-b border-[#232833] flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-[#1e2430] border border-[#2c3749] text-[#9cb1ce] flex items-center justify-center font-semibold text-xs flex-shrink-0">
                      {(seleccionada.comercioId?.nombre || 'C').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-xs font-semibold text-[#e2e5eb]">
                          {seleccionada.comercioId?.nombre || 'Comercio'}
                        </h3>
                        <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded bg-[#1e2a23] border border-[#2b3e34] text-[#8bb59b] text-[9px] font-medium">
                          <ShieldCheck className="w-2.5 h-2.5" />
                          <span>Habilitado</span>
                        </span>
                      </div>
                      {seleccionada.comercioId?.direccion && (
                        <p className="text-[10px] text-[#78808f] truncate max-w-sm">
                          {seleccionada.comercioId.direccion}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    {waUrl && (
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 rounded-lg bg-[#192720] hover:bg-[#20332a] border border-[#294234] text-[#93cca5] text-xs font-medium transition-colors inline-flex items-center space-x-1"
                        title="Contactar vía WhatsApp"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">WhatsApp</span>
                      </a>
                    )}
                    {seleccionada.comercioId?._id && (
                      <Link
                        href={`/comercio/${seleccionada.comercioId._id}`}
                        className="px-2.5 py-1.5 rounded-lg bg-[#1e2430] hover:bg-[#252d3d] border border-[#2c3749] text-[#e2e5eb] text-xs font-medium transition-colors inline-flex items-center space-x-1"
                      >
                        <span>Ficha</span>
                        <ExternalLink className="w-3 h-3 text-[#9cb1ce]" />
                      </Link>
                    )}
                  </div>
                </div>

                {/* Messages Timeline */}
                <div className="flex-1 p-5 overflow-y-auto space-y-3 bg-[#12151b]">
                  {loadingChat ? (
                    <div className="h-full flex items-center justify-center text-xs text-[#78808f]">
                      <Loader2 className="w-5 h-5 animate-spin text-[#9cb1ce] mr-2" />
                      <span>Cargando mensajes...</span>
                    </div>
                  ) : mensajes.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center text-[#78808f] p-4">
                      <Sparkles className="w-8 h-8 text-[#9cb1ce] mb-2 stroke-[1.5]" />
                      <p className="text-xs font-semibold text-[#e2e5eb]">Inicia la conversación</p>
                      <p className="text-[11px] text-[#78808f] mt-1 max-w-sm">
                        Envía un mensaje para consultar por precios, stock disponible o promociones del comercio.
                      </p>
                    </div>
                  ) : (
                    mensajes.map((m, idx) => {
                      const emisorId = typeof m.emisorId === 'object' ? m.emisorId?._id : m.emisorId;
                      const esMio = user?._id && emisorId === user._id;
                      const nombreEmisor = typeof m.emisorId === 'object' ? m.emisorId?.nombre : 'Usuario';

                      return (
                        <div
                          key={m._id || idx}
                          className={`flex flex-col ${esMio ? 'items-end' : 'items-start'}`}
                        >
                          <span className="text-[9px] text-[#78808f] mb-0.5 px-1 font-medium">
                            {esMio ? 'Tú' : nombreEmisor}
                          </span>
                          <div
                            className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-xs ${
                              esMio
                                ? 'bg-[#253347] text-[#f3f5f8] border border-[#3b4e6a]'
                                : 'bg-[#191e28] text-[#e2e5eb] border border-[#252e3d]'
                            }`}
                          >
                            <p className="whitespace-pre-wrap break-words">{m.contenido}</p>
                            <div className="text-[9px] flex items-center justify-end space-x-1 mt-1 font-medium text-[#78808f]">
                              <span>
                                {m.createdAt
                                  ? new Date(m.createdAt).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })
                                  : 'Ahora'}
                              </span>
                              {esMio && <CheckCheck className="w-3 h-3 text-[#9cb1ce]" />}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Bar */}
                <form
                  onSubmit={handleEnviarMensaje}
                  className="p-3.5 border-t border-[#232833] bg-[#14181f] flex items-center space-x-2 flex-shrink-0"
                >
                  <input
                    type="text"
                    placeholder="Escribe tu mensaje para el comerciante..."
                    value={nuevoMensaje}
                    onChange={(e) => setNuevoMensaje(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 bg-[#12151b] border border-[#262d3a] rounded-xl text-xs text-[#e2e5eb] placeholder:text-[#6b7280] focus:outline-none focus:border-[#4b6cb7]"
                  />
                  <button
                    type="submit"
                    disabled={!nuevoMensaje.trim()}
                    className="p-2.5 rounded-xl bg-[#2c3749] hover:bg-[#36445c] disabled:opacity-40 text-[#e2e5eb] border border-[#3e4e69] transition-colors flex items-center justify-center shadow-xs"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-[#78808f]">
                Selecciona una conversación del listado izquierdo
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
