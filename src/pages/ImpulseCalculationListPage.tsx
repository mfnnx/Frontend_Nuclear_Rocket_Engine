import type { FC, ChangeEvent } from 'react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import type { RootState } from '../store'
import type { DsImpulseCalculationDTO } from '../api/Api'
import { ROUTES } from '../Routes'
import { fetchImpulseCalculationsList } from '../store/slices/impulseCalculationListSlice'
import './ImpulseCalculationListPage.css'

const ImpulseCalculationListPage: FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const { list, isLoading, error } = useAppSelector(
    (state: RootState) => state.impulseCalculationList,
  )
  const { isAuthenticated } = useAppSelector((state) => state.user)

  const [filters, setFilters] = useState({
    status: 'all',
    from: '',
    to: '',
  })

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN)
      return
    }

    const params: Record<string, string> = {}
    if (filters.status !== 'all') params.status = filters.status
    if (filters.from) params.from = filters.from
    if (filters.to) params.to = filters.to

    dispatch(fetchImpulseCalculationsList(params))
  }, [filters, isAuthenticated, dispatch, navigate])

  const handleFilterChange = (
    e: ChangeEvent<HTMLSelectElement | HTMLInputElement>,
  ) => {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const handleOpenCalculation = (id?: number) => {
    if (!id) return
    navigate(`/impulse_calculation/${id}`)
  }

  if (!isAuthenticated) return null

  // Бэк уже отдаёт только заявки текущего пользователя
  const myList: DsImpulseCalculationDTO[] = list

  return (
    <main className="container">
      <h1 className="page-title">Мои заявки</h1>

      {/* Фильтры */}
      <section className="history-filters">
        <div className="history-filter">
          <label htmlFor="status">Статус</label>
          <select
            id="status"
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
          >
            <option value="all">Все</option>
            <option value="DRAFT">Черновик</option>
            <option value="FORMED">Сформирована</option>
            <option value="COMPLETED">Завершена</option>
            <option value="REJECTED">Отклонена</option>
          </select>
        </div>

        <div className="history-filter">
          <label htmlFor="from">Дата создания (от)</label>
          <input
            id="from"
            type="date"
            name="from"
            value={filters.from}
            onChange={handleFilterChange}
          />
        </div>

        <div className="history-filter">
          <label htmlFor="to">Дата создания (до)</label>
          <input
            id="to"
            type="date"
            name="to"
            value={filters.to}
            onChange={handleFilterChange}
          />
        </div>
      </section>

      {isLoading && !myList.length && (
        <p style={{ textAlign: 'center' }}>Загрузка списка...</p>
      )}
      {error && (
        <p style={{ textAlign: 'center', color: '#ff6b6b' }}>{error}</p>
      )}

      {!isLoading && myList.length === 0 && !error && (
        <p style={{ textAlign: 'center' }}>Заявок не найдено</p>
      )}

      <section className="history-list">
        {myList.map((item: DsImpulseCalculationDTO) => (
          <article
            key={item.id}
            className="history-row"
            onClick={() => handleOpenCalculation(item.id)}
          >
            <div className="history-row-main">
              <div className="history-row-title">Заявка №{item.id}</div>
              <div
                className={
                  'history-status ' +
                  (item.status
                    ? `history-status--${item.status.toLowerCase()}`
                    : '')
                }
              >
                {item.status}
              </div>
            </div>

            <div className="history-row-meta">
              <div>
                <span className="history-label">Создана: </span>
                <span>
                  {item.date_created
                    ? new Date(item.date_created).toLocaleString('ru-RU')
                    : '--'}
                </span>
              </div>
              {item.date_formed && (
                <div>
                  <span className="history-label">Сформирована: </span>
                  <span>
                    {new Date(item.date_formed).toLocaleString('ru-RU')}
                  </span>
                </div>
              )}
              {item.date_accepted && (
                <div>
                  <span className="history-label">Завершена: </span>
                  <span>
                    {new Date(item.date_accepted).toLocaleString('ru-RU')}
                  </span>
                </div>
              )}
            </div>

            <div className="history-row-metrics">
              <div>
                <span className="history-label">Температура: </span>
                <span>{item.temperature ?? '--'} K</span>
              </div>
              <div>
                <span className="history-label">Импульс ядерного ракетного двигателя: </span>
                <span>
                  {item.total_impulse !== undefined && item.total_impulse !== null
                    ? item.total_impulse.toFixed(2)
                    : '0.00'}{' '}
                  Н·с
                </span>
              </div>
              <div>
                <span className="history-label">Газов: </span>
                <span>{item.gas_count ?? 0}</span>
              </div>
            </div>
          </article>
        ))}
      </section>
    </main>
  )
}

export default ImpulseCalculationListPage
