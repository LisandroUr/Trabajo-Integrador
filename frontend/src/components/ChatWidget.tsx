'use client';

import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { fetchAPI } from '@/lib/api';
import { 
  MessageSquare, 
  Send, 
  X, 
  User, 
  Store, 
  Clock, 
  CheckCheck,
  Sparkles,
  ShieldCheck
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

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5001';
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

        const msgRes = await fetchAPI(`/conversaciones/${convRes._id}/mensajes`);
        setMensajes(msgRes.mensajes || []);
      } catch (err: any) {
        console.error('Error inicializando chat:', err);
        toast.error('Inicia sesión para chatear con el comerciante');
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
      socketClient.disconnect();
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

    try {
      if (socket && socket.connected) {
        socket.emit('send_message', {
          conversacionId: conversacion._id,
          emisorId: currentUser?._id,
          contenido
        });
      } else {
        const res = await fetchAPI(`/conversaciones/${conversacion._id}/mensajes`, {
          method: 'POST',
          body: JSON.stringify({ contenido })
        });
        setMensajes((prev) => [...prev, res]);
      }
    } catch (err: any) {
      toast.error('Error enviando mensaje: ' + err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-full max-w-[390px] h-[540px] bg-slate-950/95 border border-white/15 rounded-3xl shadow-2xl backdrop-blur-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
      {/* Header */}
      <div className="px-5 py-4 bg-gradient-to-r from-slate-900 to-indigo-950 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-md shadow-indigo-600/30">
              <Store className="w-5 h-5" />
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-950 rounded-full"></span>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white max-w-[180px] truncate">
              {comercioNombre}
            </h4>
            <div className="flex items-center space-x-1.5 text-[10px] text-emerald-400 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Canal directo en vivo</span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-950/40">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2"></div>
            <span>Conectando sala segura...</span>
          </div>
        ) : mensajes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 text-center px-6">
            <Sparkles className="w-8 h-8 text-indigo-400 mb-2 stroke-[1.5]" />
            <p className="text-xs font-bold text-white">Haz una consulta al comerciante</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Pregunta por disponibilidad de stock, medios de pago o reservas de productos.
            </p>
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
                <span className="text-[9px] text-slate-500 mb-1 px-1 font-medium">
                  {esMio ? 'Tú' : nombreEmisor}
                </span>
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-sm ${
                    esMio
                      ? 'bg-indigo-600 text-white rounded-br-xs'
                      : 'bg-slate-800 text-slate-200 border border-white/5 rounded-bl-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{m.contenido}</p>
                  <div className="text-[9px] flex items-center justify-end space-x-1 mt-1 font-medium text-slate-400">
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

      {/* Input Bar */}
      <form onSubmit={handleEnviar} className="p-3 border-t border-white/10 bg-slate-900/90 flex items-center space-x-2">
        <input
          type="text"
          placeholder="Escribe tu mensaje..."
          value={nuevoMensaje}
          onChange={(e) => setNuevoMensaje(e.target.value)}
          className="flex-1 px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
        />
        <button
          type="submit"
          disabled={!nuevoMensaje.trim()}
          className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
