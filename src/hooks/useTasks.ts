import { useState, useEffect } from 'react';
import { taskApi } from '../api/taskApi';
import type { TaskResponse, Pagination } from '../types';

export const useTasks = () => {
    // Состояние списка задач и загрузки
    const [tasks, setTasks] = useState<TaskResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Состояние пагинации и фильтрации
    const [currentPage, setCurrentPage] = useState(0);
    const [paginationInfo, setPaginationInfo] = useState<Pagination | null>(null);
    const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

    // Состояние создания новой задачи
    const [newTask, setNewTask] = useState({ title: '', description: '' });

    // Состояние редактирования существующей задачи
    const [editingState, setEditingState] = useState<{ id: number | null, title: string, desc: string }>({
        id: null, title: '', desc: ''
    });

    // НОВОЕ: Состояние для детального просмотра задачи (модальное окно)
    const [selectedTask, setSelectedTask] = useState<TaskResponse | null>(null);

    // Функция загрузки данных
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
        } catch (err) {
            console.error('Ошибка при загрузке задач:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Следим за изменением страницы или фильтра
    useEffect(() => {
        fetchTasks(currentPage, filter);
    }, [currentPage, filter]);

    // Создание задачи
    const createTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTask.title.trim()) return;
        try {
            const res = await taskApi.createTask({
                title: newTask.title,
                description: newTask.description
            });
            if (res.success) {
                setNewTask({ title: '', description: '' });
                setFilter('all');
                setCurrentPage(0);
                // Если мы уже на 0 странице и фильтр "все", обновляем вручную
                if (filter === 'all' && currentPage === 0) fetchTasks(0, 'all');
            }
        } catch (err) {
            console.error('Ошибка при создании задачи:', err);
        }
    };

    // Переключение статуса (выполнено/нет)
    const toggleTaskStatus = async (task: TaskResponse) => {
        try {
            await taskApi.updateTask(task.id, {
                title: task.title,
                finished: !task.isFinished
            });
            fetchTasks(currentPage, filter);

            // Если задача открыта в модальном окне, обновляем её и там
            if (selectedTask?.id === task.id) {
                setSelectedTask({ ...task, isFinished: !task.isFinished });
            }
        } catch (err) {
            console.error('Ошибка при обновлении статуса:', err);
        }
    };

    // Сохранение изменений после редактирования
    const saveEdit = async (id: number, finished: boolean) => {
        try {
            const res = await taskApi.updateTask(id, {
                title: editingState.title,
                description: editingState.desc,
                finished
            });
            if (res.success) {
                setEditingState({ id: null, title: '', desc: '' });
                fetchTasks(currentPage, filter);
            }
        } catch (err) {
            console.error('Ошибка при сохранении редактирования:', err);
        }
    };

    // Удаление задачи
    const deleteTask = async (id: number) => {
        if (!window.confirm('Вы уверены, что хотите удалить эту задачу?')) return;
        try {
            await taskApi.deleteTask(id);
            fetchTasks(currentPage, filter);
            // Закрываем модалку, если удаленная задача была открыта
            if (selectedTask?.id === id) setSelectedTask(null);
        } catch (err) {
            console.error('Ошибка при удалении задачи:', err);
        }
    };

    return {
        // Данные
        tasks,
        isLoading,
        currentPage,
        paginationInfo,
        filter,
        newTask,
        editingState,
        selectedTask, // НОВОЕ

        // Сеттеры
        setFilter,
        setCurrentPage,
        setNewTask,
        setEditingState,
        setSelectedTask, // НОВОЕ

        // Методы API
        createTask,
        toggleTaskStatus,
        saveEdit,
        deleteTask,
        refresh: () => fetchTasks(currentPage, filter)
    };
};