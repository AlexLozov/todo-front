import axios from 'axios';
import type {
    ApiResponse,
    MailImapResponse,
    MailSendSmtpRequest
} from '../types';

const api = axios.create({
    baseURL: 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json',
    },
});

export const mailApi = {
    // Отправить письмо (SMTP)
    sendMail: async (data: MailSendSmtpRequest) => {
        const response = await api.post<ApiResponse<string>>('/mail/sent', data);
        return response.data;
    },

    // Получить последние письма (IMAP)
    getLastEmails: async () => {
        const response = await api.get<ApiResponse<MailImapResponse[]>>('/mail/read');
        return response.data;
    }
};