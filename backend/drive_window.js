const { chromium } = require('playwright-core');

async function driveVisibleBrowser() {
  console.log('Conectando con la ventana activa de Edge en tu pantalla...');
  try {
    const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
    const defaultContext = browser.contexts()[0];
    const page = defaultContext.pages()[0] || await defaultContext.newPage();

    console.log('[1/5] Llevando la ventana a la Portada Cívica...');
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
    await page.bringToFront();
    await page.waitForTimeout(3000);

    console.log('[2/5] Navegando al Observatorio de Precios...');
    await page.goto('http://localhost:3000/ranking', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    console.log('       Tipeando "Leche" en el buscador de la ventana...');
    const searchInput = page.locator('input[type="text"]');
    if (await searchInput.count() > 0) {
      await searchInput.click();
      await searchInput.fill('Leche');
      await page.waitForTimeout(2000);
    }

    console.log('       Cambiando la pestaña a Gráfico Analítico...');
    const chartBtn = page.getByRole('button', { name: 'Gráfico Analítico' });
    if (await chartBtn.count() > 0) {
      await chartBtn.click();
      await page.waitForTimeout(3000);
    }

    console.log('[3/5] Abriendo el Mapa Interactivo de Bahía Blanca...');
    await page.goto('http://localhost:3000/mapa', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3500);

    console.log('[4/5] Navegando al Directorio de Vidrieras...');
    await page.goto('http://localhost:3000/buscar', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    console.log('[5/5] Iniciando sesión como Administrador...');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    await page.locator('input[type="email"]').fill('admin@vidriera.gob.ar');
    await page.waitForTimeout(800);
    await page.locator('input[type="password"]').fill('123456');
    await page.waitForTimeout(1000);
    await page.locator('button[type="submit"]').click();

    await page.waitForURL('**/backoffice', { timeout: 8000 });
    console.log('       ¡Redirección exitosa al panel de Control & Fiscalización Cívica!');
    await page.waitForTimeout(4000);

    console.log('\n¡Recorrido interactivo completado! Dejando la ventana abierta en tu pantalla.');
    process.exit(0);
  } catch (err) {
    console.error('Error al controlar la ventana:', err.message);
    process.exit(1);
  }
}

driveVisibleBrowser();
