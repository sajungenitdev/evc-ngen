// app/(admin)/settings/terms/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
    MoveDown
} from 'lucide-react';
import { termsAPI, TermsData, Section } from '@/lib/api/terms';
import ImageUpload from '@/components/Admin/ImageUpload';
import TextEditor from '@/components/Admin/TextEditor';

// ============================================================================
// Default Empty Terms Data
// ============================================================================

const EMPTY_TERMS_DATA: TermsData = {
    _id: '',
    header: {
        breadcrumbs: [
            { label: 'Home', link: '/' },
            { label: 'Terms & Conditions' }
        ],
        imageUrl: '',
        title: '',
        description: ''
    },
    lastUpdated: '',
    sections: [
        {
            heading: '',
            content: '',
            order: 0,
            isActive: true
        }
    ],
    isActive: true
};

// ============================================================================
// Main Component
// ============================================================================

export default function TermsAdminPage() {
    const { token } = useAuth();
    const [termsData, setTermsData] = useState<TermsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isNew, setIsNew] = useState(false);
    const [uploadingImage, setUploadingImage] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'content' | 'sections'>('content');

    // ============================================================================
    // Fetch Terms Data
    // ============================================================================

    const fetchTermsData = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await termsAPI.getActive();
            if (response.success && response.data) {
                setTermsData(response.data);
                setIsNew(false);
            } else {
                setTermsData(EMPTY_TERMS_DATA);
                setIsNew(true);
            }
        } catch (error) {
            console.error('Error fetching Terms data:', error);
            setTermsData(EMPTY_TERMS_DATA);
            setIsNew(true);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTermsData();
    }, [fetchTermsData]);

    // ============================================================================
    // Update Handlers
    // ============================================================================

    const updateField = (path: string, value: any) => {
        if (!termsData) return;
        const newData = { ...termsData };
        const keys = path.split('.');
        let current: any = newData;
        for (let i = 0; i < keys.length - 1; i++) {
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
        setTermsData(newData);
    };

    // app/(admin)/settings/terms/page.tsx

    const updateSection = useCallback((index: number, field: keyof Section, value: any) => {
        if (!termsData) return;
        setTermsData(prev => {
            if (!prev) return prev;
            const newSections = [...prev.sections];
            if (index >= 0 && index < newSections.length) {
                newSections[index] = { ...newSections[index], [field]: value };
                return { ...prev, sections: newSections };
            }
            return prev;
        });
    }, []);

    const addSection = async () => {
        if (!termsData) return;

        const newSection: Section = {
            heading: 'New Section',
            content: 'Enter section content here...',
            order: termsData.sections.length,
            isActive: true
        };

        const updatedSections = [...termsData.sections, newSection];

        setTermsData({
            ...termsData,
            sections: updatedSections
        });

        if (termsData._id) {
            try {
                const toastId = toast.loading('Adding section...');
                const updateData = { ...termsData, sections: updatedSections };
                delete (updateData as any)._id;
                delete (updateData as any).createdAt;
                delete (updateData as any).updatedAt;

                const response = await termsAPI.update(termsData._id, updateData);
                if (response.success && response.data) {
                    setTermsData(response.data);
                    toast.success('Section added!', { id: toastId });
                }
            } catch (error) {
                toast.error('Failed to add section');
            }
        }
    };

    const removeSection = async (index: number) => {
        if (!termsData) return;
        if (termsData.sections.length === 1) {
            toast.error('You need at least one section');
            return;
        }

        const newSections = termsData.sections.filter((_, i) => i !== index);
        setTermsData({ ...termsData, sections: newSections });

        if (termsData._id) {
            try {
                const updateData = { ...termsData, sections: newSections };
                delete (updateData as any)._id;
                delete (updateData as any).createdAt;
                delete (updateData as any).updatedAt;

                await termsAPI.update(termsData._id, updateData);
                toast.success('Section removed');
            } catch (error) {
                toast.error('Failed to remove section');
            }
        }
    };

    const moveSection = (index: number, direction: 'up' | 'down') => {
        if (!termsData) return;
        const newSections = [...termsData.sections];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newSections.length) return;
        [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
        setTermsData({ ...termsData, sections: newSections });
    };

    // ============================================================================
    // Image Upload Handlers
    // ============================================================================

    const handleImageUpload = async (file: File) => {
        if (!termsData || !termsData._id) {
            toast.error('Please save the page first before uploading images');
            return;
        }

        setUploadingImage('header');
        const toastId = toast.loading('Uploading header image...');

        try {
            const response = await termsAPI.uploadHeaderImage(termsData._id, file);
            if (response.success && response.data) {
                setTermsData(response.data);
                toast.success('Header image uploaded!', { id: toastId });
            } else {
                toast.error(response.message || 'Failed to upload image', { id: toastId });
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            toast.error('Failed to upload image', { id: toastId });
        } finally {
            setUploadingImage(null);
        }
    };

    const handleRemoveImage = async () => {
        if (!termsData || !termsData._id) return;

        const toastId = toast.loading('Removing image...');

        try {
            const response = await termsAPI.removeHeaderImage(termsData._id);
            if (response.success && response.data) {
                setTermsData(response.data);
                toast.success('Image removed!', { id: toastId });
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
        if (!termsData) return;

        setIsSaving(true);
        const toastId = toast.loading(isNew ? 'Creating Terms page...' : 'Saving Terms page...');

        try {
            let response;
            if (isNew || !termsData._id) {
                const { _id, createdAt, updatedAt, ...createData } = termsData;
                response = await termsAPI.create(createData);
            } else {
                const updateData = { ...termsData };
                delete (updateData as any)._id;
                delete (updateData as any).createdAt;
                delete (updateData as any).updatedAt;
                response = await termsAPI.update(termsData._id, updateData);
            }

            if (response.success) {
                toast.success(isNew ? 'Terms page created!' : 'Terms page updated!', { id: toastId });
                setIsNew(false);
                await fetchTermsData();
            } else {
                toast.error(response.message || 'Failed to save', { id: toastId });
            }
        } catch (error) {
            console.error('Error saving:', error);
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
                    <p className="text-gray-500 text-sm mt-4">Loading Terms page...</p>
                </div>
            </div>
        );
    }

    if (!termsData) {
        return (
            <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8">
                <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80">
                    <div className="text-6xl mb-4">📜</div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">No Terms Data</h2>
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
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Terms & Conditions Page</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        {isNew ? 'Create a new Terms page' : 'Manage the Terms & Conditions page content.'}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchTermsData}
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
                                {isNew ? 'Create Terms Page' : 'Save Changes'}
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Status Banner */}
            {!isNew && termsData._id && (
                <div className={`p-4 rounded-xl border ${termsData.isActive ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {termsData.isActive ? (
                                <Eye className="w-5 h-5 text-emerald-600" />
                            ) : (
                                <EyeOff className="w-5 h-5 text-slate-400" />
                            )}
                            <span className={`text-sm font-semibold ${termsData.isActive ? 'text-emerald-700' : 'text-slate-500'}`}>
                                {termsData.isActive ? 'Active' : 'Inactive'}
                            </span>
                            {termsData.updatedAt && (
                                <span className="text-xs text-slate-400">
                                    Last updated: {new Date(termsData.updatedAt).toLocaleString()}
                                </span>
                            )}
                        </div>
                        {/* <button
                            onClick={async () => {
                                if (!termsData._id) return;
                                try {
                                    const response = await termsAPI.toggleStatus(termsData._id);
                                    if (response.success) {
                                        toast.success(`Terms page ${response.data?.isActive ? 'activated' : 'deactivated'}`);
                                        await fetchTermsData();
                                    }
                                } catch (error) {
                                    toast.error('Failed to toggle status');
                                }
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${termsData.isActive ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}
                        >
                            {termsData.isActive ? 'Deactivate' : 'Activate'}
                        </button> */}
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
                    onClick={() => setActiveTab('sections')}
                    className={`px-4 py-2.5 text-sm font-bold border-b-2 transition ${activeTab === 'sections'
                            ? 'border-[#1b7936] text-[#1b7936]'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Sections ({termsData.sections?.length || 0})
                </button>
            </div>

            {/* Content */}
            <div className="bg-white rounded-b-2xl rounded-t-none border border-t-0 border-slate-200/80 p-6 shadow-xs">
                {activeTab === 'content' && (
                    <div className="space-y-6">
                        {/* Header Image Upload */}
                        <div>
                            <ImageUpload
                                label="Header Image"
                                value={termsData.header.imageUrl || ''}
                                onChange={(val) => updateField('header.imageUrl', val as string)}
                                onAdd={async (files) => {
                                    if (files.length > 0) {
                                        await handleImageUpload(files[0]);
                                    }
                                }}
                                onRemove={async () => {
                                    await handleRemoveImage();
                                }}
                                isUploading={uploadingImage === 'header'}
                                multiple={false}
                                maxSize={5}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Page Title <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={termsData.header.title || ''}
                                    onChange={(e) => updateField('header.title', e.target.value)}
                                    placeholder="Terms & Conditions"
                                    className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Page Description <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={termsData.header.description || ''}
                                    onChange={(e) => updateField('header.description', e.target.value)}
                                    placeholder="Review our terms of service..."
                                    className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Last Updated Text
                            </label>
                            <input
                                type="text"
                                value={termsData.lastUpdated || ''}
                                onChange={(e) => updateField('lastUpdated', e.target.value)}
                                placeholder="Last Updated: September 1, 2026"
                                className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition"
                            />
                        </div>
                    </div>
                )}

                {activeTab === 'sections' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Sections</h3>
                            <button
                                onClick={addSection}
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#1b7936] hover:bg-[#155f2b] px-3 py-1.5 rounded-xl transition"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Add Section
                            </button>
                        </div>

                        {termsData.sections?.length === 0 ? (
                            <div className="text-center py-10 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                <p className="text-xs text-slate-400 font-medium">No sections configured. Click &quot;Add Section&quot; to get started.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {termsData.sections.map((section, index) => (
                                    <div key={index} className="bg-slate-50/70 rounded-2xl p-4 border border-slate-200/80 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-slate-900">Section #{index + 1}</span>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full ${section.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                                                    {section.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => moveSection(index, 'up')}
                                                    disabled={index === 0}
                                                    className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                                                >
                                                    <MoveUp className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => moveSection(index, 'down')}
                                                    disabled={index === termsData.sections.length - 1}
                                                    className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                                                >
                                                    <MoveDown className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => removeSection(index)}
                                                    className="p-1 text-slate-400 hover:text-rose-600 transition"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-3">
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                                    Heading <span className="text-rose-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={section.heading}
                                                    onChange={(e) => updateSection(index, 'heading', e.target.value)}
                                                    placeholder="e.g., 1. Acceptance of Terms"
                                                    className="w-full px-3 py-1.5 text-sm text-black bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                                    Content <span className="text-rose-500">*</span>
                                                </label>
                                                <TextEditor
                                                    value={section.content}
                                                    onChange={(val) => updateSection(index, 'content', val)}
                                                    placeholder="Enter the section content..."
                                                    minHeight={150}
                                                    label=""
                                                />
                                            </div>
                                            <div className="flex items-center gap-2 pt-2">
                                                <input
                                                    type="checkbox"
                                                    checked={section.isActive}
                                                    onChange={(e) => updateSection(index, 'isActive', e.target.checked)}
                                                    className="w-4 h-4 rounded border-slate-300 text-[#1b7936] focus:ring-[#1b7936]"
                                                />
                                                <label className="text-xs font-semibold text-slate-700 cursor-pointer">
                                                    Active
                                                </label>
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