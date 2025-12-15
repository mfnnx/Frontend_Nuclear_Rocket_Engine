// Минимальный рабочий Service Worker
const APP_VERSION = 'v1.0.0'

// 1. Установка
self.addEventListener('install', (event) => {
  console.log(`Service Worker ${APP_VERSION}: Устанавливается`)
  // Пропускаем ожидание и сразу активируемся
  event.waitUntil(self.skipWaiting())
})

// 2. Активация
self.addEventListener('activate', (event) => {
  console.log(`Service Worker ${APP_VERSION}: Активируется`)
  // Немедленно берем контроль над страницами
  event.waitUntil(clients.claim().then(() => {
    console.log('✅ Service Worker активен и контролирует страницы')
  }))
})

// 3. Fetch
self.addEventListener('fetch', (event) => {
  console.log("Fetch:", event.request.url)
  // Можно вернуть fetch(event.request) для пропуска через SW
})

// 4. Для принудительной активации
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    console.log('Получена команда SKIP_WAITING')
    self.skipWaiting()
  }
})
