'use strict';
/* comun/nucleo.js — utilidades compartidas de la colección de juegos. */

const $ = (sel, root) => (root || document).querySelector(sel);
const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const cap = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
const delay = (ms) => new Promise((r) => setTimeout(r, ms));
const vibrate = (pat) => { try { navigator.vibrate && navigator.vibrate(pat); } catch (e) {} };
const randInt = (n) => Math.floor(Math.random() * n);
const fmtTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Normaliza para comparar: minúsculas, sin tildes/diéresis, conservando la ñ.
const norm = (s) => (s || '').toLowerCase()
  .replace(/ñ/g, '\u0001')
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/\u0001/g, 'ñ')
  .replace(/[^a-zñ]/g, '');

const store = {
  get(k, def) { try { const v = localStorage.getItem(k); return v == null ? def : JSON.parse(v); } catch (e) { return def; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
};

/* ── Paleta en caché ──────────────────────────────────────────────────
   Los juegos de canvas necesitan los colores como texto para pintarlos, pero
   getComputedStyle obliga al navegador a recalcular estilos, y llamarlo en
   cada cuadro se sentía como tirones en el teléfono. Se lee una vez por token
   y se guarda; la paleta no cambia mientras juegas. */
const color = (() => {
  const cache = new Map();
  return (v) => {
    if (!cache.has(v)) cache.set(v, getComputedStyle(document.body).getPropertyValue(v).trim());
    return cache.get(v);
  };
})();

/* ── Léxico completo bajo demanda (formas ya normalizadas, .gz) ──────── */
function crearLexico(url) {
  let txt = null, done = false, promise = null;
  function load() {
    if (promise) return promise;
    promise = (async () => {
      try {
        const r = await fetch(url);
        if (!r.ok) throw new Error('http ' + r.status);
        const buf = await r.arrayBuffer();
        const u8 = new Uint8Array(buf);
        let out;
        if (u8[0] === 0x1f && u8[1] === 0x8b) {
          if (typeof DecompressionStream === 'undefined') throw new Error('sin DecompressionStream');
          out = await new Response(new Blob([buf]).stream().pipeThrough(new DecompressionStream('gzip'))).text();
        } else out = new TextDecoder().decode(buf);
        txt = '\n' + out + '\n';
      } catch (e) { /* seguimos sin léxico */ }
      done = true;
    })();
    return promise;
  }
  return {
    ready: load,
    settled: () => done,
    loaded: () => !!txt,
    has: (n) => !!txt && txt.includes('\n' + n + '\n'),
  };
}

/* ── Modal ───────────────────────────────────────────────────────────── */
function openModal(html, onVeil) {
  const m = $('#modal');
  m.innerHTML = `<div class="veil"></div><div class="sheet">${html}</div>`;
  m.classList.add('open');
  $('.veil', m).onclick = onVeil || null;
}
function closeModal() {
  const m = $('#modal');
  m.classList.remove('open');
  m.innerHTML = '';
}

/* ── Confeti ─────────────────────────────────────────────────────────── */
function confetti() {
  const cs = getComputedStyle(document.body);
  const colors = ['--tinta-1', '--tinta-2', '--tinta-3', '--tinta-4', '--tinta-5', '--tinta-6']
    .map((v) => cs.getPropertyValue(v).trim());
  const c = document.createElement('div');
  c.className = 'confetti';
  let html = '';
  for (let i = 0; i < 70; i++) {
    html += `<i style="left:${Math.random() * 100}%;background:${colors[i % colors.length]};` +
      `animation-duration:${2 + Math.random() * 1.8}s;animation-delay:${Math.random() * .6}s"></i>`;
  }
  c.innerHTML = html;
  document.body.appendChild(c);
  setTimeout(() => c.remove(), 4600);
}

/* ── Iconos compartidos ──────────────────────────────────────────────── */
const SVGI = {
  back: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"></path></svg>',
  chev: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"></path></svg>',
};

/* ── Barra superior estándar de juego ────────────────────────────────── */
function topbarHTML(title, metaHTML) {
  return `<div class="topbar">
    <a class="backbtn" href="../../" aria-label="Volver al inicio">${SVGI.back}</a>
    <h1>${esc(title)}</h1>
    <div class="meta">${metaHTML || ''}</div>
  </div>`;
}

/* ── Cronómetro ascendente sencillo ──────────────────────────────────── */
function makeClock(el) {
  let t = 0, id = null;
  const paint = () => { if (el()) el().textContent = fmtTime(t); };
  return {
    start() { this.stop(); t = 0; paint(); id = setInterval(() => { t++; paint(); }, 1000); },
    resume() { if (!id) id = setInterval(() => { t++; paint(); }, 1000); },
    stop() { if (id) { clearInterval(id); id = null; } },
    get seconds() { return t; },
    set seconds(v) { t = v; paint(); },
  };
}

/* ── «¿Cómo se juega?» estándar ──────────────────────────────────────── */
function bindHowto(html) {
  const b = $('#howto');
  if (!b) return;
  b.onclick = () => {
    openModal(`<h3>Cómo se juega</h3>${html}
      <div class="m-actions"><button class="btn btn-primary" id="m-howto-ok">Entendido</button></div>`, closeModal);
    $('#m-howto-ok').onclick = closeModal;
  };
}

/* ── Dificultades estándar ───────────────────────────────────────────── */
const DIFF_LABEL = { facil: 'Fácil', normal: 'Normal', dificil: 'Difícil', experto: 'Experto' };
function diffSegHTML(id, value, levels) {
  const opts = (levels || ['facil', 'normal', 'dificil', 'experto']);
  return `<div class="seg" id="${id}">` + opts.map((v) =>
    `<button data-v="${v}" class="${v === value ? 'sel' : ''}">${DIFF_LABEL[v]}</button>`).join('') + `</div>`;
}
function bindSeg(id, onPick) {
  const el = $('#' + id); if (!el) return;
  $$('button', el).forEach((b) => b.onclick = () => {
    $$('button', el).forEach((x) => x.classList.remove('sel'));
    b.classList.add('sel');
    onPick(b.dataset.v);
  });
}
