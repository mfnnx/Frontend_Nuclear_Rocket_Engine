import type { FC, FormEvent, ChangeEvent } from 'react'
import { useState } from 'react'
import './ProfilePage.css'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { logoutUserAsync, updateProfileAsync } from '../store/slices/userSlice'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../Routes'

const ProfilePage: FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const { id, login } = useAppSelector((state) => state.user)

  const [isEditing, setIsEditing] = useState(false)
  const [editLogin, setEditLogin] = useState(login || '')
  const [newPassword, setNewPassword] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!id) {
      return
    }

    await dispatch(
      updateProfileAsync({
        id,
        login: editLogin,
        password: newPassword || undefined,
      }),
    )

    setIsEditing(false)
    setNewPassword('')
  }

  const handleCancel = () => {
    setEditLogin(login || '')
    setNewPassword('')
    setIsEditing(false)
  }

  const handleLogout = async () => {
    await dispatch(logoutUserAsync())
    navigate(ROUTES.LOGIN)
  }

  const onChangeLogin = (e: ChangeEvent<HTMLInputElement>) =>
    setEditLogin(e.target.value)

  const onChangePassword = (e: ChangeEvent<HTMLInputElement>) =>
    setNewPassword(e.target.value)

  return (
    <div className="profile-shell">
      <main className="profile-card">
        <section className="profile-head">
          <h1 className="profile-title">Профиль</h1>

          <div className="profile-user">
            <div className="profile-avatar">
              <img
                src="/circle-user-round.png"
                alt="Аватар пользователя"
                className="profile-avatar-icon"
              />
            </div>

            <div className="profile-meta">
              <div className="profile-name">{login || 'Пользователь'}</div>
              <div className="profile-handle">@{login}</div>
              <div className="profile-id">ID: {id ?? '—'}</div>
            </div>
          </div>
        </section>

        <div className="profile-separator" />

        <form className="profile-form" onSubmit={handleSubmit}>
          {!isEditing && (
            <>
              <div className="profile-row profile-row--full">
                <div className="profile-field">
                  <label className="profile-label" htmlFor="login">
                    Логин
                  </label>
                  <input
                    id="login"
                    name="login"
                    type="text"
                    className="profile-input"
                    value={login || ''}
                    disabled
                  />
                </div>
              </div>

              <div className="profile-row profile-row--full">
                <div className="profile-field">
                  <label className="profile-label" htmlFor="password">
                    Пароль
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    className="profile-input"
                    value="********"
                    disabled
                  />
                </div>
              </div>

              <div className="profile-actions profile-actions--edit">
                <button
                  type="button"
                  className="profile-btn profile-btn--primary"
                  onClick={() => setIsEditing(true)}
                >
                  <span className="icon-wrap">
                    <img
                      src="/square-pen.png"
                      className="icon icon-default"
                      alt=""
                    />
                    <img
                      src="/square-pen_bl.png"
                      className="icon icon-hover"
                      alt=""
                    />
                  </span>
                  <span>Редактировать</span>
                </button>

                <button
                  type="button"
                  className="profile-btn profile-btn--danger"
                  onClick={handleLogout}
                >
                  <span className="icon-wrap">
                    <img
                      src="/log-out.png"
                      className="icon icon-default"
                      alt=""
                    />
                    <img
                      src="/log-out2.png"
                      className="icon icon-hover"
                      alt=""
                    />
                  </span>
                  <span>Выйти из аккаунта</span>
                </button>
              </div>
            </>
          )}

          {isEditing && (
            <>
              <div className="profile-row profile-row--full">
                <div className="profile-field">
                  <label className="profile-label" htmlFor="editLogin">
                    Логин
                  </label>
                  <input
                    id="editLogin"
                    name="editLogin"
                    type="text"
                    className="profile-input"
                    placeholder="Введите логин"
                    value={editLogin}
                    onChange={onChangeLogin}
                  />
                </div>
              </div>

              <div className="profile-row profile-row--full profile-row--no-gap">
                <div className="profile-field">
                  <label className="profile-label" htmlFor="newPassword">
                    Новый пароль
                  </label>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    className="profile-input"
                    placeholder="Введите новый пароль"
                    value={newPassword}
                    onChange={onChangePassword}
                  />
                </div>
                <p className="profile-hint profile-hint--tight">
                  Оставьте пустым, если не хотите менять пароль
                </p>
              </div>

              <div className="profile-actions">
                <button
                  type="submit"
                  className="profile-btn profile-btn--success"
                >
                  <span className="icon-wrap">
                    <img
                      src="/check.png"
                      className="icon icon-default"
                      alt=""
                    />
                    <img
                      src="/check_bl.png"
                      className="icon icon-hover"
                      alt=""
                    />
                  </span>
                  <span>Сохранить</span>
                </button>

                <button
                  type="button"
                  className="profile-btn profile-btn--ghost"
                  onClick={handleCancel}
                >
                  <span className="icon-wrap">
                    <img src="/x.png" className="icon icon-default" alt="" />
                    <img
                      src="/x_re.png"
                      className="icon icon-hover"
                      alt=""
                    />
                  </span>
                  <span>Отмена</span>
                </button>
              </div>
            </>
          )}
        </form>
      </main>
    </div>
  )
}

export default ProfilePage
