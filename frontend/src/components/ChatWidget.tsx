'use client';

import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { fetchAPI } from '@/lib/api';
import { MessageSquare, Send, X, User, Store } from 'lucide-react';

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

interface ChatWidgetProps {
  comercioId: string;
  comercioNombre: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatWidget({
  comercioId,
  comercioNombre,
  isOpen,
  onClose
}: ChatWidgetProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [conversacion, setConversacion] = useState<any>(null);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!isOpen) return;

    // Obtener usuario actual de localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch {
        setCurrentUser(null);
      }
    }

    // Inicializar Socket.io
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
    const socketClient = io(socketUrl, {
      transports: ['websocket', 'polling']
    });

    setSocket(socketClient);

    // Cargar o crear conversación
    const initChat = async () => {
      setLoading(true);
      try {
        const convRes = await fetchAPI('/conversaciones', {
          method: 'POST',
          body: JSON.stringify({ comercioId })
        });
        setConversacion(convRes);

        // Unirse a la sala de Socket
        socketClient.emit('join_conversation', convRes._id);

        // Cargar historial de mensajes
        const data = await fetchAPI(`/conversaciones/${convRes._id}/mensajes`);
        setMensajes(data.mensajes || []);
      } catch (err) {
        console.error('Error inicializando chat:', err);
      } finally {
        setLoading(false);
      }
    };

    initChat();

    // Escuchar mensajes entrantes en tiempo real
    socketClient.on('receive_message', (msg: Mensaje) => {
      setMensajes((prev) => {
        // Evitar duplicados si ya está por ID temporal
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
      scrollToBottom();
    });

    return () => {
      if (socketClient) {
        socketClient.disconnect();
      }
    };
  }, [isOpen, comercioId]);

  useEffect(() => {
    scrollToBottom();
  }, [mensajes]);

  const handleEnviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoMensaje.trim() || !conversacion) return;

    const contenido = nuevoMensaje.trim();
    setNuevoMensaje('');

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Debes iniciar sesión para enviar mensajes al comerciante.');
      return;
    }

    try {
      if (socket && socket.connected) {
        // Enviar por WebSocket
        socket.emit('send_message', {
          conversacionId: conversacion._id,
          emisorId: currentUser?._id,
          contenido
        });
      } else {
        // Fallback REST
        const guardado = await fetchAPI(`/conversaciones/${conversacion._id}/mensajes`, {
          method: 'POST',
          body: JSON.stringify({ contenido })
        });
        setMensajes((prev) => [...prev, guardado]);
      }
    } catch (err: any) {
      alert('Error enviando mensaje: ' + err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 max-w-[calc(100vw-2rem)] h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-5">
      {/* Header del Chat */}
      <div className="bg-blue-600 text-white p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-bold">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm leading-tight">{comercioNombre}</h3>
            <span className="text-[11px] text-blue-100 flex items-center">
              <span className="w-2 h-2 rounded-full bg-green-400 inline-block mr-1.5 animate-pulse"></span>
              En línea vía WebSockets
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-white/20 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Historial de Mensajes */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50">
        {loading ? (
          <div className="flex items-center justify-center h-full text-xs text-gray-400">
            Conectando con la vidriera...
          </div>
        ) : mensajes.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-xs font-semibold">Inicia tu conversación</p>
            <p className="text-[11px] text-gray-400 mt-1 max-w-[200px] mx-auto">
              Pregunta por disponibilidad de stock, precios por mayor o envíos.
            </p>
          </div>
        ) : (
          mensajes.map((m, idx) => {
            const emisorId = typeof m.emisorId === 'object' ? m.emisorId?._id : m.emisorId;
            const esMio = currentUser?._id && emisorId === currentUser._id;
            const emisorNombre = typeof m.emisorId === 'object' ? m.emisorId?.nombre : 'Usuario';

            return (
              <div
                key={m._id || idx}
                className={`flex flex-col ${esMio ? 'items-end' : 'items-start'}`}
              >
                {!esMio && (
                  <span className="text-[10px] text-gray-500 mb-0.5 ml-1 font-semibold">
                    {emisorNombre}
                  </span>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm shadow-xs ${
                    esMio
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{m.contenido}</p>
                  <span
                    className={`text-[9px] block text-right mt-1 ${
                      esMio ? 'text-blue-100' : 'text-gray-400'
                    }`}
                  >
                    {m.createdAt
                      ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : 'Reciente'}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input de Envío */}
      <form onSubmit={handleEnviar} className="p-3 bg-white border-t border-gray-200 flex items-center space-x-2">
        <input
          type="text"
          placeholder="Escribe un mensaje al comerciante..."
          value={nuevoMensaje}
          onChange={(e) => setNuevoMensaje(e.target.value)}
          className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!nuevoMensaje.trim()}
          className="p-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl shadow-xs transition-colors flex items-center justify-center"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
