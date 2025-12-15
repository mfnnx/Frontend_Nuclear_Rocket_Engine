import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../index'
import { api } from '../../api'           // ← вот так
import type { DsImpulseCalculationDTO } from '../../api/Api'


export type ImpulseCalculationListParams = {
  status?: string
  from?: string
  to?: string
}

export const fetchImpulseCalculationsList = createAsyncThunk<
  DsImpulseCalculationDTO[],
  ImpulseCalculationListParams | void
>('impulseCalculationList/fetchList', async (params) => {
  const res = await api.impulseCalculations.impulseCalculationsList({
    status: params?.status,
    from: params?.from,
    to: params?.to,
  })
  return res.data ?? []
})

export type ImpulseCalculationListState = {
  list: DsImpulseCalculationDTO[]
  isLoading: boolean
  error: string | null
}

const initialState: ImpulseCalculationListState = {
  list: [],
  isLoading: false,
  error: null,
}

const impulseCalculationListSlice = createSlice({
  name: 'impulseCalculationList',
  initialState,
  reducers: {
    clearImpulseCalculationList(state) {
      state.list = []
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchImpulseCalculationsList.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(
        fetchImpulseCalculationsList.fulfilled,
        (state, action: PayloadAction<DsImpulseCalculationDTO[]>,
      ) => {
        state.isLoading = false
        state.list = action.payload
      })
      .addCase(fetchImpulseCalculationsList.rejected, (state, action) => {
        state.isLoading = false
        state.error =
          action.error.message || 'Не удалось загрузить список заявок'
      })
  },
})

export const { clearImpulseCalculationList } = impulseCalculationListSlice.actions

export const selectImpulseCalculationList = (state: RootState) =>
  state.impulseCalculationList

export default impulseCalculationListSlice.reducer
