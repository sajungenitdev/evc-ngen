// types/index.ts
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

export interface AuthResponse {
    success: boolean;
    message?: string;
    token?: string;
    data?: User;
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

export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    pagination: {
        total: number;
        page: number;
        pages: number;
        limit: number;
    };
}