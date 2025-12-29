import type { FC, ChangeEvent, KeyboardEvent } from 'react'
import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { ROUTES } from '../Routes'
import './ImpulseCalculationPage.css'
import { api } from '../api'

interface GasField {
  gas_id: number
  title: string
  description: string
  image_url: string | null
  mass: number
  impulse: number
}

const STATUS_DRAFT = 'DRAFT'
const STATUS_FORMED = 'FORMED'

const ImpulseCalculationPage: FC = () => {
  const { id } = useParams<{ id: string }>()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const { calculation, fields, temperature, isLoading, isUpdating, error } =
    useAppSelector((state: any) => state.impulseCalculation)
  const { isAuthenticated, isModerator } = useAppSelector((state: any) => state.user)

  const [tempValue, setTempValue] = useState<string>('')
  const [editingRow, setEditingRow] = useState<number | null>(null)
  const [editValues, setEditValues] = useState<{ mass?: string }>({})

  useEffect(() => {
    if (!isAuthenticated || !id) {
      navigate(ROUTES.LOGIN)
      return
    }
    loadCalculation()
  }, [id, isAuthenticated])

  const loadCalculation = async () => {
    if (!id) return
    dispatch({ type: 'impulseCalculation/setLoading', payload: true })
    dispatch({ type: 'impulseCalculation/setError', payload: null })
    
    try {
      const response = await api.impulseCalculations.impulseCalculationsDetail(Number(id))
      dispatch({ type: 'impulseCalculation/setCalculation', payload: response.data })
    } catch (err: any) {
      dispatch({ type: 'impulseCalculation/setError', payload: err.response?.data?.detail || 'Расчет не найден' })
    } finally {
      dispatch({ type: 'impulseCalculation/setLoading', payload: false })
    }
  }

  useEffect(() => {
    setTempValue(temperature ? String(temperature) : '')
  }, [temperature])

  const handleTemperatureChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTempValue(e.target.value)
  }

  const saveTemperature = async () => {
    if (!id || !tempValue.trim()) return
    const numeric = Number(tempValue.replace(',', '.'))
    if (Number.isNaN(numeric)) return

    dispatch({ type: 'impulseCalculation/setUpdating', payload: true })
    try {
      await api.impulseCalculations.impulseCalculationsUpdate(Number(id), { temperature: numeric })
      await loadCalculation()
    } catch (err: any) {
      dispatch({ type: 'impulseCalculation/setError', payload: 'Ошибка сохранения температуры' })
    }
  }

  const handleSaveRow = async (gasId: number) => {
    if (!id) return
    const fieldIndex = fields.findIndex((f: GasField) => f.gas_id === gasId)
    if (fieldIndex === -1) return

    let massToSave: number
    const isEditingThisRow = editingRow === fieldIndex

    if (isEditingThisRow && editValues.mass) {
      const raw = editValues.mass.trim()
      if (!raw) return
      massToSave = Number(raw.replace(',', '.'))
      if (Number.isNaN(massToSave)) return
    } else {
      massToSave = fields[fieldIndex].mass || 0
    }

    dispatch({ type: 'impulseCalculation/setUpdating', payload: true })
    try {
      await api.impulseCalculations.gasesUpdate(Number(id), gasId, { mass: massToSave })
      await loadCalculation()
    } finally {
      setEditingRow(null)
      setEditValues({})
      dispatch({ type: 'impulseCalculation/setUpdating', payload: false })
    }
  }

  const handleDeleteGas = async (gasId: number) => {
    if (!id) return
    dispatch({ type: 'impulseCalculation/setUpdating', payload: true })
    try {
      await api.impulseCalculations.gasesDelete(Number(id), gasId)
      await loadCalculation()
    } catch (err: any) {
      dispatch({ type: 'impulseCalculation/setError', payload: 'Ошибка удаления газа' })
    }
  }

  const handleDeleteCalculation = async () => {
    if (!id) return
    dispatch({ type: 'impulseCalculation/setUpdating', payload: true })
    try {
      await api.impulseCalculations.impulseCalculationsDelete(Number(id))
      navigate(ROUTES.GASES)
    } finally {
      dispatch({ type: 'impulseCalculation/setUpdating', payload: false })
    }
  }

  const handleFormCalculation = async () => {
    if (!id) return
    dispatch({ type: 'impulseCalculation/setUpdating', payload: true })
    try {
      await api.impulseCalculations.formUpdate(Number(id))
      await loadCalculation()
    } catch (err: any) {
      dispatch({ type: 'impulseCalculation/setError', payload: 'Ошибка формирования' })
    }
  }

  const handleResolveCalculationClick = async (action: 'COMPLETED' | 'REJECTED') => {
    if (!id) return
    dispatch({ type: 'impulseCalculation/setUpdating', payload: true })
    try {
      await api.impulseCalculations.resolveUpdate(Number(id), { status: action })
      await loadCalculation()
    } catch (err: any) {
      dispatch({ type: 'impulseCalculation/setError', payload: 'Ошибка обработки' })
    }
  }

  if (!isAuthenticated || isLoading) {
    return (
      <main className="container">
        <p style={{ textAlign: 'center' }}>
          {isLoading ? 'Загрузка...' : 'Не авторизован'}
        </p>
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

  const totalMass = fields.reduce((sum: number, f: GasField) => sum + f.mass, 0)
  const totalImpulse = fields.reduce((sum: number, f: GasField) => sum + f.impulse, 0)

  const status = calculation.status
  const isDraft = status === STATUS_DRAFT
  const isFormed = status === STATUS_FORMED
  const userIsModerator = !!isModerator

  return (
    <main className="container">
      <h1 className="page-title">Составление заявки</h1>

      <div style={{ 
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: '20px', marginBottom: '10px', width: '100%'
      }}>
        <label className="inline" style={{ marginBottom: 0 }}>
          <span>Температура топлива в реакторе:</span>
          <div className="input-rect temp-rect">
            <input
              className="chip-input-inner"
              type="number"
              placeholder="например, 2800"
              value={tempValue}
              onChange={handleTemperatureChange}
              onBlur={saveTemperature}
              onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => 
                e.key === 'Enter' && saveTemperature()}
              disabled={!isDraft || isUpdating}
            />
            <span className="unit">K</span>
          </div>
        </label>
        {isDraft && (
          <button
            className="btn-mini"
            onClick={saveTemperature}
            disabled={isUpdating}
            style={{ cursor: isUpdating ? 'wait' : 'pointer', opacity: isUpdating ? 0.7 : 1 }}
          >
            Сохранить
          </button>
        )}
      </div>

      <div className="metrics">
        <div className="metric-box-m">
          <div className="metric-title">
            Масса двигателя с топливом: <strong>{totalMass.toFixed(2)} т</strong>
          </div>
        </div>
        <div className="metric-box-i">
          <div className="metric-title">
            Импульс ядерного ракетного двигателя: <strong>{totalImpulse.toFixed(3)} Н·с</strong>
          </div>
        </div>
      </div>

      <section className="rows">
        {fields.map((field: GasField, idx: number) => (
          <article className="row" key={`${field.gas_id}-${idx}`}>
            <div className="elem-card">
              <img
                className="elem-img"
                src={field.image_url || '/defaultgas.png'}
                alt={field.title}
                onError={(e: any) => { e.target.src = '/defaultgas.png' }}
              />
            </div>
            <div className="row-left">
              <div className="row-head">
                <div className="row-title"><div className="title">{field.title}</div></div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <Link className="btn-mini" to={`/gases/${field.gas_id}`}>Подробнее</Link>
                  {isDraft && (
                    <button 
                      className="btn-mini"
                      onClick={() => handleSaveRow(field.gas_id)}
                      disabled={isUpdating}
                    >
                      Сохранить
                    </button>
                  )}
                </div>
              </div>
              <div className="row_specs">
                <div className="field">
                  <div className="input-rect" onClick={() => {
                    if (!isDraft || editingRow === idx || isUpdating) return
                    setEditingRow(idx)
                    setEditValues({ mass: String(field.mass) })
                  }}>
                    {editingRow === idx ? (
                      <>
                        <input
                          type="number"
                          className="value"
                          value={editValues.mass ?? ''}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => 
                            setEditValues({ mass: e.target.value })}
                          onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => 
                            e.key === 'Enter' && handleSaveRow(field.gas_id)}
                        />
                        <span className="unit">т</span>
                      </>
                    ) : (
                      <>
                        <input type="text" className="value" value={field.mass} readOnly />
                        <span className="unit">т</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="field">
                  <div className="input-rect readonly">
                    <div className="value">{field.impulse}</div>
                    <span className="unit">Н·с</span>
                  </div>
                </div>
                {isDraft && (
                  <button
                    className="trash"
                    onClick={() => handleDeleteGas(field.gas_id)}
                    disabled={isUpdating}
                  >
                    <img src="/trash 1 (1).svg" alt="Удалить" />
                  </button>
                )}
              </div>
            </div>
          </article>
        ))}
        {fields.length === 0 && <p style={{ textAlign: 'center' }}>Нет газов в расчете</p>}
      </section>

      <div className="actions" style={{ display: 'flex', justifyContent: 'center', gap: '24px', margin: '24px 0' }}>
        {isDraft && (
          <>
            <button
              className="btn-delete"
              disabled={isUpdating || !fields.length}
              onClick={handleFormCalculation}
            >
              Сформировать заявку
            </button>
            <button className="btn-delete" disabled={isUpdating} onClick={handleDeleteCalculation}>
              Удалить заявку
            </button>
          </>
        )}
      </div>

      {isFormed && userIsModerator && (
        <section className="actions actions--moder">
          <div className="moder-actions">
            <button className="btn-reject" disabled={isUpdating} 
                    onClick={() => handleResolveCalculationClick('REJECTED')}>
              Отклонить
            </button>
            <button className="btn-approve" disabled={isUpdating} 
                    onClick={() => handleResolveCalculationClick('COMPLETED')}>
              Подтвердить
            </button>
          </div>
        </section>
      )}
    </main>
  )
}

export default ImpulseCalculationPage
