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
  gases: GasInCalculation[]
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

// общая функция, чтобы не дублировать код
const applyPayload = (
  state: ImpulseCalculationState,
  payload: CalculationFull,
) => {
  state.calculation = payload
  state.id = payload.id
  state.temperature = payload.temperature
  state.status = payload.status
  state.fields = payload.gases || []
}

// Загрузить расчет
export const getImpulseCalculation = createAsyncThunk(
  'impulseCalculation/getImpulseCalculation',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await api.impulseCalculations.impulseCalculationsDetail(
        id,
      )
      return response.data as CalculationFull
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.detail || 'Ошибка при загрузке расчета',
      )
    }
  },
)

// Обновить температуру
export const updateImpulseCalculation = createAsyncThunk(
  'impulseCalculation/updateImpulseCalculation',
  async (
    { id, temperature }: { id: number; temperature: number },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.impulseCalculations.impulseCalculationsUpdate(
        id,
        {
          temperature,
        },
      )
      return response.data as CalculationFull
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.detail || 'Ошибка при обновлении расчета',
      )
    }
  },
)

// Добавить газ в черновик
export const addGasToCalculation = createAsyncThunk(
  'impulseCalculation/addGasToCalculation',
  async (gasId: number, { rejectWithValue }) => {
    try {
      const response = await api.impulseCalculations.draftGasesCreate(gasId)
      return response.data as CalculationFull
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.detail || 'Ошибка при добавлении газа',
      )
    }
  },
)

// Обновить газ в расчете
export const updateGasInCalculation = createAsyncThunk(
  'impulseCalculation/updateGasInCalculation',
  async (
    {
      id,
      gasId,
      mass,
      impulse,
    }: { id: number; gasId: number; mass?: number; impulse?: number },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.impulseCalculations.gasesUpdate(id, gasId, {
        mass,
        impulse,
      })
      return response.data as CalculationFull
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.detail || 'Ошибка при обновлении газа',
      )
    }
  },
)

// Удалить газ
export const deleteGasFromCalculation = createAsyncThunk(
  'impulseCalculation/deleteGasFromCalculation',
  async (
    { id, gasId }: { id: number; gasId: number },
    { rejectWithValue },
  ) => {
    try {
      await api.impulseCalculations.gasesDelete(id, gasId)
      return gasId
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.detail || 'Ошибка при удалении газа',
      )
    }
  },
)

// Удалить расчет
export const deleteImpulseCalculation = createAsyncThunk(
  'impulseCalculation/deleteImpulseCalculation',
  async (id: number, { rejectWithValue }) => {
    try {
      await api.impulseCalculations.impulseCalculationsDelete(id)
      return null
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.detail || 'Ошибка при удалении расчета',
      )
    }
  },
)

// Сформировать расчет
export const formImpulseCalculation = createAsyncThunk(
  'impulseCalculation/formImpulseCalculation',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await api.impulseCalculations.formUpdate(id)
      return response.data as CalculationFull
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.detail || 'Ошибка при формировании расчета',
      )
    }
  },
)

// Завершить/отклонить расчет (модератор)
export const resolveImpulseCalculation = createAsyncThunk(
  'impulseCalculation/resolveImpulseCalculation',
  async (
    { id, status }: { id: number; status: 'COMPLETED' | 'REJECTED' },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.impulseCalculations.resolveUpdate(id, {
        status,
      })
      return response.data as CalculationFull
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.detail || 'Ошибка при обработке расчета',
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
  },
  extraReducers: (builder) => {
    builder
      .addCase(getImpulseCalculation.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getImpulseCalculation.fulfilled, (state, action) => {
        state.isLoading = false
        applyPayload(state, action.payload as CalculationFull)
      })
      .addCase(getImpulseCalculation.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    builder
      .addCase(updateImpulseCalculation.pending, (state) => {
        state.isUpdating = true
        state.error = null
      })
      .addCase(updateImpulseCalculation.fulfilled, (state, action) => {
        state.isUpdating = false
        applyPayload(state, action.payload as CalculationFull)
      })
      .addCase(updateImpulseCalculation.rejected, (state, action) => {
        state.isUpdating = false
        state.error = action.payload as string
      })

    builder
      .addCase(addGasToCalculation.pending, (state) => {
        state.isUpdating = true
        state.error = null
      })
      .addCase(addGasToCalculation.fulfilled, (state, action) => {
        state.isUpdating = false
        applyPayload(state, action.payload as CalculationFull)
      })
      .addCase(addGasToCalculation.rejected, (state, action) => {
        state.isUpdating = false
        state.error = action.payload as string
      })

    builder
      .addCase(updateGasInCalculation.pending, (state) => {
        state.isUpdating = true
        state.error = null
      })
      .addCase(updateGasInCalculation.fulfilled, (state, action) => {
        state.isUpdating = false
        applyPayload(state, action.payload as CalculationFull)
      })
      .addCase(updateGasInCalculation.rejected, (state, action) => {
        state.isUpdating = false
        state.error = action.payload as string
      })

    builder
      .addCase(deleteGasFromCalculation.pending, (state) => {
        state.isUpdating = true
        state.error = null
      })
      .addCase(deleteGasFromCalculation.fulfilled, (state, action) => {
        state.isUpdating = false
        const gasId = action.payload as number
        state.fields = state.fields.filter((g) => g.gas_id !== gasId)
      })
      .addCase(deleteGasFromCalculation.rejected, (state, action) => {
        state.isUpdating = false
        state.error = action.payload as string
      })

    builder
      .addCase(deleteImpulseCalculation.pending, (state) => {
        state.isUpdating = true
        state.error = null
      })
      .addCase(deleteImpulseCalculation.fulfilled, (state) => {
        state.isUpdating = false
        state.id = undefined
        state.calculation = null
        state.fields = []
        state.temperature = undefined
        state.status = undefined
      })
      .addCase(deleteImpulseCalculation.rejected, (state, action) => {
        state.isUpdating = false
        state.error = action.payload as string
      })

    builder
      .addCase(formImpulseCalculation.pending, (state) => {
        state.isUpdating = true
        state.error = null
      })
      .addCase(formImpulseCalculation.fulfilled, (state, action) => {
        state.isUpdating = false
        applyPayload(state, action.payload as CalculationFull)
      })
      .addCase(formImpulseCalculation.rejected, (state, action) => {
        state.isUpdating = false
        state.error = action.payload as string
      })

    builder
      .addCase(resolveImpulseCalculation.pending, (state) => {
        state.isUpdating = true
        state.error = null
      })
      .addCase(resolveImpulseCalculation.fulfilled, (state, action) => {
        state.isUpdating = false
        applyPayload(state, action.payload as CalculationFull)
      })
      .addCase(resolveImpulseCalculation.rejected, (state, action) => {
        state.isUpdating = false
        state.error = action.payload as string
      })
  },
})

export const { clearCalculation } = impulseCalculationSlice.actions
export default impulseCalculationSlice.reducer
