// app/(admin)/industries-management/page.tsx
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
import { CreateIndustryModal } from '@/components/Admin/industries/CreateIndustryModal';
import { EditIndustryModal } from '@/components/Admin/industries/EditIndustryModal';
import { ViewIndustryModal } from '@/components/Admin/industries/ViewIndustryModal';
import { DeleteIndustryModal } from '@/components/Admin/industries/DeleteIndustryModal';

// ============================================
// TYPES
// ============================================

export interface CaseStudy {
    title: string;
    description: string;
    imageUrl: string;
    link: string;
}

export interface Industry {
    _id: string;
    id?: string;
    label: string;
    slug?: string;
    desc?: string;
    icon?: string;
    imageUrl?: string;
    title: string;
    subtitle?: string;
    overview?: string;
    challenges?: string[];
    solutions?: string[];
    benefits?: string[];
    caseStudy?: CaseStudy;
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
// IMAGE HELPER COMPONENT
// ============================================

const IndustryImage: React.FC<{
    src?: string;
    alt: string;
    className?: string;
    fallback?: string;
}> = ({ src, alt, className = 'w-full h-full object-cover', fallback = '🏢' }) => {
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

export default function IndustriesManagementPage() {
    const { token } = useAuth();

    // State
    const [industries, setIndustries] = useState<Industry[]>([]);
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
    const [selectedIndustry, setSelectedIndustry] = useState<Industry | null>(null);

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
    // Fetch Industries
    // ============================================

    const fetchIndustries = useCallback(
        async (quiet = false) => {
            if (!token) return;
            const toastId = !quiet ? toast.loading('Syncing industry verticals...') : undefined;
            setIsLoading(true);
            try {
                const response = await apiCall<Industry[]>(`/industries?page=${currentPage}&limit=${itemsPerPage}`);
                if (response.success && Array.isArray(response.data)) {
                    setIndustries(response.data);
                    setTotalPages(response.pagination?.pages || 1);
                    if (toastId) toast.success(`Synced ${response.data.length} industries`, { id: toastId });
                } else {
                    if (toastId) toast.error(response.message || 'Failed to load industries', { id: toastId });
                }
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : 'Failed to load industries';
                if (toastId) toast.error(message, { id: toastId });
            } finally {
                setIsLoading(false);
            }
        },
        [token, apiCall, currentPage, itemsPerPage]
    );

    useEffect(() => {
        fetchIndustries(true);
    }, [fetchIndustries]);

    // Computed Dashboard Metrics
    const stats = useMemo(() => {
        const total = industries.length;
        const active = industries.filter((i) => i.isActive).length;
        const inactive = industries.filter((i) => !i.isActive).length;
        const activeRate = total > 0 ? Math.round((active / total) * 100) : 0;
        return { total, active, inactive, activeRate };
    }, [industries]);

    // Filtered Industries
    const filteredIndustries = useMemo(() => {
        const query = searchTerm.toLowerCase().trim();
        return industries.filter((industry) => {
            const indId = industry.id || industry._id;
            const matchesSearch =
                !query ||
                industry.label.toLowerCase().includes(query) ||
                industry.title.toLowerCase().includes(query) ||
                industry.desc?.toLowerCase().includes(query) ||
                industry.slug?.toLowerCase().includes(query) ||
                indId.toLowerCase().includes(query);

            const matchesStatus =
                filterStatus === 'all' ||
                (filterStatus === 'active' && industry.isActive) ||
                (filterStatus === 'inactive' && !industry.isActive);

            return matchesSearch && matchesStatus;
        });
    }, [industries, searchTerm, filterStatus]);

    // ============================================
    // CRUD Handlers
    // ============================================

    const handleCreate = async (formData: FormData) => {
        if (!token) return;
        setIsSubmitting(true);
        const toastId = toast.loading('Creating industry vertical...');
        try {
            const response = await apiCall<Industry>('/industries', {
                method: 'POST',
                body: formData,
            });
            if (response.success && response.data) {
                setIsCreateModalOpen(false);
                toast.success('Industry created successfully!', { id: toastId });
                await fetchIndustries(true);
            } else {
                toast.error(response.message || 'Failed to create industry', { id: toastId });
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to create industry';
            toast.error(message, { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdate = async (formData: FormData) => {
        if (!token || !selectedIndustry) return;
        setIsSubmitting(true);
        const toastId = toast.loading('Updating industry vertical...');
        try {
            const industryId = selectedIndustry.id || selectedIndustry._id;
            const response = await apiCall<Industry>(`/industries/${industryId}`, {
                method: 'PUT',
                body: formData,
            });
            if (response.success) {
                setIsEditModalOpen(false);
                setSelectedIndustry(null);
                toast.success('Industry updated successfully!', { id: toastId });
                await fetchIndustries(true);
            } else {
                toast.error(response.message || 'Failed to update industry', { id: toastId });
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to update industry';
            toast.error(message, { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!token || !selectedIndustry) return;
        setIsSubmitting(true);
        const toastId = toast.loading(`Deleting ${selectedIndustry.label}...`);
        const previous = [...industries];

        // Optimistic UI state update
        setIndustries((prev) =>
            prev.filter((i) => i._id !== selectedIndustry._id && i.id !== selectedIndustry.id)
        );
        setIsDeleteModalOpen(false);

        try {
            const industryId = selectedIndustry.id || selectedIndustry._id;
            const response = await apiCall(`/industries/${industryId}`, {
                method: 'DELETE',
            });
            if (response.success) {
                setSelectedIndustry(null);
                toast.success('Industry deleted successfully!', { id: toastId });
                await fetchIndustries(true);
            } else {
                setIndustries(previous);
                toast.error(response.message || 'Failed to delete industry', { id: toastId });
            }
        } catch (error: unknown) {
            setIndustries(previous);
            const message = error instanceof Error ? error.message : 'Failed to delete industry';
            toast.error(message, { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleStatus = async (industry: Industry) => {
        if (!token) return;
        const targetStatus = !industry.isActive;
        const industryId = industry.id || industry._id;

        // Optimistic update
        setIndustries((prev) =>
            prev.map((i) =>
                i._id === industry._id || (i.id && i.id === industry.id)
                    ? { ...i, isActive: targetStatus }
                    : i
            )
        );

        try {
            const response = await apiCall(`/industries/${industryId}/toggle`, {
                method: 'PUT',
            });
            if (response.success) {
                toast.success(`Industry ${targetStatus ? 'activated' : 'deactivated'}!`);
            } else {
                // Rollback
                setIndustries((prev) =>
                    prev.map((i) =>
                        i._id === industry._id || (i.id && i.id === industry.id)
                            ? { ...i, isActive: industry.isActive }
                            : i
                    )
                );
                toast.error(response.message || 'Failed to update status');
            }
        } catch {
            // Rollback
            setIndustries((prev) =>
                prev.map((i) =>
                    i._id === industry._id || (i.id && i.id === industry.id)
                        ? { ...i, isActive: industry.isActive }
                        : i
                )
            );
            toast.error('Failed to update status');
        }
    };

    // ============================================
    // Modal Handlers
    // ============================================

    const handleEdit = (industry: Industry) => {
        setSelectedIndustry(industry);
        setIsEditModalOpen(true);
    };

    const handleView = (industry: Industry) => {
        setSelectedIndustry(industry);
        setIsViewModalOpen(true);
    };

    const handleDeleteClick = (industry: Industry) => {
        setSelectedIndustry(industry);
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
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Industries Management</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Build industry sector workflows, infrastructure deployment scopes, and case studies.
                    </p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition shadow-xs hover:shadow"
                >
                    <Plus className="w-4 h-4" />
                    <span>Add Industry</span>
                </button>
            </div>

            {/* ----------------------------------------------------------------- */}
            {/* KPI Overview Metrics */}
            {/* ----------------------------------------------------------------- */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Industries</p>
                        <p className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 text-lg font-semibold">
                        🏢
                    </div>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Active Sectors</p>
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
                        <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider">Operational Ratio</p>
                        <p className="text-2xl font-bold text-purple-700 mt-1">{stats.activeRate}%</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                        %
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
                        placeholder="Search industries by label, title, ID, or slug..."
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
                        onClick={() => fetchIndustries(false)}
                        className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 transition"
                        title="Refresh list"
                    >
                        <RotateCw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* ----------------------------------------------------------------- */}
            {/* Industries Table */}
            {/* ----------------------------------------------------------------- */}
            <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                <th className="px-6 py-4">Industry Sector</th>
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
                            ) : filteredIndustries.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center">
                                        <div className="max-w-xs mx-auto text-center space-y-2">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-xl text-slate-400">
                                                🏢
                                            </div>
                                            <p className="text-sm font-bold text-slate-900">No industries found</p>
                                            <p className="text-xs text-slate-400">Try adjusting your filters or search keywords.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredIndustries.map((industry) => (
                                    <tr key={industry._id || industry.id} className="hover:bg-slate-50/60 transition-colors">
                                        {/* Industry Sector */}
                                        <td className="px-6 py-3.5">
                                            <div className="flex items-center gap-3.5">
                                                <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200/90 shrink-0 bg-slate-50">
                                                    <IndustryImage
                                                        src={industry.imageUrl}
                                                        alt={industry.label}
                                                        fallback={industry.icon || '🏢'}
                                                    />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-slate-900 truncate">{industry.label}</p>
                                                    <p className="text-xs text-slate-500 truncate max-w-xs">{industry.title}</p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* System ID */}
                                        <td className="px-6 py-3.5 whitespace-nowrap">
                                            <span className="text-xs font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                                                {industry.id || industry._id}
                                            </span>
                                        </td>

                                        {/* Description */}
                                        <td className="px-6 py-3.5">
                                            <p className="text-xs text-slate-600 truncate max-w-sm">
                                                {industry.desc || 'No summary overview provided'}
                                            </p>
                                        </td>

                                        {/* Status */}
                                        <td className="px-6 py-3.5 whitespace-nowrap">
                                            <span
                                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${industry.isActive
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                        : 'bg-slate-100 text-slate-500 border-slate-200'
                                                    }`}
                                            >
                                                <span className={`w-1.5 h-1.5 rounded-full ${industry.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                                {industry.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>

                                        {/* Registered Date */}
                                        <td className="px-6 py-3.5 text-xs text-slate-500 whitespace-nowrap">
                                            {formatDate(industry.createdAt)}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-3.5 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => handleView(industry)}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>

                                                <button
                                                    onClick={() => handleEdit(industry)}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>

                                                <button
                                                    onClick={() => handleToggleStatus(industry)}
                                                    className={`p-1.5 rounded-lg transition ${industry.isActive
                                                            ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                                                            : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                                                        }`}
                                                    title={industry.isActive ? 'Deactivate' : 'Activate'}
                                                >
                                                    <RotateCw className="w-4 h-4" />
                                                </button>

                                                <button
                                                    onClick={() => handleDeleteClick(industry)}
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
            <CreateIndustryModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreate}
                isSubmitting={isSubmitting}
            />

            <EditIndustryModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedIndustry(null);
                }}
                onSubmit={handleUpdate}
                initialData={selectedIndustry as any}
                isSubmitting={isSubmitting}
            />

            {isViewModalOpen && selectedIndustry && (
                <ViewIndustryModal
                    industry={selectedIndustry as any}
                    onClose={() => {
                        setIsViewModalOpen(false);
                        setSelectedIndustry(null);
                    }}
                    onEdit={() => {
                        setIsViewModalOpen(false);
                        handleEdit(selectedIndustry);
                    }}
                />
            )}

            <DeleteIndustryModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedIndustry(null);
                }}
                onConfirm={handleDelete}
                industryName={selectedIndustry?.label || ''}
                isSubmitting={isSubmitting}
            />
        </div>
    );
}