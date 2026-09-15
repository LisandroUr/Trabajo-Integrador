'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  ArrowRight, 
  BarChart2, 
  MapPin, 
  Store, 
  Shield, 
  Check, 
  TrendingDown,
  Building,
  HelpCircle,
  Clock,
  Coins
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/ranking?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const sampleBasket = [
    { item: 'Leche Entera 1L', min: 1150, max: 1400, ahorro: '18%', local: 'Panadería La Espiga' },
    { item: 'Pan Francés 1kg', min: 1100, max: 1400, ahorro: '21%', local: 'Panadería del Sol' },
    { item: 'Harina 000 1kg', min: 780, max: 950, ahorro: '18%', local: 'Supermercado Central' },
    { item: 'Aceite Girasol 900ml', min: 1450, max: 1700, ahorro: '15%', local: 'Almacén Don Mario' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Editorial Header Split */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start pt-4">
        {/* Left Column: Mission & Search */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-md bg-[#1a1f28] border border-[#272f3d] text-[#9cb1ce] text-xs font-medium">
            <Shield className="w-3.5 h-3.5 text-[#7a93b5]" />
            <span>Observatorio Cívico Municipal • Bahía Blanca</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-[#e2e5eb] leading-[1.15]">
            Información clara sobre precios para defender la economía de cada barrio.
          </h1>

          <p className="text-sm text-[#8d94a1] leading-relaxed max-w-xl">
            Herramienta pública gratuita desarrollada para relevar precios de la canasta esencial, visibilizar el comercio de cercanía y reducir las asimetrías de información entre vecinos y negocios.
          </p>

          {/* Search Box */}
          <form onSubmit={handleSearch} className="pt-2">
            <div className="flex items-center p-1.5 rounded-xl bg-[#171b22] border border-[#29303c] shadow-xs focus-within:border-[#414d60] transition-colors">
              <div className="pl-3 text-[#6b7280]">
                <Search className="w-4 h-4 text-[#8d94a1]" />
              </div>
              <input
                type="text"
                placeholder="Buscar producto en la canasta (ej. Leche, Pan, Harina, Café)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent px-3 py-2.5 text-xs text-[#e2e5eb] placeholder:text-[#5f6674] focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#2c3749] hover:bg-[#344157] text-[#e2e5eb] text-xs font-medium rounded-lg border border-[#3d4b63] transition-colors flex items-center space-x-1.5 flex-shrink-0"
              >
                <span>Consultar</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#9cb1ce]" />
              </button>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px] text-[#6b7280]">
              <span>Consultas habituales:</span>
              {['Leche', 'Pan', 'Aceite', 'Harina', 'Café'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => router.push(`/ranking?q=${encodeURIComponent(tag)}`)}
                  className="px-2 py-0.5 rounded bg-[#181c24] hover:bg-[#202631] text-[#8d94a1] hover:text-[#c8cdd6] border border-[#232833] transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </form>

          {/* Key Municipal Metrics */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#232833]">
            <div>
              <span className="text-[10px] text-[#6b7280] uppercase tracking-wider block font-medium">Comercios Habilitados</span>
              <span className="text-xl font-semibold text-[#c8cdd6] tabular-nums mt-0.5 block">5 comercios</span>
            </div>
            <div>
              <span className="text-[10px] text-[#6b7280] uppercase tracking-wider block font-medium">Dispersión Promedio</span>
              <span className="text-xl font-semibold text-[#8bb59b] tabular-nums mt-0.5 block">18.3% ahorro</span>
            </div>
            <div>
              <span className="text-[10px] text-[#6b7280] uppercase tracking-wider block font-medium">Costos de Intermediación</span>
              <span className="text-xl font-semibold text-[#c8cdd6] tabular-nums mt-0.5 block">$0 (Libre)</span>
            </div>
          </div>
        </div>

        {/* Right Column: Family Basket Inspector */}
        <div className="lg:col-span-5 bg-[#171b22] border border-[#262c38] rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-[#232833]">
            <div>
              <span className="text-[10px] font-medium uppercase tracking-wider text-[#8bb59b] bg-[#1e2a23] border border-[#2b3e34] px-2 py-0.5 rounded">
                Muestra Relevada
              </span>
              <h3 className="text-sm font-semibold text-[#e2e5eb] mt-1.5">
                Canasta Barrial de Referencia
              </h3>
            </div>
            <Link
              href="/ranking"
              className="text-xs font-medium text-[#9cb1ce] hover:text-[#c4d7f2] flex items-center space-x-1"
            >
              <span>Ver todas</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {sampleBasket.map((b) => (
              <div
                key={b.item}
                className="p-3.5 rounded-xl bg-[#1c212a] border border-[#252b36] flex items-center justify-between hover:border-[#323a4a] transition-colors"
              >
                <div>
                  <h4 className="text-xs font-medium text-[#e2e5eb]">{b.item}</h4>
                  <div className="flex items-center space-x-2 text-[11px] text-[#78808f] mt-0.5">
                    <span>{b.local}</span>
                    <span>•</span>
                    <span className="line-through text-[#606774]">${b.max}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-semibold text-[#e2e5eb] tabular-nums block">
                    ${b.min}
                  </span>
                  <span className="text-[10px] font-medium text-[#8bb59b] bg-[#1e2a23] px-1.5 py-0.2 rounded border border-[#2b3e34]">
                    -{b.ahorro}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-[#1a1f28] border border-[#252c38] text-[11px] text-[#8d94a1] flex items-center space-x-2.5">
            <Coins className="w-4 h-4 text-[#d1ab77] flex-shrink-0" />
            <span>Diferencia acumulada en 4 artículos básicos: <strong>$820 de ahorro</strong> respecto al precio máximo relevado.</span>
          </div>
        </div>
      </section>

      {/* 3 Strategic Pillars (Distinct Layout) */}
      <section className="pt-6">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-[#e2e5eb]">
            Servicios del Ecosistema Comercial
          </h2>
          <p className="text-xs text-[#78808f] mt-1">
            Módulos integrados para la participación ciudadana y la administración municipal.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Module 1 */}
          <div className="p-6 rounded-2xl bg-[#171b22] border border-[#232833] flex flex-col justify-between hover:border-[#2f3745] transition-colors">
            <div className="space-y-3">
              <div className="w-9 h-9 rounded-lg bg-[#1f2633] border border-[#2c3749] flex items-center justify-center text-[#9cb1ce]">
                <BarChart2 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-[#e2e5eb]">Observatorio de Precios</h3>
              <p className="text-xs text-[#8d94a1] leading-relaxed">
                Algoritmo neutral que releva los precios de los comercios registrados, identificando el valor más económico, el promedio y la dispersión porcentual de cada producto.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#232833]">
              <Link href="/ranking" className="text-xs font-medium text-[#9cb1ce] hover:text-[#c4d7f2] flex items-center space-x-1.5">
                <span>Ingresar al observatorio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Module 2 */}
          <div className="p-6 rounded-2xl bg-[#171b22] border border-[#232833] flex flex-col justify-between hover:border-[#2f3745] transition-colors">
            <div className="space-y-3">
              <div className="w-9 h-9 rounded-lg bg-[#1a252b] border border-[#24353d] flex items-center justify-center text-[#7dafb5]">
                <MapPin className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-[#e2e5eb]">Cartografía de Cercanía</h3>
              <p className="text-xs text-[#8d94a1] leading-relaxed">
                Geolocalización sobre OpenStreetMap con cálculo de distancias para fomentar el compre barrial y la movilidad a pie en los diferentes sectores de la ciudad.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#232833]">
              <Link href="/mapa" className="text-xs font-medium text-[#7dafb5] hover:text-[#b0d9df] flex items-center space-x-1.5">
                <span>Abrir mapa urbano</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Module 3 */}
          <div className="p-6 rounded-2xl bg-[#171b22] border border-[#232833] flex flex-col justify-between hover:border-[#2f3745] transition-colors">
            <div className="space-y-3">
              <div className="w-9 h-9 rounded-lg bg-[#202722] border border-[#2e3a31] flex items-center justify-center text-[#8bb59b]">
                <Store className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-[#e2e5eb]">Vidrieras Digitales</h3>
              <p className="text-xs text-[#8d94a1] leading-relaxed">
                Espacios autogestionables para comerciantes y microemprendedores donde publicar catálogos oficiales, horarios y habilitación municipal verificada.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#232833]">
              <Link href="/buscar" className="text-xs font-medium text-[#8bb59b] hover:text-[#bce1cb] flex items-center space-x-1.5">
                <span>Explorar comercios</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Institutional Merchant Onboarding Section */}
      <section className="rounded-2xl bg-[#181c24] border border-[#262c38] p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-xl space-y-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9cb1ce] bg-[#1f2633] border border-[#2d374a] px-2 py-0.5 rounded">
            Para Negocios y Emprendimientos
          </span>
          <h3 className="text-lg font-semibold text-[#e2e5eb]">
            ¿Tienes un comercio en Bahía Blanca? Publica tu vidriera sin costo.
          </h3>
          <p className="text-xs text-[#8d94a1] leading-relaxed">
            Suma tu local a la red cívica municipal. Permite que los vecinos encuentren tus productos, comparen precios de forma transparente y te consulten directamente.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 flex-shrink-0">
          <Link
            href="/registro"
            className="w-full sm:w-auto px-5 py-2.5 bg-[#2c3749] hover:bg-[#344157] text-[#e2e5eb] border border-[#3d4b63] text-xs font-medium rounded-lg transition-colors text-center"
          >
            Solicitar Habilitación de Tienda
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto px-4 py-2.5 bg-[#171b22] hover:bg-[#1d222b] text-[#8d94a1] border border-[#29303c] text-xs font-medium rounded-lg transition-colors text-center"
          >
            Ingreso Comerciantes
          </Link>
        </div>
      </section>
    </div>
  );
}
