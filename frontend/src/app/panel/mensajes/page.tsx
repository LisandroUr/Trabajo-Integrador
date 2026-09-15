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

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
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
      } catch (err) {
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
      // Actualizar último mensaje en la lista
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
      if (socketClient) socketClient.disconnect();
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
      alert('Error enviando mensaje: ' + err.message);
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Breadcrumb navigation */}
      <div className="mb-6 flex items-center justify-between">
        <Link 
          href="/panel" 
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          <span>Volver al Panel de Gestión</span>
        </Link>
        <span className="text-xs text-slate-400 font-medium">Bandeja de Mensajería Omnicanal</span>
      </div>

      {/* Main Messenger Box */}
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/80 overflow-hidden flex flex-col md:flex-row h-[700px]">
        {/* Sidebar */}
        <div className="w-full md:w-88 border-r border-slate-100 flex flex-col h-full bg-slate-50/50">
          <div className="p-5 border-b border-slate-100 bg-white">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 tracking-tight">Consultas de Clientes</h2>
                  <p className="text-[11px] text-slate-400">Interacciones en tiempo real</p>
                </div>
              </div>
              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-full border border-slate-200">
                {conversaciones.length}
              </span>
            </div>

            {/* Search filter in conversations */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Filtrar por cliente o comercio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100/80">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Cargando conversaciones activas...
              </div>
            ) : filteredConversaciones.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center h-48 text-slate-400">
                <Inbox className="w-8 h-8 text-slate-300 mb-2 stroke-[1.5]" />
                <p className="text-xs font-semibold text-slate-600">No hay consultas registradas</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Los vecinos aparecerán aquí cuando hagan preguntas.</p>
              </div>
            ) : (
              filteredConversaciones.map((conv) => {
                const isActive = conversacionActiva?._id === conv._id;
                const nombreCliente = getInterlocutor(conv);

                return (
                  <button
                    key={conv._id}
                    onClick={() => seleccionarConversacion(conv)}
                    className={`w-full text-left p-4 transition-all flex items-start space-x-3.5 ${
                      isActive 
                        ? 'bg-indigo-50/70 border-l-4 border-l-indigo-600 shadow-xs' 
                        : 'hover:bg-slate-100/60'
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white font-black flex items-center justify-center text-sm shadow-sm">
                        {nombreCliente.charAt(0).toUpperCase()}
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <h4 className="text-xs font-bold text-slate-900 truncate tracking-tight">{nombreCliente}</h4>
                        <span className="text-[10px] text-slate-400 flex-shrink-0 font-medium">
                          {conv.fechaUltimoMensaje
                            ? new Date(conv.fechaUltimoMensaje).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : ''}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-1 text-[11px] text-indigo-600 font-semibold truncate mb-1">
                        <Store className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{conv.comercioId?.nombre}</span>
                      </div>

                      <p className="text-xs text-slate-500 truncate font-normal">
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
        <div className="flex-1 flex flex-col h-full bg-white">
          {conversacionActiva ? (
            <>
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
                <div className="flex items-center space-x-3.5">
                  <div className="relative">
                    <div className="w-11 h-11 rounded-2xl bg-slate-900 text-white font-black flex items-center justify-center text-base shadow-sm">
                      {getInterlocutor(conversacionActiva).charAt(0).toUpperCase()}
                    </div>
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-bold text-sm text-slate-900">
                        {getInterlocutor(conversacionActiva)}
                      </h3>
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200">
                        Vecino
                      </span>
                    </div>
                    <div className="flex items-center space-x-1.5 text-xs text-slate-500 mt-0.5">
                      <span>Interesado en:</span>
                      <span className="font-bold text-slate-800">{conversacionActiva.comercioId?.nombre}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                    <span>Canal Activo</span>
                  </span>
                </div>
              </div>

              {/* Messages Body */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/40">
                {mensajes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2">
                    <Sparkles className="w-8 h-8 text-indigo-400 stroke-[1.5]" />
                    <p className="text-xs font-semibold text-slate-600">Inicia la conversación</p>
                    <p className="text-[11px] text-slate-400">Responde con amabilidad y brinda detalles sobre tus productos o servicios.</p>
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
                        <span className="text-[10px] text-slate-400 mb-1 px-1 font-medium">
                          {esMio ? 'Tú (Comercio)' : nombreEmisor}
                        </span>
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-sm ${
                            esMio
                              ? 'bg-indigo-600 text-white rounded-br-xs'
                              : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">{m.contenido}</p>
                          <div
                            className={`text-[9px] flex items-center justify-end space-x-1 mt-1 font-medium ${
                              esMio ? 'text-indigo-200' : 'text-slate-400'
                            }`}
                          >
                            <span>
                              {m.createdAt
                                ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                : 'Ahora'}
                            </span>
                            {esMio && <CheckCheck className="w-3 h-3 text-indigo-300" />}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Compose Message Bar */}
              <form onSubmit={handleEnviar} className="p-4 border-t border-slate-100 bg-white flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Escribe tu respuesta al vecino..."
                  value={nuevoMensaje}
                  onChange={(e) => setNuevoMensaje(e.target.value)}
                  className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all"
                />
                <button
                  type="submit"
                  disabled={!nuevoMensaje.trim()}
                  className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold rounded-2xl text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center space-x-2"
                >
                  <span>Enviar</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                <MessageSquare className="w-7 h-7 stroke-[1.5]" />
              </div>
              <p className="text-sm font-bold text-slate-700">Selecciona una conversación</p>
              <p className="text-xs text-slate-400 max-w-sm">
                Podrás responder consultas de precios, horarios y disponibilidad con tus clientes vecinos en tiempo real.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
