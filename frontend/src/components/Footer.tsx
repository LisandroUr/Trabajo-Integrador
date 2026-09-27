'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full bg-white/80 border-t border-gray-200/80 py-4 px-4 sm:px-8 mt-auto select-none">
      <div className="max-w-[1320px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500 font-normal">
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          <Link href="/" className="hover:text-gray-900 transition-colors">
            Inicio
          </Link>
          <Link href="/buscar" className="hover:text-gray-900 transition-colors">
            Navegación
          </Link>
          <Link href="/mapa" className="hover:text-gray-900 transition-colors">
            Contacto
          </Link>
          <Link href="/ranking" className="hover:text-gray-900 transition-colors">
            Blog
          </Link>
          <Link href="/mis-consultas" className="hover:text-gray-900 transition-colors">
            Cómo funciona
          </Link>
        </div>

        <div className="text-gray-500">
          © {new Date().getFullYear()} Vidriera Digital
        </div>
      </div>
    </footer>
  );
}
