// app/(admin)/training-category-management/page.tsx
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import {
    Search,
    Eye,
    Edit,
    Trash2,
    Plus,
    ChevronLeft,
    ChevronRight,
    RotateCw,
    FolderOpen,
    Hash,
} from 'lucide-react';
import { CreateTrainingCategoryModal } from '@/components/Admin/training-category/CreateTrainingCategoryModal';
import { EditTrainingCategoryModal } from '@/components/Admin/training-category/EditTrainingCategoryModal';
import { ViewTrainingCategoryModal } from '@/components/Admin/training-category/ViewTrainingCategoryModal';
import { DeleteTrainingCategoryModal } from '@/components/Admin/training-category/DeleteTrainingCategoryModal';

// ============================================
// TYPES
// ============================================

export interface TrainingCategory {
    _id: string;
    id?: string;
    name: string;
    slug?: string;
    description?: string;
    icon?: string;
    color?: string;
    order?: number;
    isActive: boolean;
    trainingCount?: number;
    createdAt: string;
    updatedAt: string;
}

interface ApiResponse<T> {
    success: boolean;
    data?: T;
    pagination?: {
        total: number;
        pages: number;
        page: number;
        limit: number;
    };
    message?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// ============================================
// HELPERS
// ============================================

function formatDate(dateString?: string): string {
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
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function TrainingCategoryManagementPage() {
    const { token } = useAuth();

    // State
    const [categories, setCategories] = useState<TrainingCategory[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [itemsPerPage] = useState<number>(10);

    // Modal states
    const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
    const [selectedCategory, setSelectedCategory] = useState<TrainingCategory | null>(null);

    // ============================================
    // API Helper
    // ============================================

    const apiCall = useCallback(
        async <T,>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> => {
            const headers: Record<string, string> = {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            };

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
    // Fetch Categories
    // ============================================

    const fetchCategories = useCallback(
        async (quiet = false) => {
            if (!token) return;
            const toastId = !quiet ? toast.loading('Syncing categories...') : undefined;
            setIsLoading(true);
            try {
                const response = await apiCall<TrainingCategory[]>(
                    `/training-categories?page=${currentPage}&limit=${itemsPerPage}`
                );
                if (response.success && Array.isArray(response.data)) {
                    setCategories(response.data);
                    setTotalPages(response.pagination?.pages || 1);
                    if (toastId) toast.success(`Synced ${response.data.length} categories`, { id: toastId });
                } else {
                    if (toastId) toast.error(response.message || 'Failed to load categories', { id: toastId });
                }
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : 'Failed to load categories';
                if (toastId) toast.error(message, { id: toastId });
            } finally {
                setIsLoading(false);
            }
        },
        [token, apiCall, currentPage, itemsPerPage]
    );

    useEffect(() => {
        fetchCategories(true);
    }, [fetchCategories]);

    // Computed Dashboard Metrics
    const stats = useMemo(() => {
        const total = categories.length;
        const active = categories.filter((c) => c.isActive).length;
        const inactive = categories.filter((c) => !c.isActive).length;
        const totalTrainings = categories.reduce((sum, c) => sum + (c.trainingCount || 0), 0);
        return { total, active, inactive, totalTrainings };
    }, [categories]);

    // Filtered Categories
    const filteredCategories = useMemo(() => {
        const query = searchTerm.toLowerCase().trim();
        return categories.filter((category) => {
            const catId = category.id || category._id;
            const matchesSearch =
                !query ||
                category.name.toLowerCase().includes(query) ||
                category.description?.toLowerCase().includes(query) ||
                category.slug?.toLowerCase().includes(query) ||
                catId.toLowerCase().includes(query);

            const matchesStatus =
                filterStatus === 'all' ||
                (filterStatus === 'active' && category.isActive) ||
                (filterStatus === 'inactive' && !category.isActive);

            return matchesSearch && matchesStatus;
        });
    }, [categories, searchTerm, filterStatus]);

    // ============================================
    // CRUD Handlers
    // ============================================

    const handleCreate = async (data: Omit<TrainingCategory, '_id' | 'createdAt' | 'updatedAt'>) => {
        if (!token) return;
        setIsSubmitting(true);
        const toastId = toast.loading('Creating training category...');
        try {
            const response = await apiCall<TrainingCategory>('/training-categories', {
                method: 'POST',
                body: JSON.stringify(data),
            });
            if (response.success && response.data) {
                setIsCreateModalOpen(false);
                toast.success('Category created successfully!', { id: toastId });
                await fetchCategories(true);
            } else {
                toast.error(response.message || 'Failed to create category', { id: toastId });
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to create category';
            toast.error(message, { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdate = async (data: Partial<TrainingCategory>) => {
        if (!token || !selectedCategory) return;
        setIsSubmitting(true);
        const toastId = toast.loading('Updating training category...');
        try {
            const categoryId = selectedCategory.id || selectedCategory._id;
            const response = await apiCall<TrainingCategory>(`/training-categories/${categoryId}`, {
                method: 'PUT',
                body: JSON.stringify(data),
            });
            if (response.success) {
                setIsEditModalOpen(false);
                setSelectedCategory(null);
                toast.success('Category updated successfully!', { id: toastId });
                await fetchCategories(true);
            } else {
                toast.error(response.message || 'Failed to update category', { id: toastId });
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to update category';
            toast.error(message, { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!token || !selectedCategory) return;
        setIsSubmitting(true);
        const toastId = toast.loading(`Deleting ${selectedCategory.name}...`);
        const previous = [...categories];

        // Optimistic UI update
        setCategories((prev) =>
            prev.filter((c) => c._id !== selectedCategory._id && c.id !== selectedCategory.id)
        );
        setIsDeleteModalOpen(false);

        try {
            const categoryId = selectedCategory.id || selectedCategory._id;
            const response = await apiCall(`/training-categories/${categoryId}`, {
                method: 'DELETE',
            });
            if (response.success) {
                setSelectedCategory(null);
                toast.success('Category deleted successfully!', { id: toastId });
                await fetchCategories(true);
            } else {
                setCategories(previous);
                toast.error(response.message || 'Failed to delete category', { id: toastId });
            }
        } catch (error: unknown) {
            setCategories(previous);
            const message = error instanceof Error ? error.message : 'Failed to delete category';
            toast.error(message, { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleStatus = async (category: TrainingCategory) => {
        if (!token) return;
        const targetStatus = !category.isActive;
        const categoryId = category.id || category._id;

        // Optimistic update
        setCategories((prev) =>
            prev.map((c) =>
                c._id === category._id || (c.id && c.id === category.id)
                    ? { ...c, isActive: targetStatus }
                    : c
            )
        );

        try {
            const response = await apiCall(`/training-categories/${categoryId}/toggle`, {
                method: 'PUT',
            });
            if (response.success) {
                toast.success(`Category ${targetStatus ? 'activated' : 'deactivated'}!`);
            } else {
                // Rollback
                setCategories((prev) =>
                    prev.map((c) =>
                        c._id === category._id || (c.id && c.id === category.id)
                            ? { ...c, isActive: category.isActive }
                            : c
                    )
                );
                toast.error(response.message || 'Failed to update status');
            }
        } catch {
            // Rollback
            setCategories((prev) =>
                prev.map((c) =>
                    c._id === category._id || (c.id && c.id === category.id)
                        ? { ...c, isActive: category.isActive }
                        : c
                )
            );
            toast.error('Failed to update status');
        }
    };

    // ============================================
    // Modal Handlers
    // ============================================

    const handleEdit = (category: TrainingCategory) => {
        setSelectedCategory(category);
        setIsEditModalOpen(true);
    };

    const handleView = (category: TrainingCategory) => {
        setSelectedCategory(category);
        setIsViewModalOpen(true);
    };

    const handleDeleteClick = (category: TrainingCategory) => {
        setSelectedCategory(category);
        setIsDeleteModalOpen(true);
    };

    const goToPage = (page: number) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    };

    return (
        <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
            {/* ----------------------------------------------------------------- */}
            {/* Page Header */}
            {/* ----------------------------------------------------------------- */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                        Training Category Management
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Organize curricula groups, certification taxonomy, and instructional pathways.
                    </p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition shadow-xs hover:shadow"
                >
                    <Plus className="w-4 h-4" />
                    <span>Add Category</span>
                </button>
            </div>

            {/* ----------------------------------------------------------------- */}
            {/* KPI Overview Metrics */}
            {/* ----------------------------------------------------------------- */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Categories</p>
                        <p className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 text-lg font-semibold">
                        🗂️
                    </div>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Active Categories</p>
                        <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.active}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                        ✓
                    </div>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Inactive</p>
                        <p className="text-2xl font-bold text-slate-400 mt-1">{stats.inactive}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center font-bold">
                        ✕
                    </div>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider">Linked Programs</p>
                        <p className="text-2xl font-bold text-purple-700 mt-1">{stats.totalTrainings}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                        📚
                    </div>
                </div>
            </div>

            {/* ----------------------------------------------------------------- */}
            {/* Filter Toolbar */}
            {/* ----------------------------------------------------------------- */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
                <div className="relative flex-1 min-w-[200px]">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Search className="w-4 h-4" />
                    </span>
                    <input
                        type="text"
                        placeholder="Search categories by name, ID, or slug..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 text-slate-900 placeholder:text-slate-400 transition"
                    />
                </div>

                <div className="flex items-center gap-2">
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
                        onClick={() => fetchCategories(false)}
                        className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 transition"
                        title="Refresh list"
                    >
                        <RotateCw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* ----------------------------------------------------------------- */}
            {/* Categories Table */}
            {/* ----------------------------------------------------------------- */}
            <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                <th className="px-6 py-4">Category Group</th>
                                <th className="px-6 py-4">System ID</th>
                                <th className="px-6 py-4">Description</th>
                                <th className="px-6 py-4">Linked Trainings</th>
                                <th className="px-6 py-4">Order Index</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3.5">
                                                <div className="w-10 h-10 rounded-xl bg-slate-200 shrink-0" />
                                                <div className="space-y-1.5">
                                                    <div className="w-32 h-3.5 bg-slate-200 rounded" />
                                                    <div className="w-20 h-2.5 bg-slate-100 rounded" />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4"><div className="w-16 h-4 bg-slate-100 rounded" /></td>
                                        <td className="px-6 py-4"><div className="w-36 h-4 bg-slate-100 rounded" /></td>
                                        <td className="px-6 py-4"><div className="w-10 h-5 bg-slate-100 rounded-full" /></td>
                                        <td className="px-6 py-4"><div className="w-8 h-4 bg-slate-100 rounded" /></td>
                                        <td className="px-6 py-4"><div className="w-16 h-5 bg-slate-100 rounded-full" /></td>
                                        <td className="px-6 py-4"><div className="w-20 h-6 bg-slate-100 rounded ml-auto" /></td>
                                    </tr>
                                ))
                            ) : filteredCategories.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-16 text-center">
                                        <div className="max-w-xs mx-auto text-center space-y-2">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-xl text-slate-400">
                                                <FolderOpen className="w-6 h-6" />
                                            </div>
                                            <p className="text-sm font-bold text-slate-900">No training categories found</p>
                                            <p className="text-xs text-slate-400">Try adjusting your filters or create a new category.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredCategories.map((category) => (
                                    <tr key={category._id || category.id} className="hover:bg-slate-50/60 transition-colors">
                                        {/* Category Details */}
                                        <td className="px-6 py-3.5">
                                            <div className="flex items-center gap-3.5">
                                                <div
                                                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 border border-slate-200/80 shadow-2xs"
                                                    style={{
                                                        backgroundColor: category.color ? `${category.color}15` : '#f8fafc',
                                                    }}
                                                >
                                                    {category.icon || '📚'}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-slate-900 truncate">{category.name}</p>
                                                    {category.slug && (
                                                        <p className="text-xs text-slate-400 font-mono truncate">/{category.slug}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        {/* ID */}
                                        <td className="px-6 py-3.5 whitespace-nowrap">
                                            <span className="text-xs font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                                                {category.id || category._id}
                                            </span>
                                        </td>

                                        {/* Description */}
                                        <td className="px-6 py-3.5">
                                            <p className="text-xs text-slate-600 truncate max-w-xs">
                                                {category.description || '—'}
                                            </p>
                                        </td>

                                        {/* Linked Training Count */}
                                        <td className="px-6 py-3.5 whitespace-nowrap">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60 font-mono">
                                                <Hash className="w-3 h-3" />
                                                {category.trainingCount || 0}
                                            </span>
                                        </td>

                                        {/* Display Order */}
                                        <td className="px-6 py-3.5 whitespace-nowrap text-xs font-medium text-slate-600 font-mono">
                                            {category.order ?? 0}
                                        </td>

                                        {/* Status */}
                                        <td className="px-6 py-3.5 whitespace-nowrap">
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

                                        {/* Actions */}
                                        <td className="px-6 py-3.5 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => handleView(category)}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>

                                                <button
                                                    onClick={() => handleEdit(category)}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>

                                                <button
                                                    onClick={() => handleToggleStatus(category)}
                                                    className={`p-1.5 rounded-lg transition ${category.isActive
                                                        ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                                                        : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                                                        }`}
                                                    title={category.isActive ? 'Deactivate' : 'Activate'}
                                                >
                                                    <RotateCw className="w-4 h-4" />
                                                </button>

                                                <button
                                                    onClick={() => handleDeleteClick(category)}
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

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
                        <p className="text-xs text-slate-500">
                            Page {currentPage} of {totalPages}
                        </p>
                        <div className="flex gap-1">
                            <button
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => goToPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ----------------------------------------------------------------- */}
            {/* Create / Edit / View / Delete Modals */}
            {/* ----------------------------------------------------------------- */}
            <CreateTrainingCategoryModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreate}
                isSubmitting={isSubmitting}
            />

            <EditTrainingCategoryModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedCategory(null);
                }}
                onSubmit={handleUpdate}
                initialData={selectedCategory as any}
                isSubmitting={isSubmitting}
            />

            {isViewModalOpen && selectedCategory && (
                <ViewTrainingCategoryModal
                    category={selectedCategory as any}
                    onClose={() => {
                        setIsViewModalOpen(false);
                        setSelectedCategory(null);
                    }}
                    onEdit={() => {
                        setIsViewModalOpen(false);
                        handleEdit(selectedCategory);
                    }}
                />
            )}

            <DeleteTrainingCategoryModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedCategory(null);
                }}
                onConfirm={handleDelete}
                categoryName={selectedCategory?.name || ''}
                trainingCount={selectedCategory?.trainingCount || 0}
                isSubmitting={isSubmitting}
            />
        </div>
    );
}