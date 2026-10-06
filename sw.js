const CACHE_NAME = 'ventas-domingueras-v1';
const FILES_TO_CACHE = [
  'index.html',
  'style.css',
  'app.js',
  'manifest.json',
  'icons/icon-192.png',
  'icons/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

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

self.addEventListener('fetch', event => {
  const request = event.request;

  // Navegación (abrir desde el icono)
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match('index.html').then(response => {
        return response || fetch('index.html');
      })
    );
    return;
  }

  // Archivos normales
  event.respondWith(
    caches.match(request).then(response => {
      return response || fetch(request);
    })
  );
});