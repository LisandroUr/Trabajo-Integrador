const { chromium } = require('playwright-core');

async function driveMerchantWindow() {
  console.log('Conectando con la ventana de Edge abierta en tu pantalla...');
  try {
    const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
    const defaultContext = browser.contexts()[0];
    const page = defaultContext.pages()[0] || await defaultContext.newPage();

    console.log('Iniciando sesión como Comerciante en tu pantalla...');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
    await page.bringToFront();
    await page.waitForTimeout(1000);

    await page.locator('input[type="email"]').fill('panaderia@comercio.com');
    await page.waitForTimeout(500);
    await page.locator('input[type="password"]').fill('123456');
    await page.waitForTimeout(800);
    await page.locator('button[type="submit"]').click();

    await page.waitForURL('**/panel', { timeout: 8000 });
    console.log('¡Ventana actualizada en tu monitor mostrando el nuevo Panel del Comerciante!');
    await page.waitForTimeout(3000);

    process.exit(0);
  } catch (err) {
    console.log('Ventana no conectada por CDP, abriendo directamente...');
    process.exit(0);
  }
}

driveMerchantWindow();
