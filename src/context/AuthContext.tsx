import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiClient from '../api/client';
import { ApiResponse } from '../types';

interface AdminUser {
    user_id: number;
    user_name: string;
    email: string;
    role_id: number;
}

interface LoginData {
    token: string;
    user: AdminUser;
}

interface AuthContextType {
    user: AdminUser | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    isEditor: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AdminUser | null>(null);
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
                const { token, user: userData } = response.data.data;
                localStorage.setItem('admin_token', token);
                localStorage.setItem('admin_user', JSON.stringify(userData));
                setUser(userData);
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
        localStorage.removeItem('admin_user');
        setUser(null);
    };

    // Based on user provided example, 0 seems to be Admin
    // In types/index.ts, 1 is Admin. I will check for both or follow the API example.
    const isAdmin = user?.role_id === 0 || user?.role_id === 1;
    const isEditor = user?.role_id === 2;

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            isAdmin,
            isEditor,
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
