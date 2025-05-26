
const CACHE_NAME = 'zue-co-media-v2';
const STATIC_CACHE = 'zue-co-static-v2';
const DYNAMIC_CACHE = 'zue-co-dynamic-v2';

// Static assets to cache immediately
const staticAssets = [
  '/',
  '/manifest.json',
  '/lovable-uploads/a79bad13-be65-407a-8c30-ff4c211bf5e1.png',
  '/lovable-uploads/c5a928fa-35df-4bf0-b39d-7b83e2cbc714.png',
  '/lovable-uploads/7ae353e4-9833-4708-a345-e1195eaace46.png'
];

// Assets to cache on demand
const dynamicAssets = [
  '/static/js/',
  '/static/css/',
  '/src/'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(cache => cache.addAll(staticAssets)),
      self.skipWaiting()
    ])
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (![STATIC_CACHE, DYNAMIC_CACHE].includes(cacheName)) {
              return caches.delete(cacheName);
            }
          })
        );
      }),
      self.clients.claim()
    ])
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Handle API requests differently
  if (url.pathname.includes('/api/') || url.hostname.includes('supabase')) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(JSON.stringify({ error: 'Network unavailable' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // Cache strategy for static assets
  if (staticAssets.some(asset => url.pathname === asset) || url.pathname.includes('lovable-uploads')) {
    event.respondWith(
      caches.match(request).then(response => {
        return response || fetch(request).then(fetchResponse => {
          return caches.open(STATIC_CACHE).then(cache => {
            cache.put(request, fetchResponse.clone());
            return fetchResponse;
          });
        });
      })
    );
    return;
  }

  // Cache strategy for dynamic assets
  if (dynamicAssets.some(pattern => url.pathname.includes(pattern))) {
    event.respondWith(
      caches.match(request).then(response => {
        if (response) {
          // Return cached version and update in background
          fetch(request).then(fetchResponse => {
            caches.open(DYNAMIC_CACHE).then(cache => {
              cache.put(request, fetchResponse);
            });
          }).catch(() => {});
          return response;
        }
        
        return fetch(request).then(fetchResponse => {
          return caches.open(DYNAMIC_CACHE).then(cache => {
            cache.put(request, fetchResponse.clone());
            return fetchResponse;
          });
        });
      })
    );
    return;
  }

  // Default: network first, fallback to cache
  event.respondWith(
    fetch(request).catch(() => {
      return caches.match(request);
    })
  );
});

// Background sync for better performance
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Perform background tasks here
      console.log('Background sync triggered')
    );
  }
});
