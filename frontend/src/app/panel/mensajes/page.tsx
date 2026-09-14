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
  CheckCheck
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

  // Obtener el interlocutor (el cliente o la otra persona)
  const getInterlocutor = (conv: Conversacion) => {
    const otro = conv.participantes?.find((p) => p._id !== currentUser?._id);
    return otro ? otro.nombre : 'Cliente Vecino';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-4">
        <Link href="/panel" className="text-indigo-600 hover:underline text-sm font-semibold flex items-center space-x-1">
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Panel de Tiendas</span>
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-xs border border-gray-200 overflow-hidden flex flex-col md:flex-row h-[650px]">
        {/* Lista de Conversaciones (Sidebar) */}
        <div className="w-full md:w-80 border-r border-gray-200 flex flex-col h-full bg-gray-50/50">
          <div className="p-4 border-b border-gray-200 bg-white">
            <h2 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-indigo-600" />
              <span>Bandeja de Consultas</span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Mensajes de clientes de tus vidrieras</p>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-xs text-gray-400">Cargando chats...</div>
            ) : conversaciones.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-xs">
                No tienes consultas de clientes aún.
              </div>
            ) : (
              conversaciones.map((conv) => {
                const isActive = conversacionActiva?._id === conv._id;
                const nombreCliente = getInterlocutor(conv);

                return (
                  <button
                    key={conv._id}
                    onClick={() => seleccionarConversacion(conv)}
                    className={`w-full text-left p-4 border-b border-gray-100 transition-colors flex items-start space-x-3 ${
                      isActive ? 'bg-indigo-50/70 border-l-4 border-l-indigo-600' : 'hover:bg-gray-100/70'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm flex-shrink-0">
                      {nombreCliente.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <h4 className="text-sm font-bold text-gray-900 truncate">{nombreCliente}</h4>
                        <span className="text-[10px] text-gray-400 flex-shrink-0">
                          {conv.fechaUltimoMensaje
                            ? new Date(conv.fechaUltimoMensaje).toLocaleDateString()
                            : ''}
                        </span>
                      </div>
                      <p className="text-xs text-indigo-600 font-medium truncate mb-1">
                        🏪 {conv.comercioId?.nombre}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{conv.ultimoMensaje}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Ventana de Mensajes Activa */}
        <div className="flex-1 flex flex-col h-full bg-white">
          {conversacionActiva ? (
            <>
              {/* Header de la conversación */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white shadow-xs">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm">
                    {getInterlocutor(conversacionActiva).charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-gray-900">
                      {getInterlocutor(conversacionActiva)}
                    </h3>
                    <span className="text-xs text-gray-500">
                      Consulta sobre: <strong className="text-gray-700">{conversacionActiva.comercioId?.nombre}</strong>
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-1.5 text-xs text-green-600 bg-green-50 px-2.5 py-1 rounded-full font-semibold">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  <span>Chat en vivo</span>
                </div>
              </div>

              {/* Lista de Mensajes */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50/50">
                {mensajes.map((m, idx) => {
                  const emisorId = typeof m.emisorId === 'object' ? m.emisorId?._id : m.emisorId;
                  const esMio = currentUser?._id && emisorId === currentUser._id;
                  const nombreEmisor = typeof m.emisorId === 'object' ? m.emisorId?.nombre : 'Usuario';

                  return (
                    <div
                      key={m._id || idx}
                      className={`flex flex-col ${esMio ? 'items-end' : 'items-start'}`}
                    >
                      <span className="text-[10px] text-gray-400 mb-0.5 ml-1 font-medium">
                        {esMio ? 'Tú (Comerciante)' : nombreEmisor}
                      </span>
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-xs ${
                          esMio
                            ? 'bg-indigo-600 text-white rounded-br-none'
                            : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{m.contenido}</p>
                        <span
                          className={`text-[9px] block text-right mt-1 ${
                            esMio ? 'text-indigo-200' : 'text-gray-400'
                          }`}
                        >
                          {m.createdAt
                            ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : 'Ahora'}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input para responder */}
              <form onSubmit={handleEnviar} className="p-3 border-t border-gray-200 flex items-center space-x-2 bg-white">
                <input
                  type="text"
                  placeholder="Escribe una respuesta para el cliente..."
                  value={nuevoMensaje}
                  onChange={(e) => setNuevoMensaje(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!nuevoMensaje.trim()}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-xs transition-colors flex items-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Responder</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-gray-400">
              <MessageSquare className="w-12 h-12 text-gray-300 mb-2" />
              <p className="text-sm font-semibold text-gray-600">Selecciona una conversación</p>
              <p className="text-xs text-gray-400">Podrás responder dudas de los vecinos en tiempo real.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
