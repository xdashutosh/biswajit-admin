import api from './client';

export interface Employee {
  id: string;
  name: string;
  email: string;
  role_id: string;
  role_name?: string;
  is_active: boolean;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

export interface EmployeesResponse {
  status: string;
  data: Employee[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface EmployeeResponse {
  status: string;
  data: Employee;
}

export const employeesApi = {
  getAll: async (params?: { page?: number; limit?: number; search?: string }) => {
    const response = await api.get('/employees', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/employees/${id}`);
    return response.data;
  },

  create: async (data: Partial<Employee> & { password?: string }) => {
    const response = await api.post('/employees', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Employee> & { password?: string }) => {
    const response = await api.put(`/employees/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/employees/${id}`);
    return response.data;
  },
};
