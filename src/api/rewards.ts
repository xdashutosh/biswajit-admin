import apiClient from './client';
import { PaginatedResponse, RewardPointHistory, RewardConfiguration, UserMilestone, RewardMilestone } from '../types';

export const rewardsApi = {
    getAll: (params?: { page?: number; limit?: number; user_id?: number }) =>
        apiClient.get<PaginatedResponse<RewardPointHistory> | RewardPointHistory[]>('/rewards/history', { params }).then(r => r.data),
    
    // Admin manual points
    addPoints: (data: { user_id: number; points: number; reason: string }) =>
        apiClient.post('/rewards/add', data).then(r => r.data),

    // Configurations
    getConfigurations: () => 
        apiClient.get<{status: string; data: RewardConfiguration[]}>('/rewards/admin/configurations').then(r => r.data.data),
    
    upsertConfiguration: (data: Partial<RewardConfiguration>) =>
        apiClient.post<{status: string; data: RewardConfiguration}>('/rewards/admin/configurations', data).then(r => r.data.data),

    // Milestones Config
    getMilestoneConfigs: () =>
        apiClient.get<{status: string; data: RewardMilestone[]}>('/rewards/admin/milestones/configs').then(r => r.data.data),
    
    upsertMilestoneConfig: (data: Partial<RewardMilestone>) =>
        apiClient.post<{status: string; data: RewardMilestone}>('/rewards/admin/milestones/configs', data).then(r => r.data.data),

    // Earned Milestones
    getAllMilestones: () =>
        apiClient.get<{status: string; data: UserMilestone[]}>('/rewards/admin/milestones/earned').then(r => r.data.data),

    getEarnedMilestones: (userId: number) =>
        apiClient.get<{status: string; data: UserMilestone[] & any[]}>(`/rewards/admin/milestones/earned/${userId}`).then(r => r.data.data),

    syncTags: () =>
        apiClient.post<{status: string; message: string}>('/rewards/admin/sync-tags').then(r => r.data),
};
