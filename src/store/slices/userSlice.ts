import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '../../api'
import type { DsUserDTO, DsUserUpdateRequest } from '../../api/Api'

interface UserState {
  id?: number
  login: string
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  isModerator?: boolean
  accessToken?: string
}

const initialState: UserState = {
  id: undefined,
  login: '',
  isAuthenticated: false,
  isLoading: false,
  error: null,
  isModerator: false,
  accessToken: undefined,
}

// тип под ответ логина
interface LoginApiResponse {
  expires_in?: number
  access_token?: string
  token_type?: string
  user_id?: number
  is_moderator?: boolean
}

// Вход
export const loginUserAsync = createAsyncThunk(
  'user/loginUserAsync',
  async (
    credentials: { login: string; password: string },
    { rejectWithValue },
  ) => {
    try {
      console.log('LOGIN PAYLOAD FROM FORM', credentials)

      const response = await api.auth.loginCreate({
        login: credentials.login,
        password: credentials.password,
      })

      const data = response.data as LoginApiResponse
      console.log('LOGIN RESPONSE DATA', data)

      if (data.access_token) {
        localStorage.setItem('authToken', data.access_token)
        api.setSecurityData(data.access_token)
        console.log('TOKEN SAVED TO LS')
      }

      return { ...data, login: credentials.login }
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.detail || 'Ошибка авторизации',
      )
    }
  },
)

// Регистрация
export const registerUserAsync = createAsyncThunk<
  unknown,
  { login: string; password: string },
  { rejectValue: string }
>('user/registerUserAsync', async (credentials, { rejectWithValue }) => {
  try {
    const response = await api.users.usersCreate({
      login: credentials.login,
      password: credentials.password,
    })
    return response.data
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.detail || 'Ошибка регистрации')
  }
})

// Обновление профиля (логин/пароль)
export const updateProfileAsync = createAsyncThunk<
  DsUserDTO,
  { id: number; login: string; password?: string },
  { rejectValue: string }
>('user/updateProfileAsync', async (payload, { rejectWithValue }) => {
  try {
    const body: DsUserUpdateRequest = {
      login: payload.login,
      password: payload.password,
    }
    const response = await api.users.usersUpdate(payload.id, body)
    return response.data as DsUserDTO
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.detail || 'Ошибка обновления профиля',
    )
  }
})

// Выход
export const logoutUserAsync = createAsyncThunk<
  null,
  void,
  { rejectValue: string }
>('user/logoutUserAsync', async (_, { rejectWithValue }) => {
  try {
    await api.auth.logoutCreate()
    localStorage.removeItem('authToken')
    api.setSecurityData(null)
    return null
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.detail || 'Ошибка при выходе',
    )
  }
})

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // login
    builder
      .addCase(loginUserAsync.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginUserAsync.fulfilled, (state, action) => {
        state.isLoading = false
        const payload = action.payload as LoginApiResponse & { login?: string }

        state.id = payload.user_id
        state.login = payload.login || state.login
        state.isModerator = payload.is_moderator ?? false
        state.isAuthenticated = true
        state.accessToken = payload.access_token
        state.error = null
      })
      .addCase(loginUserAsync.rejected, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = false
        state.error =
          (action.payload as string) || 'Ошибка авторизации'
      })

    // register
    builder
      .addCase(registerUserAsync.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(registerUserAsync.fulfilled, (state) => {
        state.isLoading = false
        state.error = null
      })
      .addCase(registerUserAsync.rejected, (state, action) => {
        state.isLoading = false
        state.error =
          (action.payload as string) || 'Ошибка регистрации'
      })

    // update profile
    builder
      .addCase(updateProfileAsync.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateProfileAsync.fulfilled, (state, action) => {
        state.isLoading = false
        const user = action.payload
        state.login = user.login || state.login
        state.error = null
      })
      .addCase(updateProfileAsync.rejected, (state, action) => {
        state.isLoading = false
        state.error =
          (action.payload as string) || 'Ошибка обновления профиля'
      })

    // logout
    builder
      .addCase(logoutUserAsync.pending, (state) => {
        state.isLoading = true
      })
      .addCase(logoutUserAsync.fulfilled, (state) => {
        state.isLoading = false
        state.id = undefined
        state.login = ''
        state.isAuthenticated = false
        state.isModerator = false
        state.accessToken = undefined
        state.error = null
      })
      .addCase(logoutUserAsync.rejected, (state, action) => {
        state.isLoading = false
        state.error =
          (action.payload as string) || 'Ошибка при выходе'
      })
  },
})

export const { clearError } = userSlice.actions
export default userSlice.reducer
