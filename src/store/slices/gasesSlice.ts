import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '../../api'
import type { DsGasDTO, DsGasCreateRequest, DsGasUpdateRequest } from '../../api/Api'
import { GASES_MOCK } from '../../modules/mock.tsx'

interface GasesState {
  gases: DsGasDTO[]
  searchValue: string
  isLoading: boolean
  error: string | null
}

const initialState: GasesState = {
  gases: [],
  searchValue: '',
  isLoading: false,
  error: null,
}

// ✅ ФИКС: getGasesList с моками при 500 ошибке
export const getGasesList = createAsyncThunk(
  'gases/getGasesList',
  async (_, { getState }) => {
    const { gases }: any = getState()
    
    try {
      const response = await api.gases.gasesList({
        title: gases.searchValue || undefined,
      })
      return response.data
    } catch (error: any) {
      // ✅ ЛОВИМ 500 + network ошибки → МОКИ!
      console.warn('🔴 API 500/Network error → МОКИ!')
      
      // ✅ ФИЛЬТРУЕМ МОКИ ПО ПОИСКУ
      const filteredMocks = GASES_MOCK.filter(gas =>
        !gases.searchValue || 
        gas.title.toLowerCase().includes(gases.searchValue.toLowerCase())
      )
      
      // ✅ ВОЗВРАЩАЕМ МОКИ как fulfilled!
      return { 
        items: filteredMocks.map(mock => ({
          id: mock.id,
          title: mock.title,
          description: mock.description,
          image_url: mock.imageURL || null,
          molar_mass: mock.molarMass
        }))
      }
    }
  }
)

// --- НОВЫЕ МЕТОДЫ ДЛЯ АДМИНКИ (БЕЗ ИЗМЕНЕНИЙ) ---
export const createGas = createAsyncThunk(
  'gases/create',
  async (data: DsGasCreateRequest, { rejectWithValue }) => {
    try {
      await api.gases.gasesCreate(data)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Ошибка создания')
    }
  }
)

export const updateGas = createAsyncThunk(
  'gases/update',
  async ({ id, data }: { id: number; data: DsGasUpdateRequest }, { rejectWithValue }) => {
    try {
      await api.gases.gasesUpdate(id, data)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Ошибка обновления')
    }
  }
)

export const deleteGas = createAsyncThunk(
  'gases/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await api.gases.gasesDelete(id)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Ошибка удаления')
    }
  }
)

export const uploadGasImage = createAsyncThunk(
  'gases/uploadImage',
  async ({ id, file }: { id: number; file: File }, { rejectWithValue }) => {
    try {
      await api.gases.imageCreate(id, { file });
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Ошибка загрузки изображения');
    }
  }
)

const gasesSlice = createSlice({
  name: 'gases',
  initialState,
  reducers: {
    setSearchValue: (state, action) => {
      state.searchValue = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getGasesList.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getGasesList.fulfilled, (state, action) => {
        state.isLoading = false
        state.error = null // ✅ Ошибка сбрасывается
        const payload = action.payload as { items?: DsGasDTO[] }
        state.gases = Array.isArray(payload.items) ? payload.items : []
        console.log(`✅ Gases loaded: ${state.gases.length}`) // ✅ Дебаг
      })
      .addCase(getGasesList.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        state.gases = [] // ✅ НЕ НУЖНО - моки в fulfilled!
      })
      // Админка thunk'и
      .addCase(createGas.fulfilled, () => { /* refetch list */ })
      .addCase(updateGas.fulfilled, () => { /* refetch list */ })
      .addCase(deleteGas.fulfilled, () => { /* refetch list */ })
  },
})

export const { setSearchValue } = gasesSlice.actions
export default gasesSlice.reducer
