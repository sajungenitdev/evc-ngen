// contexts/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

// --- Types ---
export interface User {
    _id: string;
    name: string;
    email: string;
    role: 'admin' | 'manager' | 'technician' | 'user';
    avatar?: string;
    phone?: string;
    company?: string;
    jobTitle?: string;
    isActive: boolean;
    isVerified: boolean;
    loginCount: number;
    lastLogin?: string;
    lastActive?: string;
    preferences?: {
        notifications: {
            email: boolean;
            push: boolean;
            sms: boolean;
        };
        language: string;
        timezone: string;
    };
    address?: {
        street: string;
        city: string;
        state: string;
        country: string;
        zipCode: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    role?: 'admin' | 'manager' | 'technician' | 'user';
    phone?: string;
    company?: string;
    jobTitle?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    isAdmin: boolean;
    login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string; data?: User }>;
    register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message?: string; error?: string }>;
}

// --- Context ---
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- Provider ---
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();
    const isMounted = useRef(true);

    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    // Initialize auth - runs once on mount
    useEffect(() => {
        const initAuth = async () => {
            try {
                console.log('🔍 Initializing auth...');

                // Check localStorage
                const savedToken = localStorage.getItem('token');
                const savedUser = localStorage.getItem('user');

                console.log('📦 Token exists?', !!savedToken);
                console.log('👤 User exists?', !!savedUser);

                if (savedToken && savedUser) {
                    try {
                        const parsedUser = JSON.parse(savedUser);

                        // Set state from localStorage immediately
                        setToken(savedToken);
                        setUser(parsedUser);
                        setIsAuthenticated(true);
                        console.log('✅ Auth set from localStorage, user:', parsedUser.name);

                        // Verify with backend in background (don't wait for it)
                        api.auth.getMe(savedToken)
                            .then((response) => {
                                if (response.success && response.data && isMounted.current) {
                                    setUser(response.data);
                                    setIsAuthenticated(true);
                                    localStorage.setItem('user', JSON.stringify(response.data));
                                    console.log('✅ Auth verified with backend');
                                }
                            })
                            .catch((error) => {
                                console.log('⚠️ Backend verification failed, using cached data');
                            });
                    } catch (parseError) {
                        console.error('Error parsing user data:', parseError);
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        setIsAuthenticated(false);
                        setUser(null);
                        setToken(null);
                    }
                } else {
                    console.log('ℹ️ No saved auth data found');
                    setIsAuthenticated(false);
                }
            } catch (error) {
                console.error('Auth init error:', error);
                setIsAuthenticated(false);
            } finally {
                // ✅ ALWAYS set loading to false
                if (isMounted.current) {
                    setIsLoading(false);
                    console.log('✅ Auth loading complete. isAuthenticated:', isAuthenticated);
                }
            }
        };

        initAuth();
    }, []);

    const login = async (credentials: LoginCredentials) => {
        try {
            console.log('🔐 Attempting login...');
            setIsLoading(true);

            const response = await api.auth.login(credentials);
            console.log('📦 Login response:', response);

            if (response.success && response.token && response.data) {
                localStorage.setItem('token', response.token);
                localStorage.setItem('user', JSON.stringify(response.data));

                setToken(response.token);
                setUser(response.data);
                setIsAuthenticated(true);

                console.log('✅ Login successful!');
                return { success: true, data: response.data };
            } else {
                return { success: false, error: response.message || 'Login failed' };
            }
        } catch (error) {
            console.error('❌ Login error:', error);
            return { success: false, error: error instanceof Error ? error.message : 'Login failed' };
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (data: RegisterData) => {
        try {
            const response = await api.auth.register(data);
            if (response.success && response.token && response.data) {
                localStorage.setItem('token', response.token);
                localStorage.setItem('user', JSON.stringify(response.data));
                setToken(response.token);
                setUser(response.data);
                setIsAuthenticated(true);
                return { success: true };
            } else {
                return { success: false, error: response.message || 'Registration failed' };
            }
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Registration failed' };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
        router.push('/login');
    };

    const changePassword = async (currentPassword: string, newPassword: string) => {
        if (!token) {
            return { success: false, error: 'Not authenticated' };
        }
        try {
            const response = await api.auth.changePassword(token, currentPassword, newPassword);
            if (response.success) {
                return { success: true, message: response.message };
            } else {
                return { success: false, error: response.message || 'Failed to change password' };
            }
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Failed to change password' };
        }
    };

    const value: AuthContextType = {
        user,
        token,
        isLoading,
        isAuthenticated,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        changePassword,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};