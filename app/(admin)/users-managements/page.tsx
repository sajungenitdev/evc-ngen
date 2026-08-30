// app/(admin)/users-management/page.tsx
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

// -----------------------------------------------------------------------------
// 1. Types & Data Contracts
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
    isVerified: boolean;
    loginCount: number;
    lastLogin?: string;
    createdAt: string;
}

export interface UserFormInputs {
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    phone: string;
    company: string;
    jobTitle: string;
    isActive?: boolean;
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

const ROLE_BADGE_CONFIG: Record<UserRole, { bg: string; text: string; border: string }> = {
    admin: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200/80' },
    manager: { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200/80' },
    technician: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200/80' },
    user: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200/80' },
};

function formatDate(dateString?: string): string {
    if (!dateString) return 'Never';
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

    // Form & Target State
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [formData, setFormData] = useState<UserFormInputs>(INITIAL_FORM);

    // -------------------------------------------------------------------------
    // API Queries & Mutations
    // -------------------------------------------------------------------------

    const fetchUsers = useCallback(async (quiet = false) => {
        if (!token) return;
        const toastId = !quiet ? toast.loading('Syncing user database...') : undefined;
        try {
            const response = await api.users.getAll(token);
            if (response.success) {
                setUsers(response.data);
                if (toastId) toast.success(`Synced ${response.data.length} users`, { id: toastId });
            } else {
                if (toastId) toast.error('Unable to fetch user records', { id: toastId });
            }
        } catch (error: any) {
            console.error('Error fetching users:', error);
            if (toastId) toast.error(error?.message || 'Network connection failed', { id: toastId });
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchUsers(true);
    }, [fetchUsers]);

    // Computed Stats
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

    // Create User
    // app/(admin)/users-management/page.tsx -> handleCreateUser

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;

        // Guard against missing password
        if (!formData.password) {
            toast.error('Password is required to create a new user');
            return;
        }

        setIsSubmitting(true);
        const toastId = toast.loading('Registering new account...');

        try {
            const payload = {
                name: formData.name.trim(),
                email: formData.email.trim(),
                password: formData.password, // TypeScript now narrows this strictly to 'string'
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
                toast.error((response as any)?.message || 'Creation rejected', { id: toastId });
            }
        } catch (error: any) {
            console.error('Create error:', error);
            toast.error(error?.message || 'Failed to create user', { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Open Edit Modal
    const handleOpenEdit = (user: User) => {
        setSelectedUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone || '',
            company: user.company || '',
            jobTitle: user.jobTitle || '',
            isActive: user.isActive,
        });
        setIsEditModalOpen(true);
    };

    // Update User
    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token || !selectedUser) return;
        setIsSubmitting(true);
        const toastId = toast.loading('Saving changes...');

        try {
            const payload = {
                name: formData.name.trim(),
                email: formData.email.trim(),
                role: formData.role,
                phone: formData.phone.trim() || undefined,
                company: formData.company.trim() || undefined,
                jobTitle: formData.jobTitle.trim() || undefined,
                isActive: formData.isActive,
            };

            const response = await api.users.update(token, selectedUser._id, payload);
            if (response.success) {
                await fetchUsers(true);
                setIsEditModalOpen(false);
                setSelectedUser(null);
                setFormData(INITIAL_FORM);
                toast.success('User updated successfully', { id: toastId });
            } else {
                toast.error((response as any)?.message || 'Update failed', { id: toastId });
            }
        } catch (error: any) {
            console.error('Update error:', error);
            toast.error(error?.message || 'Failed to update user', { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Delete User (Optimistic with rollback)
    const handleDeleteUser = async () => {
        if (!token || !selectedUser) return;
        setIsSubmitting(true);
        const toastId = toast.loading(`Deleting ${selectedUser.name}...`);
        const previousUsers = [...users];

        // Optimistic local removal
        setUsers((prev) => prev.filter((u) => u._id !== selectedUser._id));

        try {
            const response = await api.users.delete(token, selectedUser._id);
            if (response.success) {
                setIsDeleteModalOpen(false);
                setSelectedUser(null);
                toast.success('Account permanently deleted', { id: toastId });
            } else {
                setUsers(previousUsers);
                toast.error('Deletion failed on server', { id: toastId });
            }
        } catch (error: any) {
            setUsers(previousUsers);
            console.error('Delete error:', error);
            toast.error(error?.message || 'Failed to delete user', { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Quick Status Toggle (Optimistic)
    const handleToggleStatus = async (user: User) => {
        if (!token) return;
        const originalStatus = user.isActive;
        const targetStatus = !originalStatus;

        // Optimistic UI update
        setUsers((prev) =>
            prev.map((u) => (u._id === user._id ? { ...u, isActive: targetStatus } : u))
        );

        try {
            const response = await api.users.toggleStatus(token, user._id);
            if (response.success) {
                toast.success(`${user.name} is now ${targetStatus ? 'Active' : 'Deactivated'}`);
            } else {
                // Rollback on server failure
                setUsers((prev) =>
                    prev.map((u) => (u._id === user._id ? { ...u, isActive: originalStatus } : u))
                );
                toast.error('Could not change account status');
            }
        } catch (error: any) {
            setUsers((prev) =>
                prev.map((u) => (u._id === user._id ? { ...u, isActive: originalStatus } : u))
            );
            toast.error(error?.message || 'Failed to toggle status');
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
                        User Management
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        Control account credentials, role authorization, and security status across the network.
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
                    <span>Add New User</span>
                </button>
            </div>

            {/* ----------------------------------------------------------------- */}
            {/* KPI Metric Overview Cards                                         */}
            {/* ----------------------------------------------------------------- */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-colors">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Accounts</span>
                    <p className="text-2xl sm:text-3xl font-bold text-[#0B192C] font-mono mt-1.5">{stats.total}</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-colors">
                    <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Active Users</span>
                    <p className="text-2xl sm:text-3xl font-bold text-[#0B192C] font-mono mt-1.5">{stats.active}</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-colors">
                    <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">System Admins</span>
                    <p className="text-2xl sm:text-3xl font-bold text-[#0B192C] font-mono mt-1.5">{stats.admins}</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-colors">
                    <span className="text-[11px] font-bold text-sky-600 uppercase tracking-wider">Engagement Rate</span>
                    <p className="text-2xl sm:text-3xl font-bold text-[#0B192C] font-mono mt-1.5">{stats.rate}%</p>
                </div>
            </div>

            {/* ----------------------------------------------------------------- */}
            {/* Filter Toolbar                                                    */}
            {/* ----------------------------------------------------------------- */}
            <div className="flex flex-col sm:flex-row gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                {/* Search Bar */}
                <div className="relative flex-1">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </span>
                    <input
                        type="text"
                        placeholder="Search by name, email, company, or job title..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full text-black pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/10 focus:border-[#0B192C] text-slate-800 transition-all placeholder:text-slate-400"
                    />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap sm:flex-nowrap gap-2">
                    <select
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        className="text-xs sm:text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/10 focus:border-[#0B192C] text-slate-700 font-medium transition-all"
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
                        className="text-xs sm:text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/10 focus:border-[#0B192C] text-slate-700 font-medium transition-all"
                    >
                        <option value="all">All Statuses</option>
                        <option value="active">Active Only</option>
                        <option value="inactive">Inactive Only</option>
                    </select>

                    <button
                        onClick={() => fetchUsers(false)}
                        aria-label="Refresh user list"
                        className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 hover:text-[#0B192C] transition-colors focus:outline-none"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.03 8.03 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* ----------------------------------------------------------------- */}
            {/* Main User Table                                                   */}
            {/* ----------------------------------------------------------------- */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                <th className="px-6 py-4">User Profile</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Logins</th>
                                <th className="px-6 py-4">Last Activity</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-slate-200" />
                                                <div className="space-y-1.5">
                                                    <div className="w-28 h-3.5 bg-slate-200 rounded" />
                                                    <div className="w-36 h-2.5 bg-slate-100 rounded" />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4"><div className="w-14 h-5 bg-slate-200 rounded-full" /></td>
                                        <td className="px-6 py-4"><div className="w-16 h-3.5 bg-slate-200 rounded" /></td>
                                        <td className="px-6 py-4"><div className="w-8 h-3.5 bg-slate-200 rounded" /></td>
                                        <td className="px-6 py-4"><div className="w-20 h-3.5 bg-slate-200 rounded" /></td>
                                        <td className="px-6 py-4"><div className="w-16 h-6 bg-slate-200 rounded ml-auto" /></td>
                                    </tr>
                                ))
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center">
                                        <div className="max-w-xs mx-auto text-center space-y-2">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
                                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                                                </svg>
                                            </div>
                                            <p className="text-sm font-bold text-[#0B192C]">No users found</p>
                                            <p className="text-xs text-slate-400">No account matches your search or active filter settings.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => {
                                    const badge = ROLE_BADGE_CONFIG[user.role] || ROLE_BADGE_CONFIG.user;
                                    return (
                                        <tr key={user._id} className="hover:bg-slate-50/80 transition-colors">
                                            {/* Profile */}
                                            <td className="px-6 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#0B192C] to-[#1E3E62] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-[#0B192C] truncate">{user.name}</p>
                                                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                                                        {(user.company || user.jobTitle) && (
                                                            <p className="text-[11px] text-slate-400 truncate">
                                                                {[user.jobTitle, user.company].filter(Boolean).join(' • ')}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Role */}
                                            <td className="px-6 py-3.5">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border capitalize ${badge.bg} ${badge.text} ${badge.border}`}>
                                                    {user.role}
                                                </span>
                                            </td>

                                            {/* Status */}
                                            <td className="px-6 py-3.5">
                                                <div className="inline-flex items-center gap-1.5 text-xs font-semibold">
                                                    <span className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-emerald-500 ring-2 ring-emerald-500/20' : 'bg-slate-300'}`} />
                                                    <span className={user.isActive ? 'text-emerald-700' : 'text-slate-400'}>
                                                        {user.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Logins */}
                                            <td className="px-6 py-3.5 text-xs font-mono font-semibold text-slate-600">
                                                {user.loginCount || 0}
                                            </td>

                                            {/* Last Login */}
                                            <td className="px-6 py-3.5 text-xs text-slate-500 whitespace-nowrap">
                                                {formatDate(user.lastLogin)}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-3.5 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    {/* Edit */}
                                                    <button
                                                        onClick={() => handleOpenEdit(user)}
                                                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                                        title="Edit User"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                                        </svg>
                                                    </button>

                                                    {/* Toggle Status */}
                                                    <button
                                                        onClick={() => handleToggleStatus(user)}
                                                        className={`p-1.5 rounded-lg transition-colors ${user.isActive
                                                            ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                                                            : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                                                            }`}
                                                        title={user.isActive ? 'Deactivate User' : 'Activate User'}
                                                    >
                                                        {user.isActive ? (
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
                                                            setSelectedUser(user);
                                                            setIsDeleteModalOpen(true);
                                                        }}
                                                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                                        title="Delete User"
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
            {/* Create User Modal                                                 */}
            {/* ----------------------------------------------------------------- */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B192C]/40 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="bg-white rounded-3xl w-full max-w-lg p-6 sm:p-7 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                            <div>
                                <h2 className="text-lg font-bold text-[#0B192C]">Add New User</h2>
                                <p className="text-xs text-slate-500">Configure credentials and define roles</p>
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

                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2">
                                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Full Name <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        placeholder="Jane Doe"
                                        className="w-full px-3.5 text-black py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Email Address <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                        placeholder="jane.doe@company.com"
                                        className="w-full px-3.5 text-black py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Password <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required
                                        minLength={6}
                                        placeholder="••••••••"
                                        className="w-full px-3.5 text-black py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Role <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                                        className="w-full px-3.5 text-black py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all"
                                    >
                                        <option value="user">User</option>
                                        <option value="technician">Technician</option>
                                        <option value="manager">Manager</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">Phone Number</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="+1 (555) 019-2834"
                                        className="w-full px-3.5 text-black py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">Company</label>
                                    <input
                                        type="text"
                                        value={formData.company}
                                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                        placeholder="EVNGEN Charging Inc."
                                        className="w-full px-3.5 text-black py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">Job Title</label>
                                    <input
                                        type="text"
                                        value={formData.jobTitle}
                                        onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                                        placeholder="Field Operator"
                                        className="w-full px-3.5 text-black py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all"
                                    />
                                </div>
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
                                    {isSubmitting ? 'Creating...' : 'Create Account'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ----------------------------------------------------------------- */}
            {/* Edit User Modal                                                   */}
            {/* ----------------------------------------------------------------- */}
            {isEditModalOpen && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B192C]/40 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="bg-white rounded-3xl w-full max-w-lg p-6 sm:p-7 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                            <div>
                                <h2 className="text-lg font-bold text-[#0B192C]">Edit User</h2>
                                <p className="text-xs text-slate-500">Update account permissions and profiles</p>
                            </div>
                            <button
                                onClick={() => {
                                    setIsEditModalOpen(false);
                                    setSelectedUser(null);
                                }}
                                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleUpdateUser} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2">
                                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Full Name <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        className="w-full px-3.5 text-black py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Email Address <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                        className="w-full px-3.5 text-black py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Role <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                                        className="w-full px-3.5 text-black py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all"
                                    >
                                        <option value="user">User</option>
                                        <option value="technician">Technician</option>
                                        <option value="manager">Manager</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">Status</label>
                                    <select
                                        value={formData.isActive ? 'active' : 'inactive'}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'active' })}
                                        className="w-full px-3.5 text-black py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">Phone Number</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-3.5 text-black py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">Company</label>
                                    <input
                                        type="text"
                                        value={formData.company}
                                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                        className="w-full px-3.5 text-black py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">Job Title</label>
                                    <input
                                        type="text"
                                        value={formData.jobTitle}
                                        onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                                        className="w-full px-3.5 text-black py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all"
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
                                    className="flex-1 px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs sm:text-sm font-bold transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 bg-[#0B192C] hover:bg-[#1E3E62] text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-[#0B192C]/10 transition-colors disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Saving...' : 'Update Account'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ----------------------------------------------------------------- */}
            {/* Delete Confirmation Modal                                         */}
            {/* ----------------------------------------------------------------- */}
            {isDeleteModalOpen && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B192C]/40 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-slate-200 text-center">
                        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100 flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-[#0B192C]">Revoke Account Access</h3>
                        <p className="text-xs text-slate-500 mt-2 mb-6 leading-relaxed">
                            Are you sure you want to delete <span className="font-bold text-slate-800">{selectedUser.name}</span>? All permissions and auth keys will be permanently removed.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setIsDeleteModalOpen(false);
                                    setSelectedUser(null);
                                }}
                                className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteUser}
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