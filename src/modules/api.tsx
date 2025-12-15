import type { Gas } from '../types'
import { GASES_MOCK } from './mock'

// Определяем среду как в примере
const isTauri = import.meta.env.VITE_TARGET === 'tauri' || import.meta.env.BASE_URL === './'

// Настройки как в примере
const BACKEND_URL = 'http://localhost:8080'
const API_PREFIX = isTauri ? `${BACKEND_URL}/api` : '/api'

const MINIO_URL = 'http://192.168.56.1:9000'
// Важно: в веб-режиме используем /minio как прокси
export const IMAGE_BASE_URL = isTauri ? MINIO_URL : ''

// Функция для обработки ImageURL (универсальная) - ТОЧНО КАК В ПРИМЕРЕ
const getValidImageUrl = (imageURL: string | null | undefined): string => {
  if (!imageURL || imageURL.trim().length === 0) {
    return isTauri ? './default-gas.jpg' : '/default-gas.jpg' // ← добавил / для веба
  }

  // 1. Если URL уже полный и валидный
  if (imageURL.startsWith('http://') || imageURL.startsWith('https://')) {
    try {
      new URL(imageURL)
      
      // Проверяем, это localhost:9000?
      if (imageURL.includes('localhost:9000')) {
        if (isTauri) {
          return imageURL.replace('localhost:9000', MINIO_URL)
        } else {
          const url = new URL(imageURL)
          return `/minio${url.pathname}`
        }
      }
      
      // Это сетевой IP?
      if (imageURL.includes('192.168.56.1:9000')) {
        if (isTauri) {
          return imageURL
        } else {
          const url = new URL(imageURL)
          return `/minio${url.pathname}`
        }
      }
      
      // Другой полный URL - оставляем как есть
      return imageURL
      
    } catch {
      // Невалидный URL, продолжаем обработку
    }
  }

  // 2. Относительный путь, начинающийся с /uploads/
  if (imageURL.startsWith('/img/')) {
    if (isTauri) {
      return `${MINIO_URL}${imageURL}`
    } else {
      return `/minio${imageURL}`
    }
  }

  // 3. Относительный путь, начинающийся с uploads/ (без первого слеша)
  if (imageURL.startsWith('img/')) {
    if (isTauri) {
      return `${MINIO_URL}/${imageURL}`
    } else {
      return `/minio/${imageURL}`
    }
  }

  // 4. Просто имя файла (default-gas.jpg, gas1.jpg)
  if (!imageURL.includes('/') && !imageURL.includes('://')) {
    return isTauri ? `./${imageURL}` : `/${imageURL}`
  }

  // 5. Другие относительные пути
  if (imageURL.startsWith('/')) {
    return imageURL // уже абсолютный путь
  }

  // Дефолтный случай
  return imageURL
}

// Интерфейсы для ответов бэкенда
interface BackendGasDTO {
  id: number
  title: string
  description: string
  image_url: string | null
  molar_mass: number
}

interface BackendPaginatedResponse {
  items: BackendGasDTO[]
  total: number
}

export interface GasFilters {
  search?: string
}

export const gasesApi = {
  async getGases(filters: GasFilters = {}): Promise<Gas[]> {
    const url = filters.search 
      ? `${API_PREFIX}/gases?title=${encodeURIComponent(filters.search)}`
      : `${API_PREFIX}/gases`

    console.log(`🔄 ${isTauri ? 'Tauri' : 'Web'} API: Fetching ${url}`)

    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        ...(isTauri ? { mode: 'cors' } : {})
      })
      
      console.log(`📡 Response status: ${response.status} ${response.statusText}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch gases: ${response.status}`)
      }


      const data: BackendPaginatedResponse = await response.json()
      console.log(`✅ Received ${data.items?.length || 0} gases`)
      
      // Для отладки - логируем преобразованные URL
      const gases = data.items.map(gasDTO => {
        const imageURL = getValidImageUrl(gasDTO.image_url)
        console.log(`🖼 Image URL transform: "${gasDTO.image_url}" -> "${imageURL}"`)
        
        return {
          id: gasDTO.id,
          title: gasDTO.title,
          description: gasDTO.description,
          imageURL: imageURL,
          molarMass: gasDTO.molar_mass
        }
      })
      
      return gases
      
    } catch (error) {
      console.warn(`${isTauri ? 'Tauri' : 'Web'} API Error, using mock data:`, error)
      const filteredMockItems = GASES_MOCK.filter(gas =>
        !filters.search || gas.title.toLowerCase().includes(filters.search.toLowerCase())
      )
      return filteredMockItems
    }
  },

  async getGasById(id: number): Promise<Gas> {
    const url = `${API_PREFIX}/gases/${id}`
    console.log(`🔄 ${isTauri ? 'Tauri' : 'Web'} API: Fetching ${url}`)

    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        ...(isTauri ? { mode: 'cors' } : {})
      })
      
      console.log(`📡 Response status: ${response.status} ${response.statusText}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch gas: ${response.status}`)
      }
      
      const gasDTO: BackendGasDTO = await response.json()
      const imageURL = getValidImageUrl(gasDTO.image_url)
      console.log(`✅ Received gas: ${gasDTO.title}, image: "${gasDTO.image_url}" -> "${imageURL}"`)
      
      return {
        id: gasDTO.id,
        title: gasDTO.title,
        description: gasDTO.description,
        imageURL: imageURL,
        molarMass: gasDTO.molar_mass
      }
      
    } catch (error) {
      console.warn(`❌ ${isTauri ? 'Tauri' : 'Web'} API Error, using mock data:`, error)
      const gas = GASES_MOCK.find(g => g.id === id)
      if (!gas) throw new Error('Gas not found')
      
      return gas
    }
  },

  filterMockGases(gases: Gas[], filters: GasFilters): Gas[] {
    if (!filters.search) return gases
    
    return gases.filter(gas =>
      gas.title.toLowerCase().includes(filters.search!.toLowerCase())
    )
  }
}
