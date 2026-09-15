'use client';

import { useState } from 'react';
import { fetchAPI } from '@/lib/api';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Mail, Key, Lock, AlertCircle, Loader2 } from 'lucide-react';

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
    } catch (err: any) {
      setError(err.message || 'Error al procesar la solicitud');
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
      alert(res.message || 'Contraseña restablecida con éxito');
      window.location.href = '/login';
    } catch (err: any) {
      setError(err.message || 'Error al restablecer la contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Recuperar Acceso</h2>
        <p className="mt-1 text-xs text-slate-500">
          {paso === 1
            ? 'Ingresa tu correo para recibir un token de restablecimiento seguro.'
            : 'Ingresa el token recibido y define tu nueva contraseña.'}
        </p>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-2xl text-xs font-semibold mb-4 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {mensaje && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-2xl text-xs font-semibold mb-4 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
          <span>{mensaje}</span>
        </div>
      )}

      {paso === 1 ? (
        <form onSubmit={handleSolicitar} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                placeholder="tu-correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
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
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Token de Seguridad
            </label>
            <div className="relative">
              <Key className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Código recibido"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Nueva Contraseña
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                minLength={6}
                placeholder="Mínimo 6 caracteres"
                value={nuevaPassword}
                onChange={(e) => setNuevaPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
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

      <div className="pt-6 mt-6 border-t border-slate-100 text-center">
        <Link 
          href="/login" 
          className="inline-flex items-center space-x-1.5 text-xs text-slate-500 hover:text-indigo-600 font-semibold transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver a Iniciar Sesión</span>
        </Link>
      </div>
    </div>
  );
}
