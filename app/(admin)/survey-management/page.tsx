// app/(admin)/survey-management/page.tsx
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import { RefreshCw, Search } from 'lucide-react';

interface Survey {
    _id: string;
    id: string;
    name: string;
    phone: string;
    email: string;
    company: string;
    address: string;
    chargersCount: string;
    preferredDate: string | null;
    preferredTime: string;
    details: string;
    requestType: 'survey' | 'call';
    status: 'pending' | 'contacted' | 'scheduled' | 'completed' | 'cancelled';
    callPurpose: string;
    callDuration: string;
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
    scheduled: number;
    completed: number;
    cancelled: number;
    survey: number;
    call: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://evc-ngen-server.onrender.com/api';

export default function SurveyManagementPage() {
    const { token } = useAuth();
    const [surveys, setSurveys] = useState<Survey[]>([]);
    const [stats, setStats] = useState<Stats>({
        total: 0,
        pending: 0,
        contacted: 0,
        scheduled: 0,
        completed: 0,
        cancelled: 0,
        survey: 0,
        call: 0,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);

    // Modals
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterType, setFilterType] = useState('all');

    // Status update
    const [newStatus, setNewStatus] = useState<Survey['status']>('pending');
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
    // Fetch Surveys
    // ============================================
    const fetchSurveys = useCallback(async () => {
        if (!token) return;
        setIsLoading(true);
        try {
            const response = await apiCall('/surveys');
            if (response.success) {
                setSurveys(response.data || []);
                setStats(response.stats || {
                    total: 0,
                    pending: 0,
                    contacted: 0,
                    scheduled: 0,
                    completed: 0,
                    cancelled: 0,
                    survey: 0,
                    call: 0,
                });
            } else {
                toast.error(response.message || 'Failed to load surveys');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to load surveys');
        } finally {
            setIsLoading(false);
        }
    }, [token, apiCall]);

    useEffect(() => {
        fetchSurveys();
    }, [fetchSurveys]);

    // ============================================
    // Filter Logic
    // ============================================
    const filteredSurveys = useMemo(() => {
        const query = searchTerm.toLowerCase().trim();
        return surveys.filter((survey) => {
            const matchesSearch =
                !query ||
                survey.name.toLowerCase().includes(query) ||
                survey.email.toLowerCase().includes(query) ||
                survey.phone.includes(query) ||
                survey.company.toLowerCase().includes(query);
            const matchesStatus = filterStatus === 'all' || survey.status === filterStatus;
            const matchesType = filterType === 'all' || survey.requestType === filterType;
            return matchesSearch && matchesStatus && matchesType;
        });
    }, [surveys, searchTerm, filterStatus, filterType]);

    // ============================================
    // Delete Survey
    // ============================================
    const handleDeleteSurvey = async () => {
        if (!token || !selectedSurvey) return;
        setIsSubmitting(true);
        const toastId = toast.loading('Deleting survey...');

        try {
            const response = await apiCall(`/surveys/${selectedSurvey.id}`, {
                method: 'DELETE',
            });

            if (response.success) {
                await fetchSurveys();
                setIsDeleteModalOpen(false);
                setSelectedSurvey(null);
                toast.success('Survey deleted successfully!', { id: toastId });
            } else {
                toast.error(response.message || 'Failed to delete survey', { id: toastId });
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete survey', { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    // ============================================
    // Update Status
    // ============================================
    const handleUpdateStatus = async () => {
        if (!token || !selectedSurvey) return;
        setIsSubmitting(true);
        const toastId = toast.loading('Updating status...');

        try {
            const response = await apiCall(`/surveys/${selectedSurvey.id}/status`, {
                method: 'PUT',
                body: JSON.stringify({
                    status: newStatus,
                    notes: statusNotes || selectedSurvey.notes,
                }),
            });

            if (response.success) {
                await fetchSurveys();
                setIsStatusModalOpen(false);
                setSelectedSurvey(null);
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
    const handleView = (survey: Survey) => {
        setSelectedSurvey(survey);
        setIsViewModalOpen(true);
    };

    const handleDelete = (survey: Survey) => {
        setSelectedSurvey(survey);
        setIsDeleteModalOpen(true);
    };

    const handleStatusUpdate = (survey: Survey) => {
        setSelectedSurvey(survey);
        setNewStatus(survey.status);
        setStatusNotes(survey.notes || '');
        setIsStatusModalOpen(true);
    };

    // ============================================
    // Helper Functions
    // ============================================
    const getStatusBadge = (status: string) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            contacted: 'bg-blue-100 text-blue-800 border-blue-200',
            scheduled: 'bg-purple-100 text-purple-800 border-purple-200',
            completed: 'bg-green-100 text-green-800 border-green-200',
            cancelled: 'bg-red-100 text-red-800 border-red-200',
        };
        return colors[status as keyof typeof colors] || colors.pending;
    };

    const getTypeBadge = (type: string) => {
        return type === 'survey'
            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
            : 'bg-amber-100 text-amber-800 border-amber-200';
    };

    const formatDate = (dateString?: string | null) => {
        if (!dateString) return 'Not set';
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

    const statusOptions: Survey['status'][] = ['pending', 'contacted', 'scheduled', 'completed', 'cancelled'];

    return (
        <div className="space-y-6 container mx-auto pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0B192C]">
                        Survey & Call Management
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        Manage all site survey and consultation call requests
                    </p>
                </div>
                <button
                    onClick={() => fetchSurveys()}
                    className="inline-flex items-center justify-center gap-2 bg-[#0B192C] hover:bg-[#1E3E62] text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-[#0B192C]/10 transition-all"
                >
                     <RefreshCw className="w-5 h-5" />
                    Refresh
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
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
                <div className="bg-white border border-purple-200 rounded-2xl p-4 text-center shadow-xs">
                    <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider">Scheduled</span>
                    <p className="text-2xl font-bold text-purple-700 mt-1">{stats.scheduled}</p>
                </div>
                <div className="bg-white border border-green-200 rounded-2xl p-4 text-center shadow-xs">
                    <span className="text-xs font-semibold text-green-600 uppercase tracking-wider">Completed</span>
                    <p className="text-2xl font-bold text-green-700 mt-1">{stats.completed}</p>
                </div>
                <div className="bg-white border border-red-200 rounded-2xl p-4 text-center shadow-xs">
                    <span className="text-xs font-semibold text-red-600 uppercase tracking-wider">Cancelled</span>
                    <p className="text-2xl font-bold text-red-700 mt-1">{stats.cancelled}</p>
                </div>
                <div className="bg-white border border-emerald-200 rounded-2xl p-4 text-center shadow-xs">
                    <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Surveys</span>
                    <p className="text-2xl font-bold text-emerald-700 mt-1">{stats.survey}</p>
                </div>
                <div className="bg-white border border-amber-200 rounded-2xl p-4 text-center shadow-xs">
                    <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Calls</span>
                    <p className="text-2xl font-bold text-amber-700 mt-1">{stats.call}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="relative flex-1 min-w-[200px]">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                       <Search className="w-5 h-5" />
                    </span>
                    <input
                        type="text"
                        placeholder="Search by name, email, phone, or company..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 text-black py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/10 focus:border-[#0B192C] transition-all"
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
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                </select>

                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="text-sm px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/10 focus:border-[#0B192C] text-slate-700 font-medium transition-all"
                >
                    <option value="all">All Types</option>
                    <option value="survey">Site Surveys</option>
                    <option value="call">Consultation Calls</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                <th className="px-6 py-4">Request</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Contact</th>
                                <th className="px-6 py-4">Chargers</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Created</th>
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
                                                <div className="w-20 h-2.5 bg-slate-100 rounded" />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4"><div className="w-16 h-5 bg-slate-200 rounded-full" /></td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="w-24 h-3.5 bg-slate-200 rounded" />
                                                <div className="w-20 h-2.5 bg-slate-100 rounded" />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4"><div className="w-10 h-3.5 bg-slate-200 rounded" /></td>
                                        <td className="px-6 py-4"><div className="w-16 h-5 bg-slate-200 rounded-full" /></td>
                                        <td className="px-6 py-4"><div className="w-20 h-3.5 bg-slate-200 rounded" /></td>
                                        <td className="px-6 py-4"><div className="w-20 h-6 bg-slate-200 rounded ml-auto" /></td>
                                    </tr>
                                ))
                            ) : filteredSurveys.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-16 text-center">
                                        <div className="max-w-xs mx-auto text-center space-y-2">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-400 text-xl">
                                                📋
                                            </div>
                                            <p className="text-sm font-bold text-[#0B192C]">No requests found</p>
                                            <p className="text-xs text-slate-400">Try adjusting your search or filters</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredSurveys.map((survey) => (
                                    <tr key={survey._id} className="hover:bg-slate-50/70 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-semibold text-[#0B192C]">{survey.name}</p>
                                                {survey.company && (
                                                    <p className="text-xs text-slate-500">{survey.company}</p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTypeBadge(survey.requestType)}`}>
                                                {survey.requestType === 'survey' ? '📋 Survey' : '📞 Call'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="text-sm text-slate-700">{survey.email}</p>
                                                <p className="text-xs text-slate-400">{survey.phone}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {survey.chargersCount}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(survey.status)}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${survey.status === 'pending' ? 'bg-yellow-500' :
                                                        survey.status === 'contacted' ? 'bg-blue-500' :
                                                            survey.status === 'scheduled' ? 'bg-purple-500' :
                                                                survey.status === 'completed' ? 'bg-green-500' :
                                                                    'bg-red-500'
                                                    }`} />
                                                {survey.status.charAt(0).toUpperCase() + survey.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            {formatDateTime(survey.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => handleView(survey)}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                                                    title="View Details"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleStatusUpdate(survey)}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                                    title="Update Status"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(survey)}
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
            {isViewModalOpen && selectedSurvey && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B192C]/40 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-200">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                            <div>
                                <h2 className="text-lg font-bold text-[#0B192C]">
                                    {selectedSurvey.requestType === 'survey' ? 'Site Survey' : 'Consultation Call'} Details
                                </h2>
                                <p className="text-xs text-slate-500">Request ID: {selectedSurvey.id}</p>
                            </div>
                            <button
                                onClick={() => {
                                    setIsViewModalOpen(false);
                                    setSelectedSurvey(null);
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
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadge(selectedSurvey.status)}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full mr-2 ${selectedSurvey.status === 'pending' ? 'bg-yellow-500' :
                                            selectedSurvey.status === 'contacted' ? 'bg-blue-500' :
                                                selectedSurvey.status === 'scheduled' ? 'bg-purple-500' :
                                                    selectedSurvey.status === 'completed' ? 'bg-green-500' :
                                                        'bg-red-500'
                                        }`} />
                                    {selectedSurvey.status.charAt(0).toUpperCase() + selectedSurvey.status.slice(1)}
                                </span>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getTypeBadge(selectedSurvey.requestType)}`}>
                                    {selectedSurvey.requestType === 'survey' ? '📋 Survey' : '📞 Call'}
                                </span>
                            </div>

                            {/* Personal Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Name</span>
                                    <span className="font-semibold text-slate-800 block mt-1">{selectedSurvey.name}</span>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Phone</span>
                                    <span className="font-semibold text-slate-800 block mt-1">{selectedSurvey.phone}</span>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email</span>
                                    <span className="font-semibold text-slate-800 block mt-1">{selectedSurvey.email}</span>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Company</span>
                                    <span className="font-semibold text-slate-800 block mt-1">{selectedSurvey.company || 'N/A'}</span>
                                </div>
                            </div>

                            {/* Survey Specific Info */}
                            {selectedSurvey.requestType === 'survey' && (
                                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Site Address</span>
                                    <span className="font-semibold text-slate-800 block mt-1">{selectedSurvey.address || 'N/A'}</span>
                                </div>
                            )}

                            {/* Call Specific Info */}
                            {selectedSurvey.requestType === 'call' && (
                                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Call Purpose</span>
                                    <span className="font-semibold text-slate-800 block mt-1">{selectedSurvey.callPurpose || selectedSurvey.details || 'N/A'}</span>
                                </div>
                            )}

                            {/* Common Details */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Chargers</span>
                                    <span className="font-semibold text-slate-800 block mt-1">{selectedSurvey.chargersCount}</span>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Preferred Date</span>
                                    <span className="font-semibold text-slate-800 block mt-1">{formatDate(selectedSurvey.preferredDate)}</span>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Preferred Time</span>
                                    <span className="font-semibold text-slate-800 block mt-1">{selectedSurvey.preferredTime}</span>
                                </div>
                            </div>

                            {selectedSurvey.details && (
                                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Additional Details</span>
                                    <p className="text-sm text-slate-700 mt-1">{selectedSurvey.details}</p>
                                </div>
                            )}

                            {selectedSurvey.notes && (
                                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200/70">
                                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">Staff Notes</span>
                                    <p className="text-sm text-amber-800 mt-1">{selectedSurvey.notes}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Created</span>
                                    <span className="text-sm text-slate-700 block mt-1">{formatDateTime(selectedSurvey.createdAt)}</span>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Last Updated</span>
                                    <span className="text-sm text-slate-700 block mt-1">{formatDateTime(selectedSurvey.updatedAt)}</span>
                                </div>
                            </div>

                            {selectedSurvey.assignedTo && (
                                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Assigned To</span>
                                    <span className="font-semibold text-slate-800 block mt-1">{selectedSurvey.assignedTo}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 pt-4 mt-5 border-t border-slate-100">
                            <button
                                onClick={() => {
                                    setIsViewModalOpen(false);
                                    handleStatusUpdate(selectedSurvey);
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
            {isStatusModalOpen && selectedSurvey && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B192C]/40 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-200">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                            <div>
                                <h2 className="text-lg font-bold text-[#0B192C]">Update Status</h2>
                                <p className="text-xs text-slate-500">Change the status of this request</p>
                            </div>
                            <button
                                onClick={() => {
                                    setIsStatusModalOpen(false);
                                    setSelectedSurvey(null);
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
                                    onChange={(e) => setNewStatus(e.target.value as Survey['status'])}
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

                            {selectedSurvey.notes && (
                                <div className="p-2 bg-amber-50 rounded-xl border border-amber-200">
                                    <span className="text-xs font-semibold text-amber-600">Previous Notes:</span>
                                    <p className="text-xs text-amber-700 mt-0.5">{selectedSurvey.notes}</p>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 pt-4 mt-5 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsStatusModalOpen(false);
                                    setSelectedSurvey(null);
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
            {isDeleteModalOpen && selectedSurvey && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B192C]/40 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-slate-200 text-center">
                        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100 flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-[#0B192C]">Delete Request</h3>
                        <p className="text-xs text-slate-500 mt-2 mb-3 leading-relaxed">
                            Are you sure you want to delete this request from <span className="font-bold text-slate-800">{selectedSurvey.name}</span>?
                            This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setIsDeleteModalOpen(false);
                                    setSelectedSurvey(null);
                                }}
                                className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteSurvey}
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