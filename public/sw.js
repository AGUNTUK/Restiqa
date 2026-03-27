// ============================================================
// Restiqa Service Worker — v5 (Network First for HTML)
// ============================================================

const CACHE_VERSION = 'restiqa-v5';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;

// Only cache truly static assets (NOT HTML pages)
const STATIC_ASSETS = [
  '/favicon.png',
  '/og-image.png',
  '/logo.png',
  '/manifest',
];

// Install: pre-cache static assets only
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting()) // Activate immediately
  );
});

// Activate: delete ALL old caches from previous versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim()) // Take control of all tabs immediately
  );
});

// Fetch: Network-First for HTML, Cache-First for static assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Always bypass service worker for API calls & Supabase
  if (
    url.pathname.startsWith('/api/') ||
    url.hostname.includes('supabase') ||
    url.hostname.includes('googletagmanager') ||
    request.method !== 'GET'
  ) {
    return;
  }

  // STRATEGY 1: Network First for HTML navigation (pages)
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache a fresh copy of the page
          const clone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => {
          // Only use cache as fallback if network fails (offline)
          return caches.match(request);
        })
    );
    return;
  }

  // STRATEGY 2: Cache First for static assets (images, fonts, etc.)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;
      return fetch(request).then((response) => {
        const clone = response.clone();
        caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, clone));
        return response;
      });
    })
  );
});
