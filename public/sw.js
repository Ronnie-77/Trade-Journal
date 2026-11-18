// Trade Journal Service Worker — offline support + fast icon updates.
//
// Strategy: stale-while-revalidate.
//   - Returns cached response immediately (fast).
//   - Simultaneously fetches from network and updates the cache.
//   - On SW update, the old cache is deleted so stale icons get replaced.
//
// The cache version is bumped whenever static assets (icons, manifest,
// HTML) change so installed service workers drop the old cache and
// re-fetch fresh files. Without this bump, the cache-first behaviour
// would forever serve the old icon.svg / apple-icon.png.

const CACHE_NAME = 'trade-journal-v2'
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
  // Activate the new SW immediately instead of waiting for all tabs
  // to close — so the cache-version bump takes effect right away.
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      // Delete every cache that isn't the current version — this
      // wipes the stale v1 icon cache so updated icons get re-fetched.
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    })
  )
  // Take control of all open clients immediately.
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  // Skip non-GET requests and API calls.
  if (event.request.method !== 'GET' || event.request.url.includes('/api/')) {
    return
  }

  // Stale-while-revalidate: serve cached (instant) + refresh in
  // background so the NEXT load sees the updated asset.
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cached) => {
        const networkFetch = fetch(event.request)
          .then((response) => {
            // Cache successful responses for next time.
            if (response && response.status === 200 && response.type === 'basic') {
              const responseClone = response.clone()
              cache.put(event.request, responseClone)
            }
            return response
          })
          .catch(() => {
            // Offline fallback — return cached landing page for navigations.
            if (event.request.mode === 'navigate') {
              return cache.match('/')
            }
            // For other assets, fall back to whatever cache we have.
            return cached
          })

        // Return cached immediately if available, otherwise wait on network.
        return cached || networkFetch
      })
    })
  )
})
