import { useTasks } from './hooks/useTasks';
import styles from './TaskSection.module.css';

export const TaskSection = () => {
    const {
        tasks, isLoading, currentPage, paginationInfo, filter, newTask, editingState,
        setFilter, setCurrentPage, setNewTask, setEditingState,
        createTask, toggleTaskStatus, saveEdit, deleteTask
    } = useTasks();

    return (
        <section className={styles.section}>
            <h2 className={styles.titleLine}>Задачи</h2>

            <form onSubmit={createTask} style={{ display: 'flex', gap: '12px', marginBottom: '25px' }}>
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
                    <div key={task.id} className={`${styles.taskItem} animate-fade-in`}>
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
                                    <input type="checkbox" checked={task.isFinished} style={{ cursor: 'pointer', width: '18px', height: '18px' }} onChange={() => toggleTaskStatus(task)} />
                                    <div>
                                        <div style={{ fontWeight: '600', textDecoration: task.isFinished ? 'line-through' : 'none', color: task.isFinished ? '#adb5bd' : '#212529' }}>{task.title}</div>
                                        <div style={{ fontSize: '12px', color: '#6c757d' }}>{task.description}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button onClick={() => setEditingState({ id: task.id, title: task.title, desc: task.description || '' })} className={styles.buttonSecondary}>Изменить</button>
                                    <button onClick={() => deleteTask(task.id)} className={styles.buttonSecondary} style={{ color: '#dc3545' }}>Удалить</button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>

            {paginationInfo && paginationInfo.pages > 1 && (
                <div className={styles.pagination}>
                    <button disabled={currentPage === 0} onClick={() => setCurrentPage(currentPage - 1)} className={styles.buttonSecondary}>←</button>
                    <span style={{ fontSize: '14px', alignSelf: 'center', fontWeight: 500 }}>{currentPage + 1} / {paginationInfo.pages}</span>
                    <button disabled={currentPage >= paginationInfo.pages - 1} onClick={() => setCurrentPage(currentPage + 1)} className={styles.buttonSecondary}>→</button>
                </div>
            )}
        </section>
    );
};