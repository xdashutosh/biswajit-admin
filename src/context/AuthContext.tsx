import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiClient from '../api/client';
import { ApiResponse } from '../types';

export interface Employee {
    id: string;
    name: string;
    email: string;
    role_id: string;
    role_name: string;
    is_super_admin: boolean;
    permissions: Record<string, { can_create: boolean; can_read: boolean; can_update: boolean; can_delete: boolean }>;
}

interface LoginData {
    token: string;
    employee: Employee;
}

interface AuthContextType {
    user: Employee | null;
    isAuthenticated: boolean;
    isSuperAdmin: boolean;
    isAdmin: boolean;
    hasPermission: (module: string, action: 'can_create' | 'can_read' | 'can_update' | 'can_delete') => boolean;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<Employee | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedUser = localStorage.getItem('admin_user');
        const savedToken = localStorage.getItem('admin_token');
        if (savedUser && savedToken) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (e) {
                localStorage.removeItem('admin_user');
                localStorage.removeItem('admin_token');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            const response = await apiClient.post<ApiResponse<LoginData>>('/auth/login/admin', { email, password });

            if (response.data.status === 'success') {
                const { token, employee: employeeData } = response.data.data;
                localStorage.setItem('admin_token', token);
                // Also setting regular token for standard requests if needed
                localStorage.setItem('token', token); 
                localStorage.setItem('admin_user', JSON.stringify(employeeData));
                setUser(employeeData);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Login failed:', error);
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('token');
        localStorage.removeItem('admin_user');
        setUser(null);
    };

    const isSuperAdmin = user?.is_super_admin || false;
    const isAdmin = isSuperAdmin || (user?.role_name === 'Admin');

    const hasPermission = (module: string, action: 'can_create' | 'can_read' | 'can_update' | 'can_delete') => {
        if (!user) return false;
        if (user.is_super_admin) return true;
        
        const modPerms = user.permissions?.[module];
        if (!modPerms) return false;
        
        return modPerms[action] === true;
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            isSuperAdmin,
            isAdmin,
            hasPermission,
            login,
            logout
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}

