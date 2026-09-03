// lib/api/endToEndSetup.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://evc-ngen-server.onrender.com/api';

// ============================================================================
// Types
// ============================================================================

export interface Step {
    _id?: string;
    title: string;
    description: string;
    icon: string;
    order: number;
    isActive: boolean;
}

export interface CtaButton {
    text: string;
    link: string;
    isActive: boolean;
}

export interface EndToEndSetupData {
    _id: string;
    headingPart1: string;
    headingPart2: string;
    steps: Step[];
    ctaButton: CtaButton;
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
// Icon Mapping
// ============================================================================

export const ICON_MAP: Record<string, string> = {
    Wrench: '🔧',
    ClipboardList: '📋',
    Construction: '🏗️',
    Wifi: '📶',
    Headphones: '🎧',
    CreditCard: '💳',
    ShieldCheck: '🛡️',
    BarChart3: '📊',
    Zap: '⚡',
    Battery: '🔋',
    Plug: '🔌',
    Settings: '⚙️',
    Users: '👥',
    Calendar: '📅',
    Clock: '⏰',
    CheckCircle: '✅',
    AlertCircle: '⚠️',
    Info: 'ℹ️',
    HelpCircle: '❓',
    Mail: '✉️',
    Phone: '📞',
    MapPin: '📍',
    Globe: '🌐',
    Link: '🔗',
    ArrowRight: '➡️',
    ArrowLeft: '⬅️',
    ChevronRight: '▶️',
    ChevronLeft: '◀️',
    Menu: '☰',
    X: '✕',
    Plus: '➕',
    Minus: '➖',
    Search: '🔍',
    Filter: '🔽',
    Sort: '↕️',
    Download: '⬇️',
    Upload: '⬆️',
    Refresh: '🔄',
    Share: '📤',
    Heart: '❤️',
    Star: '⭐',
    Eye: '👁️',
    EyeOff: '👁️‍🗨️'
};

export const getIconEmoji = (iconName: string): string => {
    return ICON_MAP[iconName] || '📌';
};

// ============================================================================
// API Service
// ============================================================================

export const endToEndSetupAPI = {
    getActive: async (): Promise<ApiResponse<EndToEndSetupData>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/end-to-end-setup`, {
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
            console.error('❌ Error fetching End-to-End Setup:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch End-to-End Setup'
            };
        }
    },

    getAll: async (): Promise<ApiResponse<EndToEndSetupData[]>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/end-to-end-setup/all`, {
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
            console.error('❌ Error fetching all End-to-End Setup:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch End-to-End Setup'
            };
        }
    },

    create: async (data: Partial<EndToEndSetupData>): Promise<ApiResponse<EndToEndSetupData>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/end-to-end-setup`, {
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
            console.error('❌ Error creating End-to-End Setup:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to create End-to-End Setup'
            };
        }
    },

    update: async (id: string, data: Partial<EndToEndSetupData>): Promise<ApiResponse<EndToEndSetupData>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/end-to-end-setup/${id}`, {
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
            console.error('❌ Error updating End-to-End Setup:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to update End-to-End Setup'
            };
        }
    },

    delete: async (id: string): Promise<ApiResponse<null>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/end-to-end-setup/${id}`, {
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
            console.error('❌ Error deleting End-to-End Setup:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to delete End-to-End Setup'
            };
        }
    },

    toggleStatus: async (id: string): Promise<ApiResponse<EndToEndSetupData>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/end-to-end-setup/${id}/toggle`, {
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
            console.error('❌ Error toggling End-to-End Setup status:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to toggle status'
            };
        }
    }
};

// ============================================================================
// Helper Functions
// ============================================================================

export const filterActiveSteps = <T extends { isActive?: boolean }>(items: T[]): T[] => {
    return items.filter(item => item.isActive !== false);
};