// app/(admin)/solutions-management/page.tsx
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import DeleteConfirmModal from '@/components/Admin/DeleteConfirmModal';
import SolutionModal from '@/components/Admin/solution/SolutionModal';
import { ImageHelper } from '@/components/Admin/ImageHelper';
import {
    Search,
    X,
    Eye,
    Edit,
    Trash2,
    Plus,
    ChevronLeft,
    ChevronRight,
    RotateCw,
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

export interface LinkItem {
    _id?: string;
    label: string;
    url: string;
}

export interface Tab {
    _id?: string;
    tabLabel: string;
    badge?: string;
    title: string;
    description: string;
    imageUrl?: string;
    links?: LinkItem[];
}

export interface UseCase {
    _id?: string;
    label: string;
    icon?: string;
    imageUrl?: string;
    link?: string;
}

export interface Card {
    _id?: string;
    icon?: string;
    title: string;
    description: string;
    actionText?: string;
    actionLink?: string;
    theme?: 'dark' | 'green' | 'light';
}

export interface Section1 {
    tabs?: Tab[];
}

export interface Section2 {
    title?: string;
    imageUrl?: string;
    useCases?: UseCase[];
}

export interface Section3 {
    badge?: string;
    title?: string;
    cards?: Card[];
}

export interface Section4 {
    heading?: string;
    subtext?: string;
    buttonText?: string;
    buttonLink?: string;
}

export interface Solution {
    _id: string;
    id?: string;
    label: string;
    link?: string;
    desc?: string;
    imageUrl?: string;
    title: string;
    subtitle?: string;
    overview?: string;
    section1?: Section1;
    section2?: Section2;
    section3?: Section3;
    section4?: Section4;
    features?: string[];
    isActive: boolean;
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

export default function SolutionsManagementPage() {
    const { token } = useAuth();

    // State
    const [solutions, setSolutions] = useState<Solution[]>([]);
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
    const [selectedSolution, setSelectedSolution] = useState<Solution | null>(null);

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
    // Fetch Solutions
    // ============================================

    const fetchSolutions = useCallback(
        async (quiet = false) => {
            if (!token) return;
            const toastId = !quiet ? toast.loading('Syncing solutions...') : undefined;
            setIsLoading(true);
            try {
                const response = await apiCall<Solution[]>(`/solutions?page=${currentPage}&limit=${itemsPerPage}`);
                if (response.success && Array.isArray(response.data)) {
                    setSolutions(response.data);
                    setTotalPages(response.pagination?.pages || 1);
                    if (toastId) toast.success(`Synced ${response.data.length} solutions`, { id: toastId });
                } else {
                    if (toastId) toast.error(response.message || 'Failed to load solutions', { id: toastId });
                }
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : 'Failed to load solutions';
                if (toastId) toast.error(message, { id: toastId });
            } finally {
                setIsLoading(false);
            }
        },
        [token, apiCall, currentPage, itemsPerPage]
    );

    useEffect(() => {
        fetchSolutions(true);
    }, [fetchSolutions]);

    // Computed Dashboard Metrics
    const stats = useMemo(() => {
        const total = solutions.length;
        const active = solutions.filter((s) => s.isActive).length;
        const inactive = solutions.filter((s) => !s.isActive).length;
        const uniqueIdentifiers = new Set(solutions.map((s) => s.id || s._id)).size;
        return { total, active, inactive, uniqueIdentifiers };
    }, [solutions]);

    // Filtered Solutions
    const filteredSolutions = useMemo(() => {
        const query = searchTerm.toLowerCase().trim();
        return solutions.filter((solution) => {
            const solId = solution.id || solution._id;
            const matchesSearch =
                !query ||
                solution.label.toLowerCase().includes(query) ||
                solution.title.toLowerCase().includes(query) ||
                solution.desc?.toLowerCase().includes(query) ||
                solId.toLowerCase().includes(query);

            const matchesStatus =
                filterStatus === 'all' ||
                (filterStatus === 'active' && solution.isActive) ||
                (filterStatus === 'inactive' && !solution.isActive);

            return matchesSearch && matchesStatus;
        });
    }, [solutions, searchTerm, filterStatus]);

    // ============================================
    // CRUD Handlers
    // ============================================

    const handleCreate = async (formData: FormData) => {
        if (!token) return;
        setIsSubmitting(true);
        const toastId = toast.loading('Creating solution...');
        try {
            const response = await apiCall<Solution>('/solutions', {
                method: 'POST',
                body: formData,
            });
            if (response.success && response.data) {
                setIsCreateModalOpen(false);
                toast.success('Solution created successfully!', { id: toastId });
                await fetchSolutions(true);
            } else {
                toast.error(response.message || 'Failed to create solution', { id: toastId });
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to create solution';
            toast.error(message, { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdate = async (formData: FormData) => {
        if (!token || !selectedSolution) return;
        setIsSubmitting(true);
        const toastId = toast.loading('Updating solution...');
        try {
            const solutionId = selectedSolution.id || selectedSolution._id;
            const response = await apiCall<Solution>(`/solutions/${solutionId}`, {
                method: 'PUT',
                body: formData,
            });
            if (response.success) {
                setIsEditModalOpen(false);
                setSelectedSolution(null);
                toast.success('Solution updated successfully!', { id: toastId });
                await fetchSolutions(true);
            } else {
                toast.error(response.message || 'Failed to update solution', { id: toastId });
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to update solution';
            toast.error(message, { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!token || !selectedSolution) return;
        setIsSubmitting(true);
        const toastId = toast.loading(`Deleting ${selectedSolution.label}...`);
        const previous = [...solutions];

        // Optimistic UI state update
        setSolutions((prev) =>
            prev.filter((s) => s._id !== selectedSolution._id && s.id !== selectedSolution.id)
        );
        setIsDeleteModalOpen(false);

        try {
            const solutionId = selectedSolution.id || selectedSolution._id;
            const response = await apiCall(`/solutions/${solutionId}`, {
                method: 'DELETE',
            });
            if (response.success) {
                setSelectedSolution(null);
                toast.success('Solution deleted successfully!', { id: toastId });
                await fetchSolutions(true);
            } else {
                setSolutions(previous);
                toast.error(response.message || 'Failed to delete solution', { id: toastId });
            }
        } catch (error: unknown) {
            setSolutions(previous);
            const message = error instanceof Error ? error.message : 'Failed to delete solution';
            toast.error(message, { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleStatus = async (solution: Solution) => {
        if (!token) return;
        const targetStatus = !solution.isActive;
        const solutionId = solution.id || solution._id;

        // Optimistic update
        setSolutions((prev) =>
            prev.map((s) =>
                s._id === solution._id || (s.id && s.id === solution.id)
                    ? { ...s, isActive: targetStatus }
                    : s
            )
        );

        try {
            const response = await apiCall(`/solutions/${solutionId}/toggle`, {
                method: 'PUT',
            });
            if (response.success) {
                toast.success(`Solution ${targetStatus ? 'activated' : 'deactivated'}!`);
            } else {
                // Rollback
                setSolutions((prev) =>
                    prev.map((s) =>
                        s._id === solution._id || (s.id && s.id === solution.id)
                            ? { ...s, isActive: solution.isActive }
                            : s
                    )
                );
                toast.error(response.message || 'Failed to update status');
            }
        } catch {
            // Rollback
            setSolutions((prev) =>
                prev.map((s) =>
                    s._id === solution._id || (s.id && s.id === solution.id)
                        ? { ...s, isActive: solution.isActive }
                        : s
                )
            );
            toast.error('Failed to update status');
        }
    };

    // ============================================
    // Modal Handlers
    // ============================================

    const handleEdit = (solution: Solution) => {
        setSelectedSolution(solution);
        setIsEditModalOpen(true);
    };

    const handleView = (solution: Solution) => {
        setSelectedSolution(solution);
        setIsViewModalOpen(true);
    };

    const handleDeleteClick = (solution: Solution) => {
        setSelectedSolution(solution);
        setIsDeleteModalOpen(true);
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
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Solutions Management</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Build and publish end-to-end commercial solutions, dynamic tabs, and case workflows.
                    </p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition shadow-xs hover:shadow"
                >
                    <Plus className="w-4 h-4" />
                    <span>Add Solution</span>
                </button>
            </div>

            {/* ----------------------------------------------------------------- */}
            {/* KPI Overview Metrics */}
            {/* ----------------------------------------------------------------- */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Solutions</p>
                        <p className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 text-lg font-semibold">
                        💡
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
                        <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider">Unique Groups</p>
                        <p className="text-2xl font-bold text-purple-700 mt-1">{stats.uniqueIdentifiers}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                        ⚡
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
                        placeholder="Search solutions by label, title, ID, or description..."
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
                        onClick={() => fetchSolutions(false)}
                        className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 transition"
                        title="Refresh solutions"
                    >
                        <RotateCw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* ----------------------------------------------------------------- */}
            {/* Solutions Table */}
            {/* ----------------------------------------------------------------- */}
            <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                <th className="px-6 py-4">Solution Offering</th>
                                <th className="px-6 py-4">System ID</th>
                                <th className="px-6 py-4">Description</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Registered Date</th>
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
                                        <td className="px-6 py-4"><div className="w-16 h-4 bg-slate-100 rounded" /></td>
                                        <td className="px-6 py-4"><div className="w-36 h-4 bg-slate-100 rounded" /></td>
                                        <td className="px-6 py-4"><div className="w-16 h-5 bg-slate-100 rounded-full" /></td>
                                        <td className="px-6 py-4"><div className="w-20 h-4 bg-slate-100 rounded" /></td>
                                        <td className="px-6 py-4"><div className="w-20 h-6 bg-slate-100 rounded ml-auto" /></td>
                                    </tr>
                                ))
                            ) : filteredSolutions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center">
                                        <div className="max-w-xs mx-auto text-center space-y-2">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-xl text-slate-400">
                                                💡
                                            </div>
                                            <p className="text-sm font-bold text-slate-900">No solutions found</p>
                                            <p className="text-xs text-slate-400">Try adjusting your filters or search keywords.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredSolutions.map((solution) => (
                                    <tr key={solution._id || solution.id} className="hover:bg-slate-50/60 transition-colors">
                                        {/* Solution Offering */}
                                        <td className="px-6 py-3.5">
                                            <div className="flex items-center gap-3.5">
                                                <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200/90 shrink-0 bg-slate-50">
                                                    <ImageHelper
                                                        src={solution.imageUrl}
                                                        alt={solution.label}
                                                        className="w-full h-full object-cover"
                                                        fallback="💡"
                                                    />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-slate-900 truncate">{solution.label}</p>
                                                    <p className="text-xs text-slate-500 truncate max-w-xs">{solution.title}</p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* System ID */}
                                        <td className="px-6 py-3.5 whitespace-nowrap">
                                            <span className="text-xs font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                                                {solution.id || solution._id}
                                            </span>
                                        </td>

                                        {/* Description */}
                                        <td className="px-6 py-3.5">
                                            <p className="text-xs text-slate-600 truncate max-w-sm">
                                                {solution.desc || 'No summary overview provided'}
                                            </p>
                                        </td>

                                        {/* Status */}
                                        <td className="px-6 py-3.5 whitespace-nowrap">
                                            <span
                                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${solution.isActive
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                        : 'bg-slate-100 text-slate-500 border-slate-200'
                                                    }`}
                                            >
                                                <span className={`w-1.5 h-1.5 rounded-full ${solution.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                                {solution.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>

                                        {/* Registered Date */}
                                        <td className="px-6 py-3.5 text-xs text-slate-500 whitespace-nowrap">
                                            {formatDate(solution.createdAt)}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-3.5 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => handleView(solution)}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>

                                                <button
                                                    onClick={() => handleEdit(solution)}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>

                                                <button
                                                    onClick={() => handleToggleStatus(solution)}
                                                    className={`p-1.5 rounded-lg transition ${solution.isActive
                                                            ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                                                            : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                                                        }`}
                                                    title={solution.isActive ? 'Deactivate' : 'Activate'}
                                                >
                                                    <RotateCw className="w-4 h-4" />
                                                </button>

                                                <button
                                                    onClick={() => handleDeleteClick(solution)}
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
            {/* Create / Edit Modals */}
            {/* ----------------------------------------------------------------- */}
            <SolutionModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreate}
                isSubmitting={isSubmitting}
                title="Add New Solution"
                submitLabel="Create Solution"
            />

            <SolutionModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedSolution(null);
                }}
                onSubmit={handleUpdate}
                initialData={selectedSolution as any}
                isSubmitting={isSubmitting}
                title="Edit Solution"
                submitLabel="Update Solution"
            />

            {/* ----------------------------------------------------------------- */}
            {/* View Modal */}
            {/* ----------------------------------------------------------------- */}
            {isViewModalOpen && selectedSolution && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-200">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">Solution Overview</h2>
                                <p className="text-xs text-slate-500 font-mono mt-0.5">ID: {selectedSolution.id || selectedSolution._id}</p>
                            </div>
                            <button
                                onClick={() => {
                                    setIsViewModalOpen(false);
                                    setSelectedSolution(null);
                                }}
                                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Header Info */}
                            <div className="flex items-start gap-4">
                                <div className="w-24 h-24 rounded-2xl overflow-hidden border border-slate-200 shrink-0 bg-slate-50 shadow-xs">
                                    <ImageHelper
                                        src={selectedSolution.imageUrl}
                                        alt={selectedSolution.label}
                                        className="w-full h-full object-cover"
                                        fallback="💡"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="text-xl font-bold text-slate-900">{selectedSolution.label}</h3>
                                        <span
                                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${selectedSolution.isActive
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                    : 'bg-slate-100 text-slate-500 border-slate-200'
                                                }`}
                                        >
                                            <span className={`w-1.5 h-1.5 rounded-full ${selectedSolution.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                            {selectedSolution.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-600 mt-1">{selectedSolution.title}</p>
                                    {selectedSolution.subtitle && (
                                        <p className="text-xs text-slate-400 mt-0.5">{selectedSolution.subtitle}</p>
                                    )}
                                </div>
                            </div>

                            {/* Overview / Descriptions */}
                            {selectedSolution.desc && (
                                <div className="p-3.5 bg-slate-50/80 border border-slate-200/60 rounded-2xl">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Short Description</span>
                                    <p className="text-xs text-slate-700 mt-1 leading-relaxed">{selectedSolution.desc}</p>
                                </div>
                            )}

                            {selectedSolution.overview && (
                                <div className="p-3.5 bg-slate-50/80 border border-slate-200/60 rounded-2xl">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Overview Details</span>
                                    <div
                                        className="text-xs text-slate-700 mt-1 leading-relaxed prose prose-sm max-w-none"
                                        dangerouslySetInnerHTML={{ __html: selectedSolution.overview }}
                                    />
                                </div>
                            )}

                            {/* Features List */}
                            {selectedSolution.features && selectedSolution.features.length > 0 && (
                                <div className="p-3.5 bg-slate-50/80 border border-slate-200/60 rounded-2xl">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Key Features</span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {selectedSolution.features.map((feature, idx) => (
                                            <span
                                                key={idx}
                                                className="px-2.5 py-1 bg-white border border-slate-200 text-slate-700 text-xs rounded-full font-medium shadow-2xs"
                                            >
                                                ✓ {feature}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Section 1 - Tabs */}
                            {selectedSolution.section1?.tabs && selectedSolution.section1.tabs.length > 0 && (
                                <div className="border-t border-slate-100 pt-4 space-y-3">
                                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                                        Tab Configurations ({selectedSolution.section1.tabs.length})
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {selectedSolution.section1.tabs.map((tab, idx) => (
                                            <div key={idx} className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/60 flex flex-col justify-between">
                                                <div>
                                                    {tab.imageUrl && (
                                                        <div className="w-full h-32 rounded-xl overflow-hidden bg-slate-100 mb-3 border border-slate-200/60">
                                                            <ImageHelper
                                                                src={tab.imageUrl}
                                                                alt={tab.tabLabel}
                                                                className="w-full h-full object-cover"
                                                                fallback="🖼️"
                                                            />
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-xs font-bold text-slate-900">{tab.tabLabel}</span>
                                                        {tab.badge && (
                                                            <span className="text-[10px] bg-slate-200/80 text-slate-700 px-2 py-0.5 rounded-full font-medium">
                                                                {tab.badge}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs font-semibold text-slate-800">{tab.title}</p>
                                                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{tab.description}</p>
                                                </div>

                                                {tab.links && tab.links.length > 0 && (
                                                    <div className="mt-3 pt-2 border-t border-slate-200/40 flex flex-wrap gap-2">
                                                        {tab.links.map((link, linkIdx) => (
                                                            <a
                                                                key={linkIdx}
                                                                href={link.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-[11px] font-semibold text-blue-600 hover:underline"
                                                            >
                                                                {link.label} →
                                                            </a>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Section 2 - Use Cases */}
                            {(selectedSolution.section2?.useCases?.length || selectedSolution.section2?.imageUrl) && (
                                <div className="border-t border-slate-100 pt-4 space-y-3">
                                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                                        Use Cases ({selectedSolution.section2?.useCases?.length || 0})
                                    </h4>
                                    {selectedSolution.section2?.imageUrl && (
                                        <div className="w-full h-44 rounded-2xl overflow-hidden bg-slate-100 mb-3 border border-slate-200">
                                            <ImageHelper
                                                src={selectedSolution.section2.imageUrl}
                                                alt="Section 2 Image"
                                                className="w-full h-full object-cover"
                                                fallback="🖼️"
                                            />
                                        </div>
                                    )}
                                    {selectedSolution.section2?.title && (
                                        <p className="text-xs font-semibold text-slate-800">{selectedSolution.section2.title}</p>
                                    )}
                                    <div className="flex flex-wrap gap-2">
                                        {selectedSolution.section2?.useCases?.map((uc, idx) => (
                                            <span
                                                key={idx}
                                                className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-full font-medium flex items-center gap-1.5"
                                            >
                                                {uc.icon && <span>{uc.icon}</span>}
                                                <span>{uc.label}</span>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Section 3 - Cards */}
                            {selectedSolution.section3?.cards && selectedSolution.section3.cards.length > 0 && (
                                <div className="border-t border-slate-100 pt-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                                            Strategy Cards ({selectedSolution.section3.cards.length})
                                        </h4>
                                        {selectedSolution.section3.badge && (
                                            <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded-full font-medium">
                                                {selectedSolution.section3.badge}
                                            </span>
                                        )}
                                    </div>
                                    {selectedSolution.section3.title && (
                                        <p className="text-xs font-semibold text-slate-800">{selectedSolution.section3.title}</p>
                                    )}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                        {selectedSolution.section3.cards.map((card, idx) => (
                                            <div
                                                key={idx}
                                                className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/60 flex flex-col justify-between"
                                            >
                                                <div>
                                                    {card.icon && <div className="text-xl mb-1.5">{card.icon}</div>}
                                                    <p className="font-bold text-xs text-slate-900">{card.title}</p>
                                                    <p className="text-xs text-slate-500 mt-1 line-clamp-3">{card.description}</p>
                                                </div>
                                                {card.actionText && (
                                                    <a
                                                        href={card.actionLink || '#'}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-[11px] font-semibold text-slate-900 hover:text-indigo-600 mt-3 block"
                                                    >
                                                        {card.actionText} →
                                                    </a>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Section 4 - CTA */}
                            {selectedSolution.section4 && (
                                <div className="border-t border-slate-100 pt-4">
                                    <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-sm">
                                        <h5 className="text-base font-bold tracking-tight">{selectedSolution.section4.heading}</h5>
                                        <p className="text-xs text-slate-300 mt-1">{selectedSolution.section4.subtext}</p>
                                        {selectedSolution.section4.buttonText && (
                                            <a
                                                href={selectedSolution.section4.buttonLink || '#'}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-block mt-4 bg-white text-slate-900 font-semibold px-4 py-2 rounded-xl text-xs hover:bg-slate-100 transition"
                                            >
                                                {selectedSolution.section4.buttonText}
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Metadata */}
                            <div className="grid grid-cols-2 gap-3 text-xs text-slate-500 pt-2 border-t border-slate-100">
                                <div>Created: <span className="text-slate-800 font-medium">{formatDate(selectedSolution.createdAt)}</span></div>
                                <div>Updated: <span className="text-slate-800 font-medium">{formatDate(selectedSolution.updatedAt)}</span></div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4 mt-6 border-t border-slate-100">
                            <button
                                onClick={() => {
                                    setIsViewModalOpen(false);
                                    handleEdit(selectedSolution);
                                }}
                                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition"
                            >
                                Edit Solution
                            </button>
                            <button
                                onClick={() => {
                                    setIsViewModalOpen(false);
                                    setSelectedSolution(null);
                                }}
                                className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ----------------------------------------------------------------- */}
            {/* Delete Modal */}
            {/* ----------------------------------------------------------------- */}
            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedSolution(null);
                }}
                onConfirm={handleDelete}
                title="Delete Solution"
                itemName={selectedSolution?.label || ''}
                isSubmitting={isSubmitting}
            />
        </div>
    );
}