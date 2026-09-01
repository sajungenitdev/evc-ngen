// app/(admin)/settings/help-support/page.tsx
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import {
    Loader2,
    Save,
    RefreshCw,
    Eye,
    EyeOff,
    Plus,
    Trash2,
    MoveUp,
    MoveDown,
    Upload,
    ImageIcon
} from 'lucide-react';
import { helpSupportAPI, HelpSupportData, SalesCard, TicketCard, SupportHubCard, ReviewCard, SocialCard, Social } from '@/lib/api/helpSupport';
import ImageUpload from '@/components/Admin/ImageUpload';

// ============================================================================
// Default Empty Help Support Data
// ============================================================================

const EMPTY_HELP_DATA: HelpSupportData = {
    _id: '',
    salesCard: {
        status: '',
        title: '',
        highlightText: '',
        buttonText: '',
        phoneLink: '',
        imageUrl: '',
        isActive: true
    },
    ticketCard: {
        description: '',
        linkText: 'Raise a Ticket →',
        link: '/contact',
        imageUrl: '',
        isActive: true
    },
    supportHubCard: {
        description: '',
        linkText: 'Visit our Support Hub →',
        link: '/faq',
        imageUrl: '',
        isActive: true
    },
    reviewCard: {
        description: '',
        linkText: 'Leave a Review →',
        link: '/contact',
        imageUrl: '',
        isActive: true
    },
    socialCard: {
        title: 'Stay connected',
        imageUrl: '',
        socials: [
            { name: 'X', link: 'https://twitter.com', isActive: true },
            { name: 'in', link: 'https://linkedin.com', isActive: true },
            { name: 'f', link: 'https://facebook.com', isActive: true }
        ],
        isActive: true
    },
    isActive: true,
    sectionId: 'help-support'
};

// ============================================================================
// Main Component
// ============================================================================

export default function HelpSupportAdminPage() {
    const { token } = useAuth();
    const [helpData, setHelpData] = useState<HelpSupportData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isNew, setIsNew] = useState(false);
    const [uploadingType, setUploadingType] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'sales' | 'ticket' | 'support' | 'review' | 'social'>('sales');

    // ============================================================================
    // Fetch Help Support Data
    // ============================================================================

    const fetchHelpData = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await helpSupportAPI.getActive();
            if (response.success && response.data) {
                setHelpData(response.data);
                setIsNew(false);
            } else {
                setHelpData(EMPTY_HELP_DATA);
                setIsNew(true);
            }
        } catch (error) {
            console.error('Error fetching help data:', error);
            setHelpData(EMPTY_HELP_DATA);
            setIsNew(true);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchHelpData();
    }, [fetchHelpData]);

    // ============================================================================
    // Update Handlers
    // ============================================================================

    const updateField = (path: string, value: any) => {
        if (!helpData) return;
        const newData = { ...helpData };
        const keys = path.split('.');
        let current: any = newData;
        for (let i = 0; i < keys.length - 1; i++) {
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
        setHelpData(newData);
    };

    const updateSalesCard = (field: keyof SalesCard, value: any) => {
        if (!helpData) return;
        setHelpData({
            ...helpData,
            salesCard: { ...helpData.salesCard, [field]: value }
        });
    };

    const updateTicketCard = (field: keyof TicketCard, value: any) => {
        if (!helpData) return;
        setHelpData({
            ...helpData,
            ticketCard: { ...helpData.ticketCard, [field]: value }
        });
    };

    const updateSupportHubCard = (field: keyof SupportHubCard, value: any) => {
        if (!helpData) return;
        setHelpData({
            ...helpData,
            supportHubCard: { ...helpData.supportHubCard, [field]: value }
        });
    };

    const updateReviewCard = (field: keyof ReviewCard, value: any) => {
        if (!helpData) return;
        setHelpData({
            ...helpData,
            reviewCard: { ...helpData.reviewCard, [field]: value }
        });
    };

    const updateSocialCard = (field: keyof SocialCard, value: any) => {
        if (!helpData) return;
        setHelpData({
            ...helpData,
            socialCard: { ...helpData.socialCard, [field]: value }
        });
    };

    const updateSocial = (index: number, field: keyof Social, value: any) => {
        if (!helpData) return;
        const newSocials = [...helpData.socialCard.socials];
        newSocials[index] = { ...newSocials[index], [field]: value };
        setHelpData({
            ...helpData,
            socialCard: { ...helpData.socialCard, socials: newSocials }
        });
    };

    const addSocial = () => {
        if (!helpData) return;
        const newSocial: Social = {
            name: 'X',
            link: 'https://twitter.com',
            isActive: true
        };
        setHelpData({
            ...helpData,
            socialCard: {
                ...helpData.socialCard,
                socials: [...helpData.socialCard.socials, newSocial]
            }
        });
    };

    const removeSocial = (index: number) => {
        if (!helpData) return;
        if (helpData.socialCard.socials.length === 1) {
            toast.error('You need at least one social link');
            return;
        }
        const newSocials = helpData.socialCard.socials.filter((_, i) => i !== index);
        setHelpData({
            ...helpData,
            socialCard: { ...helpData.socialCard, socials: newSocials }
        });
    };

    // ============================================================================
    // Image Upload Handlers
    // ============================================================================

    const handleImageUpload = async (type: string, file: File) => {
        if (!helpData || !helpData._id) {
            toast.error('Please save the section first before uploading images');
            return;
        }

        setUploadingType(type);
        const toastId = toast.loading(`Uploading ${type} image...`);

        try {
            let response;
            switch (type) {
                case 'sales':
                    response = await helpSupportAPI.uploadSalesImage(helpData._id, file);
                    break;
                case 'ticket':
                    response = await helpSupportAPI.uploadTicketImage(helpData._id, file);
                    break;
                case 'support':
                    response = await helpSupportAPI.uploadSupportImage(helpData._id, file);
                    break;
                case 'review':
                    response = await helpSupportAPI.uploadReviewImage(helpData._id, file);
                    break;
                case 'social':
                    response = await helpSupportAPI.uploadSocialImage(helpData._id, file);
                    break;
                default:
                    toast.error('Invalid upload type', { id: toastId });
                    return;
            }

            if (response.success && response.data) {
                setHelpData(response.data);
                toast.success(`${type} image uploaded successfully!`, { id: toastId });
            } else {
                toast.error(response.message || `Failed to upload ${type} image`, { id: toastId });
            }
        } catch (error) {
            console.error(`Error uploading ${type} image:`, error);
            toast.error(`Failed to upload ${type} image`, { id: toastId });
        } finally {
            setUploadingType(null);
        }
    };

    const handleRemoveImage = async (cardType: string) => {
        if (!helpData || !helpData._id) return;

        const toastId = toast.loading('Removing image...');

        try {
            const response = await helpSupportAPI.removeImage(helpData._id, cardType);
            if (response.success && response.data) {
                setHelpData(response.data);
                toast.success('Image removed successfully!', { id: toastId });
            } else {
                toast.error(response.message || 'Failed to remove image', { id: toastId });
            }
        } catch (error) {
            console.error('Error removing image:', error);
            toast.error('Failed to remove image', { id: toastId });
        }
    };

    // ============================================================================
    // Save Handler
    // ============================================================================

    const handleSave = async () => {
        if (!helpData) return;

        setIsSaving(true);
        const toastId = toast.loading(isNew ? 'Creating help support section...' : 'Saving help support section...');

        try {
            let response;
            if (isNew || !helpData._id) {
                const { _id, createdAt, updatedAt, ...createData } = helpData;
                response = await helpSupportAPI.create(createData);
            } else {
                const updateData = { ...helpData };
                delete (updateData as any)._id;
                delete (updateData as any).createdAt;
                delete (updateData as any).updatedAt;
                response = await helpSupportAPI.update(helpData._id, updateData);
            }

            if (response.success) {
                toast.success(isNew ? 'Help support section created!' : 'Help support section updated!', { id: toastId });
                setIsNew(false);
                await fetchHelpData();
            } else {
                toast.error(response.message || 'Failed to save', { id: toastId });
            }
        } catch (error) {
            console.error('Error saving help support:', error);
            toast.error('Failed to save', { id: toastId });
        } finally {
            setIsSaving(false);
        }
    };

    // ============================================================================
    // Loading State
    // ============================================================================

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-[#1b7936] animate-spin mx-auto" />
                    <p className="text-gray-500 text-sm mt-4">Loading help support section...</p>
                </div>
            </div>
        );
    }

    if (!helpData) {
        return (
            <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8">
                <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80">
                    <div className="text-6xl mb-4">🆘</div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">No Help Support Data</h2>
                    <p className="text-sm text-slate-500">Please refresh the page or contact support.</p>
                </div>
            </div>
        );
    }

    // ============================================================================
    // Render
    // ============================================================================

    return (
        <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Help & Support Section</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        {isNew ? 'Create a new help support section' : 'Manage the help support section content for your homepage.'}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchHelpData}
                        className="p-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 transition"
                        title="Refresh"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="inline-flex items-center gap-2 bg-[#1b7936] hover:bg-[#155f2b] text-white px-5 py-2.5 rounded-xl text-sm font-bold transition disabled:opacity-50 shadow-xs hover:shadow"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                {isNew ? 'Creating...' : 'Saving...'}
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                {isNew ? 'Create Help Section' : 'Save Changes'}
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Status Banner */}
            {!isNew && helpData._id && (
                <div className={`p-4 rounded-xl border ${helpData.isActive ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {helpData.isActive ? (
                                <Eye className="w-5 h-5 text-emerald-600" />
                            ) : (
                                <EyeOff className="w-5 h-5 text-slate-400" />
                            )}
                            <span className={`text-sm font-semibold ${helpData.isActive ? 'text-emerald-700' : 'text-slate-500'}`}>
                                {helpData.isActive ? 'Active' : 'Inactive'}
                            </span>
                            {helpData.updatedAt && (
                                <span className="text-xs text-slate-400">
                                    Last updated: {new Date(helpData.updatedAt).toLocaleString()}
                                </span>
                            )}
                        </div>
                        <button
                            onClick={async () => {
                                if (!helpData._id) return;
                                try {
                                    const response = await helpSupportAPI.toggleStatus(helpData._id);
                                    if (response.success) {
                                        toast.success(`Help support section ${response.data?.isActive ? 'activated' : 'deactivated'}`);
                                        await fetchHelpData();
                                    }
                                } catch (error) {
                                    toast.error('Failed to toggle status');
                                }
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${helpData.isActive ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}
                        >
                            {helpData.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="flex flex-wrap border-b border-slate-200 bg-white rounded-t-2xl px-6 pt-4 gap-1">
                <button
                    onClick={() => setActiveTab('sales')}
                    className={`px-4 py-2.5 text-sm font-bold border-b-2 transition ${
                        activeTab === 'sales'
                            ? 'border-[#1b7936] text-[#1b7936]'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                >
                    Sales Card
                </button>
                <button
                    onClick={() => setActiveTab('ticket')}
                    className={`px-4 py-2.5 text-sm font-bold border-b-2 transition ${
                        activeTab === 'ticket'
                            ? 'border-[#1b7936] text-[#1b7936]'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                >
                    Ticket Card
                </button>
                <button
                    onClick={() => setActiveTab('support')}
                    className={`px-4 py-2.5 text-sm font-bold border-b-2 transition ${
                        activeTab === 'support'
                            ? 'border-[#1b7936] text-[#1b7936]'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                >
                    Support Hub
                </button>
                <button
                    onClick={() => setActiveTab('review')}
                    className={`px-4 py-2.5 text-sm font-bold border-b-2 transition ${
                        activeTab === 'review'
                            ? 'border-[#1b7936] text-[#1b7936]'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                >
                    Review Card
                </button>
                <button
                    onClick={() => setActiveTab('social')}
                    className={`px-4 py-2.5 text-sm font-bold border-b-2 transition ${
                        activeTab === 'social'
                            ? 'border-[#1b7936] text-[#1b7936]'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                >
                    Social Card ({helpData.socialCard?.socials?.length || 0})
                </button>
            </div>

            {/* Content */}
            <div className="bg-white rounded-b-2xl rounded-t-none border border-t-0 border-slate-200/80 p-6 shadow-xs">
                {activeTab === 'sales' && (
                    <div className="space-y-6">
                        <div>
                            <ImageUpload
                                label="Sales Card Image"
                                value={helpData.salesCard.imageUrl || ''}
                                onChange={(val) => updateSalesCard('imageUrl', val as string)}
                                onAdd={async (files) => {
                                    if (files.length > 0) {
                                        await handleImageUpload('sales', files[0]);
                                    }
                                }}
                                onRemove={async () => {
                                    await handleRemoveImage('sales');
                                }}
                                isUploading={uploadingType === 'sales'}
                                multiple={false}
                                maxSize={5}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Status <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={helpData.salesCard.status || ''}
                                    onChange={(e) => updateSalesCard('status', e.target.value)}
                                    placeholder="Sales Team Online"
                                    className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Phone Link
                                </label>
                                <input
                                    type="text"
                                    value={helpData.salesCard.phoneLink || ''}
                                    onChange={(e) => updateSalesCard('phoneLink', e.target.value)}
                                    placeholder="18005550199"
                                    className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Title <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={helpData.salesCard.title || ''}
                                    onChange={(e) => updateSalesCard('title', e.target.value)}
                                    placeholder="Need help choosing a charger?"
                                    className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Highlight Text <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={helpData.salesCard.highlightText || ''}
                                    onChange={(e) => updateSalesCard('highlightText', e.target.value)}
                                    placeholder="Talk to our team."
                                    className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Button Text <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={helpData.salesCard.buttonText || ''}
                                    onChange={(e) => updateSalesCard('buttonText', e.target.value)}
                                    placeholder="Call +1 (800) 555-0199"
                                    className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                            <input
                                type="checkbox"
                                checked={helpData.salesCard.isActive}
                                onChange={(e) => updateSalesCard('isActive', e.target.checked)}
                                className="w-4 h-4 rounded border-slate-300 text-[#1b7936] focus:ring-[#1b7936]"
                            />
                            <label className="text-xs font-semibold text-slate-700 cursor-pointer">
                                Sales Card Active
                            </label>
                        </div>
                    </div>
                )}

                {activeTab === 'ticket' && (
                    <div className="space-y-6">
                        <div>
                            <ImageUpload
                                label="Ticket Card Image"
                                value={helpData.ticketCard.imageUrl || ''}
                                onChange={(val) => updateTicketCard('imageUrl', val as string)}
                                onAdd={async (files) => {
                                    if (files.length > 0) {
                                        await handleImageUpload('ticket', files[0]);
                                    }
                                }}
                                onRemove={async () => {
                                    await handleRemoveImage('ticket');
                                }}
                                isUploading={uploadingType === 'ticket'}
                                multiple={false}
                                maxSize={5}
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Description <span className="text-rose-500">*</span>
                            </label>
                            <textarea
                                value={helpData.ticketCard.description || ''}
                                onChange={(e) => updateTicketCard('description', e.target.value)}
                                rows={3}
                                placeholder="Need something else? Raise a ticket and we'll get back to you."
                                className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Link Text
                                </label>
                                <input
                                    type="text"
                                    value={helpData.ticketCard.linkText || ''}
                                    onChange={(e) => updateTicketCard('linkText', e.target.value)}
                                    placeholder="Raise a Ticket →"
                                    className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Link URL
                                </label>
                                <input
                                    type="text"
                                    value={helpData.ticketCard.link || ''}
                                    onChange={(e) => updateTicketCard('link', e.target.value)}
                                    placeholder="/contact"
                                    className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                            <input
                                type="checkbox"
                                checked={helpData.ticketCard.isActive}
                                onChange={(e) => updateTicketCard('isActive', e.target.checked)}
                                className="w-4 h-4 rounded border-slate-300 text-[#1b7936] focus:ring-[#1b7936]"
                            />
                            <label className="text-xs font-semibold text-slate-700 cursor-pointer">
                                Ticket Card Active
                            </label>
                        </div>
                    </div>
                )}

                {activeTab === 'support' && (
                    <div className="space-y-6">
                        <div>
                            <ImageUpload
                                label="Support Hub Card Image"
                                value={helpData.supportHubCard.imageUrl || ''}
                                onChange={(val) => updateSupportHubCard('imageUrl', val as string)}
                                onAdd={async (files) => {
                                    if (files.length > 0) {
                                        await handleImageUpload('support', files[0]);
                                    }
                                }}
                                onRemove={async () => {
                                    await handleRemoveImage('support');
                                }}
                                isUploading={uploadingType === 'support'}
                                multiple={false}
                                maxSize={5}
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Description <span className="text-rose-500">*</span>
                            </label>
                            <textarea
                                value={helpData.supportHubCard.description || ''}
                                onChange={(e) => updateSupportHubCard('description', e.target.value)}
                                rows={3}
                                placeholder="Find answers, guides, and advice, all in one place"
                                className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Link Text
                                </label>
                                <input
                                    type="text"
                                    value={helpData.supportHubCard.linkText || ''}
                                    onChange={(e) => updateSupportHubCard('linkText', e.target.value)}
                                    placeholder="Visit our Support Hub →"
                                    className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Link URL
                                </label>
                                <input
                                    type="text"
                                    value={helpData.supportHubCard.link || ''}
                                    onChange={(e) => updateSupportHubCard('link', e.target.value)}
                                    placeholder="/faq"
                                    className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                            <input
                                type="checkbox"
                                checked={helpData.supportHubCard.isActive}
                                onChange={(e) => updateSupportHubCard('isActive', e.target.checked)}
                                className="w-4 h-4 rounded border-slate-300 text-[#1b7936] focus:ring-[#1b7936]"
                            />
                            <label className="text-xs font-semibold text-slate-700 cursor-pointer">
                                Support Hub Card Active
                            </label>
                        </div>
                    </div>
                )}

                {activeTab === 'review' && (
                    <div className="space-y-6">
                        <div>
                            <ImageUpload
                                label="Review Card Image"
                                value={helpData.reviewCard.imageUrl || ''}
                                onChange={(val) => updateReviewCard('imageUrl', val as string)}
                                onAdd={async (files) => {
                                    if (files.length > 0) {
                                        await handleImageUpload('review', files[0]);
                                    }
                                }}
                                onRemove={async () => {
                                    await handleRemoveImage('review');
                                }}
                                isUploading={uploadingType === 'review'}
                                multiple={false}
                                maxSize={5}
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Description <span className="text-rose-500">*</span>
                            </label>
                            <textarea
                                value={helpData.reviewCard.description || ''}
                                onChange={(e) => updateReviewCard('description', e.target.value)}
                                rows={3}
                                placeholder="Help us continue to improve our network"
                                className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Link Text
                                </label>
                                <input
                                    type="text"
                                    value={helpData.reviewCard.linkText || ''}
                                    onChange={(e) => updateReviewCard('linkText', e.target.value)}
                                    placeholder="Leave a Review →"
                                    className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Link URL
                                </label>
                                <input
                                    type="text"
                                    value={helpData.reviewCard.link || ''}
                                    onChange={(e) => updateReviewCard('link', e.target.value)}
                                    placeholder="/contact"
                                    className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                            <input
                                type="checkbox"
                                checked={helpData.reviewCard.isActive}
                                onChange={(e) => updateReviewCard('isActive', e.target.checked)}
                                className="w-4 h-4 rounded border-slate-300 text-[#1b7936] focus:ring-[#1b7936]"
                            />
                            <label className="text-xs font-semibold text-slate-700 cursor-pointer">
                                Review Card Active
                            </label>
                        </div>
                    </div>
                )}

                {activeTab === 'social' && (
                    <div className="space-y-6">
                        <div>
                            <ImageUpload
                                label="Social Card Image"
                                value={helpData.socialCard.imageUrl || ''}
                                onChange={(val) => updateSocialCard('imageUrl', val as string)}
                                onAdd={async (files) => {
                                    if (files.length > 0) {
                                        await handleImageUpload('social', files[0]);
                                    }
                                }}
                                onRemove={async () => {
                                    await handleRemoveImage('social');
                                }}
                                isUploading={uploadingType === 'social'}
                                multiple={false}
                                maxSize={5}
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Title <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={helpData.socialCard.title || ''}
                                onChange={(e) => updateSocialCard('title', e.target.value)}
                                placeholder="Stay connected"
                                className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition"
                            />
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                            <input
                                type="checkbox"
                                checked={helpData.socialCard.isActive}
                                onChange={(e) => updateSocialCard('isActive', e.target.checked)}
                                className="w-4 h-4 rounded border-slate-300 text-[#1b7936] focus:ring-[#1b7936]"
                            />
                            <label className="text-xs font-semibold text-slate-700 cursor-pointer">
                                Social Card Active
                            </label>
                        </div>

                        <div className="border-t border-slate-100 pt-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Social Links</h3>
                                <button
                                    onClick={addSocial}
                                    className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#1b7936] hover:bg-[#155f2b] px-3 py-1.5 rounded-xl transition"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    Add Social
                                </button>
                            </div>

                            {helpData.socialCard.socials.map((social, index) => (
                                <div key={index} className="bg-slate-50/70 rounded-2xl p-4 border border-slate-200/80 space-y-3 mb-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-900">Social #{index + 1}</span>
                                        <button
                                            onClick={() => removeSocial(index)}
                                            className="p-1 text-slate-400 hover:text-rose-600 transition"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                                Platform
                                            </label>
                                            <select
                                                value={social.name}
                                                onChange={(e) => updateSocial(index, 'name', e.target.value)}
                                                className="w-full px-3 py-1.5 text-sm text-black bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition"
                                            >
                                                <option value="X">X (Twitter)</option>
                                                <option value="in">LinkedIn</option>
                                                <option value="f">Facebook</option>
                                                <option value="Instagram">Instagram</option>
                                                <option value="YouTube">YouTube</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                                Link URL <span className="text-rose-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={social.link}
                                                onChange={(e) => updateSocial(index, 'link', e.target.value)}
                                                placeholder="https://twitter.com"
                                                className="w-full px-3 py-1.5 text-sm text-black bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={social.isActive}
                                            onChange={(e) => updateSocial(index, 'isActive', e.target.checked)}
                                            className="w-4 h-4 rounded border-slate-300 text-[#1b7936] focus:ring-[#1b7936]"
                                        />
                                        <label className="text-xs font-semibold text-slate-700 cursor-pointer">
                                            Active
                                        </label>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}