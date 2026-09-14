import './globals.css';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Vidriera Digital Municipal | Ranking de Precios y Comercios Locales',
  description: 'Plataforma oficial para conectar emprendedores y comercios con los vecinos. Compara precios, ubica en el mapa y chatea en tiempo real.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link 
          rel="stylesheet" 
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" 
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" 
          crossOrigin="" 
        />
      </head>
      <body className="font-sans antialiased min-h-screen bg-gray-50 flex flex-col text-gray-900">
        <Navbar />
        <div className="flex-1">
          {children}
        </div>
        <footer className="bg-white border-t border-gray-200 py-6 text-center text-xs text-gray-500 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-2">
            <p>© 2026 Vidriera Digital Municipal - Plataforma de Fomento al Comercio Local y Transparencia de Precios.</p>
            <p className="font-semibold text-gray-600">Trabajo Final Integrador (TFI)</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
