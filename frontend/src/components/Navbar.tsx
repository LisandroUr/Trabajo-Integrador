'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Store, 
  TrendingUp, 
  MapPin, 
  ShieldCheck, 
  Briefcase, 
  MessageSquare, 
  LogOut, 
  LogIn, 
  Menu, 
  X,
  User
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkUser = () => {
      const stored = localStorage.getItem('user');
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };
    checkUser();

    // Escuchar eventos de cambio en storage
    window.addEventListener('storage', checkUser);
    return () => window.removeEventListener('storage', checkUser);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/');
  };

  const isAdmin = user?.roles?.includes('superadmin') || user?.roles?.includes('moderador');
  const isComerciante = user?.roles?.includes('comerciante');

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Marca */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm group-hover:bg-blue-700 transition-colors">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-black tracking-tight text-gray-900 block leading-tight">
                  Vidriera<span className="text-blue-600">Digital</span>
                </span>
                <span className="text-[10px] uppercase font-bold text-gray-600 tracking-wider block">
                  Municipalidad
                </span>
              </div>
            </Link>

            {/* Links principales Desktop */}
            <nav className="hidden md:flex ml-8 space-x-1">
              <Link 
                href="/buscar" 
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center space-x-1.5 ${
                  pathname === '/buscar' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Store className="w-4 h-4" />
                <span>Comercios</span>
              </Link>
              <Link 
                href="/ranking" 
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center space-x-1.5 ${
                  pathname === '/ranking' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span>Ranking de Precios</span>
              </Link>
              <Link 
                href="/mapa" 
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center space-x-1.5 ${
                  pathname === '/mapa' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <MapPin className="w-4 h-4 text-red-500" />
                <span>Mapa</span>
              </Link>
            </nav>
          </div>

          {/* Menú de Usuario / Acciones Desktop */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                {isAdmin && (
                  <Link 
                    href="/backoffice" 
                    className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-purple-100 text-purple-800 hover:bg-purple-200 transition-colors flex items-center space-x-1"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Backoffice</span>
                  </Link>
                )}

                {isComerciante && (
                  <>
                    <Link 
                      href="/panel" 
                      className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 hover:bg-indigo-200 transition-colors flex items-center space-x-1"
                    >
                      <Briefcase className="w-4 h-4" />
                      <span>Mi Panel</span>
                    </Link>
                    <Link 
                      href="/panel/mensajes" 
                      className="px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors flex items-center space-x-1"
                      title="Bandeja de Mensajes"
                    >
                      <MessageSquare className="w-4 h-4 text-blue-600" />
                      <span>Mensajes</span>
                    </Link>
                  </>
                )}

                <div className="flex items-center space-x-2 pl-2 border-l border-gray-200">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                    {user.nombre?.charAt(0) || 'U'}
                  </div>
                  <div className="text-left hidden lg:block">
                    <p className="text-xs font-bold text-gray-800 leading-none">{user.nombre}</p>
                    <p className="text-[10px] text-gray-600">{user.email}</p>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="p-1.5 text-gray-600 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    title="Cerrar Sesión"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link 
                  href="/login" 
                  className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-blue-600 rounded-lg hover:bg-gray-100 transition-colors flex items-center space-x-1"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Ingresar</span>
                </Link>
                <Link 
                  href="/registro" 
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>

          {/* Botón menú móvil */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menú Móvil desplegable */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 pt-2 pb-4 space-y-2">
          <Link 
            href="/buscar"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
          >
            <Store className="w-5 h-5 text-blue-600" />
            <span>Comercios</span>
          </Link>
          <Link 
            href="/ranking"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
          >
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span>Ranking de Precios</span>
          </Link>
          <Link 
            href="/mapa"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
          >
            <MapPin className="w-5 h-5 text-red-500" />
            <span>Mapa</span>
          </Link>

          {user ? (
            <div className="border-t border-gray-200 pt-3 mt-3 space-y-2">
              <div className="px-3 py-1">
                <p className="text-sm font-bold text-gray-900">{user.nombre}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              {isAdmin && (
                <Link 
                  href="/backoffice"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-purple-700 bg-purple-50"
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span>Panel Municipal (Backoffice)</span>
                </Link>
              )}
              {isComerciante && (
                <>
                  <Link 
                    href="/panel"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-indigo-700 bg-indigo-50"
                  >
                    <Briefcase className="w-5 h-5" />
                    <span>Mi Panel de Tiendas</span>
                  </Link>
                  <Link 
                    href="/panel/mensajes"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
                  >
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                    <span>Mensajes y Chat</span>
                  </Link>
                </>
              )}
              <button 
                onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                className="w-full text-left flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-5 h-5" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          ) : (
            <div className="border-t border-gray-200 pt-3 mt-3 space-y-2">
              <Link 
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center w-full px-4 py-2 border border-gray-300 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
              >
                Ingresar
              </Link>
              <Link 
                href="/registro"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center w-full px-4 py-2 bg-blue-600 text-white rounded-md text-base font-medium hover:bg-blue-700"
              >
                Registrarse
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
