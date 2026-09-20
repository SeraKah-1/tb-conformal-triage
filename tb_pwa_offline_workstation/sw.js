// TB Conformal Triage Clinical Workstation - Offline Service Worker
// Enforces 100% Air-Gapped Operation via Cache-First Strategy
const CACHE_NAME = 'tb-conformal-offline-v1.1';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './static/css/workstation.css',
  './static/js/app.js',
  './static/js/i18n.js',
  './static/js/slider.js',
  './vendor/onnx/ort.min.js',
  './vendor/onnx/ort-wasm-simd.wasm',
  './vendor/onnx/ort-wasm.wasm',
  './vendor/katex/katex.min.css',
  './vendor/katex/katex.min.js',
  './vendor/katex/auto-render.min.js',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './models/tb_conformal_distilled_v11_cam.onnx',
  './samples/normal_healthy_case.png',
  './samples/tb_active_case.png',
  './samples/india_solan_active_tb.png',
  './samples/india_solan_normal_control.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Pre-caching offline workstation assets and Model v11 ONNX...');
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('[ServiceWorker] Some assets failed to pre-cache (will cache on demand):', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[ServiceWorker] Clearing legacy cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Pure local cache-first strategy
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      }).catch(() => {
        // Fallback for document navigation
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
