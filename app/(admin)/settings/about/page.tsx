// app/(admin)/about/page.tsx
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
    Upload,
    ImageIcon,
    X
} from 'lucide-react';
import Image from 'next/image';
import { aboutAPI, AboutData } from '@/lib/api/about';
import ImageUpload from '@/components/Admin/ImageUpload';  // ✅ Import the component

// ============================================================================
// Default Empty About Data
// ============================================================================

const EMPTY_ABOUT_DATA: AboutData = {
    _id: '',
    header: {
        breadcrumbs: [
            { label: 'Home', link: '/' },
            { label: 'About Us' }
        ],
        imageUrl: '',
        title: '',
        description: ''
    },
    headerLabel: '',
    title: '',
    introParagraph1: '',
    introParagraph2: '',
    sidebarNav: [],
    stats: [],
    whoWeAre: {
        title: '',
        paragraph1: '',
        paragraph2: '',
        imageUrl: '',
        highlights: []
    },
    mission: {
        title: '',
        paragraph1: '',
        paragraph2: '',
        imageUrl: '',
        highlights: []
    },
    partners: [],
    timeline: [],
    isActive: true
};

// ============================================================================
// Main Component
// ============================================================================

export default function AboutAdminPage() {
    const { token } = useAuth();
    const [aboutData, setAboutData] = useState<AboutData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isNew, setIsNew] = useState(false);
    const [uploadingImage, setUploadingImage] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'content' | 'whoWeAre' | 'mission' | 'stats' | 'partners' | 'timeline'>('content');

    // ============================================================================
    // Fetch About Data
    // ============================================================================

    const fetchAboutData = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await aboutAPI.getActive();
            if (response.success && response.data) {
                setAboutData(response.data);
                setIsNew(false);
            } else {
                setAboutData(EMPTY_ABOUT_DATA);
                setIsNew(true);
            }
        } catch (error) {
            console.error('Error fetching about data:', error);
            setAboutData(EMPTY_ABOUT_DATA);
            setIsNew(true);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAboutData();
    }, [fetchAboutData]);

    // ============================================================================
    // Update Handlers
    // ============================================================================

    const updateField = (path: string, value: any) => {
        if (!aboutData) return;
        const newData = { ...aboutData };
        const keys = path.split('.');
        let current: any = newData;
        for (let i = 0; i < keys.length - 1; i++) {
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
        setAboutData(newData);
    };

    const updateStat = (index: number, field: string, value: any) => {
        if (!aboutData) return;
        const newStats = [...aboutData.stats];
        newStats[index] = { ...newStats[index], [field]: value };
        setAboutData({ ...aboutData, stats: newStats });
    };

    const addStat = () => {
        if (!aboutData) return;
        const newStat = { value: '', label: '', isActive: true };
        setAboutData({ ...aboutData, stats: [...aboutData.stats, newStat] });
    };

    const removeStat = (index: number) => {
        if (!aboutData) return;
        if (aboutData.stats.length === 1) {
            toast.error('You need at least one stat');
            return;
        }
        const newStats = aboutData.stats.filter((_, i) => i !== index);
        setAboutData({ ...aboutData, stats: newStats });
    };

    const updatePartner = (index: number, field: string, value: any) => {
        if (!aboutData) return;
        const newPartners = [...aboutData.partners];
        newPartners[index] = { ...newPartners[index], [field]: value };
        setAboutData({ ...aboutData, partners: newPartners });
    };

    const addPartner = () => {
        if (!aboutData) return;
        const newPartner = {
            name: '',
            logo: '',
            website: '',
            isActive: true,
            order: aboutData.partners.length
        };
        setAboutData({ ...aboutData, partners: [...aboutData.partners, newPartner] });
    };

    const removePartner = (index: number) => {
        if (!aboutData) return;
        const newPartners = aboutData.partners.filter((_, i) => i !== index);
        setAboutData({ ...aboutData, partners: newPartners });
    };

    const updateTimeline = (index: number, field: string, value: any) => {
        if (!aboutData) return;
        const newTimeline = [...aboutData.timeline];
        newTimeline[index] = { ...newTimeline[index], [field]: value };
        setAboutData({ ...aboutData, timeline: newTimeline });
    };

    const addTimeline = () => {
        if (!aboutData) return;
        const newItem = {
            year: '',
            title: '',
            description: '',
            isActive: true,
            order: aboutData.timeline.length
        };
        setAboutData({ ...aboutData, timeline: [...aboutData.timeline, newItem] });
    };

    const removeTimeline = (index: number) => {
        if (!aboutData) return;
        if (aboutData.timeline.length === 1) {
            toast.error('You need at least one timeline item');
            return;
        }
        const newTimeline = aboutData.timeline.filter((_, i) => i !== index);
        setAboutData({ ...aboutData, timeline: newTimeline });
    };

    const updateHighlight = (section: 'whoWeAre' | 'mission', index: number, value: string) => {
        if (!aboutData) return;
        const newData = { ...aboutData };
        const highlights = [...newData[section].highlights];
        highlights[index] = { ...highlights[index], text: value };
        newData[section].highlights = highlights;
        setAboutData(newData);
    };

    const addHighlight = (section: 'whoWeAre' | 'mission') => {
        if (!aboutData) return;
        const newData = { ...aboutData };
        newData[section].highlights = [...newData[section].highlights, { text: '', isActive: true }];
        setAboutData(newData);
    };

    const removeHighlight = (section: 'whoWeAre' | 'mission', index: number) => {
        if (!aboutData) return;
        const newData = { ...aboutData };
        newData[section].highlights = newData[section].highlights.filter((_, i) => i !== index);
        setAboutData(newData);
    };

    // ============================================================================
    // Image Upload Handlers
    // ============================================================================

    const handleImageUpload = async (type: string, file: File, partnerIndex?: number) => {
        if (!aboutData || !aboutData._id) {
            toast.error('Please save the about page first before uploading images');
            return;
        }

        setUploadingImage(type);
        const toastId = toast.loading(`Uploading ${type} image...`);

        try {
            let response;
            switch (type) {
                case 'header':
                    response = await aboutAPI.uploadHeaderImage(aboutData._id, file);
                    break;
                case 'whoWeAre':
                    response = await aboutAPI.uploadWhoWeAreImage(aboutData._id, file);
                    break;
                case 'mission':
                    response = await aboutAPI.uploadMissionImage(aboutData._id, file);
                    break;
                case 'partner':
                    if (partnerIndex === undefined) {
                        toast.error('Partner index is required', { id: toastId });
                        return;
                    }
                    response = await aboutAPI.uploadPartnerLogo(aboutData._id, partnerIndex, file);
                    break;
                default:
                    toast.error('Invalid upload type', { id: toastId });
                    return;
            }

            if (response.success && response.data) {
                setAboutData(response.data);
                toast.success(`${type} image uploaded successfully!`, { id: toastId });
            } else {
                toast.error(response.message || `Failed to upload ${type} image`, { id: toastId });
            }
        } catch (error) {
            console.error(`Error uploading ${type} image:`, error);
            toast.error(`Failed to upload ${type} image`, { id: toastId });
        } finally {
            setUploadingImage(null);
        }
    };

    // ============================================================================
    // Save Handler
    // ============================================================================

    const handleSave = async () => {
        if (!aboutData) return;

        setIsSaving(true);
        const toastId = toast.loading(isNew ? 'Creating about page...' : 'Saving about page...');

        try {
            let response;
            if (isNew || !aboutData._id) {
                const { _id, createdAt, updatedAt, ...createData } = aboutData;
                response = await aboutAPI.create(createData);
            } else {
                response = await aboutAPI.update(aboutData._id, aboutData);
            }

            if (response.success) {
                toast.success(isNew ? 'About page created successfully!' : 'About page updated successfully!', { id: toastId });
                setIsNew(false);
                await fetchAboutData();
            } else {
                toast.error(response.message || 'Failed to save about page', { id: toastId });
            }
        } catch (error) {
            console.error('Error saving about data:', error);
            toast.error('Failed to save about page', { id: toastId });
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
                    <p className="text-gray-500 text-sm mt-4">Loading about page...</p>
                </div>
            </div>
        );
    }

    if (!aboutData) {
        return (
            <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8">
                <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80">
                    <div className="text-6xl mb-4">📄</div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">No About Data</h2>
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
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">About Page</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        {isNew ? 'Create a new about page' : 'Manage the about page content.'}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchAboutData}
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
                                {isNew ? 'Create About Page' : 'Save Changes'}
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Status Banner */}
            {!isNew && aboutData._id && (
                <div className={`p-4 rounded-xl border ${aboutData.isActive ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {aboutData.isActive ? (
                                <Eye className="w-5 h-5 text-emerald-600" />
                            ) : (
                                <EyeOff className="w-5 h-5 text-slate-400" />
                            )}
                            <span className={`text-sm font-semibold ${aboutData.isActive ? 'text-emerald-700' : 'text-slate-500'}`}>
                                {aboutData.isActive ? 'Active' : 'Inactive'}
                            </span>
                            {aboutData.updatedAt && (
                                <span className="text-xs text-slate-400">
                                    Last updated: {new Date(aboutData.updatedAt).toLocaleString()}
                                </span>
                            )}
                        </div>
                        <button
                            onClick={async () => {
                                if (!aboutData._id) return;
                                try {
                                    const response = await aboutAPI.toggleStatus(aboutData._id);
                                    if (response.success) {
                                        toast.success(`About page ${response.data?.isActive ? 'activated' : 'deactivated'}`);
                                        await fetchAboutData();
                                    }
                                } catch (error) {
                                    toast.error('Failed to toggle status');
                                }
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${aboutData.isActive ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}
                        >
                            {aboutData.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="flex flex-wrap border-b border-slate-200 bg-white rounded-t-2xl px-6 pt-4 gap-1">
                <button
                    onClick={() => setActiveTab('content')}
                    className={`px-4 py-2.5 text-sm font-bold border-b-2 transition ${activeTab === 'content'
                            ? 'border-[#1b7936] text-[#1b7936]'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Content
                </button>
                <button
                    onClick={() => setActiveTab('whoWeAre')}
                    className={`px-4 py-2.5 text-sm font-bold border-b-2 transition ${activeTab === 'whoWeAre'
                            ? 'border-[#1b7936] text-[#1b7936]'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Who We Are
                </button>
                <button
                    onClick={() => setActiveTab('mission')}
                    className={`px-4 py-2.5 text-sm font-bold border-b-2 transition ${activeTab === 'mission'
                            ? 'border-[#1b7936] text-[#1b7936]'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Mission
                </button>
                <button
                    onClick={() => setActiveTab('stats')}
                    className={`px-4 py-2.5 text-sm font-bold border-b-2 transition ${activeTab === 'stats'
                            ? 'border-[#1b7936] text-[#1b7936]'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Stats ({aboutData.stats?.length || 0})
                </button>
                <button
                    onClick={() => setActiveTab('partners')}
                    className={`px-4 py-2.5 text-sm font-bold border-b-2 transition ${activeTab === 'partners'
                            ? 'border-[#1b7936] text-[#1b7936]'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Partners ({aboutData.partners?.length || 0})
                </button>
                <button
                    onClick={() => setActiveTab('timeline')}
                    className={`px-4 py-2.5 text-sm font-bold border-b-2 transition ${activeTab === 'timeline'
                            ? 'border-[#1b7936] text-[#1b7936]'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Timeline ({aboutData.timeline?.length || 0})
                </button>
            </div>

            {/* Content */}
            <div className="bg-white rounded-b-2xl rounded-t-none border border-t-0 border-slate-200/80 p-6 shadow-xs">
                {activeTab === 'content' && (
                    <div className="space-y-6">
                        {/* Header */}
                        <div className="border-b border-slate-100 pb-6">
                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Header</h3>

                            {/* Header Image Upload - Single */}
                            <div className="mb-4">
                                <ImageUpload
                                    label="Header Image"
                                    value={aboutData.header?.imageUrl || ''}
                                    onChange={(val) => updateField('header.imageUrl', val as string)}
                                    onAdd={async (files) => {
                                        if (files.length > 0) {
                                            await handleImageUpload('header', files[0]);
                                        }
                                    }}
                                    isUploading={uploadingImage === 'header'}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Header Title <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={aboutData.header?.title || ''}
                                        onChange={(e) => updateField('header.title', e.target.value)}
                                        placeholder="About EVNGEN"
                                        className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Header Label
                                    </label>
                                    <input
                                        type="text"
                                        value={aboutData.headerLabel || ''}
                                        onChange={(e) => updateField('headerLabel', e.target.value)}
                                        placeholder="ABOUT"
                                        className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Header Description <span className="text-rose-500">*</span>
                                    </label>
                                    <textarea
                                        value={aboutData.header?.description || ''}
                                        onChange={(e) => updateField('header.description', e.target.value)}
                                        rows={2}
                                        placeholder="Leading the transition to sustainable energy..."
                                        className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Main Title & Intro */}
                        <div>
                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Main Content</h3>
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Main Title <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={aboutData.title || ''}
                                        onChange={(e) => updateField('title', e.target.value)}
                                        placeholder="Engineering electric energy freedom"
                                        className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Intro Paragraph 1 <span className="text-rose-500">*</span>
                                    </label>
                                    <textarea
                                        value={aboutData.introParagraph1 || ''}
                                        onChange={(e) => updateField('introParagraph1', e.target.value)}
                                        rows={3}
                                        placeholder="EVNGEN is dedicated to controlling the movement of electric energy..."
                                        className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition resize-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Intro Paragraph 2 <span className="text-rose-500">*</span>
                                    </label>
                                    <textarea
                                        value={aboutData.introParagraph2 || ''}
                                        onChange={(e) => updateField('introParagraph2', e.target.value)}
                                        rows={3}
                                        placeholder="Our EV charging division designs and manufactures..."
                                        className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition resize-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'whoWeAre' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 gap-4">
                            {/* Who We Are Image - Single */}
                            <ImageUpload
                                label="Who We Are Image"
                                value={aboutData.whoWeAre?.imageUrl || ''}
                                onChange={(val) => updateField('whoWeAre.imageUrl', val as string)}
                                onAdd={async (files) => {
                                    if (files.length > 0) {
                                        await handleImageUpload('whoWeAre', files[0]);
                                    }
                                }}
                                isUploading={uploadingImage === 'whoWeAre'}
                            />

                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Title <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={aboutData.whoWeAre?.title || ''}
                                    onChange={(e) => updateField('whoWeAre.title', e.target.value)}
                                    placeholder="Who We Are"
                                    className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Paragraph 1 <span className="text-rose-500">*</span>
                                </label>
                                <textarea
                                    value={aboutData.whoWeAre?.paragraph1 || ''}
                                    onChange={(e) => updateField('whoWeAre.paragraph1', e.target.value)}
                                    rows={3}
                                    placeholder="Established as a pioneering provider..."
                                    className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Paragraph 2 <span className="text-rose-500">*</span>
                                </label>
                                <textarea
                                    value={aboutData.whoWeAre?.paragraph2 || ''}
                                    onChange={(e) => updateField('whoWeAre.paragraph2', e.target.value)}
                                    rows={3}
                                    placeholder="As a trusted leader in the green tech industry..."
                                    className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Highlights
                                </label>
                                {aboutData.whoWeAre?.highlights?.map((highlight, index) => (
                                    <div key={index} className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={highlight.text}
                                            onChange={(e) => updateHighlight('whoWeAre', index, e.target.value)}
                                            placeholder="Enter highlight text..."
                                            className="flex-1 px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition"
                                        />
                                        <button
                                            onClick={() => removeHighlight('whoWeAre', index)}
                                            className="p-2 text-rose-500 hover:text-rose-700"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    onClick={() => addHighlight('whoWeAre')}
                                    className="text-[#1b7936] text-sm font-bold hover:underline"
                                >
                                    + Add Highlight
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'mission' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 gap-4">
                            {/* Mission Image - Single */}
                            <ImageUpload
                                label="Mission Image"
                                value={aboutData.mission?.imageUrl || ''}
                                onChange={(val) => updateField('mission.imageUrl', val as string)}
                                onAdd={async (files) => {
                                    if (files.length > 0) {
                                        await handleImageUpload('mission', files[0]);
                                    }
                                }}
                                isUploading={uploadingImage === 'mission'}
                            />

                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Title <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={aboutData.mission?.title || ''}
                                    onChange={(e) => updateField('mission.title', e.target.value)}
                                    placeholder="Our Mission"
                                    className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Paragraph 1 <span className="text-rose-500">*</span>
                                </label>
                                <textarea
                                    value={aboutData.mission?.paragraph1 || ''}
                                    onChange={(e) => updateField('mission.paragraph1', e.target.value)}
                                    rows={3}
                                    placeholder="As one of the most trusted EV charger providers..."
                                    className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Paragraph 2 <span className="text-rose-500">*</span>
                                </label>
                                <textarea
                                    value={aboutData.mission?.paragraph2 || ''}
                                    onChange={(e) => updateField('mission.paragraph2', e.target.value)}
                                    rows={3}
                                    placeholder="To accelerate green mobility, we operate a robust digital network..."
                                    className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Highlights
                                </label>
                                {aboutData.mission?.highlights?.map((highlight, index) => (
                                    <div key={index} className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={highlight.text}
                                            onChange={(e) => updateHighlight('mission', index, e.target.value)}
                                            placeholder="Enter highlight text..."
                                            className="flex-1 px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition"
                                        />
                                        <button
                                            onClick={() => removeHighlight('mission', index)}
                                            className="p-2 text-rose-500 hover:text-rose-700"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    onClick={() => addHighlight('mission')}
                                    className="text-[#1b7936] text-sm font-bold hover:underline"
                                >
                                    + Add Highlight
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'stats' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Statistics</h3>
                            <button
                                onClick={addStat}
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#1b7936] hover:bg-[#155f2b] px-3 py-1.5 rounded-xl transition"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Add Stat
                            </button>
                        </div>

                        {aboutData.stats?.length === 0 ? (
                            <div className="text-center py-10 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                <p className="text-xs text-slate-400 font-medium">No stats configured. Click &quot;Add Stat&quot; to get started.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {aboutData.stats.map((stat, index) => (
                                    <div key={index} className="bg-slate-50/70 rounded-2xl p-4 border border-slate-200/80 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-slate-900">Stat #{index + 1}</span>
                                            <button
                                                onClick={() => removeStat(index)}
                                                className="p-1 text-slate-400 hover:text-rose-600 transition"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                                    Value <span className="text-rose-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={stat.value}
                                                    onChange={(e) => updateStat(index, 'value', e.target.value)}
                                                    placeholder="15+"
                                                    className="w-full px-3 py-1.5 text-black text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                                    Label <span className="text-rose-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={stat.label}
                                                    onChange={(e) => updateStat(index, 'label', e.target.value)}
                                                    placeholder="Years in Power Electronics"
                                                    className="w-full px-3 py-1.5 text-black text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'partners' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Partners</h3>
                            <button
                                onClick={addPartner}
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#1b7936] hover:bg-[#155f2b] px-3 py-1.5 rounded-xl transition"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Add Partner
                            </button>
                        </div>

                        {aboutData.partners?.length === 0 ? (
                            <div className="text-center py-10 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                <p className="text-xs text-slate-400 font-medium">No partners configured. Click &quot;Add Partner&quot; to get started.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {aboutData.partners.map((partner, index) => (
                                    <div key={index} className="bg-slate-50/70 rounded-2xl p-4 border border-slate-200/80 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-slate-900">Partner #{index + 1}</span>
                                            <button
                                                onClick={() => removePartner(index)}
                                                className="p-1 text-slate-400 hover:text-rose-600 transition"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>

                                        {/* Partner Logo Upload - Single */}
                                        <ImageUpload
                                            label="Partner Logo"
                                            value={partner.logo || ''}
                                            onChange={(val) => updatePartner(index, 'logo', val as string)}
                                            onAdd={async (files) => {
                                                if (files.length > 0) {
                                                    await handleImageUpload('partner', files[0], index);
                                                }
                                            }}
                                            isUploading={uploadingImage === `partner-${index}`}
                                        />

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                                    Name <span className="text-rose-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={partner.name}
                                                    onChange={(e) => updatePartner(index, 'name', e.target.value)}
                                                    placeholder="EcoDrive"
                                                    className="w-full px-3 py-1.5 text-black text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                                    Website (Optional)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={partner.website || ''}
                                                    onChange={(e) => updatePartner(index, 'website', e.target.value)}
                                                    placeholder="https://example.com"
                                                    className="w-full px-3 py-1.5 text-black text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'timeline' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Timeline</h3>
                            <button
                                onClick={addTimeline}
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#1b7936] hover:bg-[#155f2b] px-3 py-1.5 rounded-xl transition"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Add Event
                            </button>
                        </div>

                        {aboutData.timeline?.length === 0 ? (
                            <div className="text-center py-10 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                <p className="text-xs text-slate-400 font-medium">No timeline events configured. Click &quot;Add Event&quot; to get started.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {aboutData.timeline.map((item, index) => (
                                    <div key={index} className="bg-slate-50/70 rounded-2xl p-4 border border-slate-200/80 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-slate-900">Event #{index + 1}</span>
                                            <button
                                                onClick={() => removeTimeline(index)}
                                                className="p-1 text-slate-400 hover:text-rose-600 transition"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                                    Year <span className="text-rose-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={item.year}
                                                    onChange={(e) => updateTimeline(index, 'year', e.target.value)}
                                                    placeholder="2009"
                                                    className="w-full px-3 py-1.5 text-black text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                                    Title <span className="text-rose-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={item.title}
                                                    onChange={(e) => updateTimeline(index, 'title', e.target.value)}
                                                    placeholder="Company Founded"
                                                    className="w-full px-3 py-1.5 text-black text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition"
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                                    Description <span className="text-rose-500">*</span>
                                                </label>
                                                <textarea
                                                    value={item.description}
                                                    onChange={(e) => updateTimeline(index, 'description', e.target.value)}
                                                    rows={2}
                                                    placeholder="Started as a specialized power electronics consultancy..."
                                                    className="w-full px-3 py-1.5 text-black text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition resize-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}