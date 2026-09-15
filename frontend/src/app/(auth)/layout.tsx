import { ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-md w-full">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-[#1d222b] border border-[#262d3a] text-[#7dafb5] flex items-center justify-center transition-colors">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-xl font-extrabold text-[#d5d9e0] tracking-tight">
              Vidriera<span className="text-[#7dafb5]">Digital</span>
            </span>
          </Link>
          <div className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-[#8d94a1]">
            Municipio de Bahía Blanca • Acceso Ciudadano
          </div>
        </div>

        {/* Auth Graphite Card */}
        <div className="bg-[#171b22] rounded-2xl shadow-sm border border-[#262d3a] p-7 sm:p-9">
          {children}
        </div>

        <div className="text-center mt-6 text-xs text-[#8d94a1] font-normal">
          Acceso autenticado y protegido por protocolos de seguridad municipal.
        </div>
      </div>
    </div>
  );
}
