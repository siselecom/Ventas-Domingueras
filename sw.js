// 🔥 Cambia el nombre del caché para forzar actualización
const CACHE_NAME = "ventas-domingueras-" + Date.now();

const FILES_TO_CACHE = [
  'index.html',
  'style.css',
  'app.js',
  'manifest.json',
  'icons/icon-192.png',
  'icons/icon-512.png'
];

// INSTALACIÓN
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

// ACTIVACIÓN
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// FETCH
self.addEventListener('fetch', event => {
  const req = event.request;

  // 🔥 CSS y JS siempre desde la red (si falla, usa caché)
  if (req.url.endsWith('.css') || req.url.endsWith('.js')) {
    event.respondWith(
      fetch(req).catch(() => caches.match(req))
    );
    return;
  }

  // Navegación (abrir desde el icono)
  if (req.mode === 'navigate') {
    event.respondWith(
      caches.match('index.html').then(res => res || fetch('index.html'))
    );
    return;
  }

  // Archivos normales (cache-first)
  event.respondWith(
    caches.match(req).then(res => res || fetch(req))
  );
});