/* Prueba de salida: entra al juego, hace una jugada y toca «Salir» o «Nueva»
   sin esperar al rival. Caza los temporizadores que repintan una pantalla que
   ya no está — el botón de atrás no sirve para esto porque recarga la página.

   Cómo se corre: igual que prueba-manoseo.js (servidor en el 8321 + playwright).
*/
const { chromium } = require('playwright');
const fs = require('fs');
const BASE = 'http://localhost:8321';
const EXE = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const JUEGOS = require('path').join(__dirname, '..', 'juegos');

(async () => {
  const browser = await chromium.launch({ executablePath: EXE });
  // Sin service worker y con movimiento: si no, el SW sirve archivos viejos
  // desde su caché y Chromium sin pantalla apaga las animaciones.
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 },
    serviceWorkers: 'block', reducedMotion: 'no-preference' });
  const dirs = fs.readdirSync(JUEGOS).sort();
  const fallas = [];

  for (const d of dirs) {
    const page = await ctx.newPage();
    await page.route('**/fonts.g*', (r) => r.abort());
    const errs = [];
    page.on('pageerror', (e) => errs.push('PAGEERROR: ' + e.message));
    page.on('console', (m) => {
      if (m.type() === 'error' && !/Failed to load|fonts\.g|net::ERR/.test(m.text())) errs.push(m.text());
    });
    // dos pasadas: salir a media partida, y pedir partida nueva a media partida
    for (const via of ['#t-salir', '#t-nueva']) {
      try {
        await page.goto(`${BASE}/juegos/${d}/`, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(300);
        const arranque = (await page.$('#new')) || (await page.$('.g-setup .btn-primary'));
        if (arranque) { await arranque.click(); await page.waitForTimeout(600); }

        // unas jugadas y fuera, sin esperar al rival
        const clicables = await page.$$('.screen [data-i], .screen [data-k], .screen .cc, .screen .rc, .screen .cardk');
        for (const el of clicables.slice(0, 4)) {
          try { await el.click({ timeout: 400, force: true }); } catch (e) { /* da igual */ }
          await page.waitForTimeout(50);
        }
        const boton = await page.$(via);
        if (!boton) continue;
        try { await boton.click({ timeout: 600, force: true }); } catch (e) { continue; }
        await page.waitForTimeout(2500);   // que caduquen los temporizadores del rival
      } catch (e) {
        errs.push(`EXCEPCIÓN ${e.message.slice(0, 80)}`);
      }
    }
    if (errs.length) fallas.push(`${d}: ${[...new Set(errs)].slice(0, 2).join(' | ')}`);
    await page.close();
  }

  console.log(`juegos probados: ${dirs.length}`);
  console.log(fallas.length ? 'PROBLEMAS:\n' + fallas.join('\n') : 'salir o reiniciar a media partida no rompe ningún juego');
  await browser.close();
})().catch((e) => { console.error('FALLO:', e); process.exit(1); });
