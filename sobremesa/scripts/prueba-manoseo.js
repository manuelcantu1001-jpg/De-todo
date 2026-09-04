/* Prueba de robustez: entra a cada juego, lo arranca y lo manosea a tocazos.
   No depende de nombres internos, así que sobrevive a los cambios.

   Cómo se corre:
     python3 -m http.server 8321 &      (desde la raíz del repo)
     npm i playwright                   (una vez, donde vayas a correrlo)
     node scripts/prueba-manoseo.js
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
  // SOLO=carpeta1,carpeta2 limita la prueba a esas carpetas (para probar un juego nuevo)
  const dirs = fs.readdirSync(JUEGOS).sort().filter((d) => !process.env.SOLO || process.env.SOLO.split(',').includes(d));
  const fallas = [];

  for (const d of dirs) {
    const page = await ctx.newPage();
    await page.route('**/fonts.g*', (r) => r.abort());
    const errs = [];
    page.on('pageerror', (e) => errs.push('PAGEERROR: ' + e.message));
    page.on('console', (m) => {
      if (m.type() === 'error' && !/Failed to load|fonts\.g|net::ERR/.test(m.text())) errs.push(m.text());
    });
    try {
      await page.goto(`${BASE}/juegos/${d}/`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(350);

      // Arrancar: el botón principal de la pantalla de inicio
      const arranque = await page.$('#new') || await page.$('.g-setup .btn-primary');
      if (arranque) { await arranque.click(); await page.waitForTimeout(700); }

      // Manosear: 25 toques en elementos interactivos del tablero
      for (let k = 0; k < 25; k++) {
        const clicables = await page.$$('.screen button:not([disabled]), .screen [data-i], .screen [data-k], .screen .cc, .screen .rc, .screen canvas');
        if (!clicables.length) break;
        const el = clicables[Math.floor(Math.random() * clicables.length)];
        try { await el.click({ timeout: 600, force: true }); } catch (e) { /* tapado o fuera: da igual */ }
        await page.waitForTimeout(60);
      }
      await page.waitForTimeout(500);

      // ¿Sigue vivo y con pantalla?
      const vivo = await page.evaluate('!!document.querySelector(".screen") || document.querySelector("#modal").classList.contains("open")');
      if (!vivo) errs.push('la pantalla se quedó vacía tras manosear');
      if (errs.length) fallas.push(`${d}: ${[...new Set(errs)].slice(0, 3).join(' | ')}`);
    } catch (e) {
      fallas.push(`${d}: EXCEPCIÓN ${e.message.slice(0, 90)}`);
    }
    await page.close();
  }

  console.log(`juegos probados: ${dirs.length}`);
  console.log(fallas.length ? 'PROBLEMAS:\n' + fallas.join('\n') : 'los ' + dirs.length + ' aguantan 25 toques al azar sin romperse');
  await browser.close();
})().catch((e) => { console.error('FALLO:', e); process.exit(1); });
