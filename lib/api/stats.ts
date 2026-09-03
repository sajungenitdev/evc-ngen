// lib/api/stats.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://evc-ngen-server.onrender.com/api';

export interface StatItem {
    _id?: string;
    end: number;
    suffix: string;
    label: string;
    duration: number;
    prefix?: string;
    isActive: boolean;
}

export interface StatsData {
    _id: string;
    items: StatItem[];
    isActive: boolean;
    backgroundColor: string;
    textColor: string;
    borderColor: string;
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

export const statsAPI = {
    // Get active stats
    getActive: async (): Promise<ApiResponse<StatsData>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/stats`);
            return response.json();
        } catch (error) {
            console.error('Error fetching stats:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch stats'
            };
        }
    },

    // Get all stats (admin)
    getAll: async (): Promise<ApiResponse<StatsData[]>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/stats/all`);
            return response.json();
        } catch (error) {
            console.error('Error fetching all stats:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch stats'
            };
        }
    },

    // Create stats
    create: async (data: Partial<StatsData>): Promise<ApiResponse<StatsData>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/stats`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            return response.json();
        } catch (error) {
            console.error('Error creating stats:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to create stats'
            };
        }
    },

    // Update stats
    update: async (id: string, data: Partial<StatsData>): Promise<ApiResponse<StatsData>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/stats/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            return response.json();
        } catch (error) {
            console.error('Error updating stats:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to update stats'
            };
        }
    },

    // Delete stats
    delete: async (id: string): Promise<ApiResponse<null>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/stats/${id}`, {
                method: 'DELETE'
            });
            return response.json();
        } catch (error) {
            console.error('Error deleting stats:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to delete stats'
            };
        }
    },

    // Toggle stats status
    toggleStatus: async (id: string): Promise<ApiResponse<StatsData>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/stats/${id}/toggle`, {
                method: 'PUT'
            });
            return response.json();
        } catch (error) {
            console.error('Error toggling stats status:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to toggle stats status'
            };
        }
    }
};