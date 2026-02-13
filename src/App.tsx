import { useEffect, useState, type FormEvent } from 'react';
import { taskApi } from './api/taskApi';
import { mailApi } from './api/mailApi';
import type { TaskResponse, Pagination, MailImapResponse } from './types';

// Обновленные стили с принудительным цветом текста
const styles = {
    container: {
        padding: '40px 20px',
        maxWidth: '1000px',
        margin: '0 auto',
        fontFamily: '"Inter", "Segoe UI", sans-serif',
        backgroundColor: '#f4f7f6',
        minHeight: '100vh',
        color: '#333'
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '30px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
        border: '1px solid #e0e0e0'
    },
    titleLine: {
        marginTop: 0,
        color: '#2c3e50',
        borderBottom: '3px solid #007bff',
        paddingBottom: '8px',
        display: 'inline-block',
        marginBottom: '20px'
    },
    input: {
        padding: '12px',
        borderRadius: '8px',
        border: '1px solid #ced4da',
        fontSize: '14px',
        outline: 'none',
        backgroundColor: '#fff',
        color: '#212529', // ПРИНУДИТЕЛЬНО ТЕМНЫЙ ТЕКСТ
        transition: 'border-color 0.2s',
        width: '100%',
        boxSizing: 'border-box' as const
    },
    buttonPrimary: {
        padding: '12px 24px',
        backgroundColor: '#007bff',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '600' as const,
        boxShadow: '0 2px 4px rgba(0,123,255,0.3)'
    },
    buttonSecondary: {
        padding: '8px 14px',
        backgroundColor: '#f8f9fa',
        border: '1px solid #ddd',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '13px',
        color: '#495057',
        fontWeight: '500' as const
    },
    taskItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px',
        borderBottom: '1px solid #f1f1f1',
        backgroundColor: '#fff',
        borderRadius: '8px',
        marginBottom: '8px'
    },
    editContainer: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '10px',
        width: '100%',
        padding: '15px',
        backgroundColor: '#f0f7ff',
        borderRadius: '8px',
        border: '1px solid #007bff'
    }
};

function App() {
    const [tasks, setTasks] = useState<TaskResponse[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [paginationInfo, setPaginationInfo] = useState<Pagination | null>(null);
    const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const [editingId, setEditingId] = useState<number | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editDesc, setEditDesc] = useState('');

    const [emails, setEmails] = useState<MailImapResponse[]>([]);
    const [mailTo, setMailTo] = useState('');
    const [mailSubject, setMailSubject] = useState('');
    const [mailText, setMailText] = useState('');
    const [isMailLoading, setIsMailLoading] = useState(false);

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
        if (!title.trim()) return;
        try {
            const res = await taskApi.createTask({ title, description });
            if (res.success) { setTitle(''); setDescription(''); setFilter('all'); setCurrentPage(0); }
        } catch (err) { console.error(err); }
    };

    const startEditing = (task: TaskResponse) => {
        setEditingId(task.id);
        setEditTitle(task.title);
        setEditDesc(task.description || '');
    };

    const saveEdit = async (id: number, finished: boolean) => {
        try {
            const res = await taskApi.updateTask(id, { title: editTitle, description: editDesc, finished });
            if (res.success) { setEditingId(null); fetchTasks(currentPage, filter); }
        } catch (err) { console.error(err); }
    };

    const handleToggleStatus = async (task: TaskResponse) => {
        try {
            await taskApi.updateTask(task.id, { title: task.title, finished: !task.isFinished });
            fetchTasks(currentPage, filter);
        } catch (err) { console.error(err); }
    };

    const handleSendMail = async (e: FormEvent) => {
        e.preventDefault();
        try {
            await mailApi.sendMail({ to: mailTo, subject: mailSubject, text: mailText });
            alert('Успешно отправлено!'); setMailTo(''); setMailSubject(''); setMailText('');
        } catch (err) { console.error(err); }
    };

    const fetchEmails = async () => {
        try { setIsMailLoading(true); const res = await mailApi.getLastEmails(); if (res.success) setEmails(res.payload); }
        catch (err) { console.error(err); } finally { setIsMailLoading(false); }
    };

    return (
        <div style={styles.container}>
            <h1 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '40px', fontWeight: '800' }}>WORK STATION</h1>

            {/* Секция Задач */}
            <section style={styles.section}>
                <h2 style={styles.titleLine}>Задачи</h2>

                <form onSubmit={handleCreateTask} style={{ display: 'flex', gap: '12px', marginBottom: '25px' }}>
                    <input style={{ ...styles.input, flex: 2 }} placeholder="Название задачи" value={title} onChange={e => setTitle(e.target.value)} />
                    <input style={{ ...styles.input, flex: 3 }} placeholder="Описание..." value={description} onChange={e => setDescription(e.target.value)} />
                    <button type="submit" style={styles.buttonPrimary}>Добавить</button>
                </form>

                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                    {(['all', 'active', 'completed'] as const).map((f) => (
                        <button key={f} onClick={() => { setFilter(f); setCurrentPage(0); }}
                                style={{ ...styles.buttonSecondary, backgroundColor: filter === f ? '#007bff' : '#fff', color: filter === f ? '#fff' : '#495057', borderColor: filter === f ? '#007bff' : '#ddd' }}>
                            {f === 'all' ? 'Все' : f === 'active' ? 'Активные' : 'Выполненные'}
                        </button>
                    ))}
                </div>

                <div style={{ minHeight: '150px' }}>
                    {isLoading ? <p style={{ textAlign: 'center', color: '#999' }}>Загрузка...</p> : tasks.map(task => (
                        <div key={task.id} style={styles.taskItem}>
                            {editingId === task.id ? (
                                <div style={styles.editContainer}>
                                    <label style={{fontSize: '12px', color: '#007bff', fontWeight: 'bold'}}>Редактирование названия:</label>
                                    <input style={styles.input} value={editTitle} onChange={e => setEditTitle(e.target.value)} />
                                    <label style={{fontSize: '12px', color: '#007bff', fontWeight: 'bold'}}>Редактирование описания:</label>
                                    <input style={styles.input} value={editDesc} onChange={e => setEditDesc(e.target.value)} />
                                    <div style={{ display: 'flex', gap: '8px', marginTop: '5px' }}>
                                        <button onClick={() => saveEdit(task.id, task.isFinished)} style={{ ...styles.buttonPrimary, padding: '8px 16px' }}>Сохранить</button>
                                        <button onClick={() => setEditingId(null)} style={{ ...styles.buttonSecondary, padding: '8px 16px' }}>Отмена</button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <input type="checkbox" checked={task.isFinished} onChange={() => handleToggleStatus(task)} style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
                                        <div>
                                            <div style={{ fontWeight: '600', fontSize: '15px', textDecoration: task.isFinished ? 'line-through' : 'none', color: task.isFinished ? '#adb5bd' : '#212529' }}>{task.title}</div>
                                            {task.description && <div style={{ fontSize: '13px', color: '#6c757d' }}>{task.description}</div>}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button onClick={() => startEditing(task)} style={styles.buttonSecondary}>Изменить</button>
                                        <button onClick={() => taskApi.deleteTask(task.id).then(() => fetchTasks(currentPage, filter))} style={{ ...styles.buttonSecondary, color: '#e03131', borderColor: '#ffc9c9' }}>Удалить</button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>

                {paginationInfo && paginationInfo.pages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '25px' }}>
                        <button disabled={currentPage === 0} onClick={() => setCurrentPage(p => p - 1)} style={styles.buttonSecondary}>← Назад</button>
                        <span style={{ fontSize: '14px', fontWeight: 'bold', alignSelf: 'center' }}>{currentPage + 1} / {paginationInfo.pages}</span>
                        <button disabled={currentPage >= paginationInfo.pages - 1} onClick={() => setCurrentPage(p => p + 1)} style={styles.buttonSecondary}>Вперед →</button>
                    </div>
                )}
            </section>

            {/* Секция Почты */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                <section style={styles.section}>
                    <h2 style={styles.titleLine}>Отправить письмо</h2>
                    <form onSubmit={handleSendMail} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <input style={styles.input} placeholder="Кому (email)" value={mailTo} onChange={e => setMailTo(e.target.value)} required />
                        <input style={styles.input} placeholder="Тема сообщения" value={mailSubject} onChange={e => setMailSubject(e.target.value)} required />
                        <textarea style={{ ...styles.input, minHeight: '130px', resize: 'vertical' }} placeholder="Текст письма..." value={mailText} onChange={e => setMailText(e.target.value)} required />
                        <button type="submit" style={styles.buttonPrimary}>Отправить сообщение</button>
                    </form>
                </section>

                <section style={styles.section}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2 style={{ ...styles.titleLine, marginBottom: 0 }}>Входящие</h2>
                        <button onClick={fetchEmails} style={styles.buttonPrimary}>Прочитать</button>
                    </div>
                    <div style={{ height: '330px', overflowY: 'auto', paddingRight: '5px' }}>
                        {isMailLoading ? <p style={{ textAlign: 'center', padding: '20px' }}>Загрузка...</p> :
                            emails.length === 0 ? <p style={{ textAlign: 'center', padding: '20px', color: '#adb5bd' }}>Сообщений нет</p> :
                                emails.map((m, i) => (
                                    <div key={i} style={{ padding: '12px', borderBottom: '1px solid #eee', backgroundColor: '#fdfdfd', marginBottom: '8px', borderRadius: '8px', border: '1px solid #f1f3f5' }}>
                                        <div style={{ fontWeight: '700', fontSize: '12px', color: '#007bff', marginBottom: '4px' }}>{m.from}</div>
                                        <div style={{ fontSize: '14px', fontWeight: '500', color: '#343a40', marginBottom: '4px' }}>{m.subject}</div>
                                        <div style={{ fontSize: '11px', color: '#adb5bd' }}>{new Date(m.receivedDate).toLocaleString()}</div>
                                    </div>
                                ))
                        }
                    </div>
                </section>
            </div>
        </div>
    );
}

export default App;