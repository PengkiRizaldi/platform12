const CACHE_NAME = 'toko-pwa-v1';
const urlsToCache = [
  './',
  './index.html',
  './app.js',
  './manifest.json'
];

// 1. TAHAP INSTALL: Simpan file-file penting ke Cache Browser
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Membuka cache...');
        return cache.addAll(urlsToCache);
      })
  );
});

// 2. TAHAP FETCH: Mencegat request. Jika offline, ambil dari Cache!
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Jika file ada di cache, kembalikan file tersebut (Offline Mode)
        if (response) { return response; }
        // Jika tidak ada, lanjutkan ambil dari internet (Online Mode)
        return fetch(event.request);
      })
  );
});