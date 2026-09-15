import './globals.css';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import { Toaster } from 'sonner';
import { ShieldCheck, Sparkles, Heart } from 'lucide-react';
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
      <body className="font-sans antialiased min-h-screen bg-[#070a13] text-slate-100 flex flex-col selection:bg-indigo-500/30 selection:text-white">
        <Toaster position="top-right" theme="dark" richColors closeButton />
        
        {/* Ambient background glows */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/10 blur-[120px] rounded-full"></div>
          <div className="absolute top-1/3 -left-40 w-[600px] h-[500px] bg-cyan-600/5 blur-[140px] rounded-full"></div>
          <div className="absolute bottom-10 right-0 w-[500px] h-[400px] bg-purple-600/5 blur-[120px] rounded-full"></div>
        </div>

        <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1 w-full">
            {children}
          </main>
          
          <footer className="border-t border-slate-800/80 bg-slate-950/70 backdrop-blur-xl py-10 mt-20 text-xs text-slate-400">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                <div className="md:col-span-2 space-y-3">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <span className="text-base font-black text-white tracking-tight">
                      Vidriera<span className="text-indigo-400">Digital</span>
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs max-w-sm leading-relaxed">
                    Plataforma municipal de fomento económico local, fiscalización cívica y transparencia de precios esenciales para toda la comunidad.
                  </p>
                  <div className="inline-flex items-center space-x-2 text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Infraestructura Municipal Operativa</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Accesos Ciudadanos</h4>
                  <ul className="space-y-2 text-slate-400">
                    <li><Link href="/ranking" className="hover:text-indigo-400 transition-colors">Observatorio de Precios</Link></li>
                    <li><Link href="/mapa" className="hover:text-indigo-400 transition-colors">Mapa de Comercios</Link></li>
                    <li><Link href="/buscar" className="hover:text-indigo-400 transition-colors">Directorio de Vidrieras</Link></li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Área Comercial</h4>
                  <ul className="space-y-2 text-slate-400">
                    <li><Link href="/login" className="hover:text-indigo-400 transition-colors">Portal Comerciantes</Link></li>
                    <li><Link href="/registro" className="hover:text-indigo-400 transition-colors">Dar de Alta Mi Negocio</Link></li>
                    <li><Link href="/backoffice" className="hover:text-indigo-400 transition-colors">Auditoría Municipal</Link></li>
                  </ul>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-slate-500">
                <p>© 2026 Municipalidad. Todos los derechos reservados.</p>
                <p className="flex items-center space-x-1">
                  <span>Trabajo Final Integrador (TFI)</span>
                  <span>•</span>
                  <span>Ingeniería de Software</span>
                </p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
