import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { getGasesList, deleteGas, createGas, updateGas, uploadGasImage } from '../store/slices/gasesSlice';
import type { DsGasDTO } from '../api/Api';
import { getAsset } from '../utils/path';
import './AdminGasesPage.css';

const AdminPage = () => {
    
    const dispatch = useAppDispatch();
    const { gases: list, isLoading } = useAppSelector((state) => state.gases);

    const [view, setView] = useState<'list' | 'form'>('list');
    const [editingId, setEditingId] = useState<number | null>(null);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [molarMass, setMolarMass] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);

    useEffect(() => {
        dispatch(getGasesList());
    }, [dispatch]);

    const handleCreate = () => {
        setEditingId(null);
        setTitle('');
        setDescription('');
        setMolarMass('');
        setImageUrl('');
        setImageFile(null);
        setView('form');
    };

    const handleEdit = (gas: DsGasDTO) => {
        setEditingId(gas.id || null);
        setTitle(gas.title || '');
        setDescription(gas.description || '');
        // @ts-ignore
        setMolarMass(gas.molar_mass ? String(gas.molar_mass) : '');
        setImageUrl(gas.image_url || '');
        setImageFile(null);
        setView('form');
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setImageFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            title,
            description,
            // @ts-ignore
            molar_mass: molarMass ? parseFloat(molarMass) : 0,
            image_url: imageUrl
        };

        try {
            let targetId = editingId;

            if (editingId) {
                // @ts-ignore
                await dispatch(updateGas({ id: editingId, data: payload }));
            } else {
                // @ts-ignore
                const resultAction = await dispatch(createGas(payload));
                if (createGas.fulfilled.match(resultAction)) {
                    const createdGas = resultAction.payload as unknown as DsGasDTO;
                    if (createdGas && createdGas.id) {
                        targetId = createdGas.id;
                    }
                }
            }

            if (targetId && imageFile) {
                await dispatch(uploadGasImage({ id: targetId, file: imageFile }));
            }

            dispatch(getGasesList());
            setView('list');

        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id: number) => {
        await dispatch(deleteGas(id));
        dispatch(getGasesList());
    };

    // === ФОРМА ===
    if (view === 'form') {
        return (
            <div className="adm-container">
                <div className="adm-page-head">
                    <div className="adm-spacer"></div>
                    <h2 className="adm-page-title">{editingId ? 'Редактирование' : 'Добавление газа'}</h2>
                    <div className="adm-spacer"></div>
                </div>

                <div className="adm-edit-container">
                    <form onSubmit={handleSubmit}>
                        <div className="adm-edit-group">
                            <label className="adm-edit-label">Название</label>
                            <input className="adm-edit-input" type="text" required value={title} onChange={e => setTitle(e.target.value)} />
                        </div>

                        <div className="adm-edit-group">
                            <label className="adm-edit-label">Молярная масса (г/моль)</label>
                            <input className="adm-edit-input" type="number" step="0.01" value={molarMass} onChange={e => setMolarMass(e.target.value)} />
                        </div>

                        <div className="adm-edit-group">
                            <label className="adm-edit-label">Изображение</label>
                            <label className="adm-file-select">
                                {imageFile ? `Файл: ${imageFile.name}` : (imageUrl ? 'Изменить фото' : 'Загрузить фото')}
                                <input type="file" className="adm-file-hidden" accept="image/*" onChange={handleFileChange} />
                            </label>
                        </div>

                        <div className="adm-edit-group">
                            <label className="adm-edit-label">Описание</label>
                            <textarea className="adm-edit-textarea" rows={5} value={description} onChange={e => setDescription(e.target.value)} />
                        </div>

                        <div className="adm-edit-actions">
                            <button type="button" className="adm-btn">Отмена</button>
                            <button type="submit" className="adm-btn adm-btn-ghost">Сохранить</button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    // === СПИСОК ===
    return (
        <div className="adm-container">
            {isLoading ? (
                <div className="adm-loading">Загрузка...</div>
            ) : (
                <>
                    <div className="adm-list">
                        {list.map(gas => {
                            
                            return (
                                <div key={gas.id} className="adm-row">
                                    <div className="adm-row-img-wrap">
                                        <img 
                                            src={
                                                gas.image_url
                                                    ? gas.image_url.replace(
                                                        'http://localhost:9000',
                                                        '/minio',
                                                    )
                                                    : getAsset('defaultgas.png')
                                            }
                                            alt="" 
                                            className="adm-row-img"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = '/defaultgas.png';
                                            }}
                                        />
                                    </div>
                                    <div className="adm-row-content">
                                        <div className="adm-row-title">
                                            {gas.title}
                                            {/* @ts-ignore */}
                                            {gas.molar_mass && <span className="adm-row-mass">{gas.molar_mass} г/моль</span>}
                                        </div>
                                        <div className="adm-row-desc">{gas.description}</div>
                                    </div>
                                    
                                    <div className="adm-row-actions">
                                        <button className="adm-btn adm-btn-ghost adm-btn-small" onClick={() => handleEdit(gas)}>
                                            Редактировать
                                        </button>
                                        <button className="adm-btn adm-btn-delete adm-btn-small" onClick={() => handleDelete(gas.id || 0)}>
                                            Удалить
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="adm-page-head adm-page-head-centered">
                        <button className="adm-btn adm-btn-ghost adm-btn-wide" onClick={handleCreate}>
                            Добавить
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default AdminPage;
