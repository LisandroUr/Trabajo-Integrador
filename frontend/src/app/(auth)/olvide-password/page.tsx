'use client';

import { useState } from 'react';
import { fetchAPI } from '@/lib/api';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Mail, Key } from 'lucide-react';

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
      alert(res.message || 'Contraseña actualizada con éxito');
      window.location.href = '/login';
    } catch (err: any) {
      setError(err.message || 'Error al restablecer la contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-black text-gray-900">Recuperación de Contraseña</h2>
        <p className="text-xs text-gray-500 mt-1">
          {paso === 1
            ? 'Ingresa tu correo para recibir las instrucciones de reseteo.'
            : 'Ingresa tu nueva contraseña para restablecer tu cuenta.'}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-xl text-xs mb-4">
          {error}
        </div>
      )}

      {mensaje && (
        <div className="bg-green-50 text-green-700 p-3 rounded-xl text-xs mb-4 flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span>{mensaje}</span>
        </div>
      )}

      {paso === 1 ? (
        <form onSubmit={handleSolicitar} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Correo Electrónico</label>
            <input
              type="email"
              required
              placeholder="tu-correo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-xs transition-colors"
          >
            {loading ? 'Enviando...' : 'Solicitar Instrucciones'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Token de Seguridad</label>
            <input
              type="text"
              required
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Nueva Contraseña</label>
            <input
              type="password"
              required
              minLength={6}
              placeholder="Mínimo 6 caracteres"
              value={nuevaPassword}
              onChange={(e) => setNuevaPassword(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-xs shadow-xs transition-colors"
          >
            {loading ? 'Restableciendo...' : 'Guardar Nueva Contraseña'}
          </button>
        </form>
      )}

      <div className="text-center mt-6">
        <Link href="/login" className="text-xs text-blue-600 font-semibold hover:underline flex items-center justify-center space-x-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver al inicio de sesión</span>
        </Link>
      </div>
    </div>
  );
}
