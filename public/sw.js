const CACHE_NAME = 'senal-nativa-pwa-v5';

// Core static assets and 21 species photos + 21 real .mp3 calls to pre-cache for offline trail usage
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/pwa-maskable-512x512.png',
  '/apple-touch-icon.png',
  '/assets/aistudio/Aves_en_Acci_n_5f43966c.jpg',
  '/assets/aistudio/Botanical_park_start_screen_logo_11198c3d_2d966cdf.jpg',
  '/assets/aistudio/Botanical_park_start_screen_logo_546dfb3b_47fb3d00.jpg',
  '/assets/aistudio/Remove_text_from_screen_248c7528_824b6a34.jpg',
  '/assets/aistudio/Toucan_perched_on_branch_8ab41bfc_230157f9.jpg',
  '/assets/aistudio/c3da3f37-f246-40f4-8d25-1958fb93d2f1_0d2a7f41.jpeg',
  // 21 Bird Images (/assets/aves/)
  encodeURI('/assets/aves/1-Chingolo.jpg'),
  encodeURI('/assets/aves/2-Tangara sacaya.jpg'),
  encodeURI('/assets/aves/3-Chercán.jpg'),
  encodeURI('/assets/aves/4-Zorzal colorado.jpg'),
  encodeURI('/assets/aves/5-Paloma picazuro.jpg'),
  encodeURI('/assets/aves/6-Saltator de pico dorado.jpg'),
  encodeURI('/assets/aves/7-Benteveo.jpg'),
  encodeURI('/assets/aves/8-Tero.jpg'),
  encodeURI('/assets/aves/9-Jilguero azafranado.jpg'),
  encodeURI('/assets/aves/10-Tordo renegrido.jpg'),
  encodeURI('/assets/aves/11-Urraca morada.JPG'),
  encodeURI('/assets/aves/12-Suirirí real.jpg'),
  encodeURI('/assets/aves/13-Carancho.jpg'),
  encodeURI('/assets/aves/14-Hornero.jpg'),
  encodeURI('/assets/aves/15-Candelita de gorro pardo.jpg'),
  encodeURI('/assets/aves/16-Parula tropical.jpg'),
  encodeURI('/assets/aves/17-Pava de los yungas.png'),
  encodeURI('/assets/aves/18-Aratinga mitrada.jpg'),
  encodeURI('/assets/aves/19-Tangara azul y amarilla.png'),
  encodeURI('/assets/aves/20-Ticotico cejicanelo.jpg'),
  encodeURI('/assets/aves/21-Tordo bayo.jpg'),
  // 8 Character Avatar portraits (/assets/characters/)
  '/assets/characters/yunga-nino.jpg',
  '/assets/characters/yunga-nina.jpg',
  '/assets/characters/quebrada-nino.jpg',
  '/assets/characters/quebrada-nina.jpg',
  '/assets/characters/puna-nino.jpg',
  '/assets/characters/puna-nina.jpg',
  '/assets/characters/cientifico.jpg',
  '/assets/characters/exploradora.jpg',
  // 21 Bird Songs (.mp3 in /assets/aves/)
  encodeURI('/assets/aves/1-Chingolo.mp3'),
  encodeURI('/assets/aves/2-Tangara sacaya.mp3'),
  encodeURI('/assets/aves/3-Chercán.mp3'),
  encodeURI('/assets/aves/4-Zorzal colorado.mp3'),
  encodeURI('/assets/aves/5-Paloma picazuro.mp3'),
  encodeURI('/assets/aves/6-Saltator de pico dorado.mp3'),
  encodeURI('/assets/aves/7-Benteveo.mp3'),
  encodeURI('/assets/aves/8-Tero.mp3'),
  encodeURI('/assets/aves/9-Jilguero azafranado.mp3'),
  encodeURI('/assets/aves/10-Tordo renegrido.mp3'),
  encodeURI('/assets/aves/11-Urraca morada.mp3'),
  encodeURI('/assets/aves/12-Suirirí real.mp3'),
  encodeURI('/assets/aves/13-Carancho.mp3'),
  encodeURI('/assets/aves/14-Hornero.mp3'),
  encodeURI('/assets/aves/15-Candelita de gorro pardo.mp3'),
  encodeURI('/assets/aves/16-Parula tropical.mp3'),
  encodeURI('/assets/aves/17-Pava de los yungas.mp3'),
  encodeURI('/assets/aves/18-Aratinga mitrada.mp3'),
  encodeURI('/assets/aves/19-Tangara azul y amarilla.mp3'),
  encodeURI('/assets/aves/20-Ticotico cejicanelo.mp3'),
  encodeURI('/assets/aves/21-Tordo bayo.mp3')
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.allSettled(
        PRECACHE_ASSETS.map((url) =>
          cache.add(url).catch(() => {
            // Ignore individual asset failure during install
          })
        )
      )
    )
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

  // Never intercept Vite dev-server module requests or external Google APIs
  // to prevent mismatched React chunks during hot/dev reloads
  if (
    url.pathname.startsWith('/node_modules/') ||
    url.pathname.startsWith('/@') ||
    url.pathname.startsWith('/src/') ||
    url.searchParams.has('v') ||
    url.searchParams.has('t') ||
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

  // Static production assets (/assets/*, images, fonts, manifest): Network-first with cache fallback
  event.respondWith(
    fetch(request)
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
      .catch(() => caches.match(request))
  );
});
