import './globals.css';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'Vidriera Digital | Encontrá lo mejor en tu ciudad y más',
  description: 'Descubrí los mejores productos, servicios y comercios locales con ranking de calificaciones y precios.',
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
          crossOrigin="anonymous" 
        />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
      </head>
      <body className="font-sans antialiased min-h-screen bg-[#f0f6fa] text-slate-800 flex flex-col selection:bg-[#38bdf8] selection:text-white">
        <Toaster position="top-right" richColors closeButton />
        
        <Navbar />
        
        <main className="flex-1 w-full">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}
