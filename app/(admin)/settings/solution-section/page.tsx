// app/(admin)/settings/solution-section/page.tsx
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
import { solutionSectionAPI, SolutionSectionData, SolutionItem } from '@/lib/api/solutionSection';
import ImageUpload from '@/components/Admin/ImageUpload';

// ============================================================================
// Default Empty Solution Section Data
// ============================================================================

const EMPTY_SOLUTION_DATA: SolutionSectionData = {
    _id: '',
    heading: '',
    subtitle: '',
    items: [
        {
            title: '',
            slug: '',
            subtitle: '',
            description: '',
            link: '/solutions',
            imageUrl: '',
            order: 0,
            isActive: true
        }
    ],
    isActive: true,
    backgroundColor: '#ffffff',
    textColor: '#071322',
    sectionId: 'solutions'
};

// ============================================================================
// Main Component
// ============================================================================

export default function SolutionSectionAdminPage() {
    const { token } = useAuth();
    const [solutionData, setSolutionData] = useState<SolutionSectionData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isNew, setIsNew] = useState(false);
    const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<'content' | 'items'>('content');
    const [isSavingForUpload, setIsSavingForUpload] = useState(false);

    // ============================================================================
    // Fetch Solution Data
    // ============================================================================

    const fetchSolutionData = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await solutionSectionAPI.getActive();
            if (response.success && response.data) {
                setSolutionData(response.data);
                setIsNew(false);
            } else {
                setSolutionData(EMPTY_SOLUTION_DATA);
                setIsNew(true);
            }
        } catch (error) {
            console.error('Error fetching solution data:', error);
            setSolutionData(EMPTY_SOLUTION_DATA);
            setIsNew(true);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSolutionData();
    }, [fetchSolutionData]);

    // ============================================================================
    // Update Handlers
    // ============================================================================

    const updateField = (path: string, value: any) => {
        if (!solutionData) return;
        const newData = { ...solutionData };
        const keys = path.split('.');
        let current: any = newData;
        for (let i = 0; i < keys.length - 1; i++) {
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
        setSolutionData(newData);
    };

    const updateItem = (index: number, field: keyof SolutionItem, value: any) => {
        if (!solutionData) return;
        const newItems = [...solutionData.items];
        if (index >= 0 && index < newItems.length) {
            newItems[index] = { ...newItems[index], [field]: value };
            setSolutionData({ ...solutionData, items: newItems });
        }
    };

    // app/(admin)/settings/solution-section/page.tsx

    const addItem = async () => {
        if (!solutionData) return;

        // ✅ Pre-fill required fields with placeholder values
        const newItem: SolutionItem = {
            title: 'New Item',  
            slug: `new-item-${solutionData.items.length + 1}`,  
            subtitle: 'Enter subtitle here',  
            description: 'Enter description here',  
            link: '/solutions',
            imageUrl: '',
            order: solutionData.items.length,
            isActive: true
        };

        const updatedItems = [...solutionData.items, newItem];

        // Update UI immediately
        setSolutionData({
            ...solutionData,
            items: updatedItems
        });

        // If section has an ID, save to database
        if (solutionData._id) {
            try {
                const toastId = toast.loading('Adding item...');

                // Create a clean copy for the API
                const updateData = {
                    ...solutionData,
                    items: updatedItems
                };

                // Remove mongoose fields
                delete (updateData as any)._id;
                delete (updateData as any).createdAt;
                delete (updateData as any).updatedAt;

                const response = await solutionSectionAPI.update(solutionData._id, updateData);

                if (response.success && response.data) {
                    setSolutionData(response.data);
                    toast.success(`Item ${updatedItems.length} added! Edit the fields as needed.`, { id: toastId });
                } else {
                    toast.error(response.message || 'Failed to add item', { id: toastId });
                    // Rollback
                    setSolutionData({
                        ...solutionData,
                        items: solutionData.items
                    });
                }
            } catch (error) {
                console.error('Error adding item:', error);
                toast.error('Failed to add item');
                // Rollback
                setSolutionData({
                    ...solutionData,
                    items: solutionData.items
                });
            }
        } else {
            toast.success(`Item ${updatedItems.length} added. Click "Create Solution Section" to save.`);
        }
    };

    const removeItem = (index: number) => {
        if (!solutionData) return;
        if (solutionData.items.length === 1) {
            toast.error('You need at least one solution item');
            return;
        }
        const newItems = solutionData.items.filter((_, i) => i !== index);
        setSolutionData({ ...solutionData, items: newItems });

        // Auto-save after removing item
        if (solutionData._id) {
            handleSave();
        }
    };

    const moveItem = (index: number, direction: 'up' | 'down') => {
        if (!solutionData) return;
        const newItems = [...solutionData.items];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newItems.length) return;
        [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
        setSolutionData({ ...solutionData, items: newItems });
    };

    // ============================================================================
    // Save Helper - Ensures section exists before image upload
    // ============================================================================

    const ensureSectionSaved = async (): Promise<string | null> => {
        if (solutionData?._id) {
            return solutionData._id;
        }

        if (isNew || !solutionData?._id) {
            setIsSavingForUpload(true);
            const toastId = toast.loading('Saving section before uploading image...');

            try {
                const { _id, createdAt, updatedAt, ...createData } = solutionData!;
                const response = await solutionSectionAPI.create(createData);

                if (response.success && response.data) {
                    setSolutionData(response.data);
                    setIsNew(false);
                    toast.success('Section saved!', { id: toastId });
                    return response.data._id;
                } else {
                    toast.error(response.message || 'Failed to save section', { id: toastId });
                    return null;
                }
            } catch (error) {
                console.error('Error saving section:', error);
                toast.error('Failed to save section', { id: toastId });
                return null;
            } finally {
                setIsSavingForUpload(false);
            }
        }

        return null;
    };

    // ============================================================================
    // Image Upload Handlers
    // ============================================================================

    const handleImageUpload = async (index: number, file: File) => {
        console.log('📸 Upload triggered for index:', index);
        console.log('📸 Current items:', solutionData?.items?.length);

        if (!solutionData) {
            toast.error('Please add content first');
            return;
        }

        if (!solutionData.items || index >= solutionData.items.length) {
            toast.error(`Item at index ${index} does not exist. Total items: ${solutionData.items?.length || 0}`);
            return;
        }

        const item = solutionData.items[index];
        if (!item.title || !item.slug) {
            toast.error(`Please fill in Title and Slug for Item ${index + 1} before uploading an image`);
            return;
        }

        const sectionId = await ensureSectionSaved();
        if (!sectionId) {
            toast.error('Please save the section first');
            return;
        }

        setUploadingIndex(index);
        const toastId = toast.loading(`Uploading image...`);

        try {
            const response = await solutionSectionAPI.uploadImage(sectionId, index, file);

            if (response.success && response.data) {
                setSolutionData(response.data);
                toast.success('Image uploaded successfully!', { id: toastId });
            } else {
                toast.error(response.message || 'Failed to upload image', { id: toastId });
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            toast.error('Failed to upload image', { id: toastId });
        } finally {
            setUploadingIndex(null);
        }
    };

    const handleRemoveImage = async (index: number) => {
        if (!solutionData || !solutionData._id) {
            toast.error('Please save the section first');
            return;
        }

        if (!solutionData.items || index >= solutionData.items.length) {
            toast.error(`Item at index ${index} does not exist`);
            return;
        }

        const toastId = toast.loading('Removing image...');

        try {
            const response = await solutionSectionAPI.removeImage(solutionData._id, index);
            if (response.success && response.data) {
                setSolutionData(response.data);
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
        if (!solutionData) return;

        setIsSaving(true);
        const toastId = toast.loading(isNew ? 'Creating solution section...' : 'Saving solution section...');

        try {
            let response;
            if (isNew || !solutionData._id) {
                const { _id, createdAt, updatedAt, ...createData } = solutionData;
                response = await solutionSectionAPI.create(createData);
            } else {
                response = await solutionSectionAPI.update(solutionData._id, solutionData);
            }

            if (response.success) {
                toast.success(isNew ? 'Solution section created successfully!' : 'Solution section updated successfully!', { id: toastId });
                setIsNew(false);
                await fetchSolutionData();
            } else {
                toast.error(response.message || 'Failed to save solution section', { id: toastId });
            }
        } catch (error) {
            console.error('Error saving solution data:', error);
            toast.error('Failed to save solution section', { id: toastId });
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
                    <p className="text-gray-500 text-sm mt-4">Loading solution section...</p>
                </div>
            </div>
        );
    }

    if (!solutionData) {
        return (
            <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8">
                <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80">
                    <div className="text-6xl mb-4">💡</div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">No Solution Data</h2>
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
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Solution Section</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        {isNew ? 'Create a new solution section' : 'Manage the solution section content for your homepage.'}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchSolutionData}
                        className="p-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 transition"
                        title="Refresh"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving || isSavingForUpload}
                        className="inline-flex items-center gap-2 bg-[#1b7936] hover:bg-[#155f2b] text-white px-5 py-2.5 rounded-xl text-sm font-bold transition disabled:opacity-50 shadow-xs hover:shadow"
                    >
                        {isSaving || isSavingForUpload ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                {isNew ? 'Creating...' : 'Saving...'}
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                {isNew ? 'Create Solution Section' : 'Save Changes'}
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Status Banner */}
            {!isNew && solutionData._id && (
                <div className={`p-4 rounded-xl border ${solutionData.isActive ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {solutionData.isActive ? (
                                <Eye className="w-5 h-5 text-emerald-600" />
                            ) : (
                                <EyeOff className="w-5 h-5 text-slate-400" />
                            )}
                            <span className={`text-sm font-semibold ${solutionData.isActive ? 'text-emerald-700' : 'text-slate-500'}`}>
                                {solutionData.isActive ? 'Active' : 'Inactive'}
                            </span>
                            {solutionData.updatedAt && (
                                <span className="text-xs text-slate-400">
                                    Last updated: {new Date(solutionData.updatedAt).toLocaleString()}
                                </span>
                            )}
                        </div>
                        <button
                            onClick={async () => {
                                if (!solutionData._id) return;
                                try {
                                    const response = await solutionSectionAPI.toggleStatus(solutionData._id);
                                    if (response.success) {
                                        toast.success(`Solution section ${response.data?.isActive ? 'activated' : 'deactivated'}`);
                                        await fetchSolutionData();
                                    }
                                } catch (error) {
                                    toast.error('Failed to toggle status');
                                }
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${solutionData.isActive ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}
                        >
                            {solutionData.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="flex border-b border-slate-200 bg-white rounded-t-2xl px-6 pt-4">
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
                    onClick={() => setActiveTab('items')}
                    className={`px-4 py-2.5 text-sm font-bold border-b-2 transition ${activeTab === 'items'
                        ? 'border-[#1b7936] text-[#1b7936]'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Solution Items ({solutionData.items?.length || 0})
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
                                value={solutionData.heading || ''}
                                onChange={(e) => updateField('heading', e.target.value)}
                                placeholder="e.g., Deliver Our Solutions"
                                className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Subtitle <span className="text-rose-500">*</span>
                            </label>
                            <textarea
                                value={solutionData.subtitle || ''}
                                onChange={(e) => updateField('subtitle', e.target.value)}
                                rows={3}
                                placeholder="Enter the subtitle for the solution section..."
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
                                    value={solutionData.sectionId || 'solutions'}
                                    onChange={(e) => updateField('sectionId', e.target.value)}
                                    placeholder="solutions"
                                    className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'items' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Solution Items</h3>
                            <button
                                onClick={addItem}
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#1b7936] hover:bg-[#155f2b] px-3 py-1.5 rounded-xl transition"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Add Item
                            </button>
                        </div>

                        {solutionData.items?.length === 0 ? (
                            <div className="text-center py-10 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                <p className="text-xs text-slate-400 font-medium">No items configured. Click &quot;Add Item&quot; to get started.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {solutionData.items.map((item, index) => (
                                    <div key={index} className="bg-slate-50/70 rounded-2xl p-4 border border-slate-200/80 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-slate-900">Item #{index + 1}</span>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full ${item.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                                                    {item.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => moveItem(index, 'up')}
                                                    disabled={index === 0}
                                                    className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                                                >
                                                    <MoveUp className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => moveItem(index, 'down')}
                                                    disabled={index === solutionData.items.length - 1}
                                                    className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                                                >
                                                    <MoveDown className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => removeItem(index)}
                                                    className="p-1 text-slate-400 hover:text-rose-600 transition"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Image Upload */}
                                        <ImageUpload
                                            label="Item Image"
                                            value={item.imageUrl || ''}
                                            onChange={(val) => {
                                                updateItem(index, 'imageUrl', val as string);
                                            }}
                                            onAdd={async (files) => {
                                                if (files.length > 0) {
                                                    console.log('📸 ImageUpload onAdd called for index:', index);
                                                    console.log('📸 Total items:', solutionData.items.length);
                                                    if (index < solutionData.items.length) {
                                                        await handleImageUpload(index, files[0]);
                                                    } else {
                                                        toast.error(`Item at index ${index} not found. Please refresh the page.`);
                                                    }
                                                }
                                            }}
                                            onRemove={async () => {
                                                await handleRemoveImage(index);
                                            }}
                                            isUploading={uploadingIndex === index}
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
                                                    value={item.title}
                                                    onChange={(e) => updateItem(index, 'title', e.target.value)}
                                                    placeholder="e.g., Power Quality"
                                                    className="w-full px-3 py-1.5 text-sm text-black bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                                    Slug <span className="text-rose-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={item.slug}
                                                    onChange={(e) => updateItem(index, 'slug', e.target.value)}
                                                    placeholder="e.g., power-quality"
                                                    className="w-full px-3 py-1.5 text-sm text-black bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                                    Subtitle <span className="text-rose-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={item.subtitle}
                                                    onChange={(e) => updateItem(index, 'subtitle', e.target.value)}
                                                    placeholder="e.g., Enhancing Energy Efficiency"
                                                    className="w-full px-3 py-1.5 text-sm text-black bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                                    Link
                                                </label>
                                                <input
                                                    type="text"
                                                    value={item.link}
                                                    onChange={(e) => updateItem(index, 'link', e.target.value)}
                                                    placeholder="/solutions"
                                                    className="w-full px-3 py-1.5 text-sm text-black bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition"
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                                    Description <span className="text-rose-500">*</span>
                                                </label>
                                                <textarea
                                                    value={item.description}
                                                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                                                    rows={2}
                                                    placeholder="Enter the description..."
                                                    className="w-full px-3 py-1.5 text-sm text-black bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition resize-none"
                                                />
                                            </div>
                                            <div className="flex items-center gap-2 pt-2">
                                                <input
                                                    type="checkbox"
                                                    checked={item.isActive}
                                                    onChange={(e) => updateItem(index, 'isActive', e.target.checked)}
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