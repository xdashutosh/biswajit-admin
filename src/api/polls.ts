import apiClient from './client';
import { Poll } from '../types';

export const pollsApi = {
    getAll: () =>
        apiClient.get('/polls').then(r => r.data),

    getPast: () =>
        apiClient.get('/polls/past').then(r => r.data),

    getOne: (id: string) =>
        apiClient.get(`/polls/${id}`).then(r => r.data),

    create: (data: { question: string; options: string[]; endDate: string }) =>
        apiClient.post('/polls', data).then(r => r.data),
};
