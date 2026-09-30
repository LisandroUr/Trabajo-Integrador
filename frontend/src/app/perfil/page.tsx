'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { User, Camera, Mail, Phone, Lock, Save, ArrowLeft } from 'lucide-react';
import { fetchAPI } from '@/lib/api';
import { toast } from 'sonner';
import { procesarImagenWebP } from '@/lib/imageUtils';
import Link from 'next/link';

export default function MiPerfilPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [fotoPerfil, setFotoPerfil] = useState<string | null>(null);
  const [userRole, setUserRole] = useState('Usuario');

  useEffect(() => {
    const userStored = localStorage.getItem('user');
    if (userStored) {
      try {
        const u = JSON.parse(userStored);
        setNombre(u.nombre || '');
        setEmail(u.email || '');
        setTelefono(u.telefono || '');
        setFotoPerfil(u.fotoPerfil || null);
        setUserRole(u.roles?.[0] || 'Usuario');
      } catch (e) {
        console.error('Error parsing user data', e);
      }
    } else {
      router.replace('/login');
    }
  }, [router]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const webp = await procesarImagenWebP(file);
        setFotoPerfil(webp);
        toast.success('Foto procesada, recuerda guardar los cambios');
      } catch (err: any) {
        toast.error(err.message || 'Error al procesar la imagen');
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: any = { nombre, email };
      if (telefono) payload.telefono = telefono;
      if (fotoPerfil) payload.fotoPerfil = fotoPerfil;
      if (password) payload.password = password;

      const res = await fetchAPI('/auth/perfil', {
        method: 'PUT',
        body: JSON.stringify(payload)
      });

      // Update local storage
      const userStored = localStorage.getItem('user');
      if (userStored) {
        const u = JSON.parse(userStored);
        const updatedUser = { ...u, ...res };
        // Clean password from local storage just in case
        delete updatedUser.password;
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Dispatch custom event so Navbar updates automatically
        window.dispatchEvent(new Event('auth-change'));
      }

      toast.success('Perfil actualizado correctamente');
      setPassword(''); // Clear password field after save
    } catch (err: any) {
      toast.error('Error al actualizar: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center space-x-2 text-sm font-semibold text-gray-500 hover:text-[#38bdf8] transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al inicio</span>
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 sm:p-10 border-b border-gray-100 bg-white flex flex-col sm:flex-row items-center gap-6">
            
            <div className="relative group">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100 flex items-center justify-center text-[#38bdf8]">
                {fotoPerfil ? (
                  <img src={fotoPerfil} alt="Perfil" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12" />
                )}
              </div>
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2.5 bg-[#38bdf8] hover:bg-[#0ea5e9] text-white rounded-full shadow-md transition-transform hover:scale-105"
              >
                <Camera className="w-5 h-5" />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </div>

            <div className="text-center sm:text-left flex-1">
              <h1 className="text-2xl font-black text-gray-900">{nombre || 'Mi Perfil'}</h1>
              <span className="inline-flex items-center px-3 py-1 mt-2 rounded-full text-xs font-bold bg-sky-50 text-[#0284c7] uppercase tracking-wider">
                {userRole}
              </span>
            </div>
          </div>

          <form onSubmit={handleSave} className="p-6 sm:p-10 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Nombre Completo</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={nombre}
                    onChange={e => setNombre(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#38bdf8]/20 focus:border-[#38bdf8] transition-all outline-none"
                    placeholder="Tu nombre"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Correo Electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#38bdf8]/20 focus:border-[#38bdf8] transition-all outline-none"
                    placeholder="correo@ejemplo.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Teléfono (Opcional)</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    value={telefono}
                    onChange={e => setTelefono(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#38bdf8]/20 focus:border-[#38bdf8] transition-all outline-none"
                    placeholder="Ej: 291 1234567"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Nueva Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#38bdf8]/20 focus:border-[#38bdf8] transition-all outline-none"
                    placeholder="Dejar en blanco para no cambiar"
                  />
                </div>
              </div>

            </div>

            <div className="pt-6 border-t border-gray-100 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-[#38bdf8] hover:bg-[#0ea5e9] text-white font-bold rounded-xl shadow-sm transition-all hover:shadow-md disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Save className="w-5 h-5" />
                )}
                <span>Guardar Cambios</span>
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
