import type { FC, FormEvent } from 'react'
import type { Gas, GasFilters } from '../types'
import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { gasesApi } from '../modules/api'
import './GasesPage.css'
import { getAsset } from '../utils/path'

const GasesPage: FC = () => {
  const [gases, setGases] = useState<Gas[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)

  // TODO: подставить реальные данные из API/контекста
  const selectedCount = 0
  const impulseCalculationId = 1

  useEffect(() => {
    const loadGases = async () => {
      setLoading(true)
      try {
        const filters: GasFilters = {}
        if (searchTerm) {
          filters.search = searchTerm
        }

        const data = await gasesApi.getGases(filters)
        setGases(data)
      } catch (error) {
        console.error('Error loading gases:', error)
      } finally {
        setLoading(false)
      }
    }

    loadGases()
  }, [searchTerm])

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault()
    setSearchTerm(searchQuery)
  }

  const handleSearchClick = () => {
    if (searchInputRef.current) {
      searchInputRef.current.focus()
    }
    setSearchTerm(searchQuery)
  }

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      setSearchTerm(searchQuery)
    }
  }

  return (
    <main className="container gases-page">
      <div className="page-head">
        <h1 className="page-title">Рабочее тело</h1>

        <div className="cart-wrap">
          {selectedCount > 0 ? (
            <Link
              to={`/impulse_calculation/${impulseCalculationId}`}
              className="cart-link"
              aria-label="К заявке"
            >
              <img
                src="/rocket.svg"
                className="cart"
                alt="К заявке"
              />
              <span className="count">{selectedCount}</span>
            </Link>
          ) : (
            <div className="cart-link" aria-disabled="true">
              <img
                src="/rocket.svg"  
                className="cart"
                alt="К заявке"
              />
              <span className="count">{selectedCount}</span>
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
              src="/search.png"
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

      {loading ? (
        <div className="gases-loading text-center">Загрузка...</div>
      ) : (
        <div className="gases-cards-rocket d-flex flex-wrap justify-content-center mx-auto">
          {gases.map((gas) => (
            <article
              key={gas.id}
              className="gases-card-rocket d-flex flex-column align-items-center"
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
                  src={getAsset(gas.imageURL || '')}
                  alt={gas.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).src = getAsset(
                      'images/default-gas.png',
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
              </div>
            </article>
          ))}

          {gases.length === 0 && !loading && (
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
