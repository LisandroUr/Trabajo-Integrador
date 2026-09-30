const { chromium } = require('playwright-core');
const path = require('path');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');

async function testMerchant() {
  const browser = await chromium.launch({
    executablePath: EDGE_PATH,
    headless: true
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  console.log('Iniciando sesión como Comerciante...');
  await page.goto('http://localhost:3000/login');
  await page.locator('input[type="email"]').fill('panaderia@comercio.com');
  await page.locator('input[type="password"]').fill('123456');
  await page.locator('button[type="submit"]').click();
  await page.waitForURL('**/panel', { timeout: 8000 });
  await page.waitForTimeout(1500);

  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '6_panel_comerciante.png') });
  console.log('[PASS] Captura 6_panel_comerciante.png guardada');

  console.log('Navegando al Catálogo del Comercio...');
  await page.click('text=Administrar Catálogo');
  await page.waitForURL('**/panel/comercio/**', { timeout: 8000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '8_panel_catalogo.png') });
  console.log('[PASS] Captura 8_panel_catalogo.png guardada');

  await page.goto('http://localhost:3000/panel/mensajes');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '7_panel_mensajes.png') });
  console.log('[PASS] Captura 7_panel_mensajes.png guardada');

  await browser.close();
  console.log('Test comerciante finalizado exitosamente.');
}

testMerchant();
