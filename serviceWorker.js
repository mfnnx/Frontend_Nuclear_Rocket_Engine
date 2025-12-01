// ТОЧНО РАБОЧИЙ Service Worker
console.log('=== SW SCRIPT LOADED ===')

self.addEventListener('install', function(event) {
  console.log('[SW] Install event')
  // Активируем сразу без ожидания
  event.waitUntil(self.skipWaiting())
})

self.addEventListener('activate', function(event) {
  console.log('[SW] Activate event')
  // Берем контроль над всеми клиентами
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      // Очищаем кэши если нужно
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            return caches.delete(cacheName)
          })
        )
      })
    ])
  )
})

self.addEventListener('fetch', function(event) {
  // ВАЖНО: всегда возвращаем ответ!
  event.respondWith(
    fetch(event.request).catch(() => {
      // Fallback если сеть недоступна
      return new Response('Offline')
    })
  )
})

self.addEventListener('message', function(event) {
  console.log('[SW] Message:', event.data)
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

console.log('[SW] Ready to work!')
