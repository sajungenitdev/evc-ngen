// app/(admin)/accessories-management/page.tsx
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import AccessoryFormModal from '@/components/Admin/AccessoryFormModal';
import DeleteConfirmModal from '@/components/Admin/DeleteConfirmModal';
import { isDefaultImage } from '@/utils/imageHelper';
import { Edit, Plus, Power, PowerOff, RefreshCw, Search, Trash2 } from 'lucide-react';

// ============================================
// TYPES
// ============================================

export interface TechnicalDetails {
    powerOutput?: string;
    inputVoltage?: string;
    connectorType?: string;
    dimensions?: string;
    weight?: string;
    enclosureRating?: string;
    warranty?: string;
}

export interface Accessory {
    _id: string;
    id?: string;
    name: string;
    model: string;
    brand: string;
    brandDetails?: {
        id: string;
        name: string;
        icon: string;
    };
    category?: string;
    categoryDetails?: {
        id: string;
        name: string;
        icon: string;
    };
    categoryLabel?: string;
    specs?: string[];
    features?: string[];
    imageUrl?: string;
    galleryImages?: string[];
    price: number;
    rating?: number;
    stock: number;
    isActive: boolean;
    parentProductId?: string | null;
    parentProductDetails?: {
        id: string;
        name: string;
        model: string;
    } | null;
    compatibleWith?: string[];
    accessoryType: string;
    shortDescription?: string;
    description?: string;
    technicalDetails?: TechnicalDetails;
    createdAt: string;
    updatedAt: string;
}

export interface Brand {
    _id: string;
    id?: string;
    name: string;
    icon?: string;
    isActive: boolean;
}

export interface Category {
    _id: string;
    id?: string;
    name: string;
    icon?: string;
    isActive: boolean;
    level?: number;
    parentId?: string;
}

export interface Product {
    _id: string;
    id?: string;
    name: string;
    model: string;
    isActive: boolean;
}

interface ApiResponse<T> {
    success: boolean;
    data?: T;
    stats?: {
        total: number;
        active: number;
        inactive: number;
        byType: { _id: string; count: number }[];
    };
    message?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// ============================================
// CONSTANTS
// ============================================

const accessoryTypes = [
    { value: 'cable', label: '🔌 Cable' },
    { value: 'adapter', label: '🔗 Adapter' },
    { value: 'mount', label: '📍 Mount' },
    { value: 'rfid', label: '💳 RFID' },
    { value: 'management', label: '📜 Management' },
    { value: 'cover', label: '🛡️ Cover' },
    { value: 'pedestal', label: '🏗️ Pedestal' },
    { value: 'meter', label: '📊 Meter' },
    { value: 'signage', label: '🚧 Signage' },
    { value: 'replacement', label: '🔧 Replacement' },
    { value: 'other', label: '📦 Other' },
];

// ============================================
// Thumbnail Component
// ============================================

interface AccessoryThumbnailProps {
    imageUrl?: string;
    name: string;
    className?: string;
}

const AccessoryThumbnail: React.FC<AccessoryThumbnailProps> = ({
    imageUrl,
    name,
    className = '',
}) => {
    const [hasError, setHasError] = useState<boolean>(false);

    const fullUrl = useMemo(() => {
        if (!imageUrl || imageUrl.trim() === '') return null;
        const trimmed = imageUrl.trim();

        if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
            return trimmed;
        }

        const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || 'http://localhost:5000';

        if (trimmed.startsWith('/uploads')) {
            return `${baseUrl}${trimmed}`;
        }

        return `${baseUrl}/uploads/products/${trimmed}`;
    }, [imageUrl]);

    const showFallback = !imageUrl || hasError || !fullUrl || isDefaultImage(imageUrl);

    if (showFallback) {
        return (
            <div className={`w-full h-full flex items-center justify-center bg-slate-100 text-slate-400 font-semibold text-xs ${className}`}>
                🔧
            </div>
        );
    }

    return (
        <img
            src={fullUrl}
            alt={name}
            className={`w-full h-full object-cover ${className}`}
            onError={() => setHasError(true)}
            loading="lazy"
        />
    );
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function AccessoriesManagementPage() {
    const { token } = useAuth();

    // State
    const [accessories, setAccessories] = useState<Accessory[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        inactive: 0,
        byType: [] as { _id: string; count: number }[],
    });
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
    const [selectedAccessory, setSelectedAccessory] = useState<Accessory | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [filterAccessoryType, setFilterAccessoryType] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    // ============================================
    // API Helper
    // ============================================

    const apiCall = useCallback(
        async <T,>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> => {
            const isFormData = options.body instanceof FormData;
            const headers: Record<string, string> = {
                Authorization: `Bearer ${token}`,
            };

            if (!isFormData) {
                headers['Content-Type'] = 'application/json';
            }

            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                ...options,
                headers: {
                    ...headers,
                    ...(options.headers as Record<string, string>),
                },
            });
            return response.json();
        },
        [token]
    );

    // ============================================
    // Data Fetching
    // ============================================

    const fetchData = useCallback(async () => {
        if (!token) return;
        setIsLoading(true);
        try {
            const [accessoriesRes, productsRes, brandsRes, categoriesRes] = await Promise.all([
                apiCall<Accessory[]>('/accessories?limit=10000'),
                apiCall<Product[]>('/products?limit=10000'),
                apiCall<Brand[]>('/brands'),
                apiCall<Category[]>('/categories'),
            ]);

            if (accessoriesRes.success) {
                const data = accessoriesRes.data || [];
                setAccessories(data);

                if (accessoriesRes.stats) {
                    setStats(accessoriesRes.stats);
                } else {
                    setStats({
                        total: data.length,
                        active: data.filter((a) => a.isActive).length,
                        inactive: data.filter((a) => !a.isActive).length,
                        byType: [],
                    });
                }
            }

            if (productsRes.success) {
                setProducts(productsRes.data || []);
            }

            if (brandsRes.success) {
                const activeBrands = (brandsRes.data || []).filter((b) => b.isActive !== false);
                setBrands(activeBrands);
            }

            if (categoriesRes.success) {
                const activeCategories = (categoriesRes.data || []).filter((c) => c.isActive !== false);
                setCategories(activeCategories);
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to load data';
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    }, [token, apiCall]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // ============================================
    // Filter Logic
    // ============================================

    const filteredAccessories = useMemo(() => {
        const query = searchTerm.toLowerCase().trim();
        return accessories.filter((acc) => {
            const matchesSearch =
                !query ||
                acc.name.toLowerCase().includes(query) ||
                acc.model.toLowerCase().includes(query);
            const matchesType = filterAccessoryType === 'all' || acc.accessoryType === filterAccessoryType;
            const matchesStatus =
                filterStatus === 'all' ||
                (filterStatus === 'active' && acc.isActive) ||
                (filterStatus === 'inactive' && !acc.isActive);
            return matchesSearch && matchesType && matchesStatus;
        });
    }, [accessories, searchTerm, filterAccessoryType, filterStatus]);

    // ============================================
    // CRUD Handlers
    // ============================================

    const handleCreate = async (formData: FormData) => {
        if (!token) return;
        setIsSubmitting(true);
        const toastId = toast.loading('Creating accessory...');
        try {
            const response = await apiCall<Accessory>('/accessories', {
                method: 'POST',
                body: formData,
            });
            if (response.success) {
                await fetchData();
                setIsCreateModalOpen(false);
                toast.success('Accessory created successfully!', { id: toastId });
            } else {
                toast.error(response.message || 'Failed to create accessory', { id: toastId });
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to create accessory';
            toast.error(message, { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdate = async (formData: FormData) => {
        if (!token || !selectedAccessory) return;
        setIsSubmitting(true);
        const toastId = toast.loading('Updating accessory...');

        // Store current status for rollback
        const previousStatus = selectedAccessory.isActive;

        try {
            const accessoryId = selectedAccessory.id || selectedAccessory._id;
            const response = await apiCall<Accessory>(`/accessories/${accessoryId}`, {
                method: 'PUT',
                body: formData,
            });
            if (response.success) {
                await fetchData();
                setIsEditModalOpen(false);
                setSelectedAccessory(null);
                toast.success('Accessory updated successfully!', { id: toastId });
            } else {
                toast.error(response.message || 'Failed to update accessory', { id: toastId });
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to update accessory';
            toast.error(message, { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!token || !selectedAccessory) return;
        setIsSubmitting(true);
        const toastId = toast.loading(`Deleting ${selectedAccessory.name}...`);

        // Store the accessory for stats update
        const deletedAccessory = selectedAccessory;

        try {
            const accessoryId = selectedAccessory.id || selectedAccessory._id;
            const response = await apiCall(`/accessories/${accessoryId}`, {
                method: 'DELETE',
            });
            if (response.success) {
                // Update stats immediately
                setStats((prev) => ({
                    ...prev,
                    total: prev.total - 1,
                    active: deletedAccessory.isActive ? prev.active - 1 : prev.active,
                    inactive: !deletedAccessory.isActive ? prev.inactive - 1 : prev.inactive,
                }));

                await fetchData();
                setIsDeleteModalOpen(false);
                setSelectedAccessory(null);
                toast.success('Accessory deleted successfully!', { id: toastId });
            } else {
                toast.error(response.message || 'Failed to delete accessory', { id: toastId });
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to delete accessory';
            toast.error(message, { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleStatus = async (accessory: Accessory) => {
        if (!token) return;
        const targetStatus = !accessory.isActive;
        const accessoryId = accessory.id || accessory._id;

        // Optimistic update
        setAccessories((prev) =>
            prev.map((a) =>
                a._id === accessory._id || (a.id && a.id === accessory.id)
                    ? { ...a, isActive: targetStatus }
                    : a
            )
        );

        // Update stats immediately
        setStats((prev) => ({
            ...prev,
            active: targetStatus ? prev.active + 1 : prev.active - 1,
            inactive: targetStatus ? prev.inactive - 1 : prev.inactive + 1,
        }));

        try {
            const response = await apiCall(`/accessories/${accessoryId}/toggle`, {
                method: 'PUT',
            });
            if (response.success) {
                toast.success(`Accessory ${targetStatus ? 'activated' : 'deactivated'}!`);
                // Refresh to get latest data
                await fetchData();
            } else {
                // Rollback
                setAccessories((prev) =>
                    prev.map((a) =>
                        a._id === accessory._id || (a.id && a.id === accessory.id)
                            ? { ...a, isActive: accessory.isActive }
                            : a
                    )
                );
                // Rollback stats
                setStats((prev) => ({
                    ...prev,
                    active: accessory.isActive ? prev.active + 1 : prev.active - 1,
                    inactive: accessory.isActive ? prev.inactive - 1 : prev.inactive + 1,
                }));
                toast.error(response.message || 'Failed to update status');
            }
        } catch {
            // Rollback
            setAccessories((prev) =>
                prev.map((a) =>
                    a._id === accessory._id || (a.id && a.id === accessory.id)
                        ? { ...a, isActive: accessory.isActive }
                        : a
                )
            );
            // Rollback stats
            setStats((prev) => ({
                ...prev,
                active: accessory.isActive ? prev.active + 1 : prev.active - 1,
                inactive: accessory.isActive ? prev.inactive - 1 : prev.inactive + 1,
            }));
            toast.error('Failed to update status');
        }
    };

    // ============================================
    // Helper Functions
    // ============================================

    const getAccessoryTypeLabel = (type: string) => {
        const found = accessoryTypes.find((t) => t.value === type);
        return found?.label || type;
    };

    const getBrandName = (brandId: string) => {
        const found = brands.find((b) => b.id === brandId || b._id === brandId);
        return found?.name || brandId;
    };

    const getParentProductName = (parentId: string | null | undefined) => {
        if (!parentId) return 'None';
        const found = products.find((p) => p.id === parentId || p._id === parentId);
        return found ? `${found.name} (${found.model})` : parentId;
    };

    // ============================================
    // Modal Handlers
    // ============================================

    const handleEdit = (accessory: Accessory) => {
        setSelectedAccessory(accessory);
        setIsEditModalOpen(true);
    };

    const handleDeleteClick = (accessory: Accessory) => {
        setSelectedAccessory(accessory);
        setIsDeleteModalOpen(true);
    };

    const getEditFormData = useMemo(() => {
        if (!selectedAccessory) return undefined;
        return {
            name: selectedAccessory.name,
            model: selectedAccessory.model,
            brand: selectedAccessory.brand,
            category: selectedAccessory.category || '',
            categoryLabel: selectedAccessory.categoryLabel || '',
            imageUrl: selectedAccessory.imageUrl || '',
            galleryImages: selectedAccessory.galleryImages || [],
            price: selectedAccessory.price || 0,
            rating: selectedAccessory.rating || 0,
            specs: selectedAccessory.specs || [],
            shortDescription: selectedAccessory.shortDescription || '',
            description: selectedAccessory.description || '',
            features: selectedAccessory.features || [],
            technicalDetails: selectedAccessory.technicalDetails || {
                powerOutput: '',
                inputVoltage: '',
                connectorType: '',
                dimensions: '',
                weight: '',
                enclosureRating: '',
                warranty: '',
            },
            stock: selectedAccessory.stock || 0,
            isActive: selectedAccessory.isActive,
            isAccessory: true,
            parentProductId: selectedAccessory.parentProductId || '',
            compatibleWith: selectedAccessory.compatibleWith || [],
            accessoryType: selectedAccessory.accessoryType || 'other',
        };
    }, [selectedAccessory]);

    return (
        <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8 space-y-6 container mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Accessories Management</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Configure compatible accessories, cables, mounts, and replacement hardware components.
                    </p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition shadow-xs hover:shadow"
                >
                    <Plus className="w-4 h-4" />
                    <span>Add Accessory</span>
                </button>
            </div>

            {/* KPI Overview Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Units</p>
                        <p className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 text-lg font-semibold">
                        🔧
                    </div>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Active Status</p>
                        <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.active}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                        ✓
                    </div>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Inactive Units</p>
                        <p className="text-2xl font-bold text-slate-400 mt-1">{stats.inactive}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center font-bold">
                        ✕
                    </div>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider">Categories</p>
                        <p className="text-2xl font-bold text-purple-700 mt-1">{stats.byType?.length || accessoryTypes.length}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                        📦
                    </div>
                </div>
            </div>

            {/* Filter Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
                <div className="relative flex-1 min-w-[200px]">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Search className="w-4 h-4" />
                    </span>
                    <input
                        type="text"
                        placeholder="Search accessories by name or model..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 text-slate-900 placeholder:text-slate-400 transition"
                    />
                </div>

                <div className="flex flex-wrap sm:flex-nowrap gap-2">
                    <select
                        value={filterAccessoryType}
                        onChange={(e) => setFilterAccessoryType(e.target.value)}
                        className="text-sm px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-700 font-medium transition"
                    >
                        <option value="all">All Types</option>
                        {accessoryTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </select>

                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="text-sm px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-700 font-medium transition"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active Only</option>
                        <option value="inactive">Inactive Only</option>
                    </select>

                    <button
                        onClick={fetchData}
                        className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 transition"
                        title="Refresh list"
                    >
                        <RefreshCw className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Main Table */}
            <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                <th className="px-6 py-4">Accessory Profile</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Brand</th>
                                <th className="px-6 py-4">Price</th>
                                <th className="px-6 py-4">Parent Product</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-slate-200" />
                                                <div className="space-y-1.5">
                                                    <div className="w-32 h-3.5 bg-slate-200 rounded" />
                                                    <div className="w-20 h-2.5 bg-slate-100 rounded" />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4"><div className="w-16 h-5 bg-slate-100 rounded-full" /></td>
                                        <td className="px-6 py-4"><div className="w-16 h-4 bg-slate-100 rounded" /></td>
                                        <td className="px-6 py-4"><div className="w-12 h-4 bg-slate-200 rounded" /></td>
                                        <td className="px-6 py-4"><div className="w-24 h-4 bg-slate-100 rounded" /></td>
                                        <td className="px-6 py-4"><div className="w-16 h-5 bg-slate-100 rounded-full" /></td>
                                        <td className="px-6 py-4"><div className="w-20 h-6 bg-slate-100 rounded ml-auto" /></td>
                                    </tr>
                                ))
                            ) : filteredAccessories.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-16 text-center">
                                        <div className="max-w-xs mx-auto text-center space-y-2">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-xl text-slate-400">
                                                🔧
                                            </div>
                                            <p className="text-sm font-bold text-slate-900">No accessories found</p>
                                            <p className="text-xs text-slate-400">Try adjusting your filters or search terms.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredAccessories.map((accessory) => (
                                    <tr key={accessory._id || accessory.id} className="hover:bg-slate-50/60 transition-colors">
                                        {/* Accessory Info */}
                                        <td className="px-6 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200/90 overflow-hidden shrink-0">
                                                    <AccessoryThumbnail
                                                        imageUrl={accessory.imageUrl}
                                                        name={accessory.name}
                                                    />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-slate-900 truncate">{accessory.name}</p>
                                                    <p className="text-xs text-slate-400 font-mono truncate">Model: {accessory.model}</p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Type */}
                                        <td className="px-6 py-3.5 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border bg-blue-50 text-blue-700 border-blue-200">
                                                {getAccessoryTypeLabel(accessory.accessoryType)}
                                            </span>
                                        </td>

                                        {/* Brand */}
                                        <td className="px-6 py-3.5 font-medium text-slate-700 whitespace-nowrap">
                                            {accessory.brandDetails?.name || getBrandName(accessory.brand)}
                                        </td>

                                        {/* Price */}
                                        <td className="px-6 py-3.5 font-semibold text-slate-900 font-mono whitespace-nowrap">
                                            ${accessory.price || 0}
                                        </td>

                                        {/* Parent Product */}
                                        <td className="px-6 py-3.5 whitespace-nowrap">
                                            {accessory.parentProductId ? (
                                                <span className="text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-lg">
                                                    {accessory.parentProductDetails
                                                        ? `${accessory.parentProductDetails.name} (${accessory.parentProductDetails.model})`
                                                        : getParentProductName(accessory.parentProductId)}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-slate-400">—</span>
                                            )}
                                        </td>

                                        {/* Status */}
                                        <td className="px-6 py-3.5 whitespace-nowrap">
                                            <span
                                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${accessory.isActive
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                    : 'bg-slate-100 text-slate-500 border-slate-200'
                                                    }`}
                                            >
                                                <span className={`w-1.5 h-1.5 rounded-full ${accessory.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                                {accessory.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-3.5 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => handleEdit(accessory)}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>

                                                <button
                                                    onClick={() => handleToggleStatus(accessory)}
                                                    className={`p-1.5 rounded-lg transition ${accessory.isActive
                                                            ? 'text-emerald-600 hover:text-amber-600 hover:bg-amber-50'
                                                            : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                                                        }`}
                                                    title={accessory.isActive ? 'Deactivate' : 'Activate'}
                                                >
                                                    {accessory.isActive ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                                                </button>

                                                <button
                                                    onClick={() => handleDeleteClick(accessory)}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
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

            {/* Modals */}
            <AccessoryFormModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreate}
                brands={brands as any}
                products={products as any}
                categories={categories as any}
                isSubmitting={isSubmitting}
                title="Add New Accessory"
                submitLabel="Create Accessory"
            />

            <AccessoryFormModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedAccessory(null);
                }}
                onSubmit={handleUpdate}
                initialData={getEditFormData as any}
                brands={brands as any}
                products={products as any}
                categories={categories as any}
                isSubmitting={isSubmitting}
                title="Edit Accessory"
                submitLabel="Update Accessory"
            />

            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedAccessory(null);
                }}
                onConfirm={handleDelete}
                title="Delete Accessory"
                itemName={selectedAccessory?.name || ''}
                isSubmitting={isSubmitting}
            />
        </div>
    );
}