// app/(admin)/brands/page.tsx
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

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
    id: string;
    name: string;
    description: string;
    icon: string;
    logo: string;
    website: string;
    email: string;
    phone: string;
    address: Address;
    isActive: boolean;
    productCount: number;
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
// 2. Main Component
// -----------------------------------------------------------------------------

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
    // Fetch Brands
    // -------------------------------------------------------------------------

    const fetchBrands = useCallback(async (quiet = false) => {
        if (!token) return;
        const toastId = !quiet ? toast.loading('Syncing brand registry...') : undefined;
        try {
            const response = await apiCall('/brands');
            if (response.success) {
                setBrands(response.data);
                if (toastId) toast.success(`Synced ${response.data.length} brands`, { id: toastId });
            } else {
                if (toastId) toast.error(response.message || 'Failed to load brands', { id: toastId });
            }
        } catch (error: any) {
            console.error('Error fetching brands:', error);
            if (toastId) toast.error(error.message || 'Network connection failed', { id: toastId });
        } finally {
            setIsLoading(false);
        }
    }, [token, apiCall]);

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

    // -------------------------------------------------------------------------
    // CRUD Handlers
    // -------------------------------------------------------------------------

    // Create Brand
    const handleCreateBrand = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;
        setIsSubmitting(true);
        const toastId = toast.loading('Registering brand...');

        try {
            const response = await apiCall('/brands', {
                method: 'POST',
                body: JSON.stringify(formData),
            });

            if (response.success) {
                await fetchBrands(true);
                setIsCreateModalOpen(false);
                setFormData(INITIAL_FORM);
                toast.success(`Brand "${formData.name}" added successfully!`, { id: toastId });
            } else {
                toast.error(response.message || 'Creation rejected', { id: toastId });
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to create brand', { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Open Edit Modal
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

    // Update Brand
    const handleUpdateBrand = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token || !selectedBrand) return;
        setIsSubmitting(true);
        const toastId = toast.loading('Updating brand...');

        try {
            const response = await apiCall(`/brands/${selectedBrand.id || selectedBrand._id}`, {
                method: 'PUT',
                body: JSON.stringify(formData),
            });

            if (response.success) {
                await fetchBrands(true);
                setIsEditModalOpen(false);
                setSelectedBrand(null);
                setFormData(INITIAL_FORM);
                toast.success('Brand updated successfully!', { id: toastId });
            } else {
                toast.error(response.message || 'Update failed', { id: toastId });
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to update brand', { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Delete Brand (Optimistic with rollback)
    const handleDeleteBrand = async () => {
        if (!token || !selectedBrand) return;
        setIsSubmitting(true);
        const toastId = toast.loading(`Deleting ${selectedBrand.name}...`);
        const previous = [...brands];

        setBrands((prev) => prev.filter((b) => b._id !== selectedBrand._id));

        try {
            const response = await apiCall(`/brands/${selectedBrand.id || selectedBrand._id}`, {
                method: 'DELETE',
            });

            if (response.success) {
                setIsDeleteModalOpen(false);
                setSelectedBrand(null);
                toast.success('Brand removed from registry', { id: toastId });
            } else {
                setBrands(previous);
                toast.error(response.message || 'Delete operation failed', { id: toastId });
            }
        } catch (error: any) {
            setBrands(previous);
            toast.error(error.message || 'Failed to delete brand', { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Toggle Status (Optimistic)
    const handleToggleStatus = async (brand: Brand) => {
        if (!token) return;
        const targetStatus = !brand.isActive;

        setBrands((prev) =>
            prev.map((b) => (b._id === brand._id ? { ...b, isActive: targetStatus } : b))
        );

        try {
            const response = await apiCall(`/brands/${brand.id || brand._id}/toggle`, {
                method: 'PUT',
            });

            if (response.success) {
                toast.success(`${brand.name} is now ${targetStatus ? 'Active' : 'Deactivated'}`);
            } else {
                fetchBrands(true);
                toast.error(response.message || 'Failed to update status');
            }
        } catch (error: any) {
            fetchBrands(true);
            toast.error(error.message || 'Failed to update status');
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        } catch {
            return 'Invalid date';
        }
    };

    return (
        <div className="space-y-6 container mx-auto pb-12">
            {/* ----------------------------------------------------------------- */}
            {/* Header & Primary Action Button                                    */}
            {/* ----------------------------------------------------------------- */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0B192C]">
                        Brand Management
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        Configure manufacturing partners, terminal branding, and product line associations.
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
                    <span>Add New Brand</span>
                </button>
            </div>

            {/* ----------------------------------------------------------------- */}
            {/* KPI Metric Overview Cards                                         */}
            {/* ----------------------------------------------------------------- */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-colors">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Brands</span>
                    <p className="text-2xl sm:text-3xl font-bold text-[#0B192C] font-mono mt-1.5">{stats.total}</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-colors">
                    <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Active Status</span>
                    <p className="text-2xl sm:text-3xl font-bold text-[#0B192C] font-mono mt-1.5">{stats.active}</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-colors">
                    <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Linked Products</span>
                    <p className="text-2xl sm:text-3xl font-bold text-[#0B192C] font-mono mt-1.5">{stats.totalProducts}</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-colors">
                    <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">Operational Ratio</span>
                    <p className="text-2xl sm:text-3xl font-bold text-[#0B192C] font-mono mt-1.5">{stats.activeRate}%</p>
                </div>
            </div>

            {/* ----------------------------------------------------------------- */}
            {/* Filter Toolbar                                                    */}
            {/* ----------------------------------------------------------------- */}
            <div className="flex flex-col sm:flex-row gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                {/* Search */}
                <div className="relative flex-1">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </span>
                    <input
                        type="text"
                        placeholder="Search by brand name, ID, email, or description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/10 focus:border-[#0B192C] text-slate-800 transition-all placeholder:text-slate-400"
                    />
                </div>

                {/* Filter Dropdown & Refresh */}
                <div className="flex items-center gap-2">
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
                        onClick={() => fetchBrands(false)}
                        aria-label="Refresh brand list"
                        className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 hover:text-[#0B192C] transition-colors focus:outline-none"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.03 8.03 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* ----------------------------------------------------------------- */}
            {/* Main Brand Table                                                  */}
            {/* ----------------------------------------------------------------- */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                <th className="px-6 py-4">Brand Profile</th>
                                <th className="px-6 py-4">System ID</th>
                                <th className="px-6 py-4">Products</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Registered Date</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-slate-200" />
                                                <div className="space-y-1.5">
                                                    <div className="w-28 h-3.5 bg-slate-200 rounded" />
                                                    <div className="w-36 h-2.5 bg-slate-100 rounded" />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4"><div className="w-16 h-3.5 bg-slate-200 rounded" /></td>
                                        <td className="px-6 py-4"><div className="w-8 h-5 bg-slate-200 rounded-full" /></td>
                                        <td className="px-6 py-4"><div className="w-16 h-5 bg-slate-200 rounded-full" /></td>
                                        <td className="px-6 py-4"><div className="w-20 h-3.5 bg-slate-200 rounded" /></td>
                                        <td className="px-6 py-4"><div className="w-20 h-6 bg-slate-200 rounded ml-auto" /></td>
                                    </tr>
                                ))
                            ) : filteredBrands.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center">
                                        <div className="max-w-xs mx-auto text-center space-y-2">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-400 text-xl">
                                                🏷️
                                            </div>
                                            <p className="text-sm font-bold text-[#0B192C]">No brands found</p>
                                            <p className="text-xs text-slate-400">No registered partner matches your search or active filter settings.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredBrands.map((brand) => (
                                    <tr key={brand._id} className="hover:bg-slate-50/80 transition-colors">
                                        {/* Profile */}
                                        <td className="px-6 py-3.5">
                                            <div className="flex items-center gap-3.5">
                                                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/90 flex items-center justify-center text-xl shrink-0 shadow-2xs">
                                                    {brand.icon || '🏷️'}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-[#0B192C] truncate">{brand.name}</p>
                                                    <p className="text-xs text-slate-500 truncate max-w-[220px]">
                                                        {brand.description || 'No operational description'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* ID */}
                                        <td className="px-6 py-3.5 font-mono text-xs text-slate-500">
                                            {brand.id || 'N/A'}
                                        </td>

                                        {/* Product Count */}
                                        <td className="px-6 py-3.5">
                                            <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200/60 font-mono">
                                                {brand.productCount || 0}
                                            </span>
                                        </td>

                                        {/* Status */}
                                        <td className="px-6 py-3.5">
                                            <span
                                                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${brand.isActive
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                                                        : 'bg-rose-50 text-rose-700 border-rose-200/80'
                                                    }`}
                                            >
                                                <span
                                                    className={`w-1.5 h-1.5 rounded-full ${brand.isActive ? 'bg-emerald-500' : 'bg-rose-500'
                                                        }`}
                                                />
                                                {brand.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>

                                        {/* Date */}
                                        <td className="px-6 py-3.5 text-xs text-slate-500 whitespace-nowrap">
                                            {formatDate(brand.createdAt)}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-3.5 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                {/* View */}
                                                <button
                                                    onClick={() => {
                                                        setSelectedBrand(brand);
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

                                                {/* Edit */}
                                                <button
                                                    onClick={() => handleOpenEdit(brand)}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                                    title="Edit Brand"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                                    </svg>
                                                </button>

                                                {/* Toggle Status */}
                                                <button
                                                    onClick={() => handleToggleStatus(brand)}
                                                    className={`p-1.5 rounded-lg transition-colors ${brand.isActive
                                                            ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                                                            : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                                                        }`}
                                                    title={brand.isActive ? 'Deactivate Brand' : 'Activate Brand'}
                                                >
                                                    {brand.isActive ? (
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                    )}
                                                </button>

                                                {/* Delete */}
                                                <button
                                                    onClick={() => {
                                                        setSelectedBrand(brand);
                                                        setIsDeleteModalOpen(true);
                                                    }}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                                    title="Delete Brand"
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

            {/* ----------------------------------------------------------------- */}
            {/* Create Brand Modal                                                */}
            {/* ----------------------------------------------------------------- */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B192C]/40 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-200">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                            <div>
                                <h2 className="text-lg font-bold text-[#0B192C]">Add New Brand</h2>
                                <p className="text-xs text-slate-500">Register a hardware manufacturer or terminal partner</p>
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

                        <form onSubmit={handleCreateBrand} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Brand Name <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        placeholder="e.g., Tesla, ABB, ChargePoint"
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
                                        placeholder="High-capacity DC fast charging systems and commercial infrastructure"
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
                                        placeholder="⚡"
                                        className="w-full px-3.5 py-2 text-black text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Logo Image URL
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.logo}
                                        onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                                        placeholder="https://cdn.domain.com/logo.png"
                                        className="w-full px-3.5 py-2 text-black text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Website URL
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.website}
                                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                        placeholder="https://manufacturer.com"
                                        className="w-full px-3.5 py-2 text-black text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Support Email
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="hardware@manufacturer.com"
                                        className="w-full px-3.5 py-2 text-black text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Contact Phone
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="+1 (800) 555-0199"
                                        className="w-full px-3.5 py-2 text-black text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all"
                                    />
                                </div>
                            </div>

                            {/* Address Section */}
                            <div className="border-t border-slate-100 pt-4">
                                <h3 className="text-xs font-bold text-[#0B192C] uppercase tracking-wider mb-3">
                                    Headquarters Location
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div className="md:col-span-3">
                                        <input
                                            type="text"
                                            value={formData.address.street}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                address: { ...formData.address, street: e.target.value },
                                            })}
                                            placeholder="Street Address (e.g., 3500 Deer Creek Rd)"
                                            className="w-full px-3.5 py-2 text-black text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all"
                                        />
                                    </div>
                                    <div>
                                        <input
                                            type="text"
                                            value={formData.address.city}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                address: { ...formData.address, city: e.target.value },
                                            })}
                                            placeholder="City"
                                            className="w-full px-3.5 py-2 text-black text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all"
                                        />
                                    </div>
                                    <div>
                                        <input
                                            type="text"
                                            value={formData.address.state}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                address: { ...formData.address, state: e.target.value },
                                            })}
                                            placeholder="State / Region"
                                            className="w-full px-3.5 py-2 text-black text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all"
                                        />
                                    </div>
                                    <div>
                                        <input
                                            type="text"
                                            value={formData.address.country}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                address: { ...formData.address, country: e.target.value },
                                            })}
                                            placeholder="Country"
                                            className="w-full px-3.5 py-2 text-black text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Active Toggle */}
                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="brand-active"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="w-4 h-4 rounded-md border-slate-300 text-[#0B192C] focus:ring-[#0B192C]"
                                />
                                <label htmlFor="brand-active" className="text-xs font-semibold text-slate-700 cursor-pointer">
                                    Set as Active Brand in Hardware Catalog
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
                                    {isSubmitting ? 'Creating...' : 'Register Brand'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ----------------------------------------------------------------- */}
            {/* Edit Brand Modal                                                  */}
            {/* ----------------------------------------------------------------- */}
            {isEditModalOpen && selectedBrand && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B192C]/40 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-200">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                            <div>
                                <h2 className="text-lg font-bold text-[#0B192C]">Edit Brand Profile</h2>
                                <p className="text-xs text-slate-500">Update company credentials and service metadata</p>
                            </div>
                            <button
                                onClick={() => {
                                    setIsEditModalOpen(false);
                                    setSelectedBrand(null);
                                }}
                                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleUpdateBrand} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Brand Name <span className="text-rose-500">*</span>
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
                                        Logo URL
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.logo}
                                        onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                                        className="w-full px-3.5 py-2 text-black text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Website URL
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.website}
                                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                        className="w-full px-3.5 py-2 text-black text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-3.5 py-2 text-black text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Phone
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-3.5 py-2 text-black text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all"
                                    />
                                </div>
                            </div>

                            {/* Address Section */}
                            <div className="border-t border-slate-100 pt-4">
                                <h3 className="text-xs font-bold text-[#0B192C] uppercase tracking-wider mb-3">
                                    Address Location
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div className="md:col-span-3">
                                        <input
                                            type="text"
                                            value={formData.address.street}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                address: { ...formData.address, street: e.target.value },
                                            })}
                                            placeholder="Street"
                                            className="w-full px-3.5 py-2 text-black text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all"
                                        />
                                    </div>
                                    <div>
                                        <input
                                            type="text"
                                            value={formData.address.city}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                address: { ...formData.address, city: e.target.value },
                                            })}
                                            placeholder="City"
                                            className="w-full px-3.5 py-2 text-black text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all"
                                        />
                                    </div>
                                    <div>
                                        <input
                                            type="text"
                                            value={formData.address.state}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                address: { ...formData.address, state: e.target.value },
                                            })}
                                            placeholder="State"
                                            className="w-full px-3.5 py-2 text-black text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all"
                                        />
                                    </div>
                                    <div>
                                        <input
                                            type="text"
                                            value={formData.address.country}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                address: { ...formData.address, country: e.target.value },
                                            })}
                                            placeholder="Country"
                                            className="w-full px-3.5 py-2 text-black text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="brand-edit-active"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="w-4 h-4 rounded-md border-slate-300 text-[#0B192C] focus:ring-[#0B192C]"
                                />
                                <label htmlFor="brand-edit-active" className="text-xs font-semibold text-slate-700 cursor-pointer">
                                    Brand Active
                                </label>
                            </div>

                            <div className="flex gap-3 pt-5 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditModalOpen(false);
                                        setSelectedBrand(null);
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
            {isViewModalOpen && selectedBrand && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B192C]/40 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="bg-white rounded-3xl w-full max-w-lg p-6 sm:p-7 shadow-2xl border border-slate-200">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                            <div>
                                <h2 className="text-lg font-bold text-[#0B192C]">Partner Overview</h2>
                                <p className="text-xs text-slate-500">Live operational specs and telemetry connections</p>
                            </div>
                            <button
                                onClick={() => {
                                    setIsViewModalOpen(false);
                                    setSelectedBrand(null);
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
                                    {selectedBrand.icon || '🏷️'}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-lg font-bold text-[#0B192C]">{selectedBrand.name}</h3>
                                    <p className="text-xs font-mono text-slate-500">ID: {selectedBrand.id || 'N/A'}</p>
                                </div>
                            </div>

                            {selectedBrand.description && (
                                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Overview</span>
                                    <p className="text-xs text-slate-700 mt-1 leading-relaxed">{selectedBrand.description}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-3 text-xs">
                                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Website</span>
                                    {selectedBrand.website ? (
                                        <a href={selectedBrand.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-semibold hover:underline block truncate mt-1">
                                            {selectedBrand.website}
                                        </a>
                                    ) : (
                                        <span className="text-slate-400 mt-1 block">Not Provided</span>
                                    )}
                                </div>

                                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Support Email</span>
                                    {selectedBrand.email ? (
                                        <a href={`mailto:${selectedBrand.email}`} className="text-blue-600 font-semibold hover:underline block truncate mt-1">
                                            {selectedBrand.email}
                                        </a>
                                    ) : (
                                        <span className="text-slate-400 mt-1 block">Not Provided</span>
                                    )}
                                </div>

                                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Connected Hardware</span>
                                    <span className="font-bold text-[#0B192C] font-mono text-sm block mt-1">
                                        {selectedBrand.productCount || 0} Products
                                    </span>
                                </div>

                                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Registry Status</span>
                                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold border mt-1 ${selectedBrand.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                                        }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${selectedBrand.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                        {selectedBrand.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>

                            {selectedBrand.address && (selectedBrand.address.street || selectedBrand.address.city) && (
                                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 text-xs">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Location</span>
                                    <p className="text-slate-700 mt-1">
                                        {[
                                            selectedBrand.address.street,
                                            selectedBrand.address.city,
                                            selectedBrand.address.state,
                                            selectedBrand.address.country,
                                        ].filter(Boolean).join(', ')}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 pt-4 mt-5 border-t border-slate-100">
                            <button
                                onClick={() => {
                                    setIsViewModalOpen(false);
                                    handleOpenEdit(selectedBrand);
                                }}
                                className="flex-1 bg-[#0B192C] hover:bg-[#1E3E62] text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors"
                            >
                                Edit Record
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
            {isDeleteModalOpen && selectedBrand && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B192C]/40 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-slate-200 text-center">
                        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100 flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-[#0B192C]">Delete Brand Record</h3>
                        <p className="text-xs text-slate-500 mt-2 mb-2 leading-relaxed">
                            Are you sure you want to remove <span className="font-bold text-slate-800">{selectedBrand.name}</span>?
                        </p>
                        {selectedBrand.productCount > 0 && (
                            <div className="mb-4 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] font-semibold text-amber-800">
                                ⚠️ This brand currently links to {selectedBrand.productCount} active hardware products.
                            </div>
                        )}
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={() => {
                                    setIsDeleteModalOpen(false);
                                    setSelectedBrand(null);
                                }}
                                className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteBrand}
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