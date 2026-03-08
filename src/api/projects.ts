import apiClient from './client';
import { PaginatedResponse, DevelopmentProject } from '../types';

export const projectsApi = {
    getAll: (params?: { page?: number; limit?: number; search?: string }) =>
        apiClient.get<PaginatedResponse<DevelopmentProject>>('/projects', { params }).then(r => r.data),

    getOne: (id: string) =>
        apiClient.get(`/projects/${id}`).then(r => r.data),

    create: (data: Partial<DevelopmentProject>) =>
        apiClient.post('/projects', data).then(r => r.data),

    update: (id: string, data: Partial<DevelopmentProject>) =>
        apiClient.patch(`/projects/${id}`, data).then(r => r.data),

    delete: (id: string) =>
        apiClient.delete(`/projects/${id}`).then(r => r.data),
};
