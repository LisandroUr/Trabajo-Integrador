const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../..', '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Importar modelos
const Rol = require('../models/Rol');
const Usuario = require('../models/Usuario');
const PerfilAdminMunicipal = require('../models/PerfilAdminMunicipal');
const PerfilComerciante = require('../models/PerfilComerciante');
const PerfilCliente = require('../models/PerfilCliente');
const Categoria = require('../models/Categoria');
const Comercio = require('../models/Comercio');
const Producto = require('../models/Producto');
const Resena = require('../models/Resena');
const Conversacion = require('../models/Conversacion');
const Mensaje = require('../models/Mensaje');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vidriera_municipal';

const seedDatabase = async () => {
  try {
    console.log('Conectando a MongoDB:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log('Conexión exitosa a la base de datos.');

    // 1. Limpiar colecciones
    console.log('Limpiando base de datos anterior...');
    await Promise.all([
      Rol.deleteMany({}),
      Usuario.deleteMany({}),
      PerfilAdminMunicipal.deleteMany({}),
      PerfilComerciante.deleteMany({}),
      PerfilCliente.deleteMany({}),
      Categoria.deleteMany({}),
      Comercio.deleteMany({}),
      Producto.deleteMany({}),
      Resena.deleteMany({}),
      Conversacion.deleteMany({}),
      Mensaje.deleteMany({})
    ]);

    // 2. Crear Roles
    console.log('Creando roles del sistema...');
    const rolesData = [
      {
        nombre: 'superadmin',
        descripcion: 'Administrador total de la plataforma municipal',
        permisos: ['gestionar_usuarios', 'gestionar_roles', 'aprobar_comercio', 'gestionar_categorias', 'moderar_resenas', 'ver_metricas']
      },
      {
        nombre: 'moderador',
        descripcion: 'Personal municipal que revisa solicitudes y modera contenido',
        permisos: ['aprobar_comercio', 'moderar_resenas']
      },
      {
        nombre: 'comerciante',
        descripcion: 'Dueño de comercio que gestiona sus vidrieras y catálogo',
        permisos: ['gestionar_vidriera', 'gestionar_productos', 'responder_chat', 'responder_resenas']
      },
      {
        nombre: 'cliente',
        descripcion: 'Vecino o usuario general que busca, compara y chatea',
        permisos: ['ver_vidriera', 'iniciar_chat', 'crear_resena', 'guardar_favoritos']
      }
    ];
    const rolesCreados = await Rol.insertMany(rolesData);
    const rolMap = {};
    rolesCreados.forEach(r => { rolMap[r.nombre] = r._id; });

    // 3. Crear Categorías
    console.log('Creando categorías comerciales...');
    const categoriasData = [
      { nombre: 'Alimentos y Bebidas', icono: 'Utensils' },
      { nombre: 'Supermercado y Almacén', icono: 'ShoppingBag' },
      { nombre: 'Farmacia y Salud', icono: 'HeartPulse' },
      { nombre: 'Ferretería y Hogar', icono: 'Wrench' },
      { nombre: 'Indumentaria y Calzado', icono: 'Shirt' }
    ];
    const categoriasCreadas = await Categoria.insertMany(categoriasData);
    const catMap = {};
    categoriasCreadas.forEach(c => { catMap[c.nombre] = c._id; });

    // 4. Crear Contraseñas Hasheadas
    const passwordGenerica = await bcrypt.hash('123456', 10);

    // 5. Crear Usuarios y Perfiles
    console.log('Creando usuarios y perfiles iniciales...');

    // Admin Municipal
    const adminUser = await Usuario.create({
      nombre: 'Lic. Mariano Valenzuela (Admin)',
      email: 'admin@vidriera.gob.ar',
      password: passwordGenerica,
      roles: [rolMap['superadmin']]
    });
    await PerfilAdminMunicipal.create({
      usuarioId: adminUser._id,
      cargo: 'Director de Modernización y Comercio Local',
      area: 'Secretaría de Desarrollo Productivo'
    });

    // Comerciante 1: Panadería
    const panaderoUser = await Usuario.create({
      nombre: 'Roberto Rossi',
      email: 'panaderia@comercio.com',
      password: passwordGenerica,
      roles: [rolMap['comerciante']]
    });
    const perfilPanadero = await PerfilComerciante.create({
      usuarioId: panaderoUser._id,
      cuit: '20-28492019-3',
      razonSocial: 'Rossi Roberto Panificados SA'
    });

    // Comerciante 2: Supermercado
    const superUser = await Usuario.create({
      nombre: 'Laura Morales',
      email: 'super@comercio.com',
      password: passwordGenerica,
      roles: [rolMap['comerciante']]
    });
    const perfilSuper = await PerfilComerciante.create({
      usuarioId: superUser._id,
      cuit: '30-67291048-8',
      razonSocial: 'Supermercado El Sol SRL'
    });

    // Comerciante 3: Farmacia
    const farmaciaUser = await Usuario.create({
      nombre: 'Farm. Carlos Gómez',
      email: 'farmacia@comercio.com',
      password: passwordGenerica,
      roles: [rolMap['comerciante']]
    });
    const perfilFarmacia = await PerfilComerciante.create({
      usuarioId: farmaciaUser._id,
      cuit: '23-31984210-9',
      razonSocial: 'Farmacia San Martín Scs'
    });

    // Vecino / Cliente 1
    const cliente1 = await Usuario.create({
      nombre: 'Martín Benítez (Vecino)',
      email: 'vecino@ciudad.com',
      password: passwordGenerica,
      roles: [rolMap['cliente']]
    });
    await PerfilCliente.create({
      usuarioId: cliente1._id,
      direccionPredeterminada: 'Calle San Martín 450'
    });

    // Vecino / Cliente 2
    const cliente2 = await Usuario.create({
      nombre: 'Sofía Álvarez (Vecina)',
      email: 'sofia@ciudad.com',
      password: passwordGenerica,
      roles: [rolMap['cliente']]
    });
    await PerfilCliente.create({
      usuarioId: cliente2._id,
      direccionPredeterminada: 'Av. Colón 1240'
    });

    // 6. Crear Comercios (con coordenadas geográficas en Bahía Blanca: [-62.26..., -38.71...])
    console.log('Creando comercios geolocalizados...');

    // Comercio 1: Panadería Central
    const panaderia = await Comercio.create({
      nombre: 'Panadería y Confitería La Central',
      descripcion: 'Elaboración artesanal de panadería, facturas de manteca, masas finas y tortas para eventos.',
      categorias: [catMap['Alimentos y Bebidas']],
      direccion: 'Alsina 240, Centro',
      ubicacion: {
        type: 'Point',
        coordinates: [-62.2642, -38.7183] // [lng, lat]
      },
      contacto: {
        telefono: '0291-4521122',
        whatsapp: '+5492914521122',
        email: 'ventas@panaderialacentral.com'
      },
      estado: 'aprobado',
      calificacionPromedio: 4.8,
      cantidadResenas: 2,
      historialEstados: [
        {
          estadoAnterior: 'pendiente',
          nuevoEstado: 'aprobado',
          adminId: adminUser._id,
          motivo: 'Comercio habilitado municipalmente con CUIT verificado.'
        }
      ]
    });
    perfilPanadero.comerciosIds.push(panaderia._id);
    await perfilPanadero.save();

    // Comercio 2: Supermercado El Sol
    const supermercado = await Comercio.create({
      nombre: 'Supermercado El Sol',
      descripcion: 'Gran surtido en comestibles, lácteos, carnes seleccionadas, perfumería y limpieza con los mejores precios de la ciudad.',
      categorias: [catMap['Supermercado y Almacén'], catMap['Alimentos y Bebidas']],
      direccion: 'Brown 580',
      ubicacion: {
        type: 'Point',
        coordinates: [-62.2685, -38.7215]
      },
      contacto: {
        telefono: '0291-4567890',
        whatsapp: '+5492914567890',
        email: 'info@superelsol.com.ar'
      },
      estado: 'aprobado',
      calificacionPromedio: 4.5,
      cantidadResenas: 1,
      historialEstados: [
        {
          estadoAnterior: 'pendiente',
          nuevoEstado: 'aprobado',
          adminId: adminUser._id,
          motivo: 'Documentación comercial en regla.'
        }
      ]
    });
    perfilSuper.comerciosIds.push(supermercado._id);
    await perfilSuper.save();

    // Comercio 3: Farmacia San Martín
    const farmacia = await Comercio.create({
      nombre: 'Farmacia San Martín',
      descripcion: 'Medicamentos, perfumería, dermocosmética, atención a todas las obras sociales y prepagas. Turnos rotativos.',
      categorias: [catMap['Farmacia y Salud']],
      direccion: 'Av. Alem 890',
      ubicacion: {
        type: 'Point',
        coordinates: [-62.2570, -38.7120]
      },
      contacto: {
        telefono: '0291-4554321',
        whatsapp: '+5492914554321',
        email: 'contacto@farmaciasanmartin.com'
      },
      estado: 'aprobado',
      calificacionPromedio: 5.0,
      cantidadResenas: 1,
      historialEstados: [
        {
          estadoAnterior: 'pendiente',
          nuevoEstado: 'aprobado',
          adminId: adminUser._id,
          motivo: 'Matrícula farmacéutica validada.'
        }
      ]
    });
    perfilFarmacia.comerciosIds.push(farmacia._id);
    await perfilFarmacia.save();

    // Comercio 4: Almacén Don Pepe (de SuperUser como 2da tienda)
    const donPepe = await Comercio.create({
      nombre: 'Almacén Don Pepe',
      descripcion: 'Tu almacén de barrio con fiambres de primera calidad, bebidas frías, pan del día y productos secos.',
      categorias: [catMap['Supermercado y Almacén'], catMap['Alimentos y Bebidas']],
      direccion: 'Zapiola 610',
      ubicacion: {
        type: 'Point',
        coordinates: [-62.2610, -38.7155]
      },
      contacto: {
        telefono: '0291-4512399',
        whatsapp: '+5492914512399',
        email: 'almacendonpepe@gmail.com'
      },
      estado: 'aprobado',
      calificacionPromedio: 4.2,
      cantidadResenas: 1
    });
    perfilSuper.comerciosIds.push(donPepe._id);
    await perfilSuper.save();

    // Comercio 5: Tienda pendiente de moderación
    const tiendaPendiente = await Comercio.create({
      nombre: 'Verdulería & Frutería La Estación',
      descripcion: 'Frutas y verduras frescas directo del mercado concentrador.',
      categorias: [catMap['Alimentos y Bebidas']],
      direccion: 'Donado 1150',
      ubicacion: {
        type: 'Point',
        coordinates: [-62.2710, -38.7280]
      },
      contacto: { telefono: '0291-4588991' },
      estado: 'pendiente',
      historialEstados: [
        {
          nuevoEstado: 'pendiente',
          motivo: 'Solicitud web enviada por comerciante.'
        }
      ]
    });

    // 7. Crear Productos (Especialmente diseñados para comparar precios en el Ranking)
    console.log('Creando productos con precios comparables para el ranking...');
    const productosData = [
      // Leche
      {
        nombre: 'Leche Entera Larga Vida 1L',
        descripcion: 'Leche entera ultrapasteurizada fortificada con vitaminas A y D.',
        precio: 1150,
        categoria: catMap['Supermercado y Almacén'],
        comercioId: supermercado._id,
        disponible: true
      },
      {
        nombre: 'Leche Entera Larga Vida 1L',
        descripcion: 'Leche de primera marca en sachet o tetrabrik 1 litro.',
        precio: 1350,
        categoria: catMap['Supermercado y Almacén'],
        comercioId: donPepe._id,
        disponible: true
      },
      {
        nombre: 'Leche Entera Larga Vida 1L',
        descripcion: 'Leche entera premium para cafetería y venta directa.',
        precio: 1400,
        categoria: catMap['Alimentos y Bebidas'],
        comercioId: panaderia._id,
        disponible: true
      },

      // Pan Francés
      {
        nombre: 'Pan Francés Tradicional (kg)',
        descripcion: 'Pan recién horneado, corteza crocante y miga aireada.',
        precio: 1900,
        categoria: catMap['Alimentos y Bebidas'],
        comercioId: panaderia._id,
        disponible: true
      },
      {
        nombre: 'Pan Francés Tradicional (kg)',
        descripcion: 'Pan de panadería local envasado en bolsa de papel.',
        precio: 2300,
        categoria: catMap['Supermercado y Almacén'],
        comercioId: donPepe._id,
        disponible: true
      },
      {
        nombre: 'Pan Francés Tradicional (kg)',
        descripcion: 'Pan de producción diaria en panadería interna.',
        precio: 2150,
        categoria: catMap['Supermercado y Almacén'],
        comercioId: supermercado._id,
        disponible: true
      },

      // Aceite Girasol
      {
        nombre: 'Aceite de Girasol 900ml',
        descripcion: 'Aceite puro de girasol refinado 900ml sin TACC.',
        precio: 1850,
        categoria: catMap['Supermercado y Almacén'],
        comercioId: supermercado._id,
        disponible: true
      },
      {
        nombre: 'Aceite de Girasol 900ml',
        descripcion: 'Aceite vegetal de girasol primera marca.',
        precio: 2100,
        categoria: catMap['Supermercado y Almacén'],
        comercioId: donPepe._id,
        disponible: true
      },

      // Harina 000
      {
        nombre: 'Harina 000 1kg',
        descripcion: 'Harina de trigo tradicional 000 ideal para panes y masas.',
        precio: 780,
        categoria: catMap['Supermercado y Almacén'],
        comercioId: supermercado._id,
        disponible: true
      },
      {
        nombre: 'Harina 000 1kg',
        descripcion: 'Harina común de trigo 1 kilo de excelente calidad.',
        precio: 950,
        categoria: catMap['Supermercado y Almacén'],
        comercioId: donPepe._id,
        disponible: true
      },
      {
        nombre: 'Harina 000 Especial Panadería 1kg',
        descripcion: 'Harina con alto contenido de gluten para pastelería y panificación.',
        precio: 850,
        categoria: catMap['Alimentos y Bebidas'],
        comercioId: panaderia._id,
        disponible: true
      },

      // Café Molido
      {
        nombre: 'Café Molido Tostado 500g',
        descripcion: 'Café tostado suave molido para cafetera de filtro.',
        precio: 4600,
        categoria: catMap['Supermercado y Almacén'],
        comercioId: supermercado._id,
        disponible: true
      },
      {
        nombre: 'Café Molido Tostado 500g',
        descripcion: 'Café clásico en paquete al vacío.',
        precio: 5200,
        categoria: catMap['Supermercado y Almacén'],
        comercioId: donPepe._id,
        disponible: true
      },

      // Farmacia
      {
        nombre: 'Paracetamol 500mg (20 comprimidos)',
        descripcion: 'Analgésico y antipirético de venta libre.',
        precio: 2400,
        categoria: catMap['Farmacia y Salud'],
        comercioId: farmacia._id,
        disponible: true
      },
      {
        nombre: 'Ibuprofeno 400mg (10 cápsulas blandas)',
        descripcion: 'Antiinflamatorio y analgésico de rápida acción.',
        precio: 2150,
        categoria: catMap['Farmacia y Salud'],
        comercioId: farmacia._id,
        disponible: true
      },
      {
        nombre: 'Termómetro Digital Infrarrojo',
        descripcion: 'Medición rápida y precisa sin contacto.',
        precio: 12500,
        categoria: catMap['Farmacia y Salud'],
        comercioId: farmacia._id,
        disponible: true
      }
    ];
    await Producto.insertMany(productosData);

    // 8. Crear Reseñas
    console.log('Creando opiniones y valoraciones iniciales...');
    await Resena.create([
      {
        comercioId: panaderia._id,
        usuarioId: cliente1._id,
        puntaje: 5,
        comentario: '¡Excelente panadería! Las medialunas de grasa y manteca son las mejores de Bahía. La atención es impecable.',
        respuestaComerciante: '¡Muchísimas gracias Martín por elegirnos siempre!'
      },
      {
        comercioId: panaderia._id,
        usuarioId: cliente2._id,
        puntaje: 4.5,
        comentario: 'Muy rico todo y precios súper accesibles en panadería tradicional.',
        respuestaComerciante: null
      },
      {
        comercioId: supermercado._id,
        usuarioId: cliente1._id,
        puntaje: 4.5,
        comentario: 'Muy buenos precios y variedad. Se nota el ahorro comparando con otros lugares.',
        respuestaComerciante: 'Gracias por tu visita, siempre buscamos las mejores ofertas para los vecinos.'
      },
      {
        comercioId: farmacia._id,
        usuarioId: cliente2._id,
        puntaje: 5,
        comentario: 'Atención profesional destacable. Me asesoraron perfectamente sobre la medicación.',
        respuestaComerciante: 'Gracias Sofía, estamos a tu entera disposición.'
      }
    ]);

    // 9. Crear Conversación y Mensajes de Chat
    console.log('Creando conversación de chat inicial...');
    const conversacion = await Conversacion.create({
      comercioId: panaderia._id,
      participantes: [cliente1._id, panaderoUser._id],
      ultimoMensaje: '¡Perfecto Roberto, paso a retirar a las 18hs!',
      fechaUltimoMensaje: new Date()
    });

    await Mensaje.create([
      {
        conversacionId: conversacion._id,
        emisorId: cliente1._id,
        contenido: 'Hola! ¿Tienen disponibles tortas de cumpleaños para el día de hoy?',
        leido: true,
        createdAt: new Date(Date.now() - 3600000)
      },
      {
        conversacionId: conversacion._id,
        emisorId: panaderoUser._id,
        contenido: 'Hola Martín! Sí, tenemos de selva negra y lemon pie recién salidas de pastelería.',
        leido: true,
        createdAt: new Date(Date.now() - 3000000)
      },
      {
        conversacionId: conversacion._id,
        emisorId: cliente1._id,
        contenido: '¡Perfecto Roberto, paso a retirar a las 18hs!',
        leido: true,
        createdAt: new Date(Date.now() - 2400000)
      }
    ]);

    console.log('\n======================================================');
    console.log('>>> ¡BASE DE DATOS INICIALIZADA CON ÉXITO! <<<');
    console.log('======================================================');
    console.log('Credenciales de acceso para demostración:');
    console.log('1. Administrador Municipal (Backoffice):');
    console.log('   Email:    admin@vidriera.gob.ar');
    console.log('   Password: 123456\n');
    console.log('2. Comerciante Panadería (Panel):');
    console.log('   Email:    panaderia@comercio.com');
    console.log('   Password: 123456\n');
    console.log('3. Comerciante Supermercado (Panel):');
    console.log('   Email:    super@comercio.com');
    console.log('   Password: 123456\n');
    console.log('4. Vecino / Cliente (Vidrieras y Chat):');
    console.log('   Email:    vecino@ciudad.com');
    console.log('   Password: 123456');
    console.log('======================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error durante la ejecución del seed:', error);
    process.exit(1);
  }
};

seedDatabase();
