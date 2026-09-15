'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Building, 
  MapPin, 
  BarChart2, 
  Search, 
  ShieldCheck, 
  Store, 
  LogOut, 
  Menu, 
  X,
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
    { href: '/', label: 'Inicio', icon: Building },
    { href: '/ranking', label: 'Observatorio de Precios', icon: BarChart2 },
    { href: '/mapa', label: 'Mapa Interactivo', icon: MapPin },
    { href: '/buscar', label: 'Directorio', icon: Search },
  ];

  const isAdmin = user?.roles?.includes('superadmin') || user?.roles?.includes('moderador');
  const isMerchant = user?.roles?.includes('comerciante');

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#232833] bg-[#151820]/95 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Brand */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-9 h-9 rounded-lg bg-[#1e232d] border border-[#2b3341] flex items-center justify-center text-[#9cb1ce] group-hover:border-[#3d485c] transition-colors">
              <ShieldCheck className="w-4 h-4" />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold tracking-tight text-[#e2e5eb]">
                  Vidriera Digital
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase rounded bg-[#1f2633] text-[#9cb1ce] border border-[#2d374a]">
                  Municipal
                </span>
              </div>
              <p className="text-[10px] text-[#78808f] hidden sm:block">
                Bahía Blanca
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 bg-[#181c24] p-1 rounded-xl border border-[#232833]">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center space-x-2 ${
                    isActive
                      ? 'bg-[#252c38] text-[#e2e5eb] shadow-xs'
                      : 'text-[#8d94a1] hover:text-[#d5d9e0] hover:bg-[#1d222b]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#9cb1ce]' : 'text-[#6b7280]'}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User / Session Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-2 bg-[#181c24] border border-[#232833] p-1 rounded-xl">
                {isAdmin && (
                  <Link
                    href="/backoffice"
                    className="px-3 py-1 bg-[#2b2438] text-[#c4a5dc] hover:bg-[#342b45] border border-[#3e3252] rounded-lg text-xs font-medium transition-colors flex items-center space-x-1.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Auditoría</span>
                  </Link>
                )}

                {isMerchant && (
                  <Link
                    href="/panel"
                    className="px-3 py-1 bg-[#1f2633] text-[#9cb1ce] hover:bg-[#252f3f] border border-[#2c3749] rounded-lg text-xs font-medium transition-colors flex items-center space-x-1.5"
                  >
                    <Store className="w-3.5 h-3.5" />
                    <span>Mi Panel</span>
                  </Link>
                )}

                <div className="flex items-center space-x-2 px-2">
                  <div className="w-6 h-6 rounded bg-[#252c38] text-[#c8cdd6] flex items-center justify-center text-xs font-semibold">
                    {user.nombre?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="text-xs font-medium text-[#c8cdd6] max-w-[110px] truncate">
                    {user.nombre}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  title="Cerrar sesión"
                  className="p-1.5 text-[#78808f] hover:text-[#d48a97] hover:bg-[#281c22] rounded-lg transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 text-xs font-medium text-[#8d94a1] hover:text-[#d5d9e0] transition-colors"
                >
                  Ingresar
                </Link>
                <Link
                  href="/registro"
                  className="px-3.5 py-1.5 bg-[#2c3749] hover:bg-[#344157] text-[#e2e5eb] border border-[#3d4b63] text-xs font-medium rounded-lg transition-colors flex items-center space-x-1.5"
                >
                  <span>Publicar Comercio</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#9cb1ce]" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#8d94a1] hover:text-[#d5d9e0] rounded-lg hover:bg-[#1d222b] transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#232833] bg-[#151820] px-4 pt-3 pb-6 space-y-3">
          <div className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium ${
                    isActive ? 'bg-[#252c38] text-[#e2e5eb]' : 'text-[#8d94a1] hover:text-[#d5d9e0]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-[#232833] space-y-2">
            {user ? (
              <>
                <div className="px-3 py-1 text-xs text-[#8d94a1]">
                  Usuario: <span className="text-[#c8cdd6] font-medium">{user.nombre}</span>
                </div>
                {isAdmin && (
                  <Link
                    href="/backoffice"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full py-2 px-3 text-center bg-[#2b2438] text-[#c4a5dc] rounded-lg text-xs font-medium"
                  >
                    Auditoría Municipal
                  </Link>
                )}
                {isMerchant && (
                  <Link
                    href="/panel"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full py-2 px-3 text-center bg-[#1f2633] text-[#9cb1ce] rounded-lg text-xs font-medium"
                  >
                    Mi Panel de Tiendas
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full py-2 px-3 bg-[#281c22] text-[#d48a97] rounded-lg text-xs font-medium"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 text-center text-xs font-medium bg-[#1d222b] text-[#c8cdd6] rounded-lg border border-[#29303c]"
                >
                  Ingresar
                </Link>
                <Link
                  href="/registro"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 text-center text-xs font-medium bg-[#2c3749] text-[#e2e5eb] rounded-lg border border-[#3d4b63]"
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
