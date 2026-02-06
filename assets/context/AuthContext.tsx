import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, User } from '../services/api';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    register: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshUser = async () => {
        const { data } = await api.getCurrentUser();
        setUser(data?.user || null);
    };

    useEffect(() => {
        const checkAuth = async () => {
            await refreshUser();
            setLoading(false);
        };
        checkAuth();
    }, []);

    const login = async (email: string, password: string) => {
        const { data, error } = await api.login(email, password);
        if (error) {
            return { success: false, error };
        }
        await refreshUser();
        return { success: true };
    };

    const register = async (email: string, password: string) => {
        const { data, error } = await api.register(email, password);
        if (error) {
            return { success: false, error };
        }
        return { success: true };
    };

    const logout = async () => {
        await api.logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};
