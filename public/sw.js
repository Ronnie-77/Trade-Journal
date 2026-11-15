// Trade Journal Service Worker — basic offline support
// Caches static assets for offline use

const CACHE_NAME = 'trade-journal-v1'
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/login',
  '/signup',
  '/icon.svg',
  '/apple-icon.png',
  '/manifest.json',
  '/privacy-policy.html',
  '/terms-of-service.html',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {})
    })
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    })
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  // Skip non-GET requests and API calls
  if (event.request.method !== 'GET' || event.request.url.includes('/api/')) {
    return
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      // Return cached if available, otherwise fetch from network
      return (
        cached ||
        fetch(event.request)
          .then((response) => {
            // Cache successful responses
            if (response.status === 200) {
              const responseClone = response.clone()
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseClone)
              })
            }
            return response
          })
          .catch(() => {
            // Offline fallback — return cached landing page
            if (event.request.mode === 'navigate') {
              return caches.match('/')
            }
          })
      )
    })
  )
})
