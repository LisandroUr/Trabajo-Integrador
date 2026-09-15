import './globals.css';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import { Toaster } from 'sonner';
import { Shield, Building, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Vidriera Digital Municipal | Observatorio de Precios y Comercio Cívico',
  description: 'Plataforma oficial de transparencia comercial. Relevamiento estadístico de precios, geolocalización de comercios barriales y mensajería en tiempo real.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <head>
        <link 
          rel="stylesheet" 
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" 
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" 
          crossOrigin="" 
        />
      </head>
      <body className="font-sans antialiased min-h-screen bg-[#12151b] text-[#d5d9e0] flex flex-col selection:bg-[#2e3a4e] selection:text-[#e6e9ee]">
        <Toaster position="top-right" theme="dark" richColors closeButton />
        
        <Navbar />
        <main className="flex-1 w-full">
          {children}
        </main>
        
        <footer className="border-t border-[#232833] bg-[#151820] py-12 mt-20 text-xs text-[#8d94a1]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
              <div className="md:col-span-2 space-y-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#242b37] border border-[#343e4f] flex items-center justify-center text-[#9cb1ce]">
                    <Shield className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-semibold tracking-tight text-[#e2e5eb]">
                    Vidriera Digital Municipal
                  </span>
                </div>
                <p className="text-[#8d94a1] text-xs max-w-sm leading-relaxed">
                  Sistema institucional de fomento al comercio barrial y relevamiento continuo de la canasta local en Bahía Blanca.
                </p>
                <div className="inline-flex items-center space-x-2 text-[11px] text-[#8bb59b] bg-[#1e2a23] border border-[#2b3e34] px-3 py-1 rounded-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5a8a6e]"></span>
                  <span>Servicio de Datos Abiertos Activo</span>
                </div>
              </div>

              <div>
                <h4 className="text-[11px] font-semibold text-[#c8cdd6] uppercase tracking-wider mb-3">Módulos Ciudadanos</h4>
                <ul className="space-y-2 text-[#8d94a1]">
                  <li><Link href="/ranking" className="hover:text-[#c8cdd6] transition-colors">Observatorio de Precios</Link></li>
                  <li><Link href="/mapa" className="hover:text-[#c8cdd6] transition-colors">Mapa de Comercios</Link></li>
                  <li><Link href="/buscar" className="hover:text-[#c8cdd6] transition-colors">Directorio de Vidrieras</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="text-[11px] font-semibold text-[#c8cdd6] uppercase tracking-wider mb-3">Área Comercial</h4>
                <ul className="space-y-2 text-[#8d94a1]">
                  <li><Link href="/login" className="hover:text-[#c8cdd6] transition-colors">Ingreso a Panel</Link></li>
                  <li><Link href="/registro" className="hover:text-[#c8cdd6] transition-colors">Solicitar Registro de Local</Link></li>
                  <li><Link href="/backoffice" className="hover:text-[#c8cdd6] transition-colors">Auditoría Municipal</Link></li>
                </ul>
              </div>
            </div>

            <div className="pt-8 border-t border-[#232833] flex flex-col sm:flex-row justify-between items-center gap-3 text-[11px] text-[#6b7280]">
              <p>© 2026 Municipalidad de Bahía Blanca. Trabajo Final Integrador (TFI).</p>
              <p>Desarrollo académico orientado a soberanía de datos y compre local.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
