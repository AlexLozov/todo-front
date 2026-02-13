import { useState } from 'react';
import { mailApi } from '../api/mailApi';
import type { MailImapResponse } from '../types';

export const useMail = () => {
    const [emails, setEmails] = useState<MailImapResponse[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [mailForm, setMailForm] = useState({ to: '', subject: '', text: '' });

    const fetchEmails = async () => {
        try {
            setIsLoading(true);
            const res = await mailApi.getLastEmails();
            if (res.success) setEmails(res.payload);
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const sendMail = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSending(true);
        try {
            await mailApi.sendMail(mailForm);
            alert('Успешно отправлено!');
            setMailForm({ to: '', subject: '', text: '' });
        } catch (err) {
            console.error('Send error:', err);
            alert('Ошибка при отправке');
        } finally {
            setIsSending(false);
        }
    };

    const updateFormField = (field: keyof typeof mailForm, value: string) => {
        setMailForm(prev => ({ ...prev, [field]: value }));
    };

    return {
        emails,
        isLoading,
        isSending,
        mailForm,
        fetchEmails,
        sendMail,
        updateFormField
    };
};