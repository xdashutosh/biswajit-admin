import apiClient from './client';
import { Letter } from '../types';

export const lettersApi = {
    getAll: (params?: any) =>
        apiClient.get('/letters', { params }).then(r => r.data),

    getOne: (id: string) =>
        apiClient.get(`/letters/${id}`).then(r => r.data),

    respond: (id: string, data: { response: string; status: string }) =>
        apiClient.patch(`/letters/${id}`, data).then(r => r.data),
};
