import apiClient from './client';

export interface AdminNotification {
    id: string;
    type: string;
    title: string;
    message: string;
    module: string;
    reference_id: string | null;
    employee_name: string | null;
    employee_email: string | null;
    is_read: boolean;
    created_at: string;
}

export const notificationsApi = {
    getUnread: () => apiClient.get<{ status: string; data: AdminNotification[] }>('/admin-notifications/unread'),
    getRecent: () => apiClient.get<{ status: string; data: AdminNotification[] }>('/admin-notifications/recent'),
    markAsRead: (id: string) => apiClient.patch(`/admin-notifications/${id}/read`),
    markAllAsRead: () => apiClient.patch('/admin-notifications/all/read')
};
