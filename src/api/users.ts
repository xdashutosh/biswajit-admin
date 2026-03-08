import apiClient from './client';
import { PaginatedResponse, User } from '../types';

export const usersApi = {
    getAll: (params?: { page?: number; limit?: number; search?: string }) =>
        apiClient.get<PaginatedResponse<User>>('/users', { params }).then(r => r.data),

    getOne: (id: number) =>
        apiClient.get(`/users/${id}`).then(r => r.data),

    create: (data: Partial<User> & { password?: string }) =>
        apiClient.post('/users', data).then(r => r.data),

    update: (id: number, data: Partial<User>) =>
        apiClient.put(`/users/${id}`, data).then(r => r.data),

    delete: (id: number) =>
        apiClient.delete(`/users/${id}`).then(r => r.data),
};
