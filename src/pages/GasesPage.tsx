import type { FC } from 'react'
import type { Gas, GasFilters } from '../types'
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { gasesApi } from '../modules/api'
import './GasesPage.css'

const GasesPage: FC = () => {
  const [gases, setGases] = useState<Gas[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  
  useEffect(() => {
    const loadGases = async () => {
      setLoading(true)
      try {
        const filters: GasFilters = {}
        if (searchQuery) {
          filters.search = searchQuery
        }
        
        const data = await gasesApi.getGases(filters)
        setGases(data)
      } catch (error) {
        console.error('Error loading gases:', error)
      } finally {
        setLoading(false)
      }
    }

    const timeoutId = setTimeout(loadGases, 300)
    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
  }

  return (
    <main className="container gases-page">
      
      
      <div className="gases-page-head">
        <h1 className="gases-page-title">Рабочее тело</h1>
      </div>

      <div className="gases-search d-flex justify-content-center">
        <form className="gases-search-form position-relative" onSubmit={handleSearchSubmit}>
          <input 
            type="search" 
            className="gases-search-field form-control" 
            placeholder="Поиск…" 
            name="searchGases" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '300px',
              padding: '12px 16px 12px 20px',
              borderRadius: '999px',
              border: '2px solid #D2F95F',
              background: 'transparent',
              color: '#D2F95F',
              fontSize: '15px'
            }}
          />
          <img 
            src="http://localhost:9000/img/search.png" 
            className="gases-search-icon position-absolute" 
            alt="Поиск"
            style={{
              right: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '20px',
              height: '20px',
              pointerEvents: 'none'
            }}
          />
        </form>
      </div>


      {loading ? (
        <div className="gases-loading text-center">Загрузка...</div>
      ) : (
        <div className="gases-cards-rocket d-flex flex-wrap justify-content-center mx-auto">
          {gases.map(gas => (
            <article key={gas.id} className="gases-card-rocket d-flex flex-column align-items-center">
              <div 
                className="gases-thumb-wrap"
                style={{
                  width: '202px',
                  height: '166px',
                  background: 'transparent',
                  overflow: 'hidden',
                  flexShrink: 0
                }}
              >
                <img 
                  className="gases-thumb" 
                  src={gas.imageURL} 
                  alt={gas.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block'
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/default-gas.png'
                  }}
                />
              </div>
              <div className="gases-card-info text-center flex-grow-1 d-flex flex-column justify-content-center">
                <div className="gases-card-title">{gas.title}</div>
              </div>
              <div className="gases-actions w-100 mt-auto">
                <Link className="gases-btn gases-btn-ghost w-100" to={`/gases/${gas.id}`}>
                  К описанию
                </Link>
                <button className="gases-btn gases-btn-ghost w-100">
                  Выбрать
                </button>
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
