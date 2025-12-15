import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '../../api'

interface CartState {
  calculation_id?: number
  count: number
  isLoading: boolean
  error: string | null
}

const initialState: CartState = {
  calculation_id: undefined,
  count: 0,
  isLoading: false,
  error: null,
}

export const getCart = createAsyncThunk(
  'cart/getCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.impulseCalculations.cartList()
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Ошибка при загрузке корзины')
    }
  }
)

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCalculationId: (state, action) => {
      state.calculation_id = action.payload
    },
    setCount: (state, action) => {
      state.count = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCart.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getCart.fulfilled, (state, action) => {
        state.isLoading = false
        state.calculation_id = action.payload.calculation_id
        state.count = action.payload.count || 0
      })
      .addCase(getCart.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const { setCalculationId, setCount } = cartSlice.actions
export default cartSlice.reducer