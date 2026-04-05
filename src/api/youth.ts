import apiClient from './client';
import { PaginatedResponse, YouthEvent, YouthInternship, YouthEventRegistration, YouthInternshipApplication } from '../types';

export const youthApi = {
    // Events
    getEvents: (params?: { page?: number; limit?: number; search?: string }) =>
        apiClient.get<PaginatedResponse<YouthEvent>>('/youth/events', { params }).then(r => r.data),
    getEventStats: () => apiClient.get('/youth/events/stats').then(r => r.data),
    getEvent: (id: string) => apiClient.get(`/youth/events/${id}`).then(r => r.data),
    getRegistrants: (eventId: string) => apiClient.get(`/youth/events/${eventId}/registrants`).then(r => r.data),
    markAttendance: (eventId: string, userId: number, status: string, remark?: string) => 
        apiClient.patch(`/youth/events/${eventId}/attendance`, { user_id: userId, status, remark }).then(r => r.data),
    createEvent: (data: Partial<YouthEvent>) => apiClient.post('/youth/events', data).then(r => r.data),
    updateEvent: (id: string, data: Partial<YouthEvent>) => apiClient.patch(`/youth/events/${id}`, data).then(r => r.data),
    deleteEvent: (id: string) => apiClient.delete(`/youth/events/${id}`).then(r => r.data),

    getEventRegistrations: (eventId: string, params?: { page?: number; limit?: number }) =>
        apiClient.get<PaginatedResponse<YouthEventRegistration>>(`/youth/events/${eventId}/registrations`, { params }).then(r => r.data),

    // Internships
    getInternships: (params?: { page?: number; limit?: number; search?: string; type?: string }) =>
        apiClient.get<PaginatedResponse<YouthInternship>>('/youth/internships', { params }).then(r => r.data),
    getInternshipStats: () => apiClient.get('/youth/internships/stats').then(r => r.data),
    getInternship: (id: string) => apiClient.get(`/youth/internships/${id}`).then(r => r.data),
    createInternship: (data: Partial<YouthInternship>) => apiClient.post('/youth/internships', data).then(r => r.data),
    updateInternship: (id: string, data: Partial<YouthInternship>) => apiClient.patch(`/youth/internships/${id}`, data).then(r => r.data),
    deleteInternship: (id: string) => apiClient.delete(`/youth/internships/${id}`).then(r => r.data),

    getInternshipApplications: (internshipId: string, params?: { page?: number; limit?: number }) =>
        apiClient.get<PaginatedResponse<YouthInternshipApplication>>(`/youth/internships/${internshipId}/applications`, { params }).then(r => r.data),
    updateApplicationStatus: (internshipId: string, userId: number, status: string, remark?: string) => 
        apiClient.patch(`/youth/internships/${internshipId}/applications`, { user_id: userId, status, remark }).then(r => r.data),
};
