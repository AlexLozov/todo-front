import axios from 'axios';
// Добавляем слово type перед списком импортов
import type {
    ApiResponse,
    TaskResponse,
    TaskCreateRequest,
    TaskUpdateRequest,
    PaginationResponseTask
} from '../types';

// Создаем инстанс с базовыми настройками
const api = axios.create({
    baseURL: 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json',
    },
});

export const taskApi = {
    // 1. Получить все задачи (без пагинации)
    getAllTasks: async () => {
        const response = await api.get<ApiResponse<TaskResponse[]>>('/api/tasks');
        return response.data;
    },

    // 2. Получить список с пагинацией
    getTasksPage: async (page = 0, limit = 5) => {
        const response = await api.get<ApiResponse<PaginationResponseTask>>(
            `/api/tasks/page?page=${page}&limit=${limit}`
        );
        return response.data;
    },

    // 3. Создать задачу
    createTask: async (data: TaskCreateRequest) => {
        const response = await api.post<ApiResponse<TaskResponse>>('/api/tasks', data);
        return response.data;
    },

    // 4. Удалить задачу
    deleteTask: async (id: number) => {
        const response = await api.delete<ApiResponse<object>>(`/api/tasks/${id}`);
        return response.data;
    },

    // 5. Обновить задачу (например, пометить как выполненную)
    updateTask: async (id: number, data: TaskUpdateRequest) => {
        const response = await api.put<ApiResponse<TaskResponse>>(`/api/tasks/${id}`, data);
        return response.data;
    },

    // Внутри объекта taskApi в файле src/api/taskApi.ts
    getTasksByStatus: async (isFinished: boolean, page = 0, limit = 5) => {
        const response = await api.get<ApiResponse<PaginationResponseTask>>(
            `/api/tasks/page/status?isFinished=${isFinished}&page=${page}&limit=${limit}`
        );
        return response.data;
    },
};