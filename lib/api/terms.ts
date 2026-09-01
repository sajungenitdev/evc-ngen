// lib/api/terms.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// ============================================================================
// Types
// ============================================================================

export interface Breadcrumb {
    label: string;
    link?: string;
    isActive?: boolean;
}

export interface Header {
    breadcrumbs: Breadcrumb[];
    imageUrl: string;
    title: string;
    description: string;
}

export interface Section {
    _id?: string;
    heading: string;
    content: string;
    order: number;
    isActive: boolean;
}

export interface TermsData {
    _id: string;
    header: Header;
    lastUpdated: string;
    sections: Section[];
    isActive: boolean;
    seo?: {
        metaTitle: string;
        metaDescription: string;
        metaKeywords: string;
    };
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

// ============================================================================
// API Service
// ============================================================================

export const termsAPI = {
    getActive: async (): Promise<ApiResponse<TermsData>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/terms`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                cache: 'no-store'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('❌ Error fetching Terms:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch Terms'
            };
        }
    },

    getAll: async (): Promise<ApiResponse<TermsData[]>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/terms/all`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('❌ Error fetching all Terms:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch Terms'
            };
        }
    },

    create: async (data: Partial<TermsData>): Promise<ApiResponse<TermsData>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/terms`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('❌ Error creating Terms:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to create Terms'
            };
        }
    },

    update: async (id: string, data: Partial<TermsData>): Promise<ApiResponse<TermsData>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/terms/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('❌ Error updating Terms:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to update Terms'
            };
        }
    },

    delete: async (id: string): Promise<ApiResponse<null>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/terms/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('❌ Error deleting Terms:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to delete Terms'
            };
        }
    },

    toggleStatus: async (id: string): Promise<ApiResponse<TermsData>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/terms/${id}/toggle`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('❌ Error toggling Terms status:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to toggle status'
            };
        }
    },

    uploadHeaderImage: async (id: string, file: File): Promise<ApiResponse<TermsData>> => {
        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch(`${API_BASE_URL}/terms/${id}/upload-header`, {
                method: 'POST',
                body: formData
            });
            return response.json();
        } catch (error) {
            console.error('❌ Error uploading header image:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to upload header image'
            };
        }
    },

    removeHeaderImage: async (id: string): Promise<ApiResponse<TermsData>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/terms/${id}/remove-header`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            return response.json();
        } catch (error) {
            console.error('❌ Error removing header image:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to remove header image'
            };
        }
    }
};

// ============================================================================
// Helper Functions
// ============================================================================

export const getTermsImageUrl = (imageUrl: string): string => {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        return imageUrl;
    }
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || 'http://localhost:5000';
    return `${baseUrl}${imageUrl}`;
};

export const filterActiveSections = <T extends { isActive?: boolean }>(items: T[]): T[] => {
    return items.filter(item => item.isActive !== false);
};