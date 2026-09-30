'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Search, 
  UserPlus, 
  Heart, 
  Bell, 
  Menu, 
  X, 
  User, 
  Store, 
  ShieldCheck, 
  LogOut, 
  MessageSquare,
  MapPin,
  Star
} from 'lucide-react';
import MercadoLibreLogo from '@/components/MercadoLibreLogo';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadUser = () => {
      const userStored = localStorage.getItem('user');
      if (userStored) {
        try {
          setUser(JSON.parse(userStored));
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    loadUser();
    window.addEventListener('auth-change', loadUser);
    window.addEventListener('storage', loadUser);

    return () => {
      window.removeEventListener('auth-change', loadUser);
      window.removeEventListener('storage', loadUser);
    };
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/ranking?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setUserMenuOpen(false);
    router.push('/');
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-xs select-none">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Left: Mobile Menu & Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-1.5 text-gray-700 hover:text-[#38bdf8] rounded-md focus:outline-none"
              aria-label="Abrir menú"
            >
              <Menu className="w-6 h-6" />
            </button>

            <Link href="/" className="flex-shrink-0 flex items-center">
              <MercadoLibreLogo size="md" />
            </Link>
          </div>

          {/* Center: Search Bar */}
          <div className="flex-1 max-w-[500px] mx-2 sm:mx-4">
            <form onSubmit={handleSearch} className="relative flex items-center w-full">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar productos, servicios, tiendas..."
                className="w-full h-10 pl-4 pr-11 text-sm bg-white text-gray-900 placeholder:text-gray-400 border border-[#38bdf8] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#38bdf8] transition-all"
              />
              <button
                type="submit"
                className="absolute right-3 p-1 text-[#38bdf8] hover:text-[#0ea5e9] transition-colors focus:outline-none flex items-center justify-center cursor-pointer"
                aria-label="Buscar"
              >
                <Search className="w-5 h-5 stroke-[2.2]" />
              </button>
            </form>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-5 text-sm font-medium text-gray-700 mr-2">
            <Link href="/" className="hover:text-[#38bdf8] transition-colors">Inicio</Link>
            <Link href="/buscar" className="hover:text-[#38bdf8] transition-colors">Buscar</Link>
            <Link href="/ranking" className="hover:text-[#38bdf8] transition-colors">Ranking</Link>
          </nav>

          {/* Right Actions: Mi Tienda, Favoritos, Avatar with Dropdown */}
          <div className="flex items-center gap-4 sm:gap-5 text-gray-800">
            
            {/* Conditional Action Shortcut */}
            {user?.roles?.includes('superadmin') || user?.roles?.includes('admin') || user?.roles?.includes('moderador') ? (
              <Link
                href="/backoffice"
                className="flex items-center gap-1.5 hover:text-[#38bdf8] transition-colors text-sm font-medium text-gray-800"
              >
                <ShieldCheck className="w-5 h-5 text-gray-800 stroke-[1.8]" />
                <span className="hidden sm:inline">Administración</span>
              </Link>
            ) : user?.roles?.includes('comerciante') ? (
              <Link
                href="/panel"
                className="flex items-center gap-1.5 hover:text-[#38bdf8] transition-colors text-sm font-medium text-gray-800"
              >
                <Store className="w-5 h-5 text-gray-800 stroke-[1.8]" />
                <span className="hidden sm:inline">Mi Tienda</span>
              </Link>
            ) : null}

            {/* Favoritos */}
            <Link
              href="/ranking"
              className="text-gray-700 hover:text-[#38bdf8] transition-colors p-1"
              title="Favoritos"
            >
              <Heart className="w-5 h-5 stroke-[1.8]" />
            </Link>

            {/* User Profile Avatar with Dropdown Menu */}
            {user ? (
              <div ref={userMenuRef} className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 cursor-pointer rounded-full sm:rounded-lg hover:bg-gray-50 transition-all p-1 sm:pr-3 border border-transparent hover:border-gray-200 focus:outline-none"
                  title="Menú de Usuario"
                >
                  {user.fotoPerfil ? (
                    <img
                      src={user.fotoPerfil}
                      alt={user.nombre || "Usuario"}
                      className="w-8 h-8 rounded-full object-cover border border-gray-200 shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#38bdf8] text-white flex items-center justify-center font-bold text-sm shrink-0">
                      {user.nombre ? user.nombre.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                    </div>
                  )}
                  <div className="hidden sm:flex flex-col items-start leading-none text-left">
                    <span className="text-sm font-semibold text-gray-800 truncate max-w-[100px]">{user.nombre}</span>
                    <span className="text-[10px] text-gray-500 capitalize">{user.roles?.[0] || 'Usuario'}</span>
                  </div>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="py-1 text-sm">
                      {user?.roles?.includes('superadmin') || user?.roles?.includes('admin') || user?.roles?.includes('moderador') ? (
                        <Link
                          href="/backoffice"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-gray-800 hover:bg-gray-50 transition-colors font-medium"
                        >
                          <ShieldCheck className="w-4 h-4 text-gray-600" />
                          <span>Administración</span>
                        </Link>
                      ) : user?.roles?.includes('comerciante') ? (
                        <Link
                          href="/panel"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-gray-800 hover:bg-gray-50 transition-colors font-medium"
                        >
                          <Store className="w-4 h-4 text-gray-600" />
                          <span>Mi Tienda</span>
                        </Link>
                      ) : null}

                      <Link
                        href="/perfil"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-gray-800 hover:bg-gray-50 transition-colors font-medium"
                      >
                        <User className="w-4 h-4 text-gray-600" />
                        <span>Mi Perfil</span>
                      </Link>

                      <Link
                        href="/panel/mensajes"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-gray-800 hover:bg-gray-50 transition-colors font-medium"
                      >
                        <MessageSquare className="w-4 h-4 text-gray-600" />
                        <span>Mis Mensajes</span>
                      </Link>

                      <Link
                        href="/panel/opiniones"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-gray-800 hover:bg-gray-50 transition-colors font-medium"
                      >
                        <Star className="w-4 h-4 text-gray-600" />
                        <span>Mis Opiniones</span>
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors font-medium text-left cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-red-600" />
                        <span>Cerrar Sesión</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-[#38bdf8] hidden sm:block">
                  Ingresar
                </Link>
                <Link href="/registro" className="text-sm font-medium bg-[#38bdf8] text-white px-3 py-1.5 rounded-lg hover:bg-[#0ea5e9] transition-colors">
                  Registrarse
                </Link>
              </div>
            )}

          </div>

        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-2xl z-10">
            {/* Mobile Header */}
            <div className="p-4 flex items-center justify-between border-b border-gray-100">
              <MercadoLibreLogo size="sm" />
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-500 hover:text-gray-800 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Links */}
            <div className="flex-1 overflow-y-auto py-4 px-3 space-y-2 text-sm text-gray-700">
              {user ? (
                <>
                  {user?.roles?.includes('superadmin') || user?.roles?.includes('admin') || user?.roles?.includes('moderador') ? (
                    <Link
                      href="/backoffice"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 font-medium text-gray-900"
                    >
                      <ShieldCheck className="w-4 h-4 text-[#38bdf8]" />
                      <span>Administración</span>
                    </Link>
                  ) : user?.roles?.includes('comerciante') ? (
                    <Link
                      href="/panel"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 font-medium text-gray-900"
                    >
                      <Store className="w-4 h-4 text-[#38bdf8]" />
                      <span>Mi Tienda</span>
                    </Link>
                  ) : null}

                  <Link
                    href="/panel/opiniones"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 font-medium text-gray-900"
                  >
                    <Star className="w-4 h-4 text-amber-500" />
                    <span>Mis Opiniones</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 font-medium text-gray-900"
                  >
                    <User className="w-4 h-4 text-[#38bdf8]" />
                    <span>Ingresar</span>
                  </Link>
                  
                  <Link
                    href="/registro"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 font-medium text-gray-900"
                  >
                    <UserPlus className="w-4 h-4 text-[#38bdf8]" />
                    <span>Registrarse</span>
                  </Link>
                </>
              )}

              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 font-medium"
              >
                <span>Inicio</span>
              </Link>

              <Link
                href="/ranking"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 font-medium"
              >
                <span>Ranking de Precios</span>
              </Link>

              <Link
                href="/mapa"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 font-medium"
              >
                <MapPin className="w-4 h-4 text-[#38bdf8]" />
                <span>Mapa de Comercios</span>
              </Link>

              {user && (
                <div className="border-t border-gray-100 pt-3">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 w-full rounded-lg"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Cerrar sesión</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
