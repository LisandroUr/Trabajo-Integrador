import Link from 'next/link';

export default function BuscarLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/buscar" className="text-xl font-bold text-blue-600 flex items-center gap-2">
            🏪 Vidriera Municipal
          </Link>
          <div className="space-x-4">
            <Link href="/login" className="text-gray-600 hover:text-blue-600 font-medium">Ingresar</Link>
            <Link href="/registro" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium transition shadow-sm">
              Soy Comerciante
            </Link>
          </div>
        </div>
      </nav>
      <main className="flex-1 w-full">
        {children}
      </main>
      
      <footer className="bg-white border-t border-gray-200 py-8 text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Municipalidad. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
