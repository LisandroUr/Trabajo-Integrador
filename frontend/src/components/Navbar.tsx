'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Building2, 
  MapPin, 
  BarChart3, 
  Search, 
  ShieldCheck, 
  Store, 
  LogOut, 
  Menu, 
  X,
  User,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const userStored = localStorage.getItem('user');
    if (userStored) {
      try {
        setUser(JSON.parse(userStored));
      } catch {
        setUser(null);
      }
    }
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  const navLinks = [
    { href: '/', label: 'Inicio', icon: Building2 },
    { href: '/ranking', label: 'Observatorio de Precios', icon: BarChart3, badge: 'Popular' },
    { href: '/mapa', label: 'Mapa Interactivo', icon: MapPin },
    { href: '/buscar', label: 'Directorio', icon: Search },
  ];

  const isAdmin = user?.roles?.includes('superadmin') || user?.roles?.includes('moderador');
  const isMerchant = user?.roles?.includes('comerciante');

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-950/75 backdrop-blur-2xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-18 items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-[1px] shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-all duration-300">
                <div className="w-full h-full bg-slate-950 rounded-[15px] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform duration-300" />
                </div>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-950 rounded-full"></span>
            </div>

            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-base font-black tracking-tight text-white">
                  Vidriera<span className="text-indigo-400">Digital</span>
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  GobTech
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block tracking-wide font-medium">
                Municipio de Bahía Blanca
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-900/60 p-1.5 rounded-2xl border border-white/5 shadow-inner">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center space-x-2 ${
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="ml-1 px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold rounded-full">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User / Session Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-2 bg-slate-900/80 border border-white/10 p-1.5 rounded-2xl">
                {isAdmin && (
                  <Link
                    href="/backoffice"
                    className="px-3.5 py-1.5 bg-purple-500/15 text-purple-300 hover:bg-purple-500/25 border border-purple-500/30 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Auditoría</span>
                  </Link>
                )}

                {isMerchant && (
                  <Link
                    href="/panel"
                    className="px-3.5 py-1.5 bg-indigo-500/15 text-indigo-300 hover:bg-indigo-500/25 border border-indigo-500/30 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5"
                  >
                    <Store className="w-3.5 h-3.5" />
                    <span>Mi Panel</span>
                  </Link>
                )}

                <div className="flex items-center space-x-2 pl-2 pr-1">
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                    {user.nombre?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="text-xs font-semibold text-slate-200 max-w-[120px] truncate">
                    {user.nombre}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  title="Cerrar sesión"
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/login"
                  className="px-4 py-2 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                >
                  Acceso
                </Link>
                <Link
                  href="/registro"
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/25 transition-all flex items-center space-x-1.5 group"
                >
                  <span>Publicar Comercio</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-slate-950/95 backdrop-blur-2xl px-4 pt-3 pb-6 space-y-3">
          <div className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold ${
                    isActive ? 'bg-indigo-600/20 text-indigo-300' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </div>
                  {link.badge && (
                    <span className="px-2 py-0.5 text-[9px] font-extrabold bg-emerald-500/20 text-emerald-400 rounded-full">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-white/10 space-y-2">
            {user ? (
              <>
                <div className="px-3 py-2 text-xs font-semibold text-slate-300">
                  Conectado como <strong className="text-white">{user.nombre}</strong>
                </div>
                {isAdmin && (
                  <Link
                    href="/backoffice"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full py-2 px-3 text-center bg-purple-600/20 text-purple-300 rounded-xl text-xs font-bold"
                  >
                    Panel de Auditoría
                  </Link>
                )}
                {isMerchant && (
                  <Link
                    href="/panel"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full py-2 px-3 text-center bg-indigo-600/20 text-indigo-300 rounded-xl text-xs font-bold"
                  >
                    Panel de Tiendas
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full py-2 px-3 bg-rose-600/20 text-rose-300 rounded-xl text-xs font-bold"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 text-center text-xs font-bold bg-white/5 text-white rounded-xl"
                >
                  Ingresar
                </Link>
                <Link
                  href="/registro"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 text-center text-xs font-bold bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-600/30"
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
