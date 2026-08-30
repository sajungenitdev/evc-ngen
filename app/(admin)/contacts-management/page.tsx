// app/(admin)/contact-management/page.tsx
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

interface Contact {
    _id: string;
    id: string;
    name: string;
    email: string;
    company: string;
    interest: string;
    message: string;
    status: 'pending' | 'contacted' | 'resolved' | 'cancelled';
    assignedTo: string;
    notes: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

interface Stats {
    total: number;
    pending: number;
    contacted: number;
    resolved: number;
    cancelled: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function ContactManagementPage() {
    const { token } = useAuth();
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [stats, setStats] = useState<Stats>({
        total: 0,
        pending: 0,
        contacted: 0,
        resolved: 0,
        cancelled: 0,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

    // Modals
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    // Status update
    const [newStatus, setNewStatus] = useState<Contact['status']>('pending');
    const [statusNotes, setStatusNotes] = useState('');

    // ============================================
    // API Helper
    // ============================================
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

    // ============================================
    // Fetch Contacts
    // ============================================
    const fetchContacts = useCallback(async () => {
        if (!token) return;
        setIsLoading(true);
        try {
            const response = await apiCall('/contacts');
            if (response.success) {
                setContacts(response.data || []);
                setStats(response.stats || {
                    total: 0,
                    pending: 0,
                    contacted: 0,
                    resolved: 0,
                    cancelled: 0,
                });
            } else {
                toast.error(response.message || 'Failed to load contacts');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to load contacts');
        } finally {
            setIsLoading(false);
        }
    }, [token, apiCall]);

    useEffect(() => {
        fetchContacts();
    }, [fetchContacts]);

    // ============================================
    // Filter Logic
    // ============================================
    const filteredContacts = useMemo(() => {
        const query = searchTerm.toLowerCase().trim();
        return contacts.filter((contact) => {
            const matchesSearch =
                !query ||
                contact.name.toLowerCase().includes(query) ||
                contact.email.toLowerCase().includes(query) ||
                contact.company.toLowerCase().includes(query) ||
                contact.message.toLowerCase().includes(query);
            const matchesStatus = filterStatus === 'all' || contact.status === filterStatus;
            return matchesSearch && matchesStatus;
        });
    }, [contacts, searchTerm, filterStatus]);

    // ============================================
    // Delete Contact
    // ============================================
    const handleDeleteContact = async () => {
        if (!token || !selectedContact) return;
        setIsSubmitting(true);
        const toastId = toast.loading('Deleting contact...');

        try {
            const response = await apiCall(`/contacts/${selectedContact.id}`, {
                method: 'DELETE',
            });

            if (response.success) {
                await fetchContacts();
                setIsDeleteModalOpen(false);
                setSelectedContact(null);
                toast.success('Contact deleted successfully!', { id: toastId });
            } else {
                toast.error(response.message || 'Failed to delete contact', { id: toastId });
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete contact', { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    // ============================================
    // Update Status
    // ============================================
    const handleUpdateStatus = async () => {
        if (!token || !selectedContact) return;
        setIsSubmitting(true);
        const toastId = toast.loading('Updating status...');

        try {
            const response = await apiCall(`/contacts/${selectedContact.id}/status`, {
                method: 'PUT',
                body: JSON.stringify({
                    status: newStatus,
                    notes: statusNotes || selectedContact.notes,
                }),
            });

            if (response.success) {
                await fetchContacts();
                setIsStatusModalOpen(false);
                setSelectedContact(null);
                setNewStatus('pending');
                setStatusNotes('');
                toast.success(`Status updated to ${newStatus}!`, { id: toastId });
            } else {
                toast.error(response.message || 'Failed to update status', { id: toastId });
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to update status', { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    // ============================================
    // Open Modals
    // ============================================
    const handleView = (contact: Contact) => {
        setSelectedContact(contact);
        setIsViewModalOpen(true);
    };

    const handleDelete = (contact: Contact) => {
        setSelectedContact(contact);
        setIsDeleteModalOpen(true);
    };

    const handleStatusUpdate = (contact: Contact) => {
        setSelectedContact(contact);
        setNewStatus(contact.status);
        setStatusNotes(contact.notes || '');
        setIsStatusModalOpen(true);
    };

    // ============================================
    // Helper Functions
    // ============================================
    const getStatusBadge = (status: string) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            contacted: 'bg-blue-100 text-blue-800 border-blue-200',
            resolved: 'bg-green-100 text-green-800 border-green-200',
            cancelled: 'bg-red-100 text-red-800 border-red-200',
        };
        return colors[status as keyof typeof colors] || colors.pending;
    };

    const getInterestBadge = (interest: string) => {
        const colors = {
            'Basic EV Charger': 'bg-emerald-100 text-emerald-800 border-emerald-200',
            'DC Fast Charger': 'bg-purple-100 text-purple-800 border-purple-200',
            'Charging Station with OCPP': 'bg-blue-100 text-blue-800 border-blue-200',
            'Dual-Port Wallbox': 'bg-amber-100 text-amber-800 border-amber-200',
            'Other': 'bg-gray-100 text-gray-800 border-gray-200',
        };
        return colors[interest as keyof typeof colors] || colors['Other'];
    };

    const formatDateTime = (dateString?: string) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return 'Invalid date';
        }
    };

    const statusOptions: Contact['status'][] = ['pending', 'contacted', 'resolved', 'cancelled'];
    const interestOptions = ['Basic EV Charger', 'DC Fast Charger', 'Charging Station with OCPP', 'Dual-Port Wallbox', 'Other'];

    return (
        <div className="space-y-6 container mx-auto pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0B192C]">
                        Contact Management
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        Manage all contact inquiries from the website
                    </p>
                </div>
                <button
                    onClick={() => fetchContacts()}
                    className="inline-flex items-center justify-center gap-2 bg-[#0B192C] hover:bg-[#1E3E62] text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-[#0B192C]/10 transition-all"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.03 8.03 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center shadow-xs">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</span>
                    <p className="text-2xl font-bold text-[#0B192C] mt-1">{stats.total}</p>
                </div>
                <div className="bg-white border border-yellow-200 rounded-2xl p-4 text-center shadow-xs">
                    <span className="text-xs font-semibold text-yellow-600 uppercase tracking-wider">Pending</span>
                    <p className="text-2xl font-bold text-yellow-700 mt-1">{stats.pending}</p>
                </div>
                <div className="bg-white border border-blue-200 rounded-2xl p-4 text-center shadow-xs">
                    <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Contacted</span>
                    <p className="text-2xl font-bold text-blue-700 mt-1">{stats.contacted}</p>
                </div>
                <div className="bg-white border border-green-200 rounded-2xl p-4 text-center shadow-xs">
                    <span className="text-xs font-semibold text-green-600 uppercase tracking-wider">Resolved</span>
                    <p className="text-2xl font-bold text-green-700 mt-1">{stats.resolved}</p>
                </div>
                <div className="bg-white border border-red-200 rounded-2xl p-4 text-center shadow-xs">
                    <span className="text-xs font-semibold text-red-600 uppercase tracking-wider">Cancelled</span>
                    <p className="text-2xl font-bold text-red-700 mt-1">{stats.cancelled}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="relative flex-1 min-w-[200px]">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </span>
                    <input
                        type="text"
                        placeholder="Search by name, email, company, or message..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/10 focus:border-[#0B192C] transition-all"
                    />
                </div>

                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="text-sm px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/10 focus:border-[#0B192C] text-slate-700 font-medium transition-all"
                >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="contacted">Contacted</option>
                    <option value="resolved">Resolved</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                <th className="px-6 py-4">Contact</th>
                                <th className="px-6 py-4">Interest</th>
                                <th className="px-6 py-4">Message</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Received</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4">
                                            <div className="space-y-1.5">
                                                <div className="w-28 h-3.5 bg-slate-200 rounded" />
                                                <div className="w-36 h-2.5 bg-slate-100 rounded" />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4"><div className="w-20 h-5 bg-slate-200 rounded-full" /></td>
                                        <td className="px-6 py-4"><div className="w-32 h-3.5 bg-slate-200 rounded" /></td>
                                        <td className="px-6 py-4"><div className="w-16 h-5 bg-slate-200 rounded-full" /></td>
                                        <td className="px-6 py-4"><div className="w-20 h-3.5 bg-slate-200 rounded" /></td>
                                        <td className="px-6 py-4"><div className="w-20 h-6 bg-slate-200 rounded ml-auto" /></td>
                                    </tr>
                                ))
                            ) : filteredContacts.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center">
                                        <div className="max-w-xs mx-auto text-center space-y-2">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-400 text-xl">
                                                📧
                                            </div>
                                            <p className="text-sm font-bold text-[#0B192C]">No contacts found</p>
                                            <p className="text-xs text-slate-400">Try adjusting your search or filters</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredContacts.map((contact) => (
                                    <tr key={contact._id} className="hover:bg-slate-50/70 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-semibold text-[#0B192C]">{contact.name}</p>
                                                <p className="text-xs text-slate-500">{contact.email}</p>
                                                {contact.company && (
                                                    <p className="text-xs text-slate-400">{contact.company}</p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getInterestBadge(contact.interest)}`}>
                                                {contact.interest}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-slate-600 line-clamp-2 max-w-[200px]">
                                                {contact.message}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(contact.status)}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                                    contact.status === 'pending' ? 'bg-yellow-500' :
                                                    contact.status === 'contacted' ? 'bg-blue-500' :
                                                    contact.status === 'resolved' ? 'bg-green-500' :
                                                    'bg-red-500'
                                                }`} />
                                                {contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            {formatDateTime(contact.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => handleView(contact)}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                                                    title="View Details"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleStatusUpdate(contact)}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                                    title="Update Status"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(contact)}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                                    title="Delete"
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

            {/* ============================================ */}
            {/* VIEW MODAL */}
            {/* ============================================ */}
            {isViewModalOpen && selectedContact && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B192C]/40 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-200">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                            <div>
                                <h2 className="text-lg font-bold text-[#0B192C]">Contact Details</h2>
                                <p className="text-xs text-slate-500">Inquiry ID: {selectedContact.id}</p>
                            </div>
                            <button
                                onClick={() => {
                                    setIsViewModalOpen(false);
                                    setSelectedContact(null);
                                }}
                                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Status Badge */}
                            <div className="flex items-center gap-2">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadge(selectedContact.status)}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full mr-2 ${
                                        selectedContact.status === 'pending' ? 'bg-yellow-500' :
                                        selectedContact.status === 'contacted' ? 'bg-blue-500' :
                                        selectedContact.status === 'resolved' ? 'bg-green-500' :
                                        'bg-red-500'
                                    }`} />
                                    {selectedContact.status.charAt(0).toUpperCase() + selectedContact.status.slice(1)}
                                </span>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getInterestBadge(selectedContact.interest)}`}>
                                    {selectedContact.interest}
                                </span>
                            </div>

                            {/* Personal Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Name</span>
                                    <span className="font-semibold text-slate-800 block mt-1">{selectedContact.name}</span>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email</span>
                                    <span className="font-semibold text-slate-800 block mt-1">{selectedContact.email}</span>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Company</span>
                                    <span className="font-semibold text-slate-800 block mt-1">{selectedContact.company || 'N/A'}</span>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Interest</span>
                                    <span className="font-semibold text-slate-800 block mt-1">{selectedContact.interest}</span>
                                </div>
                            </div>

                            {/* Message */}
                            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Message</span>
                                <p className="text-sm text-slate-700 mt-1 leading-relaxed whitespace-pre-wrap">{selectedContact.message}</p>
                            </div>

                            {selectedContact.notes && (
                                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200/70">
                                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">Staff Notes</span>
                                    <p className="text-sm text-amber-800 mt-1">{selectedContact.notes}</p>
                                </div>
                            )}

                            {selectedContact.assignedTo && (
                                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Assigned To</span>
                                    <span className="font-semibold text-slate-800 block mt-1">{selectedContact.assignedTo}</span>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Created</span>
                                    <span className="text-sm text-slate-700 block mt-1">{formatDateTime(selectedContact.createdAt)}</span>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Last Updated</span>
                                    <span className="text-sm text-slate-700 block mt-1">{formatDateTime(selectedContact.updatedAt)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4 mt-5 border-t border-slate-100">
                            <button
                                onClick={() => {
                                    setIsViewModalOpen(false);
                                    handleStatusUpdate(selectedContact);
                                }}
                                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-colors"
                            >
                                Update Status
                            </button>
                            <button
                                onClick={() => setIsViewModalOpen(false)}
                                className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ============================================ */}
            {/* UPDATE STATUS MODAL */}
            {/* ============================================ */}
            {isStatusModalOpen && selectedContact && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B192C]/40 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-200">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                            <div>
                                <h2 className="text-lg font-bold text-[#0B192C]">Update Status</h2>
                                <p className="text-xs text-slate-500">Change the status of this inquiry</p>
                            </div>
                            <button
                                onClick={() => {
                                    setIsStatusModalOpen(false);
                                    setSelectedContact(null);
                                }}
                                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Status
                                </label>
                                <select
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value as Contact['status'])}
                                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all text-slate-800"
                                >
                                    {statusOptions.map((status) => (
                                        <option key={status} value={status}>
                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Notes (Optional)
                                </label>
                                <textarea
                                    value={statusNotes}
                                    onChange={(e) => setStatusNotes(e.target.value)}
                                    rows={3}
                                    placeholder="Add any notes about this status update..."
                                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all resize-none text-slate-800"
                                />
                            </div>

                            {selectedContact.notes && (
                                <div className="p-2 bg-amber-50 rounded-xl border border-amber-200">
                                    <span className="text-xs font-semibold text-amber-600">Previous Notes:</span>
                                    <p className="text-xs text-amber-700 mt-0.5">{selectedContact.notes}</p>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 pt-4 mt-5 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsStatusModalOpen(false);
                                    setSelectedContact(null);
                                }}
                                className="flex-1 px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-bold transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleUpdateStatus}
                                disabled={isSubmitting}
                                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
                            >
                                {isSubmitting ? 'Updating...' : 'Update Status'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ============================================ */}
            {/* DELETE MODAL */}
            {/* ============================================ */}
            {isDeleteModalOpen && selectedContact && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B192C]/40 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-slate-200 text-center">
                        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100 flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-[#0B192C]">Delete Contact</h3>
                        <p className="text-xs text-slate-500 mt-2 mb-3 leading-relaxed">
                            Are you sure you want to delete this inquiry from <span className="font-bold text-slate-800">{selectedContact.name}</span>?
                            This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setIsDeleteModalOpen(false);
                                    setSelectedContact(null);
                                }}
                                className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteContact}
                                disabled={isSubmitting}
                                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
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