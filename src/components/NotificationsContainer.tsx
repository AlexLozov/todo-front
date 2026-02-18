import React from 'react';
import { Notification, type NotificationMessage } from './Notification';
import styles from './Notification.module.css';

interface NotificationsContainerProps {
    notifications: NotificationMessage[];
    onClose: (id: number) => void;
}

export const NotificationsContainer: React.FC<NotificationsContainerProps> = ({
                                                                                  notifications,
                                                                                  onClose
                                                                              }) => {
    if (notifications.length === 0) return null;

    return (
        <div className={styles.notificationsContainer}>
            {notifications.map(notification => (
                <Notification
                    key={notification.id}
                    notification={notification}
                    onClose={onClose}
                />
            ))}
        </div>
    );
};