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
  Sparkles,
  User,
  Phone,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Loader2
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
  comercioTelefono?: string;
  productoNombre?: string;
  productoPrecio?: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatWidget({
  comercioId,
  comercioNombre,
  comercioTelefono,
  productoNombre,
  productoPrecio,
  isOpen,
  onClose
}: ChatWidgetProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [conversacion, setConversacion] = useState<any>(null);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fix 4: ref para trackear el socket activo y cancelarlo en cleanup
  const socketRef = useRef<Socket | null>(null);

  // Quick Guest Pass State
  const [nombreGuest, setNombreGuest] = useState('');
  const [contactoGuest, setContactoGuest] = useState('');
  const [enviandoGuest, setEnviandoGuest] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!isOpen) return;

    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      try {
        const parsed = JSON.parse(storedUser);
        setCurrentUser(parsed);
        setupChat(parsed, storedToken);
      } catch {
        setCurrentUser(null);
      }
    } else {
      setCurrentUser(null);
    }

    // Fix 4: cleanup al cerrar el widget o cambiar comercio
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [isOpen, comercioId]);

  // Fix 4: setupChat recibe el token para enviarlo en el handshake del socket
  const setupChat = async (userObj: any, token?: string) => {
    // Fix 4: desconectar socket previo antes de crear uno nuevo
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    const storedToken = token || localStorage.getItem('token') || '';
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5001';

    // Fix 2 (cliente): enviar el token JWT en el handshake del socket
    const socketClient = io(socketUrl, {
      transports: ['websocket', 'polling'],
      auth: { token: storedToken }
    });

    socketRef.current = socketClient;
    setSocket(socketClient);
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
      console.error('Error inicializando conversación:', err);
      toast.error('No se pudo abrir la sala de chat');
    } finally {
      setLoading(false);
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

  // Manejo de Acceso Rápido Vecinal
  const handleAccesoRapido = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreGuest.trim()) {
      toast.error('Por favor ingresa tu nombre');
      return;
    }

    setEnviandoGuest(true);
    try {
      const res = await fetchAPI('/auth/registro-rapido', {
        method: 'POST',
        body: JSON.stringify({
          nombre: nombreGuest.trim(),
          contacto: contactoGuest.trim()
        })
      });

      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res));
      window.dispatchEvent(new Event('auth-change'));
      
      setCurrentUser(res);
      toast.success(`Identificado como ${res.nombre}`);
      await setupChat(res, res.token);
    } catch (err: any) {
      toast.error(err.message || 'Error al iniciar identificación');
    } finally {
      setEnviandoGuest(false);
    }
  };

  const handleEnviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoMensaje.trim() || !conversacion) return;

    const contenido = nuevoMensaje.trim();
    setNuevoMensaje('');

    try {
      if (socketRef.current && socketRef.current.connected) {
        // Fix 2 (cliente): ya no enviamos emisorId, el servidor lo extrae del token
        socketRef.current.emit('send_message', {
          conversacionId: conversacion._id,
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

  // Formatear enlace de WhatsApp directo
  const rawTel = comercioTelefono ? comercioTelefono.replace(/\D/g, '') : '';
  const waNumber = rawTel ? (rawTel.startsWith('54') ? rawTel : `549${rawTel}`) : '';
  const waText = productoNombre
    ? `Hola ${comercioNombre}, vi su publicación de "${productoNombre}"${productoPrecio ? ` ($${productoPrecio.toLocaleString('es-AR')})` : ''} en el Observatorio de Precios. ¿Tienen disponibilidad?`
    : `Hola ${comercioNombre}, los contacto a través de la Vidriera Comercial. Quería realizarles una consulta:`;
  const waUrl = waNumber ? `https://wa.me/${waNumber}?text=${encodeURIComponent(waText)}` : null;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-full max-w-[400px] h-[540px] bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
      {/* Header */}
      <div className="px-4 py-3 bg-[#f0f6fa] border-b border-slate-200 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-2.5">
          <div className="relative">
            <div className="w-8 h-8 rounded-lg bg-[#1d222b] border border-slate-200 text-[#7dafb5] font-bold flex items-center justify-center text-xs">
              <Store className="w-4 h-4" />
            </div>
            <span className="absolute bottom-0 right-0 w-2 h-2 bg-[#8bb59b] border border-[#14181f] rounded-full"></span>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-800 max-w-[190px] truncate">
              {comercioNombre}
            </h4>
            <div className="flex items-center space-x-1 text-[10px] text-[#8bb59b] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8bb59b]"></span>
              <span>Canal directo municipal</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          {waUrl && (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Abrir WhatsApp directo"
              className="p-1.5 rounded-lg text-[#8bb59b] hover:bg-[#1f2a24] hover:text-[#a1cca9] transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
            </a>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-[#1d222b] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Conditional Body: Quick Guest Pass vs Live Chat */}
      {!currentUser ? (
        <div className="flex-1 p-5 bg-[#f0f6fa] flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-[#1d2330] border border-[#2d384e] text-slate-500 text-[10px] font-medium mb-3">
              <ShieldCheck className="w-3 h-3" />
              <span>Consulta Directa Vecinal</span>
            </div>

            <h3 className="text-sm font-semibold text-slate-800">
              Conecta con {comercioNombre}
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Indica tu nombre para consultar en tiempo real. No necesitas contraseñas complicadas.
            </p>

            {productoNombre && (
              <div className="mt-3 p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium truncate max-w-[200px]">
                  {productoNombre}
                </span>
                {productoPrecio !== undefined && (
                  <span className="text-[#93cca5] font-semibold">
                    ${productoPrecio.toLocaleString('es-AR')}
                  </span>
                )}
              </div>
            )}

            <form onSubmit={handleAccesoRapido} className="mt-4 space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">
                  Tu Nombre
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="Ej. Juan Pérez"
                    value={nombreGuest}
                    onChange={(e) => setNombreGuest(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-[#6b7280] focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">
                  WhatsApp o Correo (Opcional)
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder="291-4567890 o email@correo.com"
                    value={contactoGuest}
                    onChange={(e) => setContactoGuest(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-[#6b7280] focus:outline-none focus:border-sky-500"
                  />
                </div>
                <span className="text-[10px] text-[#6b7280] mt-1 block">
                  Para que el comerciante te responda si cierras la ventana.
                </span>
              </div>

              <button
                type="submit"
                disabled={enviandoGuest || !nombreGuest.trim()}
                className="w-full py-2.5 px-4 rounded-xl bg-[#2c3749] hover:bg-[#36445c] disabled:opacity-50 text-slate-800 border border-[#3e4e69] text-xs font-semibold transition-colors flex items-center justify-center space-x-2 shadow-sm"
              >
                {enviandoGuest ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Conectando...</span>
                  </>
                ) : (
                  <>
                    <span>Iniciar Consulta Web</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* WhatsApp Direct Option */}
          {waUrl && (
            <div className="mt-4 pt-3 border-t border-slate-200">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 px-3 rounded-xl bg-[#192720] hover:bg-[#20332a] border border-[#294234] text-[#93cca5] text-xs font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>O consultar directo por WhatsApp</span>
                <ExternalLink className="w-3 h-3 text-[#74a584]" />
              </a>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Messages Scroll Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#f0f6fa]">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs">
                <Loader2 className="w-5 h-5 text-slate-500 animate-spin mb-2" />
                <span>Conectando sala segura...</span>
              </div>
            ) : mensajes.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 text-center px-4">
                <Sparkles className="w-7 h-7 text-slate-500 mb-2 stroke-[1.5]" />
                <p className="text-xs font-semibold text-slate-800">Haz una consulta al comerciante</p>
                <p className="text-[11px] text-slate-500 mt-1 max-w-[240px]">
                  Pregunta por disponibilidad de stock, medios de pago o reservas de productos.
                </p>
                {waUrl && (
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#192720] border border-[#294234] text-[#93cca5] text-[11px] font-medium hover:bg-[#20332a] transition-colors"
                  >
                    <Phone className="w-3 h-3" />
                    <span>Preguntar por WhatsApp</span>
                  </a>
                )}
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
                    <span className="text-[9px] text-slate-500 mb-0.5 px-1 font-medium">
                      {esMio ? 'Tú' : nombreEmisor}
                    </span>
                    <div
                      className={`max-w-[82%] rounded-xl px-3 py-2 text-xs leading-relaxed shadow-xs ${
                        esMio
                          ? 'bg-[#253347] text-slate-900 border border-[#3b4e6a]'
                          : 'bg-[#1a1f29] text-slate-800 border border-[#262f3e]'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{m.contenido}</p>
                      <div className="text-[9px] flex items-center justify-end space-x-1 mt-1 font-medium text-slate-500">
                        <span>
                          {m.createdAt
                            ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : 'Ahora'}
                        </span>
                        {esMio && <CheckCheck className="w-3 h-3 text-slate-500" />}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <form onSubmit={handleEnviar} className="p-3 border-t border-slate-200 bg-[#f0f6fa] flex items-center space-x-2 flex-shrink-0">
            <input
              type="text"
              placeholder="Escribe tu mensaje..."
              value={nuevoMensaje}
              onChange={(e) => setNuevoMensaje(e.target.value)}
              className="flex-1 px-3 py-2 bg-[#f0f6fa] border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-[#6b7280] focus:outline-none focus:border-sky-500"
            />
            <button
              type="submit"
              disabled={!nuevoMensaje.trim()}
              className="p-2 rounded-xl bg-[#2c3749] hover:bg-[#36445c] disabled:opacity-40 text-slate-800 border border-[#3e4e69] transition-colors flex items-center justify-center shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </>
      )}
    </div>
  );
}
