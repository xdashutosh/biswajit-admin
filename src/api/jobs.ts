import apiClient from './client';
import { PaginatedResponse, Job, ApiResponse } from '../types';

export const jobsApi = {
    getAll: (params?: { 
        page?: number; limit?: number; search?: string; category?: string; 
        type?: string; department?: string; is_featured?: boolean;
        job_class?: string; apply_method?: string;
    }) =>
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

    getAdminApplications: (params?: { page?: number; limit?: number; status?: string; job_id?: string; search?: string }) =>
        apiClient.get<PaginatedResponse<any>>('/jobs/applications/admin', { params }).then(r => r.data),

    updateApplicationStatus: (id: string, data: { status: string; admin_notes?: string }) =>
        apiClient.patch(`/jobs/applications/${id}/status`, data).then(r => r.data),

    getSuccessClaims: (params?: { page?: number; limit?: number; status?: string }) =>
        apiClient.get<ApiResponse<any>>('/jobs/success-claims/all', { params }).then(r => r.data),

    updateSuccessClaimStatus: (id: string, data: { status: string; admin_remark?: string }) =>
        apiClient.patch(`/jobs/success-claims/${id}/status`, data).then(r => r.data),
};
