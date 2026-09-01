// lib/api/solutionSection.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// ============================================================================
// Types
// ============================================================================

export interface SolutionItem {
    _id?: string;
    title: string;
    slug: string;
    subtitle: string;
    description: string;
    link: string;
    imageUrl: string;
    imageFile?: string;
    order: number;
    isActive: boolean;
}

export interface SolutionSectionData {
    _id: string;
    heading: string;
    subtitle: string;
    items: SolutionItem[];
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

export const solutionSectionAPI = {
    // Get active solution section
    getActive: async (): Promise<ApiResponse<SolutionSectionData>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/solutions-section`, {
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
            console.error('❌ Error fetching solution section:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch solution section'
            };
        }
    },

    // Get all solution sections (admin)
    getAll: async (): Promise<ApiResponse<SolutionSectionData[]>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/solutions-section/all`, {
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
            console.error('❌ Error fetching all solution sections:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch solution sections'
            };
        }
    },

    // Create solution section (admin)
    create: async (data: Partial<SolutionSectionData>): Promise<ApiResponse<SolutionSectionData>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/solutions-section`, {
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
            console.error('❌ Error creating solution section:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to create solution section'
            };
        }
    },

    // Update solution section (admin)
    update: async (id: string, data: Partial<SolutionSectionData>): Promise<ApiResponse<SolutionSectionData>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/solutions-section/${id}`, {
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
            console.error('❌ Error updating solution section:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to update solution section'
            };
        }
    },

    // Delete solution section (admin)
    delete: async (id: string): Promise<ApiResponse<null>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/solutions-section/${id}`, {
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
            console.error('❌ Error deleting solution section:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to delete solution section'
            };
        }
    },

    // Toggle solution section status (admin)
    toggleStatus: async (id: string): Promise<ApiResponse<SolutionSectionData>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/solutions-section/${id}/toggle`, {
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
            console.error('❌ Error toggling solution section status:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to toggle status'
            };
        }
    },

    // Upload solution item image
    uploadImage: async (id: string, itemIndex: number, file: File): Promise<ApiResponse<SolutionSectionData>> => {
        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch(`${API_BASE_URL}/solutions-section/${id}/upload-image/${itemIndex}`, {
                method: 'POST',
                body: formData
            });
            return response.json();
        } catch (error) {
            console.error('❌ Error uploading solution image:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to upload image'
            };
        }
    },

    // Remove solution item image
    removeImage: async (id: string, itemIndex: number): Promise<ApiResponse<SolutionSectionData>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/solutions-section/${id}/remove-image/${itemIndex}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            return response.json();
        } catch (error) {
            console.error('❌ Error removing solution image:', error);
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

export const getSolutionImageUrl = (imageUrl: string): string => {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        return imageUrl;
    }
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || 'http://localhost:5000';
    return `${baseUrl}${imageUrl}`;
};

export const filterActiveSolutions = <T extends { isActive?: boolean }>(items: T[]): T[] => {
    return items.filter(item => item.isActive !== false);
};