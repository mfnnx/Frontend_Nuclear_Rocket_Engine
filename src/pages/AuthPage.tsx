import type { FC, FormEvent, ChangeEvent } from 'react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import './AuthPage.css'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { loginUserAsync, clearError } from '../store/slices/userSlice'
import { ROUTES } from '../Routes'

const AuthPage: FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const { isLoading, error, isAuthenticated } = useAppSelector((state) => state.user)

  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [localError, setLocalError] = useState('')

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!login || !password) {
      setLocalError('Заполните все поля')
      return
    }

    setLocalError('')

    const result = await dispatch(loginUserAsync({ login, password }))

    if (loginUserAsync.fulfilled.match(result)) {
      navigate(ROUTES.GASES)
    }
  }

  const handleChangeLogin = (e: ChangeEvent<HTMLInputElement>) => {
    setLogin(e.target.value)
    setLocalError('')
    if (error) dispatch(clearError())
  }

  const handleChangePassword = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
    setLocalError('')
    if (error) dispatch(clearError())
  }

  if (isAuthenticated) {
    navigate(ROUTES.GASES)
    return null
  }

  return (
    <div className="auth">
      <div className="login-card">
        <h1 className="login-title">Вход</h1>
        <p className="login-subtitle">
          Добро пожаловать в калькулятор<br />
          импульса ядерного ракетного двигателя
        </p>

        {(localError || error) && (
          <div className="login-subtitle">{localError || error}</div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="field">
            <span className="field-label">Логин</span>
            <input
              type="text"
              className="field-input"
              value={login}
              onChange={handleChangeLogin}
              placeholder="Введите логин"
            />
          </div>

          <div className="field">
            <span className="field-label">Пароль</span>
            <input
              type="password"
              className="field-input"
              value={password}
              onChange={handleChangePassword}
              placeholder="Введите пароль"
            />
          </div>

          <button
            type="submit"
            className="btn-login"
            disabled={isLoading}
          >
            {isLoading ? 'Загрузка...' : 'Войти'}
          </button>
        </form>

        <p className="login-footer">
          Нет аккаунта?{' '}
          <Link to={ROUTES.REGISTER} className="login-register">
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  )
}

export default AuthPage
