// app/(admin)/products/page.tsx
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import CreateProductModal from '@/components/Admin/CreateProductModal';
import EditProductModal, { type ProductFormData } from '@/components/Admin/EditProductModal';
import ViewProductModal from '@/components/Admin/ViewProductModal';
import { isDefaultImage } from '@/utils/imageHelper';

// ============================================================================
// Types
// ============================================================================

export interface TechnicalDetails {
    powerOutput?: string;
    inputVoltage?: string;
    connectorType?: string;
    dimensions?: string;
    weight?: string;
    enclosureRating?: string;
    warranty?: string;
}

export interface Product {
    _id: string;
    id?: string;
    name: string;
    model?: string;
    brand: string;
    category: string;
    categoryLabel?: string;
    imageUrl?: string;
    galleryImages?: string[];
    price: number;
    rating?: number;
    stock: number;
    isActive: boolean;
    specs?: string[];
    features?: string[];
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
    description?: string;
    icon?: string;
    isActive: boolean;
}

export interface Category {
    _id: string;
    id?: string;
    name: string;
    description?: string;
    icon?: string;
    level?: number;
    isActive: boolean;
}

interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// ============================================================================
// Product Thumbnail Component - UPDATED
// ============================================================================
// ============================================================================
// Product Thumbnail Component - UPDATED
// ============================================================================

interface ProductThumbnailProps {
    imageUrl?: string;
    name: string;
    className?: string;
}

const ProductThumbnail: React.FC<ProductThumbnailProps> = ({
    imageUrl,
    name,
    className = '',
}) => {
    const [hasError, setHasError] = useState<boolean>(false);

    const fullUrl = useMemo(() => {
        if (!imageUrl || imageUrl.trim() === '') return null;
        const trimmed = imageUrl.trim();

        // ✅ If it's a data URL (base64), return it as is (don't prepend server URL)
        if (trimmed.startsWith('data:image')) {
            return trimmed;
        }

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
                ⚡
            </div>
        );
    }

    return (
        <img
            src={fullUrl}
            alt={name}
            className={`w-full h-full object-cover ${className}`}
            onError={() => {
                console.error('❌ Image failed to load:', fullUrl);
                setHasError(true);
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

    // ============================================================================
    // Data Fetching
    // ============================================================================

    const fetchInitialData = useCallback(async () => {
        if (!token) return;

        setIsLoading(true);
        try {
            const [productsRes, brandsRes, categoriesRes] = await Promise.all([
                apiCall<Product[]>('/products?limit=1000'),
                apiCall<Brand[]>('/brands'),
                apiCall<Category[]>('/categories'),
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
        const avgRating =
            total > 0
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
            const matchesSearch =
                !query ||
                product.name.toLowerCase().includes(query) ||
                product.model?.toLowerCase().includes(query) ||
                product.brand?.toLowerCase().includes(query);

            const matchesBrand = filterBrand === 'all' || product.brand === filterBrand;
            const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
            const matchesStatus =
                filterStatus === 'all' ||
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
            const response = await apiCall<Product>('/products', {
                method: 'POST',
                body: formData,
            });

            if (response.success && response.data) {
                setProducts((prev) => [response.data!, ...prev]);
                setIsCreateModalOpen(false);
                toast.success('Product created successfully!', { id: toastId });
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

    const handleUpdateProduct = async (data: ProductFormData) => {
        if (!token || !selectedProduct) return;

        setIsSubmitting(true);
        const toastId = toast.loading('Updating product...');

        try {
            const productId = selectedProduct.id || selectedProduct._id;
            const formData = new FormData();

            // ✅ Basic fields
            formData.append('name', data.name);
            formData.append('model', data.model);
            formData.append('brand', data.brand);
            formData.append('category', data.category);
            formData.append('categoryLabel', data.categoryLabel || '');
            formData.append('price', String(data.price));
            formData.append('rating', String(data.rating || 0));
            formData.append('stock', String(data.stock || 0));
            formData.append('isActive', String(data.isActive));
            formData.append('shortDescription', data.shortDescription || '');
            formData.append('description', data.description || '');

            // ✅ Arrays as JSON strings
            formData.append('specs', JSON.stringify(data.specs || []));
            formData.append('features', JSON.stringify(data.features || []));
            formData.append('galleryImages', JSON.stringify(data.galleryImages || []));

            // ✅ technicalDetails as JSON string
            formData.append('technicalDetails', JSON.stringify({
                powerOutput: data.technicalDetails.powerOutput.trim(),
                inputVoltage: data.technicalDetails.inputVoltage.trim(),
                connectorType: data.technicalDetails.connectorType.trim(),
                enclosureRating: data.technicalDetails.enclosureRating.trim(),
                warranty: data.technicalDetails.warranty.trim(),
                dimensions: data.technicalDetails.dimensions.trim(),
                weight: data.technicalDetails.weight.trim(),
            }));

            // ✅ FIX: Handle image upload properly
            if (data.imageUrl) {
                // Check if it's a base64 data URL (newly uploaded image)
                if (data.imageUrl.startsWith('data:image')) {
                    // Convert base64 to File
                    const file = dataURLtoFile(data.imageUrl, 'product-image.jpg');
                    formData.append('image', file);  // Send as 'image' field
                } else {
                    // It's already a path/URL, send as is
                    formData.append('imageUrl', data.imageUrl);
                }
            }

            const response = await apiCall<Product>(`/products/${productId}`, {
                method: 'PUT',
                body: formData,
            });

            if (response.success && response.data) {
                const updated = response.data;
                setProducts((prev) =>
                    prev.map((p) =>
                        (p._id && p._id === selectedProduct._id) || (p.id && p.id === selectedProduct.id)
                            ? updated
                            : p
                    )
                );
                setIsEditModalOpen(false);
                setSelectedProduct(null);
                toast.success('Product updated successfully!', { id: toastId });
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

    // ✅ Helper function to convert base64 to File
    function dataURLtoFile(dataURL: string, filename: string): File {
        const arr = dataURL.split(',');
        const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
    }

    const handleDeleteProduct = async () => {
        if (!token || !selectedProduct) return;

        setIsSubmitting(true);
        const toastId = toast.loading(`Deleting ${selectedProduct.name}...`);
        const previousProducts = [...products];

        // Optimistic UI state update
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
                toast.success('Product deleted successfully!', { id: toastId });
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

        // Optimistic UI update
        setProducts((prev) =>
            prev.map((p) =>
                p._id === product._id || (p.id && p.id === product.id)
                    ? { ...p, isActive: targetStatus }
                    : p
            )
        );

        try {
            const productId = product.id || product._id;
            const response = await apiCall(`/products/${productId}/toggle`, {
                method: 'PUT',
            });

            if (response.success) {
                toast.success(`Product ${targetStatus ? 'activated' : 'deactivated'}`);
            } else {
                // Rollback
                setProducts((prev) =>
                    prev.map((p) =>
                        p._id === product._id || (p.id && p.id === product.id)
                            ? { ...p, isActive: product.isActive }
                            : p
                    )
                );
                toast.error(response.message || 'Failed to update status');
            }
        } catch {
            // Rollback
            setProducts((prev) =>
                prev.map((p) =>
                    p._id === product._id || (p.id && p.id === product.id)
                        ? { ...p, isActive: product.isActive }
                        : p
                )
            );
            toast.error('Failed to update status');
        }
    };

    // ============================================
    // Helper Functions
    // ============================================

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

    return (
        <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8 space-y-6 container mx-auto">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Product Management</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Manage your hardware inventory, commercial hardware, and residential EV chargers.
                    </p>
                </div>
                <div className="flex items-center gap-2.5 flex-wrap">
                    <Link
                        href="/brands-management"
                        className="inline-flex items-center justify-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition"
                    >
                        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        <span>Brands</span>
                    </Link>

                    <Link
                        href="/category-management"
                        className="inline-flex items-center justify-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition"
                    >
                        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        <span>Categories</span>
                    </Link>

                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition shadow-xs hover:shadow"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        <span>Add Product</span>
                    </button>
                </div>
            </div>

            {/* KPI Overview Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Units</p>
                        <p className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 text-lg font-semibold">
                        📦
                    </div>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Active Catalog</p>
                        <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.active}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                        ✓
                    </div>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Total Stock</p>
                        <p className="text-2xl font-bold text-blue-600 mt-1">{stats.totalStock}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                        🔢
                    </div>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Avg Rating</p>
                        <p className="text-2xl font-bold text-amber-600 mt-1">★ {stats.avgRating}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                        ⭐
                    </div>
                </div>
            </div>

            {/* Filter Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
                <div className="relative flex-1">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                        </svg>
                    </span>
                    <input
                        type="text"
                        placeholder="Search by product name, model, or brand..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 text-slate-900 placeholder:text-slate-400 transition"
                    />
                </div>

                <div className="flex flex-wrap sm:flex-nowrap gap-2">
                    <select
                        value={filterBrand}
                        onChange={(e) => setFilterBrand(e.target.value)}
                        className="text-sm px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-700 font-medium transition"
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
                        className="text-sm px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-700 font-medium transition"
                    >
                        <option value="all">All Categories</option>
                        {categories
                            .filter((c) => c.level === undefined || c.level === 0)
                            .map((category) => (
                                <option key={category.id || category._id} value={category.id || category._id}>
                                    {category.name}
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
                        onClick={() => fetchInitialData()}
                        className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 transition"
                        title="Refresh inventory"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Main Product Inventory Table */}
            <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                <th className="px-6 py-4">Product Info</th>
                                <th className="px-6 py-4">Brand</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Price</th>
                                <th className="px-6 py-4">Stock</th>
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
                                        <td className="px-6 py-4"><div className="w-16 h-4 bg-slate-100 rounded" /></td>
                                        <td className="px-6 py-4"><div className="w-20 h-4 bg-slate-100 rounded" /></td>
                                        <td className="px-6 py-4"><div className="w-16 h-4 bg-slate-200 rounded" /></td>
                                        <td className="px-6 py-4"><div className="w-10 h-4 bg-slate-100 rounded" /></td>
                                        <td className="px-6 py-4"><div className="w-16 h-5 bg-slate-100 rounded-full" /></td>
                                        <td className="px-6 py-4"><div className="w-20 h-6 bg-slate-100 rounded ml-auto" /></td>
                                    </tr>
                                ))
                            ) : filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-16 text-center">
                                        <div className="max-w-xs mx-auto text-center space-y-2">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-xl text-slate-400">
                                                📦
                                            </div>
                                            <p className="text-sm font-bold text-slate-800">No products found</p>
                                            <p className="text-xs text-slate-400">Try adjusting your filters or search keywords.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map((product) => (
                                    <tr key={product._id || product.id} className="hover:bg-slate-50/60 transition-colors">
                                        {/* Product Info with Thumbnail */}
                                        <td className="px-6 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200/90 overflow-hidden shrink-0">
                                                    <ProductThumbnail
                                                        imageUrl={product.imageUrl}
                                                        name={product.name}
                                                        // ✅ Add a key that changes when image updates
                                                        key={`${product._id || product.id}-${product.imageUrl}`}
                                                    />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-slate-900 truncate">{product.name}</p>
                                                    <p className="text-xs text-slate-400 font-mono truncate">
                                                        Model: {product.model || 'N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Brand */}
                                        <td className="px-6 py-3.5 font-medium text-slate-700 whitespace-nowrap">
                                            {getBrandName(product.brand)}
                                        </td>

                                        {/* Category */}
                                        <td className="px-6 py-3.5 font-medium text-slate-700 whitespace-nowrap">
                                            {getCategoryName(product.category)}
                                        </td>

                                        {/* Price */}
                                        <td className="px-6 py-3.5 font-semibold text-slate-900 font-mono whitespace-nowrap">
                                            {formatPrice(product.price)}
                                        </td>

                                        {/* Stock */}
                                        <td className="px-6 py-3.5 font-mono whitespace-nowrap">
                                            <span
                                                className={`font-semibold ${product.stock > 10
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
                                        <td className="px-6 py-3.5 whitespace-nowrap">
                                            <span
                                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${product.isActive
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                    : 'bg-slate-100 text-slate-500 border-slate-200'
                                                    }`}
                                            >
                                                <span className={`w-1.5 h-1.5 rounded-full ${product.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                                {product.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-3.5 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => {
                                                        setSelectedProduct(product);
                                                        setIsViewModalOpen(true);
                                                    }}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition"
                                                    title="View Details"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        setSelectedProduct(product);
                                                        setIsEditModalOpen(true);
                                                    }}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
                                                    title="Edit Product"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                                    </svg>
                                                </button>

                                                <button
                                                    onClick={() => handleToggleStatus(product)}
                                                    className={`p-1.5 rounded-lg transition ${product.isActive
                                                        ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                                                        : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                                                        }`}
                                                    title={product.isActive ? 'Deactivate Product' : 'Activate Product'}
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 5.636a9 9 0 1012.728 0M12 3v9" />
                                                    </svg>
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        setSelectedProduct(product);
                                                        setIsDeleteModalOpen(true);
                                                    }}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
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
                brands={brands as any}
                categories={categories as any}
                isSubmitting={isSubmitting}
            />

            <EditProductModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedProduct(null);
                }}
                onSubmit={handleUpdateProduct}
                product={selectedProduct as any}
                brands={brands as any}
                categories={categories as any}
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
                product={selectedProduct as any}
                brands={brands as any}
                categories={categories as any}
            />

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && selectedProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl border border-slate-200 text-center">
                        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100 flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                            ⚠️
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">Delete Product</h3>
                        <p className="text-xs text-slate-500 mt-2 mb-4 leading-relaxed">
                            Are you sure you want to delete <span className="font-semibold text-slate-800">{selectedProduct.name}</span>? This action will permanently remove it from the catalog.
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    setIsDeleteModalOpen(false);
                                    setSelectedProduct(null);
                                }}
                                className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-sm font-semibold transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteProduct}
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