// app/(admin)/categories/page.tsx
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

// -----------------------------------------------------------------------------
// 1. Data Contracts & Interfaces
// -----------------------------------------------------------------------------

export interface Category {
    _id: string;
    id: string;
    name: string;
    description: string;
    icon: string;
    slug: string;
    parentId: string | null;
    parent?: string | null;
    level: number;
    order: number;
    isActive: boolean;
    productCount: number;
    subcategoryCount: number;
    subcategories?: Category[];
    metaTitle?: string;
    metaDescription?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CategoryFormData {
    name: string;
    description: string;
    icon: string;
    parentId: string | null;
    order: number;
    isActive: boolean;
    metaTitle: string;
    metaDescription: string;
}

const INITIAL_FORM: CategoryFormData = {
    name: '',
    description: '',
    icon: '📂',
    parentId: null,
    order: 0,
    isActive: true,
    metaTitle: '',
    metaDescription: '',
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// -----------------------------------------------------------------------------
// 2. Main Component
// -----------------------------------------------------------------------------

export default function CategoriesPage() {

    const { token } = useAuth();

    // Data State
    const [categories, setCategories] = useState<Category[]>([]);
    const [categoryTree, setCategoryTree] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    // Search, Filter & Expansion State
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [filterLevel, setFilterLevel] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

    // Modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);

    // Active Selection & Form
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState<CategoryFormData>(INITIAL_FORM);

    // -------------------------------------------------------------------------
    // API Helper
    // -------------------------------------------------------------------------

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

    // -------------------------------------------------------------------------
    // Fetch Categories
    // -------------------------------------------------------------------------

    const fetchCategories = useCallback(async (quiet = false) => {
        if (!token) return;
        const toastId = !quiet ? toast.loading('Syncing category hierarchy...') : undefined;
        try {
            const response = await apiCall('/categories');
            if (response.success) {
                setCategories(response.data || []);
                setCategoryTree(response.tree || []);
                if (toastId) toast.success(`Loaded ${response.data?.length || 0} categories`, { id: toastId });
            } else {
                if (toastId) toast.error(response.message || 'Failed to load categories', { id: toastId });
            }
        } catch (error: any) {
            console.error('Error fetching categories:', error);
            if (toastId) toast.error(error.message || 'Network connection failed', { id: toastId });
        } finally {
            setIsLoading(false);
        }
    }, [token, apiCall]);

    useEffect(() => {
        fetchCategories(true);
    }, [fetchCategories]);

    // Computed Dashboard Metrics
    const stats = useMemo(() => {
        const total = categories.length;
        const mainCategories = categories.filter((c) => c.level === 0).length;
        const subCategories = categories.filter((c) => c.level > 0).length;
        const active = categories.filter((c) => c.isActive).length;
        const activeRate = total > 0 ? Math.round((active / total) * 100) : 0;
        return { total, mainCategories, subCategories, active, activeRate };
    }, [categories]);

    // Filter & Search Algorithm
    const filteredCategories = useMemo(() => {
        const query = searchTerm.toLowerCase().trim();
        return categories.filter((category) => {
            const matchesSearch =
                !query ||
                category.name.toLowerCase().includes(query) ||
                category.description?.toLowerCase().includes(query) ||
                category.id?.toLowerCase().includes(query);

            const matchesLevel =
                filterLevel === 'all' ||
                (filterLevel === 'main' && category.level === 0) ||
                (filterLevel === 'sub' && category.level > 0);

            const matchesStatus =
                filterStatus === 'all' ||
                (filterStatus === 'active' && category.isActive) ||
                (filterStatus === 'inactive' && !category.isActive);

            return matchesSearch && matchesLevel && matchesStatus;
        });
    }, [categories, searchTerm, filterLevel, filterStatus]);

    // Expand / Collapse Node
    const toggleExpand = (id: string) => {
        setExpandedCategories((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    // -------------------------------------------------------------------------
    // CRUD Handlers
    // -------------------------------------------------------------------------

    // Create Category
    const handleCreateCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;
        setIsSubmitting(true);
        const toastId = toast.loading('Creating category...');

        try {
            const response = await apiCall('/categories', {
                method: 'POST',
                body: JSON.stringify(formData),
            });

            if (response.success) {
                await fetchCategories(true);
                setIsCreateModalOpen(false);
                setFormData(INITIAL_FORM);
                toast.success(`Category "${formData.name}" added successfully!`, { id: toastId });
            } else {
                toast.error(response.message || 'Creation rejected', { id: toastId });
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to create category', { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Open Edit Modal
    const handleOpenEdit = (category: Category) => {
        setSelectedCategory(category);
        setFormData({
            name: category.name,
            description: category.description || '',
            icon: category.icon || '📂',
            parentId: category.parentId || null,
            order: category.order || 0,
            isActive: category.isActive,
            metaTitle: category.metaTitle || '',
            metaDescription: category.metaDescription || '',
        });
        setIsEditModalOpen(true);
    };

    // Update Category
    const handleUpdateCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token || !selectedCategory) return;
        setIsSubmitting(true);
        const toastId = toast.loading('Saving changes...');

        try {
            const response = await apiCall(`/categories/${selectedCategory.id || selectedCategory._id}`, {
                method: 'PUT',
                body: JSON.stringify(formData),
            });

            if (response.success) {
                await fetchCategories(true);
                setIsEditModalOpen(false);
                setSelectedCategory(null);
                setFormData(INITIAL_FORM);
                toast.success('Category updated successfully!', { id: toastId });
            } else {
                toast.error(response.message || 'Update failed', { id: toastId });
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to update category', { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Delete Category (Optimistic with rollback)
    const handleDeleteCategory = async () => {
        if (!token || !selectedCategory) return;
        setIsSubmitting(true);
        const toastId = toast.loading(`Deleting ${selectedCategory.name}...`);
        const previous = [...categories];

        setCategories((prev) => prev.filter((c) => c._id !== selectedCategory._id));

        try {
            const response = await apiCall(`/categories/${selectedCategory.id || selectedCategory._id}`, {
                method: 'DELETE',
            });

            if (response.success) {
                await fetchCategories(true);
                setIsDeleteModalOpen(false);
                setSelectedCategory(null);
                toast.success('Category permanently removed', { id: toastId });
            } else {
                setCategories(previous);
                toast.error(response.message || 'Deletion failed on server', { id: toastId });
            }
        } catch (error: any) {
            setCategories(previous);
            toast.error(error.message || 'Failed to delete category', { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Toggle Status (Optimistic)
    const handleToggleStatus = async (category: Category) => {
        if (!token) return;
        const targetStatus = !category.isActive;

        setCategories((prev) =>
            prev.map((c) => (c._id === category._id ? { ...c, isActive: targetStatus } : c))
        );

        try {
            const response = await apiCall(`/categories/${category.id || category._id}/toggle`, {
                method: 'PUT',
            });

            if (response.success) {
                toast.success(`${category.name} is now ${targetStatus ? 'Active' : 'Deactivated'}`);
            } else {
                fetchCategories(true);
                toast.error(response.message || 'Failed to update status');
            }
        } catch (error: any) {
            fetchCategories(true);
            toast.error(error.message || 'Failed to update status');
        }
    };

    // -------------------------------------------------------------------------
    // Recursive Tree Table Renderer
    // -------------------------------------------------------------------------

    const renderCategoryRows = (nodes: Category[], depth = 0): React.ReactNode => {
        return nodes.map((category) => {
            const isExpanded = expandedCategories.has(category.id);
            const hasChildren = Boolean(category.subcategories && category.subcategories.length > 0);

            return (
                <React.Fragment key={category._id || category.id}>
                    <tr className={`hover:bg-slate-50/80 transition-colors ${depth > 0 ? 'bg-slate-50/30' : ''}`}>
                        {/* Title & Tree Level */}
                        <td className="px-6 py-3.5">
                            <div className="flex items-center gap-2">
                                {/* Hierarchy Indent Spacer */}
                                {depth > 0 && (
                                    <div style={{ width: `${depth * 20}px` }} className="flex items-center justify-end pr-1 shrink-0">
                                        <span className="text-slate-300 font-mono select-none">└</span>
                                    </div>
                                )}

                                {/* Tree Expander Button */}
                                {hasChildren ? (
                                    <button
                                        type="button"
                                        onClick={() => toggleExpand(category.id)}
                                        className="p-1 hover:bg-slate-200/80 text-slate-500 hover:text-[#0B192C] rounded-md transition-colors"
                                        aria-label={isExpanded ? 'Collapse row' : 'Expand row'}
                                    >
                                        <svg
                                            className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-90 text-[#0B192C]' : ''}`}
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth="2.5"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                        </svg>
                                    </button>
                                ) : (
                                    <span className="w-5.5 shrink-0" />
                                )}

                                {/* Icon & Label */}
                                <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200/90 flex items-center justify-center text-base shrink-0 shadow-2xs">
                                    {category.icon || '📂'}
                                </div>

                                <div className="min-w-0">
                                    <p className="font-bold text-[#0B192C] truncate">{category.name}</p>
                                    <p className="text-[11px] text-slate-400 truncate max-w-[200px]">
                                        {category.description || 'No operational description'}
                                    </p>
                                </div>
                            </div>
                        </td>

                        {/* Level Badge */}
                        <td className="px-6 py-3.5">
                            <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${category.level === 0
                                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200/70'
                                    : 'bg-sky-50 text-sky-700 border-sky-200/70'
                                    }`}
                            >
                                {category.level === 0 ? 'Root Category' : `Level ${category.level}`}
                            </span>
                        </td>

                        {/* Subcategory Count */}
                        <td className="px-6 py-3.5 font-mono text-xs text-slate-600 font-bold">
                            <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200/80 text-slate-700">
                                {category.subcategoryCount || category.subcategories?.length || 0}
                            </span>
                        </td>

                        {/* Product Count */}
                        <td className="px-6 py-3.5 font-mono text-xs text-slate-600 font-bold">
                            <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700">
                                {category.productCount || 0}
                            </span>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-3.5">
                            <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${category.isActive
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                                    : 'bg-rose-50 text-rose-700 border-rose-200/80'
                                    }`}
                            >
                                <span className={`w-1.5 h-1.5 rounded-full ${category.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                {category.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1">
                                <button
                                    onClick={() => {
                                        setSelectedCategory(category);
                                        setIsViewModalOpen(true);
                                    }}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                                    title="View Category"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </button>

                                <button
                                    onClick={() => handleOpenEdit(category)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                    title="Edit Category"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                    </svg>
                                </button>

                                <button
                                    onClick={() => handleToggleStatus(category)}
                                    className={`p-1.5 rounded-lg transition-colors ${category.isActive
                                        ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                                        : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                                        }`}
                                    title={category.isActive ? 'Deactivate Category' : 'Activate Category'}
                                >
                                    {category.isActive ? (
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
                                    onClick={() => {
                                        setSelectedCategory(category);
                                        setIsDeleteModalOpen(true);
                                    }}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                    title="Delete Category"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                    </svg>
                                </button>
                            </div>
                        </td>
                    </tr>

                    {/* Render Children Recursively if Expanded */}
                    {isExpanded && hasChildren && category.subcategories && renderCategoryRows(category.subcategories, depth + 1)}
                </React.Fragment>
            );
        });
    };

    return (
        <div className="space-y-6 container mx-auto pb-12">
            {/* ----------------------------------------------------------------- */}
            {/* Header & Primary Action Button                                    */}
            {/* ----------------------------------------------------------------- */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0B192C]">
                        Category Management
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        Structure hardware catalogs, power tiers, and connector classification groups.
                    </p>
                </div>
                <button
                    onClick={() => {
                        setFormData(INITIAL_FORM);
                        setIsCreateModalOpen(true);
                    }}
                    className="inline-flex items-center justify-center gap-2 bg-[#0B192C] hover:bg-[#1E3E62] text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-[#0B192C]/10 transition-all focus:outline-none focus:ring-2 focus:ring-[#0B192C]/30 shrink-0"
                >
                    <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Add New Category</span>
                </button>
            </div>

            {/* ----------------------------------------------------------------- */}
            {/* KPI Metric Overview Cards                                         */}
            {/* ----------------------------------------------------------------- */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-colors">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Groups</span>
                    <p className="text-2xl sm:text-3xl font-bold text-[#0B192C] font-mono mt-1.5">{stats.total}</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-colors">
                    <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">Root Categories</span>
                    <p className="text-2xl sm:text-3xl font-bold text-[#0B192C] font-mono mt-1.5">{stats.mainCategories}</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-colors">
                    <span className="text-[11px] font-bold text-sky-600 uppercase tracking-wider">Sub-Tier Levels</span>
                    <p className="text-2xl sm:text-3xl font-bold text-[#0B192C] font-mono mt-1.5">{stats.subCategories}</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-colors">
                    <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Catalog Health</span>
                    <p className="text-2xl sm:text-3xl font-bold text-[#0B192C] font-mono mt-1.5">{stats.activeRate}%</p>
                </div>
            </div>

            {/* ----------------------------------------------------------------- */}
            {/* Filter Toolbar                                                    */}
            {/* ----------------------------------------------------------------- */}
            <div className="flex flex-col sm:flex-row gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="relative flex-1">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </span>
                    <input
                        type="text"
                        placeholder="Search by category name, ID, or slug..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/10 focus:border-[#0B192C] text-slate-800 transition-all placeholder:text-slate-400"
                    />
                </div>

                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                    <select
                        value={filterLevel}
                        onChange={(e) => setFilterLevel(e.target.value)}
                        className="text-xs sm:text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/10 focus:border-[#0B192C] text-slate-700 font-medium transition-all"
                    >
                        <option value="all">All Levels</option>
                        <option value="main">Root Categories</option>
                        <option value="sub">Subcategories</option>
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
                        onClick={() => fetchCategories(false)}
                        aria-label="Refresh categories"
                        className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 hover:text-[#0B192C] transition-colors focus:outline-none"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.03 8.03 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* ----------------------------------------------------------------- */}
            {/* Main Category Hierarchy Table                                     */}
            {/* ----------------------------------------------------------------- */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                <th className="px-6 py-4">Classification Group</th>
                                <th className="px-6 py-4">Hierarchy Tier</th>
                                <th className="px-6 py-4">Sub-Levels</th>
                                <th className="px-6 py-4">Linked Units</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-slate-200" />
                                                <div className="space-y-1.5">
                                                    <div className="w-28 h-3.5 bg-slate-200 rounded" />
                                                    <div className="w-36 h-2.5 bg-slate-100 rounded" />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4"><div className="w-16 h-5 bg-slate-200 rounded-full" /></td>
                                        <td className="px-6 py-4"><div className="w-8 h-4 bg-slate-200 rounded" /></td>
                                        <td className="px-6 py-4"><div className="w-8 h-4 bg-slate-200 rounded" /></td>
                                        <td className="px-6 py-4"><div className="w-16 h-5 bg-slate-200 rounded-full" /></td>
                                        <td className="px-6 py-4"><div className="w-20 h-6 bg-slate-200 rounded ml-auto" /></td>
                                    </tr>
                                ))
                            ) : filteredCategories.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center">
                                        <div className="max-w-xs mx-auto text-center space-y-2">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-400 text-xl">
                                                📂
                                            </div>
                                            <p className="text-sm font-bold text-[#0B192C]">No categories found</p>
                                            <p className="text-xs text-slate-400">Try adjusting your search queries or filter constraints.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                renderCategoryRows(
                                    categoryTree.length > 0 && searchTerm === '' && filterLevel === 'all' && filterStatus === 'all'
                                        ? categoryTree
                                        : filteredCategories
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ----------------------------------------------------------------- */}
            {/* Create Category Modal                                             */}
            {/* ----------------------------------------------------------------- */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B192C]/40 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-200">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                            <div>
                                <h2 className="text-lg font-bold text-[#0B192C]">Add New Category</h2>
                                <p className="text-xs text-slate-500">Configure catalog hierarchy parameters</p>
                            </div>
                            <button
                                onClick={() => setIsCreateModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleCreateCategory} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Category Name <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        placeholder="e.g., Ultra-Fast DC Dispensers"
                                        className="w-full px-3.5 py-2 text-black text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Description
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={2}
                                        placeholder="High-output commercial fast chargers (150kW - 350kW)"
                                        className="w-full px-3.5 py-2 text-black text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all resize-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Icon / Emoji <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.icon}
                                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                        required
                                        placeholder="📂"
                                        className="w-full px-3.5 py-2 text-black text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Parent Category
                                    </label>
                                    <select
                                        value={formData.parentId || ''}
                                        onChange={(e) => setFormData({ ...formData, parentId: e.target.value || null })}
                                        className="w-full px-3.5 py-2 text-black text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all"
                                    >
                                        <option value="">None (Root Main Category)</option>
                                        {categories
                                            .filter((c) => c.level === 0)
                                            .map((cat) => (
                                                <option key={cat.id || cat._id} value={cat.id || cat._id}>
                                                    {cat.name}
                                                </option>
                                            ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Display Sort Order
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.order}
                                        onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value, 10) || 0 })}
                                        min="0"
                                        className="w-full px-3.5 py-2 text-black text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all"
                                    />
                                </div>
                            </div>

                            {/* SEO Meta Section */}
                            <div className="border-t border-slate-100 pt-4">
                                <h3 className="text-xs font-bold text-[#0B192C] uppercase tracking-wider mb-3">SEO Configuration</h3>
                                <div className="space-y-3">
                                    <div>
                                        <input
                                            type="text"
                                            value={formData.metaTitle}
                                            onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                                            placeholder="Meta Title Tag"
                                            className="w-full px-3.5 py-2 text-black text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all"
                                        />
                                    </div>
                                    <div>
                                        <textarea
                                            value={formData.metaDescription}
                                            onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                                            rows={2}
                                            placeholder="Meta Description Tag"
                                            className="w-full px-3.5 py-2 text-black text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all resize-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Active Flag */}
                            <div className="flex items-center gap-2 pt-1">
                                <input
                                    type="checkbox"
                                    id="create-category-active"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="w-4 h-4 rounded-md border-slate-300 text-[#0B192C] focus:ring-[#0B192C]"
                                />
                                <label htmlFor="create-category-active" className="text-xs font-semibold text-slate-700 cursor-pointer">
                                    Set as Active Category
                                </label>
                            </div>

                            <div className="flex gap-3 pt-5 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="flex-1 px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs sm:text-sm font-bold transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 bg-[#0B192C] hover:bg-[#1E3E62] text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-[#0B192C]/10 transition-colors disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Creating...' : 'Create Category'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ----------------------------------------------------------------- */}
            {/* Edit Category Modal                                               */}
            {/* ----------------------------------------------------------------- */}
            {isEditModalOpen && selectedCategory && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B192C]/40 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-200">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                            <div>
                                <h2 className="text-lg font-bold text-[#0B192C]">Edit Category</h2>
                                <p className="text-xs text-slate-500">Update classification grouping and hierarchy placement</p>
                            </div>
                            <button
                                onClick={() => {
                                    setIsEditModalOpen(false);
                                    setSelectedCategory(null);
                                }}
                                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleUpdateCategory} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Category Name <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        className="w-full px-3.5 py-2 text-black text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Description
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={2}
                                        className="w-full px-3.5 py-2 text-black text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all resize-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Icon / Emoji <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.icon}
                                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                        required
                                        className="w-full px-3.5 py-2 text-black text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Parent Category
                                    </label>
                                    <select
                                        value={formData.parentId || ''}
                                        onChange={(e) => setFormData({ ...formData, parentId: e.target.value || null })}
                                        className="w-full px-3.5 py-2 text-black text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all"
                                    >
                                        <option value="">None (Root Main Category)</option>
                                        {categories
                                            .filter((c) => c.level === 0 && (c.id || c._id) !== (selectedCategory.id || selectedCategory._id))
                                            .map((cat) => (
                                                <option key={cat.id || cat._id} value={cat.id || cat._id}>
                                                    {cat.name}
                                                </option>
                                            ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Display Sort Order
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.order}
                                        onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value, 10) || 0 })}
                                        min="0"
                                        className="w-full px-3.5 py-2 text-black text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all"
                                    />
                                </div>
                            </div>

                            {/* SEO Meta Section */}
                            <div className="border-t border-slate-100 pt-4">
                                <h3 className="text-xs font-bold text-[#0B192C] uppercase tracking-wider mb-3">SEO Configuration</h3>
                                <div className="space-y-3">
                                    <div>
                                        <input
                                            type="text"
                                            value={formData.metaTitle}
                                            onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                                            placeholder="Meta Title Tag"
                                            className="w-full px-3.5 py-2 text-black text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all"
                                        />
                                    </div>
                                    <div>
                                        <textarea
                                            value={formData.metaDescription}
                                            onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                                            rows={2}
                                            placeholder="Meta Description Tag"
                                            className="w-full px-3.5 py-2 text-black text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all resize-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                                <input
                                    type="checkbox"
                                    id="edit-category-active"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="w-4 h-4 rounded-md border-slate-300 text-[#0B192C] focus:ring-[#0B192C]"
                                />
                                <label htmlFor="edit-category-active" className="text-xs font-semibold text-slate-700 cursor-pointer">
                                    Category Active
                                </label>
                            </div>

                            <div className="flex gap-3 pt-5 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditModalOpen(false);
                                        setSelectedCategory(null);
                                    }}
                                    className="flex-1 px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs sm:text-sm font-bold transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 bg-[#0B192C] hover:bg-[#1E3E62] text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-[#0B192C]/10 transition-colors disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ----------------------------------------------------------------- */}
            {/* View Modal                                                        */}
            {/* ----------------------------------------------------------------- */}
            {isViewModalOpen && selectedCategory && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B192C]/40 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="bg-white rounded-3xl w-full max-w-lg p-6 sm:p-7 shadow-2xl border border-slate-200">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                            <div>
                                <h2 className="text-lg font-bold text-[#0B192C]">Category Details</h2>
                                <p className="text-xs text-slate-500">Taxonomy hierarchy and unit associations</p>
                            </div>
                            <button
                                onClick={() => {
                                    setIsViewModalOpen(false);
                                    setSelectedCategory(null);
                                }}
                                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-3xl shadow-xs">
                                    {selectedCategory.icon || '📂'}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-lg font-bold text-[#0B192C]">{selectedCategory.name}</h3>
                                    <p className="text-xs font-mono text-slate-500">Slug: /{selectedCategory.slug || 'n-a'}</p>
                                    <p className="text-[11px] text-slate-400 mt-0.5">
                                        Tier: {selectedCategory.level === 0 ? 'Root Classification' : `Sub-Level ${selectedCategory.level}`}
                                    </p>
                                </div>
                            </div>

                            {selectedCategory.description && (
                                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Description</span>
                                    <p className="text-xs text-slate-700 mt-1 leading-relaxed">{selectedCategory.description}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-3 text-xs">
                                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Parent Group</span>
                                    <span className="font-semibold text-slate-800 block mt-1 truncate">
                                        {selectedCategory.parentId
                                            ? categories.find((c) => (c.id || c._id) === selectedCategory.parentId)?.name || 'Linked Subcategory'
                                            : 'Root Main Category'}
                                    </span>
                                </div>

                                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Status</span>
                                    <span
                                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold border mt-1 ${selectedCategory.isActive
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                            : 'bg-rose-50 text-rose-700 border-rose-200'
                                            }`}
                                    >
                                        <span className={`w-1.5 h-1.5 rounded-full ${selectedCategory.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                        {selectedCategory.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>

                                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Child Subcategories</span>
                                    <span className="font-bold text-[#0B192C] font-mono text-sm block mt-1">
                                        {selectedCategory.subcategoryCount || 0} Sub-nodes
                                    </span>
                                </div>

                                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Linked Hardware Units</span>
                                    <span className="font-bold text-blue-700 font-mono text-sm block mt-1">
                                        {selectedCategory.productCount || 0} Units
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4 mt-5 border-t border-slate-100">
                            <button
                                onClick={() => {
                                    setIsViewModalOpen(false);
                                    handleOpenEdit(selectedCategory);
                                }}
                                className="flex-1 bg-[#0B192C] hover:bg-[#1E3E62] text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors"
                            >
                                Edit Category
                            </button>
                            <button
                                onClick={() => setIsViewModalOpen(false)}
                                className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors"
                            >
                                Dismiss
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ----------------------------------------------------------------- */}
            {/* Delete Confirmation Modal                                         */}
            {/* ----------------------------------------------------------------- */}
            {isDeleteModalOpen && selectedCategory && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B192C]/40 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-slate-200 text-center">
                        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100 flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-[#0B192C]">Delete Category</h3>
                        <p className="text-xs text-slate-500 mt-2 mb-3 leading-relaxed">
                            Are you sure you want to remove <span className="font-bold text-slate-800">{selectedCategory.name}</span>?
                        </p>

                        {(selectedCategory.subcategoryCount > 0 || selectedCategory.productCount > 0) && (
                            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-2xl text-[11px] font-semibold text-amber-800 text-left space-y-1">
                                {selectedCategory.subcategoryCount > 0 && (
                                    <p>⚠️ Contains {selectedCategory.subcategoryCount} nested subcategories.</p>
                                )}
                                {selectedCategory.productCount > 0 && (
                                    <p>⚠️ Contains {selectedCategory.productCount} associated hardware units.</p>
                                )}
                                <p className="text-[10px] text-amber-600 font-normal pt-1">
                                    Reassign or delete these items before removing this category node.
                                </p>
                            </div>
                        )}

                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={() => {
                                    setIsDeleteModalOpen(false);
                                    setSelectedCategory(null);
                                }}
                                className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteCategory}
                                disabled={isSubmitting || selectedCategory.subcategoryCount > 0 || selectedCategory.productCount > 0}
                                className={`flex-1 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors shadow-md ${selectedCategory.subcategoryCount > 0 || selectedCategory.productCount > 0
                                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                                    : 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20'
                                    }`}
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