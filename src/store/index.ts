import { configureStore } from '@reduxjs/toolkit'

import filterReducer from './slices/filterSlice'
import userReducer from './slices/userSlice'
import gasesReducer from './slices/gasesSlice'
import cartReducer from './slices/cartSlice'
import impulseCalculationReducer from './slices/impulseCalculationSlice'
import impulseCalculationListReducer from './slices/impulseCalculationListSlice'

export const store = configureStore({
  reducer: {
    filter: filterReducer,
    user: userReducer,
    gases: gasesReducer,
    cart: cartReducer,
    impulseCalculation: impulseCalculationReducer,
    impulseCalculationList: impulseCalculationListReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
