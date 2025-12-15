import type { FC, ChangeEvent, KeyboardEvent } from 'react'
import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import {
  getImpulseCalculation,
  updateImpulseCalculation,
  deleteGasFromCalculation,
  updateGasInCalculation,
  deleteImpulseCalculation,
  clearCalculation,
  formImpulseCalculation,
  resolveImpulseCalculation,
} from '../store/slices/impulseCalculationSlice'
import { ROUTES } from '../Routes'
import './ImpulseCalculationPage.css'

const STATUS_DRAFT = 'DRAFT'
const STATUS_FORMED = 'FORMED'

const ImpulseCalculationPage: FC = () => {
  const { id } = useParams<{ id: string }>()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const { calculation, fields, temperature, isLoading, isUpdating, error } =
    useAppSelector((state) => state.impulseCalculation)
  const { isAuthenticated, isModerator } = useAppSelector((state) => state.user)

  // температура как строка
  const [tempValue, setTempValue] = useState<string>(
    temperature !== null && temperature !== undefined ? String(temperature) : '',
  )

  // редактируемая строка массы
  const [editingRow, setEditingRow] = useState<number | null>(null)
  const [editValues, setEditValues] = useState<{ mass?: string }>({})

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN)
      return
    }

    if (id) {
      dispatch(getImpulseCalculation(Number(id)))
    }

    return () => {
      dispatch(clearCalculation())
    }
  }, [id, isAuthenticated, dispatch, navigate])

  useEffect(() => {
    setTempValue(
      temperature !== null && temperature !== undefined
        ? String(temperature)
        : '',
    )
  }, [temperature])

  const handleTemperatureChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTempValue(e.target.value)
  }

  const saveTemperature = async () => {
    if (!id) return
    const raw = tempValue.trim()
    if (raw === '') return

    const numeric = Number(raw.replace(',', '.'))
    if (Number.isNaN(numeric)) return

    await dispatch(
      updateImpulseCalculation({
        id: Number(id),
        temperature: numeric,
      }),
    )

    await dispatch(getImpulseCalculation(Number(id)))
  }

  const handleTemperatureKeyDown = async (
    e: KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      await saveTemperature()
    }
  }

  const handleTemperatureBlur = async () => {
    await saveTemperature()
  }

  const handleDeleteGas = (gasId?: number) => {
    if (id && gasId) {
      dispatch(deleteGasFromCalculation({ id: Number(id), gasId }))
    }
  }

  const handleSaveRow = async (gasId: number) => {
    if (!id) return

    const raw = (editValues.mass ?? '').trim()
    if (raw === '') {
      setEditingRow(null)
      setEditValues({})
      return
    }

    const numeric = Number(raw.replace(',', '.'))
    if (Number.isNaN(numeric)) {
      return
    }

    await dispatch(
      updateGasInCalculation({
        id: Number(id),
        gasId,
        mass: numeric,
        impulse: undefined, // импульс считает сервер
      }),
    )

    await dispatch(getImpulseCalculation(Number(id)))

    setEditingRow(null)
    setEditValues({})
  }

  const handleDeleteCalculation = () => {
    if (!id) return
    dispatch(deleteImpulseCalculation(Number(id)))
    navigate(ROUTES.GASES)
  }

  const handleFormCalculation = async () => {
    if (!id) return
    await dispatch(formImpulseCalculation(Number(id)))
    await dispatch(getImpulseCalculation(Number(id)))
  }

  const handleResolveCalculationClick = async (
    action: 'COMPLETED' | 'REJECTED',
  ) => {
    if (!id) return
    await dispatch(
      resolveImpulseCalculation({
        id: Number(id),
        status: action,
      }),
    )
    await dispatch(getImpulseCalculation(Number(id)))
  }

  if (!isAuthenticated) return null

  if (isLoading) {
    return (
      <main className="container">
        <p style={{ textAlign: 'center' }}>Загрузка расчета...</p>
      </main>
    )
  }

  if (error) {
    return (
      <main className="container">
        <p style={{ textAlign: 'center', color: '#ff6b6b' }}>{error}</p>
      </main>
    )
  }

  if (!calculation) {
    return (
      <main className="container">
        <p style={{ textAlign: 'center' }}>Расчет не найден</p>
      </main>
    )
  }

  const totalMass = fields.reduce((sum, f) => sum + (f.mass || 0), 0)
  const totalImpulse = fields.reduce((sum, f) => sum + (f.impulse || 0), 0)

  const status = calculation.status
  const isDraft = status === STATUS_DRAFT
  const isFormed = status === STATUS_FORMED
  const userIsModerator = !!isModerator

  return (
    <main className="container">
      <h1 className="page-title">Составление заявки</h1>

      {/* Температура */}
      <label className="inline">
        <span>Температура топлива в реакторе:</span>
        <div className="input-rect temp-rect">
          <input
            className="chip-input-inner"
            type="number"
            placeholder="например, 2800"
            value={tempValue}
            onChange={handleTemperatureChange}
            onBlur={handleTemperatureBlur}
            onKeyDown={handleTemperatureKeyDown}
            disabled={!isDraft}
          />
          <span className="unit">K</span>
        </div>
      </label>

      {/* Метрики */}
      <div className="metrics">
        <div className="metric-box-m">
          <div className="metric-title">
            Масса двигателя с топливом: <strong>{totalMass.toFixed(2)} т</strong>
          </div>
        </div>
        <div className="metric-box-i">
          <div className="metric-title">
            Импульс ядерного ракетного двигателя:{' '}
            <strong>{totalImpulse.toFixed(3)} Н·с</strong>
          </div>
        </div>
      </div>

      {/* Список газов */}
      <section className="rows">
        {fields.map((field, idx) => {
          const isEditing = editingRow === idx

          return (
            <article className="row" key={`${field.gas_id}-${idx}`}>
              <div className="elem-card">
                <img
                  className="elem-img"
                  src={field.image_url || '/images/default-gas.png'}
                  alt={field.title}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = '/images/default-gas.png'
                    target.onerror = null
                  }}
                />
              </div>

              <div className="row-left">
                <div className="row-head">
                  <div className="row-title">
                    <div className="title">{field.title}</div>
                  </div>
                  <Link className="btn-mini" to={`/gases/${field.gas_id}`}>
                    Подробнее
                  </Link>
                </div>

                <div className="row_specs">
                  {/* Масса */}
                  <div className="field">
                    <div
                      className="input-rect"
                      onClick={() => {
                        if (!isDraft) return
                        if (!isEditing) {
                          setEditingRow(idx)
                          setEditValues({
                            mass:
                              field.mass !== null && field.mass !== undefined
                                ? String(field.mass)
                                : '',
                          })
                        }
                      }}
                    >
                      {isEditing ? (
                        <>
                          <input
                            type="number"
                            className="value"
                            value={editValues.mass ?? ''}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              setEditValues({
                                mass: e.target.value,
                              })
                            }
                            onKeyDown={(
                              e: KeyboardEvent<HTMLInputElement>,
                            ) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                handleSaveRow(field.gas_id)
                              }
                            }}
                          />
                          <span className="unit">т</span>
                        </>
                      ) : (
                        <>
                          <input
                            type="text"
                            className="value"
                            value={
                              field.mass !== undefined && field.mass !== null
                                ? String(field.mass)
                                : ''
                            }
                            readOnly
                          />
                          <span className="unit">т</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Импульс — только с сервера */}
                  <div className="field">
                    <div className="input-rect readonly">
                      <div className="value" aria-label="Импульс Н·с">
                        {field.impulse}
                      </div>
                      <span className="unit">Н·с</span>
                    </div>
                  </div>

                  {/* Удаление газа */}
                  {isDraft && (
                    <button
                      className="trash"
                      aria-label="Удалить"
                      onClick={() => handleDeleteGas(field.gas_id)}
                      disabled={isUpdating}
                      type="button"
                    >
                      <img src="/trash 1 (1).svg" alt="Удалить" />
                    </button>
                  )}
                </div>
              </div>
            </article>
          )
        })}

        {fields.length === 0 && (
          <p style={{ textAlign: 'center' }}>Нет газов в расчете</p>
        )}
      </section>

      {/* Кнопки управления заявкой */}
      <div
        className="actions"
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '24px',
          marginTop: '24px',
        }}
      >
        {isDraft && (
          <>
            <button
              type="button"
              className="btn-delete"
              disabled={isUpdating || fields.length === 0}
              onClick={handleFormCalculation}
            >
              Сформировать заявку
            </button>

            <button
              type="button"
              className="btn-delete"
              disabled={isUpdating}
              onClick={handleDeleteCalculation}
            >
              Удалить заявку
            </button>
          </>
        )}
      </div>

      {isFormed && userIsModerator && (
        <section className="actions" style={{ marginTop: '24px' }}>
          <div
            className="moder-actions"
            style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}
          >
            <button
              type="button"
              className="btn-reject"
              disabled={isUpdating}
              onClick={() => handleResolveCalculationClick('REJECTED')}
            >
              Отклонить
            </button>
            <button
              type="button"
              className="btn-approve"
              disabled={isUpdating}
              onClick={() => handleResolveCalculationClick('COMPLETED')}
            >
              Подтвердить
            </button>
          </div>
        </section>
      )}
    </main>
  )
}

export default ImpulseCalculationPage
