// TINGKATKAN VERSI CACHE SETIAP KALI KODE HTML/JS DIUPDATE
const CACHE_NAME = 'toko-pwa-v1.0.1'; // Ganti versi ini jika ingin memaksa cache dibersihkan
const urlsToCache = [
  './',
  './index.html',
  './app.js',
  './manifest.json'
];

// 1. TAHAP INSTALL: Simpan file-file penting ke Cache Browser
self.addEventListener('install', event => {
  // Paksa service worker baru untuk langsung aktif tanpa menunggu tab ditutup
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Membuka cache baru:', CACHE_NAME);
        return cache.addAll(urlsToCache);
      })
  );
});

// 2. TAHAP ACTIVATE: Bersihkan cache versi lama secara otomatis
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Menghapus cache usang:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Ambil alih kontrol klien (halaman) secara langsung
      return self.clients.claim();
    })
  );
});

// 3. TAHAP FETCH: Gunakan strategi Network-First agar selalu terupdate saat online,
// dan fall-back ke cache saat offline.
self.addEventListener('fetch', event => {
  // Hanya lakukan intercept pada request GET lokal (HTML, JS, CSS, Asset lokal)
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // Jika request berhasil, update salinan file di cache
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            // Simpan ke cache hanya jika URL-nya termasuk dalam whitelist lokal kita
            const urlStr = event.request.url;
            if (urlsToCache.some(url => urlStr.includes(url.replace('./', '')))) {
              cache.put(event.request, responseToCache);
            }
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Jika koneksi internet terputus (offline), ambil dari cache
        return caches.match(event.request);
      })
  );
});
