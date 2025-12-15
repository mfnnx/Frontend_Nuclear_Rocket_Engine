import { createSlice } from '@reduxjs/toolkit'

interface FilterState {
  searchTerm: string
  filterType: string
}

const initialState: FilterState = {
  searchTerm: '',
  filterType: 'all',
}

const filterSlice = createSlice({
  name: 'filter',
  initialState,
  reducers: {
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload
    },
    setFilterType: (state, action) => {
      state.filterType = action.payload
    },
    clearFilters: (state) => {
      state.searchTerm = ''
      state.filterType = 'all'
    },
  },
})

export const { setSearchTerm, setFilterType, clearFilters } = filterSlice.actions
export default filterSlice.reducer