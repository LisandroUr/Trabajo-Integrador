'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchAPI } from '@/lib/api';
import Link from 'next/link';
import { User, Mail, Lock, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';

export default function RegistroPage() {
  const router = useRouter();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await fetchAPI('/auth/registro', {
        method: 'POST',
        body: JSON.stringify({ nombre, email, password }),
      });

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));

      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch {}

      toast.success('Cuenta creada exitosamente');
      router.push('/panel');
    } catch (err: any) {
      setError(err.message || 'Error al procesar el registro');
      toast.error('Error al registrar cuenta: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-[#d5d9e0] tracking-tight">Crear Cuenta</h2>
        <p className="mt-1 text-xs text-[#8d94a1]">
          Únete a la red cívica comercial y publica tus productos
        </p>
      </div>
      
      <form className="space-y-4" onSubmit={handleSubmit}>
        {error && (
          <div className="badge-wine p-3 rounded-xl text-xs font-semibold flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-[#d48a97]" />
            <span>{error}</span>
          </div>
        )}
        
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-[#8d94a1] uppercase tracking-wider mb-1">
              Nombre Completo o Razón Social
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8d94a1]" />
              <input
                name="nombre"
                type="text"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-[#12151b] border border-[#262d3a] rounded-xl text-xs text-[#d5d9e0] placeholder:text-[#8d94a1]/50 focus:outline-none focus:border-[#4b6cb7] transition-colors"
                placeholder="Juan Pérez o Panadería Central"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8d94a1] uppercase tracking-wider mb-1">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8d94a1]" />
              <input
                name="email"
                type="email"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-[#12151b] border border-[#262d3a] rounded-xl text-xs text-[#d5d9e0] placeholder:text-[#8d94a1]/50 focus:outline-none focus:border-[#4b6cb7] transition-colors"
                placeholder="tu-correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8d94a1] uppercase tracking-wider mb-1">
              Contraseña de Acceso
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8d94a1]" />
              <input
                name="password"
                type="password"
                required
                minLength={6}
                className="w-full pl-10 pr-4 py-2.5 bg-[#12151b] border border-[#262d3a] rounded-xl text-xs text-[#d5d9e0] placeholder:text-[#8d94a1]/50 focus:outline-none focus:border-[#4b6cb7] transition-colors"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-2.5 px-4 rounded-xl bg-[#4b6cb7] hover:bg-[#3d5a99] text-[#d5d9e0] text-xs font-semibold transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Registrando datos...</span>
            </>
          ) : (
            <>
              <span>Completar Registro</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
        
        <div className="pt-4 border-t border-[#262d3a] text-center">
          <p className="text-xs text-[#8d94a1]">
            ¿Ya tienes una cuenta activa?{' '}
            <Link href="/login" className="text-[#7dafb5] font-semibold hover:underline">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
