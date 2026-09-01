// lib/api/helpSupport.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// ============================================================================
// Types
// ============================================================================

export interface Social {
    _id?: string;
    name: string;
    link: string;
    icon?: string;
    isActive: boolean;
}

export interface SalesCard {
    status: string;
    title: string;
    highlightText: string;
    buttonText: string;
    phoneLink: string;
    imageUrl: string;
    isActive: boolean;
}

export interface TicketCard {
    description: string;
    linkText: string;
    link: string;
    imageUrl: string;
    isActive: boolean;
}

export interface SupportHubCard {
    description: string;
    linkText: string;
    link: string;
    imageUrl: string;
    isActive: boolean;
}

export interface ReviewCard {
    description: string;
    linkText: string;
    link: string;
    imageUrl: string;
    isActive: boolean;
}

export interface SocialCard {
    title: string;
    imageUrl: string;
    socials: Social[];
    isActive: boolean;
}

export interface HelpSupportData {
    _id: string;
    salesCard: SalesCard;
    ticketCard: TicketCard;
    supportHubCard: SupportHubCard;
    reviewCard: ReviewCard;
    socialCard: SocialCard;
    isActive: boolean;
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
// API Service
// ============================================================================

export const helpSupportAPI = {
    getActive: async (): Promise<ApiResponse<HelpSupportData>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/help-support`, {
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
            console.error('❌ Error fetching help support:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch help support'
            };
        }
    },

    getAll: async (): Promise<ApiResponse<HelpSupportData[]>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/help-support/all`, {
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
            console.error('❌ Error fetching all help support:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch help support'
            };
        }
    },

    create: async (data: Partial<HelpSupportData>): Promise<ApiResponse<HelpSupportData>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/help-support`, {
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
            console.error('❌ Error creating help support:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to create help support'
            };
        }
    },

    update: async (id: string, data: Partial<HelpSupportData>): Promise<ApiResponse<HelpSupportData>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/help-support/${id}`, {
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
            console.error('❌ Error updating help support:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to update help support'
            };
        }
    },

    delete: async (id: string): Promise<ApiResponse<null>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/help-support/${id}`, {
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
            console.error('❌ Error deleting help support:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to delete help support'
            };
        }
    },

    toggleStatus: async (id: string): Promise<ApiResponse<HelpSupportData>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/help-support/${id}/toggle`, {
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
            console.error('❌ Error toggling help support status:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to toggle status'
            };
        }
    },

    // Image upload methods
    uploadSalesImage: async (id: string, file: File): Promise<ApiResponse<HelpSupportData>> => {
        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch(`${API_BASE_URL}/help-support/${id}/upload-sales-image`, {
                method: 'POST',
                body: formData
            });
            return response.json();
        } catch (error) {
            console.error('❌ Error uploading sales image:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to upload sales image'
            };
        }
    },

    uploadTicketImage: async (id: string, file: File): Promise<ApiResponse<HelpSupportData>> => {
        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch(`${API_BASE_URL}/help-support/${id}/upload-ticket-image`, {
                method: 'POST',
                body: formData
            });
            return response.json();
        } catch (error) {
            console.error('❌ Error uploading ticket image:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to upload ticket image'
            };
        }
    },

    uploadSupportImage: async (id: string, file: File): Promise<ApiResponse<HelpSupportData>> => {
        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch(`${API_BASE_URL}/help-support/${id}/upload-support-image`, {
                method: 'POST',
                body: formData
            });
            return response.json();
        } catch (error) {
            console.error('❌ Error uploading support image:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to upload support image'
            };
        }
    },

    uploadReviewImage: async (id: string, file: File): Promise<ApiResponse<HelpSupportData>> => {
        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch(`${API_BASE_URL}/help-support/${id}/upload-review-image`, {
                method: 'POST',
                body: formData
            });
            return response.json();
        } catch (error) {
            console.error('❌ Error uploading review image:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to upload review image'
            };
        }
    },

    uploadSocialImage: async (id: string, file: File): Promise<ApiResponse<HelpSupportData>> => {
        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch(`${API_BASE_URL}/help-support/${id}/upload-social-image`, {
                method: 'POST',
                body: formData
            });
            return response.json();
        } catch (error) {
            console.error('❌ Error uploading social image:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to upload social image'
            };
        }
    },

    removeImage: async (id: string, cardType: string): Promise<ApiResponse<HelpSupportData>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/help-support/${id}/remove-image/${cardType}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            return response.json();
        } catch (error) {
            console.error('❌ Error removing image:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to remove image'
            };
        }
    }
};

// ============================================================================
// Helper Functions
// ============================================================================

export const getHelpImageUrl = (imageUrl: string): string => {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        return imageUrl;
    }
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || 'http://localhost:5000';
    return `${baseUrl}${imageUrl}`;
};