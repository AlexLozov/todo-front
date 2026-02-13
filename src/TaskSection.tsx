import { useState, useEffect, type FormEvent } from 'react';
import { taskApi } from './api/taskApi';
import type { TaskResponse, Pagination } from './types';
import styles from './TaskSection.module.css';

export const TaskSection = () => {
    const [tasks, setTasks] = useState<TaskResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [paginationInfo, setPaginationInfo] = useState<Pagination | null>(null);
    const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

    const [newTask, setNewTask] = useState({ title: '', description: '' });
    const [editingState, setEditingState] = useState<{ id: number | null, title: string, desc: string }>({
        id: null, title: '', desc: ''
    });

    const fetchTasks = async (page: number, currentFilter: string) => {
        try {
            setIsLoading(true);
            const res = currentFilter === 'all'
                ? await taskApi.getTasksPage(page, 5)
                : await taskApi.getTasksByStatus(currentFilter === 'completed', page, 5);
            if (res.success) {
                setTasks(res.payload.content);
                setPaginationInfo(res.payload.pagination);
            }
        } catch (err) { console.error(err); } finally { setIsLoading(false); }
    };

    useEffect(() => { fetchTasks(currentPage, filter); }, [currentPage, filter]);

    const handleCreateTask = async (e: FormEvent) => {
        e.preventDefault();
        if (!newTask.title.trim()) return;
        try {
            const res = await taskApi.createTask({ title: newTask.title, description: newTask.description });
            if (res.success) {
                setNewTask({ title: '', description: '' });
                setFilter('all');
                setCurrentPage(0);
                fetchTasks(0, 'all');
            }
        } catch (err) { console.error(err); }
    };

    const saveEdit = async (id: number, finished: boolean) => {
        try {
            const res = await taskApi.updateTask(id, { title: editingState.title, description: editingState.desc, finished });
            if (res.success) {
                setEditingState({ id: null, title: '', desc: '' });
                fetchTasks(currentPage, filter);
            }
        } catch (err) { console.error(err); }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Удалить задачу?')) return;
        try {
            await taskApi.deleteTask(id);
            fetchTasks(currentPage, filter);
        } catch (err) { console.error(err); }
    };

    return (
        <section className={styles.section}>
            <h2 className={styles.titleLine}>Задачи</h2>

            <form onSubmit={handleCreateTask} style={{ display: 'flex', gap: '12px', marginBottom: '25px' }}>
                <input className={styles.input} style={{ flex: 2 }} placeholder="Название задачи" value={newTask.title} onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))} />
                <input className={styles.input} style={{ flex: 3 }} placeholder="Описание..." value={newTask.description} onChange={e => setNewTask(p => ({ ...p, description: e.target.value }))} />
                <button type="submit" className={styles.buttonPrimary}>Добавить</button>
            </form>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                {(['all', 'active', 'completed'] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => { setFilter(f); setCurrentPage(0); }}
                        className={`${styles.filterButton} ${filter === f ? styles.filterButtonActive : ''}`}
                    >
                        {f === 'all' ? 'Все' : f === 'active' ? 'Активные' : 'Выполненные'}
                    </button>
                ))}
            </div>

            <div style={{ minHeight: '150px' }}>
                {isLoading ? <p style={{ color: '#999', textAlign: 'center' }}>Загрузка...</p> : tasks.map(task => (
                    <div key={task.id} className={styles.taskItem}>
                        {editingState.id === task.id ? (
                            <div className={styles.editContainer}>
                                <input className={styles.input} value={editingState.title} onChange={e => setEditingState(p => ({ ...p, title: e.target.value }))} />
                                <input className={styles.input} value={editingState.desc} onChange={e => setEditingState(p => ({ ...p, desc: e.target.value }))} />
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button onClick={() => saveEdit(task.id, task.isFinished)} className={styles.buttonPrimary}>Сохранить</button>
                                    <button onClick={() => setEditingState({ id: null, title: '', desc: '' })} className={styles.buttonSecondary}>Отмена</button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <input type="checkbox" checked={task.isFinished} style={{ cursor: 'pointer', width: '18px', height: '18px' }} onChange={() => {
                                        taskApi.updateTask(task.id, { title: task.title, finished: !task.isFinished }).then(() => fetchTasks(currentPage, filter));
                                    }} />
                                    <div>
                                        <div style={{ fontWeight: '600', textDecoration: task.isFinished ? 'line-through' : 'none', color: task.isFinished ? '#adb5bd' : '#212529' }}>{task.title}</div>
                                        <div style={{ fontSize: '12px', color: '#6c757d' }}>{task.description}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button onClick={() => setEditingState({ id: task.id, title: task.title, desc: task.description || '' })} className={styles.buttonSecondary}>Изменить</button>
                                    <button onClick={() => handleDelete(task.id)} className={styles.buttonSecondary} style={{ color: '#dc3545' }}>Удалить</button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>

            {paginationInfo && paginationInfo.pages > 1 && (
                <div className={styles.pagination}>
                    <button disabled={currentPage === 0} onClick={() => setCurrentPage(p => p - 1)} className={styles.buttonSecondary}>←</button>
                    <span style={{ fontSize: '14px', alignSelf: 'center', fontWeight: 500 }}>{currentPage + 1} / {paginationInfo.pages}</span>
                    <button disabled={currentPage >= paginationInfo.pages - 1} onClick={() => setCurrentPage(p => p + 1)} className={styles.buttonSecondary}>→</button>
                </div>
            )}
        </section>
    );
};