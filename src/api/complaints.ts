import apiClient from './client';
import { PaginatedResponse, Complaint } from '../types';

export const complaintsApi = {
    getAll: (params?: { page?: number; limit?: number; status?: string; priority?: string; search?: string }) =>
        apiClient.get<any>('/complaints', { params }).then(r => r.data),

    getOne: (id: string) =>
        apiClient.get<any>(`/complaints/${id}`).then(r => r.data),

    getStats: () =>
        apiClient.get<any>('/complaints/stats').then(r => r.data),

    update: (id: string, data: Partial<Complaint>) =>
        apiClient.patch<any>(`/complaints/${id}`, data).then(r => r.data),

    updateStatus: (id: string, status: string) =>
        apiClient.patch<any>(`/complaints/${id}/status`, { status }).then(r => r.data),

    delete: (id: string) =>
        apiClient.delete<any>(`/complaints/${id}`).then(r => r.data),
};
