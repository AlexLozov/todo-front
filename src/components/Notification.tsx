import React, { useEffect, useState } from 'react';
import styles from './Notification.module.css';

export interface NotificationMessage {
    id: number;
    type: 'success' | 'info' | 'warning' | 'error';
    message: string;
    taskTitle?: string;
}

interface NotificationProps {
    notification: NotificationMessage;
    onClose: (id: number) => void;
}

export const Notification: React.FC<NotificationProps> = ({ notification, onClose }) => {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsExiting(true);
            setTimeout(() => onClose(notification.id), 300); // Даем время на анимацию исчезновения
        }, 5000); // Уведомление исчезает через 5 секунд

        return () => clearTimeout(timer);
    }, [notification.id, onClose]);

    const getIcon = () => {
        switch (notification.type) {
            case 'success':
                return '✅';
            case 'info':
                return 'ℹ️';
            case 'warning':
                return '⚠️';
            case 'error':
                return '❌';
            default:
                return '📢';
        }
    };

    const getBackgroundColor = () => {
        switch (notification.type) {
            case 'success':
                return '#d4edda';
            case 'info':
                return '#d1ecf1';
            case 'warning':
                return '#fff3cd';
            case 'error':
                return '#f8d7da';
            default:
                return '#e2e3e5';
        }
    };

    const getBorderColor = () => {
        switch (notification.type) {
            case 'success':
                return '#c3e6cb';
            case 'info':
                return '#bee5eb';
            case 'warning':
                return '#ffeeba';
            case 'error':
                return '#f5c6cb';
            default:
                return '#d6d8db';
        }
    };

    const getTextColor = () => {
        switch (notification.type) {
            case 'success':
                return '#155724';
            case 'info':
                return '#0c5460';
            case 'warning':
                return '#856404';
            case 'error':
                return '#721c24';
            default:
                return '#383d41';
        }
    };

    return (
        <div
            className={`${styles.notification} ${isExiting ? styles.exiting : ''}`}
            style={{
                backgroundColor: getBackgroundColor(),
                borderLeft: `4px solid ${getBorderColor()}`,
                color: getTextColor(),
            }}
            onClick={() => {
                setIsExiting(true);
                setTimeout(() => onClose(notification.id), 300);
            }}
        >
            <div className={styles.icon}>{getIcon()}</div>
            <div className={styles.content}>
                <div className={styles.message}>{notification.message}</div>
                {notification.taskTitle && (
                    <div className={styles.taskTitle}>«{notification.taskTitle}»</div>
                )}
            </div>
            <button className={styles.closeButton}>×</button>
        </div>
    );
};