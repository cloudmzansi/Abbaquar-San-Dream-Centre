// Service Worker for Abbaquar-San Dream Centre
// Improves performance and enables offline capabilities

const CACHE_NAME = 'abbaquar-cache-v1';
const RUNTIME_CACHE = 'runtime-cache';

// Resources to cache on install
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/assets/abbaquar-logo.webp',
  '/assets/hero.jpg',
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
  // Skip cross-origin requests and non-GET requests
  if (
    event.request.url.startsWith(self.location.origin) && 
    event.request.method === 'GET'
  ) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return caches.open(RUNTIME_CACHE).then((cache) => {
          return fetch(event.request).then((response) => {
            // Cache valid responses
            if (response.status === 200) {
              // Don't cache API responses or other non-cacheable content
              if (
                !event.request.url.includes('/api/') && 
                !event.request.url.includes('/login/') &&
                !event.request.url.includes('/admin/')
              ) {
                // Clone the response before using it
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

// Handle offline fallbacks for navigation
self.addEventListener('fetch', (event) => {
  // Only handle GET navigation requests
  if (event.request.mode === 'navigate' && event.request.method === 'GET') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/index.html');
      })
    );
  }
});
