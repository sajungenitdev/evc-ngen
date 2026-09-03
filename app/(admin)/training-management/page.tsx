// app/(admin)/training-management/page.tsx
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
} from 'lucide-react';
import { getImageUrl, isDefaultImage } from '@/utils/imageHelper';
import { CreateTrainingModal } from '@/components/Admin/training/CreateTrainingModal';
import { EditTrainingModal } from '@/components/Admin/training/EditTrainingModal';
import { ViewTrainingModal } from '@/components/Admin/training/ViewTrainingModal';
import { DeleteTrainingModal } from '@/components/Admin/training/DeleteTrainingModal';

// ============================================
// TYPES
// ============================================

export interface Training {
    _id: string;
    id?: string;
    title: string;
    categoryId: string;
    badge?: string;
    description: string;
    details?: string;
    duration?: string;
    format?: string;
    imageUrl?: string;
    link?: string;
    color?: string;
    icon?: string;
    features?: string[];
    price?: string;
    schedule?: string;
    prerequisites?: string[];
    actionText?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://evc-ngen-server.onrender.com/api';

// ============================================
// IMAGE HELPER COMPONENT
// ============================================

const TrainingImage: React.FC<{
    src?: string;
    alt: string;
    className?: string;
    fallback?: string;
}> = ({ src, alt, className = 'w-full h-full object-cover', fallback = '📚' }) => {
    const [hasError, setHasError] = useState(false);

    const fullUrl = src ? getImageUrl(src) : null;
    const isValidImage = fullUrl && !hasError && !isDefaultImage(src || '');

    if (!isValidImage) {
        return (
            <div className={`flex items-center justify-center bg-slate-100 text-slate-400 font-semibold text-base ${className}`}>
                <span>{fallback}</span>
            </div>
        );
    }

    return (
        <img
            src={fullUrl}
            alt={alt}
            className={className}
            onError={() => setHasError(true)}
            loading="lazy"
        />
    );
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function TrainingManagementPage() {
    const { token } = useAuth();

    // State
    const [trainings, setTrainings] = useState<Training[]>([]);
    const [categories, setCategories] = useState<TrainingCategory[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [itemsPerPage] = useState<number>(10);

    // Modal states
    const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
    const [selectedTraining, setSelectedTraining] = useState<Training | null>(null);

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
    // Fetch Categories
    // ============================================

    const fetchCategories = useCallback(async () => {
        if (!token) return;
        try {
            const response = await apiCall<TrainingCategory[]>('/training-categories?limit=100&isActive=true');
            if (response.success && Array.isArray(response.data)) {
                setCategories(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    }, [token, apiCall]);

    // ============================================
    // Fetch Trainings
    // ============================================

    const fetchTrainings = useCallback(
        async (quiet = false) => {
            if (!token) return;
            const toastId = !quiet ? toast.loading('Syncing training modules...') : undefined;
            setIsLoading(true);
            try {
                let url = `/training?page=${currentPage}&limit=${itemsPerPage}`;
                if (filterCategory !== 'all') {
                    url += `&categoryId=${filterCategory}`;
                }
                const response = await apiCall<Training[]>(url);
                if (response.success && Array.isArray(response.data)) {
                    setTrainings(response.data);
                    setTotalPages(response.pagination?.pages || 1);
                    if (toastId) toast.success(`Synced ${response.data.length} programs`, { id: toastId });
                } else {
                    if (toastId) toast.error(response.message || 'Failed to load trainings', { id: toastId });
                }
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : 'Network failure';
                if (toastId) toast.error(message, { id: toastId });
            } finally {
                setIsLoading(false);
            }
        },
        [token, apiCall, currentPage, itemsPerPage, filterCategory]
    );

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    useEffect(() => {
        fetchTrainings(true);
    }, [fetchTrainings]);

    // Computed Dashboard Metrics
    const stats = useMemo(() => {
        const total = trainings.length;
        const active = trainings.filter((t) => t.isActive).length;
        const inactive = trainings.filter((t) => !t.isActive).length;
        const categoryCount = categories.length;
        return { total, active, inactive, categoryCount };
    }, [trainings, categories]);

    // Filtered Trainings
    const filteredTrainings = useMemo(() => {
        const query = searchTerm.toLowerCase().trim();
        return trainings.filter((training) => {
            const trId = training.id || training._id;
            const matchesSearch =
                !query ||
                training.title.toLowerCase().includes(query) ||
                training.description?.toLowerCase().includes(query) ||
                training.badge?.toLowerCase().includes(query) ||
                trId.toLowerCase().includes(query);

            const matchesStatus =
                filterStatus === 'all' ||
                (filterStatus === 'active' && training.isActive) ||
                (filterStatus === 'inactive' && !training.isActive);

            return matchesSearch && matchesStatus;
        });
    }, [trainings, searchTerm, filterStatus]);

    // ============================================
    // CRUD Handlers
    // ============================================

    const handleCreate = async (formData: FormData) => {
        if (!token) return;
        setIsSubmitting(true);
        const toastId = toast.loading('Creating training program...');
        try {
            const response = await apiCall<Training>('/training', {
                method: 'POST',
                body: formData,
            });
            if (response.success && response.data) {
                setIsCreateModalOpen(false);
                toast.success('Training program created successfully!', { id: toastId });
                await fetchTrainings(true);
            } else {
                toast.error(response.message || 'Failed to create training', { id: toastId });
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to create training';
            toast.error(message, { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdate = async (formData: FormData) => {
        if (!token || !selectedTraining) return;
        setIsSubmitting(true);
        const toastId = toast.loading('Updating training program...');
        try {
            const trainingId = selectedTraining.id || selectedTraining._id;
            const response = await apiCall<Training>(`/training/${trainingId}`, {
                method: 'PUT',
                body: formData,
            });
            if (response.success) {
                setIsEditModalOpen(false);
                setSelectedTraining(null);
                toast.success('Training program updated successfully!', { id: toastId });
                await fetchTrainings(true);
            } else {
                toast.error(response.message || 'Failed to update training', { id: toastId });
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to update training';
            toast.error(message, { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!token || !selectedTraining) return;
        setIsSubmitting(true);
        const toastId = toast.loading(`Deleting ${selectedTraining.title}...`);
        const previous = [...trainings];

        // Optimistic UI state update
        setTrainings((prev) =>
            prev.filter((t) => t._id !== selectedTraining._id && t.id !== selectedTraining.id)
        );
        setIsDeleteModalOpen(false);

        try {
            const trainingId = selectedTraining.id || selectedTraining._id;
            const response = await apiCall(`/training/${trainingId}`, {
                method: 'DELETE',
            });
            if (response.success) {
                setSelectedTraining(null);
                toast.success('Training program deleted successfully!', { id: toastId });
                await fetchTrainings(true);
            } else {
                setTrainings(previous);
                toast.error(response.message || 'Failed to delete training', { id: toastId });
            }
        } catch (error: unknown) {
            setTrainings(previous);
            const message = error instanceof Error ? error.message : 'Failed to delete training';
            toast.error(message, { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleStatus = async (training: Training) => {
        if (!token) return;
        const targetStatus = !training.isActive;
        const trainingId = training.id || training._id;

        // Optimistic update
        setTrainings((prev) =>
            prev.map((t) =>
                t._id === training._id || (t.id && t.id === training.id)
                    ? { ...t, isActive: targetStatus }
                    : t
            )
        );

        try {
            const response = await apiCall(`/training/${trainingId}/toggle`, {
                method: 'PUT',
            });
            if (response.success) {
                toast.success(`Training ${targetStatus ? 'activated' : 'deactivated'}!`);
            } else {
                // Rollback
                setTrainings((prev) =>
                    prev.map((t) =>
                        t._id === training._id || (t.id && t.id === training.id)
                            ? { ...t, isActive: training.isActive }
                            : t
                    )
                );
                toast.error(response.message || 'Failed to update status');
            }
        } catch {
            // Rollback
            setTrainings((prev) =>
                prev.map((t) =>
                    t._id === training._id || (t.id && t.id === training.id)
                        ? { ...t, isActive: training.isActive }
                        : t
                )
            );
            toast.error('Failed to update status');
        }
    };

    // ============================================
    // Modal Handlers
    // ============================================

    const handleEdit = (training: Training) => {
        setSelectedTraining(training);
        setIsEditModalOpen(true);
    };

    const handleView = (training: Training) => {
        setSelectedTraining(training);
        setIsViewModalOpen(true);
    };

    const handleDeleteClick = (training: Training) => {
        setSelectedTraining(training);
        setIsDeleteModalOpen(true);
    };

    const getCategoryName = (categoryId: string) => {
        const category = categories.find((c) => (c.id || c._id) === categoryId);
        return category ? `${category.icon || '📚'} ${category.name}` : categoryId || 'Unassigned';
    };

    const goToPage = (page: number) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    };

    return (
        <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8 space-y-6 container mx-auto">
            {/* ----------------------------------------------------------------- */}
            {/* Page Header */}
            {/* ----------------------------------------------------------------- */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Training Management</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Build certification courses, hardware technician curricula, and operational webinars.
                    </p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition shadow-xs hover:shadow"
                >
                    <Plus className="w-4 h-4" />
                    <span>Add Training</span>
                </button>
            </div>

            {/* ----------------------------------------------------------------- */}
            {/* KPI Overview Metrics */}
            {/* ----------------------------------------------------------------- */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Programs</p>
                        <p className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 text-lg font-semibold">
                        📚
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
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Inactive</p>
                        <p className="text-2xl font-bold text-slate-400 mt-1">{stats.inactive}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center font-bold">
                        ✕
                    </div>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider">Categories</p>
                        <p className="text-2xl font-bold text-purple-700 mt-1">{stats.categoryCount}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                        🗂️
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
                        placeholder="Search trainings by title, badge, or keyword..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 text-slate-900 placeholder:text-slate-400 transition"
                    />
                </div>

                <div className="flex flex-wrap sm:flex-nowrap gap-2">
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="text-sm px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-700 font-medium transition"
                    >
                        <option value="all">All Categories</option>
                        {categories.map((category) => (
                            <option key={category._id || category.id} value={category.id || category._id}>
                                {category.icon} {category.name}
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
                        onClick={() => fetchTrainings(false)}
                        className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 transition"
                        title="Refresh list"
                    >
                        <RotateCw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* ----------------------------------------------------------------- */}
            {/* Trainings Table */}
            {/* ----------------------------------------------------------------- */}
            <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                <th className="px-6 py-4">Program</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Badge</th>
                                <th className="px-6 py-4">Duration</th>
                                <th className="px-6 py-4">Tuition / Fee</th>
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
                                                    <div className="w-48 h-2.5 bg-slate-100 rounded" />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4"><div className="w-20 h-4 bg-slate-100 rounded" /></td>
                                        <td className="px-6 py-4"><div className="w-16 h-5 bg-slate-100 rounded-full" /></td>
                                        <td className="px-6 py-4"><div className="w-16 h-4 bg-slate-100 rounded" /></td>
                                        <td className="px-6 py-4"><div className="w-16 h-4 bg-slate-100 rounded" /></td>
                                        <td className="px-6 py-4"><div className="w-16 h-5 bg-slate-100 rounded-full" /></td>
                                        <td className="px-6 py-4"><div className="w-20 h-6 bg-slate-100 rounded ml-auto" /></td>
                                    </tr>
                                ))
                            ) : filteredTrainings.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-16 text-center">
                                        <div className="max-w-xs mx-auto text-center space-y-2">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-xl text-slate-400">
                                                📚
                                            </div>
                                            <p className="text-sm font-bold text-slate-900">No training programs found</p>
                                            <p className="text-xs text-slate-400">Try adjusting your filters or search keywords.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredTrainings.map((training) => (
                                    <tr key={training._id || training.id} className="hover:bg-slate-50/60 transition-colors">
                                        {/* Program Information */}
                                        <td className="px-6 py-3.5">
                                            <div className="flex items-center gap-3.5">
                                                <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200/90 shrink-0 bg-slate-50">
                                                    <TrainingImage
                                                        src={training.imageUrl}
                                                        alt={training.title}
                                                        fallback={training.icon || '📚'}
                                                    />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-slate-900 truncate">{training.title}</p>
                                                    <p className="text-xs text-slate-500 truncate max-w-xs">{training.description}</p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Category */}
                                        <td className="px-6 py-3.5 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-slate-50 text-slate-700 border-slate-200">
                                                {getCategoryName(training.categoryId)}
                                            </span>
                                        </td>

                                        {/* Badge */}
                                        <td className="px-6 py-3.5 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 font-mono">
                                                {training.badge || 'Standard'}
                                            </span>
                                        </td>

                                        {/* Duration */}
                                        <td className="px-6 py-3.5 whitespace-nowrap text-xs text-slate-600 font-medium">
                                            {training.duration || 'Flexible'}
                                        </td>

                                        {/* Price */}
                                        <td className="px-6 py-3.5 whitespace-nowrap text-xs font-semibold text-slate-900 font-mono">
                                            {training.price || 'Free / Included'}
                                        </td>

                                        {/* Status */}
                                        <td className="px-6 py-3.5 whitespace-nowrap">
                                            <span
                                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${training.isActive
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                        : 'bg-slate-100 text-slate-500 border-slate-200'
                                                    }`}
                                            >
                                                <span className={`w-1.5 h-1.5 rounded-full ${training.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                                {training.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-3.5 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => handleView(training)}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>

                                                <button
                                                    onClick={() => handleEdit(training)}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>

                                                <button
                                                    onClick={() => handleToggleStatus(training)}
                                                    className={`p-1.5 rounded-lg transition ${training.isActive
                                                            ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                                                            : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                                                        }`}
                                                    title={training.isActive ? 'Deactivate' : 'Activate'}
                                                >
                                                    <RotateCw className="w-4 h-4" />
                                                </button>

                                                <button
                                                    onClick={() => handleDeleteClick(training)}
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
            <CreateTrainingModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreate}
                isSubmitting={isSubmitting}
                categories={categories as any}
            />

            <EditTrainingModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedTraining(null);
                }}
                onSubmit={handleUpdate}
                initialData={selectedTraining as any}
                isSubmitting={isSubmitting}
                categories={categories as any}
            />

            {isViewModalOpen && selectedTraining && (
                <ViewTrainingModal
                    training={selectedTraining as any}
                    onClose={() => {
                        setIsViewModalOpen(false);
                        setSelectedTraining(null);
                    }}
                    onEdit={() => {
                        setIsViewModalOpen(false);
                        handleEdit(selectedTraining);
                    }}
                />
            )}

            <DeleteTrainingModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedTraining(null);
                }}
                onConfirm={handleDelete}
                trainingName={selectedTraining?.title || ''}
                isSubmitting={isSubmitting}
            />
        </div>
    );
}