import type { FC } from 'react'
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import './GasDetailPage.css'
import BreadCrumbs from '../components/BreadCrumbs'
import { ROUTES } from '../Routes'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { getGasesList } from '../store/slices/gasesSlice'
import type { DsGasDTO } from '../api/Api'

const GasDetailPage: FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const { gases, isLoading } = useAppSelector((state) => state.gases)
  const [gas, setGas] = useState<DsGasDTO | null>(null)

  useEffect(() => {
    if (!id || isNaN(Number(id))) {
      navigate(ROUTES.GASES)
      return
    }

    // если газы ещё не загружены – подгружаем
    if (!gases.length) {
      dispatch(getGasesList())
    }
  }, [id, gases.length, dispatch, navigate])

  useEffect(() => {
    if (id && gases.length) {
      const found = gases.find((g) => g.id === Number(id)) || null
      if (!found) {
        navigate(ROUTES.GASES)
      } else {
        setGas(found)
      }
    }
  }, [id, gases, navigate])

  if (isLoading || (!gas && !gases.length)) {
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
          { label: 'Рабочие газы', path: ROUTES.GASES },
          { label: gas.title || 'Газ' }, // последний без path – текущая страница
        ]}
      />


      <section className="panel">
        <div className="cards-rocket">
          <article className="card-rocket">
            <div className="thumb-wrap">
              <img
                className="thumb"
                src={
                  gas.image_url
                    ? gas.image_url.replace('http://localhost:9000', '/minio')
                    : 'defaultgas.png'
                }
                alt={gas.title}
                onError={(e) => {
                  ;(e.target as HTMLImageElement).src = '/defaultgas.png'
                }}
              />
            </div>
            <div className="card-info">
              <div className="card-title">{gas.title}</div>
            </div>
          </article>
        </div>

        <article className="copy">{gas.description}</article>
      </section>
    </main>
  )
}

export default GasDetailPage
