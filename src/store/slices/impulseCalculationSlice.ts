import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '../../api'

export interface GasInCalculation {
  gas_id: number
  title: string
  description: string
  image_url: string | null
  mass: number
  impulse: number
}

export interface CalculationFull {
  id: number
  user_login: string
  status: string
  temperature: number
  date_created: string
  total_impulse: number
  gas_count: number
  fields: GasInCalculation[]
}

interface ImpulseCalculationState {
  id?: number
  calculation: CalculationFull | null
  fields: GasInCalculation[]
  temperature?: number
  status?: string
  isLoading: boolean
  isUpdating: boolean
  error: string | null
}

const initialState: ImpulseCalculationState = {
  id: undefined,
  calculation: null,
  fields: [],
  temperature: undefined,
  status: undefined,
  isLoading: false,
  isUpdating: false,
  error: null,
}

const applyPayload = (state: ImpulseCalculationState, payload: any) => {
  state.calculation = payload
  state.id = payload.id
  state.temperature = payload.temperature
  state.status = payload.status
  
    
  if (payload.fields && Array.isArray(payload.fields)) {
    state.fields = payload.fields.map((field: any) => ({
      gas_id: field.gas_id,
      title: field.gas?.title || 'Без названия',
      description: field.gas?.description || '',
      image_url: field.gas?.image_url || null,
      mass: field.mass || 0,
      impulse: field.impulse || 0,
    }))
  } else {
    state.fields = []
  }
}

export const addGasToCalculation = createAsyncThunk(
  'impulseCalculation/addGasToCalculation',
  async (gasId: number, { rejectWithValue }) => {
    try {
      const response = await api.impulseCalculations.draftGasesCreate(gasId)
      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.detail || 'Ошибка при добавлении газа',
      )
    }
  },
)

const impulseCalculationSlice = createSlice({
  name: 'impulseCalculation',
  initialState,
  reducers: {
    clearCalculation: (state) => {
      state.id = undefined
      state.calculation = null
      state.fields = []
      state.temperature = undefined
      state.status = undefined
      state.error = null
      state.isLoading = false
      state.isUpdating = false
    },
    setLoading: (state, action) => { 
      state.isLoading = action.payload 
    },
    setUpdating: (state, action) => { 
      state.isUpdating = action.payload 
    },
    setError: (state, action) => { 
      state.error = action.payload 
    },
    setCalculation: (state, action) => {
      applyPayload(state, action.payload)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addGasToCalculation.pending, (state) => {
        state.isUpdating = true
        state.error = null
      })
      .addCase(addGasToCalculation.fulfilled, (state, action) => {
        state.isUpdating = false
        applyPayload(state, action.payload)
      })
      .addCase(addGasToCalculation.rejected, (state, action) => {
        state.isUpdating = false
        state.error = action.payload as string
      })
  },
})

export const { 
  clearCalculation, 
  setLoading, 
  setUpdating, 
  setError, 
  setCalculation 
} = impulseCalculationSlice.actions

export default impulseCalculationSlice.reducer
