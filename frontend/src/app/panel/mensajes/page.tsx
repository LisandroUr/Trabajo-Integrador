'use client';

import { useState, useEffect, useRef } from 'react';
import { fetchAPI } from '@/lib/api';
import { io, Socket } from 'socket.io-client';
import Link from 'next/link';
import { 
  MessageSquare, 
  Send, 
  User, 
  Store, 
  Clock, 
  ArrowLeft,
  CheckCheck,
  Search,
  Sparkles,
  Inbox
} from 'lucide-react';
import { toast } from 'sonner';

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

interface Conversacion {
  _id: string;
  comercioId: {
    _id: string;
    nombre: string;
  };
  participantes: Array<{
    _id: string;
    nombre: string;
    email: string;
  }>;
  ultimoMensaje: string;
  fechaUltimoMensaje: string;
}

export default function MensajesPanelPage() {
  const [conversaciones, setConversaciones] = useState<Conversacion[]>([]);
  const [conversacionActiva, setConversacionActiva] = useState<Conversacion | null>(null);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    const userStored = localStorage.getItem('user');
    if (userStored) {
      try {
        setCurrentUser(JSON.parse(userStored));
      } catch {}
    }

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5001';
    const socketClient = io(socketUrl, {
      transports: ['websocket', 'polling']
    });
    setSocket(socketClient);

    const cargarConversaciones = async () => {
      try {
        const res = await fetchAPI('/conversaciones');
        setConversaciones(res || []);
        if (res && res.length > 0) {
          seleccionarConversacion(res[0], socketClient);
        }
      } catch (err: any) {
        console.error('Error cargando conversaciones:', err);
      } finally {
        setLoading(false);
      }
    };

    cargarConversaciones();

    socketClient.on('receive_message', (msg: Mensaje) => {
      setMensajes((prev) => {
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
      setConversaciones((prev) =>
        prev.map((c) =>
          c._id === msg.conversacionId
            ? { ...c, ultimoMensaje: msg.contenido, fechaUltimoMensaje: new Date().toISOString() }
            : c
        )
      );
      scrollToBottom();
    });

    return () => {
      socketClient.disconnect();
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [mensajes]);

  const seleccionarConversacion = async (conv: Conversacion, socketInstance = socket) => {
    setConversacionActiva(conv);
    try {
      if (socketInstance) {
        socketInstance.emit('join_conversation', conv._id);
      }
      const res = await fetchAPI(`/conversaciones/${conv._id}/mensajes`);
      setMensajes(res.mensajes || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEnviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoMensaje.trim() || !conversacionActiva) return;

    const contenido = nuevoMensaje.trim();
    setNuevoMensaje('');

    try {
      if (socket && socket.connected) {
        socket.emit('send_message', {
          conversacionId: conversacionActiva._id,
          emisorId: currentUser?._id,
          contenido
        });
      } else {
        const res = await fetchAPI(`/conversaciones/${conversacionActiva._id}/mensajes`, {
          method: 'POST',
          body: JSON.stringify({ contenido })
        });
        setMensajes((prev) => [...prev, res]);
      }
    } catch (err: any) {
      toast.error('Error enviando mensaje: ' + err.message);
    }
  };

  const getInterlocutor = (conv: Conversacion) => {
    const otro = conv.participantes?.find((p) => p._id !== currentUser?._id);
    return otro ? otro.nombre : 'Cliente Vecino';
  };

  const filteredConversaciones = conversaciones.filter((c) => {
    const nombre = getInterlocutor(c).toLowerCase();
    const tienda = (c.comercioId?.nombre || '').toLowerCase();
    const query = searchTerm.toLowerCase();
    return nombre.includes(query) || tienda.includes(query);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Top Breadcrumb & Status */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link 
          href="/panel" 
          className="inline-flex items-center space-x-2 text-xs font-bold text-[#b8c0cc] hover:text-[#f3f5f8] transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Volver a Mis Vidrieras</span>
        </Link>
        <div className="flex items-center space-x-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#192b22] border border-[#2b4c39] text-[#93cca5] text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-[#4a7c59] animate-pulse"></span>
            <span>Canal WebSocket Conectado &bull; Bahía Blanca</span>
          </div>
        </div>
      </div>

      {/* Main Messenger Box */}
      <div className="bg-[#161a22] rounded-2xl shadow-md border border-[#2b3342] overflow-hidden flex flex-col md:flex-row h-[560px] sm:h-[590px]">
        {/* Sidebar */}
        <div className="w-full md:w-84 border-r border-[#2b3342] flex flex-col h-full bg-[#12151b]">
          <div className="p-4 border-b border-[#2b3342] bg-[#161a22]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#1d232e] border border-[#343e50] flex items-center justify-center text-[#7dafb5] font-bold">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-extrabold text-[#f3f5f8] uppercase tracking-wider">Consultas Vecinales</h2>
                  <p className="text-[11px] text-[#b8c0cc]">Mensajería en tiempo real</p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 bg-[#1d232e] text-[#9bc5cc] text-xs font-bold rounded-full border border-[#343e50]">
                {conversaciones.length}
              </span>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#7d8799]" />
              <input
                type="text"
                placeholder="Filtrar por nombre de vecino..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-[#12151b] border border-[#343e50] rounded-xl text-xs text-[#f3f5f8] placeholder-[#7d8799] focus:outline-none focus:border-[#4568b4] transition-colors"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#2b3342]">
            {loading ? (
              <div className="p-8 text-center text-xs text-[#b8c0cc]">
                <div className="w-6 h-6 border-2 border-[#4568b4] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="font-semibold text-[#f3f5f8]">Cargando bandeja de entrada...</p>
              </div>
            ) : filteredConversaciones.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center h-48 text-[#b8c0cc]">
                <Inbox className="w-8 h-8 text-[#7d8799] mb-2 stroke-[1.5]" />
                <p className="text-xs font-bold text-[#f3f5f8]">Sin consultas registradas</p>
                <p className="text-[11px] text-[#b8c0cc] mt-0.5">Los vecinos aparecerán aquí al chatear.</p>
              </div>
            ) : (
              filteredConversaciones.map((conv) => {
                const isActive = conversacionActiva?._id === conv._id;
                const nombreCliente = getInterlocutor(conv);

                return (
                  <button
                    key={conv._id}
                    onClick={() => seleccionarConversacion(conv)}
                    className={`w-full text-left p-4 transition-colors flex items-start space-x-3 cursor-pointer ${
                      isActive 
                        ? 'bg-[#1d232e] border-l-4 border-l-[#4568b4]' 
                        : 'hover:bg-[#161a22]/70'
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 rounded-xl bg-[#1d232e] border border-[#343e50] text-[#f3f5f8] font-extrabold flex items-center justify-center text-sm">
                        {(nombreCliente || 'C').charAt(0).toUpperCase()}
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#4a7c59] border-2 border-[#12151b] rounded-full"></span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <h4 className="text-xs font-extrabold text-[#f3f5f8] truncate">{nombreCliente}</h4>
                        <span className="text-[10px] text-[#9eb1cb] flex-shrink-0 font-bold">
                          {conv.fechaUltimoMensaje
                            ? new Date(conv.fechaUltimoMensaje).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : ''}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-1 text-[11px] text-[#9bc5cc] font-semibold truncate mb-1">
                        <Store className="w-3 h-3 flex-shrink-0 text-[#7dafb5]" />
                        <span className="truncate">{conv.comercioId?.nombre}</span>
                      </div>

                      <p className="text-xs text-[#b8c0cc] truncate font-normal">
                        {conv.ultimoMensaje || 'Sin mensajes recientes'}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Active Chat Conversation Pane */}
        <div className="flex-1 flex flex-col h-full bg-[#161a22]">
          {conversacionActiva ? (
            <>
              {/* Header */}
              <div className="px-6 py-4 border-b border-[#2b3342] flex items-center justify-between bg-[#13161d]">
                <div className="flex items-center space-x-3.5">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-[#4568b4] text-[#f3f5f8] font-bold flex items-center justify-center text-sm shadow-xs">
                      {(getInterlocutor(conversacionActiva) || 'C').charAt(0).toUpperCase()}
                    </div>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#4a7c59] border-2 border-[#13161d] rounded-full"></span>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-extrabold text-sm text-[#f3f5f8]">
                        {getInterlocutor(conversacionActiva)}
                      </h3>
                      <span className="text-[10px] font-bold bg-[#182630] border border-[#294354] text-[#9bc5cc] px-2 py-0.5 rounded-md">
                        Vecino de Bahía Blanca
                      </span>
                    </div>
                    <div className="flex items-center space-x-1.5 text-xs text-[#b8c0cc] mt-0.5">
                      <span>Consulta sobre vidriera:</span>
                      <span className="font-bold text-[#9bc5cc]">{conversacionActiva.comercioId?.nombre}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-[#192b22] border border-[#2b4c39] text-[#93cca5] text-xs font-bold rounded-full">
                    <span className="w-2 h-2 rounded-full bg-[#4a7c59]"></span>
                    <span>Canal Activo</span>
                  </span>
                </div>
              </div>

              {/* Messages Body */}
              <div ref={messagesContainerRef} className="flex-1 p-6 overflow-y-auto space-y-4 bg-[#12151b]">
                {mensajes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-[#b8c0cc] space-y-2">
                    <Sparkles className="w-8 h-8 text-[#7dafb5] stroke-[1.5]" />
                    <p className="text-sm font-bold text-[#f3f5f8]">Inicia la conversación</p>
                    <p className="text-xs text-[#b8c0cc]">Responde con amabilidad sobre precios, stock o promociones de tu comercio.</p>
                  </div>
                ) : (
                  mensajes.map((m, idx) => {
                    const emisorId = typeof m.emisorId === 'object' ? m.emisorId?._id : m.emisorId;
                    const esMio = currentUser?._id && emisorId === currentUser._id;
                    const nombreEmisor = typeof m.emisorId === 'object' ? m.emisorId?.nombre : 'Usuario';

                    return (
                      <div
                        key={m._id || idx}
                        className={`flex flex-col ${esMio ? 'items-end' : 'items-start'}`}
                      >
                        <span className="text-[11px] text-[#b8c0cc] mb-1 px-1 font-semibold">
                          {esMio ? 'Tú (Comercio)' : nombreEmisor}
                        </span>
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed shadow-sm ${
                            esMio
                              ? 'bg-[#243347] text-[#f3f5f8] border border-[#394e6b]'
                              : 'bg-[#1d232e] text-[#f3f5f8] border border-[#343e50]'
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">{m.contenido}</p>
                          <div
                            className={`text-[10px] flex items-center justify-end space-x-1.5 mt-1.5 font-semibold ${
                              esMio ? 'text-[#9cb1ce]' : 'text-[#9eb1cb]'
                            }`}
                          >
                            <span>
                              {m.createdAt
                                ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                : 'Ahora'}
                            </span>
                            {esMio && <CheckCheck className="w-3.5 h-3.5 text-[#7dafb5]" />}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Compose Message Bar */}
              <form onSubmit={handleEnviar} className="p-4 border-t border-[#2b3342] bg-[#13161d] flex items-center space-x-3">
                <input
                  type="text"
                  placeholder="Escribe tu respuesta al vecino..."
                  value={nuevoMensaje}
                  onChange={(e) => setNuevoMensaje(e.target.value)}
                  className="flex-1 px-4 py-3 bg-[#12151b] border border-[#343e50] rounded-xl text-xs sm:text-sm text-[#f3f5f8] placeholder-[#7d8799] focus:outline-none focus:border-[#4568b4] transition-colors"
                />
                <button
                  type="submit"
                  disabled={!nuevoMensaje.trim()}
                  className="px-5 py-3 bg-[#4568b4] hover:bg-[#395697] disabled:opacity-40 text-[#f3f5f8] font-bold rounded-xl text-xs transition-colors flex items-center space-x-2 shadow-sm"
                >
                  <span>Responder</span>
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-[#b8c0cc] space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-[#1d232e] border border-[#343e50] flex items-center justify-center text-[#7dafb5]">
                <MessageSquare className="w-7 h-7 stroke-[1.5]" />
              </div>
              <p className="text-base font-bold text-[#f3f5f8]">Selecciona una conversación</p>
              <p className="text-xs text-[#b8c0cc] max-w-sm leading-relaxed">
                Podrás responder consultas de precios, horarios y disponibilidad de tus vidrieras en tiempo real.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
