import { useState } from 'react'; // Добавляем импорт useState
import { TaskSection } from './TaskSection';
import { MailSection } from './MailSection';
import { NotificationsContainer } from './components/NotificationsContainer'; // Добавляем
import type { NotificationMessage } from './components/Notification'; // Добавляем типы
import './index.css';

function App() {
    // Добавляем состояние для уведомлений
    const [notifications, setNotifications] = useState<NotificationMessage[]>([]);

    // Добавляем функцию для добавления уведомлений
    const addNotification = (type: NotificationMessage['type'], message: string, taskTitle?: string) => {
        const newNotification: NotificationMessage = {
            id: Date.now(),
            type,
            message,
            taskTitle
        };
        setNotifications(prev => [newNotification, ...prev]);
    };

    // Добавляем функцию для удаления уведомлений
    const removeNotification = (id: number) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    return (
        <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Добавляем контейнер уведомлений */}
            <NotificationsContainer
                notifications={notifications}
                onClose={removeNotification}
            />

            <header style={{ textAlign: 'center', marginBottom: '50px' }}>
                <h1 style={{ fontSize: '2.5rem', color: 'var(--text-main)', margin: 0, fontWeight: 800 }}>
                    WORK <span style={{ color: 'var(--primary-color)' }}>STATION</span>
                </h1>
                <p style={{ color: 'var(--text-muted)', marginTop: '10px' }}>
                    Управление задачами и почтой
                </p>
            </header>

            <main style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Передаем функцию addNotification в TaskSection */}
                <TaskSection addNotification={addNotification} />
                <MailSection />
            </main>

            <footer style={{ textAlign: 'center', marginTop: '50px', paddingBottom: '20px', color: '#bdc3c7', fontSize: '12px' }}>
                &copy; {new Date().getFullYear()} Work Station. Все права защищены.
            </footer>
        </div>
    );
}

export default App;
