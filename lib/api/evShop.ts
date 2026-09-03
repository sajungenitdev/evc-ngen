// lib/api/evShop.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://evc-ngen-server.onrender.com/api';

// ============================================================================
// Types
// ============================================================================

export interface ShopItem {
    _id?: string;
    title: string;
    buttonText: string;
    link: string;
    bgClass: string;
    imageUrl: string;
    imageFile?: string;
    order: number;
    isActive: boolean;
}

export interface ViewAllButton {
    text: string;
    link: string;
    isActive: boolean;
}

export interface EvShopData {
    _id: string;
    heading: string;
    items: ShopItem[];
    viewAllButton: ViewAllButton;
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
// API Service
// ============================================================================

export const evShopAPI = {
    getActive: async (): Promise<ApiResponse<EvShopData>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/ev-shop`, {
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
            console.error('❌ Error fetching EV Shop:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch EV Shop'
            };
        }
    },

    getAll: async (): Promise<ApiResponse<EvShopData[]>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/ev-shop/all`, {
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
            console.error('❌ Error fetching all EV Shop:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch EV Shop'
            };
        }
    },

    create: async (data: Partial<EvShopData>): Promise<ApiResponse<EvShopData>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/ev-shop`, {
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
            console.error('❌ Error creating EV Shop:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to create EV Shop'
            };
        }
    },

    update: async (id: string, data: Partial<EvShopData>): Promise<ApiResponse<EvShopData>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/ev-shop/${id}`, {
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
            console.error('❌ Error updating EV Shop:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to update EV Shop'
            };
        }
    },

    delete: async (id: string): Promise<ApiResponse<null>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/ev-shop/${id}`, {
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
            console.error('❌ Error deleting EV Shop:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to delete EV Shop'
            };
        }
    },

    toggleStatus: async (id: string): Promise<ApiResponse<EvShopData>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/ev-shop/${id}/toggle`, {
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
            console.error('❌ Error toggling EV Shop status:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to toggle status'
            };
        }
    },

    uploadImage: async (id: string, itemIndex: number, file: File): Promise<ApiResponse<EvShopData>> => {
        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch(`${API_BASE_URL}/ev-shop/${id}/upload-image/${itemIndex}`, {
                method: 'POST',
                body: formData
            });
            return response.json();
        } catch (error) {
            console.error('❌ Error uploading shop item image:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to upload image'
            };
        }
    },

    removeImage: async (id: string, itemIndex: number): Promise<ApiResponse<EvShopData>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/ev-shop/${id}/remove-image/${itemIndex}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            return response.json();
        } catch (error) {
            console.error('❌ Error removing shop item image:', error);
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

export const getEvShopImageUrl = (imageUrl: string): string => {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        return imageUrl;
    }
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || 'https://evc-ngen-server.onrender.com';
    return `${baseUrl}${imageUrl}`;
};

export const filterActiveShopItems = <T extends { isActive?: boolean }>(items: T[]): T[] => {
    return items.filter(item => item.isActive !== false);
};