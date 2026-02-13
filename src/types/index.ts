// Базовая обертка ответа от твоего API
export interface ApiResponse<T> {
    message: string;
    payload: T;
    success: boolean;
    timestamp: string;
    status: number;
}

// Сущность задачи
export interface TaskResponse {
    id: number;
    title: string;
    description: string;
    isFinished: boolean;
}

// Запросы на создание и обновление
export interface TaskCreateRequest {
    title: string;
    description?: string;
}

export interface TaskUpdateRequest {
    title: string;
    description?: string;
    finished?: boolean;
}

// Типы для пагинации
export interface Pagination {
    page: number;
    pages: number;
    limit: number;
    total: number;
}

export interface PaginationResponseTask {
    content: TaskResponse[];
    pagination: Pagination;
}

// Типы для почты
export interface MailImapResponse {
    from: string;
    subject: string;
    receivedDate: string;
}

export interface MailSendSmtpRequest {
    to: string;
    subject: string;
    text: string;
}