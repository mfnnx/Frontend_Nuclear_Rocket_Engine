import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../index'
import { api } from '../../api'
import type { DsImpulseCalculationDTO, DsImpulseCalculationStatusUpdateRequest } from '../../api/Api'

export type UserStatDTO = {
    user_id: number
    count: number
}

export type ImpulseCalculationListParams = {
  status?: string
  from?: string
  to?: string
  page?: number
  limit?: number
  user_id?: number | 'all'
  use_index?: boolean // <--- Добавили
}

type ImpulseCalculationListResponse = {
  items: DsImpulseCalculationDTO[]
  total: number
  time_ms: number
  user_stats?: UserStatDTO[]
}

export const fetchImpulseCalculationsList = createAsyncThunk<
  ImpulseCalculationListResponse, 
  ImpulseCalculationListParams | void
>('impulseCalculationList/fetchList', async (params) => {
    const queryParams: any = {
        status: params?.status,
        from: params?.from,
        to: params?.to,
        page: params?.page,
        limit: params?.limit,
        use_index: params?.use_index // <--- Передаем
    };
    
    if (params?.user_id && params.user_id !== 'all') {
        queryParams.user_id = params.user_id;
    }

  const res = await api.impulseCalculations.impulseCalculationsList(queryParams)
  return res.data 
})

export const resolveCalculation = createAsyncThunk(
  'impulseCalculationList/resolve',
  async ({ id, status }: { id: number; status: string }, { rejectWithValue }) => {
    try {
      const body: DsImpulseCalculationStatusUpdateRequest = { status };
      await api.impulseCalculations.resolveUpdate(id, body);
      return { id, status };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Ошибка смены статуса');
    }
  }
);

export type ImpulseCalculationListState = {
  list: DsImpulseCalculationDTO[]
  isLoading: boolean
  error: string | null
  total: number
  timeMs: number
  user_stats: UserStatDTO[]
}

const initialState: ImpulseCalculationListState = {
  list: [],
  isLoading: false,
  error: null,
  total: 0,
  timeMs: 0,
  user_stats: [],
}

const impulseCalculationListSlice = createSlice({
  name: 'impulseCalculationList',
  initialState,
  reducers: {
    clearImpulseCalculationList(state) {
      state.list = []
      state.error = null
      state.total = 0
      state.timeMs = 0
      state.user_stats = []
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
        (state, action: PayloadAction<ImpulseCalculationListResponse>) => {
          state.isLoading = false
          state.list = action.payload.items || []
          state.total = action.payload.total || 0
          state.timeMs = action.payload.time_ms || 0
          if (action.payload.user_stats) {
              state.user_stats = action.payload.user_stats;
          }
        },
      )
      .addCase(fetchImpulseCalculationsList.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Не удалось загрузить список заявок'
      })
      .addCase(resolveCalculation.fulfilled, (state, action) => {
          const item = state.list.find(i => i.id === action.payload.id);
          if (item) item.status = action.payload.status;
      });
  },
})

export const { clearImpulseCalculationList } = impulseCalculationListSlice.actions
export const selectImpulseCalculationList = (state: RootState) => state.impulseCalculationList
export default impulseCalculationListSlice.reducer
