const CACHE_NAME = 'kevdev-pwa-v1'
const OFFLINE_URL = '/offline.html'

const PRECACHE_ASSETS = [
  '/',
  OFFLINE_URL,
  '/favicon.ico',
  '/favicon-192x192.png',
  '/favicon-512x512.png',
  '/apple-touch-icon.png',
  '/manifest.webmanifest',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[PWA SW] Precache warning:', err)
      })
    })
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name)
          }
        })
      )
    }).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event

  // Only handle GET requests
  if (request.method !== 'GET') return

  const url = new URL(request.url)

  // Skip chrome-extension, internal protocols, and non-http(s)
  if (!url.protocol.startsWith('http')) return

  // Skip dev server hot reload and API endpoints
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/_next/webpack-hmr') ||
    url.searchParams.has('__next')
  ) {
    return
  }

  // Handle page navigations (HTML pages)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // If valid response, clone and update cache
          if (response && response.status === 200) {
            const copy = response.clone()
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, copy).catch(() => {})
            })
          }
          return response
        })
        .catch(async () => {
          // Network failed: try cache first
          const cachedResponse = await caches.match(request)
          if (cachedResponse) return cachedResponse

          // Fallback to offline page
          const offlineResponse = await caches.match(OFFLINE_URL)
          if (offlineResponse) return offlineResponse

          return new Response('Sin conexión', {
            status: 503,
            headers: { 'Content-Type': 'text/plain' },
          })
        })
    )
    return
  }

  // Handle static assets from same-origin or Google Fonts
  const isStaticAsset =
    url.origin === self.location.origin &&
    (url.pathname.startsWith('/_next/static/') ||
     url.pathname.match(/\.(png|jpg|jpeg|svg|webp|ico|css|js|woff2?)$/i))

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const copy = networkResponse.clone()
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, copy).catch(() => {})
              })
            }
            return networkResponse
          })
          .catch(() => cachedResponse)

        return cachedResponse || fetchPromise
      })
    )
    return
  }
})

// Listen to message from client to skip waiting
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
