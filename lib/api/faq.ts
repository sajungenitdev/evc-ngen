// lib/api/faq.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://evc-ngen-server.onrender.com/api';

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

export interface FaqItem {
    _id?: string;
    question: string;
    answer: string;
    category: string;
    order: number;
    isActive: boolean;
}

export interface CtaButton {
    text: string;
    link: string;
    isActive: boolean;
}

export interface CtaBanner {
    title: string;
    description: string;
    primaryButton: CtaButton;
    secondaryButton: CtaButton;
    isActive: boolean;
}

export interface FaqData {
    _id: string;
    header: Header;
    categories: string[];
    faqs: FaqItem[];
    ctaBanner: CtaBanner;
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

export const faqAPI = {
    getActive: async (): Promise<ApiResponse<FaqData>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/faq`, {
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
            console.error('❌ Error fetching FAQ:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch FAQ'
            };
        }
    },

    getAll: async (): Promise<ApiResponse<FaqData[]>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/faq/all`, {
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
            console.error('❌ Error fetching all FAQ:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch FAQ'
            };
        }
    },

    create: async (data: Partial<FaqData>): Promise<ApiResponse<FaqData>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/faq`, {
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
            console.error('❌ Error creating FAQ:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to create FAQ'
            };
        }
    },

    update: async (id: string, data: Partial<FaqData>): Promise<ApiResponse<FaqData>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/faq/${id}`, {
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
            console.error('❌ Error updating FAQ:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to update FAQ'
            };
        }
    },

    delete: async (id: string): Promise<ApiResponse<null>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/faq/${id}`, {
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
            console.error('❌ Error deleting FAQ:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to delete FAQ'
            };
        }
    },

    toggleStatus: async (id: string): Promise<ApiResponse<FaqData>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/faq/${id}/toggle`, {
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
            console.error('❌ Error toggling FAQ status:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to toggle status'
            };
        }
    },

    uploadHeaderImage: async (id: string, file: File): Promise<ApiResponse<FaqData>> => {
        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch(`${API_BASE_URL}/faq/${id}/upload-header`, {
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

    removeHeaderImage: async (id: string): Promise<ApiResponse<FaqData>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/faq/${id}/remove-header`, {
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

export const getFaqImageUrl = (imageUrl: string): string => {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        return imageUrl;
    }
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || 'https://evc-ngen-server.onrender.com';
    return `${baseUrl}${imageUrl}`;
};

export const filterActiveFaqs = <T extends { isActive?: boolean }>(items: T[]): T[] => {
    return items.filter(item => item.isActive !== false);
};

export const getUniqueCategories = (faqs: FaqItem[]): string[] => {
    const categories = faqs.map(faq => faq.category);
    return ['All', ...new Set(categories)];
};