import type { FC, FormEvent } from 'react'
import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './GasesPage.css'
import { getAsset } from '../utils/path'

import { useAppDispatch, useAppSelector } from '../store/hooks'
import { getGasesList, setSearchValue } from '../store/slices/gasesSlice'
import { getCart } from '../store/slices/cartSlice'
import { addGasToCalculation } from '../store/slices/impulseCalculationSlice.ts'
import { ROUTES } from '../Routes'
import type { DsGasDTO } from '../api/Api'

const GasesPage: FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const { gases, isLoading, error } = useAppSelector((state) => state.gases)
  const { isAuthenticated } = useAppSelector((state) => state.user)
  const { calculation_id, count } = useAppSelector((state) => state.cart)

  const [searchQuery, setSearchQuery] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)

  // загрузка газов (доступна всем, в т.ч. гостю)
  useEffect(() => {
    dispatch(getGasesList())
  }, [dispatch])

  // подгружаем корзину для счетчика только после авторизации
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getCart())
    }
  }, [isAuthenticated, dispatch])

  // локальный поиск → кладём в слайс и дергаем getGasesList
  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    dispatch(setSearchValue(searchQuery))
    dispatch(getGasesList())
  }

  const handleSearchClick = () => {
    if (searchInputRef.current) {
      searchInputRef.current.focus()
    }
    dispatch(setSearchValue(searchQuery))
    dispatch(getGasesList())
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      dispatch(setSearchValue(searchQuery))
      dispatch(getGasesList())
    }
  }

  const handleAddGas = async (gasId: number) => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN)
      return
    }

    const res = await dispatch(addGasToCalculation(gasId))
    if (addGasToCalculation.fulfilled.match(res)) {
      // обновляем бейдж корзины после успешного добавления
      dispatch(getCart())
    }
  }

  const selectedCount = count
  const impulseCalculationId = calculation_id ?? 0

  return (
    <main className="container gases-page">
      <div className="page-head">
        <h1 className="page-title">Рабочее тело</h1>

        <div className="cart-wrap">
          {isAuthenticated && selectedCount > 0 && impulseCalculationId ? (
            <Link
              to={`/impulse_calculation/${impulseCalculationId}`}
              className="cart-link"
              aria-label="К заявке"
            >
              <img
                src={getAsset('rocket.svg')}
                className="cart"
                alt="К заявке"
              />
              <span className="count">{selectedCount}</span>
            </Link>
          ) : (
            <div className="cart-link disabled" aria-disabled="true">
              <img
                src={getAsset('rocket.svg')}
                className="cart"
                alt="К заявке"
              />
              {isAuthenticated && <span className="count">{selectedCount}</span>}
            </div>
          )}
        </div>
      </div>

      <div className="gases-search">
        <form
          className="gases-search-form"
          onSubmit={handleSearchSubmit}
        >
          <input
            ref={searchInputRef}
            type="text"
            className="gases-search-field"
            placeholder="Поиск…"
            name="searchGases"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleInputKeyDown}
          />
          <button
            type="submit"
            className="gases-search-button"
            onClick={handleSearchClick}
            aria-label="Поиск"
          >
            <img
              src={getAsset('search.png')}
              alt="Поиск"
              className="gases-search-icon"
            />
          </button>
        </form>
      </div>

      {error && !isLoading && (
        <div className="gases-loading text-center">{error}</div>
      )}

      {isLoading ? (
        <div className="gases-loading text-center">Загрузка...</div>
      ) : (
        <div className="gases-cards-rocket">
          {gases.map((gas: DsGasDTO) => (
            <article
              key={gas.id}
              className={
                'gases-card-rocket d-flex flex-column align-items-center' +
                (isAuthenticated ? ' gases-card-rocket--auth' : '')
              }
            >
              <div className="gases-thumb-wrap">
                <img
                  className="gases-thumb"
                  src={
                    gas.image_url
                      ? gas.image_url.replace(
                          'http://localhost:9000',
                          '/minio',
                        )
                      : getAsset('defaultgas.png')
                  }
                  alt={gas.title}
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).src = getAsset(
                      'defaultgas.png',
                    )
                  }}
                />
              </div>

              <div className="gases-card-info">
                <div className="gases-card-title">{gas.title}</div>
              </div>

              <div className="gases-actions">
                <Link
                  className="gases-btn gases-btn-ghost w-100"
                  to={`/gases/${gas.id}`}
                >
                  К описанию
                </Link>

                {isAuthenticated && (
                  <button
                    type="button"
                    className="gases-btn gases-btn-ghost w-100"
                    onClick={() => handleAddGas(gas.id!)}
                  >
                    Добавить
                  </button>
                )}
              </div>
            </article>
          ))}

          {gases.length === 0 && !isLoading && (
            <div className="gases-no-gases text-center">
              <h3>Газы не найдены</h3>
              <p>Попробуйте изменить поисковый запрос</p>
            </div>
          )}
        </div>
      )}
    </main>
  )
}

export default GasesPage
