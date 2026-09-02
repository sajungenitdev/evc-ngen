// app/(admin)/brands/page.tsx
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import { AlertTriangle, Check, Edit, Eye, Plus, Power, PowerOff, RefreshCw, Search, Trash2, X } from 'lucide-react';

// -----------------------------------------------------------------------------
// 1. Data Contracts & Interfaces
// -----------------------------------------------------------------------------

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

export interface Brand {
  _id: string;
  id?: string;
  name: string;
  description?: string;
  icon?: string;
  logo?: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: Address;
  isActive: boolean;
  productCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface BrandFormData {
  name: string;
  description: string;
  icon: string;
  logo: string;
  website: string;
  email: string;
  phone: string;
  address: Address;
  isActive: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

const INITIAL_FORM: BrandFormData = {
  name: '',
  description: '',
  icon: '⚡',
  logo: '',
  website: '',
  email: '',
  phone: '',
  address: {
    street: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
  },
  isActive: true,
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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
      },
      danger: {
        bg: 'bg-rose-100',
        text: 'text-rose-600',
        button: 'bg-rose-600 hover:bg-rose-700',
      },
      info: {
        bg: 'bg-blue-100',
        text: 'text-blue-600',
        button: 'bg-blue-600 hover:bg-blue-700',
      },
    };

    const color = colors[type];

    toast.custom(
      (t) => (
        <div
          className={`${t.visible ? 'animate-enter' : 'animate-leave'
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

export default function BrandsPage() {
  const { token } = useAuth();

  // Data State
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Filter & Search State
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);

  // Active Selection & Form
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [formData, setFormData] = useState<BrandFormData>(INITIAL_FORM);

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
  // Fetch Brands
  // ---------------------------------------------------------------------------

  const fetchBrands = useCallback(
    async (quiet = false) => {
      if (!token) return;
      const toastId = !quiet ? toast.loading('Syncing brand registry...') : undefined;
      setIsLoading(true);
      try {
        const response = await apiCall<Brand[]>('/brands');
        if (response.success && Array.isArray(response.data)) {
          setBrands(response.data);
          if (toastId) toast.success(`Synced ${response.data.length} brands`, { id: toastId });
        } else {
          if (toastId) toast.error(response.message || 'Failed to load brands', { id: toastId });
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
    fetchBrands(true);
  }, [fetchBrands]);

  // Computed Dashboard Metrics
  const stats = useMemo(() => {
    const total = brands.length;
    const active = brands.filter((b) => b.isActive).length;
    const totalProducts = brands.reduce((sum, b) => sum + (b.productCount || 0), 0);
    const activeRate = total > 0 ? Math.round((active / total) * 100) : 0;
    return { total, active, totalProducts, activeRate };
  }, [brands]);

  // Search & Filter Algorithm
  const filteredBrands = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();
    return brands.filter((brand) => {
      const matchesSearch =
        !query ||
        brand.name.toLowerCase().includes(query) ||
        brand.description?.toLowerCase().includes(query) ||
        brand.id?.toLowerCase().includes(query) ||
        brand.email?.toLowerCase().includes(query);

      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'active' && brand.isActive) ||
        (filterStatus === 'inactive' && !brand.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [brands, searchTerm, filterStatus]);

  // ---------------------------------------------------------------------------
  // CRUD Handlers
  // ---------------------------------------------------------------------------

  const handleCreateBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setIsSubmitting(true);
    const toastId = toast.loading('Registering brand...');

    try {
      const response = await apiCall<Brand>('/brands', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      if (response.success && response.data) {
        setBrands((prev) => [response.data!, ...prev]);
        setIsCreateModalOpen(false);
        setFormData(INITIAL_FORM);
        toast.success(`Brand "${formData.name}" added successfully!`, { id: toastId });
        await fetchBrands(true);
      } else {
        toast.error(response.message || 'Creation rejected', { id: toastId });
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to create brand';
      toast.error(message, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (brand: Brand) => {
    setSelectedBrand(brand);
    setFormData({
      name: brand.name,
      description: brand.description || '',
      icon: brand.icon || '⚡',
      logo: brand.logo || '',
      website: brand.website || '',
      email: brand.email || '',
      phone: brand.phone || '',
      address: brand.address || { street: '', city: '', state: '', country: '', zipCode: '' },
      isActive: brand.isActive,
    });
    setIsEditModalOpen(true);
  };

  const handleOpenView = (brand: Brand) => {
    setSelectedBrand(brand);
    setIsViewModalOpen(true);
  };

  const handleUpdateBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedBrand) return;
    setIsSubmitting(true);
    const toastId = toast.loading('Updating brand...');

    try {
      const brandId = selectedBrand.id || selectedBrand._id;
      const response = await apiCall<Brand>(`/brands/${brandId}`, {
        method: 'PUT',
        body: JSON.stringify(formData),
      });

      if (response.success && response.data) {
        const updated = response.data;
        setBrands((prev) =>
          prev.map((b) =>
            b._id === selectedBrand._id || (b.id && b.id === selectedBrand.id) ? updated : b
          )
        );
        setIsEditModalOpen(false);
        setSelectedBrand(null);
        setFormData(INITIAL_FORM);
        toast.success('Brand updated successfully!', { id: toastId });
        await fetchBrands(true);
      } else {
        toast.error(response.message || 'Update failed', { id: toastId });
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update brand';
      toast.error(message, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBrand = async () => {
    if (!token || !selectedBrand) return;
    setIsSubmitting(true);
    const toastId = toast.loading(`Deleting ${selectedBrand.name}...`);
    const previous = [...brands];

    // Optimistic local removal
    setBrands((prev) =>
      prev.filter((b) => b._id !== selectedBrand._id && b.id !== selectedBrand.id)
    );
    setIsDeleteModalOpen(false);

    try {
      const brandId = selectedBrand.id || selectedBrand._id;
      const response = await apiCall(`/brands/${brandId}`, {
        method: 'DELETE',
      });

      if (response.success) {
        setSelectedBrand(null);
        toast.success('Brand removed from registry', { id: toastId });
        await fetchBrands(true);
      } else {
        setBrands(previous);
        toast.error(response.message || 'Delete operation failed', { id: toastId });
      }
    } catch (error: unknown) {
      setBrands(previous);
      const message = error instanceof Error ? error.message : 'Failed to delete brand';
      toast.error(message, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (brand: Brand) => {
    if (!token) return;
    const targetStatus = !brand.isActive;

    // Show custom confirmation if deactivating
    if (!targetStatus) {
      const confirmDeactivate = await showConfirmation({
        title: 'Deactivate Brand?',
        message: `You are about to deactivate "${brand.name}".`,
        subMessage: brand.productCount && brand.productCount > 0
          ? `This brand has ${brand.productCount} associated products.`
          : undefined,
        warning: '⚠️ This will remove the brand from active listings.',
        confirmLabel: 'Deactivate',
        cancelLabel: 'Cancel',
        type: 'warning',
      });

      if (!confirmDeactivate) return;
    }

    // Optimistic update
    setBrands((prev) =>
      prev.map((b) =>
        b._id === brand._id || (b.id && b.id === brand.id)
          ? { ...b, isActive: targetStatus }
          : b
      )
    );

    try {
      const brandId = brand.id || brand._id;
      const response = await apiCall(`/brands/${brandId}/toggle`, {
        method: 'PUT',
      });

      if (response.success) {
        toast.success(`Brand ${targetStatus ? 'activated' : 'deactivated'} successfully`);
        await fetchBrands(true);
      } else {
        await fetchBrands(true);
        toast.error(response.message || 'Failed to update status');
      }
    } catch {
      await fetchBrands(true);
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8 space-y-6 container mx-auto">
      {/* ----------------------------------------------------------------- */}
      {/* Page Header */}
      {/* ----------------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Brand Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure manufacturing partners, terminal branding, and product line associations.
          </p>
        </div>
        <button
          onClick={() => {
            setFormData(INITIAL_FORM);
            setIsCreateModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition shadow-xs hover:shadow"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Brand</span>
        </button>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* KPI Overview Metrics */}
      {/* ----------------------------------------------------------------- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Brands</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 text-lg font-semibold">
            🏷️
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
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Linked Products</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{stats.totalProducts}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            📦
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Operational Ratio</p>
            <p className="text-2xl font-bold text-indigo-600 mt-1">{stats.activeRate}%</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            %
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Filter Toolbar */}
      {/* ----------------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search by brand name, ID, email, or description..."
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
            onClick={() => fetchBrands(false)}
            className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 transition"
            title="Refresh brand list"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Brands Table */}
      {/* ----------------------------------------------------------------- */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4">Brand Profile</th>
                <th className="px-6 py-4">System ID</th>
                <th className="px-6 py-4">Products</th>
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
                        <div className="w-10 h-10 rounded-xl bg-slate-200" />
                        <div className="space-y-1.5">
                          <div className="w-32 h-3.5 bg-slate-200 rounded" />
                          <div className="w-48 h-2.5 bg-slate-100 rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><div className="w-16 h-4 bg-slate-100 rounded" /></td>
                    <td className="px-6 py-4"><div className="w-10 h-5 bg-slate-100 rounded-full" /></td>
                    <td className="px-6 py-4"><div className="w-16 h-5 bg-slate-100 rounded-full" /></td>
                    <td className="px-6 py-4"><div className="w-24 h-3 bg-slate-100 rounded" /></td>
                    <td className="px-6 py-4"><div className="w-20 h-6 bg-slate-100 rounded ml-auto" /></td>
                  </tr>
                ))
              ) : filteredBrands.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="max-w-xs mx-auto text-center space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-xl text-slate-400">
                        🏷️
                      </div>
                      <p className="text-sm font-bold text-slate-900">No brands found</p>
                      <p className="text-xs text-slate-400">No registered partner matches your search or active filter settings.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBrands.map((brand) => (
                  <tr key={brand._id || brand.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Brand Profile */}
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/90 flex items-center justify-center text-xl shrink-0">
                          {brand.icon || '🏷️'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 truncate">{brand.name}</p>
                          <p className="text-xs text-slate-500 truncate max-w-[240px]">
                            {brand.description || 'No operational description'}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* ID */}
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <span className="text-xs font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                        {brand.id || brand._id}
                      </span>
                    </td>

                    {/* Product Count */}
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200/60 font-mono">
                        {brand.productCount || 0}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${brand.isActive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                          }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${brand.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        {brand.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-3.5 text-xs text-slate-500 whitespace-nowrap">
                      {formatDate(brand.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-3.5 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenView(brand)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleOpenEdit(brand)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
                          title="Edit Brand"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleToggleStatus(brand)}
                          className={`p-1.5 rounded-lg transition ${brand.isActive
                              ? 'text-emerald-600 hover:text-amber-600 hover:bg-amber-50'
                              : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                            }`}
                          title={brand.isActive ? 'Deactivate Brand' : 'Activate Brand'}
                        >
                          {brand.isActive ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                        </button>

                        <button
                          onClick={() => {
                            setSelectedBrand(brand);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Delete Brand"
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

      {/* ----------------------------------------------------------------- */}
      {/* Create Brand Modal */}
      {/* ----------------------------------------------------------------- */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Add New Brand</h2>
                <p className="text-xs text-slate-500">Register a hardware manufacturer or terminal partner</p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBrand} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Brand Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="e.g. ABB, ChargePoint, Schneider"
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
                    placeholder="Brief description of product line or hardware infrastructure..."
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
                    placeholder="⚡"
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Logo Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.logo}
                    onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                    placeholder="https://cdn.example.com/logo.png"
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900 placeholder:text-slate-400 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Website URL
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://manufacturer.com"
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900 placeholder:text-slate-400 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Support Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="support@manufacturer.com"
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900 placeholder:text-slate-400 transition"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (800) 555-0199"
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900 placeholder:text-slate-400 transition"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="border-t border-slate-100 pt-4">
                <p className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">
                  Headquarters Location
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-3">
                    <input
                      type="text"
                      value={formData.address.street}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: { ...formData.address, street: e.target.value },
                        })
                      }
                      placeholder="Street Address"
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900 placeholder:text-slate-400 transition"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={formData.address.city}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: { ...formData.address, city: e.target.value },
                        })
                      }
                      placeholder="City"
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900 placeholder:text-slate-400 transition"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={formData.address.state}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: { ...formData.address, state: e.target.value },
                        })
                      }
                      placeholder="State / Region"
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900 placeholder:text-slate-400 transition"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={formData.address.country}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: { ...formData.address, country: e.target.value },
                        })
                      }
                      placeholder="Country"
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900 placeholder:text-slate-400 transition"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="create-brand-active"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900 border-slate-300"
                />
                <label htmlFor="create-brand-active" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Brand is Active
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
                  {isSubmitting ? 'Registering...' : 'Register Brand'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* Edit Brand Modal */}
      {/* ----------------------------------------------------------------- */}
      {isEditModalOpen && selectedBrand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Edit Brand Profile</h2>
                <p className="text-xs text-slate-500">Update company credentials and service metadata</p>
              </div>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedBrand(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateBrand} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Brand Name <span className="text-rose-500">*</span>
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
                    Logo URL
                  </label>
                  <input
                    type="url"
                    value={formData.logo}
                    onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Website URL
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900 transition"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900 transition"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="border-t border-slate-100 pt-4">
                <p className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">
                  Address Location
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-3">
                    <input
                      type="text"
                      value={formData.address.street}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: { ...formData.address, street: e.target.value },
                        })
                      }
                      placeholder="Street"
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900 transition"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={formData.address.city}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: { ...formData.address, city: e.target.value },
                        })
                      }
                      placeholder="City"
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900 transition"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={formData.address.state}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: { ...formData.address, state: e.target.value },
                        })
                      }
                      placeholder="State"
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900 transition"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={formData.address.country}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: { ...formData.address, country: e.target.value },
                        })
                      }
                      placeholder="Country"
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900 transition"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="edit-brand-active"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900 border-slate-300"
                />
                <label htmlFor="edit-brand-active" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Brand is Active
                </label>
              </div>

              <div className="flex gap-3 pt-5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setSelectedBrand(null);
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
      {/* View Brand Modal */}
      {/* ----------------------------------------------------------------- */}
      {isViewModalOpen && selectedBrand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 sm:p-7 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Brand Details</h2>
                <p className="text-xs text-slate-500 font-mono mt-0.5">ID: {selectedBrand.id || selectedBrand._id}</p>
              </div>
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  setSelectedBrand(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-3xl shrink-0">
                  {selectedBrand.icon || '🏷️'}
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-slate-900 truncate">{selectedBrand.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${selectedBrand.isActive
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${selectedBrand.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                      {selectedBrand.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 font-mono">
                      {selectedBrand.productCount || 0} Products
                    </span>
                  </div>
                </div>
              </div>

              {selectedBrand.description && (
                <div className="p-3.5 bg-slate-50/80 border border-slate-200/60 rounded-2xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Overview</span>
                  <p className="text-xs text-slate-700 mt-1 leading-relaxed">{selectedBrand.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Website</span>
                  {selectedBrand.website ? (
                    <a
                      href={selectedBrand.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 font-semibold hover:underline block truncate mt-1"
                    >
                      {selectedBrand.website}
                    </a>
                  ) : (
                    <span className="text-slate-400 mt-1 block">—</span>
                  )}
                </div>

                <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Support Email</span>
                  {selectedBrand.email ? (
                    <a href={`mailto:${selectedBrand.email}`} className="text-blue-600 font-semibold hover:underline block truncate mt-1">
                      {selectedBrand.email}
                    </a>
                  ) : (
                    <span className="text-slate-400 mt-1 block">—</span>
                  )}
                </div>

                <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Contact Phone</span>
                  <span className="text-slate-700 font-semibold block mt-1">{selectedBrand.phone || '—'}</span>
                </div>

                <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Created</span>
                  <span className="text-slate-700 font-semibold block mt-1">{formatDate(selectedBrand.createdAt)}</span>
                </div>
              </div>

              {selectedBrand.address && (selectedBrand.address.street || selectedBrand.address.city) && (
                <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/60 text-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Location</span>
                  <p className="text-slate-700 mt-1">
                    {[
                      selectedBrand.address.street,
                      selectedBrand.address.city,
                      selectedBrand.address.state,
                      selectedBrand.address.country,
                      selectedBrand.address.zipCode,
                    ]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4 mt-6 border-t border-slate-100">
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  handleOpenEdit(selectedBrand);
                }}
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition"
              >
                Edit Brand
              </button>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* Delete Confirmation Modal */}
      {/* ----------------------------------------------------------------- */}
      {isDeleteModalOpen && selectedBrand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl border border-slate-200 text-center">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100 flex items-center justify-center mx-auto mb-4 font-bold text-lg">
              ⚠️
            </div>
            <h3 className="text-lg font-bold text-slate-900">Delete Brand Record</h3>
            <p className="text-xs text-slate-500 mt-2 mb-2 leading-relaxed">
              Are you sure you want to remove <span className="font-semibold text-slate-800">{selectedBrand.name}</span>?
            </p>
            {selectedBrand.productCount && selectedBrand.productCount > 0 ? (
              <div className="mb-4 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] font-semibold text-amber-800">
                ⚠️ This brand currently links to {selectedBrand.productCount} active products.
              </div>
            ) : null}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSelectedBrand(null);
                }}
                className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-sm font-semibold transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteBrand}
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