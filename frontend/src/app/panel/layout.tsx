'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
      router.push('/login');
      return;
    }
    setUserName(JSON.parse(userStr).nombre);
    setIsAuthenticated(true);
  }, [router]);

  if (!isAuthenticated) return <div className="min-h-screen flex items-center justify-center">Cargando perfil...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-indigo-700 text-white p-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Mi Vidriera (Comerciante)</h1>
          <div className="flex items-center space-x-6">
            <span className="text-sm text-indigo-200 hidden sm:inline-block">Hola, {userName}</span>
            <Link href="/panel" className="hover:text-indigo-200 font-medium">Mis Tiendas</Link>
            <button 
              onClick={() => { localStorage.clear(); router.push('/login'); }} 
              className="text-red-300 hover:text-red-100 font-semibold border-l pl-4 border-indigo-500"
            >
              Salir
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
