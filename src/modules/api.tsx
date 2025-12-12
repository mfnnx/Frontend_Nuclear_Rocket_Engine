import type { Gas } from '../types'
import { GASES_MOCK } from './mock'

// Определяем, что сейчас сборка под Tauri
const isTauri = true

// IP и порт бэка (как в services api.tsx)
const BACKEND_IP = 'http://192.168.1.108:8080'

// Базовый URL:
// - в браузере: /api (через Vite proxy)
// - в tauri.exe: http://IP:порт/api
const API_BASE_URL = isTauri ? `${BACKEND_IP}/api` : '/api'

// Базовый URL для картинок MinIO
const MINIO_BASE = 'http://192.168.1.108:9000'

// Универсальная функция обработки ImageURL (как у тебя в примере с газами)
const getValidImageUrl = (imageURL: string | null | undefined): string => {
  console.log('📸 Gas ImageURL received:', imageURL, 'Type:', typeof imageURL)

  if (!imageURL || imageURL.trim().length === 0) {
    console.log('🔄 Using default gas image')
    // для газа можешь подставить свой defalut
    return '/images/default-gas.png'
  }

  // 1. Полный URL
  if (imageURL.startsWith('http://') || imageURL.startsWith('https://')) {
    try {
      new URL(imageURL)

      // localhost:9000 → IP MinIO
      if (imageURL.includes('localhost:9000')) {
        const replaced = imageURL.replace('localhost:9000', '192.168.1.108:9000')
        console.log('🔁 Replaced localhost in gas URL:', replaced)
        return replaced
      }

      // если уже с IP MinIO — оставляем как есть
      if (imageURL.includes('192.168.1.108:9000')) {
        return imageURL
      }

      return imageURL
    } catch {
      // невалидный, пойдём дальше
    }
  }

  // 2. Относительный путь с ведущим слешем (/img/..., /uploads/...)
  if (imageURL.startsWith('/')) {
    return `${MINIO_BASE}${imageURL}`
  }

  // 3. Относительный путь без слеша (img/... или просто имя файла)
  if (!imageURL.includes('://')) {
    if (imageURL.startsWith('img/')) {
      return `${MINIO_BASE}/${imageURL}`
    }
    // просто имя файла
    return `${MINIO_BASE}/img/${imageURL}`
  }

  return imageURL
}

// DTO как от бэка
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
    try {
      const params = new URLSearchParams()
      if (filters.search) params.append('title', filters.search)

      const qs = params.toString()
      const url = qs
        ? `${API_BASE_URL}/gases?${qs}`
        : `${API_BASE_URL}/gases`

      console.log('🔄 getGases URL:', url)

      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        ...(isTauri ? { mode: 'cors' as const } : {}),
      })

      console.log('📡 getGases status:', response.status, response.statusText)

      if (!response.ok) {
        throw new Error(`Failed to fetch gases: ${response.status}`)
      }

      const data: BackendPaginatedResponse = await response.json()

      return data.items.map((gasDTO) => {
        const imageURL = getValidImageUrl(gasDTO.image_url)
        console.log(
          `🖼 Gas image transform: "${gasDTO.image_url}" -> "${imageURL}"`,
        )

        return {
          id: gasDTO.id,
          title: gasDTO.title,
          description: gasDTO.description,
          imageURL,
          molarMass: gasDTO.molar_mass,
        }
      })
    } catch (error) {
      console.warn('Failed to fetch gases, using mock data.', error)
      return this.filterMockGases(GASES_MOCK, filters)
    }
  },

  async getGasById(id: number): Promise<Gas> {
    try {
      const url = `${API_BASE_URL}/gases/${id}`
      console.log('🔄 getGasById URL:', url)

      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        ...(isTauri ? { mode: 'cors' as const } : {}),
      })

      console.log('📡 getGasById status:', response.status, response.statusText)

      if (!response.ok) {
        throw new Error(`Failed to fetch gas: ${response.status}`)
      }

      const gasDTO: BackendGasDTO = await response.json()
      const imageURL = getValidImageUrl(gasDTO.image_url)

      console.log(
        `✅ Gas loaded: ${gasDTO.title}, image "${gasDTO.image_url}" -> "${imageURL}"`,
      )

      return {
        id: gasDTO.id,
        title: gasDTO.title,
        description: gasDTO.description,
        imageURL,
        molarMass: gasDTO.molar_mass,
      }
    } catch (error) {
      console.warn('❌ API Error, using gas mock:', error)
      const gas = GASES_MOCK.find((g) => g.id === id)
      if (!gas) throw new Error('Gas not found')
      return gas
    }
  },

  filterMockGases(gases: Gas[], filters: GasFilters): Gas[] {
    if (!filters.search) return gases
    const search = filters.search.toLowerCase()
    return gases.filter((gas) =>
      gas.title.toLowerCase().includes(search),
    )
  },
}
