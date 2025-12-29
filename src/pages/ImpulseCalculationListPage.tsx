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
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', background: '#333', color: '#fff', padding: '12px 24px', borderRadius: '8px', zIndex: 9999, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '20px' }}>⏱</span>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '11px', opacity: 0.7 }}>RESPONSE TIME</span>
                <span style={{ fontWeight: 'bold', fontSize: '16px', color: timeMs > 100 ? '#ff8787' : '#69db7c' }}>
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
    
    // Инициализируем фильтры с сегодняшней датой
    const [filters, setFilters] = useState({ 
        status: isModerator ? 'all' : 'FORMED', // ← Обычный пользователь: только FORMED по умолчанию
        from: getTodayDate(),
        to: '' 
    })
    
    const [selectedUserId, setSelectedUserId] = useState<number | 'all'>('all');
    const [useIndex, setUseIndex] = useState(true);

    const loadData = () => {
        const params: Record<string, any> = { page, limit }
        
        // ← ФИЛЬТРАЦИЯ ПО СТАТУСАМ
        if (!isModerator && filters.status === 'all') {
            // Обычный пользователь: показываем только FORMED и COMPLETED
            params.status = 'FORMED,COMPLETED'
        } else if (filters.status !== 'all') {
            params.status = filters.status
        }
        
        if (filters.from) params.from = filters.from
        if (filters.to) params.to = filters.to
        if (isModerator && selectedUserId !== 'all') params.user_id = selectedUserId;
        params.use_index = useIndex;
        dispatch(fetchImpulseCalculationsList(params))
    }

    useEffect(() => {
        if (!userState.isAuthenticated) {
            navigate(ROUTES.LOGIN);
            return;
        }
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, filters, selectedUserId, useIndex, userState.isAuthenticated]);

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
        // @ts-ignore
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

            <section className="history-filters" style={{ alignItems: 'flex-end' }}>
                <div className="history-filter">
                    <label htmlFor="status">Статус</label>
                    <select id="status" name="status" value={filters.status} onChange={handleFilterChange}>
                        {isModerator ? (
                            <>
                                <option value="all">Все</option>
                                <option value="DRAFT">Черновик</option>
                                <option value="FORMED">Сформирована</option>
                                <option value="COMPLETED">Завершена</option>
                                <option value="REJECTED">Отклонена</option>
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
                    <label htmlFor="from">Дата (от)</label>
                    <input id="from" type="date" name="from" value={filters.from} onChange={handleFilterChange} />
                </div>
                <div className="history-filter">
                    <label htmlFor="to">Дата (до)</label>
                    <input id="to" type="date" name="to" value={filters.to} onChange={handleFilterChange} />
                </div>
                <div className="history-filter" style={{ paddingBottom: '10px' }}>
                    <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                        <input 
                            type="checkbox" 
                            checked={useIndex} 
                            onChange={(e) => setUseIndex(e.target.checked)}
                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                        Использовать Индекс
                    </label>
                </div>
            </section>

            <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
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

                <div style={{ flex: 1 }}>
                    {isLoading && !list.length && <p style={{ textAlign: 'center' }}>Загрузка...</p>}
                    {error && <p style={{ textAlign: 'center', color: '#ff6b6b' }}>{error}</p>}
                    {!isLoading && list.length === 0 && !error && <p style={{ textAlign: 'center' }}>Заявок не найдено</p>}

                    <section className="history-list" style={{ marginTop: 0 }}>
                        {list.map((item: DsImpulseCalculationDTO) => {
                            const isDraft = item.status === 'DRAFT';
                            // Кол-во газов (берем 0 для черновика или длину списка)
                            const gasCount = isDraft ? 0 : (item.fields?.length ?? 4); 

                            // Импульс
                            const totalImpulse = isDraft 
                                ? 0 
                                : (item.fields?.reduce((acc, curr) => acc + (curr.impulse || 0), 0) ?? 0);

                            return (
                                <article
                                    key={item.id}
                                    className="history-row"
                                    onClick={() => handleOpenCalculation(item.id)}
                                    style={{ borderLeft: isModerator && item.status === 'FORMED' ? '4px solid #ffc107' : undefined }}
                                >
                                    <div className="history-row-main">
                                        <div className="history-row-title">
                                            Заявка №{item.id} 
                                            {isModerator && <span style={{ fontSize: '14px', color: 'var(--muted)', marginLeft: '10px', fontWeight: 'normal' }}>from User #{item.user_id}</span>}
                                        </div>
                                        <div className={'history-status ' + (item.status ? `history-status--${item.status.toLowerCase()}` : '')}>{item.status}</div>
                                    </div>
                                    
                                    <div className="history-row-meta">
                                        <div><span className="history-label">Создана: </span><span>{item.date_created ? new Date(item.date_created).toLocaleString('ru-RU') : '--'}</span></div>
                                        
                                        {!isDraft && item.date_formed && (
                                            <div><span className="history-label">Сформирована: </span><span>{new Date(item.date_formed).toLocaleString('ru-RU')}</span></div>
                                        )}
                                    </div>

                                    <div className="history-row-metrics">
                                        <div><span className="history-label">Температура: </span><span>{item.temperature ?? '--'} K</span></div>
                                        <div style={{ marginLeft: '20px' }}>
                                            <span className="history-label">Газы: </span>
                                            <span>{gasCount}</span>
                                        </div>
                                        <div style={{ marginLeft: '20px' }}>
                                            <span className="history-label">Импульс: </span>
                                            <span style={{ fontWeight: 'bold' }}>
                                                {totalImpulse.toFixed(3)} Н·с
                                            </span>
                                        </div>
                                    </div>

                                    {isModerator && item.status === 'FORMED' && (
                                        <div style={{ marginTop: '15px', display: 'flex', gap: '10px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
                                            <button onClick={(e) => handleResolve(e, item.id || 0, 'COMPLETED')} style={{ flex: 1, padding: '8px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Завершить</button>
                                            <button onClick={(e) => handleResolve(e, item.id || 0, 'REJECTED')} style={{ flex: 1, padding: '8px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Отклонить</button>
                                        </div>
                                    )}
                                </article>
                            )
                        })}
                    </section>

                    {totalPages > 1 && (
                        <div className="pagination">
                            <button className="pagination-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>&larr; Назад</button>
                            <span className="pagination-info">Страница {page} из {totalPages}</span>
                            <button className="pagination-btn" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Вперед &rarr;</button>
                        </div>
                    )}
                </div>
            </div>
        </main>
    )
}

export default ImpulseCalculationListPage
