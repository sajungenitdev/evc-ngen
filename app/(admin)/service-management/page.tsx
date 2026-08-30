// app/(admin)/service-management/page.tsx
'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import ServiceForm, { ServiceFormData } from '@/components/Admin/ServiceForm';

interface Service {
    _id: string;
    id: string;
    title: string;
    badge: string;
    description: string;
    richDescription: string;
    details: string;
    icon: string;
    imageUrl: string;
    link: string;
    color: string;
    features: string[];
    process: string[];
    price: string;
    duration: string;
    actionText: string;
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
    description: string;
    icon: string;
    color: string;
    order: number;
    isActive: boolean;
    serviceCount: number;
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
    { value: 'bg-purple-100 text-purple-700 border-purple-200', label: 'Purple' },
    { value: 'bg-blue-100 text-blue-700 border-blue-200', label: 'Blue' },
    { value: 'bg-amber-100 text-amber-700 border-amber-200', label: 'Amber' },
    { value: 'bg-cyan-100 text-cyan-700 border-cyan-200', label: 'Cyan' },
    { value: 'bg-emerald-100 text-emerald-700 border-emerald-200', label: 'Emerald' },
    { value: 'bg-rose-100 text-rose-700 border-rose-200', label: 'Rose' },
    { value: 'bg-indigo-100 text-indigo-700 border-indigo-200', label: 'Indigo' },
    { value: 'bg-pink-100 text-pink-700 border-pink-200', label: 'Pink' },
    { value: 'bg-slate-100 text-slate-700 border-slate-200', label: 'Slate' },
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
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    order: 0,
    isActive: true,
};

export default function ServiceManagementPage() {
    const { token } = useAuth();
    const [services, setServices] = useState<Service[]>([]);
    const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Service Modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    // Category Modal
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [categoryFormData, setCategoryFormData] = useState<CategoryFormData>(INITIAL_CATEGORY_FORM);
    const [isCategorySubmitting, setIsCategorySubmitting] = useState(false);

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
        assessment: 0,
        installation: 0,
        maintenance: 0,
        support: 0,
        training: 0,
        custom: 0,
    });

    // ============================================
    // API Helper
    // ============================================
    const apiCall = useCallback(async (endpoint: string, options: RequestInit = {}) => {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
                ...options.headers,
            },
        });
        return response.json();
    }, [token]);

    // ============================================
    // Fetch Data
    // ============================================
    const fetchServices = useCallback(async () => {
        if (!token) return;
        setIsLoading(true);
        try {
            const response = await apiCall('/services');
            if (response.success) {
                setServices(response.data || []);
                setStats(response.stats || {
                    total: 0,
                    assessment: 0,
                    installation: 0,
                    maintenance: 0,
                    support: 0,
                    training: 0,
                    custom: 0,
                });
            } else {
                toast.error(response.message || 'Failed to load services');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to load services');
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
            const matchesStatus = filterStatus === 'all' ||
                (filterStatus === 'active' && service.isActive) ||
                (filterStatus === 'inactive' && !service.isActive);
            return matchesSearch && matchesCategory && matchesStatus;
        });
    }, [services, searchTerm, filterCategory, filterStatus]);

    // ============================================
    // Category Helpers
    // ============================================
    const getCategoryLabel = useCallback((categoryId: string) => {
        const found = serviceCategories.find(c => c.id === categoryId);
        return found?.name || categoryId;
    }, [serviceCategories]);

    const getCategoryBadgeColor = useCallback((categoryId: string) => {
        const found = serviceCategories.find(c => c.id === categoryId);
        return found?.color || 'bg-gray-100 text-gray-700 border-gray-200';
    }, [serviceCategories]);

    const categoryOptions = useMemo(() => {
        return serviceCategories
            .filter(c => c.isActive)
            .map(c => ({
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
                toast.success(`Category "${categoryFormData.name}" created successfully!`, { id: toastId });
            } else {
                toast.error(response.message || 'Failed to create category', { id: toastId });
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to create category', { id: toastId });
        } finally {
            setIsCategorySubmitting(false);
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
                toast.success(`Service "${formData.title}" created successfully!`, { id: toastId });
            } else {
                toast.error(response.message || 'Failed to create service', { id: toastId });
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to create service', { id: toastId });
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
                toast.success('Service updated successfully!', { id: toastId });
            } else {
                toast.error(response.message || 'Failed to update service', { id: toastId });
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to update service', { id: toastId });
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
                toast.success('Service deleted successfully!', { id: toastId });
            } else {
                toast.error(response.message || 'Failed to delete service', { id: toastId });
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete service', { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleStatus = async (service: Service) => {
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
        } catch (error: any) {
            toast.error(error.message || 'Failed to update status', { id: toastId });
        }
    };

    // ============================================
    // Modal Handlers
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

    // ============================================
    // Helper Functions
    // ============================================
    const getStatusBadge = (isActive: boolean) => {
        return isActive
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : 'bg-red-50 text-red-700 border-red-200';
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
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
        <div className="space-y-6 container mx-auto pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0B192C]">
                        Service Management
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        Manage all services offered by EVNGEN
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => {
                            setCategoryFormData(INITIAL_CATEGORY_FORM);
                            setIsCategoryModalOpen(true);
                        }}
                        className="inline-flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                        </svg>
                        <span>Add Category</span>
                    </button>
                    <button
                        onClick={() => {
                            setIsCreateModalOpen(true);
                        }}
                        className="inline-flex items-center justify-center gap-2 bg-[#0B192C] hover:bg-[#1E3E62] text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-[#0B192C]/10 transition-all"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Add Service</span>
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
                <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center shadow-xs">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</span>
                    <p className="text-2xl font-bold text-[#0B192C] mt-1">{stats.total}</p>
                </div>
                {serviceCategories.map((cat) => (
                    <div key={cat.id} className={`bg-white border rounded-2xl p-4 text-center shadow-xs ${cat.color}`}>
                        <span className="text-xs font-semibold uppercase tracking-wider">
                            {cat.icon} {cat.name}
                        </span>
                        <p className="text-2xl font-bold text-[#0B192C] mt-1">
                            {services.filter(s => s.category === cat.id).length}
                        </p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="relative flex-1 min-w-[200px]">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </span>
                    <input
                        type="text"
                        placeholder="Search by title, badge, or description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/10 focus:border-[#0B192C] transition-all"
                    />
                </div>

                <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="text-sm px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/10 focus:border-[#0B192C] text-slate-700 font-medium transition-all"
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
                    className="text-sm px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/10 focus:border-[#0B192C] text-slate-700 font-medium transition-all"
                >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>

                <button
                    onClick={() => fetchServices()}
                    className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.03 8.03 0 01-15.357-2m15.357 2H15" />
                    </svg>
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                <th className="px-6 py-4">Service</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Badge</th>
                                <th className="px-6 py-4">Price</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4">
                                            <div className="space-y-1.5">
                                                <div className="w-28 h-3.5 bg-slate-200 rounded" />
                                                <div className="w-36 h-2.5 bg-slate-100 rounded" />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4"><div className="w-20 h-5 bg-slate-200 rounded-full" /></td>
                                        <td className="px-6 py-4"><div className="w-16 h-5 bg-slate-200 rounded-full" /></td>
                                        <td className="px-6 py-4"><div className="w-16 h-3.5 bg-slate-200 rounded" /></td>
                                        <td className="px-6 py-4"><div className="w-16 h-5 bg-slate-200 rounded-full" /></td>
                                        <td className="px-6 py-4"><div className="w-20 h-6 bg-slate-200 rounded ml-auto" /></td>
                                    </tr>
                                ))
                            ) : filteredServices.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center">
                                        <div className="max-w-xs mx-auto text-center space-y-2">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-400 text-xl">
                                                📋
                                            </div>
                                            <p className="text-sm font-bold text-[#0B192C]">No services found</p>
                                            <p className="text-xs text-slate-400">Try adjusting your search or filters</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredServices.map((service) => (
                                    <tr key={service._id} className="hover:bg-slate-50/70 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">{service.icon}</span>
                                                <div>
                                                    <p className="font-semibold text-[#0B192C]">{service.title}</p>
                                                    <p className="text-xs text-slate-500 line-clamp-1">{service.description}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getCategoryBadgeColor(service.category)}`}>
                                                {getCategoryLabel(service.category)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-slate-100 text-slate-700 border-slate-200">
                                                {service.badge}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {service.price || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(service.isActive)}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${service.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                                {service.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => handleView(service)}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                                                    title="View Details"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(service)}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                                    title="Edit"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleToggleStatus(service)}
                                                    className={`p-1.5 rounded-lg transition-colors ${service.isActive
                                                        ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                                                        : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                                                        }`}
                                                    title={service.isActive ? 'Deactivate' : 'Activate'}
                                                >
                                                    {service.isActive ? (
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(service)}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                                    title="Delete"
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

            {/* ============================================ */}
            {/* CREATE CATEGORY MODAL */}
            {/* ============================================ */}
            {isCategoryModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B192C]/40 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-200">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                            <div>
                                <h2 className="text-lg font-bold text-[#0B192C]">Add New Category</h2>
                                <p className="text-xs text-slate-500">Create a new service category</p>
                            </div>
                            <button
                                onClick={() => setIsCategoryModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleCreateCategory} className="space-y-5">
                            {/* Name */}
                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Category Name <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={categoryFormData.name}
                                    onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                                    required
                                    placeholder="e.g., Assessment"
                                    className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Description
                                </label>
                                <textarea
                                    value={categoryFormData.description}
                                    onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                                    rows={2}
                                    placeholder="Brief description of this category"
                                    className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all resize-none"
                                />
                            </div>

                            {/* Icon & Color Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Icon
                                    </label>
                                    <select
                                        value={categoryFormData.icon}
                                        onChange={(e) => setCategoryFormData({ ...categoryFormData, icon: e.target.value })}
                                        className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all"
                                    >
                                        {iconOptions.map((icon) => (
                                            <option key={icon.value} value={icon.value}>{icon.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Color
                                    </label>
                                    <select
                                        value={categoryFormData.color}
                                        onChange={(e) => setCategoryFormData({ ...categoryFormData, color: e.target.value })}
                                        className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all"
                                    >
                                        {colorOptions.map((color) => (
                                            <option key={color.value} value={color.value}>{color.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Order */}
                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Display Order
                                </label>
                                <input
                                    type="number"
                                    value={categoryFormData.order}
                                    onChange={(e) => setCategoryFormData({ ...categoryFormData, order: parseInt(e.target.value) || 0 })}
                                    min="0"
                                    className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all"
                                />
                            </div>

                            {/* Active Flag */}
                            <div className="flex items-center gap-2 pt-1">
                                <input
                                    type="checkbox"
                                    id="create-category-active"
                                    checked={categoryFormData.isActive}
                                    onChange={(e) => setCategoryFormData({ ...categoryFormData, isActive: e.target.checked })}
                                    className="w-4 h-4 rounded-md border-slate-300 text-[#0B192C] focus:ring-[#0B192C]"
                                />
                                <label htmlFor="create-category-active" className="text-xs font-semibold text-slate-700 cursor-pointer">
                                    Category Active
                                </label>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-5 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsCategoryModalOpen(false)}
                                    className="flex-1 px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-bold transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCategorySubmitting}
                                    className="flex-1 bg-[#0B192C] hover:bg-[#1E3E62] text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-[#0B192C]/10 transition-colors disabled:opacity-50"
                                >
                                    {isCategorySubmitting ? 'Creating...' : 'Create Category'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ============================================ */}
            {/* CREATE SERVICE MODAL */}
            {/* ============================================ */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B192C]/40 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-200">
                        <ServiceForm
                            categories={serviceCategories}
                            isSubmitting={isSubmitting}
                            onSubmit={handleCreateService}
                            onCancel={() => setIsCreateModalOpen(false)}
                            submitLabel="Create Service"
                            title="Add New Service"
                            subtitle="Create a new service offering"
                        />
                    </div>
                </div>
            )}

            {/* ============================================ */}
            {/* EDIT SERVICE MODAL */}
            {/* ============================================ */}
            {isEditModalOpen && selectedService && editFormData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B192C]/40 backdrop-blur-xs animate-in fade-in duration-150">
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
                            subtitle="Update service details"
                        />
                    </div>
                </div>
            )}

            {/* ============================================ */}
            {/* VIEW SERVICE MODAL */}
            {/* ============================================ */}
            {isViewModalOpen && selectedService && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B192C]/40 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-200">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                            <div>
                                <h2 className="text-lg font-bold text-[#0B192C]">Service Details</h2>
                                <p className="text-xs text-slate-500">ID: {selectedService.id}</p>
                            </div>
                            <button
                                onClick={() => {
                                    setIsViewModalOpen(false);
                                    setSelectedService(null);
                                }}
                                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Header */}
                            <div className="flex items-center gap-4">
                                <span className="text-4xl">{selectedService.icon}</span>
                                <div>
                                    <h3 className="text-xl font-bold text-[#0B192C]">{selectedService.title}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getCategoryBadgeColor(selectedService.category)}`}>
                                            {getCategoryLabel(selectedService.category)}
                                        </span>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(selectedService.isActive)}`}>
                                            {selectedService.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Badge */}
                            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Badge</span>
                                <span className="font-semibold text-slate-800 block mt-1">{selectedService.badge}</span>
                            </div>

                            {/* Description */}
                            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Short Description</span>
                                <p className="text-sm text-slate-700 mt-1">{selectedService.description}</p>
                            </div>

                            {/* Rich Description */}
                            {selectedService.richDescription && (
                                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Detailed Description</span>
                                    <div className="text-sm text-slate-700 mt-1 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: selectedService.richDescription }} />
                                </div>
                            )}

                            {/* Details */}
                            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Details</span>
                                <p className="text-sm text-slate-700 mt-1">{selectedService.details}</p>
                            </div>

                            {/* Price & Duration */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Price</span>
                                    <span className="font-semibold text-slate-800 block mt-1">{selectedService.price || 'N/A'}</span>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Duration</span>
                                    <span className="font-semibold text-slate-800 block mt-1">{selectedService.duration || 'N/A'}</span>
                                </div>
                            </div>

                            {/* Features */}
                            {selectedService.features.length > 0 && (
                                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Features</span>
                                    <ul className="list-disc list-inside text-sm text-slate-700 mt-1 space-y-1">
                                        {selectedService.features.map((feature, idx) => (
                                            <li key={idx}>{feature}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Process */}
                            {selectedService.process.length > 0 && (
                                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Process</span>
                                    <ol className="list-decimal list-inside text-sm text-slate-700 mt-1 space-y-1">
                                        {selectedService.process.map((step, idx) => (
                                            <li key={idx}>{step}</li>
                                        ))}
                                    </ol>
                                </div>
                            )}

                            {/* Image */}
                            {selectedService.imageUrl && (
                                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Image</span>
                                    <img src={selectedService.imageUrl} alt={selectedService.title} className="mt-2 rounded-lg max-h-48 object-cover" />
                                </div>
                            )}

                            {/* Color */}
                            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Color</span>
                                <div className={`${selectedService.color} w-16 h-8 rounded-lg mt-1 border border-slate-200`}></div>
                            </div>

                            {/* Action Text */}
                            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Action Text</span>
                                <span className="font-semibold text-slate-800 block mt-1">{selectedService.actionText}</span>
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Created</span>
                                    <span className="text-sm text-slate-700 block mt-1">{formatDate(selectedService.createdAt)}</span>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Updated</span>
                                    <span className="text-sm text-slate-700 block mt-1">{formatDate(selectedService.updatedAt)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4 mt-5 border-t border-slate-100">
                            <button
                                onClick={() => {
                                    setIsViewModalOpen(false);
                                    handleEdit(selectedService);
                                }}
                                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-colors"
                            >
                                Edit Service
                            </button>
                            <button
                                onClick={() => setIsViewModalOpen(false)}
                                className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ============================================ */}
            {/* DELETE SERVICE MODAL */}
            {/* ============================================ */}
            {isDeleteModalOpen && selectedService && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B192C]/40 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-slate-200 text-center">
                        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100 flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-[#0B192C]">Delete Service</h3>
                        <p className="text-xs text-slate-500 mt-2 mb-3 leading-relaxed">
                            Are you sure you want to delete <span className="font-bold text-slate-800">{selectedService.title}</span>?
                            This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setIsDeleteModalOpen(false);
                                    setSelectedService(null);
                                }}
                                className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteService}
                                disabled={isSubmitting}
                                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
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