/* Service worker de la colección: cache-first para jugar sin conexión. */
const CACHE = 'juegos-v3';
const ASSETS = [
  './', 'index.html',
  'comun/estilo.css', 'comun/nucleo.js',
  'dicc-es.js', 'lexico-es.txt.gz',
  'manifest.webmanifest',
  'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-512-maskable.png',
  'juegos/encadena/', 'juegos/sopa/', 'juegos/crucigrama/', 'juegos/crucigrama/pistas-es.js',
  'juegos/ahorcado/', 'juegos/anagrama/', 'juegos/sudoku/', 'juegos/buscaminas/',
  'juegos/memorama/', 'juegos/gato/', 'juegos/2048/',
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
    }).catch(() => caches.match('index.html')))
  );
});
