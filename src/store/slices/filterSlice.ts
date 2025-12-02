// src/store/slices/filterSlice.ts
import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../index'

// Определяем интерфейс прямо здесь
interface FilterState {
  searchTerm: string
}

const initialState: FilterState = {
  searchTerm: '',
}

export const filterSlice = createSlice({
  name: 'filter',
  initialState,
  reducers: {
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload
    },
  },
})

export const { setSearchTerm } = filterSlice.actions
export const selectSearchTerm = (state: RootState) => state.filter.searchTerm
export default filterSlice.reducer
