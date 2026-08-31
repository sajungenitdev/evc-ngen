// app/(admin)/service-management/page.tsx
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import ServiceForm, { ServiceFormData } from '@/components/Admin/ServiceForm';

interface Service {
    _id: string;
    id: string;
    title: string;
    badge: string;
    description: string;
    richDescription?: string;
    details: string;
    icon: string;
    imageUrl?: string;
    link?: string;
    color: string;
    features: string[];
    process: string[];
    price?: string;
    duration?: string;
    actionText?: string;
    isActive: boolean;
    category: string;
    createdAt: string;
    updatedAt: string;
    related?: Service[];
}

interface ServiceCategory {
    _id: string;
    id: string;
    name: string;
    slug?: string;
    description?: string;
    icon: string;
    color: string;
    order: number;
    isActive: boolean;
    serviceCount?: number;
}

interface CategoryFormData {
    name: string;
    description: string;
    icon: string;
    color: string;
    order: number;
    isActive: boolean;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const colorOptions = [
    { value: 'bg-purple-50 text-purple-700 border-purple-200', label: 'Purple' },
    { value: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Blue' },
    { value: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Amber' },
    { value: 'bg-cyan-50 text-cyan-700 border-cyan-200', label: 'Cyan' },
    { value: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Emerald' },
    { value: 'bg-rose-50 text-rose-700 border-rose-200', label: 'Rose' },
    { value: 'bg-indigo-50 text-indigo-700 border-indigo-200', label: 'Indigo' },
    { value: 'bg-pink-50 text-pink-700 border-pink-200', label: 'Pink' },
    { value: 'bg-slate-50 text-slate-700 border-slate-200', label: 'Slate' },
];

const iconOptions = [
    { value: '📋', label: '📋 Clipboard' },
    { value: '🚧', label: '🚧 Construction' },
    { value: '🔧', label: '🔧 Wrench' },
    { value: '🎧', label: '🎧 Headphones' },
    { value: '🎓', label: '🎓 Graduation' },
    { value: '⚡', label: '⚡ Lightning' },
    { value: '📂', label: '📂 Folder' },
    { value: '🏗️', label: '🏗️ Building' },
    { value: '🛠️', label: '🛠️ Tools' },
    { value: '💡', label: '💡 Lightbulb' },
    { value: '📊', label: '📊 Chart' },
    { value: '🔋', label: '🔋 Battery' },
];

const INITIAL_CATEGORY_FORM: CategoryFormData = {
    name: '',
    description: '',
    icon: '📂',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    order: 0,
    isActive: true,
};

export default function ServiceManagementPage() {
    const { token } = useAuth();
    const [services, setServices] = useState<Service[]>([]);
    const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Tab state
    const [activeTab, setActiveTab] = useState<'services' | 'categories'>('services');

    // Service Modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    // Category Modals
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isCategoryEditModalOpen, setIsCategoryEditModalOpen] = useState(false);
    const [isCategoryDeleteModalOpen, setIsCategoryDeleteModalOpen] = useState(false);
    const [categoryFormData, setCategoryFormData] = useState<CategoryFormData>(INITIAL_CATEGORY_FORM);
    const [isCategorySubmitting, setIsCategorySubmitting] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);

    // Selection & Form
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [editFormData, setEditFormData] = useState<ServiceFormData | undefined>();

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');

    // Stats
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        inactive: 0,
    });

    // ============================================
    // API Helper
    // ============================================
    const apiCall = useCallback(
        async (endpoint: string, options: RequestInit = {}) => {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                    ...options.headers,
                },
            });
            return response.json();
        },
        [token]
    );

    // ============================================
    // Fetch Data
    // ============================================
    const fetchServices = useCallback(async () => {
        if (!token) return;
        setIsLoading(true);
        try {
            const response = await apiCall('/services');
            if (response.success) {
                const fetchedData: Service[] = response.data || [];
                setServices(fetchedData);
                setStats({
                    total: fetchedData.length,
                    active: fetchedData.filter((s) => s.isActive).length,
                    inactive: fetchedData.filter((s) => !s.isActive).length,
                });
            } else {
                toast.error(response.message || 'Failed to load services');
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to load services';
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    }, [token, apiCall]);

    const fetchCategories = useCallback(async () => {
        if (!token) return;
        try {
            const response = await apiCall('/service-categories');
            if (response.success) {
                setServiceCategories(response.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    }, [token, apiCall]);

    useEffect(() => {
        fetchServices();
        fetchCategories();
    }, [fetchServices, fetchCategories]);

    // ============================================
    // Filter Logic
    // ============================================
    const filteredServices = useMemo(() => {
        const query = searchTerm.toLowerCase().trim();
        return services.filter((service) => {
            const matchesSearch =
                !query ||
                service.title.toLowerCase().includes(query) ||
                service.badge.toLowerCase().includes(query) ||
                service.description.toLowerCase().includes(query);
            const matchesCategory = filterCategory === 'all' || service.category === filterCategory;
            const matchesStatus =
                filterStatus === 'all' ||
                (filterStatus === 'active' && service.isActive) ||
                (filterStatus === 'inactive' && !service.isActive);
            return matchesSearch && matchesCategory && matchesStatus;
        });
    }, [services, searchTerm, filterCategory, filterStatus]);

    // ============================================
    // Category Helpers
    // ============================================
    const getCategoryLabel = useCallback(
        (categoryId: string) => {
            const found = serviceCategories.find((c) => c.id === categoryId);
            return found?.name || categoryId;
        },
        [serviceCategories]
    );

    const getCategoryBadgeColor = useCallback(
        (categoryId: string) => {
            const found = serviceCategories.find((c) => c.id === categoryId);
            return found?.color || 'bg-slate-100 text-slate-700 border-slate-200';
        },
        [serviceCategories]
    );

    const categoryOptions = useMemo(() => {
        return serviceCategories
            .filter((c) => c.isActive)
            .map((c) => ({
                value: c.id,
                label: c.name,
                icon: c.icon,
                color: c.color,
            }));
    }, [serviceCategories]);

    // ============================================
    // Category CRUD
    // ============================================
    const handleCreateCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;
        setIsCategorySubmitting(true);
        const toastId = toast.loading('Creating category...');

        try {
            const response = await apiCall('/service-categories', {
                method: 'POST',
                body: JSON.stringify(categoryFormData),
            });

            if (response.success) {
                await fetchCategories();
                setIsCategoryModalOpen(false);
                setCategoryFormData(INITIAL_CATEGORY_FORM);
                toast.success(`Category "${categoryFormData.name}" created!`, { id: toastId });
            } else {
                toast.error(response.message || 'Failed to create category', { id: toastId });
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to create category';
            toast.error(message, { id: toastId });
        } finally {
            setIsCategorySubmitting(false);
        }
    };

    const handleUpdateCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token || !selectedCategory) return;
        setIsCategorySubmitting(true);
        const toastId = toast.loading('Updating category...');

        try {
            const response = await apiCall(`/service-categories/${selectedCategory.id}`, {
                method: 'PUT',
                body: JSON.stringify(categoryFormData),
            });

            if (response.success) {
                await fetchCategories();
                setIsCategoryEditModalOpen(false);
                setSelectedCategory(null);
                setCategoryFormData(INITIAL_CATEGORY_FORM);
                toast.success('Category updated!', { id: toastId });
            } else {
                toast.error(response.message || 'Failed to update category', { id: toastId });
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to update category';
            toast.error(message, { id: toastId });
        } finally {
            setIsCategorySubmitting(false);
        }
    };

    const handleDeleteCategory = async () => {
        if (!token || !selectedCategory) return;

        const hasServices = services.some((s) => s.category === selectedCategory.id);
        if (hasServices) {
            toast.error(`Cannot delete "${selectedCategory.name}" - it has services assigned to it.`);
            return;
        }

        setIsCategorySubmitting(true);
        const toastId = toast.loading(`Deleting ${selectedCategory.name}...`);

        try {
            const response = await apiCall(`/service-categories/${selectedCategory.id}`, {
                method: 'DELETE',
            });

            if (response.success) {
                await fetchCategories();
                setIsCategoryDeleteModalOpen(false);
                setSelectedCategory(null);
                toast.success('Category deleted!', { id: toastId });
            } else {
                toast.error(response.message || 'Failed to delete category', { id: toastId });
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to delete category';
            toast.error(message, { id: toastId });
        } finally {
            setIsCategorySubmitting(false);
        }
    };

    const handleToggleCategoryStatus = async (category: ServiceCategory) => {
        if (!token) return;
        const toastId = toast.loading('Updating status...');

        try {
            const response = await apiCall(`/service-categories/${category.id}/toggle`, {
                method: 'PUT',
            });

            if (response.success) {
                await fetchCategories();
                toast.success(`Category ${category.isActive ? 'deactivated' : 'activated'}!`, { id: toastId });
            } else {
                toast.error(response.message || 'Failed to update status', { id: toastId });
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to update status';
            toast.error(message, { id: toastId });
        }
    };

    // ============================================
    // Service CRUD
    // ============================================
    const handleCreateService = async (formData: ServiceFormData) => {
        if (!token) return;
        setIsSubmitting(true);
        const toastId = toast.loading('Creating service...');

        try {
            const response = await apiCall('/services', {
                method: 'POST',
                body: JSON.stringify(formData),
            });

            if (response.success) {
                await fetchServices();
                setIsCreateModalOpen(false);
                toast.success(`Service "${formData.title}" created!`, { id: toastId });
            } else {
                toast.error(response.message || 'Failed to create service', { id: toastId });
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to create service';
            toast.error(message, { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateService = async (formData: ServiceFormData) => {
        if (!token || !selectedService) return;
        setIsSubmitting(true);
        const toastId = toast.loading('Updating service...');

        try {
            const response = await apiCall(`/services/${selectedService.id}`, {
                method: 'PUT',
                body: JSON.stringify(formData),
            });

            if (response.success) {
                await fetchServices();
                setIsEditModalOpen(false);
                setSelectedService(null);
                setEditFormData(undefined);
                toast.success('Service updated!', { id: toastId });
            } else {
                toast.error(response.message || 'Failed to update service', { id: toastId });
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to update service';
            toast.error(message, { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteService = async () => {
        if (!token || !selectedService) return;
        setIsSubmitting(true);
        const toastId = toast.loading(`Deleting ${selectedService.title}...`);

        try {
            const response = await apiCall(`/services/${selectedService.id}`, {
                method: 'DELETE',
            });

            if (response.success) {
                await fetchServices();
                setIsDeleteModalOpen(false);
                setSelectedService(null);
                toast.success('Service deleted!', { id: toastId });
            } else {
                toast.error(response.message || 'Failed to delete service', { id: toastId });
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to delete service';
            toast.error(message, { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleServiceStatus = async (service: Service) => {
        if (!token) return;
        const toastId = toast.loading('Updating status...');

        try {
            const response = await apiCall(`/services/${service.id}/toggle`, {
                method: 'PUT',
            });

            if (response.success) {
                await fetchServices();
                toast.success(`Service ${service.isActive ? 'deactivated' : 'activated'}!`, { id: toastId });
            } else {
                toast.error(response.message || 'Failed to update status', { id: toastId });
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to update status';
            toast.error(message, { id: toastId });
        }
    };

    // ============================================
    // Modal Open Handlers
    // ============================================
    const handleEdit = (service: Service) => {
        setSelectedService(service);
        setEditFormData({
            title: service.title,
            badge: service.badge,
            description: service.description,
            richDescription: service.richDescription || '',
            details: service.details,
            icon: service.icon,
            imageUrl: service.imageUrl || '',
            link: service.link || '',
            color: service.color,
            features: service.features || [],
            process: service.process || [],
            price: service.price || '',
            duration: service.duration || '',
            actionText: service.actionText || 'Request a Service',
            isActive: service.isActive,
            category: service.category || '',
        });
        setIsEditModalOpen(true);
    };

    const handleView = (service: Service) => {
        setSelectedService(service);
        setIsViewModalOpen(true);
    };

    const handleDelete = (service: Service) => {
        setSelectedService(service);
        setIsDeleteModalOpen(true);
    };

    const handleEditCategory = (category: ServiceCategory) => {
        setSelectedCategory(category);
        setCategoryFormData({
            name: category.name,
            description: category.description || '',
            icon: category.icon || '📂',
            color: category.color || 'bg-purple-50 text-purple-700 border-purple-200',
            order: category.order || 0,
            isActive: category.isActive,
        });
        setIsCategoryEditModalOpen(true);
    };

    const handleDeleteCategoryClick = (category: ServiceCategory) => {
        setSelectedCategory(category);
        setIsCategoryDeleteModalOpen(true);
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '—';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        } catch {
            return 'Invalid date';
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8 space-y-6 container mx-auto">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Service Management</h1>
                    <p className="text-sm text-slate-500 mt-1">Configure service offerings, pricing structures, and categories.</p>
                </div>
                <div>
                    {activeTab === 'services' ? (
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition shadow-xs hover:shadow"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            <span>Add Service</span>
                        </button>
                    ) : (
                        <button
                            onClick={() => {
                                setCategoryFormData(INITIAL_CATEGORY_FORM);
                                setIsCategoryModalOpen(true);
                            }}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition shadow-xs hover:shadow"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            <span>Add Category</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex bg-slate-200/60 p-1 rounded-xl w-full sm:w-72 border border-slate-200">
                <button
                    onClick={() => setActiveTab('services')}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${activeTab === 'services' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                        }`}
                >
                    Services ({services.length})
                </button>
                <button
                    onClick={() => setActiveTab('categories')}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${activeTab === 'categories' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                        }`}
                >
                    Categories ({serviceCategories.length})
                </button>
            </div>

            {/* ========================================================= */}
            {/* SERVICES TAB */}
            {/* ========================================================= */}
            {activeTab === 'services' && (
                <div className="space-y-6">
                    {/* Quick Metrics */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Services</p>
                                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-semibold text-lg">
                                📦
                            </div>
                        </div>
                        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Active Services</p>
                                <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.active}</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-semibold">
                                ✓
                            </div>
                        </div>
                        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Inactive Services</p>
                                <p className="text-2xl font-bold text-slate-400 mt-1">{stats.inactive}</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center font-semibold">
                                ✕
                            </div>
                        </div>
                    </div>

                    {/* Search and Filters */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
                        <div className="relative flex-1">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                                </svg>
                            </span>
                            <input
                                type="text"
                                placeholder="Search services by title, badge, or description..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 text-slate-900 placeholder:text-slate-400 transition"
                            />
                        </div>

                        <div className="flex flex-wrap sm:flex-nowrap gap-2">
                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-700 font-medium transition"
                            >
                                <option value="all">All Categories</option>
                                {categoryOptions.map((cat) => (
                                    <option key={cat.value} value={cat.value}>
                                        {cat.icon} {cat.label}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-700 font-medium transition"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active Only</option>
                                <option value="inactive">Inactive Only</option>
                            </select>

                            <button
                                onClick={() => fetchServices()}
                                className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 transition"
                                title="Refresh services"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Services Table */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                        <th className="px-6 py-4">Service</th>
                                        <th className="px-6 py-4">Category</th>
                                        <th className="px-6 py-4">Badge</th>
                                        <th className="px-6 py-4">Price / Duration</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-sm">
                                    {isLoading ? (
                                        Array.from({ length: 4 }).map((_, i) => (
                                            <tr key={i} className="animate-pulse">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-slate-200 rounded-xl" />
                                                        <div className="space-y-1.5">
                                                            <div className="w-32 h-3.5 bg-slate-200 rounded" />
                                                            <div className="w-48 h-2.5 bg-slate-100 rounded" />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4"><div className="w-20 h-5 bg-slate-100 rounded-full" /></td>
                                                <td className="px-6 py-4"><div className="w-16 h-5 bg-slate-100 rounded-full" /></td>
                                                <td className="px-6 py-4"><div className="w-24 h-3 bg-slate-100 rounded" /></td>
                                                <td className="px-6 py-4"><div className="w-16 h-5 bg-slate-100 rounded-full" /></td>
                                                <td className="px-6 py-4"><div className="w-20 h-6 bg-slate-100 rounded ml-auto" /></td>
                                            </tr>
                                        ))
                                    ) : filteredServices.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-16 text-center">
                                                <div className="max-w-xs mx-auto text-center space-y-2">
                                                    <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-xl text-slate-400">
                                                        🔍
                                                    </div>
                                                    <p className="text-sm font-bold text-slate-800">No services found</p>
                                                    <p className="text-xs text-slate-400">Try adjusting your filters or add a new service.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredServices.map((service) => (
                                            <tr key={service._id || service.id} className="hover:bg-slate-50/60 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xl shrink-0">
                                                            {service.icon}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="font-semibold text-slate-900 truncate">{service.title}</p>
                                                            <p className="text-xs text-slate-500 truncate max-w-sm">{service.description}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getCategoryBadgeColor(service.category)}`}>
                                                        {getCategoryLabel(service.category)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border bg-slate-100 text-slate-700 border-slate-200">
                                                        {service.badge}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-600">
                                                    <span className="font-semibold text-slate-800">{service.price || 'Free / Quote'}</span>
                                                    {service.duration && <span className="text-slate-400 block">{service.duration}</span>}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${service.isActive
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                            : 'bg-slate-100 text-slate-500 border-slate-200'
                                                            }`}
                                                    >
                                                        <span className={`w-1.5 h-1.5 rounded-full ${service.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                                        {service.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button
                                                            onClick={() => handleView(service)}
                                                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition"
                                                            title="View details"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => handleEdit(service)}
                                                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
                                                            title="Edit service"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => handleToggleServiceStatus(service)}
                                                            className={`p-1.5 rounded-lg transition ${service.isActive ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50' : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                                                                }`}
                                                            title={service.isActive ? 'Deactivate' : 'Activate'}
                                                        >
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 5.636a9 9 0 1012.728 0M12 3v9" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(service)}
                                                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                                                            title="Delete service"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================= */}
            {/* CATEGORIES TAB */}
            {/* ========================================================= */}
            {activeTab === 'categories' && (
                <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                    <th className="px-6 py-4">Category</th>
                                    <th className="px-6 py-4">Identifier</th>
                                    <th className="px-6 py-4">Description</th>
                                    <th className="px-6 py-4">Services Assigned</th>
                                    <th className="px-6 py-4">Order</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {isLoading ? (
                                    Array.from({ length: 3 }).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-slate-200 rounded-xl" />
                                                    <div className="space-y-1.5">
                                                        <div className="w-24 h-3.5 bg-slate-200 rounded" />
                                                        <div className="w-16 h-2.5 bg-slate-100 rounded" />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4"><div className="w-16 h-5 bg-slate-100 rounded-full" /></td>
                                            <td className="px-6 py-4"><div className="w-32 h-3 bg-slate-100 rounded" /></td>
                                            <td className="px-6 py-4"><div className="w-10 h-5 bg-slate-100 rounded-full" /></td>
                                            <td className="px-6 py-4"><div className="w-8 h-3.5 bg-slate-100 rounded" /></td>
                                            <td className="px-6 py-4"><div className="w-16 h-5 bg-slate-100 rounded-full" /></td>
                                            <td className="px-6 py-4"><div className="w-20 h-6 bg-slate-100 rounded ml-auto" /></td>
                                        </tr>
                                    ))
                                ) : serviceCategories.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-16 text-center">
                                            <div className="max-w-xs mx-auto text-center space-y-2">
                                                <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-xl text-slate-400">
                                                    📂
                                                </div>
                                                <p className="text-sm font-bold text-slate-800">No categories found</p>
                                                <p className="text-xs text-slate-400">Create a category to group your service catalog.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    serviceCategories.map((category) => {
                                        const count = services.filter((s) => s.category === category.id).length;
                                        return (
                                            <tr key={category._id || category.id} className="hover:bg-slate-50/60 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl border ${category.color}`}>
                                                            {category.icon || '📂'}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-slate-900">{category.name}</p>
                                                            {category.slug && <p className="text-xs text-slate-400 font-mono">{category.slug}</p>}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-xs font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                                                        {category.id}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-xs text-slate-600 truncate max-w-xs">{category.description || '—'}</p>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                                        {count} {count === 1 ? 'service' : 'services'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-600 font-medium">
                                                    {category.order || 0}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${category.isActive
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                            : 'bg-slate-100 text-slate-500 border-slate-200'
                                                            }`}
                                                    >
                                                        <span className={`w-1.5 h-1.5 rounded-full ${category.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                                        {category.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button
                                                            onClick={() => handleEditCategory(category)}
                                                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
                                                            title="Edit Category"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => handleToggleCategoryStatus(category)}
                                                            className={`p-1.5 rounded-lg transition ${category.isActive ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50' : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                                                                }`}
                                                            title={category.isActive ? 'Deactivate' : 'Activate'}
                                                        >
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 5.636a9 9 0 1012.728 0M12 3v9" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteCategoryClick(category)}
                                                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                                                            title="Delete Category"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ========================================================= */}
            {/* MODALS */}
            {/* ========================================================= */}

            {/* Category Create/Edit Modal */}
            {(isCategoryModalOpen || isCategoryEditModalOpen) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl border border-slate-200">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <h2 className="text-lg font-bold text-slate-900">
                                {isCategoryEditModalOpen ? 'Edit Category' : 'New Category'}
                            </h2>
                            <button
                                onClick={() => {
                                    setIsCategoryModalOpen(false);
                                    setIsCategoryEditModalOpen(false);
                                    setSelectedCategory(null);
                                    setCategoryFormData(INITIAL_CATEGORY_FORM);
                                }}
                                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
                            >
                                ✕
                            </button>
                        </div>

                        <form
                            onSubmit={isCategoryEditModalOpen ? handleUpdateCategory : handleCreateCategory}
                            className="space-y-4 mt-4"
                        >
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                    Name <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={categoryFormData.name}
                                    onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                                    required
                                    placeholder="e.g., Assessment & Audit"
                                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={categoryFormData.description}
                                    onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                                    rows={2}
                                    placeholder="Brief summary of this service category..."
                                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900 resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Icon</label>
                                    <select
                                        value={categoryFormData.icon}
                                        onChange={(e) => setCategoryFormData({ ...categoryFormData, icon: e.target.value })}
                                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-slate-900"
                                    >
                                        {iconOptions.map((icon) => (
                                            <option key={icon.value} value={icon.value}>
                                                {icon.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Color Style</label>
                                    <select
                                        value={categoryFormData.color}
                                        onChange={(e) => setCategoryFormData({ ...categoryFormData, color: e.target.value })}
                                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-slate-900"
                                    >
                                        {colorOptions.map((color) => (
                                            <option key={color.value} value={color.value}>
                                                {color.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                    Order Index
                                </label>
                                <input
                                    type="number"
                                    value={categoryFormData.order}
                                    onChange={(e) =>
                                        setCategoryFormData({ ...categoryFormData, order: parseInt(e.target.value, 10) || 0 })
                                    }
                                    min="0"
                                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900"
                                />
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="category-active"
                                    checked={categoryFormData.isActive}
                                    onChange={(e) => setCategoryFormData({ ...categoryFormData, isActive: e.target.checked })}
                                    className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900 border-slate-300"
                                />
                                <label htmlFor="category-active" className="text-xs font-semibold text-slate-700 cursor-pointer">
                                    Category is Active
                                </label>
                            </div>

                            <div className="flex gap-2 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsCategoryModalOpen(false);
                                        setIsCategoryEditModalOpen(false);
                                        setSelectedCategory(null);
                                        setCategoryFormData(INITIAL_CATEGORY_FORM);
                                    }}
                                    className="flex-1 px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCategorySubmitting}
                                    className="flex-1 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-xs transition disabled:opacity-50"
                                >
                                    {isCategorySubmitting ? 'Saving...' : isCategoryEditModalOpen ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Category Modal */}
            {isCategoryDeleteModalOpen && selectedCategory && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
                    <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl border border-slate-200 text-center">
                        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100 flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                            ⚠️
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">Delete Category</h3>
                        <p className="text-xs text-slate-500 mt-2 mb-4 leading-relaxed">
                            Are you sure you want to delete <span className="font-semibold text-slate-800">{selectedCategory.name}</span>?
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    setIsCategoryDeleteModalOpen(false);
                                    setSelectedCategory(null);
                                }}
                                className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-sm font-semibold transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteCategory}
                                disabled={isCategorySubmitting}
                                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition disabled:opacity-50"
                            >
                                {isCategorySubmitting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Service Create Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
                    <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-200">
                        <ServiceForm
                            categories={serviceCategories}
                            isSubmitting={isSubmitting}
                            onSubmit={handleCreateService}
                            onCancel={() => setIsCreateModalOpen(false)}
                            submitLabel="Create Service"
                            title="Add New Service"
                            subtitle="Fill out details for this new service listing"
                        />
                    </div>
                </div>
            )}

            {/* Service Edit Modal */}
            {isEditModalOpen && selectedService && editFormData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
                    <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-200">
                        <ServiceForm
                            initialData={editFormData}
                            categories={serviceCategories}
                            isSubmitting={isSubmitting}
                            onSubmit={handleUpdateService}
                            onCancel={() => {
                                setIsEditModalOpen(false);
                                setSelectedService(null);
                                setEditFormData(undefined);
                            }}
                            submitLabel="Update Service"
                            title="Edit Service"
                            subtitle="Update content, duration, and configurations"
                        />
                    </div>
                </div>
            )}

            {/* Service View Modal */}
            {isViewModalOpen && selectedService && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
                    <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-200">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">Service Overview</h2>
                                <p className="text-xs text-slate-500 font-mono mt-0.5">ID: {selectedService.id}</p>
                            </div>
                            <button
                                onClick={() => {
                                    setIsViewModalOpen(false);
                                    setSelectedService(null);
                                }}
                                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-3xl shrink-0">
                                    {selectedService.icon}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">{selectedService.title}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getCategoryBadgeColor(selectedService.category)}`}>
                                            {getCategoryLabel(selectedService.category)}
                                        </span>
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border bg-slate-100 text-slate-700 border-slate-200">
                                            {selectedService.badge}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/60">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Description</span>
                                <p className="text-sm text-slate-700 mt-1">{selectedService.description}</p>
                            </div>

                            {selectedService.richDescription && (
                                <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/60">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Detailed Content</span>
                                    <div className="text-sm text-slate-700 mt-1 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: selectedService.richDescription }} />
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/60">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Price</span>
                                    <span className="text-sm font-semibold text-slate-800 block mt-1">{selectedService.price || 'N/A'}</span>
                                </div>
                                <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/60">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Duration</span>
                                    <span className="text-sm font-semibold text-slate-800 block mt-1">{selectedService.duration || 'N/A'}</span>
                                </div>
                            </div>

                            {selectedService.features && selectedService.features.length > 0 && (
                                <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/60">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Features</span>
                                    <ul className="list-disc list-inside text-xs text-slate-700 mt-2 space-y-1">
                                        {selectedService.features.map((feat, idx) => (
                                            <li key={idx}>{feat}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {selectedService.imageUrl && (
                                <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/60">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cover Image</span>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={selectedService.imageUrl} alt={selectedService.title} className="mt-2 rounded-xl max-h-48 w-full object-cover border border-slate-200" />
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-3 text-xs text-slate-500">
                                <div>Created: <span className="text-slate-800 font-medium">{formatDate(selectedService.createdAt)}</span></div>
                                <div>Updated: <span className="text-slate-800 font-medium">{formatDate(selectedService.updatedAt)}</span></div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4 mt-6 border-t border-slate-100">
                            <button
                                onClick={() => {
                                    setIsViewModalOpen(false);
                                    handleEdit(selectedService);
                                }}
                                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition"
                            >
                                Edit Service
                            </button>
                            <button
                                onClick={() => setIsViewModalOpen(false)}
                                className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Service Modal */}
            {isDeleteModalOpen && selectedService && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
                    <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl border border-slate-200 text-center">
                        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100 flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                            ⚠️
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">Delete Service</h3>
                        <p className="text-xs text-slate-500 mt-2 mb-4 leading-relaxed">
                            Are you sure you want to permanently delete <span className="font-semibold text-slate-800">{selectedService.title}</span>?
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    setIsDeleteModalOpen(false);
                                    setSelectedService(null);
                                }}
                                className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-sm font-semibold transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteService}
                                disabled={isSubmitting}
                                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition disabled:opacity-50"
                            >
                                {isSubmitting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}