// lib/api/foundation.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface FoundationItem {
    _id?: string;
    title: string;
    description: string;
    bgClass: string;
    imageUrl: string;
    imageAlt: string;
    order: number;
    isActive: boolean;
}

export interface FoundationData {
    _id: string;
    heading: string;
    subtitle: string;
    items: FoundationItem[];
    isActive: boolean;
    backgroundColor: string;
    textColor: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    count?: number;
    error?: string;
}

export const foundationAPI = {
    // Get active foundation
    getActive: async (): Promise<ApiResponse<FoundationData>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/foundation`);
            return response.json();
        } catch (error) {
            console.error('Error fetching foundation:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch foundation'
            };
        }
    },

    // Get all foundation sections
    getAll: async (): Promise<ApiResponse<FoundationData[]>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/foundation/all`);
            return response.json();
        } catch (error) {
            console.error('Error fetching foundations:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch foundations'
            };
        }
    },

    // Create foundation
    create: async (data: Partial<FoundationData>): Promise<ApiResponse<FoundationData>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/foundation`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            return response.json();
        } catch (error) {
            console.error('Error creating foundation:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to create foundation'
            };
        }
    },

    // Update foundation
    update: async (id: string, data: Partial<FoundationData>): Promise<ApiResponse<FoundationData>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/foundation/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            return response.json();
        } catch (error) {
            console.error('Error updating foundation:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to update foundation'
            };
        }
    },

    // Delete foundation
    delete: async (id: string): Promise<ApiResponse<null>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/foundation/${id}`, {
                method: 'DELETE'
            });
            return response.json();
        } catch (error) {
            console.error('Error deleting foundation:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to delete foundation'
            };
        }
    },

    // Toggle foundation status
    toggleStatus: async (id: string): Promise<ApiResponse<FoundationData>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/foundation/${id}/toggle`, {
                method: 'PUT'
            });
            return response.json();
        } catch (error) {
            console.error('Error toggling foundation status:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to toggle status'
            };
        }
    },

    // Upload foundation item image
    uploadImage: async (id: string, itemIndex: number, file: File): Promise<ApiResponse<FoundationData>> => {
        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch(`${API_BASE_URL}/foundation/${id}/upload-image/${itemIndex}`, {
                method: 'POST',
                body: formData
            });
            return response.json();
        } catch (error) {
            console.error('Error uploading image:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to upload image'
            };
        }
    }
};