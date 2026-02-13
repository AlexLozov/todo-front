import { useState, useEffect } from 'react';
import { taskApi } from '../api/taskApi';
import type { TaskResponse, Pagination } from '../types';

export const useTasks = () => {
    const [tasks, setTasks] = useState<TaskResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [paginationInfo, setPaginationInfo] = useState<Pagination | null>(null);
    const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

    const [newTask, setNewTask] = useState({ title: '', description: '' });
    const [editingState, setEditingState] = useState<{ id: number | null, title: string, desc: string }>({
        id: null, title: '', desc: ''
    });

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
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks(currentPage, filter);
    }, [currentPage, filter]);

    const createTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTask.title.trim()) return;
        try {
            const res = await taskApi.createTask({ title: newTask.title, description: newTask.description });
            if (res.success) {
                setNewTask({ title: '', description: '' });
                setFilter('all');
                setCurrentPage(0);
                if (filter === 'all' && currentPage === 0) fetchTasks(0, 'all');
            }
        } catch (err) { console.error(err); }
    };

    const toggleTaskStatus = async (task: TaskResponse) => {
        try {
            await taskApi.updateTask(task.id, { title: task.title, finished: !task.isFinished });
            fetchTasks(currentPage, filter);
        } catch (err) { console.error(err); }
    };

    const saveEdit = async (id: number, finished: boolean) => {
        try {
            const res = await taskApi.updateTask(id, { title: editingState.title, description: editingState.desc, finished });
            if (res.success) {
                setEditingState({ id: null, title: '', desc: '' });
                fetchTasks(currentPage, filter);
            }
        } catch (err) { console.error(err); }
    };

    const deleteTask = async (id: number) => {
        if (!window.confirm('Удалить задачу?')) return;
        try {
            await taskApi.deleteTask(id);
            fetchTasks(currentPage, filter);
        } catch (err) { console.error(err); }
    };

    return {
        tasks, isLoading, currentPage, paginationInfo, filter, newTask, editingState,
        setFilter, setCurrentPage, setNewTask, setEditingState,
        createTask, toggleTaskStatus, saveEdit, deleteTask
    };
};