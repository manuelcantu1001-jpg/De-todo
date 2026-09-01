/* Service worker de la colección: cache-first para jugar sin conexión. */
const CACHE = 'juegos-v11';
const ASSETS = [
  './', 'index.html',
  'comun/estilo.css', 'comun/nucleo.js',
  'comun/fuentes/dmsans-400-latin-ext.woff2',
  'comun/fuentes/dmsans-400-latin.woff2',
  'comun/fuentes/dmsans-500-latin-ext.woff2',
  'comun/fuentes/dmsans-500-latin.woff2',
  'comun/fuentes/dmsans-600-latin-ext.woff2',
  'comun/fuentes/dmsans-600-latin.woff2',
  'comun/fuentes/fraunces-400-latin-ext.woff2',
  'comun/fuentes/fraunces-400-latin.woff2',
  'comun/fuentes/fraunces-400i-latin-ext.woff2',
  'comun/fuentes/fraunces-400i-latin.woff2',
  'comun/fuentes/fraunces-500-latin-ext.woff2',
  'comun/fuentes/fraunces-500-latin.woff2',
  'banco-es.js', 'vocab-es.js', 'lexico-es.txt.gz',
  'manifest.webmanifest',
  'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-512-maskable.png',
  'juegos/encadena/', 'juegos/sopa/', 'juegos/crucigrama/', 'juegos/crucigrama/pistas-es.js',
  'juegos/ahorcado/', 'juegos/anagrama/', 'juegos/sudoku/', 'juegos/buscaminas/',
  'juegos/memorama/', 'juegos/gato/', 'juegos/2048/',
  'juegos/palabra/', 'juegos/acomoda/', 'juegos/cifras/', 'juegos/nonograma/',
  'juegos/kakuro/', 'juegos/naval/', 'juegos/conecta4/', 'juegos/damas/',
  'juegos/solitario/', 'juegos/serpiente/', 'juegos/simon/', 'juegos/laberinto/',
  'juegos/buscapalabras/', 'juegos/frase/', 'juegos/silabas/',
  'juegos/binario/', 'juegos/puentes/', 'juegos/hitori/', 'juegos/luces/', 'juegos/picas/',
  'juegos/punteros/', 'juegos/inunda/',
  'juegos/reversi/', 'juegos/domino/', 'juegos/deslizante/', 'juegos/comesolo/', 'juegos/hanoi/', 'juegos/ludo/',
  'juegos/blackjack/', 'juegos/holdem/',
  'juegos/bloques/', 'juegos/ladrillos/', 'juegos/topos/',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then((hit) => hit || fetch(e.request).then((res) => {
      if (res.ok && new URL(e.request.url).origin === location.origin) {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
      }
      return res;
    }).catch(() => (e.request.mode === 'navigate' ? caches.match('index.html') : undefined)))
  );
});
