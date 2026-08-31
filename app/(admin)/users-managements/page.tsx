// app/(admin)/users-management/page.tsx
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

// -----------------------------------------------------------------------------
// 1. Types & Contracts
// -----------------------------------------------------------------------------

export type UserRole = 'admin' | 'manager' | 'technician' | 'user';

export interface User {
    _id: string;
    name: string;
    email: string;
    role: UserRole;
    phone?: string;
    company?: string;
    jobTitle?: string;
    isActive: boolean;
    isVerified?: boolean;
    loginCount?: number;
    lastLogin?: string;
    createdAt: string;
    updatedAt?: string;
}

export interface UserFormInputs {
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    phone: string;
    company: string;
    jobTitle: string;
    isActive: boolean;
}

const INITIAL_FORM: UserFormInputs = {
    name: '',
    email: '',
    password: '',
    role: 'user',
    phone: '',
    company: '',
    jobTitle: '',
    isActive: true,
};

// -----------------------------------------------------------------------------
// 2. Constants & Helpers
// -----------------------------------------------------------------------------

const ROLE_CONFIG: Record<UserRole, { label: string; badge: string; dot: string }> = {
    admin: {
        label: 'Admin',
        badge: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
        dot: 'bg-indigo-500',
    },
    manager: {
        label: 'Manager',
        badge: 'bg-sky-50 text-sky-700 border-sky-200/80',
        dot: 'bg-sky-500',
    },
    technician: {
        label: 'Technician',
        badge: 'bg-amber-50 text-amber-700 border-amber-200/80',
        dot: 'bg-amber-500',
    },
    user: {
        label: 'User',
        badge: 'bg-slate-50 text-slate-700 border-slate-200',
        dot: 'bg-slate-400',
    },
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

function getAvatarColor(name: string): string {
    const colors = [
        'bg-blue-50 text-blue-700 border-blue-200',
        'bg-purple-50 text-purple-700 border-purple-200',
        'bg-emerald-50 text-emerald-700 border-emerald-200',
        'bg-amber-50 text-amber-700 border-amber-200',
        'bg-rose-50 text-rose-700 border-rose-200',
        'bg-indigo-50 text-indigo-700 border-indigo-200',
    ];
    const charCode = name.charCodeAt(0) || 0;
    return colors[charCode % colors.length];
}

function getApiMessage(response: unknown, fallback: string): string {
    if (typeof response === 'object' && response !== null && 'message' in response) {
        const message = response.message;
        if (typeof message === 'string' && message.trim().length > 0) {
            return message;
        }
    }
    return fallback;
}

// -----------------------------------------------------------------------------
// 3. Main Component
// -----------------------------------------------------------------------------

export default function UsersManagementPage() {
    const { token } = useAuth();

    // Data State
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    // Filtering & Search
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [filterRole, setFilterRole] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    // Modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);

    // Form & Selection
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [formData, setFormData] = useState<UserFormInputs>(INITIAL_FORM);

    // ---------------------------------------------------------------------------
    // API Fetch
    // ---------------------------------------------------------------------------

    const fetchUsers = useCallback(
        async (quiet = false) => {
            if (!token) return;
            const toastId = !quiet ? toast.loading('Syncing user database...') : undefined;
            setIsLoading(true);
            try {
                const response = await api.users.getAll(token);
                if (response.success && Array.isArray(response.data)) {
                    setUsers(response.data);
                    if (toastId) toast.success(`Loaded ${response.data.length} users`, { id: toastId });
                } else {
                    const message = 'message' in response && typeof response.message === 'string' ? response.message : 'Unable to fetch users';
                    if (toastId) toast.error(message, { id: toastId });
                }
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : 'Network failure';
                if (toastId) toast.error(message, { id: toastId });
            } finally {
                setIsLoading(false);
            }
        },
        [token]
    );

    useEffect(() => {
        fetchUsers(true);
    }, [fetchUsers]);

    // Computed Metrics
    const stats = useMemo(() => {
        const total = users.length;
        const active = users.filter((u) => u.isActive).length;
        const admins = users.filter((u) => u.role === 'admin').length;
        const rate = total > 0 ? Math.round((active / total) * 100) : 0;
        return { total, active, admins, rate };
    }, [users]);

    // Filter Algorithm
    const filteredUsers = useMemo(() => {
        const query = searchTerm.toLowerCase().trim();
        return users.filter((user) => {
            const matchesSearch =
                !query ||
                user.name.toLowerCase().includes(query) ||
                user.email.toLowerCase().includes(query) ||
                user.company?.toLowerCase().includes(query) ||
                user.jobTitle?.toLowerCase().includes(query);

            const matchesRole = filterRole === 'all' || user.role === filterRole;
            const matchesStatus =
                filterStatus === 'all' ||
                (filterStatus === 'active' && user.isActive) ||
                (filterStatus === 'inactive' && !user.isActive);

            return matchesSearch && matchesRole && matchesStatus;
        });
    }, [users, searchTerm, filterRole, filterStatus]);

    // ---------------------------------------------------------------------------
    // User CRUD Handlers
    // ---------------------------------------------------------------------------

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;

        if (!formData.password) {
            toast.error('Password is required for user account creation');
            return;
        }

        setIsSubmitting(true);
        const toastId = toast.loading('Registering account...');

        try {
            const payload = {
                name: formData.name.trim(),
                email: formData.email.trim(),
                password: formData.password,
                role: formData.role,
                phone: formData.phone.trim() || undefined,
                company: formData.company.trim() || undefined,
                jobTitle: formData.jobTitle.trim() || undefined,
            };

            const response = await api.users.create(token, payload);
            if (response.success) {
                await fetchUsers(true);
                setIsCreateModalOpen(false);
                setFormData(INITIAL_FORM);
                toast.success(`Account created for ${formData.name}`, { id: toastId });
            } else {
                const message = 'message' in response && typeof response.message === 'string' ? response.message : 'Creation rejected';
                toast.error(message, { id: toastId });
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to create user';
            toast.error(message, { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOpenEdit = (user: User) => {
        setSelectedUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            password: '',
            role: user.role,
            phone: user.phone || '',
            company: user.company || '',
            jobTitle: user.jobTitle || '',
            isActive: user.isActive,
        });
        setIsEditModalOpen(true);
    };

    const handleOpenView = (user: User) => {
        setSelectedUser(user);
        setIsViewModalOpen(true);
    };

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token || !selectedUser) return;
        setIsSubmitting(true);
        const toastId = toast.loading('Saving user changes...');

        try {
            const payload: Partial<UserFormInputs> = {
                name: formData.name.trim(),
                email: formData.email.trim(),
                role: formData.role,
                phone: formData.phone.trim() || undefined,
                company: formData.company.trim() || undefined,
                jobTitle: formData.jobTitle.trim() || undefined,
                isActive: formData.isActive,
            };

            if (formData.password && formData.password.trim().length > 0) {
                payload.password = formData.password.trim();
            }

            const response = await api.users.update(token, selectedUser._id, payload);
            if (response.success) {
                await fetchUsers(true);
                setIsEditModalOpen(false);
                setSelectedUser(null);
                setFormData(INITIAL_FORM);
                toast.success('User updated successfully', { id: toastId });
            } else {
                const message = 'message' in response && typeof response.message === 'string' ? response.message : 'Update failed';
                toast.error(message, { id: toastId });
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to update user';
            toast.error(message, { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteUser = async () => {
        if (!token || !selectedUser) return;
        setIsSubmitting(true);
        const toastId = toast.loading(`Deleting ${selectedUser.name}...`);
        const previousUsers = [...users];

        // Optimistic Removal
        setUsers((prev) => prev.filter((u) => u._id !== selectedUser._id));

        try {
            const response = await api.users.delete(token, selectedUser._id);
            if (response.success) {
                setIsDeleteModalOpen(false);
                setSelectedUser(null);
                toast.success('Account permanently deleted', { id: toastId });
            } else {
                setUsers(previousUsers);
                const message = 'message' in response && typeof response.message === 'string' ? response.message : 'Deletion failed';
                toast.error(message, { id: toastId });
            }
        } catch (error: unknown) {
            setUsers(previousUsers);
            const message = error instanceof Error ? error.message : 'Failed to delete user';
            toast.error(message, { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleStatus = async (user: User) => {
        if (!token) return;
        const originalStatus = user.isActive;
        const targetStatus = !originalStatus;

        // Optimistic UI Update
        setUsers((prev) =>
            prev.map((u) => (u._id === user._id ? { ...u, isActive: targetStatus } : u))
        );

        try {
            const response = await api.users.toggleStatus(token, user._id);
            if (response.success) {
                toast.success(`${user.name} is now ${targetStatus ? 'Active' : 'Deactivated'}`);
            } else {
                // Rollback
                setUsers((prev) =>
                    prev.map((u) => (u._id === user._id ? { ...u, isActive: originalStatus } : u))
                );
                const message = 'message' in response && typeof response.message === 'string' ? response.message : 'Could not update user status';
                toast.error(message);
            }
        } catch (error: unknown) {
            setUsers((prev) =>
                prev.map((u) => (u._id === user._id ? { ...u, isActive: originalStatus } : u))
            );
            const message = error instanceof Error ? error.message : 'Failed to toggle status';
            toast.error(message);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8 space-y-6 container mx-auto">
            {/* ----------------------------------------------------------------- */}
            {/* Page Header */}
            {/* ----------------------------------------------------------------- */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">User Management</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Manage account credentials, role authorization, and network security profiles.
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
                    <span>Add New User</span>
                </button>
            </div>

            {/* ----------------------------------------------------------------- */}
            {/* KPI Overview Metric Cards */}
            {/* ----------------------------------------------------------------- */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Users</p>
                        <p className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 text-lg font-semibold">
                        👥
                    </div>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Active Users</p>
                        <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.active}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                        ✓
                    </div>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Admins</p>
                        <p className="text-2xl font-bold text-indigo-600 mt-1">{stats.admins}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                        🛡️
                    </div>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-sky-600 uppercase tracking-wider">Active Rate</p>
                        <p className="text-2xl font-bold text-sky-600 mt-1">{stats.rate}%</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                        %
                    </div>
                </div>
            </div>

            {/* ----------------------------------------------------------------- */}
            {/* Search & Filter Bar */}
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
                        placeholder="Search by name, email, company, or job title..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 text-slate-900 placeholder:text-slate-400 transition"
                    />
                </div>

                <div className="flex flex-wrap sm:flex-nowrap gap-2">
                    <select
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        className="text-sm px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-700 font-medium transition"
                    >
                        <option value="all">All Roles</option>
                        <option value="admin">Admin</option>
                        <option value="manager">Manager</option>
                        <option value="technician">Technician</option>
                        <option value="user">User</option>
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
                        onClick={() => fetchUsers(false)}
                        className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 transition"
                        title="Refresh user database"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* ----------------------------------------------------------------- */}
            {/* Users Table */}
            {/* ----------------------------------------------------------------- */}
            <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                <th className="px-6 py-4">User Profile</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Logins</th>
                                <th className="px-6 py-4">Last Activity</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {isLoading ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-slate-200 rounded-full" />
                                                <div className="space-y-1.5">
                                                    <div className="w-32 h-3.5 bg-slate-200 rounded" />
                                                    <div className="w-48 h-2.5 bg-slate-100 rounded" />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4"><div className="w-16 h-5 bg-slate-100 rounded-full" /></td>
                                        <td className="px-6 py-4"><div className="w-16 h-5 bg-slate-100 rounded-full" /></td>
                                        <td className="px-6 py-4"><div className="w-10 h-3.5 bg-slate-100 rounded" /></td>
                                        <td className="px-6 py-4"><div className="w-24 h-3 bg-slate-100 rounded" /></td>
                                        <td className="px-6 py-4"><div className="w-20 h-6 bg-slate-100 rounded ml-auto" /></td>
                                    </tr>
                                ))
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center">
                                        <div className="max-w-xs mx-auto text-center space-y-2">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-xl text-slate-400">
                                                👥
                                            </div>
                                            <p className="text-sm font-bold text-slate-900">No users found</p>
                                            <p className="text-xs text-slate-400">Try adjusting your search criteria or role filters.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => {
                                    const roleConfig = ROLE_CONFIG[user.role] || ROLE_CONFIG.user;
                                    return (
                                        <tr key={user._id} className="hover:bg-slate-50/60 transition-colors">
                                            {/* User Info */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className={`w-10 h-10 rounded-full border flex items-center justify-center font-bold text-sm shrink-0 ${getAvatarColor(
                                                            user.name
                                                        )}`}
                                                    >
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-semibold text-slate-900 truncate">{user.name}</p>
                                                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                                                        {(user.company || user.jobTitle) && (
                                                            <p className="text-[11px] text-slate-400 truncate mt-0.5">
                                                                {[user.jobTitle, user.company].filter(Boolean).join(' • ')}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Role Badge */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${roleConfig.badge}`}
                                                >
                                                    <span className={`w-1.5 h-1.5 rounded-full ${roleConfig.dot}`} />
                                                    {roleConfig.label}
                                                </span>
                                            </td>

                                            {/* Status */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${user.isActive
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                        : 'bg-slate-100 text-slate-500 border-slate-200'
                                                        }`}
                                                >
                                                    <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                                    {user.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>

                                            {/* Logins Count */}
                                            <td className="px-6 py-4 whitespace-nowrap text-xs font-mono font-semibold text-slate-600">
                                                {user.loginCount || 0}
                                            </td>

                                            {/* Last Activity */}
                                            <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                                                {formatDate(user.lastLogin || user.updatedAt)}
                                            </td>

                                            {/* Action Buttons */}
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => handleOpenView(user)}
                                                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition"
                                                        title="View Overview"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                    </button>

                                                    <button
                                                        onClick={() => handleOpenEdit(user)}
                                                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
                                                        title="Edit Credentials"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                                        </svg>
                                                    </button>

                                                    <button
                                                        onClick={() => handleToggleStatus(user)}
                                                        className={`p-1.5 rounded-lg transition ${user.isActive
                                                            ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                                                            : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                                                            }`}
                                                        title={user.isActive ? 'Deactivate Account' : 'Activate Account'}
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 5.636a9 9 0 1012.728 0M12 3v9" />
                                                        </svg>
                                                    </button>

                                                    <button
                                                        onClick={() => {
                                                            setSelectedUser(user);
                                                            setIsDeleteModalOpen(true);
                                                        }}
                                                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                                                        title="Delete Account"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ----------------------------------------------------------------- */}
            {/* Create User Modal */}
            {/* ----------------------------------------------------------------- */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="bg-white rounded-3xl w-full max-w-lg p-6 sm:p-7 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">Add New User</h2>
                                <p className="text-xs text-slate-500">Configure profile credentials and access authorization.</p>
                            </div>
                            <button
                                onClick={() => setIsCreateModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Full Name <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        placeholder="e.g. Sarah Jenkins"
                                        className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900 placeholder:text-slate-400 transition"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Email Address <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                        placeholder="sarah.jenkins@company.com"
                                        className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900 placeholder:text-slate-400 transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Password <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required
                                        minLength={6}
                                        placeholder="••••••••"
                                        className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900 placeholder:text-slate-400 transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Role <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                                        className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900 transition"
                                    >
                                        <option value="user">User</option>
                                        <option value="technician">Technician</option>
                                        <option value="manager">Manager</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="+1 (555) 000-0000"
                                        className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900 placeholder:text-slate-400 transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Company
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.company}
                                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                        placeholder="e.g. EV Fleet Ops"
                                        className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900 placeholder:text-slate-400 transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Job Title
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.jobTitle}
                                        onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                                        placeholder="e.g. Operations Lead"
                                        className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900 placeholder:text-slate-400 transition"
                                    />
                                </div>
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
                                    {isSubmitting ? 'Creating...' : 'Create Account'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ----------------------------------------------------------------- */}
            {/* Edit User Modal */}
            {/* ----------------------------------------------------------------- */}
            {isEditModalOpen && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="bg-white rounded-3xl w-full max-w-lg p-6 sm:p-7 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">Edit User Profile</h2>
                                <p className="text-xs text-slate-500">Update credentials, role authorization, and contact records.</p>
                            </div>
                            <button
                                onClick={() => {
                                    setIsEditModalOpen(false);
                                    setSelectedUser(null);
                                }}
                                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleUpdateUser} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Full Name <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900 transition"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Email Address <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                        className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900 transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Role <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                                        className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900 transition"
                                    >
                                        <option value="user">User</option>
                                        <option value="technician">Technician</option>
                                        <option value="manager">Manager</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Account Status
                                    </label>
                                    <select
                                        value={formData.isActive ? 'active' : 'inactive'}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'active' })}
                                        className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900 transition"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                        New Password (Optional)
                                    </label>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="Leave blank to preserve current password"
                                        minLength={6}
                                        className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900 placeholder:text-slate-400 transition"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900 transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Company
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.company}
                                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                        className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900 transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Job Title
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.jobTitle}
                                        onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                                        className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900 transition"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-5 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditModalOpen(false);
                                        setSelectedUser(null);
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
                                    {isSubmitting ? 'Saving...' : 'Update Account'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ----------------------------------------------------------------- */}
            {/* View User Modal */}
            {/* ----------------------------------------------------------------- */}
            {isViewModalOpen && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="bg-white rounded-3xl w-full max-w-lg p-6 sm:p-7 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">User Profile</h2>
                                <p className="text-xs text-slate-500 font-mono mt-0.5">UID: {selectedUser._id}</p>
                            </div>
                            <button
                                onClick={() => {
                                    setIsViewModalOpen(false);
                                    setSelectedUser(null);
                                }}
                                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div
                                    className={`w-14 h-14 rounded-full border flex items-center justify-center font-bold text-xl shrink-0 ${getAvatarColor(
                                        selectedUser.name
                                    )}`}
                                >
                                    {selectedUser.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">{selectedUser.name}</h3>
                                    <p className="text-xs text-slate-500">{selectedUser.email}</p>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <span
                                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${ROLE_CONFIG[selectedUser.role]?.badge || ROLE_CONFIG.user.badge
                                                }`}
                                        >
                                            {ROLE_CONFIG[selectedUser.role]?.label || selectedUser.role}
                                        </span>
                                        <span
                                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${selectedUser.isActive
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                : 'bg-slate-100 text-slate-500 border-slate-200'
                                                }`}
                                        >
                                            {selectedUser.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/60">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Company</span>
                                    <span className="text-sm font-semibold text-slate-800 block mt-1">{selectedUser.company || '—'}</span>
                                </div>
                                <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/60">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Job Title</span>
                                    <span className="text-sm font-semibold text-slate-800 block mt-1">{selectedUser.jobTitle || '—'}</span>
                                </div>
                                <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/60">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Phone</span>
                                    <span className="text-sm font-semibold text-slate-800 block mt-1">{selectedUser.phone || '—'}</span>
                                </div>
                                <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/60">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Login Count</span>
                                    <span className="text-sm font-mono font-semibold text-slate-800 block mt-1">
                                        {selectedUser.loginCount || 0}
                                    </span>
                                </div>
                            </div>

                            <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/60 space-y-1 text-xs text-slate-500">
                                <div className="flex justify-between">
                                    <span>Registered:</span>
                                    <span className="text-slate-800 font-medium">{formatDate(selectedUser.createdAt)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Last Sign-In:</span>
                                    <span className="text-slate-800 font-medium">{formatDate(selectedUser.lastLogin)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4 mt-6 border-t border-slate-100">
                            <button
                                onClick={() => {
                                    setIsViewModalOpen(false);
                                    handleOpenEdit(selectedUser);
                                }}
                                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition"
                            >
                                Edit Account
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
            {isDeleteModalOpen && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl border border-slate-200 text-center">
                        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100 flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                            ⚠️
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">Revoke User Access</h3>
                        <p className="text-xs text-slate-500 mt-2 mb-5 leading-relaxed">
                            Are you sure you want to permanently delete <span className="font-semibold text-slate-800">{selectedUser.name}</span>? This action cannot be undone.
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    setIsDeleteModalOpen(false);
                                    setSelectedUser(null);
                                }}
                                className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-sm font-semibold transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteUser}
                                disabled={isSubmitting}
                                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition disabled:opacity-50"
                            >
                                {isSubmitting ? 'Deleting...' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}