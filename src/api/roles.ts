import api from './client';

export interface RolePermission {
  module: string;
  can_create: boolean;
  can_read: boolean;
  can_update: boolean;
  can_delete: boolean;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  permissions?: RolePermission[];
}

export interface RolesResponse {
  status: string;
  data: Role[];
}

export interface RoleResponse {
  status: string;
  data: Role;
}

export const rolesApi = {
  getAll: async () => {
    const response = await api.get('/roles');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/roles/${id}`);
    return response.data;
  },

  create: async (data: Partial<Role>) => {
    const response = await api.post('/roles', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Role>) => {
    const response = await api.put(`/roles/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/roles/${id}`);
    return response.data;
  },
};
