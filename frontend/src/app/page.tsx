import Link from 'next/link';
import { 
  Building2, 
  TrendingUp, 
  MapPin, 
  ShieldCheck, 
  Store, 
  ArrowRight, 
  Search, 
  Coins, 
  Users, 
  BarChart3,
  CheckCircle2,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';

export default function HomePage() {
  const highlights = [
    {
      title: 'Transparencia Ciudadana',
      description: 'Precios relevados directamente por los comercios y auditados por la autoridad municipal.',
      icon: ShieldCheck,
    },
    {
      title: 'Dispersión y Ahorro',
      description: 'Identifica la brecha de precios en productos de consumo básico y reduce tu gasto mensual.',
      icon: TrendingUp,
    },
    {
      title: 'Comercio de Cercanía',
      description: 'Geolocalización precisa de comercios barriales sobre cartografía libre OpenStreetMap.',
      icon: MapPin,
    },
    {
      title: 'Canal Directo Sin Comisiones',
      description: 'Contacto inmediato entre vecino y comerciante a través de mensajería en tiempo real.',
      icon: Users,
    }
  ];

  return (
    <div className="relative overflow-hidden bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-14 pb-20 lg:pt-24 lg:pb-28 border-b border-slate-200/80 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200/80 text-slate-700 text-xs font-semibold tracking-normal mb-8 shadow-2xs">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Programa de Fomento al Comercio Local y Transparencia de Precios</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight max-w-5xl mx-auto leading-[1.1] mb-6">
            La vidriera digital y observatorio de precios de la ciudad
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Conectamos a las familias con los comercios y productores de cercanía. 
            Compara precios de la canasta básica, ubica locales en el mapa y compra de forma inteligente.
          </p>

          {/* Search Trigger Bar */}
          <div className="max-w-xl mx-auto mb-14">
            <form action="/ranking" method="GET" className="relative flex items-center shadow-lg rounded-2xl bg-white border border-slate-300/80 p-1.5 transition-all focus-within:ring-2 focus-within:ring-indigo-600/20 focus-within:border-indigo-600">
              <Search className="w-5 h-5 text-slate-400 ml-3 flex-shrink-0" />
              <input
                type="text"
                name="q"
                placeholder="Busca un producto para comparar precios (ej. Leche, Pan, Harina...)"
                className="w-full px-3 py-2.5 text-xs sm:text-sm text-slate-900 bg-transparent placeholder:text-slate-400 focus:outline-none"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors flex-shrink-0 flex items-center space-x-1.5"
              >
                <span>Comparar</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Three Portals Navigation */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto text-left">
            {/* Observatorio de Precios */}
            <Link
              href="/ranking"
              className="group relative rounded-2xl bg-white p-7 border border-slate-200/80 shadow-xs hover:border-indigo-600 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6" strokeWidth={2} />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
                    Módulo Destacado
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                  Ranking de Precios
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-normal">
                  Consulta estadísticas de precios mínimos, máximos y promedios en productos esenciales para optimizar tus compras.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-900 group-hover:text-indigo-600">
                <span>Acceder al comparador</span>
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </Link>

            {/* Directorio de Comercios */}
            <Link
              href="/buscar"
              className="group relative rounded-2xl bg-white p-7 border border-slate-200/80 shadow-xs hover:border-slate-400 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center">
                    <Store className="w-6 h-6" strokeWidth={2} />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                  Directorio de Comercios
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-normal">
                  Explora las vidrieras habilitadas, catálogos completos con precios y opiniones verificadas de la comunidad.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-900 group-hover:text-indigo-600">
                <span>Ver vidrieras</span>
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </Link>

            {/* Portal Comerciante */}
            <Link
              href="/login"
              className="group relative rounded-2xl bg-white p-7 border border-slate-200/80 shadow-xs hover:border-indigo-600 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center">
                    <Building2 className="w-6 h-6" strokeWidth={2} />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200/60">
                    Comerciantes
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                  Panel de Gestión
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-normal">
                  Da de alta tu vidriera oficial, gestiona productos, actualiza tus precios de venta y atiende a tus clientes.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-900 group-hover:text-indigo-600">
                <span>Ingreso a panel</span>
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Map Feature Callout */}
      <section className="py-16 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-slate-900 p-8 sm:p-14 text-white flex flex-col lg:flex-row items-center justify-between gap-8 shadow-xl">
            <div className="max-w-xl">
              <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-3">
                <MapPin className="w-4 h-4" />
                <span>Georreferenciación Municipal</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-4">
                Localiza las ofertas y comercios en el mapa barrial
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-normal">
                Visualiza la distribución de carnicerías, panaderías, farmacias y verdulerías en tiempo real con datos georreferenciados precisos.
              </p>
            </div>
            <Link
              href="/mapa"
              className="px-6 py-3.5 bg-white text-slate-900 hover:bg-slate-100 text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all flex items-center space-x-2 flex-shrink-0"
            >
              <MapPin className="w-4 h-4 text-indigo-600" />
              <span>Abrir Mapa de Comercios</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Institutional Pillars */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Gobernanza y Transparencia
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 font-normal">
              Estándares de fiscalización y datos abiertos aplicados al ecosistema comercial
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {highlights.map((h, i) => {
              const Icon = h.icon;
              return (
                <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-indigo-600" strokeWidth={2} />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 mb-2">{h.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-normal">{h.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
