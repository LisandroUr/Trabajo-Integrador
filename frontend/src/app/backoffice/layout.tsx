'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

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

    try {
      const user = JSON.parse(userStr);
      if (user.roles && (user.roles.includes('superadmin') || user.roles.includes('moderador'))) {
        setIsAuthorized(true);
      } else {
        router.push('/panel');
      }
    } catch {
      router.push('/login');
    }
  }, [router]);

  if (!isAuthorized) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Verificando credenciales de auditoría municipal...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      <main className="w-full">
        {children}
      </main>
    </div>
  );
}
