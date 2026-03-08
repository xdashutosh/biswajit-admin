import apiClient from './client';
import { PaginatedResponse, News } from '../types';

export const newsApi = {
    getAll: (params?: { page?: number; limit?: number; category?: string; search?: string }) =>
        apiClient.get<PaginatedResponse<News>>('/news', { params }).then(r => r.data),

    getOne: (id: string) =>
        apiClient.get(`/news/${id}`).then(r => r.data),

    create: (data: Partial<News>) =>
        apiClient.post('/news', data).then(r => r.data),

    update: (id: string, data: Partial<News>) =>
        apiClient.patch(`/news/${id}`, data).then(r => r.data),

    delete: (id: string) =>
        apiClient.delete(`/news/${id}`).then(r => r.data),
};
