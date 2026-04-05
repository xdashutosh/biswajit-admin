import apiClient from './client';
import { PaginatedResponse, Current } from '../types';

export const currentsApi = {
    getAll: (params?: { page?: number; limit?: number; search?: string }) =>
        apiClient.get<PaginatedResponse<Current>>('/currents', { params }).then(r => r.data),

    getOne: (id: string) =>
        apiClient.get(`/currents/${id}`).then(r => r.data),

    create: (data: Partial<Current>) =>
        apiClient.post('/currents', data).then(r => r.data),

    update: (id: string, data: Partial<Current>) =>
        apiClient.patch(`/currents/${id}`, data).then(r => r.data),

    delete: (id: string) =>
        apiClient.delete(`/currents/${id}`).then(r => r.data),

    getLikes: (id: string) =>
        apiClient.get(`/currents/${id}/likes`).then(r => r.data),

    getShares: (id: string) =>
        apiClient.get(`/currents/${id}/shares`).then(r => r.data),

    getViews: (id: string) =>
        apiClient.get(`/currents/${id}/views`).then(r => r.data),

    getComments: (id: string) =>
        apiClient.get(`/currents/${id}/comments`).then(r => r.data),
};
