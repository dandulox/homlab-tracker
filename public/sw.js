// Service Worker für Labora
const CACHE_NAME = 'labora-v1'
const STATIC_CACHE = 'labora-static-v1'
const DYNAMIC_CACHE = 'labora-dynamic-v1'

// Dateien die gecacht werden sollen
const STATIC_FILES = [
  '/',
  '/admin',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png'
]

// API-Endpunkte die gecacht werden sollen
const API_CACHE_PATTERNS = [
  /^\/api\/config$/,
  /^\/api\/health/,
  /^\/api\/widgets/
]

// Install Event
self.addEventListener('install', (event) => {
  console.log('Service Worker: Install')
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static files')
        return cache.addAll(STATIC_FILES)
      })
      .then(() => self.skipWaiting())
  )
})

// Activate Event
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activate')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('Service Worker: Deleting old cache', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => self.clients.claim())
  )
})

// Fetch Event
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Skip external requests
  if (url.origin !== location.origin) {
    return
  }

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request))
    return
  }

  // Handle static files
  if (request.destination === 'document') {
    event.respondWith(handlePageRequest(request))
    return
  }

  // Handle other requests
  event.respondWith(handleOtherRequest(request))
})

// API Request Handler
async function handleApiRequest(request) {
  const url = new URL(request.url)
  
  // Check if this API should be cached
  const shouldCache = API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname))
  
  if (!shouldCache) {
    return fetch(request)
  }

  try {
    // Try network first
    const response = await fetch(request)
    
    if (response.ok) {
      // Cache successful responses
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, response.clone())
    }
    
    return response
  } catch (error) {
    // Fallback to cache
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Return offline response for config
    if (url.pathname === '/api/config') {
      return new Response(
        JSON.stringify({
          title: 'Labora',
          description: 'Offline Modus',
          theme: 'system',
          auth: { enabled: false },
          groups: [],
          services: [],
          discovery: { enabled: false, cidr: [], http_ports: [], ping_timeout_ms: 600 },
          widgets: { proxmox: { enabled: false }, pfsense: { enabled: false }, adguard: { enabled: false }, npm: { enabled: false } }
        }),
        {
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
    
    throw error
  }
}

// Page Request Handler
async function handlePageRequest(request) {
  try {
    // Try network first
    const response = await fetch(request)
    return response
  } catch (error) {
    // Fallback to cache
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Fallback to index.html for SPA routing
    const indexResponse = await caches.match('/')
    if (indexResponse) {
      return indexResponse
    }
    
    throw error
  }
}

// Other Request Handler
async function handleOtherRequest(request) {
  try {
    // Try cache first for static assets
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Try network
    const response = await fetch(request)
    
    // Cache successful responses
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, response.clone())
    }
    
    return response
  } catch (error) {
    throw error
  }
}

// Background Sync (optional)
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync())
  }
})

async function doBackgroundSync() {
  // Perform background sync tasks
  console.log('Service Worker: Background sync')
}
