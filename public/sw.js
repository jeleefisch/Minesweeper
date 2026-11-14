const CACHE = 'minesweeper-assets-v2'

const networkFirst = (request) => fetch(request).then((response) => {
  if (response.ok && new URL(request.url).origin === self.location.origin) {
    const copy = response.clone()
    caches.open(CACHE).then((cache) => cache.put(request, copy))
  }
  return response
}).catch(() => caches.match(request).then((cached) => cached || caches.match('/index.html')))

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return

  const requestUrl = new URL(event.request.url)
  const isNavigation = event.request.mode === 'navigate' || requestUrl.pathname === '/index.html'
  if (isNavigation) {
    event.respondWith(networkFirst(event.request))
    return
  }

  // Hashed assets are network-first too, so a deploy can never serve an old chunk
  // before checking whether the new file exists.
  event.respondWith(networkFirst(event.request))
})
