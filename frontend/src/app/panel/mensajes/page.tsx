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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Breadcrumb */}
      <div className="mb-6 flex items-center justify-between">
        <Link 
          href="/panel" 
          className="inline-flex items-center space-x-2 text-xs font-semibold text-[#8d94a1] hover:text-[#d5d9e0] transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Volver al Panel Principal</span>
        </Link>
        <span className="text-xs text-[#8d94a1]">Bandeja Omnicanal en Vivo</span>
      </div>

      {/* Main Messenger Box */}
      <div className="bg-[#171b22] rounded-2xl shadow-xs border border-[#262d3a] overflow-hidden flex flex-col md:flex-row h-[700px]">
        {/* Sidebar */}
        <div className="w-full md:w-80 border-r border-[#262d3a] flex flex-col h-full bg-[#12151b]">
          <div className="p-4 border-b border-[#262d3a]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#1d222b] border border-[#262d3a] flex items-center justify-center text-[#7dafb5] font-bold">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-[#d5d9e0] uppercase tracking-wider">Consultas</h2>
                  <p className="text-[11px] text-[#8d94a1]">Interacciones en vivo</p>
                </div>
              </div>
              <span className="px-2 py-0.5 bg-[#1d222b] text-[#8d94a1] text-[10px] font-bold rounded-full border border-[#262d3a]">
                {conversaciones.length}
              </span>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8d94a1]" />
              <input
                type="text"
                placeholder="Filtrar por cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-[#171b22] border border-[#262d3a] rounded-lg text-xs text-[#d5d9e0] placeholder:text-[#8d94a1]/50 focus:outline-none focus:border-[#4b6cb7] transition-colors"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#262d3a]">
            {loading ? (
              <div className="p-8 text-center text-xs text-[#8d94a1]">
                Cargando bandeja de entrada...
              </div>
            ) : filteredConversaciones.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center h-48 text-[#8d94a1]">
                <Inbox className="w-8 h-8 text-[#8d94a1]/60 mb-2 stroke-[1.5]" />
                <p className="text-xs font-semibold text-[#d5d9e0]">Sin consultas registradas</p>
                <p className="text-[11px] text-[#8d94a1] mt-0.5">Los vecinos aparecerán aquí al chatear.</p>
              </div>
            ) : (
              filteredConversaciones.map((conv) => {
                const isActive = conversacionActiva?._id === conv._id;
                const nombreCliente = getInterlocutor(conv);

                return (
                  <button
                    key={conv._id}
                    onClick={() => seleccionarConversacion(conv)}
                    className={`w-full text-left p-3.5 transition-colors flex items-start space-x-3 ${
                      isActive 
                        ? 'bg-[#1d222b] border-l-3 border-l-[#4b6cb7]' 
                        : 'hover:bg-[#171b22]/70'
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <div className="w-9 h-9 rounded-xl bg-[#262d3a] text-[#d5d9e0] font-bold flex items-center justify-center text-xs">
                        {nombreCliente.charAt(0).toUpperCase()}
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-[#4a7c59] border-2 border-[#12151b] rounded-full"></span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <h4 className="text-xs font-bold text-[#d5d9e0] truncate">{nombreCliente}</h4>
                        <span className="text-[10px] text-[#8d94a1] flex-shrink-0 font-medium">
                          {conv.fechaUltimoMensaje
                            ? new Date(conv.fechaUltimoMensaje).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : ''}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-1 text-[11px] text-[#7dafb5] font-semibold truncate mb-1">
                        <Store className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{conv.comercioId?.nombre}</span>
                      </div>

                      <p className="text-xs text-[#8d94a1] truncate font-normal">
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
        <div className="flex-1 flex flex-col h-full bg-[#171b22]">
          {conversacionActiva ? (
            <>
              {/* Header */}
              <div className="px-5 py-3.5 border-b border-[#262d3a] flex items-center justify-between bg-[#14181f]">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-9 h-9 rounded-xl bg-[#4b6cb7] text-[#d5d9e0] font-bold flex items-center justify-center text-sm">
                      {getInterlocutor(conversacionActiva).charAt(0).toUpperCase()}
                    </div>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#4a7c59] border-2 border-[#14181f] rounded-full"></span>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-bold text-sm text-[#d5d9e0]">
                        {getInterlocutor(conversacionActiva)}
                      </h3>
                      <span className="text-[10px] font-bold badge-steel px-2 py-0.5 rounded-md">
                        Vecino de Bahía Blanca
                      </span>
                    </div>
                    <div className="flex items-center space-x-1.5 text-xs text-[#8d94a1] mt-0.5">
                      <span>Consulta sobre:</span>
                      <span className="font-semibold text-[#7dafb5]">{conversacionActiva.comercioId?.nombre}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 badge-sage text-xs font-semibold rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4a7c59]"></span>
                    <span>Canal Activo</span>
                  </span>
                </div>
              </div>

              {/* Messages Body */}
              <div className="flex-1 p-5 overflow-y-auto space-y-3 bg-[#12151b]">
                {mensajes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-[#8d94a1] space-y-2">
                    <Sparkles className="w-7 h-7 text-[#7dafb5] stroke-[1.5]" />
                    <p className="text-xs font-semibold text-[#d5d9e0]">Inicia la conversación</p>
                    <p className="text-[11px] text-[#8d94a1]">Responde con amabilidad sobre precios o stock.</p>
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
                        <span className="text-[10px] text-[#8d94a1] mb-1 px-1 font-medium">
                          {esMio ? 'Tú (Comercio)' : nombreEmisor}
                        </span>
                        <div
                          className={`max-w-[75%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed shadow-xs ${
                            esMio
                              ? 'bg-[#2a374a] text-[#d5d9e0] border border-[#3b4c66]'
                              : 'bg-[#1d222b] text-[#d5d9e0] border border-[#262d3a]'
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">{m.contenido}</p>
                          <div
                            className={`text-[9px] flex items-center justify-end space-x-1 mt-1 font-medium text-[#8d94a1]`}
                          >
                            <span>
                              {m.createdAt
                                ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                : 'Ahora'}
                            </span>
                            {esMio && <CheckCheck className="w-3 h-3 text-[#7dafb5]" />}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Compose Message Bar */}
              <form onSubmit={handleEnviar} className="p-3.5 border-t border-[#262d3a] bg-[#14181f] flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Escribe tu respuesta al vecino..."
                  value={nuevoMensaje}
                  onChange={(e) => setNuevoMensaje(e.target.value)}
                  className="flex-1 px-3.5 py-2 bg-[#12151b] border border-[#262d3a] rounded-xl text-xs text-[#d5d9e0] placeholder:text-[#8d94a1]/50 focus:outline-none focus:border-[#4b6cb7] transition-colors"
                />
                <button
                  type="submit"
                  disabled={!nuevoMensaje.trim()}
                  className="px-4 py-2 bg-[#4b6cb7] hover:bg-[#3d5a99] disabled:opacity-40 text-[#d5d9e0] font-semibold rounded-xl text-xs transition-colors flex items-center space-x-1.5"
                >
                  <span>Responder</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-[#8d94a1] space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#1d222b] border border-[#262d3a] flex items-center justify-center text-[#8d94a1]">
                <MessageSquare className="w-6 h-6 stroke-[1.5]" />
              </div>
              <p className="text-sm font-bold text-[#d5d9e0]">Selecciona una conversación</p>
              <p className="text-xs text-[#8d94a1] max-w-sm">
                Podrás responder consultas de precios, horarios y disponibilidad de tus vidrieras en tiempo real.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
