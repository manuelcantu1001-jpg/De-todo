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

/* ── Diccionario de frecuencias (requiere dicc-es.js cargado antes) ──── */
const Dicc = (() => {
  const list = [];               // [{w, n, rank}] por frecuencia
  const map = new Map();         // norm -> {w, rank}
  let inited = false;
  function init() {
    if (inited || !window.DICC_ES) return;
    inited = true;
    const arr = window.DICC_ES.split('\n');
    for (let i = 0; i < arr.length; i++) {
      const w = arr[i]; if (!w) continue;
      const n = norm(w);
      if (!map.has(n)) map.set(n, { w, rank: i });
      list.push({ w, n, rank: i });
    }
  }
  return {
    get list() { init(); return list; },
    ready() { init(); return list.length > 0; },
    has(n) { init(); return map.has(n); },
    rankOf(n) { init(); const e = map.get(n); return e ? e.rank : Infinity; },
    // Palabras que cumplen un filtro, hasta cierto rango de frecuencia.
    where(fn, maxRank) {
      init();
      const out = [];
      for (const e of list) {
        if (e.rank >= maxRank) break;
        if (fn(e)) out.push(e);
      }
      return out;
    },
    // Una palabra al azar en una ventana de longitud y frecuencia.
    random({ minLen = 4, maxLen = 12, minRank = 0, maxRank = 9000 } = {}) {
      init();
      for (let i = 0; i < 200; i++) {
        const e = list[minRank + randInt(Math.min(maxRank, list.length) - minRank)];
        if (e && e.n.length >= minLen && e.n.length <= maxLen && /^[a-zñ]+$/.test(e.n)) return e;
      }
      return null;
    },
  };
})();

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
  const colors = [cs.getPropertyValue('--accent').trim(), cs.getPropertyValue('--second').trim(),
    cs.getPropertyValue('--good').trim(), '#F3C64B', '#7A9CF5'];
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
