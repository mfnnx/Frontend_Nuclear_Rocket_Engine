import type { FC, FormEvent, ChangeEvent } from 'react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import './RegisterPage.css'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { registerUserAsync, clearError } from '../store/slices/userSlice'
import { ROUTES } from '../Routes'

const RegisterPage: FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const { isLoading, error } = useAppSelector((state) => state.user)

  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [localError, setLocalError] = useState('')

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!login || !password || !repeatPassword) {
      setLocalError('Заполните все поля')
      return
    }

    if (password !== repeatPassword) {
      setLocalError('Пароли не совпадают')
      return
    }

    setLocalError('')

    const result = await dispatch(
      registerUserAsync({
        login,
        password,
      }),
    )

    if (registerUserAsync.fulfilled.match(result)) {
      navigate(ROUTES.LOGIN)
    }
  }

  const handleChange =
    (setter: (v: string) => void) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value)
      setLocalError('')
      if (error) {
        dispatch(clearError())
      }
    }

  return (
    <div className="register">
      <div className="register-card">
        <h1 className="register-title">Регистрация</h1>
        <p className="register-subtitle">
          Добро пожаловать в калькулятор<br />
          импульса ядерного ракетного двигателя
        </p>

        {(localError || error) && (
          <div className="register-subtitle">{localError || error}</div>
        )}

        <form className="register-form" onSubmit={handleSubmit}>
          <div className="field-indent">
            <span className="field-label">Придумайте логин</span>
            <input
              type="text"
              className="field-input"
              value={login}
              onChange={handleChange(setLogin)}
              placeholder="Введите логин"
            />
          </div>

          <div className="field-indent">
            <span className="field-label">Придумайте пароль</span>
            <input
              type="password"
              className="field-input"
              value={password}
              onChange={handleChange(setPassword)}
              placeholder="Введите пароль"
            />
          </div>

          <div className="field-indent">
            <span className="field-label">Повторите пароль</span>
            <input
              type="password"
              className="field-input"
              value={repeatPassword}
              onChange={handleChange(setRepeatPassword)}
              placeholder="Повторите пароль"
            />
          </div>

          <button
            type="submit"
            className="btn-register"
            disabled={isLoading}
          >
            {isLoading ? 'Загрузка...' : 'Зарегистрироваться'}
          </button>
        </form>

        <p className="register-footer">
          Уже есть аккаунт?{' '}
          <Link to={ROUTES.LOGIN} className="login-register">
            Войти
          </Link>
        </p>
      </div>
    </div>
  )
}

export default RegisterPage
