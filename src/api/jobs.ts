import apiClient from './client';
import { PaginatedResponse, Job } from '../types';

export const jobsApi = {
    getAll: (params?: { page?: number; limit?: number; search?: string }) =>
        apiClient.get<PaginatedResponse<Job>>('/jobs', { params }).then(r => r.data),

    getOne: (id: string) =>
        apiClient.get(`/jobs/${id}`).then(r => r.data),

    create: (data: Partial<Job>) =>
        apiClient.post('/jobs', data).then(r => r.data),

    update: (id: string, data: Partial<Job>) =>
        apiClient.patch(`/jobs/${id}`, data).then(r => r.data),

    delete: (id: string) =>
        apiClient.delete(`/jobs/${id}`).then(r => r.data),

    getApplications: () =>
        apiClient.get('/jobs/applications/me').then(r => r.data),
};
