'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function BackofficeLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
      router.push('/login');
      return;
    }

    const user = JSON.parse(userStr);
    // Verificar si tiene roles que denotan administración
    if (user.roles && (user.roles.includes('superadmin') || user.roles.includes('moderador'))) {
      setIsAuthorized(true);
    } else {
      router.push('/panel');
    }
  }, [router]);

  if (!isAuthorized) return <div className="min-h-screen flex items-center justify-center">Verificando acceso...</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <nav className="bg-blue-800 text-white p-4 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Vidriera Municipal - Backoffice</h1>
          <div className="space-x-6">
            <Link href="/backoffice" className="hover:text-blue-200">Comercios Pendientes</Link>
            <Link href="/backoffice/categorias" className="hover:text-blue-200">Categorías</Link>
            <button 
              onClick={() => { localStorage.clear(); router.push('/login'); }} 
              className="text-red-300 hover:text-red-100 font-semibold ml-4 border-l pl-4 border-blue-600"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </nav>
      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        {children}
      </main>
    </div>
  );
}
