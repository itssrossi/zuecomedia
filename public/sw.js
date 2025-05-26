
const CACHE_NAME = 'zue-co-media-v2';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/lovable-uploads/a79bad13-be65-407a-8c30-ff4c211bf5e1.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  // Don't cache auth-related requests to ensure fresh session data
  if (event.request.url.includes('supabase.co/auth') || 
      event.request.url.includes('/token') ||
      event.request.url.includes('/refresh')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Ensure the new service worker takes control immediately
  self.clients.claim();
});

// Handle background sync for authentication
self.addEventListener('sync', (event) => {
  if (event.tag === 'auth-sync') {
    event.waitUntil(
      // This ensures auth state is properly synced when coming back online
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'AUTH_SYNC' });
        });
      })
    );
  }
});
