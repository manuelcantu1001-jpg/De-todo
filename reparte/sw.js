// ReParte · service worker mínimo: la app funciona sin red una vez abierta.
const CACHE = 'reparte-v2';
const FILES = ['./', './index.html', './manifest.webmanifest',
  './img/crear-evento.jpg', './img/compartir-link.jpg', './img/entrar.jpg', './img/capturar-gasto.jpg', './img/peso-dolar.jpg', './img/cerrar-evento.jpg', './img/quien-le-paga.jpg', './img/copiar-clabe.jpg', './img/respaldo.jpg', './img/invitar.jpg'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('reparte-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(r => { if(r.ok){ const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); } return r; }).catch(() => caches.match(e.request, {ignoreSearch:true})));
});
