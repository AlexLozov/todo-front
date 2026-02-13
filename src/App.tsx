import { TaskSection } from './TaskSection';
import { MailSection } from './MailSection';
import './index.css'; // Импортируем наши новые глобальные стили

function App() {
    return (
        <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
            <header style={{ textAlign: 'center', marginBottom: '50px' }}>
                <h1 style={{ fontSize: '2.5rem', color: 'var(--text-main)', margin: 0, fontWeight: 800 }}>
                    WORK <span style={{ color: 'var(--primary-color)' }}>STATION</span>
                </h1>
                <p style={{ color: 'var(--text-muted)', marginTop: '10px' }}>
                    Управление задачами и почтой
                </p>
            </header>

            <main style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Теперь мы НЕ передаем объект styles через пропсы */}
                <TaskSection />
                <MailSection />
            </main>

            <footer style={{ textAlign: 'center', marginTop: '50px', paddingBottom: '20px', color: '#bdc3c7', fontSize: '12px' }}>
                &copy; {new Date().getFullYear()} Work Station. Все права защищены.
            </footer>
        </div>
    );
}

export default App;