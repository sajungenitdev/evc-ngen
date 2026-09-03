// lib/api.ts
import { LoginCredentials, RegisterData, AuthResponse, User, PaginatedResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://evc-ngen-server.onrender.com/api';

class ApiService {
    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        try {
            const url = `${API_BASE_URL}${endpoint}`;
            console.log(`📡 ${options.method || 'GET'} ${url}`);

            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
            });

            // Get response as text first
            const text = await response.text();
            console.log('📦 Raw response:', text);

            // Try to parse as JSON
            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                console.error('❌ Failed to parse JSON:', text);
                throw new Error('Server returned invalid JSON');
            }

            // Check if response is OK
            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('❌ API Request Error:', error);
            throw error;
        }
    }

    // Auth endpoints
    auth = {
        login: (credentials: LoginCredentials): Promise<AuthResponse> => {
            return this.request('/auth/login', {
                method: 'POST',
                body: JSON.stringify(credentials),
            });
        },

        register: (data: RegisterData): Promise<AuthResponse> => {
            return this.request('/auth/register', {
                method: 'POST',
                body: JSON.stringify(data),
            });
        },

        getMe: (token: string): Promise<AuthResponse> => {
            return this.request('/auth/me', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
        },

        changePassword: (token: string, currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
            return this.request('/auth/change-password', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ currentPassword, newPassword }),
            });
        },
    };

    // User management endpoints (Admin only)
    users = {
        getAll: (token: string, params?: { page?: number; limit?: number; search?: string; role?: string }): Promise<PaginatedResponse<User>> => {
            const queryParams = new URLSearchParams();
            if (params?.page) queryParams.append('page', String(params.page));
            if (params?.limit) queryParams.append('limit', String(params.limit));
            if (params?.search) queryParams.append('search', params.search);
            if (params?.role) queryParams.append('role', params.role);

            const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
            return this.request(`/auth/users${query}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
        },

        getById: (token: string, id: string): Promise<{ success: boolean; data: User }> => {
            return this.request(`/auth/users/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
        },

        create: (token: string, data: RegisterData): Promise<{ success: boolean; data: User }> => {
            return this.request('/auth/users', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });
        },

        update: (token: string, id: string, data: Partial<RegisterData & { jobTitle: string; phone: string; company: string }>): Promise<{ success: boolean; data: User }> => {
            return this.request(`/auth/users/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });
        },

        delete: (token: string, id: string): Promise<{ success: boolean; message: string }> => {
            return this.request(`/auth/users/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
        },

        toggleStatus: (token: string, id: string): Promise<{ success: boolean; data: User }> => {
            return this.request(`/auth/users/${id}/toggle`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
        },
    };
}

export const api = new ApiService();