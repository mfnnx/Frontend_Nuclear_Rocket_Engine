import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '../../api'
import type { DsGasDTO } from '../../api/Api'

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

export const getGasesList = createAsyncThunk(
  'gases/getGasesList',
  async (_, { getState, rejectWithValue }) => {
    const { gases }: any = getState()
    try {
      const response = await api.gases.gasesList({
        title: gases.searchValue || undefined,
      })
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Ошибка при загрузке газов')
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
        const payload = action.payload as { items?: DsGasDTO[]; total?: number }
        state.gases = Array.isArray(payload.items) ? payload.items : []
      })
      .addCase(getGasesList.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        state.gases = []
      })
  },
})

export const { setSearchValue } = gasesSlice.actions
export default gasesSlice.reducer
