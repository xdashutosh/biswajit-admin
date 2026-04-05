import apiClient from './client';
import { PaginatedResponse, GreenChallenge, GreenChallengeParticipant, ApiResponse } from '../types';

export const greenApi = {
    getAll: (params?: { page?: number; limit?: number; search?: string; category?: string; difficulty?: string; admin?: boolean }) =>
        apiClient.get<PaginatedResponse<GreenChallenge>>('/green/challenges', { params: { ...params, admin: params?.admin ? 'true' : undefined } }).then(r => r.data),

    getOne: (id: string) =>
        apiClient.get<ApiResponse<GreenChallenge>>(`/green/challenges/${id}`).then(r => r.data),

    getStats: () =>
        apiClient.get('/green/stats').then(r => r.data),

    create: (data: Partial<GreenChallenge>) =>
        apiClient.post('/green/challenges', data).then(r => r.data),

    update: (id: string, data: Partial<GreenChallenge>) =>
        apiClient.patch(`/green/challenges/${id}`, data).then(r => r.data),

    delete: (id: string) =>
        apiClient.delete(`/green/challenges/${id}`).then(r => r.data),

    getParticipants: (challengeId: string) =>
        apiClient.get<ApiResponse<GreenChallengeParticipant[]>>(`/green/challenges/${challengeId}/participants`).then(r => r.data),

    updateParticipant: (id: string, data: { status: string; impact_value?: number; admin_remark?: string }) =>
        apiClient.patch(`/green/participants/${id}`, data).then(r => r.data),
};
