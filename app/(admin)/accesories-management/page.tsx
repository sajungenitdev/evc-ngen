// app/(admin)/accessories-management/page.tsx
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import AccessoryFormModal from '@/components/Admin/AccessoryFormModal';
import DeleteConfirmModal from '@/components/Admin/DeleteConfirmModal';
import { getImageUrl, isDefaultImage } from '@/utils/imageHelper';

// ============================================
// TYPES
// ============================================
interface Accessory {
    _id: string;
    id: string;
    name: string;
    model: string;
    brand: string;
    brandDetails?: {
        id: string;
        name: string;
        icon: string;
    };
    category: string;
    categoryDetails?: {
        id: string;
        name: string;
        icon: string;
    };
    categoryLabel: string;
    specs: string[];
    features: string[];
    imageUrl: string;
    galleryImages: string[];
    price: number;
    rating: number;
    stock: number;
    isActive: boolean;
    parentProductId: string | null;
    parentProductDetails?: {
        id: string;
        name: string;
        model: string;
    } | null;
    compatibleWith: string[];
    accessoryType: string;
    shortDescription: string;
    description: string;
    technicalDetails: {
        powerOutput: string;
        inputVoltage: string;
        connectorType: string;
        dimensions: string;
        weight: string;
        enclosureRating: string;
        warranty: string;
    };
    createdAt: string;
    updatedAt: string;
}

interface Brand {
    _id: string;
    id: string;
    name: string;
    icon: string;
    isActive: boolean;
}

interface Category {
    _id: string;
    id: string;
    name: string;
    icon: string;
    isActive: boolean;
    level?: number;
    parentId?: string;
}

interface Product {
    _id: string;
    id: string;
    name: string;
    model: string;
    isActive: boolean;
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
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedAccessory, setSelectedAccessory] = useState<Accessory | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterAccessoryType, setFilterAccessoryType] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');

    // ============================================
    // API Helper
    // ============================================
    const apiCall = useCallback(async (endpoint: string, options: RequestInit = {}) => {
        const isFormData = options.body instanceof FormData;
        const headers: HeadersInit = {
            Authorization: `Bearer ${token}`,
        };

        if (!isFormData) {
            headers['Content-Type'] = 'application/json';
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                ...headers,
                ...options.headers,
            },
        });
        return response.json();
    }, [token]);


    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

    // ============================================================================
    // Product Thumbnail Component
    // ============================================================================

    interface ProductThumbnailProps {
        imageUrl: string;
        name: string;
        className?: string;
    }

    const ProductThumbnail: React.FC<ProductThumbnailProps> = ({
        imageUrl,
        name,
        className = ''
    }) => {
        const [hasError, setHasError] = useState<boolean>(false);

        // ✅ Build the full URL - FIXED to remove /api
        const getFullUrl = useCallback((path: string): string | null => {
            if (!path || path.trim() === '') return null;

            const trimmed = path.trim();

            // Already a full URL
            if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
                return trimmed;
            }

            // ✅ Use the base URL without /api
            const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || 'http://localhost:5000';

            // Relative path
            if (trimmed.startsWith('/uploads')) {
                return `${baseUrl}${trimmed}`;
            }

            // Just a filename
            return `${baseUrl}/uploads/products/${trimmed}`;
        }, []);

        const fullUrl = getFullUrl(imageUrl);

        // Debug - log the URL
        console.log('🔍 Full URL:', fullUrl);

        // Check if we should show fallback
        const showFallback = !imageUrl || hasError || !fullUrl || isDefaultImage(imageUrl);

        if (showFallback) {
            return (
                <div className={`w-full h-full flex items-center justify-center bg-gray-100 ${className}`}>
                    <span className="text-2xl">⚡</span>
                </div>
            );
        }

        return (
            <img
                src={fullUrl}
                alt={name}
                className={`w-full h-full object-cover ${className}`}
                onError={(e) => {
                    console.error('❌ Failed to load image:', fullUrl);
                    setHasError(true);
                    e.currentTarget.style.display = 'none';
                }}
                loading="lazy"
            />
        );
    };

    // ============================================
    // Data Fetching
    // ============================================
    const fetchData = useCallback(async () => {
        if (!token) return;
        setIsLoading(true);
        try {
            // Fetch accessories
            const accessoriesRes = await apiCall('/accessories?limit=10000');
            console.log('📦 Accessories API Response:', accessoriesRes);

            if (accessoriesRes.success) {
                const data = accessoriesRes.data || [];
                setAccessories(data);

                if (accessoriesRes.stats) {
                    setStats(accessoriesRes.stats);
                }
            }

            // Fetch products for parent selection
            const productsRes = await apiCall('/products?limit=10000');
            if (productsRes.success) {
                setProducts(productsRes.data || []);
            }

            // Fetch brands
            const brandsRes = await apiCall('/brands');
            if (brandsRes.success) {
                const activeBrands = brandsRes.data.filter((b: Brand) => b.isActive !== false);
                setBrands(activeBrands);
                console.log('✅ Brands loaded:', activeBrands.length);
            }

            // ✅ Fetch categories - FIXED
            const categoriesRes = await apiCall('/categories');
            console.log('📦 Categories API Response:', categoriesRes);

            if (categoriesRes.success) {
                // Filter active categories
                const activeCategories = categoriesRes.data.filter((c: Category) => c.isActive !== false);
                setCategories(activeCategories);
                console.log('✅ Categories loaded:', activeCategories.length);
                console.log('✅ Categories data:', activeCategories);
            } else {
                console.error('❌ Failed to fetch categories:', categoriesRes);
            }
        } catch (error) {
            console.error('❌ Failed to fetch data:', error);
            toast.error('Failed to load data');
        } finally {
            setIsLoading(false);
        }
    }, [token, apiCall]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // ============================================
    // Filtered Accessories
    // ============================================
    const filteredAccessories = useMemo(() => {
        const query = searchTerm.toLowerCase().trim();
        return accessories.filter((acc) => {
            const matchesSearch = !query ||
                acc.name.toLowerCase().includes(query) ||
                acc.model.toLowerCase().includes(query);
            const matchesType = filterAccessoryType === 'all' || acc.accessoryType === filterAccessoryType;
            const matchesStatus = filterStatus === 'all' ||
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
            const response = await apiCall('/accessories', {
                method: 'POST',
                body: formData,
            });
            if (response.success) {
                await fetchData();
                setIsCreateModalOpen(false);
                toast.success('Accessory created!', { id: toastId });
            } else {
                toast.error(response.message || 'Failed to create', { id: toastId });
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to create', { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdate = async (formData: FormData) => {
        if (!token || !selectedAccessory) return;
        setIsSubmitting(true);
        const toastId = toast.loading('Updating accessory...');
        try {
            const response = await apiCall(`/accessories/${selectedAccessory.id}`, {
                method: 'PUT',
                body: formData,
            });
            if (response.success) {
                await fetchData();
                setIsEditModalOpen(false);
                setSelectedAccessory(null);
                toast.success('Accessory updated!', { id: toastId });
            } else {
                toast.error(response.message || 'Failed to update', { id: toastId });
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to update', { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!token || !selectedAccessory) return;
        setIsSubmitting(true);
        const toastId = toast.loading(`Deleting ${selectedAccessory.name}...`);
        try {
            const response = await apiCall(`/accessories/${selectedAccessory.id}`, {
                method: 'DELETE',
            });
            if (response.success) {
                await fetchData();
                setIsDeleteModalOpen(false);
                setSelectedAccessory(null);
                toast.success('Accessory deleted!', { id: toastId });
            } else {
                toast.error(response.message || 'Failed to delete', { id: toastId });
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete', { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleStatus = async (accessory: Accessory) => {
        if (!token) return;
        const toastId = toast.loading('Updating status...');
        try {
            const response = await apiCall(`/accessories/${accessory.id}/toggle`, {
                method: 'PUT',
            });
            if (response.success) {
                setAccessories(prev => prev.map(a =>
                    a._id === accessory._id ? { ...a, isActive: !a.isActive } : a
                ));
                await fetchData();
                toast.success(`Accessory ${accessory.isActive ? 'deactivated' : 'activated'}!`, { id: toastId });
            } else {
                toast.error(response.message || 'Failed to update status', { id: toastId });
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to update status', { id: toastId });
        }
    };

    // ============================================
    // Helper Functions
    // ============================================

    const getStatusBadge = (isActive: boolean) => isActive
        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
        : 'bg-red-50 text-red-700 border-red-200';

    const getAccessoryTypeLabel = (type: string) => {
        const found = accessoryTypes.find(t => t.value === type);
        return found?.label || type;
    };

    const getBrandName = (brandId: string) => {
        const found = brands.find(b => b.id === brandId);
        return found?.name || brandId;
    };

    const getParentProductName = (parentId: string | null) => {
        if (!parentId) return 'None';
        const found = products.find(p => p.id === parentId);
        return found?.name || parentId;
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

    // Get form data for editing
    const getEditFormData = useMemo(() => {
        if (!selectedAccessory) return null;
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

    // ============================================
    // RENDER
    // ============================================

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0B192C] mx-auto"></div>
                    <p className="text-gray-500 mt-4 text-sm">Loading accessories...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 container mx-auto pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0B192C]">
                        Accessories Management
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        Manage all product accessories ({stats.total} total)
                    </p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="inline-flex items-center justify-center gap-2 bg-[#0B192C] hover:bg-[#1E3E62] text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-[#0B192C]/10 transition-all"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Add Accessory</span>
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center shadow-xs">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</span>
                    <p className="text-2xl font-bold text-[#0B192C] mt-1">{stats.total}</p>
                </div>
                <div className="bg-white border border-emerald-200 rounded-2xl p-4 text-center shadow-xs">
                    <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Active</span>
                    <p className="text-2xl font-bold text-emerald-700 mt-1">{stats.active}</p>
                </div>
                <div className="bg-white border border-rose-200 rounded-2xl p-4 text-center shadow-xs">
                    <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider">Inactive</span>
                    <p className="text-2xl font-bold text-rose-700 mt-1">{stats.inactive}</p>
                </div>
                <div className="bg-white border border-purple-200 rounded-2xl p-4 text-center shadow-xs">
                    <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider">Types</span>
                    <p className="text-2xl font-bold text-purple-700 mt-1">{stats.byType?.length || 0}</p>
                </div>
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
                        placeholder="Search accessories..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/10 focus:border-[#0B192C] transition-all"
                    />
                </div>

                <select
                    value={filterAccessoryType}
                    onChange={(e) => setFilterAccessoryType(e.target.value)}
                    className="text-sm px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/10 focus:border-[#0B192C] text-slate-700 font-medium transition-all"
                >
                    <option value="all">All Types</option>
                    {accessoryTypes.map((type) => (
                        <option key={type.value} value={type.value}>{type.label}</option>
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

                <button onClick={fetchData} className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 transition-colors">
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
                                <th className="px-6 py-4">Accessory</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Brand</th>
                                <th className="px-6 py-4">Price</th>
                                <th className="px-6 py-4">Parent Product</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {filteredAccessories.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-16 text-center">
                                        <div className="max-w-xs mx-auto text-center space-y-2">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-400 text-xl">
                                                🔧
                                            </div>
                                            <p className="text-sm font-bold text-[#0B192C]">No accessories found</p>
                                            <p className="text-xs text-slate-400">Try adjusting your search or filters</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredAccessories.map((accessory) => (
                                    <tr key={accessory._id} className="hover:bg-slate-50/70 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                                                    {/* {accessory.imageUrl ? (
                                                        <img
                                                            src={getImageUrl(accessory.imageUrl) || ''}
                                                            alt={accessory.name}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                const target = e.target as HTMLImageElement;
                                                                target.style.display = 'none';
                                                                const parent = target.parentElement;
                                                                if (parent) {
                                                                    const fallback = document.createElement('div');
                                                                    fallback.className = 'w-full h-full flex items-center justify-center text-lg bg-slate-100';
                                                                    fallback.textContent = '🔧';
                                                                    parent.appendChild(fallback);
                                                                }
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-lg bg-slate-100">
                                                            🔧
                                                        </div>
                                                    )} */}

                                                    <ProductThumbnail
                                                        imageUrl={accessory.imageUrl}
                                                        name={accessory.name}
                                                    />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-[#0B192C]">{accessory.name}</p>
                                                    <p className="text-xs text-slate-500">Model: {accessory.model}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-blue-50 text-blue-700 border-blue-200">
                                                {getAccessoryTypeLabel(accessory.accessoryType)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {getBrandName(accessory.brand)}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-semibold text-[#0B192C]">
                                            ${accessory.price || 0}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {accessory.parentProductId ? (
                                                <span className="text-xs font-medium text-purple-600">
                                                    {getParentProductName(accessory.parentProductId)}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-slate-400">None</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(accessory.isActive)}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${accessory.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                                {accessory.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => handleEdit(accessory)}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                                    title="Edit"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleToggleStatus(accessory)}
                                                    className={`p-1.5 rounded-lg transition-colors ${accessory.isActive
                                                        ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                                                        : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                                                        }`}
                                                    title={accessory.isActive ? 'Deactivate' : 'Activate'}
                                                >
                                                    {accessory.isActive ? (
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
                                                    onClick={() => handleDeleteClick(accessory)}
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

            {/* Modals */}
            <AccessoryFormModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreate}
                brands={brands}
                products={products}
                categories={categories} // ✅ Pass categories
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
                initialData={getEditFormData}
                brands={brands}
                products={products}
                categories={categories} // ✅ Pass categories
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