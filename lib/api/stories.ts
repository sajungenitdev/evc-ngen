// lib/api/stories.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://evc-ngen-server.onrender.com/api';

// ============================================================================
// Types
// ============================================================================

export interface Category {
    _id?: string;
    title: string;
    imageUrl: string;
    link: string;
    order: number;
    isActive: boolean;
}

export interface MainStory {
    quote: string;
    linkText: string;
    link: string;
    imageUrl: string;
    isActive: boolean;
}

export interface StoriesData {
    _id: string;
    heading: string;
    subtitle: string;
    mainStory: MainStory;
    categories: Category[];
    isActive: boolean;
    backgroundColor: string;
    textColor: string;
    sectionId: string;
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
// Helper to get auth token
// ============================================================================

const getToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
};

// ============================================================================
// API Service
// ============================================================================

export const storiesAPI = {
    getActive: async (): Promise<ApiResponse<StoriesData>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/stories`, {
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
            console.error('❌ Error fetching stories:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch stories'
            };
        }
    },

    getAll: async (): Promise<ApiResponse<StoriesData[]>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/stories/all`, {
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
            console.error('❌ Error fetching all stories:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch stories'
            };
        }
    },

    // ✅ JSON create (no files)
    create: async (data: Partial<StoriesData>): Promise<ApiResponse<StoriesData>> => {
        try {
            const token = getToken();
            const response = await fetch(`${API_BASE_URL}/stories`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('❌ Error creating stories:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to create stories'
            };
        }
    },

    // ✅ NEW: Create with FormData (for file uploads)
    createWithFormData: async (formData: FormData): Promise<ApiResponse<StoriesData>> => {
        try {
            const token = getToken();
            const response = await fetch(`${API_BASE_URL}/stories`, {
                method: 'POST',
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('❌ Error creating stories with FormData:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to create stories'
            };
        }
    },

    // ✅ JSON update (no files)
    update: async (id: string, data: Partial<StoriesData>): Promise<ApiResponse<StoriesData>> => {
        try {
            const token = getToken();
            const response = await fetch(`${API_BASE_URL}/stories/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('❌ Error updating stories:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to update stories'
            };
        }
    },

    // ✅ NEW: Update with FormData (for file uploads)
    updateWithFormData: async (id: string, formData: FormData): Promise<ApiResponse<StoriesData>> => {
        try {
            const token = getToken();
            const response = await fetch(`${API_BASE_URL}/stories/${id}`, {
                method: 'PUT',
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('❌ Error updating stories with FormData:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to update stories'
            };
        }
    },

    delete: async (id: string): Promise<ApiResponse<null>> => {
        try {
            const token = getToken();
            const response = await fetch(`${API_BASE_URL}/stories/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('❌ Error deleting stories:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to delete stories'
            };
        }
    },

    toggleStatus: async (id: string): Promise<ApiResponse<StoriesData>> => {
        try {
            const token = getToken();
            const response = await fetch(`${API_BASE_URL}/stories/${id}/toggle`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('❌ Error toggling stories status:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to toggle status'
            };
        }
    },

    // Image upload methods - Single image uploads
    uploadMainImage: async (id: string, file: File): Promise<ApiResponse<StoriesData>> => {
        try {
            const token = getToken();
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch(`${API_BASE_URL}/stories/${id}/upload-main-image`, {
                method: 'POST',
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: formData
            });
            return response.json();
        } catch (error) {
            console.error('❌ Error uploading main image:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to upload main image'
            };
        }
    },

    uploadCategoryImage: async (id: string, categoryIndex: number, file: File): Promise<ApiResponse<StoriesData>> => {
        try {
            const token = getToken();
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch(`${API_BASE_URL}/stories/${id}/upload-category-image/${categoryIndex}`, {
                method: 'POST',
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: formData
            });
            return response.json();
        } catch (error) {
            console.error('❌ Error uploading category image:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to upload category image'
            };
        }
    },

    removeMainImage: async (id: string): Promise<ApiResponse<StoriesData>> => {
        try {
            const token = getToken();
            const response = await fetch(`${API_BASE_URL}/stories/${id}/remove-main-image`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });
            return response.json();
        } catch (error) {
            console.error('❌ Error removing main image:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to remove main image'
            };
        }
    },

    removeCategoryImage: async (id: string, categoryIndex: number): Promise<ApiResponse<StoriesData>> => {
        try {
            const token = getToken();
            const response = await fetch(`${API_BASE_URL}/stories/${id}/remove-category-image/${categoryIndex}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });
            return response.json();
        } catch (error) {
            console.error('❌ Error removing category image:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to remove category image'
            };
        }
    }
};

// ============================================================================
// Helper Functions
// ============================================================================

export const getStoriesImageUrl = (imageUrl: string): string => {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        return imageUrl;
    }
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || 'https://evc-ngen-server.onrender.com';
    return `${baseUrl}${imageUrl}`;
};

export const filterActiveCategories = <T extends { isActive?: boolean }>(items: T[]): T[] => {
    return items.filter(item => item.isActive !== false);
};