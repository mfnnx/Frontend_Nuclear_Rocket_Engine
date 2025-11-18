import type { Gas } from '../types'
import { GASES_MOCK } from './mock'

const API_BASE_URL = '/api'

const getValidImageUrl = (imageURL: string | null | undefined): string => {
  if (!imageURL || imageURL.trim() === '') {
    return '/images/default-gas.jpg'
  }
  
  if (imageURL.startsWith('/')) {
    return `http://localhost:9000${imageURL}`
  }
  
  return imageURL
}

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
      const queryParams = new URLSearchParams()
      if (filters.search) queryParams.append('title', filters.search)

      const url = `${API_BASE_URL}/gases?${queryParams}`

      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch gases: ${response.status}`)
      }

      const data: BackendPaginatedResponse = await response.json()
      
      return data.items.map(gasDTO => ({
        id: gasDTO.id,
        title: gasDTO.title,
        description: gasDTO.description,
        imageURL: getValidImageUrl(gasDTO.image_url),
        molarMass: gasDTO.molar_mass
      }))
    } catch (error) {
      return this.filterMockGases(GASES_MOCK, filters)
    }
  },

  async getGasById(id: number): Promise<Gas> {
    try {
      const url = `${API_BASE_URL}/gases/${id}`

      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      })
      
      
      if (!response.ok) {
        throw new Error(`Failed to fetch gas: ${response.status}`)
      }
      
      const gasDTO: BackendGasDTO = await response.json()

      
      return {
        id: gasDTO.id,
        title: gasDTO.title,
        description: gasDTO.description,
        imageURL: getValidImageUrl(gasDTO.image_url),
        molarMass: gasDTO.molar_mass
      }
    } catch (error) {
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
