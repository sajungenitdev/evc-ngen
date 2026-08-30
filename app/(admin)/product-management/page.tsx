// app/(admin)/products/page.tsx
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import CreateProductModal, { Brand, Category, ProductFormData } from '@/components/Admin/CreateProductModal';
import EditProductModal, { Product } from '@/components/Admin/EditProductModal';
import ViewProductModal from '@/components/Admin/ViewProductModal';
import Link from 'next/link';
import { getImageUrl, isDefaultImage } from '@/utils/imageHelper';

// ============================================================================
// Types
// ============================================================================

interface Product {
    _id: string;
    id: string;
    name: string;
    model: string;
    brand: string;
    category: string;
    categoryLabel: string;
    imageUrl: string;
    galleryImages: string[];
    price: number;
    rating: number;
    stock: number;
    isActive: boolean;
    specs: string[];
    features: string[];
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
    description?: string;
    icon?: string;
    isActive: boolean;
}

interface Category {
    _id: string;
    id: string;
    name: string;
    description?: string;
    icon?: string;
    level: number;
    isActive: boolean;
}

// ============================================================================
// Constants
// ============================================================================

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

// ============================================================================
// Main Products Page Component
// ============================================================================

export default function ProductsPage() {
    const { token } = useAuth();

    // State
    const [products, setProducts] = useState<Product[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    // Modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);

    // Selection
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    // Filters
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [filterBrand, setFilterBrand] = useState<string>('all');
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    // ============================================================================
    // API Helper
    // ============================================================================

    const apiCall = useCallback(
        async (endpoint: string, options: RequestInit = {}) => {
            const isFormData = options.body instanceof FormData;
            const headers: HeadersInit = { Authorization: `Bearer ${token}` };

            if (!isFormData) {
                headers['Content-Type'] = 'application/json';
            }

            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                ...options,
                headers: { ...headers, ...options.headers },
            });

            return response.json();
        },
        [token]
    );

    // ============================================================================
    // Data Fetching
    // ============================================================================

    const fetchInitialData = useCallback(async () => {
        if (!token) return;

        setIsLoading(true);
        try {
            const [productsRes, brandsRes, categoriesRes] = await Promise.all([
                apiCall('/products?limit=1000'),
                apiCall('/brands'),
                apiCall('/categories'),
            ]);

            if (productsRes.success) {
                setProducts(productsRes.data || []);
            }

            if (brandsRes.success) {
                setBrands(brandsRes.data || []);
            }

            if (categoriesRes.success) {
                setCategories(categoriesRes.data || []);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to load catalog';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [token, apiCall]);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    // ============================================================================
    // Computed Values
    // ============================================================================

    const stats = useMemo(() => {
        const total = products.length;
        const active = products.filter((p) => p.isActive).length;
        const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);
        const avgRating = total > 0
            ? products.reduce((sum, p) => sum + (p.rating || 0), 0) / total
            : 0;

        return {
            total,
            active,
            totalStock,
            avgRating: avgRating.toFixed(1),
        };
    }, [products]);

    const filteredProducts = useMemo(() => {
        const query = searchTerm.toLowerCase().trim();

        return products.filter((product) => {
            const matchesSearch = !query ||
                product.name.toLowerCase().includes(query) ||
                product.model?.toLowerCase().includes(query) ||
                product.brand?.toLowerCase().includes(query);

            const matchesBrand = filterBrand === 'all' || product.brand === filterBrand;
            const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
            const matchesStatus = filterStatus === 'all' ||
                (filterStatus === 'active' && product.isActive) ||
                (filterStatus === 'inactive' && !product.isActive);

            return matchesSearch && matchesBrand && matchesCategory && matchesStatus;
        });
    }, [products, searchTerm, filterBrand, filterCategory, filterStatus]);

    // ============================================================================
    // CRUD Handlers
    // ============================================================================

    const handleCreateProduct = async (formData: FormData) => {
        if (!token) return;

        setIsSubmitting(true);
        const toastId = toast.loading('Creating product...');

        try {
            const response = await apiCall('/products', {
                method: 'POST',
                body: formData,
            });

            if (response.success && response.data) {
                setProducts((prev) => [response.data, ...prev]);
                setIsCreateModalOpen(false);
                toast.success('Product created!', { id: toastId });
                await fetchInitialData();
            } else {
                toast.error(response?.message || 'Failed to create product', { id: toastId });
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create product';
            toast.error(errorMessage, { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateProduct = async (formData: FormData) => {
        if (!token || !selectedProduct) return;

        setIsSubmitting(true);
        const toastId = toast.loading('Updating product...');

        try {
            const productId = selectedProduct.id || selectedProduct._id;
            const response = await apiCall(`/products/${productId}`, {
                method: 'PUT',
                body: formData,
            });

            if (response.success && response.data) {
                setProducts((prev) =>
                    prev.map((p) =>
                        p._id === selectedProduct._id || p.id === selectedProduct.id
                            ? response.data
                            : p
                    )
                );
                setIsEditModalOpen(false);
                setSelectedProduct(null);
                toast.success('Product updated!', { id: toastId });
                await fetchInitialData();
            } else {
                toast.error(response?.message || 'Failed to update product', { id: toastId });
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update product';
            toast.error(errorMessage, { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteProduct = async () => {
        if (!token || !selectedProduct) return;

        setIsSubmitting(true);
        const toastId = toast.loading(`Deleting ${selectedProduct.name}...`);
        const previousProducts = [...products];

        // Optimistic update
        setProducts((prev) =>
            prev.filter((p) => p._id !== selectedProduct._id && p.id !== selectedProduct.id)
        );
        setIsDeleteModalOpen(false);

        try {
            const productId = selectedProduct.id || selectedProduct._id;
            const response = await apiCall(`/products/${productId}`, {
                method: 'DELETE',
            });

            if (response.success) {
                setSelectedProduct(null);
                toast.success('Product deleted!', { id: toastId });
                await fetchInitialData();
            } else {
                setProducts(previousProducts);
                toast.error(response?.message || 'Deletion failed', { id: toastId });
            }
        } catch (error) {
            setProducts(previousProducts);
            const errorMessage = error instanceof Error ? error.message : 'Failed to delete product';
            toast.error(errorMessage, { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleStatus = async (product: Product) => {
        if (!token) return;

        const targetStatus = !product.isActive;

        // Optimistic update
        setProducts((prev) =>
            prev.map((p) =>
                p._id === product._id || p.id === product.id
                    ? { ...p, isActive: targetStatus }
                    : p
            )
        );

        try {
            const productId = product.id || product._id;
            const response = await apiCall(`/products/${productId}/toggle`, {
                method: 'PUT',
            });

            if (!response.success) {
                // Rollback on failure
                setProducts((prev) =>
                    prev.map((p) =>
                        p._id === product._id || p.id === product.id
                            ? { ...p, isActive: product.isActive }
                            : p
                    )
                );
                toast.error('Failed to update status');
            }
        } catch (error) {
            // Rollback on error
            setProducts((prev) =>
                prev.map((p) =>
                    p._id === product._id || p.id === product.id
                        ? { ...p, isActive: product.isActive }
                        : p
                )
            );
            toast.error('Failed to update status');
        }
    };

    // ============================================================================
    // Helper Functions
    // ============================================================================

    const formatPrice = (price: number): string => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(price || 0);
    };

    const getBrandName = (brandId: string): string => {
        const brand = brands.find((b) => b.id === brandId || b._id === brandId);
        return brand?.name || brandId;
    };

    const getCategoryName = (categoryId: string): string => {
        const category = categories.find((c) => c.id === categoryId || c._id === categoryId);
        return category?.name || categoryId;
    };

    // ============================================================================
    // Render
    // ============================================================================

    return (
        <div className="space-y-6 container mx-auto pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0B192C]">
                        Product Management
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        Manage your commercial and residential EV charging catalog.
                    </p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    <Link
                        href="/brands-management"
                        className="inline-flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-purple-600/20 transition-all shrink-0"
                    >
                        <svg className="w-4 h-4 text-purple-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Add Brand</span>
                    </Link>

                    <Link
                        href="/category-management"
                        className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition-all shrink-0"
                    >
                        <svg className="w-4 h-4 text-emerald-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Add Category</span>
                    </Link>

                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-blue-600/20 transition-all shrink-0"
                    >
                        <svg className="w-4 h-4 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Add Product</span>
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Units</span>
                    <p className="text-2xl sm:text-3xl font-bold text-[#0B192C] font-mono mt-1.5">{stats.total}</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                    <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Active Catalog</span>
                    <p className="text-2xl sm:text-3xl font-bold text-[#0B192C] font-mono mt-1.5">{stats.active}</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                    <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Total Stock</span>
                    <p className="text-2xl sm:text-3xl font-bold text-[#0B192C] font-mono mt-1.5">{stats.totalStock}</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                    <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">Avg Rating</span>
                    <p className="text-2xl sm:text-3xl font-bold text-[#0B192C] font-mono mt-1.5">⭐ {stats.avgRating}</p>
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
                        placeholder="Search by name, model, or brand..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/10 focus:border-[#0B192C] text-slate-800 transition-all placeholder:text-slate-400"
                    />
                </div>

                <select
                    value={filterBrand}
                    onChange={(e) => setFilterBrand(e.target.value)}
                    className="text-xs sm:text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/10 focus:border-[#0B192C] text-slate-700 font-medium transition-all"
                >
                    <option value="all">All Brands</option>
                    {brands.map((brand) => (
                        <option key={brand.id || brand._id} value={brand.id || brand._id}>
                            {brand.name}
                        </option>
                    ))}
                </select>

                <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="text-xs sm:text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/10 focus:border-[#0B192C] text-slate-700 font-medium transition-all"
                >
                    <option value="all">All Categories</option>
                    {categories
                        .filter((c) => c.level === 0)
                        .map((category) => (
                            <option key={category.id || category._id} value={category.id || category._id}>
                                {category.name}
                            </option>
                        ))}
                </select>

                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="text-xs sm:text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/10 focus:border-[#0B192C] text-slate-700 font-medium transition-all"
                >
                    <option value="all">All Status</option>
                    <option value="active">Active Only</option>
                    <option value="inactive">Inactive Only</option>
                </select>

                <button
                    onClick={() => fetchInitialData()}
                    aria-label="Refresh product list"
                    className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 hover:text-[#0B192C] transition-colors focus:outline-none"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.03 8.03 0 01-15.357-2m15.357 2H15" />
                    </svg>
                </button>
            </div>

            {/* Product Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                <th className="px-6 py-4">Product Info</th>
                                <th className="px-6 py-4">Brand</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Price</th>
                                <th className="px-6 py-4">Stock</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                            {isLoading ? (
                                // Loading skeletons
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-slate-200" />
                                                <div className="space-y-1.5">
                                                    <div className="w-28 h-3.5 bg-slate-200 rounded" />
                                                    <div className="w-20 h-2.5 bg-slate-100 rounded" />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4"><div className="w-16 h-3.5 bg-slate-200 rounded" /></td>
                                        <td className="px-6 py-4"><div className="w-16 h-3.5 bg-slate-200 rounded" /></td>
                                        <td className="px-6 py-4"><div className="w-16 h-3.5 bg-slate-200 rounded" /></td>
                                        <td className="px-6 py-4"><div className="w-8 h-3.5 bg-slate-200 rounded" /></td>
                                        <td className="px-6 py-4"><div className="w-16 h-5 bg-slate-200 rounded-full" /></td>
                                        <td className="px-6 py-4"><div className="w-20 h-6 bg-slate-200 rounded ml-auto" /></td>
                                    </tr>
                                ))
                            ) : filteredProducts.length === 0 ? (
                                // Empty state
                                <tr>
                                    <td colSpan={7} className="px-6 py-16 text-center">
                                        <div className="max-w-xs mx-auto text-center space-y-2">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-400 text-xl">
                                                📦
                                            </div>
                                            <p className="text-sm font-bold text-[#0B192C]">No products found</p>
                                            <p className="text-xs text-slate-400">Try adjusting your filters or search keywords.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                // Product rows
                                filteredProducts.map((product) => (
                                    <tr key={product._id || product.id} className="hover:bg-slate-50/80 transition-colors">
                                        {/* Product Info with Thumbnail */}
                                        <td className="px-6 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200/90 overflow-hidden shadow-2xs shrink-0">
                                                    <ProductThumbnail
                                                        imageUrl={product.imageUrl}
                                                        name={product.name}
                                                    />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-[#0B192C] truncate">{product.name}</p>
                                                    <p className="text-[11px] text-slate-400 font-mono truncate">
                                                        Model: {product.model || 'N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Brand */}
                                        <td className="px-6 py-3.5 font-medium text-slate-700">
                                            {getBrandName(product.brand)}
                                        </td>

                                        {/* Category */}
                                        <td className="px-6 py-3.5 font-medium text-slate-700">
                                            {getCategoryName(product.category)}
                                        </td>

                                        {/* Price */}
                                        <td className="px-6 py-3.5 font-bold text-[#0B192C] font-mono">
                                            {formatPrice(product.price)}
                                        </td>

                                        {/* Stock */}
                                        <td className="px-6 py-3.5 font-mono">
                                            <span
                                                className={`font-bold ${product.stock > 10
                                                    ? 'text-emerald-600'
                                                    : product.stock > 0
                                                        ? 'text-amber-600'
                                                        : 'text-rose-600'
                                                    }`}
                                            >
                                                {product.stock || 0}
                                            </span>
                                        </td>

                                        {/* Status */}
                                        <td className="px-6 py-3.5">
                                            <span
                                                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${product.isActive
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                                                    : 'bg-rose-50 text-rose-700 border-rose-200/80'
                                                    }`}
                                            >
                                                <span
                                                    className={`w-1.5 h-1.5 rounded-full ${product.isActive ? 'bg-emerald-500' : 'bg-rose-500'
                                                        }`}
                                                />
                                                {product.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-3.5 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                {/* View Button */}
                                                <button
                                                    onClick={() => {
                                                        setSelectedProduct(product);
                                                        setIsViewModalOpen(true);
                                                    }}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                                                    title="View Details"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                </button>

                                                {/* Edit Button */}
                                                <button
                                                    onClick={() => {
                                                        setSelectedProduct(product);
                                                        setIsEditModalOpen(true);
                                                    }}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                                    title="Edit Product"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                                    </svg>
                                                </button>

                                                {/* Toggle Status Button */}
                                                <button
                                                    onClick={() => handleToggleStatus(product)}
                                                    className={`p-1.5 rounded-lg transition-colors ${product.isActive
                                                        ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                                                        : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                                                        }`}
                                                    title={product.isActive ? 'Deactivate Product' : 'Activate Product'}
                                                >
                                                    {product.isActive ? (
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                    )}
                                                </button>

                                                {/* Delete Button */}
                                                <button
                                                    onClick={() => {
                                                        setSelectedProduct(product);
                                                        setIsDeleteModalOpen(true);
                                                    }}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                                    title="Delete Product"
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
            <CreateProductModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreateProduct}
                brands={brands}
                categories={categories}
                isSubmitting={isSubmitting}
            />

            <EditProductModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedProduct(null);
                }}
                onSubmit={handleUpdateProduct}
                product={selectedProduct}
                brands={brands}
                categories={categories}
                isSubmitting={isSubmitting}
            />

            <ViewProductModal
                isOpen={isViewModalOpen}
                onClose={() => {
                    setIsViewModalOpen(false);
                    setSelectedProduct(null);
                }}
                onEdit={() => {
                    setIsViewModalOpen(false);
                    setIsEditModalOpen(true);
                }}
                product={selectedProduct}
                brands={brands}
                categories={categories}
            />

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && selectedProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B192C]/40 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-slate-200 text-center">
                        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100 flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-[#0B192C]">Delete Product</h3>
                        <p className="text-xs text-slate-500 mt-2 mb-4 leading-relaxed">
                            Are you sure you want to delete <span className="font-bold text-slate-800">{selectedProduct.name}</span>? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setIsDeleteModalOpen(false);
                                    setSelectedProduct(null);
                                }}
                                className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteProduct}
                                disabled={isSubmitting}
                                className="flex-1 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-rose-600/20 transition-colors disabled:opacity-50"
                            >
                                {isSubmitting ? 'Deleting...' : 'Confirm Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}