// H2All Service Worker - Optimized for Stadium Deployment
// Version: 1.0.0

const CACHE_NAME = 'h2all-v1';
const urlsToCache = [
  '/',
  '/claim/',
  '/emailclaim/',
  '/track/',
  '/styles/minimal.css',
  '/h2all-header-logo.png',
  '/child-water-jug.jpg',
  '/h2all-emailclaim-815-woman-header.png',
  '/track-header-success.png'
];

// Install event - cache all static resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // API calls - network first, cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Clone the response before caching
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(request, responseToCache);
            });
          
          return response;
        })
        .catch(() => {
          return caches.match(request);
        })
    );
    return;
  }

  // Static assets - cache first, network fallback
  event.respondWith(
    caches.match(request)
      .then(response => {
        if (response) {
          return response;
        }

        return fetch(request).then(response => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(request, responseToCache);
            });

          return response;
        });
      })
      .catch(() => {
        // Offline fallback for navigation requests
        if (request.mode === 'navigate') {
          return caches.match('/offline.html');
        }
      })
  );
});

// Background sync for claims
self.addEventListener('sync', event => {
  if (event.tag === 'sync-claims') {
    event.waitUntil(syncClaims());
  }
});

async function syncClaims() {
  // Get pending claims from IndexedDB
  const pendingClaims = await getPendingClaims();
  
  for (const claim of pendingClaims) {
    try {
      const response = await fetch('/api/emailclaim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'dev_api_key_change_in_production'
        },
        body: JSON.stringify(claim)
      });

      if (response.ok) {
        await removePendingClaim(claim.id);
      }
    } catch (error) {
      console.error('Failed to sync claim:', error);
    }
  }
}

// Placeholder functions for IndexedDB operations
async function getPendingClaims() {
  // Implementation would go here
  return [];
}

async function removePendingClaim(id) {
  // Implementation would go here
}