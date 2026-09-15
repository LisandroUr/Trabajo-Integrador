'use client';

import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { fetchAPI } from '@/lib/api';
import { 
  MessageSquare, 
  Send, 
  X, 
  Store, 
  CheckCheck,
  Sparkles
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
    <div className="fixed bottom-6 right-6 z-50 w-full max-w-[380px] h-[520px] bg-[#171b22] border border-[#262d3a] rounded-2xl shadow-xl flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-[#14181f] border-b border-[#262d3a] flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="relative">
            <div className="w-8 h-8 rounded-lg bg-[#1d222b] border border-[#262d3a] text-[#7dafb5] font-bold flex items-center justify-center text-xs">
              <Store className="w-4 h-4" />
            </div>
            <span className="absolute bottom-0 right-0 w-2 h-2 bg-[#4a7c59] border border-[#14181f] rounded-full"></span>
          </div>

          <div>
            <h4 className="text-xs font-bold text-[#d5d9e0] max-w-[190px] truncate">
              {comercioNombre}
            </h4>
            <div className="flex items-center space-x-1 text-[10px] text-[#8bb59b] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4a7c59]"></span>
              <span>Canal directo en vivo</span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg text-[#8d94a1] hover:text-[#d5d9e0] hover:bg-[#1d222b] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#12151b]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full text-[#8d94a1] text-xs">
            <div className="w-5 h-5 border-2 border-[#4b6cb7] border-t-transparent rounded-full animate-spin mb-2"></div>
            <span>Conectando sala segura...</span>
          </div>
        ) : mensajes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-[#8d94a1] text-center px-4">
            <Sparkles className="w-7 h-7 text-[#7dafb5] mb-2 stroke-[1.5]" />
            <p className="text-xs font-bold text-[#d5d9e0]">Haz una consulta al comerciante</p>
            <p className="text-[11px] text-[#8d94a1] mt-1">
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
                <span className="text-[9px] text-[#8d94a1] mb-0.5 px-1 font-medium">
                  {esMio ? 'Tú' : nombreEmisor}
                </span>
                <div
                  className={`max-w-[80%] rounded-xl px-3 py-2 text-xs leading-relaxed shadow-xs ${
                    esMio
                      ? 'bg-[#2a374a] text-[#d5d9e0] border border-[#3b4c66]'
                      : 'bg-[#1d222b] text-[#d5d9e0] border border-[#262d3a]'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{m.contenido}</p>
                  <div className="text-[9px] flex items-center justify-end space-x-1 mt-1 font-medium text-[#8d94a1]">
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

      {/* Input Bar */}
      <form onSubmit={handleEnviar} className="p-3 border-t border-[#262d3a] bg-[#14181f] flex items-center space-x-2">
        <input
          type="text"
          placeholder="Escribe tu mensaje..."
          value={nuevoMensaje}
          onChange={(e) => setNuevoMensaje(e.target.value)}
          className="flex-1 px-3 py-2 bg-[#12151b] border border-[#262d3a] rounded-xl text-xs text-[#d5d9e0] placeholder:text-[#8d94a1]/50 focus:outline-none focus:border-[#4b6cb7]"
        />
        <button
          type="submit"
          disabled={!nuevoMensaje.trim()}
          className="p-2 rounded-xl bg-[#4b6cb7] hover:bg-[#3d5a99] disabled:opacity-40 text-[#d5d9e0] transition-colors flex items-center justify-center"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
