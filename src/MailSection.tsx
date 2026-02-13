import { useMail } from './hooks/useMail';
import styles from './MailSection.module.css';

export const MailSection = () => {
    const {
        emails, isLoading, isSending, mailForm,
        fetchEmails, sendMail, updateFormField
    } = useMail();

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
            <section className={styles.section}>
                <h2 className={styles.titleLine}>Отправить письмо</h2>
                <form onSubmit={sendMail} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <input
                        className={styles.input}
                        placeholder="Кому (email)"
                        value={mailForm.to}
                        onChange={e => updateFormField('to', e.target.value)}
                        required
                    />
                    <input
                        className={styles.input}
                        placeholder="Тема"
                        value={mailForm.subject}
                        onChange={e => updateFormField('subject', e.target.value)}
                        required
                    />
                    <textarea
                        className={styles.input}
                        style={{ minHeight: '130px', resize: 'none' }}
                        placeholder="Текст письма..."
                        value={mailForm.text}
                        onChange={e => updateFormField('text', e.target.value)}
                        required
                    />
                    <button type="submit" disabled={isSending} className={styles.buttonPrimary}>
                        {isSending ? 'Отправка...' : 'Отправить сообщение'}
                    </button>
                </form>
            </section>

            <section className={styles.section}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 className={styles.titleLine} style={{ marginBottom: 0 }}>Входящие</h2>
                    <button onClick={fetchEmails} disabled={isLoading} className={styles.buttonPrimary}>
                        {isLoading ? 'Загрузка...' : 'Прочитать'}
                    </button>
                </div>
                <div style={{ height: '330px', overflowY: 'auto' }}>
                    {isLoading ? (
                        <p style={{ color: '#999', textAlign: 'center' }}>Загрузка...</p>
                    ) : (
                        emails.map((m, i) => (
                            <div key={i} className={`${styles.emailItem} animate-fade-in`}>
                                <div style={{ fontWeight: '700', fontSize: '12px', color: 'var(--primary-color)' }}>{m.from}</div>
                                <div style={{ fontSize: '14px', color: '#333' }}>{m.subject}</div>
                                <div style={{ fontSize: '11px', color: '#adb5bd' }}>{new Date(m.receivedDate).toLocaleString()}</div>
                            </div>
                        ))
                    )}
                </div>
            </section>
        </div>
    );
};