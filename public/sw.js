// Service Worker for Abbaquar-San Dream Centre
// Improves performance and enables offline capabilities

const CACHE_NAME = 'abbaquar-cache-v1';
const RUNTIME_CACHE = 'runtime-cache';

// Resources to cache on install
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/assets/abbaquar-logo.webp',
  '/assets/hero.webp',
];

// Install event - precache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const currentCaches = [CACHE_NAME, RUNTIME_CACHE];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return cacheNames.filter((cacheName) => !currentCaches.includes(cacheName));
    }).then((cachesToDelete) => {
      return Promise.all(cachesToDelete.map((cacheToDelete) => {
        return caches.delete(cacheToDelete);
      }));
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return caches.open(RUNTIME_CACHE).then((cache) => {
          return fetch(event.request).then((response) => {
            // Cache valid responses
            if (response.status === 200) {
              // Don't cache API responses
              if (!event.request.url.includes('/api/')) {
                cache.put(event.request, response.clone());
              }
            }
            return response;
          });
        });
      })
    );
  }
});

// Handle offline fallbacks
self.addEventListener('fetch', (event) => {
  // Return cached assets or a fallback for navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/index.html');
      })
    );
  }
});
