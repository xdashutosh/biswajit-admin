import apiClient from './client';
import { PaginatedResponse, FakeNewsReport } from '../types';

export const fakeNewsApi = {
    getAll: (params?: { 
        page?: number; 
        limit?: number; 
        status?: string; 
        priority?: string;
        category?: string;
        search?: string 
    }) =>
        apiClient.get<any>('/fake-news', { params }).then(r => r.data),

    getOne: (id: string) =>
        apiClient.get<any>(`/fake-news/${id}`).then(r => r.data),

    getStats: () =>
        apiClient.get<any>('/fake-news/stats').then(r => r.data),

    update: (id: string, data: Partial<FakeNewsReport>) =>
        apiClient.patch<any>(`/fake-news/${id}/verify`, data).then(r => r.data),

    delete: (id: string) =>
        apiClient.delete<any>(`/fake-news/${id}`).then(r => r.data),
};
