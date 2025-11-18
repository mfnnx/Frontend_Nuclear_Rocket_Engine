import type { FC } from 'react'
import type { Gas } from '../types'
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { gasesApi } from '../modules/api'
import BreadCrumbs from '../components/BreadCrumbs'
import { ROUTES, ROUTE_LABELS } from '../Routes'
import './GasDetailPage.css'

const GasDetailPage: FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [gas, setGas] = useState<Gas | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id || isNaN(Number(id))) {
      navigate(ROUTES.GASES)
      return
    }

    let isMounted = true

    const loadGas = async () => {
      try {
        const gasData = await gasesApi.getGasById(Number(id))
        if (isMounted) {
          setGas(gasData)
        }
      } catch (error) {
        console.error('Error loading gas:', error)
        if (isMounted) {
          navigate(ROUTES.GASES)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadGas()

    return () => {
      isMounted = false
    }
  }, [id, navigate])

  if (loading) {
    return (
      <main className="container gas">
        <div className="loading">Загрузка...</div>
      </main>
    )
  }

  if (!gas) {
    return null
  }

  return (
    <main className="container gas">
      <BreadCrumbs
        crumbs={[
          { label: ROUTE_LABELS.GASES, path: ROUTES.GASES },
          { label: gas.title }
        ]}
      />
      
      <section className="panel">
        <div className="cards-rocket">
          <article className="card-rocket">
            <div className="thumb-wrap">
              <img 
                className="thumb" 
                src={gas.imageURL} 
                alt={gas.title}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/default-gas.png'
                }}
              />
            </div>
            <div className="card-info">
              <div className="card-title">{gas.title}</div>
            </div>
          </article>
        </div>

        <article className="copy">
          {gas.description}
        </article>
      </section>
    </main>
  )
}

export default GasDetailPage
