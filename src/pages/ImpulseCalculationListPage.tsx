import type { FC, ChangeEvent } from 'react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import type { RootState } from '../store'
import type { DsImpulseCalculationDTO } from '../api/Api'
import { ROUTES } from '../Routes'
import { fetchImpulseCalculationsList, resolveCalculation } from '../store/slices/impulseCalculationListSlice'
import './ImpulseCalculationListPage.css'

// Вспомогательная функция для получения сегодняшней даты YYYY-MM-DD
const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const TimeToast = ({ timeMs }: { timeMs: number | null }) => {
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        if (timeMs !== null && timeMs !== undefined) {
            setVisible(true);
            const timer = setTimeout(() => setVisible(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [timeMs]);

    if (!visible || timeMs === null) return null;

    return (
        <div className="time-toast">
            <span className="time-toast-icon">⏱</span>
            <div className="time-toast-content">
                <span className="time-toast-label">RESPONSE TIME</span>
                <span className={`time-toast-value ${timeMs > 100 ? 'slow' : 'fast'}`}>
                    {timeMs.toFixed(2)} ms
                </span>
            </div>
        </div>
    );
};

const ImpulseCalculationListPage: FC = () => {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()

    const { list, isLoading, error, timeMs, total, user_stats } = useAppSelector(
        (state: RootState) => state.impulseCalculationList,
    )
    const userState = useAppSelector((state) => state.user)
    const isModerator = userState.isModerator;

    const [page, setPage] = useState(1)
    const limit = 7 
    
    const [filters, setFilters] = useState({ 
        status: isModerator ? 'all' : 'FORMED', 
        from: getTodayDate(),
        to: '' 
    })
    
    const [selectedUserId, setSelectedUserId] = useState<number | 'all'>('all');

    const loadData = () => {
        const params: Record<string, any> = { page, limit }
        
        // ✅ НИКОГДА НЕ ПОКАЗЫВАЕМ DRAFT!
        if (!isModerator && filters.status === 'all') {
            params.status = 'FORMED,COMPLETED'  // обычные пользователи
        } else if (isModerator && filters.status === 'all') {
            params.status = 'FORMED,COMPLETED,REJECTED'  // модераторы БЕЗ DRAFT
        } else if (filters.status !== 'all') {
            // ✅ Исключаем DRAFT даже для конкретных статусов
            if (filters.status === 'FORMED' || filters.status === 'COMPLETED' || filters.status === 'REJECTED') {
                params.status = filters.status
            }
        }
        
        if (filters.from) params.from = filters.from
        if (filters.to) params.to = filters.to
        if (isModerator && selectedUserId !== 'all') params.user_id = selectedUserId;
        
        dispatch(fetchImpulseCalculationsList(params))
    }

    useEffect(() => {
        if (!userState.isAuthenticated) {
            navigate(ROUTES.LOGIN);
            return;
        }
        loadData();
    }, [page, filters, selectedUserId, userState.isAuthenticated]);

    useEffect(() => {
        if (!isModerator) return; 
        const id = setTimeout(loadData, 5000); 
        return () => clearTimeout(id);
    }); 

    const handleFilterChange = (e: ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        setPage(1)
        setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleOpenCalculation = (id?: number) => {
        if (!id) return
        navigate(`/impulse_calculation/${id}`)
    }

    const handleResolve = (e: React.MouseEvent, id: number, status: string) => {
        e.stopPropagation();
        dispatch(resolveCalculation({ id, status })).then(() => {
            loadData();
        });
    }

    const sidebarUsers = (user_stats && user_stats.length > 0) ? user_stats : [];
    const totalPages = Math.ceil(total / limit)
    const totalApps = user_stats?.reduce((acc, curr) => acc + curr.count, 0) || total;

    if (!userState.isAuthenticated) return null

    return (
        <main className="container">
            <TimeToast timeMs={timeMs} />

            <section className="history-filters">
                <div className="history-filter">
                    <label htmlFor="status">Статус</label>
                    <select id="status" name="status" value={filters.status} onChange={handleFilterChange}>
                        {isModerator ? (
                            <>
                                <option value="all">Все заявки</option>  {/* ✅ только FORMED+COMPLETED+REJECTED */}
                                <option value="FORMED">Сформирована</option>
                                <option value="COMPLETED">Завершена</option>
                                <option value="REJECTED">Отклонена</option>
                                {/* ✅ DRAFT УБРАН */}
                            </>
                        ) : (
                            <>
                                <option value="FORMED">Сформирована</option>
                                <option value="COMPLETED">Завершена</option>
                            </>
                        )}
                    </select>
                </div>
                <div className="history-filter">
                    <label htmlFor="from">Дата формирования (от)</label>
                    <input id="from" type="date" name="from" value={filters.from} onChange={handleFilterChange} />
                </div>
                <div className="history-filter">
                    <label htmlFor="to">Дата формирования (до)</label>
                    <input id="to" type="date" name="to" value={filters.to} onChange={handleFilterChange} />
                </div>
            </section>

            <div className="main-content">
                {isModerator && (
                    <aside className="moderator-sidebar">
                        <h4 className="sidebar-title">👤 Пользователи</h4>
                        <div 
                            className={`sidebar-item ${selectedUserId === 'all' ? 'active' : ''}`}
                            onClick={() => { setSelectedUserId('all'); setPage(1); }} 
                        >
                            <span>Все пользователи</span>
                            <span className="sidebar-badge">{totalApps}</span>
                        </div>
                        <div className="sidebar-divider"></div>
                        {sidebarUsers.map((u) => (
                            <div 
                                key={u.user_id} 
                                className={`sidebar-item ${selectedUserId === u.user_id ? 'active' : ''}`}
                                onClick={() => { setSelectedUserId(u.user_id); setPage(1); }} 
                            >
                                <span>User #{u.user_id}</span>
                                <span className="sidebar-badge">{u.count}</span>
                            </div>
                        ))}
                    </aside>
                )}

                <div className="content-main">
                    {isLoading && !list.length && <p className="loading-text">Загрузка...</p>}
                    {error && <p className="error-text">{error}</p>}
                    {!isLoading && list.length === 0 && !error && <p className="empty-text">Заявок не найдено</p>}

                    <section className="history-list">
                        {list.map((item: DsImpulseCalculationDTO) => {
                            const gasCount = item.fields?.length ?? 4; 
                            const totalImpulse = item.fields?.reduce((acc, curr) => acc + (curr.impulse || 0), 0) ?? 0;

                            const isCompleted = item.status === 'COMPLETED';
                            const isRejected = item.status === 'REJECTED';
                            const showSecondDate = (isCompleted || isRejected) && item.date_accepted;

                            return (
                                <article
                                    key={item.id}
                                    className={`history-row ${isModerator && item.status === 'FORMED' ? 'moderator-formed' : ''}`}
                                    onClick={() => handleOpenCalculation(item.id)}
                                >
                                    <div className="history-row-main">
                                        <div className="history-row-title">
                                            Заявка №{item.id} 
                                            {isModerator && <span className="user-info">from User #{item.user_id}</span>}
                                        </div>
                                        <div className={`history-status history-status--${item.status?.toLowerCase() || ''}`}>{item.status}</div>
                                    </div>
                                    
                                    <div className="history-row-meta">
                                        <div>
                                            <span className="history-label">Сформирована: </span>
                                            <span>{item.date_formed ? new Date(item.date_formed).toLocaleString('ru-RU') : '--'}</span>
                                        </div>
                                        {showSecondDate && (
                                            <div className="history-date-second">
                                                <span className="history-label">
                                                    {isCompleted ? 'Завершена: ' : 'Отклонена: '}
                                                </span>
                                                <span>{new Date(item.date_accepted!).toLocaleString('ru-RU')}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="history-row-metrics">
                                        <div><span className="history-label">Температура: </span><span>{item.temperature ?? '--'} K</span></div>
                                        <div className="metrics-gas">
                                            <span className="history-label">Газы: </span>
                                            <span>{gasCount}</span>
                                        </div>
                                        
                                        {isCompleted && (
                                            <div className="metrics-impulse">
                                                <span className="history-label">Импульс: </span>
                                                <span className="impulse-value">
                                                    {totalImpulse.toFixed(3)} Н·с
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {isModerator && item.status === 'FORMED' && (
                                        <div className="moderator-actions">
                                            <button 
                                                className="btn-approve" 
                                                onClick={(e) => handleResolve(e, item.id || 0, 'COMPLETED')}
                                            >
                                                Завершить
                                            </button>
                                            <button 
                                                className="btn-reject" 
                                                onClick={(e) => handleResolve(e, item.id || 0, 'REJECTED')}
                                            >
                                                Отклонить
                                            </button>
                                        </div>
                                    )}
                                </article>
                            )
                        })}
                    </section>

                    {totalPages > 1 && (
                        <div className="pagination">
                            <button className="pagination-btn prev" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>&larr; Назад</button>
                            <span className="pagination-info">Страница {page} из {totalPages}</span>
                            <button className="pagination-btn next" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Вперед &rarr;</button>
                        </div>
                    )}
                </div>
            </div>
        </main>
    )
}

export default ImpulseCalculationListPage
