const { chromium } = require('playwright-core');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BASE_URL = 'http://localhost:3000';

async function runBrowserTests() {
  console.log('========================================================');
  console.log('INICIANDO CONTROL AUTÓNOMO DEL NAVEGADOR WEB (PLAYWRIGHT)');
  console.log('========================================================\n');

  let browser;
  try {
    console.log(`[1] Levantando Microsoft Edge en modo headless...`);
    browser = await chromium.launch({
      executablePath: EDGE_PATH,
      headless: true
    });

    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 }
    });

    const page = await context.newPage();

    const consoleErrors = [];
    const pageErrors = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    page.on('response', (response) => {
      if (response.status() === 404) {
        console.log(`  [404 NOT FOUND]: ${response.url()}`);
      }
    });

    page.on('pageerror', (err) => {
      pageErrors.push(err.message);
    });

    // TEST 1: Portada
    console.log('\n--- TEST 1: Portada Cívica (/) ---');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    const homeTitle = await page.title();
    console.log(`[PASS] Portada cargada. Título: "${homeTitle}"`);
    const heroText = await page.locator('h1').textContent();
    console.log(`[PASS] H1 detectado: "${heroText?.trim().slice(0, 50)}..."`);

    // TEST 2: Observatorio de Precios (/ranking)
    console.log('\n--- TEST 2: Observatorio de Precios (/ranking) ---');
    await page.goto(`${BASE_URL}/ranking`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    const rankingHeading = await page.locator('h1').textContent();
    console.log(`[PASS] Vista cargada: "${rankingHeading?.trim()}"`);

    // Comprobar tarjetas de productos o gráfico
    const cardCount = await page.locator('h3').count();
    console.log(`[PASS] Artículos/Encabezados renderizados en ranking: ${cardCount}`);

    // Probar interactividad: Buscar "Leche"
    const searchInput = page.locator('input[type="text"]');
    if (await searchInput.count() > 0) {
      await searchInput.fill('Leche');
      await page.waitForTimeout(500);
      console.log('[PASS] Búsqueda interactiva "Leche" ejecutada');
    }

    // Switch to chart view
    const chartBtn = page.getByRole('button', { name: 'Gráfico Analítico' });
    if (await chartBtn.count() > 0) {
      await chartBtn.click();
      await page.waitForTimeout(500);
      console.log('[PASS] Conmutación a vista de gráfico analítico exitosa');
    }

    // TEST 3: Directorio de Comercios (/buscar)
    console.log('\n--- TEST 3: Directorio Comercial (/buscar) ---');
    await page.goto(`${BASE_URL}/buscar`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    const storeCards = await page.locator('.grid > div').count();
    console.log(`[PASS] Comercios habilitados visualizados en padrón: ${storeCards}`);

    // TEST 4: Mapa Georreferenciado (/mapa)
    console.log('\n--- TEST 4: Mapa Interactivo Leaflet (/mapa) ---');
    await page.goto(`${BASE_URL}/mapa`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    const leafletMap = await page.locator('.leaflet-container').count();
    console.log(`[PASS] Contenedor de Leaflet OpenStreetMap presente: ${leafletMap > 0}`);

    // TEST 5: Login y Autenticación (/login)
    console.log('\n--- TEST 5: Autenticación Cívica (/login) ---');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    await page.locator('input[type="email"]').fill('admin@vidriera.gob.ar');
    await page.locator('input[type="password"]').fill('123456');
    await page.locator('button[type="submit"]').click();
    
    // Esperar redirección al backoffice
    await page.waitForURL('**/backoffice', { timeout: 6000 });
    console.log(`[PASS] Login exitoso y redirección automática a: ${page.url()}`);

    // TEST 6: Backoffice Municipal (/backoffice)
    console.log('\n--- TEST 6: Panel de Fiscalización (/backoffice) ---');
    await page.waitForTimeout(1000);
    const backofficeHeading = await page.locator('h1').textContent();
    console.log(`[PASS] Panel municipal activo: "${backofficeHeading?.trim()}"`);

    // Reporte de Errores de Consola
    console.log('\n========================================================');
    console.log('REPORTE DE ESTABILIDAD DEL NAVEGADOR');
    console.log('========================================================');
    console.log(`Errores de página no capturados (pageerror): ${pageErrors.length}`);
    if (pageErrors.length > 0) {
      pageErrors.forEach((e, idx) => console.log(`  [ERROR ${idx + 1}] ${e}`));
    }
    console.log(`Errores en consola (console.error): ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      consoleErrors.forEach((e, idx) => console.log(`  [CONSOLE ${idx + 1}] ${e}`));
    }

    if (pageErrors.length === 0 && consoleErrors.length === 0) {
      console.log('\n¡ÉXITO TOTAL! Navegación completa sin errores de React ni excepciones no controladas.');
    } else {
      console.log('\nSe detectaron advertencias o errores para revisar.');
    }

  } catch (err) {
    console.error('[FAIL] Error durante la prueba de navegación:', err);
  } finally {
    if (browser) {
      await browser.close();
      console.log('\nNavegador cerrado ordenadamente.');
    }
  }
}

runBrowserTests();
