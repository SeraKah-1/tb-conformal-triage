// TB Conformal Triage Clinical Workstation - Offline Service Worker
// Versioned offline assets; network-first code with scoped cache fallback.
const CACHE_NAME = 'tb-conformal-offline-v4.1.0-workflow';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './static/css/workstation.css',
  './static/js/app.js',
  './static/js/cases.js',
  './static/js/i18n.js',
  './static/js/slider.js',
  './static/js/ood_calibration.js',
  './vendor/onnx/ort.min.js',
  './vendor/onnx/ort-wasm-simd.wasm',
  './vendor/onnx/ort-wasm.wasm',
  './vendor/katex/katex.min.css',
  './vendor/katex/katex.min.js',
  './vendor/katex/auto-render.min.js',
  './vendor/katex/fonts/KaTeX_AMS-Regular.woff2',
  './vendor/katex/fonts/KaTeX_Caligraphic-Bold.woff2',
  './vendor/katex/fonts/KaTeX_Caligraphic-Regular.woff2',
  './vendor/katex/fonts/KaTeX_Fraktur-Bold.woff2',
  './vendor/katex/fonts/KaTeX_Fraktur-Regular.woff2',
  './vendor/katex/fonts/KaTeX_Main-Bold.woff2',
  './vendor/katex/fonts/KaTeX_Main-BoldItalic.woff2',
  './vendor/katex/fonts/KaTeX_Main-Italic.woff2',
  './vendor/katex/fonts/KaTeX_Main-Regular.woff2',
  './vendor/katex/fonts/KaTeX_Math-BoldItalic.woff2',
  './vendor/katex/fonts/KaTeX_Math-Italic.woff2',
  './vendor/katex/fonts/KaTeX_SansSerif-Bold.woff2',
  './vendor/katex/fonts/KaTeX_SansSerif-Italic.woff2',
  './vendor/katex/fonts/KaTeX_SansSerif-Regular.woff2',
  './vendor/katex/fonts/KaTeX_Script-Regular.woff2',
  './vendor/katex/fonts/KaTeX_Size1-Regular.woff2',
  './vendor/katex/fonts/KaTeX_Size2-Regular.woff2',
  './vendor/katex/fonts/KaTeX_Size3-Regular.woff2',
  './vendor/katex/fonts/KaTeX_Size4-Regular.woff2',
  './vendor/katex/fonts/KaTeX_Typewriter-Regular.woff2',
  './assets/brand.svg',
  './assets/brand-192.png',
  './assets/brand-512.png',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './models/tb_conformal_distilled_v11_cam.onnx',
  './samples/normal_healthy_case.png',
  './samples/normal_healthy_case_hirescam.png',
  './samples/tb_active_case.png',
  './samples/tb_active_case_hirescam.png',
  './samples/india_solan_active_tb.png',
  './samples/india_solan_normal_control.png',
  './samples/nitrd_apical_tb.png',
  './samples/tb_case_2.png',
  './samples/panel_A_heat.png',
  './samples/panel_B_heat.png',
  './samples/panel_C_heat.png',
  './samples/panel_D_heat.png',
  './samples/tb_case_failure_compressed.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Pre-caching offline workstation assets and Model v11 ONNX...');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache.startsWith('tb-conformal-offline-') && cache !== CACHE_NAME) {
            console.log('[ServiceWorker] Clearing legacy cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;
  const assetPaths = new Set(ASSETS_TO_CACHE.map(asset => new URL(asset, self.registration.scope).pathname));
  if (!assetPaths.has(url.pathname)) return;
  const isCodeAsset = url.pathname.endsWith('.js') || url.pathname.endsWith('.css') || url.pathname.endsWith('.html') || event.request.mode === 'navigate';

  if (isCodeAsset) {
    // Network-First with Cache Fallback for code assets to guarantee instant update propagation
    event.respondWith(
      fetch(event.request).then((networkResponse) => {
        if (networkResponse && (networkResponse.status === 200)) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
        }
        return networkResponse;
      }).catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        // Version query strings must also resolve on the first offline launch.
        const cached = await cache.match(event.request, { ignoreSearch: true });
        return cached || new Response('Offline asset unavailable', { status: 503 });
      })
    );
    return;
  }

  // Cache-First with Network Fallback for heavy binary assets (ONNX model, WASM, fonts)
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => cache.match(event.request)).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || (networkResponse.status !== 200)) {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      });
    })
  );
});
