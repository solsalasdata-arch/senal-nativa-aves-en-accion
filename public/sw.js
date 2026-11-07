const CACHE_NAME = 'senal-nativa-pwa-v2';

// Core static assets and illustrations to pre-cache for 100% offline trail usage
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/pwa-maskable-512x512.png',
  '/apple-touch-icon.png',
  '/assets/aistudio/Screen_1_22a39e8c_1f7c711e.jpg',
  '/assets/aistudio/Screen_2_d0032cf0_1ee10bf1.jpg',
  '/assets/aistudio/Screen_3_8e6fa6b7_1755264f.jpg',
  '/assets/aistudio/Screen_4_73a89551_b68fdca2.jpg',
  '/assets/aistudio/Screen_5_06f6ef05_52d6377a.jpg',
  '/assets/aistudio/Toucan_perched_on_branch_8ab41bfc_230157f9.jpg',
  '/assets/aistudio/Bird_1_5f9f602b_3d8fd6a9.jpg',
  '/assets/aistudio/Bird_2_d0fb2eb9_d5a798d6.jpg',
  '/assets/aistudio/Bird_3_268b1279_c5b0c7ea.jpg',
  '/assets/aistudio/Bird_4_363f952c_086d60d9.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(
        PRECACHE_ASSETS.map((url) =>
          cache.add(url).catch(() => {
            // Ignore individual asset failure during install
          })
        )
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((oldKey) => caches.delete(oldKey))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Skip external API calls (e.g., Google Drive API / OAuth)
  if (
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('accounts.google.com')
  ) {
    return;
  }

  // Navigation requests: Network-first falling back to cached index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', copy));
          return response;
        })
        .catch(() =>
          caches.match('/index.html').then((res) => res || caches.match('/'))
        )
    );
    return;
  }

  // Static assets, scripts, styles, images, fonts: Stale-While-Revalidate for fast offline response
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            (networkResponse.type === 'basic' || networkResponse.type === 'cors')
          ) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
