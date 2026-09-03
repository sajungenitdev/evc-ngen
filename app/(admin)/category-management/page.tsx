// app/(admin)/categories/page.tsx
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
// import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { AlertTriangle, Check, Power, PowerOff, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

// -----------------------------------------------------------------------------
// 1. Data Contracts & Interfaces
// -----------------------------------------------------------------------------

export interface Category {
  _id: string;
  id?: string;
  name: string;
  description?: string;
  icon?: string;
  slug?: string;
  parentId?: string | null;
  parent?: string | null;
  level?: number;
  order?: number;
  isActive: boolean;
  isActiveByParent?: boolean;
  productCount?: number;
  subcategoryCount?: number;
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

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  tree?: T;
  message?: string;
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://evc-ngen-server.onrender.com/api';

// -----------------------------------------------------------------------------
// 2. Helpers
// -----------------------------------------------------------------------------

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

// -----------------------------------------------------------------------------
// 3. Main Component
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

  // ---------------------------------------------------------------------------
  // API Helper
  // ---------------------------------------------------------------------------

  const apiCall = useCallback(
    async <T,>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> => {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          ...options.headers,
        },
      });
      return response.json();
    },
    [token]
  );

  // ---------------------------------------------------------------------------
  // Fetch Categories
  // ---------------------------------------------------------------------------

  const fetchCategories = useCallback(
    async (quiet = false) => {
      if (!token) return;
      const toastId = !quiet ? toast.loading('Syncing category hierarchy...') : undefined;
      setIsLoading(true);
      try {
        const response = await apiCall<Category[]>('/categories');
        if (response.success && Array.isArray(response.data)) {
          setCategories(response.data);
          setCategoryTree(Array.isArray(response.tree) ? response.tree : []);
          if (toastId) toast.success(`Loaded ${response.data.length} categories`, { id: toastId });
        } else {
          if (toastId) toast.error(response.message || 'Failed to load categories', { id: toastId });
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Network failure';
        if (toastId) toast.error(message, { id: toastId });
      } finally {
        setIsLoading(false);
      }
    },
    [token, apiCall]
  );

  useEffect(() => {
    fetchCategories(true);
  }, [fetchCategories]);

  // Computed Dashboard Metrics
  const stats = useMemo(() => {
    const total = categories.length;
    const mainCategories = categories.filter((c) => (c.level ?? 0) === 0).length;
    const subCategories = categories.filter((c) => (c.level ?? 0) > 0).length;
    const active = categories.filter((c) => c.isActive).length;
    const activeRate = total > 0 ? Math.round((active / total) * 100) : 0;
    return { total, mainCategories, subCategories, active, activeRate };
  }, [categories]);

  // Filter & Search Algorithm
  const filteredCategories = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();
    return categories.filter((category) => {
      const categoryId = category.id || category._id;
      const matchesSearch =
        !query ||
        category.name.toLowerCase().includes(query) ||
        category.description?.toLowerCase().includes(query) ||
        categoryId.toLowerCase().includes(query) ||
        category.slug?.toLowerCase().includes(query);

      const matchesLevel =
        filterLevel === 'all' ||
        (filterLevel === 'main' && (category.level ?? 0) === 0) ||
        (filterLevel === 'sub' && (category.level ?? 0) > 0);

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

  // ---------------------------------------------------------------------------
  // CRUD Handlers
  // ---------------------------------------------------------------------------

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setIsSubmitting(true);
    const toastId = toast.loading('Creating category...');

    try {
      const response = await apiCall<Category>('/categories', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      if (response.success && response.data) {
        setIsCreateModalOpen(false);
        setFormData(INITIAL_FORM);
        toast.success(`Category "${formData.name}" added successfully!`, { id: toastId });
        await fetchCategories(true);
      } else {
        toast.error(response.message || 'Creation rejected', { id: toastId });
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to create category';
      toast.error(message, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (category: Category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      icon: category.icon || '📂',
      parentId: category.parentId || category.parent || null,
      order: category.order || 0,
      isActive: category.isActive,
      metaTitle: category.metaTitle || '',
      metaDescription: category.metaDescription || '',
    });
    setIsEditModalOpen(true);
  };

  const handleOpenView = (category: Category) => {
    setSelectedCategory(category);
    setIsViewModalOpen(true);
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedCategory) return;
    setIsSubmitting(true);
    const toastId = toast.loading('Saving changes...');

    try {
      const categoryId = selectedCategory.id || selectedCategory._id;
      const response = await apiCall<Category>(`/categories/${categoryId}`, {
        method: 'PUT',
        body: JSON.stringify(formData),
      });

      if (response.success) {
        setIsEditModalOpen(false);
        setSelectedCategory(null);
        setFormData(INITIAL_FORM);
        toast.success('Category updated successfully!', { id: toastId });
        await fetchCategories(true);
      } else {
        toast.error(response.message || 'Update failed', { id: toastId });
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update category';
      toast.error(message, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!token || !selectedCategory) return;
    setIsSubmitting(true);
    const toastId = toast.loading(`Deleting ${selectedCategory.name}...`);
    const previous = [...categories];

    // Optimistic removal
    setCategories((prev) =>
      prev.filter((c) => c._id !== selectedCategory._id && c.id !== selectedCategory.id)
    );
    setIsDeleteModalOpen(false);

    try {
      const categoryId = selectedCategory.id || selectedCategory._id;
      const response = await apiCall(`/categories/${categoryId}`, {
        method: 'DELETE',
      });

      if (response.success) {
        setSelectedCategory(null);
        toast.success('Category removed successfully', { id: toastId });
        await fetchCategories(true);
      } else {
        setCategories(previous);
        toast.error(response.message || 'Deletion failed', { id: toastId });
      }
    } catch (error: unknown) {
      setCategories(previous);
      const message = error instanceof Error ? error.message : 'Failed to delete category';
      toast.error(message, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  // app/(admin)/categories/page.tsx

  const handleToggleStatus = async (category: Category) => {
    if (!token) return;
    const targetStatus = !category.isActive;

    // Check if category has children
    const hasChildren = (category.subcategoryCount || 0) > 0 ||
      (category.subcategories && category.subcategories.length > 0);

    // Show custom toast confirmation if deactivating with children
    if (!targetStatus && hasChildren) {
      const confirmDeactivate = await new Promise<boolean>((resolve) => {
        toast.custom(
          (t) => (
            <div
              className={`${t.visible ? 'animate-enter' : 'animate-leave'
                } max-w-md w-full bg-white shadow-2xl rounded-2xl border border-slate-200 pointer-events-auto overflow-hidden`}
            >
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-slate-900">
                      Deactivate Category?
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      This category has <span className="font-semibold text-slate-700">{category.subcategoryCount || 0}</span> subcategory(s).
                    </p>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Deactivating <span className="font-semibold text-slate-700">{category.name}</span> will also deactivate ALL its child categories.
                    </p>
                    <p className="text-xs font-medium text-amber-600 mt-2">
                      ⚠️ This action cannot be undone.
                    </p>
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
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      toast.dismiss(t.id);
                      resolve(true);
                    }}
                    className="flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Deactivate All
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

      if (!confirmDeactivate) return;
    }

    // Check if trying to activate but parent is inactive
    if (targetStatus && category.parentId) {
      try {
        const parent = await apiCall<{ isActive?: boolean; isActiveByParent?: boolean }>(`/categories/${category.parentId}`);
        if (parent.success && parent.data) {
          const parentEffectiveStatus = Boolean(parent.data.isActive) && Boolean(parent.data.isActiveByParent);
          if (!parentEffectiveStatus) {
            toast.error(`Cannot activate "${category.name}" because parent category is inactive`);
            return;
          }
        }
      } catch (error) {
        console.error('Error checking parent status:', error);
      }
    }

    // Optimistic update - update both categories and tree
    const previousCategories = [...categories];
    const previousTree = [...categoryTree];

    const updateCategoryStatus = (cats: Category[], targetId: string, status: boolean): Category[] => {
      return cats.map(cat => {
        if (cat._id === targetId || cat.id === targetId) {
          return { ...cat, isActive: status };
        }
        if (cat.subcategories && cat.subcategories.length > 0) {
          return {
            ...cat,
            subcategories: updateCategoryStatus(cat.subcategories, targetId, status)
          };
        }
        return cat;
      });
    };

    // Apply optimistic update
    setCategories(prev => updateCategoryStatus(prev, category.id || category._id, targetStatus));
    setCategoryTree(prev => updateCategoryStatus(prev, category.id || category._id, targetStatus));

    try {
      const categoryId = category.id || category._id;
      const response = await apiCall<{ category?: { childrenUpdated?: number } }>(`/categories/${categoryId}/toggle`, {
        method: 'PUT',
      });

      if (response.success) {
        const childrenUpdated = response.data?.category?.childrenUpdated ?? 0;
        const message = childrenUpdated > 0
          ? `Category ${targetStatus ? 'activated' : 'deactivated'} with ${childrenUpdated} subcategories`
          : `Category ${targetStatus ? 'activated' : 'deactivated'} successfully`;

        toast.success(message);
        // Refresh to get the latest data
        await fetchCategories(true);
      } else {
        // Rollback on failure
        setCategories(previousCategories);
        setCategoryTree(previousTree);
        toast.error(response.message || 'Failed to update status');
      }
    } catch (error) {
      // Rollback on error
      setCategories(previousCategories);
      setCategoryTree(previousTree);
      const message = error instanceof Error ? error.message : 'Failed to update status';
      toast.error(message);
    }
  };

  // ---------------------------------------------------------------------------
  // Recursive Tree Table Renderer
  // ---------------------------------------------------------------------------

  const renderCategoryRows = (nodes: Category[], depth = 0): React.ReactNode => {
    return nodes.map((category) => {
      const categoryKey = category.id || category._id;
      const isExpanded = expandedCategories.has(categoryKey);
      const hasChildren = Boolean(category.subcategories && category.subcategories.length > 0);
      const subCount = category.subcategoryCount || category.subcategories?.length || 0;
      const prodCount = category.productCount || 0;

      return (
        <React.Fragment key={category._id || category.id}>
          <tr className={`hover:bg-slate-50/60 transition-colors ${depth > 0 ? 'bg-slate-50/30' : ''}`}>
            {/* Title & Tree Level */}
            <td className="px-6 py-3.5">
              <div className="flex items-center gap-2">
                {depth > 0 && (
                  <div
                    style={{ width: `${depth * 20}px` }}
                    className="flex items-center justify-end pr-1 shrink-0 select-none text-slate-300 font-mono"
                  >
                    └
                  </div>
                )}

                {hasChildren ? (
                  <button
                    type="button"
                    onClick={() => toggleExpand(categoryKey)}
                    className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-900 rounded-md transition"
                    aria-label={isExpanded ? 'Collapse subcategories' : 'Expand subcategories'}
                  >
                    <svg
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-90 text-slate-900' : ''}`}
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

                <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200/90 flex items-center justify-center text-sm shrink-0">
                  {category.icon || '📂'}
                </div>

                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 truncate">{category.name}</p>
                  <p className="text-xs text-slate-400 truncate max-w-[220px]">
                    {category.description || 'No description provided'}
                  </p>
                </div>
              </div>
            </td>

            {/* Level Badge */}
            <td className="px-6 py-3.5 whitespace-nowrap">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${(category.level ?? 0) === 0
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200/70'
                  : 'bg-sky-50 text-sky-700 border-sky-200/70'
                  }`}
              >
                {(category.level ?? 0) === 0 ? 'Root' : `Level ${category.level}`}
              </span>
            </td>

            {/* Subcategory Count */}
            <td className="px-6 py-3.5 whitespace-nowrap">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-mono font-semibold text-slate-700">
                {subCount}
              </span>
            </td>

            {/* Product Count */}
            <td className="px-6 py-3.5 whitespace-nowrap">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200/60 text-xs font-mono font-semibold text-blue-700">
                {prodCount}
              </span>
            </td>
            <td className="px-6 py-3.5 whitespace-nowrap">
              <div className="flex flex-col gap-1">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${(category.isActive && category.isActiveByParent !== false)
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${(category.isActive && category.isActiveByParent !== false)
                    ? 'bg-emerald-500'
                    : 'bg-slate-400'
                    }`} />
                  {(category.isActive && category.isActiveByParent !== false) ? 'Active' : 'Inactive'}
                </span>

                {/* Show parent inactive indicator */}
                {category.isActiveByParent === false && (
                  <span className="text-[10px] text-amber-600 font-medium">
                    ⚠️ Parent inactive
                  </span>
                )}
              </div>
            </td>

            {/* Actions */}
            <td className="px-6 py-3.5 whitespace-nowrap text-right">
              <div className="flex items-center justify-end gap-1">
                <button
                  onClick={() => handleOpenView(category)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition"
                  title="View Category"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>

                <button
                  onClick={() => handleOpenEdit(category)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
                  title="Edit Category"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                  </svg>
                </button>
                <button
                  onClick={() => handleToggleStatus(category)}
                  className={`p-1.5 rounded-lg transition ${category.isActive
                    ? 'text-emerald-600 hover:text-amber-600 hover:bg-amber-50'
                    : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                    }`}
                  title={category.isActive ? 'Deactivate Category' : 'Activate Category'}
                >
                  {category.isActive ? (
                    <Power className="w-4 h-4" />
                  ) : (
                    <PowerOff className="w-4 h-4" />
                  )}
                </button>

                <button
                  onClick={() => {
                    setSelectedCategory(category);
                    setIsDeleteModalOpen(true);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                  title="Delete Category"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>

          {isExpanded && hasChildren && category.subcategories && renderCategoryRows(category.subcategories, depth + 1)}
        </React.Fragment>
      );
    });
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8 space-y-6 container mx-auto">
      {/* ----------------------------------------------------------------- */}
      {/* Page Header */}
      {/* ----------------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Category Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Organize catalog structures, nested product groups, and power tier classifications.
          </p>
        </div>
        <button
          onClick={() => {
            setFormData(INITIAL_FORM);
            setIsCreateModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition shadow-xs hover:shadow"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <span>Add New Category</span>
        </button>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* KPI Overview Metrics */}
      {/* ----------------------------------------------------------------- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Groups</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 text-lg font-semibold">
            📂
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Root Categories</p>
            <p className="text-2xl font-bold text-indigo-600 mt-1">{stats.mainCategories}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            🏷️
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-sky-600 uppercase tracking-wider">Sub-Tier Levels</p>
            <p className="text-2xl font-bold text-sky-600 mt-1">{stats.subCategories}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
            🌳
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Catalog Health</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.activeRate}%</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            ✓
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Filter Toolbar */}
      {/* ----------------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search by category name, ID, or slug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 text-slate-900 placeholder:text-slate-400 transition"
          />
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="text-sm px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-700 font-medium transition"
          >
            <option value="all">All Levels</option>
            <option value="main">Root Categories</option>
            <option value="sub">Subcategories</option>
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
            onClick={() => fetchCategories(false)}
            className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 transition"
            title="Refresh categories"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          </button>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Categories Hierarchy Table */}
      {/* ----------------------------------------------------------------- */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4">Classification Group</th>
                <th className="px-6 py-4">Hierarchy Tier</th>
                <th className="px-6 py-4">Sub-Levels</th>
                <th className="px-6 py-4">Linked Units</th>
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
                        <div className="w-8 h-8 rounded-lg bg-slate-200" />
                        <div className="space-y-1.5">
                          <div className="w-28 h-3.5 bg-slate-200 rounded" />
                          <div className="w-36 h-2.5 bg-slate-100 rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><div className="w-16 h-5 bg-slate-100 rounded-full" /></td>
                    <td className="px-6 py-4"><div className="w-8 h-4 bg-slate-100 rounded" /></td>
                    <td className="px-6 py-4"><div className="w-8 h-4 bg-slate-100 rounded" /></td>
                    <td className="px-6 py-4"><div className="w-16 h-5 bg-slate-100 rounded-full" /></td>
                    <td className="px-6 py-4"><div className="w-20 h-6 bg-slate-100 rounded ml-auto" /></td>
                  </tr>
                ))
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="max-w-xs mx-auto text-center space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-xl text-slate-400">
                        📂
                      </div>
                      <p className="text-sm font-bold text-slate-900">No categories found</p>
                      <p className="text-xs text-slate-400">Try adjusting your search query or level filters.</p>
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
      {/* Create Category Modal */}
      {/* ----------------------------------------------------------------- */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Add New Category</h2>
                <p className="text-xs text-slate-500">Configure catalog hierarchy and taxonomy groupings</p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Category Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="e.g. Ultra-Fast DC Chargers"
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900 placeholder:text-slate-400 transition"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                    placeholder="High-output commercial fast chargers (150kW - 350kW)..."
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900 placeholder:text-slate-400 transition resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Icon / Emoji <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    required
                    placeholder="📂"
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Parent Category
                  </label>
                  <select
                    value={formData.parentId || ''}
                    onChange={(e) => setFormData({ ...formData, parentId: e.target.value || null })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-700 transition"
                  >
                    <option value="">None (Root Main Category)</option>
                    {categories
                      .filter((c) => (c.level ?? 0) === 0)
                      .map((cat) => (
                        <option key={cat.id || cat._id} value={cat.id || cat._id}>
                          {cat.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Display Sort Order
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value, 10) || 0 })}
                    min="0"
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900 transition"
                  />
                </div>
              </div>

              {/* SEO Meta Section */}
              <div className="border-t border-slate-100 pt-4">
                <p className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">SEO Configuration</p>
                <div className="space-y-3">
                  <div>
                    <input
                      type="text"
                      value={formData.metaTitle}
                      onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                      placeholder="Meta Title Tag"
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900 placeholder:text-slate-400 transition"
                    />
                  </div>
                  <div>
                    <textarea
                      value={formData.metaDescription}
                      onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                      rows={2}
                      placeholder="Meta Description Tag"
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900 placeholder:text-slate-400 transition resize-none"
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
                  className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900 border-slate-300"
                />
                <label htmlFor="create-category-active" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Set as Active Category
                </label>
              </div>

              <div className="flex gap-3 pt-5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-xs transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* Edit Category Modal */}
      {/* ----------------------------------------------------------------- */}
      {isEditModalOpen && selectedCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Edit Category</h2>
                <p className="text-xs text-slate-500">Update classification grouping and hierarchy placement</p>
              </div>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedCategory(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateCategory} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Category Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900 transition"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900 transition resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Icon / Emoji <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    required
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Parent Category
                  </label>
                  <select
                    value={formData.parentId || ''}
                    onChange={(e) => setFormData({ ...formData, parentId: e.target.value || null })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-700 transition"
                  >
                    <option value="">None (Root Main Category)</option>
                    {categories
                      .filter(
                        (c) =>
                          (c.level ?? 0) === 0 &&
                          (c.id || c._id) !== (selectedCategory.id || selectedCategory._id)
                      )
                      .map((cat) => (
                        <option key={cat.id || cat._id} value={cat.id || cat._id}>
                          {cat.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Display Sort Order
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value, 10) || 0 })}
                    min="0"
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900 transition"
                  />
                </div>
              </div>

              {/* SEO Meta Section */}
              <div className="border-t border-slate-100 pt-4">
                <p className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">SEO Configuration</p>
                <div className="space-y-3">
                  <div>
                    <input
                      type="text"
                      value={formData.metaTitle}
                      onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                      placeholder="Meta Title Tag"
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900 transition"
                    />
                  </div>
                  <div>
                    <textarea
                      value={formData.metaDescription}
                      onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                      rows={2}
                      placeholder="Meta Description Tag"
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900 transition resize-none"
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
                  className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900 border-slate-300"
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
                  className="flex-1 px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-xs transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* View Modal */}
      {/* ----------------------------------------------------------------- */}
      {isViewModalOpen && selectedCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 sm:p-7 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Category Overview</h2>
                <p className="text-xs text-slate-500 font-mono mt-0.5">ID: {selectedCategory.id || selectedCategory._id}</p>
              </div>
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  setSelectedCategory(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-3xl shrink-0">
                  {selectedCategory.icon || '📂'}
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-slate-900 truncate">{selectedCategory.name}</h3>
                  <p className="text-xs font-mono text-slate-500">Slug: /{selectedCategory.slug || 'n-a'}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Tier: {(selectedCategory.level ?? 0) === 0 ? 'Root Classification' : `Sub-Level ${selectedCategory.level}`}
                  </p>
                </div>
              </div>

              {selectedCategory.description && (
                <div className="p-3.5 bg-slate-50/80 border border-slate-200/60 rounded-2xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Description</span>
                  <p className="text-xs text-slate-700 mt-1 leading-relaxed">{selectedCategory.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Parent Group</span>
                  <span className="font-semibold text-slate-800 block mt-1 truncate">
                    {selectedCategory.parentId || selectedCategory.parent
                      ? categories.find(
                        (c) => (c.id || c._id) === (selectedCategory.parentId || selectedCategory.parent)
                      )?.name || 'Linked Subcategory'
                      : 'Root Main Category'}
                  </span>
                </div>

                <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Status</span>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border mt-1 ${selectedCategory.isActive
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${selectedCategory.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                    {selectedCategory.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Child Nodes</span>
                  <span className="font-semibold text-slate-900 font-mono text-sm block mt-1">
                    {selectedCategory.subcategoryCount || selectedCategory.subcategories?.length || 0} Subcategories
                  </span>
                </div>

                <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Linked Products</span>
                  <span className="font-semibold text-blue-700 font-mono text-sm block mt-1">
                    {selectedCategory.productCount || 0} Units
                  </span>
                </div>
              </div>

              {(selectedCategory.metaTitle || selectedCategory.metaDescription) && (
                <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/60 text-xs space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">SEO Tags</span>
                  {selectedCategory.metaTitle && (
                    <p className="text-slate-800 font-semibold truncate">Title: {selectedCategory.metaTitle}</p>
                  )}
                  {selectedCategory.metaDescription && (
                    <p className="text-slate-600 line-clamp-2">Desc: {selectedCategory.metaDescription}</p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 text-xs text-slate-500 pt-1">
                <div>Created: <span className="text-slate-800 font-medium">{formatDate(selectedCategory.createdAt)}</span></div>
                <div>Updated: <span className="text-slate-800 font-medium">{formatDate(selectedCategory.updatedAt)}</span></div>
              </div>
            </div>

            <div className="flex gap-3 pt-4 mt-6 border-t border-slate-100">
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  handleOpenEdit(selectedCategory);
                }}
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition"
              >
                Edit Category
              </button>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* Delete Confirmation Modal */}
      {/* ----------------------------------------------------------------- */}
      {isDeleteModalOpen && selectedCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl border border-slate-200 text-center">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100 flex items-center justify-center mx-auto mb-4 font-bold text-lg">
              ⚠️
            </div>
            <h3 className="text-lg font-bold text-slate-900">Delete Category</h3>
            <p className="text-xs text-slate-500 mt-2 mb-3 leading-relaxed">
              Are you sure you want to remove <span className="font-semibold text-slate-800">{selectedCategory.name}</span>?
            </p>

            {((selectedCategory.subcategoryCount ?? 0) > 0 || (selectedCategory.productCount ?? 0) > 0) && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-2xl text-[11px] font-semibold text-amber-800 text-left space-y-1">
                {(selectedCategory.subcategoryCount ?? 0) > 0 && (
                  <p>⚠️ Contains {selectedCategory.subcategoryCount} nested subcategories.</p>
                )}
                {(selectedCategory.productCount ?? 0) > 0 && (
                  <p>⚠️ Contains {selectedCategory.productCount} associated products.</p>
                )}
                <p className="text-[10px] text-amber-600 font-normal pt-1">
                  Reassign or delete these items before removing this category node.
                </p>
              </div>
            )}

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSelectedCategory(null);
                }}
                className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-sm font-semibold transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCategory}
                disabled={
                  isSubmitting ||
                  (selectedCategory.subcategoryCount ?? 0) > 0 ||
                  (selectedCategory.productCount ?? 0) > 0
                }
                className={`flex-1 px-4 py-2 rounded-xl text-sm font-semibold transition ${(selectedCategory.subcategoryCount ?? 0) > 0 || (selectedCategory.productCount ?? 0) > 0
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-rose-600 hover:bg-rose-700 text-white'
                  }`}
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