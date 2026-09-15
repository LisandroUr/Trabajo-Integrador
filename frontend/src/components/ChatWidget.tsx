'use client';

import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { fetchAPI } from '@/lib/api';
import { MessageSquare, Send, X, Store, CheckCheck, Sparkles, ShieldCheck } from 'lucide-react';

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

    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch {
        setCurrentUser(null);
      }
    }

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
    const socketClient = io(socketUrl, {
      transports: ['websocket', 'polling']
    });

    setSocket(socketClient);

    const initChat = async () => {
      setLoading(true);
      try {
        const convRes = await fetchAPI('/conversaciones', {
          method: 'POST',
          body: JSON.stringify({ comercioId })
        });
        setConversacion(convRes);

        socketClient.emit('join_conversation', convRes._id);

        const data = await fetchAPI(`/conversaciones/${convRes._id}/mensajes`);
        setMensajes(data.mensajes || []);
      } catch (err) {
        console.error('Error inicializando chat:', err);
      } finally {
        setLoading(false);
      }
    };

    initChat();

    socketClient.on('receive_message', (msg: Mensaje) => {
      setMensajes((prev) => {
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
      alert('Debes iniciar sesión con tu cuenta para enviar mensajes al comercio.');
      return;
    }

    try {
      if (socket && socket.connected) {
        socket.emit('send_message', {
          conversacionId: conversacion._id,
          emisorId: currentUser?._id,
          contenido
        });
      } else {
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
    <div className="fixed bottom-5 right-5 w-96 max-w-[calc(100vw-2.5rem)] h-[520px] bg-white rounded-2xl shadow-2xl border border-slate-200/90 flex flex-col z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
      {/* Top Header */}
      <div className="bg-slate-900 text-white px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200">
              <Store className="w-4 h-4" />
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-900"></span>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h3 className="font-bold text-xs text-white leading-tight">{comercioNombre}</h3>
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <span className="text-[10px] text-slate-400 font-medium">Canal de atención directa</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          aria-label="Cerrar chat"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Message Stream */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/70">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full text-xs text-slate-400 space-y-2">
            <div className="w-5 h-5 border-2 border-slate-300 border-t-indigo-600 rounded-full animate-spin"></div>
            <span>Conectando con el comercio...</span>
          </div>
        ) : mensajes.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto mb-3">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-800">Inicia tu consulta</h4>
            <p className="text-[11px] text-slate-500 mt-1 max-w-[200px] mx-auto leading-relaxed">
              Pregunta por disponibilidad de productos, formas de pago o envíos a domicilio.
            </p>
          </div>
        ) : (
          mensajes.map((m, idx) => {
            const emisorId = typeof m.emisorId === 'object' ? m.emisorId?._id : m.emisorId;
            const esMio = currentUser?._id && emisorId === currentUser._id;
            const emisorNombre = typeof m.emisorId === 'object' ? m.emisorId?.nombre : 'Comercio';

            return (
              <div
                key={m._id || idx}
                className={`flex flex-col ${esMio ? 'items-end' : 'items-start'}`}
              >
                {!esMio && (
                  <span className="text-[10px] font-semibold text-slate-500 mb-1 ml-1">
                    {emisorNombre}
                  </span>
                )}
                <div
                  className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-2xs ${
                    esMio
                      ? 'bg-slate-900 text-white rounded-br-xs'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{m.contenido}</p>
                  <span
                    className={`text-[9px] block text-right mt-1 font-medium ${
                      esMio ? 'text-slate-400' : 'text-slate-400'
                    }`}
                  >
                    {m.createdAt
                      ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : 'Ahora'}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Box */}
      <form onSubmit={handleEnviar} className="p-3 bg-white border-t border-slate-200/80 flex items-center space-x-2">
        <input
          type="text"
          placeholder="Escribe un mensaje..."
          value={nuevoMensaje}
          onChange={(e) => setNuevoMensaje(e.target.value)}
          className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 focus:outline-none transition-all"
        />
        <button
          type="submit"
          disabled={!nuevoMensaje.trim()}
          className="p-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-xl shadow-xs transition-colors flex items-center justify-center flex-shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
