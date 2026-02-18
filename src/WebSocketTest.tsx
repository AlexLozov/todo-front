import { useEffect, useState } from 'react'; // Убираем React, если не используется
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

export const WebSocketTest = () => {
    const [status, setStatus] = useState('🔴 Отключен');
    const [messages, setMessages] = useState<string[]>([]);

    useEffect(() => {
        console.log('🔄 Попытка подключения к WebSocket...');
        setStatus('🟡 Подключаюсь...');

        // Создаем SockJS подключение
        const socket = new SockJS('http://localhost:8080/ws');

        const client = new Client({
            webSocketFactory: () => socket,
            debug: (str) => {
                console.log('📢 STOMP:', str);
            },
            reconnectDelay: 5000,
        });

        client.onConnect = () => {
            console.log('✅ WebSocket подключен!');
            setStatus('🟢 Подключен');

            // Подписываемся на топик
            client.subscribe('/topic/tasks', (message) => {
                console.log('📩 Получено сообщение:', message.body);
                setMessages(prev => [`${new Date().toLocaleTimeString()}: ${message.body}`, ...prev]);
            });
        };

        client.onStompError = (frame) => {
            console.error('❌ STOMP ошибка:', frame);
            setStatus('🔴 Ошибка: ' + frame.headers.message);
        };

        client.onDisconnect = () => {
            console.log('🔌 Отключен');
            setStatus('🔴 Отключен');
        };

        client.activate();

        return () => {
            client.deactivate();
        };
    }, []); // Пустой массив зависимостей - useEffect выполняется один раз

    return (
        <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px' }}>
            <h3>WebSocket Тест</h3>
            <p>Статус: <strong>{status}</strong></p>
            <div>
                <h4>Полученные сообщения:</h4>
                <ul>
                    {messages.map((msg, i) => (
                        <li key={i}>{msg}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};