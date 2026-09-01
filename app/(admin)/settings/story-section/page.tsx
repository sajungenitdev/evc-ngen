// app/(admin)/settings/stories/page.tsx
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
import { storiesAPI, StoriesData, Category, MainStory } from '@/lib/api/stories';
import ImageUpload from '@/components/Admin/ImageUpload';

// ============================================================================
// Default Empty Stories Data
// ============================================================================

const EMPTY_STORIES_DATA: StoriesData = {
    _id: '',
    heading: '',
    subtitle: '',
    mainStory: {
        quote: '',
        linkText: 'See All Deployment Stories →',
        link: '/stories',
        imageUrl: '',
        isActive: true
    },
    categories: [
        {
            title: '',
            imageUrl: '',
            link: '/solutions',
            order: 0,
            isActive: true
        }
    ],
    isActive: true,
    backgroundColor: '#ffffff',
    textColor: '#071322',
    sectionId: 'stories'
};

// ============================================================================
// Main Component
// ============================================================================

export default function StoriesAdminPage() {
    const { token } = useAuth();
    const [storiesData, setStoriesData] = useState<StoriesData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isNew, setIsNew] = useState(false);
    const [uploadingType, setUploadingType] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'content' | 'mainStory' | 'categories'>('content');

    // ============================================================================
    // Fetch Stories Data
    // ============================================================================

    const fetchStoriesData = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await storiesAPI.getActive();
            if (response.success && response.data) {
                setStoriesData(response.data);
                setIsNew(false);
            } else {
                setStoriesData(EMPTY_STORIES_DATA);
                setIsNew(true);
            }
        } catch (error) {
            console.error('Error fetching stories data:', error);
            setStoriesData(EMPTY_STORIES_DATA);
            setIsNew(true);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStoriesData();
    }, [fetchStoriesData]);

    // ============================================================================
    // Update Handlers
    // ============================================================================

    const updateField = (path: string, value: any) => {
        if (!storiesData) return;
        const newData = { ...storiesData };
        const keys = path.split('.');
        let current: any = newData;
        for (let i = 0; i < keys.length - 1; i++) {
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
        setStoriesData(newData);
    };

    const updateMainStory = (field: keyof MainStory, value: any) => {
        if (!storiesData) return;
        setStoriesData({
            ...storiesData,
            mainStory: { ...storiesData.mainStory, [field]: value }
        });
    };

    const updateCategory = (index: number, field: keyof Category, value: any) => {
        if (!storiesData) return;
        const newCategories = [...storiesData.categories];
        newCategories[index] = { ...newCategories[index], [field]: value };
        setStoriesData({ ...storiesData, categories: newCategories });
    };

    const addCategory = async () => {
        if (!storiesData) return;

        const newCategory: Category = {
            title: 'New Category',
            imageUrl: '',
            link: '/solutions',
            order: storiesData.categories.length,
            isActive: true
        };

        const updatedCategories = [...storiesData.categories, newCategory];

        setStoriesData({
            ...storiesData,
            categories: updatedCategories
        });

        // Auto-save if section exists
        if (storiesData._id) {
            try {
                const toastId = toast.loading('Adding category...');
                const updateData = {
                    ...storiesData,
                    categories: updatedCategories
                };
                delete (updateData as any)._id;
                delete (updateData as any).createdAt;
                delete (updateData as any).updatedAt;

                const response = await storiesAPI.update(storiesData._id, updateData);
                if (response.success && response.data) {
                    setStoriesData(response.data);
                    toast.success('Category added!', { id: toastId });
                }
            } catch (error) {
                toast.error('Failed to add category');
            }
        }
    };

    const removeCategory = async (index: number) => {
        if (!storiesData) return;
        if (storiesData.categories.length === 1) {
            toast.error('You need at least one category');
            return;
        }

        const newCategories = storiesData.categories.filter((_, i) => i !== index);
        setStoriesData({ ...storiesData, categories: newCategories });

        if (storiesData._id) {
            try {
                const updateData = {
                    ...storiesData,
                    categories: newCategories
                };
                delete (updateData as any)._id;
                delete (updateData as any).createdAt;
                delete (updateData as any).updatedAt;

                await storiesAPI.update(storiesData._id, updateData);
                toast.success('Category removed');
            } catch (error) {
                toast.error('Failed to remove category');
            }
        }
    };

    const moveCategory = (index: number, direction: 'up' | 'down') => {
        if (!storiesData) return;
        const newCategories = [...storiesData.categories];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newCategories.length) return;
        [newCategories[index], newCategories[targetIndex]] = [newCategories[targetIndex], newCategories[index]];
        setStoriesData({ ...storiesData, categories: newCategories });
    };

    // ============================================================================
    // Image Upload Handlers
    // ============================================================================

    const handleMainImageUpload = async (file: File) => {
        if (!storiesData || !storiesData._id) {
            toast.error('Please save the section first before uploading images');
            return;
        }

        setUploadingType('main');
        const toastId = toast.loading('Uploading main story image...');

        try {
            const response = await storiesAPI.uploadMainImage(storiesData._id, file);
            if (response.success && response.data) {
                setStoriesData(response.data);
                toast.success('Main story image uploaded!', { id: toastId });
            } else {
                toast.error(response.message || 'Failed to upload image', { id: toastId });
            }
        } catch (error) {
            console.error('Error uploading main image:', error);
            toast.error('Failed to upload image', { id: toastId });
        } finally {
            setUploadingType(null);
        }
    };

    const handleCategoryImageUpload = async (index: number, file: File) => {
        if (!storiesData || !storiesData._id) {
            toast.error('Please save the section first');
            return;
        }

        setUploadingType(`category-${index}`);
        const toastId = toast.loading('Uploading category image...');

        try {
            const response = await storiesAPI.uploadCategoryImage(storiesData._id, index, file);
            if (response.success && response.data) {
                setStoriesData(response.data);
                toast.success('Category image uploaded!', { id: toastId });
            } else {
                toast.error(response.message || 'Failed to upload image', { id: toastId });
            }
        } catch (error) {
            console.error('Error uploading category image:', error);
            toast.error('Failed to upload image', { id: toastId });
        } finally {
            setUploadingType(null);
        }
    };

    const handleRemoveMainImage = async () => {
        if (!storiesData || !storiesData._id) return;

        const toastId = toast.loading('Removing image...');

        try {
            const response = await storiesAPI.removeMainImage(storiesData._id);
            if (response.success && response.data) {
                setStoriesData(response.data);
                toast.success('Image removed!', { id: toastId });
            } else {
                toast.error(response.message || 'Failed to remove image', { id: toastId });
            }
        } catch (error) {
            console.error('Error removing image:', error);
            toast.error('Failed to remove image', { id: toastId });
        }
    };

    const handleRemoveCategoryImage = async (index: number) => {
        if (!storiesData || !storiesData._id) return;

        const toastId = toast.loading('Removing image...');

        try {
            const response = await storiesAPI.removeCategoryImage(storiesData._id, index);
            if (response.success && response.data) {
                setStoriesData(response.data);
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
        if (!storiesData) return;

        setIsSaving(true);
        const toastId = toast.loading(isNew ? 'Creating stories section...' : 'Saving stories section...');

        try {
            let response;
            if (isNew || !storiesData._id) {
                const { _id, createdAt, updatedAt, ...createData } = storiesData;
                response = await storiesAPI.create(createData);
            } else {
                const updateData = { ...storiesData };
                delete (updateData as any)._id;
                delete (updateData as any).createdAt;
                delete (updateData as any).updatedAt;
                response = await storiesAPI.update(storiesData._id, updateData);
            }

            if (response.success) {
                toast.success(isNew ? 'Stories section created!' : 'Stories section updated!', { id: toastId });
                setIsNew(false);
                await fetchStoriesData();
            } else {
                toast.error(response.message || 'Failed to save', { id: toastId });
            }
        } catch (error) {
            console.error('Error saving stories:', error);
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
                    <p className="text-gray-500 text-sm mt-4">Loading stories section...</p>
                </div>
            </div>
        );
    }

    if (!storiesData) {
        return (
            <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8">
                <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80">
                    <div className="text-6xl mb-4">📖</div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">No Stories Data</h2>
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
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Stories Section</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        {isNew ? 'Create a new stories section' : 'Manage the stories section content for your homepage.'}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchStoriesData}
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
                                {isNew ? 'Create Stories Section' : 'Save Changes'}
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Status Banner */}
            {!isNew && storiesData._id && (
                <div className={`p-4 rounded-xl border ${storiesData.isActive ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {storiesData.isActive ? (
                                <Eye className="w-5 h-5 text-emerald-600" />
                            ) : (
                                <EyeOff className="w-5 h-5 text-slate-400" />
                            )}
                            <span className={`text-sm font-semibold ${storiesData.isActive ? 'text-emerald-700' : 'text-slate-500'}`}>
                                {storiesData.isActive ? 'Active' : 'Inactive'}
                            </span>
                            {storiesData.updatedAt && (
                                <span className="text-xs text-slate-400">
                                    Last updated: {new Date(storiesData.updatedAt).toLocaleString()}
                                </span>
                            )}
                        </div>
                        <button
                            onClick={async () => {
                                if (!storiesData._id) return;
                                try {
                                    const response = await storiesAPI.toggleStatus(storiesData._id);
                                    if (response.success) {
                                        toast.success(`Stories section ${response.data?.isActive ? 'activated' : 'deactivated'}`);
                                        await fetchStoriesData();
                                    }
                                } catch (error) {
                                    toast.error('Failed to toggle status');
                                }
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${storiesData.isActive ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}
                        >
                            {storiesData.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="flex border-b border-slate-200 bg-white rounded-t-2xl px-6 pt-4">
                <button
                    onClick={() => setActiveTab('content')}
                    className={`px-4 py-2.5 text-sm font-bold border-b-2 transition ${
                        activeTab === 'content'
                            ? 'border-[#1b7936] text-[#1b7936]'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                >
                    Content
                </button>
                <button
                    onClick={() => setActiveTab('mainStory')}
                    className={`px-4 py-2.5 text-sm font-bold border-b-2 transition ${
                        activeTab === 'mainStory'
                            ? 'border-[#1b7936] text-[#1b7936]'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                >
                    Main Story
                </button>
                <button
                    onClick={() => setActiveTab('categories')}
                    className={`px-4 py-2.5 text-sm font-bold border-b-2 transition ${
                        activeTab === 'categories'
                            ? 'border-[#1b7936] text-[#1b7936]'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                >
                    Categories ({storiesData.categories?.length || 0})
                </button>
            </div>

            {/* Content */}
            <div className="bg-white rounded-b-2xl rounded-t-none border border-t-0 border-slate-200/80 p-6 shadow-xs">
                {activeTab === 'content' && (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Heading <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={storiesData.heading || ''}
                                onChange={(e) => updateField('heading', e.target.value)}
                                placeholder="e.g., Discover Our Stories"
                                className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Subtitle <span className="text-rose-500">*</span>
                            </label>
                            <textarea
                                value={storiesData.subtitle || ''}
                                onChange={(e) => updateField('subtitle', e.target.value)}
                                rows={3}
                                placeholder="Enter the subtitle for the stories section..."
                                className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Section ID
                                </label>
                                <input
                                    type="text"
                                    value={storiesData.sectionId || 'stories'}
                                    onChange={(e) => updateField('sectionId', e.target.value)}
                                    placeholder="stories"
                                    className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'mainStory' && (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Main Story Image
                            </label>
                            <ImageUpload
                                label="Main Story Image"
                                value={storiesData.mainStory.imageUrl || ''}
                                onChange={(val) => updateMainStory('imageUrl', val as string)}
                                onAdd={async (files) => {
                                    if (files.length > 0) {
                                        await handleMainImageUpload(files[0]);
                                    }
                                }}
                                onRemove={async () => {
                                    await handleRemoveMainImage();
                                }}
                                isUploading={uploadingType === 'main'}
                                multiple={false}
                                maxSize={5}
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Quote <span className="text-rose-500">*</span>
                            </label>
                            <textarea
                                value={storiesData.mainStory.quote || ''}
                                onChange={(e) => updateMainStory('quote', e.target.value)}
                                rows={4}
                                placeholder="Enter the main story quote..."
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
                                    value={storiesData.mainStory.linkText || ''}
                                    onChange={(e) => updateMainStory('linkText', e.target.value)}
                                    placeholder="See All Deployment Stories →"
                                    className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Link URL
                                </label>
                                <input
                                    type="text"
                                    value={storiesData.mainStory.link || ''}
                                    onChange={(e) => updateMainStory('link', e.target.value)}
                                    placeholder="/stories"
                                    className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                            <input
                                type="checkbox"
                                checked={storiesData.mainStory.isActive}
                                onChange={(e) => updateMainStory('isActive', e.target.checked)}
                                className="w-4 h-4 rounded border-slate-300 text-[#1b7936] focus:ring-[#1b7936]"
                            />
                            <label className="text-xs font-semibold text-slate-700 cursor-pointer">
                                Main Story Active
                            </label>
                        </div>
                    </div>
                )}

                {activeTab === 'categories' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Categories</h3>
                            <button
                                onClick={addCategory}
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#1b7936] hover:bg-[#155f2b] px-3 py-1.5 rounded-xl transition"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Add Category
                            </button>
                        </div>

                        {storiesData.categories?.length === 0 ? (
                            <div className="text-center py-10 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                <p className="text-xs text-slate-400 font-medium">No categories configured. Click &quot;Add Category&quot; to get started.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {storiesData.categories.map((category, index) => (
                                    <div key={index} className="bg-slate-50/70 rounded-2xl p-4 border border-slate-200/80 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-slate-900">Category #{index + 1}</span>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full ${category.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                                                    {category.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => moveCategory(index, 'up')}
                                                    disabled={index === 0}
                                                    className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                                                >
                                                    <MoveUp className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => moveCategory(index, 'down')}
                                                    disabled={index === storiesData.categories.length - 1}
                                                    className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                                                >
                                                    <MoveDown className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => removeCategory(index)}
                                                    className="p-1 text-slate-400 hover:text-rose-600 transition"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Category Image Upload */}
                                        <ImageUpload
                                            label="Category Image"
                                            value={category.imageUrl || ''}
                                            onChange={(val) => updateCategory(index, 'imageUrl', val as string)}
                                            onAdd={async (files) => {
                                                if (files.length > 0) {
                                                    await handleCategoryImageUpload(index, files[0]);
                                                }
                                            }}
                                            onRemove={async () => {
                                                await handleRemoveCategoryImage(index);
                                            }}
                                            isUploading={uploadingType === `category-${index}`}
                                            multiple={false}
                                            maxSize={5}
                                        />

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                                    Title <span className="text-rose-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={category.title}
                                                    onChange={(e) => updateCategory(index, 'title', e.target.value)}
                                                    placeholder="e.g., At Home"
                                                    className="w-full px-3 py-1.5 text-sm text-black bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                                    Link
                                                </label>
                                                <input
                                                    type="text"
                                                    value={category.link}
                                                    onChange={(e) => updateCategory(index, 'link', e.target.value)}
                                                    placeholder="/solutions?tab=home"
                                                    className="w-full px-3 py-1.5 text-sm text-black bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition"
                                                />
                                            </div>
                                            <div className="flex items-center gap-2 pt-2">
                                                <input
                                                    type="checkbox"
                                                    checked={category.isActive}
                                                    onChange={(e) => updateCategory(index, 'isActive', e.target.checked)}
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