'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Building2, 
  TrendingUp, 
  MapPin, 
  ShieldCheck, 
  LayoutDashboard, 
  MessageSquare, 
  LogOut, 
  LogIn, 
  Menu, 
  X,
  Store,
  ChevronRight,
  UserCheck
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

  const navLinks = [
    { href: '/buscar', label: 'Comercios', icon: Store },
    { href: '/ranking', label: 'Ranking de Precios', icon: TrendingUp },
    { href: '/mapa', label: 'Mapa Interactivo', icon: MapPin },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center space-x-6">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xs transition-transform duration-200 group-hover:scale-105 group-hover:bg-indigo-600">
                <Building2 className="h-5 w-5" strokeWidth={2} />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-extrabold tracking-tight text-slate-900 leading-tight">
                  Vidriera<span className="text-indigo-600 font-black">Digital</span>
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 leading-none">
                  Portal Municipal
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1 pl-4 border-l border-slate-200">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold tracking-normal transition-all duration-150 ${
                      isActive
                        ? 'bg-slate-100 text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} strokeWidth={2} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-2.5">
                {isAdmin && (
                  <Link
                    href="/backoffice"
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60 hover:bg-indigo-100/70 transition-colors"
                  >
                    <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
                    <span>Administración</span>
                  </Link>
                )}

                {isComerciante && (
                  <>
                    <Link
                      href="/panel"
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xs"
                    >
                      <LayoutDashboard className="h-3.5 w-3.5" />
                      <span>Mi Panel</span>
                    </Link>
                    <Link
                      href="/panel/mensajes"
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200/80 transition-colors"
                      title="Mensajes de clientes"
                    >
                      <MessageSquare className="h-3.5 w-3.5 text-slate-500" />
                      <span>Mensajes</span>
                    </Link>
                  </>
                )}

                <div className="flex items-center space-x-2 pl-3 border-l border-slate-200">
                  <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 text-slate-800 flex items-center justify-center font-bold text-xs">
                    {user.nombre?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-slate-800 leading-tight">{user.nombre}</span>
                    <span className="text-[10px] text-slate-500 leading-none truncate max-w-[120px]">{user.email}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors ml-1"
                    title="Cerrar sesión"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex items-center space-x-1.5"
                >
                  <LogIn className="h-3.5 w-3.5 text-slate-500" />
                  <span>Iniciar sesión</span>
                </Link>
                <Link
                  href="/registro"
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-1 shadow-lg">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold ${
                  isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="h-4 w-4 text-slate-500" />
                  <span>{item.label}</span>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </Link>
            );
          })}

          <div className="pt-4 border-t border-slate-100">
            {user ? (
              <div className="space-y-2">
                <div className="px-3 py-1.5">
                  <p className="text-xs font-bold text-slate-900">{user.nombre}</p>
                  <p className="text-[11px] text-slate-500">{user.email}</p>
                </div>
                {isAdmin && (
                  <Link
                    href="/backoffice"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    <span>Panel de Administración Municipal</span>
                  </Link>
                )}
                {isComerciante && (
                  <>
                    <Link
                      href="/panel"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-900 text-white"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      <span>Panel de Vidrieras</span>
                    </Link>
                    <Link
                      href="/panel/mensajes"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>Bandeja de Mensajes</span>
                    </Link>
                  </>
                )}
                <button
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                  className="w-full text-left flex items-center space-x-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Cerrar sesión</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/registro"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center px-3 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 shadow-xs"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
