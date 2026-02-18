import { useState, useEffect, useCallback, useRef } from 'react';
import { taskApi } from '../api/taskApi';
import { useWebSocket } from './useWebSocket';
import type { TaskResponse, Pagination } from '../types';
import type { TaskNotification } from './useWebSocket';

interface UseTasksProps {
    addNotification?: (type: 'success' | 'info' | 'warning' | 'error', message: string, taskTitle?: string) => void;
}

export const useTasks = (props?: UseTasksProps) => {
    const { addNotification } = props || {};

    // Состояние списка задач и загрузки
    const [tasks, setTasks] = useState<TaskResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Состояние пагинации и фильтрации
    const [currentPage, setCurrentPage] = useState(0);
    const [paginationInfo, setPaginationInfo] = useState<Pagination | null>(null);
    const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

    // Состояние создания новой задачи
    const [newTask, setNewTask] = useState({ title: '', description: '' });

    // Состояние редактирования существующей задачи
    const [editingState, setEditingState] = useState<{ id: number | null; title: string; desc: string }>({
        id: null,
        title: '',
        desc: ''
    });

    // Состояние для детального просмотра задачи
    const [selectedTask, setSelectedTask] = useState<TaskResponse | null>(null);

    // Ссылка на последнее обновление для предотвращения двойных запросов
    const lastUpdateRef = useRef<number>(Date.now());

    // Функция загрузки данных
    const fetchTasks = useCallback(async (page: number, currentFilter: string, forceRefresh = false) => {
        try {
            if (forceRefresh) {
                setIsRefreshing(true);
            } else {
                setIsLoading(true);
            }

            const res = currentFilter === 'all'
                ? await taskApi.getTasksPage(page, 5)
                : await taskApi.getTasksByStatus(currentFilter === 'completed', page, 5);

            if (res.success) {
                setTasks(res.payload.content);
                setPaginationInfo(res.payload.pagination);
                lastUpdateRef.current = Date.now();
                console.log('📥 Загружены задачи:', res.payload.content);
            }
        } catch (err) {
            console.error('Ошибка при загрузке задач:', err);
            addNotification?.('error', 'Ошибка при загрузке задач');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [addNotification]);

    // Функция для проверки, должна ли задача отображаться при текущем фильтре
    const shouldShowTask = useCallback((task: TaskResponse) => {
        if (filter === 'active' && task.isFinished) return false;
        if (filter === 'completed' && !task.isFinished) return false;
        return true;
    }, [filter]);

    // Функция для обновления задачи в списке с учетом фильтра
    const updateTaskInList = useCallback((updatedTask: TaskResponse) => {
        setTasks(prevTasks => {
            // Проверяем, должна ли задача отображаться при текущем фильтре
            const shouldShow = shouldShowTask(updatedTask);
            const exists = prevTasks.some(t => t.id === updatedTask.id);

            if (!shouldShow && exists) {
                // Задача больше не соответствует фильтру - удаляем её
                return prevTasks.filter(t => t.id !== updatedTask.id);
            } else if (shouldShow && !exists) {
                // Задача должна отображаться, но её нет в списке - добавляем
                const newTasks = [updatedTask, ...prevTasks];
                if (paginationInfo && newTasks.length > paginationInfo.limit) {
                    return newTasks.slice(0, paginationInfo.limit);
                }
                return newTasks;
            } else if (shouldShow && exists) {
                // Задача есть в списке и должна отображаться - обновляем
                return prevTasks.map(t => t.id === updatedTask.id ? updatedTask : t);
            }

            // Во всех остальных случаях оставляем список без изменений
            return prevTasks;
        });
    }, [shouldShowTask, paginationInfo]);

    // Обработчик WebSocket сообщений
    const handleWebSocketMessage = useCallback((notification: TaskNotification) => {
        console.log('🔄 Получено WebSocket уведомление:', notification);

        // Преобразуем notification в формат TaskResponse
        const task: TaskResponse = {
            id: notification.id,
            title: notification.title,
            description: notification.description,
            isFinished: notification.finished || false // Используем notification.finished вместо any
        };

        const eventType = notification.status; // Сервер присылает status

        console.log('📋 Преобразовано:', { eventType, task });

        switch (eventType) {
            case 'CREATED':
                // Проверяем, должна ли задача отображаться при текущем фильтре
                if (shouldShowTask(task)) {
                    setTasks(prevTasks => {
                        // Проверяем, есть ли уже такая задача
                        if (prevTasks.some(t => t.id === task.id)) {
                            console.log('⏭️ Задача уже существует, пропускаем');
                            return prevTasks;
                        }

                        console.log('✅ Добавляем новую задачу:', task);

                        // Добавляем задачу в начало списка
                        const newTasks = [task, ...prevTasks];

                        // Если есть пагинация и задач стало больше лимита
                        if (paginationInfo && newTasks.length > paginationInfo.limit) {
                            return newTasks.slice(0, paginationInfo.limit);
                        }

                        return newTasks;
                    });

                    // Обновляем информацию о пагинации
                    if (paginationInfo) {
                        setPaginationInfo(prev => {
                            if (!prev) return null;
                            const newTotal = prev.total + 1;
                            return {
                                ...prev,
                                total: newTotal,
                                pages: Math.ceil(newTotal / prev.limit)
                            };
                        });
                    }
                } else {
                    console.log('⏭️ Задача не соответствует фильтру, не добавляем в список');
                }

                addNotification?.('success', 'Новая задача создана', task.title);
                break;

            case 'UPDATED':
                // Обновляем задачу в списке с учетом фильтра
                updateTaskInList(task);

                // Обновляем выбранную задачу, если она открыта
                if (selectedTask?.id === task.id) {
                    setSelectedTask(task);
                }

                addNotification?.('info', 'Задача обновлена', task.title);
                break;

            case 'DELETED':
                setTasks(prevTasks => {
                    const filtered = prevTasks.filter(t => t.id !== task.id);

                    // Если после удаления задач стало меньше лимита и есть следующая страница
                    if (paginationInfo && filtered.length < paginationInfo.limit && currentPage < paginationInfo.pages - 1) {
                        // Загружаем следующую страницу через небольшую задержку
                        setTimeout(() => {
                            fetchTasks(currentPage, filter, true);
                        }, 300);
                    }

                    return filtered;
                });

                // Обновляем информацию о пагинации
                if (paginationInfo) {
                    setPaginationInfo(prev => {
                        if (!prev) return null;
                        const newTotal = Math.max(0, prev.total - 1);
                        return {
                            ...prev,
                            total: newTotal,
                            pages: Math.ceil(newTotal / prev.limit)
                        };
                    });
                }

                // Закрываем модалку, если удаленная задача была открыта
                if (selectedTask?.id === task.id) {
                    setSelectedTask(null);
                }

                addNotification?.('warning', 'Задача удалена', task.title);
                break;

            default:
                console.log('⚠️ Неизвестный тип события:', eventType, notification);
        }
    }, [selectedTask, addNotification, shouldShowTask, paginationInfo, currentPage, filter, fetchTasks, updateTaskInList]);

    // Подключаем WebSocket
    const { reconnect, isConnected } = useWebSocket(handleWebSocketMessage);

    // Следим за изменением страницы или фильтра
    useEffect(() => {
        console.log('📊 Изменение параметров:', { currentPage, filter });
        fetchTasks(currentPage, filter);
    }, [currentPage, filter, fetchTasks]);

    // Создание задачи
    const createTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTask.title.trim()) {
            addNotification?.('error', 'Название задачи не может быть пустым');
            return;
        }

        try {
            console.log('📝 Создание задачи:', newTask);
            const res = await taskApi.createTask({
                title: newTask.title,
                description: newTask.description
            });

            if (res.success) {
                setNewTask({ title: '', description: '' });
                // WebSocket обновит список автоматически
            }
        } catch (err) {
            console.error('Ошибка при создании задачи:', err);
            addNotification?.('error', 'Ошибка при создании задачи');
        }
    };

    // Переключение статуса (выполнено/нет)
    const toggleTaskStatus = async (task: TaskResponse) => {
        try {
            console.log('🔄 Переключение статуса задачи:', task.id, !task.isFinished);
            await taskApi.updateTask(task.id, {
                title: task.title,
                finished: !task.isFinished
            });
            // WebSocket обновит список автоматически
        } catch (err) {
            console.error('Ошибка при обновлении статуса:', err);
            addNotification?.('error', 'Ошибка при обновлении статуса');
        }
    };

    // Сохранение изменений после редактирования
    const saveEdit = async (id: number, finished: boolean) => {
        if (!editingState.title.trim()) {
            addNotification?.('error', 'Название задачи не может быть пустым');
            return;
        }

        try {
            console.log('📝 Сохранение редактирования:', id, editingState);
            const res = await taskApi.updateTask(id, {
                title: editingState.title,
                description: editingState.desc,
                finished
            });

            if (res.success) {
                setEditingState({ id: null, title: '', desc: '' });
                // WebSocket обновит список автоматически
            }
        } catch (err) {
            console.error('Ошибка при сохранении редактирования:', err);
            addNotification?.('error', 'Ошибка при сохранении задачи');
        }
    };

    // Удаление задачи - убираем неиспользуемый параметр taskTitle
    const deleteTask = async (id: number) => {
        if (!window.confirm('Вы уверены, что хотите удалить эту задачу?')) return;

        try {
            console.log('🗑️ Удаление задачи:', id);
            await taskApi.deleteTask(id);
            // WebSocket обновит список автоматически
        } catch (err) {
            console.error('Ошибка при удалении задачи:', err);
            addNotification?.('error', 'Ошибка при удалении задачи');
        }
    };

    return {
        // Данные
        tasks,
        isLoading: isLoading || isRefreshing,
        currentPage,
        paginationInfo,
        filter,
        newTask,
        editingState,
        selectedTask,
        wsConnected: isConnected,

        // Сеттеры
        setFilter,
        setCurrentPage,
        setNewTask,
        setEditingState,
        setSelectedTask,

        // Методы API
        createTask,
        toggleTaskStatus,
        saveEdit,
        deleteTask, // Убираем обертку с taskTitle
        refresh: () => fetchTasks(currentPage, filter, true),
        reconnectWebSocket: reconnect
    };
};