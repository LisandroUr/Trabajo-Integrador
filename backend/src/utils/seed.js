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
        descripcion: 'Dueño de comercio o prestador de servicios que gestiona su vidriera y catálogo',
        permisos: ['gestionar_vidriera', 'gestionar_productos', 'responder_chat', 'responder_resenas']
      },
      {
        nombre: 'cliente',
        descripcion: 'Vecino o usuario general que busca, califica y consulta',
        permisos: ['ver_vidriera', 'iniciar_chat', 'crear_resena', 'guardar_favoritos']
      }
    ];
    const rolesCreados = await Rol.insertMany(rolesData);
    const rolMap = {};
    rolesCreados.forEach(r => { rolMap[r.nombre] = r._id; });

    // 3. Crear Categorías Reales
    console.log('Creando categorías...');
    const categoriasData = [
      { nombre: 'Celulares y Tecnología', icono: 'Smartphone' },
      { nombre: 'Audio y Sonido', icono: 'Headphones' },
      { nombre: 'Indumentaria y Calzado', icono: 'Shirt' },
      { nombre: 'Hogar y Bazar', icono: 'Coffee' },
      { nombre: 'Servicios Eléctricos', icono: 'Zap' },
      { nombre: 'Plomería y Gas', icono: 'Wrench' },
      { nombre: 'Soporte Técnico PC', icono: 'Cpu' }
    ];
    const categoriasCreadas = await Categoria.insertMany(categoriasData);
    const catMap = {};
    categoriasCreadas.forEach(c => { catMap[c.nombre] = c._id; });

    // 4. Hash genérico de contraseñas
    const passwordGenerica = await bcrypt.hash('123456', 10);

    // 5. Crear Usuarios y Perfiles
    console.log('Creando usuarios y perfiles...');

    // A) Administrador Municipal (Backoffice)
    const adminUser = await Usuario.create({
      nombre: 'Lic. Mariano Valenzuela (Admin)',
      email: 'admin@vidriera.gob.ar',
      password: passwordGenerica,
      roles: [rolMap['superadmin']]
    });
    await PerfilAdminMunicipal.create({
      usuarioId: adminUser._id,
      cargo: 'Director General de Fiscalización y Comercio',
      area: 'Secretaría de Desarrollo Productivo'
    });

    // B) Dueño de Local Comercial: Javier Fernández (Tech Store Palermo)
    const localUser = await Usuario.create({
      nombre: 'Javier Fernández',
      email: 'techstore@palermo.com',
      password: passwordGenerica,
      roles: [rolMap['comerciante']]
    });
    const perfilLocal = await PerfilComerciante.create({
      usuarioId: localUser._id,
      cuit: '20-33445566-7',
      razonSocial: 'Tecnología Palermo S.A.'
    });

    // C) Prestador de Servicios: Carlos Mendonça (Electricista Matriculado)
    const electricistaUser = await Usuario.create({
      nombre: 'Carlos Mendonça (Electricista)',
      email: 'electricista@servicios.com',
      password: passwordGenerica,
      roles: [rolMap['comerciante']]
    });
    const perfilElectricista = await PerfilComerciante.create({
      usuarioId: electricistaUser._id,
      cuit: '20-27891234-5',
      razonSocial: 'Mendonça Servicios Eléctricos Integrales'
    });

    // D) Prestador de Servicios: Horacio Benítez (Plomería y Gas)
    const plomeroUser = await Usuario.create({
      nombre: 'Horacio Benítez (Sanitarios del Sol)',
      email: 'plomeria@servicios.com',
      password: passwordGenerica,
      roles: [rolMap['comerciante']]
    });
    const perfilPlomero = await PerfilComerciante.create({
      usuarioId: plomeroUser._id,
      cuit: '20-21345678-9',
      razonSocial: 'Sanitarios del Sol Instalaciones'
    });

    // E) Prestador de Servicios: Marcos Vega (Servicio Técnico PC)
    const pcUser = await Usuario.create({
      nombre: 'Marcos Vega (Laboratorio PC)',
      email: 'soporte@laboratoriopc.com',
      password: passwordGenerica,
      roles: [rolMap['comerciante']]
    });
    const perfilPC = await PerfilComerciante.create({
      usuarioId: pcUser._id,
      cuit: '20-31892345-1',
      razonSocial: 'Laboratorio Digital PC SRL'
    });

    // F) Clientes Vecinos
    const cliente1 = await Usuario.create({
      nombre: 'Martín Benítez (Vecino)',
      email: 'vecino@ciudad.com',
      password: passwordGenerica,
      roles: [rolMap['cliente']]
    });
    await PerfilCliente.create({
      usuarioId: cliente1._id,
      direccionPredeterminada: 'Av. Santa Fe 3400, Palermo'
    });

    const cliente2 = await Usuario.create({
      nombre: 'Sofía Álvarez (Vecina)',
      email: 'sofia@ciudad.com',
      password: passwordGenerica,
      roles: [rolMap['cliente']]
    });
    await PerfilCliente.create({
      usuarioId: cliente2._id,
      direccionPredeterminada: 'Bulnes 1250, Almagro'
    });

    // 6. Crear Comercios / Vidrieras
    console.log('Creando comercios y vidrieras reales...');

    // COMERCIO 1: LOCAL COMERCIAL (APROBADO / VERIFICADO)
    const comercioLocal = await Comercio.create({
      nombre: 'Tech Store Palermo',
      descripcion: 'Tienda líder en telefonía móvil, audio de alta fidelidad, tecnología y accesorios con garantía oficial.',
      categorias: [catMap['Celulares y Tecnología'], catMap['Audio y Sonido']],
      tipo: 'producto',
      direccion: 'Av. Santa Fe 3240, Palermo, CABA',
      ubicacion: {
        type: 'Point',
        coordinates: [-58.4115, -34.5875]
      },
      contacto: {
        telefono: '011-4822-9900',
        whatsapp: '+5491148229900',
        email: 'ventas@techstorepalermo.com',
        redes: ['@techstorepalermo']
      },
      horarios: [
        { dia: 1, horaApertura: '09:00', horaCierre: '20:00' },
        { dia: 2, horaApertura: '09:00', horaCierre: '20:00' },
        { dia: 3, horaApertura: '09:00', horaCierre: '20:00' },
        { dia: 4, horaApertura: '09:00', horaCierre: '20:00' },
        { dia: 5, horaApertura: '09:00', horaCierre: '20:00' },
        { dia: 6, horaApertura: '10:00', horaCierre: '18:00' }
      ],
      vidriera: {
        logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
        bannerPrincipal: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=1600&auto=format&fit=crop&q=80',
        colores: ['#0284c7', '#38bdf8'],
        galeria: [
          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80'
        ]
      },
      estado: 'aprobado', // ¡Verificado por el Administrador!
      calificacionPromedio: 4.8,
      cantidadResenas: 14,
      historialEstados: [
        {
          estadoAnterior: 'pendiente',
          nuevoEstado: 'aprobado',
          adminId: adminUser._id,
          motivo: 'Habilitación comercial aprobada e inspección técnica verificada en el backoffice.'
        }
      ]
    });
    perfilLocal.comerciosIds.push(comercioLocal._id);
    await perfilLocal.save();

    // COMERCIO 2: PRESTADOR DE SERVICIOS (PENDIENTE DE VERIFICACIÓN)
    // Figura en la plataforma inmediatamente pero sin el verificado hasta que el admin actúe
    const servicioElectricista = await Comercio.create({
      nombre: 'ElectroServicios CABA - Electricista Matriculado 24hs',
      descripcion: 'Servicio profesional de electricidad domiciliaria, comercial e industrial. Urgencias las 24 horas, certificados DCI para Edenor/Edesur, recableados y tableros con disyuntor.',
      categorias: [catMap['Servicios Eléctricos']],
      tipo: 'servicio',
      direccion: 'Av. Corrientes 4520, Almagro, CABA',
      ubicacion: {
        type: 'Point',
        coordinates: [-58.4285, -34.6045]
      },
      contacto: {
        telefono: '011-4861-3322',
        whatsapp: '+5491148613322',
        email: 'urgencias@electroservicioscaba.com',
        redes: ['@electroservicioscaba']
      },
      horarios: [
        { dia: 0, horaApertura: '00:00', horaCierre: '23:59' },
        { dia: 1, horaApertura: '00:00', horaCierre: '23:59' },
        { dia: 2, horaApertura: '00:00', horaCierre: '23:59' },
        { dia: 3, horaApertura: '00:00', horaCierre: '23:59' },
        { dia: 4, horaApertura: '00:00', horaCierre: '23:59' },
        { dia: 5, horaApertura: '00:00', horaCierre: '23:59' },
        { dia: 6, horaApertura: '00:00', horaCierre: '23:59' }
      ],
      vidriera: {
        logo: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=200&auto=format&fit=crop&q=80',
        bannerPrincipal: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1600&auto=format&fit=crop&q=80',
        colores: ['#0284c7', '#38bdf8'],
        galeria: [
          'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80'
        ]
      },
      estado: 'pendiente', // ¡PENDIENTE! Figura en la web pero sin verificación hasta que admin actúe
      calificacionPromedio: 4.9,
      cantidadResenas: 9,
      historialEstados: [
        {
          nuevoEstado: 'pendiente',
          motivo: 'Registro inicial efectuado por el profesional en la plataforma.'
        }
      ]
    });
    perfilElectricista.comerciosIds.push(servicioElectricista._id);
    await perfilElectricista.save();

    // COMERCIO 3: PRESTADOR DE SERVICIOS (APROBADO)
    const servicioPlomero = await Comercio.create({
      nombre: 'Sanitarios del Sol - Plomería y Gasista Certificado',
      descripcion: 'Especialistas en instalaciones sanitarias, detección de fugas de gas, destapaciones cloacales con máquina rotativa y colocación de termotanques.',
      categorias: [catMap['Plomería y Gas']],
      tipo: 'servicio',
      direccion: 'Av. Las Heras 2310, Recoleta, CABA',
      ubicacion: {
        type: 'Point',
        coordinates: [-58.3965, -34.5880]
      },
      contacto: {
        telefono: '011-4805-7766',
        whatsapp: '+5491148057766',
        email: 'info@sanitariosdelsol.com.ar',
        redes: ['@sanitariosdelsol']
      },
      vidriera: {
        logo: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=200&auto=format&fit=crop&q=80',
        bannerPrincipal: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1600&auto=format&fit=crop&q=80',
        colores: ['#0284c7', '#38bdf8']
      },
      estado: 'aprobado',
      calificacionPromedio: 4.9,
      cantidadResenas: 11,
      historialEstados: [
        {
          estadoAnterior: 'pendiente',
          nuevoEstado: 'aprobado',
          adminId: adminUser._id,
          motivo: 'Matrícula de gasista y técnico sanitario verificada en Backoffice.'
        }
      ]
    });
    perfilPlomero.comerciosIds.push(servicioPlomero._id);
    await perfilPlomero.save();

    // COMERCIO 4: PRESTADOR DE SERVICIOS (APROBADO) - SOPORTE TÉCNICO PC
    const servicioPC = await Comercio.create({
      nombre: 'Laboratorio Digital PC - Reparación & Mantenimiento',
      descripcion: 'Laboratorio especializado en mantenimiento preventivo, cambio de pantallas, reballing, armado de computadoras gamers y recuperación de datos.',
      categorias: [catMap['Soporte Técnico PC']],
      tipo: 'servicio',
      direccion: 'Av. Cabildo 2180, Belgrano, CABA',
      ubicacion: {
        type: 'Point',
        coordinates: [-58.4560, -34.5610]
      },
      contacto: {
        telefono: '011-4788-5522',
        whatsapp: '+5491147885522',
        email: 'soporte@laboratoriopc.com',
        redes: ['@labdigitalpc']
      },
      vidriera: {
        logo: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=200&auto=format&fit=crop&q=80',
        bannerPrincipal: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&auto=format&fit=crop&q=80',
        colores: ['#0284c7', '#38bdf8']
      },
      estado: 'aprobado',
      calificacionPromedio: 4.8,
      cantidadResenas: 8,
      historialEstados: [
        {
          estadoAnterior: 'pendiente',
          nuevoEstado: 'aprobado',
          adminId: adminUser._id,
          motivo: 'Inscripción comercial y habilitación de laboratorio técnico validada.'
        }
      ]
    });
    perfilPC.comerciosIds.push(servicioPC._id);
    await perfilPC.save();

    // 7. Crear Productos y Servicios Reales
    console.log('Creando productos y servicios reales en la base de datos...');
    const itemsData = [
      // ==========================================
      // PRODUCTOS (Tech Store Palermo - Aprobado)
      // ==========================================
      {
        nombre: 'Celular Samsung Galaxy S23',
        descripcion: 'Smartphone Samsung Galaxy S23 128GB Phantom Black con cámara de 50MP, procesador Snapdragon 8 Gen 2 y pantalla Dynamic AMOLED 2X de 120Hz.',
        precio: 129999,
        imagen: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80',
        categoria: catMap['Celulares y Tecnología'],
        comercioId: comercioLocal._id,
        tipo: 'producto',
        disponible: true
      },
      {
        nombre: 'Marshall headphones',
        descripcion: 'Auriculares inalámbricos Marshall Major IV Bluetooth con más de 80 horas de reproducción continua, carga inalámbrica y sonido característico Marshall.',
        precio: 129999,
        imagen: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
        categoria: catMap['Audio y Sonido'],
        comercioId: comercioLocal._id,
        tipo: 'producto',
        disponible: true
      },
      {
        nombre: 'Zapatillas Adidas Ultraboost',
        descripcion: 'Zapatillas de running Adidas Ultraboost Light para hombre. Amortiguación Boost de máxima respuesta y tejido Primeknit transpirable.',
        precio: 129999,
        imagen: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=600&auto=format&fit=crop&q=80',
        categoria: catMap['Indumentaria y Calzado'],
        comercioId: comercioLocal._id,
        tipo: 'producto',
        disponible: true
      },
      {
        nombre: 'Coffee foot maker',
        descripcion: 'Cafetera de goteo programable con jarra de vidrio térmico de 1.5 litros, selector de intensidad de aroma y función de mantenimiento de calor.',
        precio: 129999,
        imagen: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=600&auto=format&fit=crop&q=80',
        categoria: catMap['Hogar y Bazar'],
        comercioId: comercioLocal._id,
        tipo: 'producto',
        disponible: true
      },

      // ==========================================
      // SERVICIOS (ElectroServicios CABA - Pendiente de Verificación)
      // ==========================================
      {
        nombre: 'Electricista Matriculado 24hs - Guardia Urgencia',
        descripcion: 'Instalaciones domiciliarias e industriales, resolución de cortocircuitos, restablecimiento de energía, guardias las 24 horas.',
        precio: 25000,
        imagen: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80',
        categoria: catMap['Servicios Eléctricos'],
        comercioId: servicioElectricista._id,
        tipo: 'servicio',
        disponible: true
      },
      {
        nombre: 'Certificación DCI e Informe Técnico Puesta a Tierra',
        descripcion: 'Certificado de Aptitud Eléctrica (DCI) emitido por profesional matriculado COPIME para solicitud de nuevo medidor en Edenor y Edesur.',
        precio: 55000,
        imagen: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=600&auto=format&fit=crop&q=80',
        categoria: catMap['Servicios Eléctricos'],
        comercioId: servicioElectricista._id,
        tipo: 'servicio',
        disponible: true
      },
      {
        nombre: 'Instalación de Tablero Eléctrico Modular',
        descripcion: 'Armado de tablero reglamentario con disyuntor diferencial, llaves termomagnéticas por circuito y medición de jabalina.',
        precio: 75000,
        imagen: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32b?w=600&auto=format&fit=crop&q=80',
        categoria: catMap['Servicios Eléctricos'],
        comercioId: servicioElectricista._id,
        tipo: 'servicio',
        disponible: true
      },
      {
        nombre: 'Detección de Cortocircuitos y Fugas Eléctricas',
        descripcion: 'Localización con instrumental digital de caídas de tensión y fugas a tierra que activan el disyuntor.',
        precio: 32000,
        imagen: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
        categoria: catMap['Servicios Eléctricos'],
        comercioId: servicioElectricista._id,
        tipo: 'servicio',
        disponible: true
      },

      // ==========================================
      // SERVICIOS (Sanitarios del Sol - Aprobado / Verificado)
      // ==========================================
      {
        nombre: 'Plomería y Gasista Certificado - Diagnóstico',
        descripcion: 'Reparación de pérdidas de agua y gas, cambio de griferías, llaves de paso y soldaduras de plomo/termofusión.',
        precio: 18500,
        imagen: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
        categoria: catMap['Plomería y Gas'],
        comercioId: servicioPlomero._id,
        tipo: 'servicio',
        disponible: true
      },
      {
        nombre: 'Destapaciones Cloacales y Pluviales con Máquina',
        descripcion: 'Desobstrucción mecánica profunda con cables rotativos de acero para cañerías de cocina, baño y pluviales.',
        precio: 28000,
        imagen: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop&q=80',
        categoria: catMap['Plomería y Gas'],
        comercioId: servicioPlomero._id,
        tipo: 'servicio',
        disponible: true
      },
      {
        nombre: 'Instalación y Service de Termotanques y Calderas',
        descripcion: 'Montaje de artefactos a gas y eléctricos, regulación de quemadores, cambio de ánodos de magnesio y ventilaciones según norma.',
        precio: 42000,
        imagen: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&auto=format&fit=crop&q=80',
        categoria: catMap['Plomería y Gas'],
        comercioId: servicioPlomero._id,
        tipo: 'servicio',
        disponible: true
      },

      // ==========================================
      // SERVICIOS (Laboratorio Digital PC - Aprobado / Verificado)
      // ==========================================
      {
        nombre: 'Mantenimiento Preventivo y Optimización PC & Mac',
        descripcion: 'Limpieza interna de disipadores, recambio de pasta térmica de alta conductividad, optimización de sistema y backup seguro.',
        precio: 15000,
        imagen: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&auto=format&fit=crop&q=80',
        categoria: catMap['Soporte Técnico PC'],
        comercioId: servicioPC._id,
        tipo: 'servicio',
        disponible: true
      },
      {
        nombre: 'Reparación de Placa Madre y Reballing de Chipset',
        descripcion: 'Microelectrónica de precisión para notebooks que no encienden o tienen cortos en líneas de alimentación.',
        precio: 38000,
        imagen: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
        categoria: catMap['Soporte Técnico PC'],
        comercioId: servicioPC._id,
        tipo: 'servicio',
        disponible: true
      }
    ];

    await Producto.insertMany(itemsData);

    // 8. Crear Reseñas Reales
    console.log('Creando opiniones y valoraciones reales...');
    await Resena.create([
      {
        comercioId: comercioLocal._id,
        usuarioId: cliente1._id,
        puntaje: 5,
        comentario: 'Excelente atención en Tech Store Palermo. Compré el celular y me vino con garantía oficial en el acto.',
        respuestaComerciante: 'Muchas gracias Martín por confiar en nosotros. ¡Que disfrutes tu compra!'
      },
      {
        comercioId: comercioLocal._id,
        usuarioId: cliente2._id,
        puntaje: 4.8,
        comentario: 'Muy buen surtido de auriculares y tecnología. El local es impecable.',
        respuestaComerciante: null
      },
      {
        comercioId: servicioElectricista._id,
        usuarioId: cliente1._id,
        puntaje: 5,
        comentario: 'Nos quedamos sin luz un domingo a la noche y Carlos vino en 25 minutos. Resolvió el corto del tablero enseguida. Súper recomendable.',
        respuestaComerciante: 'Gracias Martín, para eso estamos las 24 horas.'
      },
      {
        comercioId: servicioPlomero._id,
        usuarioId: cliente2._id,
        puntaje: 4.9,
        comentario: 'Excelente trabajo de plomería, puntual y muy prolijo.',
        respuestaComerciante: 'Un placer atenderla Sofía.'
      },
      {
        comercioId: servicioPC._id,
        usuarioId: cliente1._id,
        puntaje: 5,
        comentario: 'Me revivieron la notebook con el cambio de pasta térmica y limpieza. Quedó como nueva.',
        respuestaComerciante: '¡Gracias por elegir nuestro laboratorio!'
      }
    ]);

    // 9. Conversación inicial de chat
    const conversacion = await Conversacion.create({
      comercioId: comercioLocal._id,
      participantes: [cliente1._id, localUser._id],
      ultimoMensaje: '¡Hola! ¿Tienen stock en color Phantom Black para retirar hoy?',
      fechaUltimoMensaje: new Date()
    });

    await Mensaje.create([
      {
        conversacionId: conversacion._id,
        emisorId: cliente1._id,
        contenido: '¡Hola! ¿Tienen stock en color Phantom Black para retirar hoy?',
        leido: true,
        createdAt: new Date(Date.now() - 3600000)
      },
      {
        conversacionId: conversacion._id,
        emisorId: localUser._id,
        contenido: 'Hola Martín! Sí, tenemos stock inmediato en nuestra sucursal de Av. Santa Fe 3240 hasta las 20hs.',
        leido: true,
        createdAt: new Date(Date.now() - 3000000)
      }
    ]);

    console.log('\n======================================================');
    console.log('>>> ¡BASE DE DATOS INICIALIZADA CON DATOS REALES! <<<');
    console.log('======================================================');
    console.log('1. Administrador (Backoffice):');
    console.log('   Email:    admin@vidriera.gob.ar');
    console.log('   Password: 123456\n');
    console.log('2. Dueño de Local Comercial (Verificado):');
    console.log('   Nombre:   Tech Store Palermo');
    console.log('   Email:    techstore@palermo.com');
    console.log('   Password: 123456\n');
    console.log('3. Prestador de Servicios (Pendiente de Verificación):');
    console.log('   Nombre:   ElectroServicios CABA - Electricista Matriculado 24hs');
    console.log('   Email:    electricista@servicios.com');
    console.log('   Password: 123456\n');
    console.log('4. Prestador de Servicios (Verificado):');
    console.log('   Nombre:   Sanitarios del Sol - Plomería y Gasista Certificado');
    console.log('   Email:    plomeria@servicios.com');
    console.log('   Password: 123456\n');
    console.log('5. Prestador de Servicios (Verificado):');
    console.log('   Nombre:   Laboratorio Digital PC - Reparación & Mantenimiento');
    console.log('   Email:    soporte@laboratoriopc.com');
    console.log('   Password: 123456\n');
    console.log('======================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error durante la ejecución del seed:', error);
    process.exit(1);
  }
};

seedDatabase();
