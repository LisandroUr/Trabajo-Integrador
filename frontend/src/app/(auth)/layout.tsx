import { ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none -z-10"></div>

      <div className="max-w-md w-full">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-xl font-black text-white tracking-tight">
              Vidriera<span className="text-indigo-400">Digital</span>
            </span>
          </Link>
          <div className="mt-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Municipio de Bahía Blanca • Acceso Ciudadano
          </div>
        </div>

        {/* Auth Glass Card */}
        <div className="bg-slate-900/80 rounded-3xl shadow-2xl border border-white/10 p-8 sm:p-10 backdrop-blur-2xl">
          {children}
        </div>

        <div className="text-center mt-6 text-xs text-slate-500 font-medium">
          Acceso autenticado y protegido por protocolos de seguridad municipal.
        </div>
      </div>
    </div>
  );
}
