import apiClient from './client';
import { Podcast } from '../types';

export const podcastsApi = {
    getAll: (params?: any) =>
        apiClient.get('/podcasts', { params }).then(r => r.data),

    getOne: (id: string) =>
        apiClient.get(`/podcasts/${id}`).then(r => r.data),

    create: (data: Partial<Podcast>) =>
        apiClient.post('/podcasts', data).then(r => r.data),

    update: (id: string, data: Partial<Podcast>) =>
        apiClient.patch(`/podcasts/${id}`, data).then(r => r.data),

    delete: (id: string) =>
        apiClient.delete(`/podcasts/${id}`).then(r => r.data),

    getLikes: (id: string) =>
        apiClient.get(`/podcasts/${id}/likes`).then(r => r.data),

    getComments: (id: string) =>
        apiClient.get(`/podcasts/${id}/comments`).then(r => r.data),

    getPlays: (id: string) =>
        apiClient.get(`/podcasts/${id}/plays`).then(r => r.data),

    play: (id: string) =>
        apiClient.post(`/podcasts/${id}/play`).then(r => r.data),
};
