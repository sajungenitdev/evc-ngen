// lib/api/about.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://evc-ngen-server.onrender.com/api';

// ============================================================================
// Types
// ============================================================================

export interface Breadcrumb {
    label: string;
    link?: string;
    active?: boolean;
    isActive?: boolean;
}

export interface Stat {
    value: string;
    label: string;
    isActive: boolean;
}

export interface Highlight {
    text: string;
    isActive: boolean;
}

export interface WhoWeAre {
    title: string;
    paragraph1: string;
    paragraph2: string;
    imageUrl: string;
    highlights: Highlight[];
}

export interface Mission {
    title: string;
    paragraph1: string;
    paragraph2: string;
    imageUrl: string;
    highlights: Highlight[];
}

export interface Partner {
    name: string;
    logo: string;
    website?: string;
    isActive: boolean;
    order: number;
}

export interface Timeline {
    year: string;
    title: string;
    description: string;
    isActive: boolean;
    order: number;
}

export interface AboutData {
    _id: string;
    header: {
        breadcrumbs: Breadcrumb[];
        imageUrl: string;
        title: string;
        description: string;
    };
    headerLabel: string;
    title: string;
    introParagraph1: string;
    introParagraph2: string;
    sidebarNav: Breadcrumb[];
    stats: Stat[];
    whoWeAre: WhoWeAre;
    mission: Mission;
    partners: Partner[];
    timeline: Timeline[];
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

export const aboutAPI = {
    /**
     * Get active about page
     * @returns {Promise<ApiResponse<AboutData>>}
     */
    getActive: async (): Promise<ApiResponse<AboutData>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/about`, {
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
            console.error('❌ Error fetching about page:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch about page'
            };
        }
    },

    /**
     * Get all about pages (admin)
     * @returns {Promise<ApiResponse<AboutData[]>>}
     */
    getAll: async (): Promise<ApiResponse<AboutData[]>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/about/all`, {
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
            console.error('❌ Error fetching all about pages:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch about pages'
            };
        }
    },

    /**
     * Create about page (admin)
     * @param {Partial<AboutData>} data - About page data
     * @returns {Promise<ApiResponse<AboutData>>}
     */
    create: async (data: Partial<AboutData>): Promise<ApiResponse<AboutData>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/about`, {
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
            console.error('❌ Error creating about page:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to create about page'
            };
        }
    },

    /**
     * Update about page (admin)
     * @param {string} id - About page ID
     * @param {Partial<AboutData>} data - About page data
     * @returns {Promise<ApiResponse<AboutData>>}
     */
    update: async (id: string, data: Partial<AboutData>): Promise<ApiResponse<AboutData>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/about/${id}`, {
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
            console.error('❌ Error updating about page:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to update about page'
            };
        }
    },

    /**
     * Delete about page (admin)
     * @param {string} id - About page ID
     * @returns {Promise<ApiResponse<null>>}
     */
    delete: async (id: string): Promise<ApiResponse<null>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/about/${id}`, {
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
            console.error('❌ Error deleting about page:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to delete about page'
            };
        }
    },

    /**
     * Toggle about page status (admin)
     * @param {string} id - About page ID
     * @returns {Promise<ApiResponse<AboutData>>}
     */
    toggleStatus: async (id: string): Promise<ApiResponse<AboutData>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/about/${id}/toggle`, {
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
            console.error('❌ Error toggling about status:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to toggle status'
            };
        }
    },

    // ============================================
    // IMAGE UPLOAD METHODS
    // ============================================

    /**
     * Upload header image
     * @param {string} id - About page ID
     * @param {File} file - Image file
     * @returns {Promise<ApiResponse<AboutData>>}
     */
    uploadHeaderImage: async (id: string, file: File): Promise<ApiResponse<AboutData>> => {
        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch(`${API_BASE_URL}/about/${id}/upload-header`, {
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

    /**
     * Upload Who We Are image
     * @param {string} id - About page ID
     * @param {File} file - Image file
     * @returns {Promise<ApiResponse<AboutData>>}
     */
    uploadWhoWeAreImage: async (id: string, file: File): Promise<ApiResponse<AboutData>> => {
        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch(`${API_BASE_URL}/about/${id}/upload-who-we-are`, {
                method: 'POST',
                body: formData
            });
            return response.json();
        } catch (error) {
            console.error('❌ Error uploading who we are image:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to upload who we are image'
            };
        }
    },

    /**
     * Upload Mission image
     * @param {string} id - About page ID
     * @param {File} file - Image file
     * @returns {Promise<ApiResponse<AboutData>>}
     */
    uploadMissionImage: async (id: string, file: File): Promise<ApiResponse<AboutData>> => {
        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch(`${API_BASE_URL}/about/${id}/upload-mission`, {
                method: 'POST',
                body: formData
            });
            return response.json();
        } catch (error) {
            console.error('❌ Error uploading mission image:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to upload mission image'
            };
        }
    },

    /**
     * Upload partner logo
     * @param {string} id - About page ID
     * @param {number} partnerIndex - Partner array index
     * @param {File} file - Image file
     * @returns {Promise<ApiResponse<AboutData>>}
     */
    uploadPartnerLogo: async (id: string, partnerIndex: number, file: File): Promise<ApiResponse<AboutData>> => {
        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch(`${API_BASE_URL}/about/${id}/upload-partner/${partnerIndex}`, {
                method: 'POST',
                body: formData
            });
            return response.json();
        } catch (error) {
            console.error('❌ Error uploading partner logo:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to upload partner logo'
            };
        }
    },

    /**
     * Remove partner logo
     * @param {string} id - About page ID
     * @param {number} partnerIndex - Partner array index
     * @returns {Promise<ApiResponse<AboutData>>}
     */
    removePartnerLogo: async (id: string, partnerIndex: number): Promise<ApiResponse<AboutData>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/about/${id}/remove-partner-logo/${partnerIndex}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            return response.json();
        } catch (error) {
            console.error('❌ Error removing partner logo:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to remove partner logo'
            };
        }
    }
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get full image URL
 * @param {string} imageUrl - Image URL or path
 * @returns {string} Full URL
 */
export const getAboutImageUrl = (imageUrl: string): string => {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        return imageUrl;
    }
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || 'https://evc-ngen-server.onrender.com';
    return `${baseUrl}${imageUrl}`;
};

/**
 * Filter active items from an array
 * @param {T[]} items - Array of items with isActive property
 * @returns {T[]} Filtered array
 */
export const filterActive = <T extends { isActive?: boolean }>(items: T[]): T[] => {
    return items.filter(item => item.isActive !== false);
};