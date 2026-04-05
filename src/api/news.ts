import apiClient from './client';
import { PaginatedResponse, News } from '../types';

export const newsApi = {
    getAll: (params?: { page?: number; limit?: number; category?: string; search?: string; is_featured?: boolean; is_trending?: boolean; language?: string }) =>
        apiClient.get<PaginatedResponse<News>>('/news', { params }).then(r => r.data),


    getOne: (id: string) =>
        apiClient.get(`/news/${id}`).then(r => r.data),

    create: (data: Partial<News>) =>
        apiClient.post('/news', data).then(r => r.data),

    update: (id: string, data: Partial<News>) =>
        apiClient.patch(`/news/${id}`, data).then(r => r.data),

    delete: (id: string) =>
        apiClient.delete(`/news/${id}`).then(r => r.data),

    incrementShares: (id: string) =>
        apiClient.post(`/news/${id}/share`).then(r => r.data),

    getNewsLikes: (id: string) =>
        apiClient.get(`/news/${id}/likes`).then(r => r.data),

    getNewsShares: (id: string) =>
        apiClient.get(`/news/${id}/shares`).then(r => r.data),

    getNewsViews: (id: string) =>
        apiClient.get(`/news/${id}/views`).then(r => r.data),
};
