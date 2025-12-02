declare global {
  interface Window {
    __TAURI__?: any
  }
}

const isTauri = window.__TAURI__ !== undefined
const MINIO_URL = 'http://192.168.0.101:9000'

export const getAsset = (path: string): string => {
  if (!path || path.trim().length === 0) {
    return './nothin.jpg'
  }

  // Если URL уже полный
  if (path.startsWith('http://') || path.startsWith('https://')) {
    try {
      new URL(path)
      return path
    } catch {
      // Продолжаем обработку
    }
  }

  // Если содержит localhost:9000
  if (path.includes('localhost:9000')) {
    return path.replace('localhost:9000', '').replace('http://', '/minio')
  }

  // Если содержит IP MinIO
  if (path.includes('192.168.0.101:9000')) {
    if (isTauri) {
      return path
    } else {
      return path.replace('http://192.168.0.101:9000', '/minio')
    }
  }

  // Относительный путь с /img/
  if (path.startsWith('/img/')) {
    if (isTauri) {
      return `${MINIO_URL}${path}`
    } else {
      return `/minio${path}`
    }
  }

  // Относительный путь с img/ (без слеша)
  if (path.startsWith('img/')) {
    if (isTauri) {
      return `${MINIO_URL}/${path}`
    } else {
      return `/minio/${path}`
    }
  }

  // Любой другой относительный путь
  if (!path.includes('://')) {
    return path
  }

  // Дефолтный случай
  return path
}
