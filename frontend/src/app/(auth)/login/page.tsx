'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchDjangoAPI } from '@/lib/api';
import Link from 'next/link';
import { Mail, Lock, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await fetchDjangoAPI('/login/', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      window.dispatchEvent(new Event('auth-change'));
      toast.success(`Bienvenido de nuevo, ${data.nombre}`);

      if (data.roles.includes('superadmin') || data.roles.includes('moderador')) {
        router.push('/backoffice');
      } else if (data.roles.includes('comerciante')) {
        router.push('/panel');
      } else {
        router.push('/mis-consultas');
      }
    } catch (err: any) {
      setError(err.message || 'Credenciales inválidas');
      toast.error('Error de autenticación: ' + (err.message || 'Verifica tus datos'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-slate-700 tracking-tight">Iniciar Sesión</h2>
        <p className="mt-1 text-xs text-slate-500">
          Ingresa a tu panel comercial, auditoría o cuenta vecinal
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
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                id="email-address"
                name="email"
                type="email"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-[#f0f6fa] border border-slate-200 rounded-xl text-xs text-slate-700 placeholder:text-slate-500/50 focus:outline-none focus:border-sky-500 transition-colors"
                placeholder="ejemplo@municipio.gob.ar"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Contraseña
              </label>
              <Link href="/olvide-password" className="text-[11px] text-[#7dafb5] hover:underline font-medium">
                ¿Olvidaste tu clave?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-[#f0f6fa] border border-slate-200 rounded-xl text-xs text-slate-700 placeholder:text-slate-500/50 focus:outline-none focus:border-sky-500 transition-colors"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-2.5 px-4 rounded-xl bg-[#4b6cb7] hover:bg-[#3d5a99] text-slate-700 text-xs font-semibold transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verificando credenciales...</span>
            </>
          ) : (
            <>
              <span>Ingresar a la Plataforma</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <div className="pt-4 border-t border-slate-200 text-center">
          <p className="text-xs text-slate-500">
            ¿No posees una cuenta registrada?{' '}
            <Link href="/registro" className="text-[#7dafb5] font-semibold hover:underline">
              Crea tu vidriera aquí
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
