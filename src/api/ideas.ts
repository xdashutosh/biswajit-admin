import apiClient from './client';
import { PaginatedResponse, CommunityIdea } from '../types';

export const ideasApi = {
    getAll: (params?: { page?: number; limit?: number; category?: string; search?: string }) =>
        apiClient.get<PaginatedResponse<CommunityIdea>>('/ideas', { params }).then(r => r.data),

    getOne: (id: string) =>
        apiClient.get(`/ideas/${id}`).then(r => r.data),

    getStats: () =>
        apiClient.get('/ideas/stats').then(r => r.data),

    updateStatus: (id: string, data: { status: string; adminRemark?: string; officialUpdate?: string; impactScore?: number }) =>
        apiClient.patch(`/ideas/${id}/status`, data).then(r => r.data),

    delete: (id: string) =>
        apiClient.delete(`/ideas/${id}`).then(r => r.data),
};
