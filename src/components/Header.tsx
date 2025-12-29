import type { FC } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ROUTES, ROUTE_LABELS } from '../Routes'
import './Header.css'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { logoutUserAsync } from '../store/slices/userSlice'

const Header: FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  // Достаем is_moderator из стейта
  const { isAuthenticated, login } = useAppSelector((state) => state.user)

  const handleLogout = async () => {
    await dispatch(logoutUserAsync())
    navigate(ROUTES.LOGIN)
  }

  const isActive = (path: string) => location.pathname === path

  return (
    <header className="topbar">
      <div className="inner">
        <Link to={ROUTES.HOME} className="brand">
          <img
            src="/logo.svg"
            className="logo"
            alt="UNIVERSE"
          />
        </Link>

        {/* ЛЕВОЕ МЕНЮ */}
        <nav className="nav">
          <Link
            to={ROUTES.HOME}
            className={isActive(ROUTES.HOME) ? 'nav-link active' : 'nav-link'}
          >
            {ROUTE_LABELS.HOME}
          </Link>
          <Link
            to={ROUTES.GASES}
            className={isActive(ROUTES.GASES) ? 'nav-link active' : 'nav-link'}
          >
            {ROUTE_LABELS.GASES}
          </Link>

          {/* Ссылка "Мои заявки" для авторизованных, но НЕ для модераторов */}
          {isAuthenticated  && (
            <Link
              to={ROUTES.IMPULSE_CALCULATION_LIST}
              className={
                isActive(ROUTES.IMPULSE_CALCULATION_LIST)
                  ? 'nav-link active'
                  : 'nav-link'
              }
            >
              {ROUTE_LABELS.IMPULSE_CALCULATION_LIST}
            </Link>
          )}

          {/* Ссылка "Админка" ТОЛЬКО для модераторов */}
          {isAuthenticated && (
            <Link
              to={ROUTES.ADMIN_GASES}
              className={
                isActive(ROUTES.ADMIN_GASES)
                  ? 'nav-link active'
                  : 'nav-link'
              }
            >
              Редактирование газов
            </Link>
          )}
        </nav>

        {/* ПРАВОЕ МЕНЮ: Профиль / Выход */}
        <div className="nav">
          {isAuthenticated ? (
            <>
              <Link
                to={ROUTES.PROFILE}
                className={
                  isActive(ROUTES.PROFILE) ? 'nav-link active' : 'nav-link'
                }
              >
                {login}
              </Link>

              <button
                type="button"
                className="nav-link nav-link-button"
                onClick={handleLogout}
              >
                Выйти
              </button>
            </>
          ) : (
            <>
              <Link
                to={ROUTES.LOGIN}
                className={
                  isActive(ROUTES.LOGIN) ? 'nav-link active' : 'nav-link'
                }
              >
                Войти
              </Link>
              <Link
                to={ROUTES.REGISTER}
                className={
                  isActive(ROUTES.REGISTER) ? 'nav-link active' : 'nav-link'
                }
              >
                Регистрация
              </Link>
            </>
          )}
        </div>
      </div>
      <div className="site-header"></div>
    </header>
  )
}

export default Header
