// app/(admin)/products/page.tsx
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { 
    Power, 
    PowerOff, 
    Eye, 
    Edit, 
    Trash2, 
    Plus, 
    Search, 
    RefreshCw,
    AlertTriangle,
    X,
    Check
} from 'lucide-react';
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
// Show Confirmation Toast
// ============================================================================

const showConfirmation = (options: {
    title: string;
    message: string;
    subMessage?: string;
    warning?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    type?: 'warning' | 'danger' | 'info';
}): Promise<boolean> => {
    return new Promise((resolve) => {
        const {
            title,
            message,
            subMessage,
            warning,
            confirmLabel = 'Continue',
            cancelLabel = 'Cancel',
            type = 'warning',
        } = options;

        const colors = {
            warning: {
                bg: 'bg-amber-100',
                text: 'text-amber-600',
                button: 'bg-amber-600 hover:bg-amber-700',
                border: 'border-amber-200',
            },
            danger: {
                bg: 'bg-rose-100',
                text: 'text-rose-600',
                button: 'bg-rose-600 hover:bg-rose-700',
                border: 'border-rose-200',
            },
            info: {
                bg: 'bg-blue-100',
                text: 'text-blue-600',
                button: 'bg-blue-600 hover:bg-blue-700',
                border: 'border-blue-200',
            },
        };

        const color = colors[type];

        toast.custom(
            (t) => (
                <div
                    className={`${
                        t.visible ? 'animate-enter' : 'animate-leave'
                    } max-w-md w-full bg-white shadow-2xl rounded-2xl border border-slate-200 pointer-events-auto overflow-hidden`}
                >
                    <div className="p-6">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0">
                                <div className={`w-10 h-10 rounded-full ${color.bg} flex items-center justify-center`}>
                                    <AlertTriangle className={`w-5 h-5 ${color.text}`} />
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-bold text-slate-900">{title}</h3>
                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{message}</p>
                                {subMessage && (
                                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{subMessage}</p>
                                )}
                                {warning && (
                                    <p className="text-xs font-medium text-amber-600 mt-2">{warning}</p>
                                )}
                            </div>
                            <button
                                onClick={() => {
                                    toast.dismiss(t.id);
                                    resolve(false);
                                }}
                                className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex gap-2 mt-5 pt-4 border-t border-slate-100">
                            <button
                                onClick={() => {
                                    toast.dismiss(t.id);
                                    resolve(false);
                                }}
                                className="flex-1 px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold transition"
                            >
                                {cancelLabel}
                            </button>
                            <button
                                onClick={() => {
                                    toast.dismiss(t.id);
                                    resolve(true);
                                }}
                                className={`flex-1 px-4 py-2 text-white rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2 ${color.button}`}
                            >
                                <Check className="w-4 h-4" />
                                {confirmLabel}
                            </button>
                        </div>
                    </div>
                </div>
            ),
            {
                duration: Infinity,
                position: 'top-center',
            }
        );
    });
};

// ============================================================================
// Product Thumbnail Component
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

            formData.append('specs', JSON.stringify(data.specs || []));
            formData.append('features', JSON.stringify(data.features || []));
            formData.append('galleryImages', JSON.stringify(data.galleryImages || []));

            formData.append('technicalDetails', JSON.stringify({
                powerOutput: data.technicalDetails.powerOutput.trim(),
                inputVoltage: data.technicalDetails.inputVoltage.trim(),
                connectorType: data.technicalDetails.connectorType.trim(),
                enclosureRating: data.technicalDetails.enclosureRating.trim(),
                warranty: data.technicalDetails.warranty.trim(),
                dimensions: data.technicalDetails.dimensions.trim(),
                weight: data.technicalDetails.weight.trim(),
            }));

            if (data.imageUrl) {
                if (data.imageUrl.startsWith('data:image')) {
                    const file = dataURLtoFile(data.imageUrl, 'product-image.jpg');
                    formData.append('image', file);
                } else {
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

    // ============================================================================
    // UPDATED: handleToggleStatus with Lucide icons and custom confirmation
    // ============================================================================

    const handleToggleStatus = async (product: Product) => {
        if (!token) return;

        const targetStatus = !product.isActive;

        // Show custom confirmation if deactivating
        if (!targetStatus) {
            const hasAccessories = false; // You can check for accessories if needed
            const confirmDeactivate = await showConfirmation({
                title: 'Deactivate Product?',
                message: `You are about to deactivate "${product.name}".`,
                subMessage: hasAccessories ? 'This product has accessories that will also be deactivated.' : undefined,
                warning: '⚠️ This will remove the product from the public catalog.',
                confirmLabel: 'Deactivate',
                cancelLabel: 'Cancel',
                type: 'warning',
            });

            if (!confirmDeactivate) return;
        }

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
                toast.success(`Product ${targetStatus ? 'activated' : 'deactivated'} successfully`);
                await fetchInitialData();
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
                        <Plus className="w-4 h-4 text-slate-400" />
                        <span>Brands</span>
                    </Link>

                    <Link
                        href="/category-management"
                        className="inline-flex items-center justify-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition"
                    >
                        <Plus className="w-4 h-4 text-slate-400" />
                        <span>Categories</span>
                    </Link>

                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition shadow-xs hover:shadow"
                    >
                        <Plus className="w-4 h-4" />
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
                        <Search className="w-4 h-4" />
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
                        <RefreshCw className="w-5 h-5" />
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

                                        {/* Actions - UPDATED with Lucide Icons */}
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
                                                    <Eye className="w-4 h-4" />
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        setSelectedProduct(product);
                                                        setIsEditModalOpen(true);
                                                    }}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
                                                    title="Edit Product"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>

                                                <button
                                                    onClick={() => handleToggleStatus(product)}
                                                    className={`p-1.5 rounded-lg transition ${product.isActive
                                                        ? 'text-emerald-600 hover:text-amber-600 hover:bg-amber-50'
                                                        : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                                                        }`}
                                                    title={product.isActive ? 'Deactivate Product' : 'Activate Product'}
                                                >
                                                    {product.isActive ? (
                                                        <Power className="w-4 h-4" />
                                                    ) : (
                                                        <PowerOff className="w-4 h-4" />
                                                    )}
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        setSelectedProduct(product);
                                                        setIsDeleteModalOpen(true);
                                                    }}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                                                    title="Delete Product"
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
                            <AlertTriangle className="w-6 h-6" />
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