import { Landmark } from 'lucide-react';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50/50">
      <div className="max-w-md w-full">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform">
              <Landmark className="w-5 h-5" />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tight">
              Vidriera<span className="text-indigo-600">Digital</span>
            </span>
          </Link>
          <div className="mt-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Plataforma Cívica Municipal
          </div>
        </div>

        {/* Auth Glass Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/80 p-8 sm:p-10">
          {children}
        </div>

        <div className="text-center mt-8 text-xs text-slate-400">
          Protegido por protocolos de autenticación y cifrado seguro SSL/TLS.
        </div>
      </div>
    </div>
  );
}
