// frontend/lib/api/hero.js
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const heroAPI = {
    // Get active hero section (public)
    getActive: async () => {
        const response = await fetch(`${API_BASE_URL}/hero`);
        return response.json();
    },

    // Get all hero sections (admin)
    getAll: async (token) => {
        const response = await fetch(`${API_BASE_URL}/hero/all`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.json();
    },

    // Create hero section (admin)
    create: async (token, data) => {
        const response = await fetch(`${API_BASE_URL}/hero`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        return response.json();
    },

    // Update hero section (admin)
    update: async (token, id, data) => {
        const response = await fetch(`${API_BASE_URL}/hero/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        return response.json();
    },

    // Delete hero section (admin)
    delete: async (token, id) => {
        const response = await fetch(`${API_BASE_URL}/hero/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.json();
    },

    // Toggle hero status (admin)
    toggleStatus: async (token, id) => {
        const response = await fetch(`${API_BASE_URL}/hero/${id}/toggle`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.json();
    }
};