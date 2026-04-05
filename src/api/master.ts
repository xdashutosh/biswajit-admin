import apiClient from './client';
import { PaginatedResponse, Booth, Constituency, PoliticalParty, District, PoliticalPartyLeader } from '../types';

export const masterApi = {
    // Districts
    getDistricts: (params?: { page?: number; limit?: number; search?: string }) =>
        apiClient.get<PaginatedResponse<District>>('/master/districts', { params }).then(r => r.data),
    createDistrict: (data: Partial<District>) => apiClient.post('/master/districts', data).then(r => r.data),
    updateDistrict: (id: string, data: Partial<District>) => apiClient.patch(`/master/districts/${id}`, data).then(r => r.data),
    deleteDistrict: (id: string) => apiClient.delete(`/master/districts/${id}`).then(r => r.data),

    // Booths
    getBooths: (params?: { page?: number; limit?: number; search?: string; constituency_id?: string }) =>
        apiClient.get<PaginatedResponse<Booth>>('/master/booths', { params }).then(r => r.data),
    createBooth: (data: Partial<Booth>) => apiClient.post('/master/booths', data).then(r => r.data),
    updateBooth: (id: string, data: Partial<Booth>) => apiClient.patch(`/master/booths/${id}`, data).then(r => r.data),
    deleteBooth: (id: string) => apiClient.delete(`/master/booths/${id}`).then(r => r.data),
    bulkUploadBooths: (data: any[]) =>
        apiClient.post('/master/booths/bulk-upload', data).then(r => r.data),

    // Constituencies
    getConstituencies: (params?: { page?: number; limit?: number; search?: string; districtId?: string }) =>
        apiClient.get<PaginatedResponse<Constituency>>('/master/constituencies', { params }).then(r => r.data),
    createConstituency: (data: Partial<Constituency>) => apiClient.post('/master/constituencies', data).then(r => r.data),
    updateConstituency: (id: string, data: Partial<Constituency>) => apiClient.patch(`/master/constituencies/${id}`, data).then(r => r.data),
    deleteConstituency: (id: string) => apiClient.delete(`/master/constituencies/${id}`).then(r => r.data),

    // Political Parties
    getParties: (params?: { page?: number; limit?: number; search?: string }) =>
        apiClient.get<PaginatedResponse<PoliticalParty>>('/master/political-parties', { params }).then(r => r.data),
    createParty: (data: Partial<PoliticalParty>) => apiClient.post('/master/political-parties', data).then(r => r.data),
    updateParty: (id: string, data: Partial<PoliticalParty>) => apiClient.patch(`/master/political-parties/${id}`, data).then(r => r.data),
    deleteParty: (id: string) => apiClient.delete(`/master/political-parties/${id}`).then(r => r.data),

    // Political Party Leaders
    getPartyLeaders: (partyId: string) =>
        apiClient.get<PoliticalPartyLeader[]>(`/master/political-parties/${partyId}/leaders`).then(r => r.data),
    createPartyLeader: (data: Partial<PoliticalPartyLeader>) => apiClient.post('/master/political-party-leaders', data).then(r => r.data),
    updatePartyLeader: (id: string, data: Partial<PoliticalPartyLeader>) => apiClient.patch(`/master/political-party-leaders/${id}`, data).then(r => r.data),
    deletePartyLeader: (id: string) => apiClient.delete(`/master/political-party-leaders/${id}`).then(r => r.data),
};
