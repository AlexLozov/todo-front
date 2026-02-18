import { useEffect, useRef, useCallback, useState } from 'react';
import { Client, type IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

// Типы для WebSocket уведомлений (соответствуют формату сервера)
export interface TaskNotification {
    id: number;
    title: string;
    description: string;
    localDateTime: string;
    status: 'CREATED' | 'UPDATED' | 'DELETED';
    finished?: boolean;
}

type MessageHandler = (notification: TaskNotification) => void;

export const useWebSocket = (onMessage: MessageHandler) => {
    const clientRef = useRef<Client | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        console.log('🔄 Инициализация WebSocket подключения...');

        // Важно: используем SockJS с правильными настройками
        const socket = new SockJS('http://localhost:8080/ws');

        const client = new Client({
            webSocketFactory: () => socket,
            debug: (str) => {
                console.log('📢 STOMP:', str);
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            connectionTimeout: 10000,
        });

        client.onConnect = () => {
            console.log('✅ WebSocket подключен!');
            setIsConnected(true);

            // Подписываемся на топик задач
            client.subscribe('/topic/tasks', (message: IMessage) => {
                try {
                    console.log('📩 Получено сырое сообщение:', message.body);
                    const notification: TaskNotification = JSON.parse(message.body);
                    console.log('📩 Разобранное уведомление:', notification);
                    onMessage(notification);
                } catch (error) {
                    console.error('❌ Ошибка при обработке сообщения:', error);
                }
            });
        };

        client.onStompError = (frame) => {
            console.error('❌ STOMP ошибка:', frame);
            setIsConnected(false);
        };

        client.onDisconnect = () => {
            console.log('🔌 WebSocket отключен');
            setIsConnected(false);
        };

        client.onWebSocketError = (event) => {
            console.error('❌ WebSocket ошибка:', event);
        };

        client.activate();
        clientRef.current = client;

        return () => {
            if (clientRef.current) {
                clientRef.current.deactivate();
            }
        };
    }, [onMessage]);

    const reconnect = useCallback(() => {
        if (clientRef.current) {
            clientRef.current.deactivate();
            setTimeout(() => {
                clientRef.current?.activate();
            }, 1000);
        }
    }, []);

    return { reconnect, isConnected };
};