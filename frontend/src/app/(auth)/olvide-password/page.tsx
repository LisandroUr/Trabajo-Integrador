'use client';

import { useState } from 'react';
import { fetchAPI } from '@/lib/api';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Mail, Key, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function OlvidePasswordPage() {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [paso, setPaso] = useState<1 | 2>(1);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSolicitar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetchAPI('/auth/olvide-password', {
        method: 'POST',
        body: JSON.stringify({ email })
      });
      setMensaje(res.message);
      if (res.tokenTemporal) {
        setToken(res.tokenTemporal);
      }
      setPaso(2);
      toast.success('Token de seguridad generado');
    } catch (err: any) {
      setError(err.message || 'Error al procesar la solicitud');
      toast.error(err.message || 'Error al solicitar token');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetchAPI('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, nuevaPassword })
      });
      toast.success(res.message || 'Contraseña restablecida con éxito');
      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Error al restablecer la contraseña');
      toast.error(err.message || 'Error al restablecer clave');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-[#d5d9e0] tracking-tight">Recuperar Acceso</h2>
        <p className="mt-1 text-xs text-[#8d94a1]">
          {paso === 1
            ? 'Ingresa tu correo para recibir un token de restablecimiento seguro.'
            : 'Ingresa el token recibido y define tu nueva contraseña.'}
        </p>
      </div>

      {error && (
        <div className="badge-wine p-3 rounded-xl text-xs font-semibold mb-4 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-[#d48a97]" />
          <span>{error}</span>
        </div>
      )}

      {mensaje && (
        <div className="badge-sage p-3 rounded-xl text-xs font-semibold mb-4 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-[#8bb59b]" />
          <span>{mensaje}</span>
        </div>
      )}

      {paso === 1 ? (
        <form onSubmit={handleSolicitar} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#8d94a1] uppercase tracking-wider mb-1">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8d94a1]" />
              <input
                type="email"
                required
                placeholder="tu-correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#12151b] border border-[#262d3a] rounded-xl text-xs text-[#d5d9e0] placeholder:text-[#8d94a1]/50 focus:outline-none focus:border-[#4b6cb7] transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-[#4b6cb7] hover:bg-[#3d5a99] text-[#d5d9e0] text-xs font-semibold transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generando token seguro...</span>
              </>
            ) : (
              <span>Solicitar Código de Recuperación</span>
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#8d94a1] uppercase tracking-wider mb-1">
              Token de Seguridad
            </label>
            <div className="relative">
              <Key className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8d94a1]" />
              <input
                type="text"
                required
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Código recibido"
                className="w-full pl-10 pr-4 py-2.5 bg-[#12151b] border border-[#262d3a] rounded-xl text-xs text-[#d5d9e0] font-mono focus:outline-none focus:border-[#4b6cb7] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8d94a1] uppercase tracking-wider mb-1">
              Nueva Contraseña
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8d94a1]" />
              <input
                type="password"
                required
                minLength={6}
                placeholder="Mínimo 6 caracteres"
                value={nuevaPassword}
                onChange={(e) => setNuevaPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#12151b] border border-[#262d3a] rounded-xl text-xs text-[#d5d9e0] focus:outline-none focus:border-[#4b6cb7] transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-[#4a7c59] hover:bg-[#3d664a] text-[#d5d9e0] text-xs font-semibold transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Actualizando contraseña...</span>
              </>
            ) : (
              <span>Restablecer Contraseña</span>
            )}
          </button>
        </form>
      )}

      <div className="pt-5 mt-5 border-t border-[#262d3a] text-center">
        <Link 
          href="/login" 
          className="inline-flex items-center space-x-1.5 text-xs text-[#8d94a1] hover:text-[#d5d9e0] font-semibold transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver a Iniciar Sesión</span>
        </Link>
      </div>
    </div>
  );
}
