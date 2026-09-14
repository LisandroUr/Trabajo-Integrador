const http = require('http');

const API_BASE = 'http://127.0.0.1:5000';

const request = (method, path, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

const runTests = async () => {
  console.log('====================================================');
  console.log('INICIANDO PRUEBAS DE INTEGRACIÓN DE LA API BACKEND');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  const test = async (nombre, fn) => {
    try {
      await fn();
      console.log(`[PASS] ${nombre}`);
      passed++;
    } catch (err) {
      console.error(`[FAIL] ${nombre}:`, err.message);
      failed++;
    }
  };

  let adminToken = '';
  let comercianteToken = '';
  let clienteToken = '';
  let comercioIdPrueba = '';
  let conversacionIdPrueba = '';

  // 1. Estado API
  await test('GET / debe responder con status online', async () => {
    const res = await request('GET', '/');
    if (res.status !== 200 || res.body.status !== 'online') {
      throw new Error(`Esperado 200 online, recibido: ${res.status}`);
    }
  });

  // 2. Login Admin
  await test('POST /api/auth/login (Admin)', async () => {
    const res = await request('POST', '/api/auth/login', {
      email: 'admin@vidriera.gob.ar',
      password: '123456'
    });
    if (res.status !== 200 || !res.body.token) throw new Error('No se obtuvo token admin');
    adminToken = res.body.token;
  });

  // 3. Login Comerciante
  await test('POST /api/auth/login (Comerciante Panadería)', async () => {
    const res = await request('POST', '/api/auth/login', {
      email: 'panaderia@comercio.com',
      password: '123456'
    });
    if (res.status !== 200 || !res.body.token) throw new Error('No se obtuvo token comerciante');
    comercianteToken = res.body.token;
  });

  // 4. Login Cliente
  await test('POST /api/auth/login (Cliente Vecino)', async () => {
    const res = await request('POST', '/api/auth/login', {
      email: 'vecino@ciudad.com',
      password: '123456'
    });
    if (res.status !== 200 || !res.body.token) throw new Error('No se obtuvo token vecino');
    clienteToken = res.body.token;
  });

  // 5. Categorías
  await test('GET /api/categorias (Listar categorías públicas)', async () => {
    const res = await request('GET', '/api/categorias');
    if (res.status !== 200 || !Array.isArray(res.body) || res.body.length === 0) {
      throw new Error('No se recibieron categorías válidas');
    }
  });

  // 6. Comercios públicos
  await test('GET /api/comercios (Listar comercios aprobados)', async () => {
    const res = await request('GET', '/api/comercios');
    if (res.status !== 200 || !res.body.data || res.body.data.length === 0) {
      throw new Error('No se encontraron comercios aprobados');
    }
    comercioIdPrueba = res.body.data[0]._id;
  });

  // 7. Comercios cercanos geoespaciales
  await test('GET /api/comercios/cercanos (Búsqueda por coordenadas Bahía Blanca)', async () => {
    const res = await request('GET', '/api/comercios/cercanos?lat=-38.7183&lng=-62.2642&maxDistancia=15000');
    if (res.status !== 200 || !Array.isArray(res.body)) {
      throw new Error(`Error en query geoespacial: ${res.status}`);
    }
  });

  // 8. Admin Backoffice
  await test('GET /api/comercios/admin/all (Ruta protegida RBAC Admin)', async () => {
    const res = await request('GET', '/api/comercios/admin/all', null, adminToken);
    if (res.status !== 200 || !res.body.data) {
      throw new Error(`Acceso admin denegado: ${res.status}`);
    }
  });

  // 9. Ranking y Comparador de Precios
  await test('GET /api/productos/ranking?q=Leche (Observatorio de Precios)', async () => {
    const res = await request('GET', '/api/productos/ranking?q=Leche');
    if (res.status !== 200 || !res.body.estadisticas || !res.body.productos) {
      throw new Error('Formato inválido de ranking');
    }
    if (res.body.productos.length < 2) {
      throw new Error('Se esperaban al menos 2 ofertas comparables de leche');
    }
    console.log(`      -> Ofertas comparadas: ${res.body.estadisticas.totalOfertas}`);
    console.log(`      -> Mejor precio: $${res.body.estadisticas.precioMinimo} | Promedio: $${res.body.estadisticas.precioPromedio} | Ahorro: ${res.body.estadisticas.porcentajeAhorro}%`);
  });

  // 10. Reseñas del comercio
  await test('GET /api/resenas/comercio/:id (Listar opiniones)', async () => {
    const res = await request('GET', `/api/resenas/comercio/${comercioIdPrueba}`);
    if (res.status !== 200 || !Array.isArray(res.body)) {
      throw new Error('Error al listar reseñas');
    }
  });

  // 11. Crear Reseña
  await test('POST /api/resenas (Cliente publica calificación)', async () => {
    const res = await request('POST', '/api/resenas', {
      comercioId: comercioIdPrueba,
      puntaje: 5,
      comentario: 'Excelente producto y atención rápida durante la prueba automática.'
    }, clienteToken);

    if (res.status !== 201 && res.status !== 200) {
      throw new Error(`Error al crear reseña: ${res.status}`);
    }
  });

  // 12. Conversaciones de Chat
  await test('GET /api/conversaciones (Listar chats del comerciante)', async () => {
    const res = await request('GET', '/api/conversaciones', null, comercianteToken);
    if (res.status !== 200 || !Array.isArray(res.body)) {
      throw new Error('Error al obtener conversaciones');
    }
    if (res.body.length > 0) {
      conversacionIdPrueba = res.body[0]._id;
    }
  });

  // 13. Obtener o Crear conversación Cliente-Comercio
  await test('POST /api/conversaciones (Iniciar chat con comercio)', async () => {
    const res = await request('POST', '/api/conversaciones', {
      comercioId: comercioIdPrueba
    }, clienteToken);
    if (res.status !== 200 || !res.body._id) {
      throw new Error('Error creando conversación cliente-comercio');
    }
    conversacionIdPrueba = res.body._id;
  });

  // 14. Enviar Mensaje en el Chat
  await test('POST /api/conversaciones/:id/mensajes (Enviar mensaje vía REST)', async () => {
    const res = await request('POST', `/api/conversaciones/${conversacionIdPrueba}/mensajes`, {
      contenido: 'Hola! Mensaje de verificación automática del sistema.'
    }, clienteToken);
    if (res.status !== 201 || !res.body.contenido) {
      throw new Error('Error al enviar mensaje');
    }
  });

  console.log('\n====================================================');
  console.log(`RESUMEN DE PRUEBAS: ${passed} PASADAS, ${failed} FALLIDAS`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
};

runTests().catch(err => {
  console.error('Error fatal ejecutando pruebas:', err);
  process.exit(1);
});
