import apiClient from './client';
import { Podcast } from '../types';

export const podcastsApi = {
    getAll: () =>
        apiClient.get('/podcasts').then(r => r.data),

    getOne: (id: string) =>
        apiClient.get(`/podcasts/${id}`).then(r => r.data),

    create: (data: Partial<Podcast>) =>
        apiClient.post('/podcasts', data).then(r => r.data),

    update: (id: string, data: Partial<Podcast>) =>
        apiClient.patch(`/podcasts/${id}`, data).then(r => r.data),

    delete: (id: string) =>
        apiClient.delete(`/podcasts/${id}`).then(r => r.data),
};
