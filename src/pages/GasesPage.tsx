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
            <div className="cart-link" aria-disabled="true">
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

      <div className="gases-search d-flex justify-content-center">
        <form
          className="gases-search-form"
          onSubmit={handleSearchSubmit}
          style={{
            position: 'relative',
            display: 'inline-block',
          }}
        >
          <input
            ref={searchInputRef}
            type="text"
            className="gases-search-field form-control"
            placeholder="Поиск…"
            name="searchGases"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleInputKeyDown}
            style={{
              width: '300px',
              height: '48px',
              padding: '0 44px 0 20px',
              borderRadius: '999px',
              border: '2px solid #D2F95F',
              background: 'transparent',
              color: '#D2F95F',
              fontSize: '15px',
              WebkitAppearance: 'none',
              MozAppearance: 'textfield',
              lineHeight: '48px',
              boxSizing: 'border-box',
            }}
          />
          <button
            type="submit"
            onClick={handleSearchClick}
            style={{
              position: 'absolute',
              right: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'transparent',
              border: 'none',
              padding: '0',
              margin: '0',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '24px',
              height: '24px',
              outline: 'none',
            }}
            aria-label="Поиск"
          >
            <img
              src={getAsset('search.png')}
              alt="Поиск"
              style={{
                width: '20px',
                height: '20px',
                display: 'block',
                filter:
                  'brightness(0) saturate(100%) invert(89%) sepia(67%) saturate(587%) hue-rotate(23deg) brightness(101%) contrast(96%)',
              }}
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
        <div className="gases-cards-rocket d-flex flex-wrap justify-content-center mx-auto">
          {gases.map((gas: DsGasDTO) => (
            <article
              key={gas.id}
              className={
                'gases-card-rocket d-flex flex-column align-items-center' +
                (isAuthenticated ? ' gases-card-rocket--auth' : '')
              }
            >
              <div
                className="gases-thumb-wrap"
                style={{
                  width: '202px',
                  height: '166px',
                  background: 'transparent',
                  overflow: 'hidden',
                  flexShrink: 0,
                }}
              >
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
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).src = getAsset(
                      'defaultgas.png',
                    )
                  }}
                />
              </div>

              <div className="gases-card-info text-center flex-grow-1 d-flex flex-direction-column justify-content-center">
                <div className="gases-card-title">{gas.title}</div>
              </div>

              <div className="gases-actions w-100 mt-auto">
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
