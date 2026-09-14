import Link from 'next/link';
import { 
  Store, 
  TrendingUp, 
  MapPin, 
  ShieldCheck, 
  MessageSquare, 
  ShoppingBag, 
  ArrowRight,
  Sparkles,
  Users
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="bg-gradient-to-b from-blue-50/50 via-white to-gray-50 min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Iniciativa de Modernización y Comercio Local</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-gray-900 tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none mb-6">
            La <span className="text-blue-600">Vidriera Digital</span> de nuestra ciudad
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Conectamos a emprendedores, PyMEs y comerciantes locales con los vecinos. 
            Compara precios, ubica comercios en el mapa y chatea directo con el vendedor.
          </p>

          {/* Tarjetas Principales de Ingreso */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto text-left">
            {/* Vecinos: Directorio de Comercios */}
            <Link 
              href="/buscar"
              className="group bg-white p-7 rounded-3xl border border-gray-200 shadow-sm hover:shadow-xl hover:border-blue-400 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Store className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  Explorar Comercios
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Descubre las tiendas de tu barrio, consulta horarios, productos publicados y calificaciones reales.
                </p>
              </div>
              <div className="mt-6 flex items-center text-sm font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
                <span>Ver vidrieras</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </Link>

            {/* Vecinos: Ranking y Comparador de Precios */}
            <Link 
              href="/ranking"
              className="group bg-white p-7 rounded-3xl border border-green-200 shadow-sm hover:shadow-xl hover:border-green-400 transition-all flex flex-col justify-between ring-1 ring-green-100"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-7 h-7" />
                </div>
                <div className="inline-block bg-green-100 text-green-800 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md mb-2">
                  Destacado TFI
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                  Ranking de Precios
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Compara los precios de la canasta básica y productos cotidianos entre distintos locales para ahorrar.
                </p>
              </div>
              <div className="mt-6 flex items-center text-sm font-bold text-green-600 group-hover:translate-x-1 transition-transform">
                <span>Comparar precios</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </Link>

            {/* Comerciantes: Panel */}
            <Link 
              href="/login"
              className="group bg-white p-7 rounded-3xl border border-gray-200 shadow-sm hover:shadow-xl hover:border-indigo-400 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Users className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                  Soy Comerciante
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Solicita tu vidriera digital, publica tu catálogo con precios actualizados y recibe consultas en tiempo real.
                </p>
              </div>
              <div className="mt-6 flex items-center text-sm font-bold text-indigo-600 group-hover:translate-x-1 transition-transform">
                <span>Ingresar al panel</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Banner de Mapa Interactivo */}
      <section className="py-12 bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-lg">
            <div className="max-w-xl">
              <div className="flex items-center space-x-2 text-blue-200 text-xs font-bold uppercase tracking-wider mb-2">
                <MapPin className="w-4 h-4 text-red-300" />
                <span>Geolocalización Comercial</span>
              </div>
              <h2 className="text-3xl font-black tracking-tight mb-3">
                Ubica los comercios en el mapa interactivo
              </h2>
              <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
                Visualiza la distribución geográfica de las tiendas, farmacias, panaderías y servicios en todos los barrios de la ciudad.
              </p>
            </div>
            <Link
              href="/mapa"
              className="px-8 py-4 bg-white text-blue-700 font-black rounded-2xl shadow-md hover:bg-blue-50 transition-all flex items-center space-x-2 text-base flex-shrink-0"
            >
              <MapPin className="w-5 h-5 text-red-500" />
              <span>Abrir Mapa de la Ciudad</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Pilares del Proyecto */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900">Pilares del Ecosistema Municipal</h2>
            <p className="text-sm text-gray-500 mt-2">Tecnología al servicio de la transparencia y la economía local</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
              <ShieldCheck className="w-8 h-8 text-purple-600 mb-3" />
              <h4 className="font-bold text-gray-900 mb-1">Verificación Oficial</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Cada comercio es auditado y aprobado por la Dirección Municipal para garantizar seguridad a los vecinos.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
              <TrendingUp className="w-8 h-8 text-green-600 mb-3" />
              <h4 className="font-bold text-gray-900 mb-1">Ranking de Precios</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Algoritmos comparativos que ordenan las ofertas de menor a mayor precio con métricas de ahorro.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
              <MessageSquare className="w-8 h-8 text-blue-600 mb-3" />
              <h4 className="font-bold text-gray-900 mb-1">Chat en Tiempo Real</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Comunicación directa e instantánea entre cliente y comerciante mediante WebSockets (Socket.IO).
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
              <ShoppingBag className="w-8 h-8 text-orange-500 mb-3" />
              <h4 className="font-bold text-gray-900 mb-1">Catálogo Digital</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Los emprendedores gestionan sus productos, stock y descripciones desde un panel intuitivo y accesible.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
