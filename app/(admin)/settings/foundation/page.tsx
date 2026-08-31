// app/(admin)/foundation/page.tsx
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
import { foundationAPI, FoundationData, FoundationItem } from '@/lib/api/foundation';

// ============================================================================
// Image Upload Component
// ============================================================================

interface ImageUploadProps {
    label: string;
    currentImage: string;
    onUpload: (file: File) => Promise<void>;
    isUploading: boolean;
    itemTitle?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
    label,
    currentImage,
    onUpload,
    isUploading,
    itemTitle = 'item'
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string>('');

    useEffect(() => {
        if (currentImage) {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || 'http://localhost:5000';
            setPreview(currentImage.startsWith('http') ? currentImage : `${baseUrl}${currentImage}`);
        } else {
            setPreview('');
        }
    }, [currentImage]);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size should be less than 5MB');
            return;
        }

        // Show preview immediately
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        await onUpload(file);
        
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-2">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                {label}
            </label>
            <div className="flex items-center gap-4">
                {/* Image Preview */}
                <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
                    {preview ? (
                        <img
                            src={preview}
                            alt={itemTitle}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <ImageIcon className="w-6 h-6" />
                        </div>
                    )}
                    {isUploading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <Loader2 className="w-6 h-6 text-white animate-spin" />
                        </div>
                    )}
                </div>

                <div className="flex-1">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        id={`upload-${label.replace(/\s/g, '-')}`}
                    />
                    <label
                        htmlFor={`upload-${label.replace(/\s/g, '-')}`}
                        className="inline-flex items-center gap-2 px-4 py-2 border-2 border-dashed border-slate-300 hover:border-[#1b7936] hover:bg-[#1b7936]/5 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer transition"
                    >
                        <Upload className="w-3.5 h-3.5" />
                        {preview ? 'Change Image' : 'Upload Image'}
                    </label>
                    <p className="text-[10px] text-slate-400 mt-1">JPEG, PNG, WebP (Max 5MB)</p>
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// Default Empty Foundation Data
// ============================================================================

const EMPTY_FOUNDATION_DATA: FoundationData = {
    _id: '',
    heading: '',
    subtitle: '',
    items: [
        {
            title: '',
            description: '',
            bgClass: '#0c1f38',
            imageUrl: '',
            imageAlt: '',
            order: 0,
            isActive: true
        }
    ],
    isActive: true,
    backgroundColor: '#ffffff',
    textColor: '#071322'
};

// ============================================================================
// Color Options
// ============================================================================

const COLOR_OPTIONS = [
    { value: '#0c1f38', label: 'Dark Navy' },
    { value: '#16493f', label: 'Dark Teal' },
    { value: '#0c2138', label: 'Deep Navy' },
    { value: '#183a1f', label: 'Forest Green' },
    { value: '#1b7936', label: 'EV Green' },
    { value: '#0B192C', label: 'EV Dark Blue' },
    { value: '#1e293b', label: 'Slate' },
    { value: '#2a3b5c', label: 'Slate Blue' },
];

// ============================================================================
// Main Component
// ============================================================================

export default function FoundationAdminPage() {
    const { token } = useAuth();
    const [foundationData, setFoundationData] = useState<FoundationData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isNew, setIsNew] = useState(false);
    const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<'content' | 'items'>('content');

    // ============================================================================
    // Fetch Foundation Data
    // ============================================================================

    const fetchFoundationData = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await foundationAPI.getActive();
            if (response.success && response.data) {
                setFoundationData(response.data);
                setIsNew(false);
            } else {
                setFoundationData(EMPTY_FOUNDATION_DATA);
                setIsNew(true);
            }
        } catch (error) {
            console.error('Error fetching foundation data:', error);
            setFoundationData(EMPTY_FOUNDATION_DATA);
            setIsNew(true);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFoundationData();
    }, [fetchFoundationData]);

    // ============================================================================
    // Update Handlers
    // ============================================================================

    const updateField = (path: string, value: any) => {
        if (!foundationData) return;
        const newData = { ...foundationData };
        const keys = path.split('.');
        let current: any = newData;
        for (let i = 0; i < keys.length - 1; i++) {
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
        setFoundationData(newData);
    };

    const updateItem = (index: number, field: keyof FoundationItem, value: any) => {
        if (!foundationData) return;
        const newItems = [...foundationData.items];
        newItems[index] = { ...newItems[index], [field]: value };
        setFoundationData({ ...foundationData, items: newItems });
    };

    const addItem = () => {
        if (!foundationData) return;
        const newItem: FoundationItem = {
            title: '',
            description: '',
            bgClass: '#0c1f38',
            imageUrl: '',
            imageAlt: '',
            order: foundationData.items.length,
            isActive: true
        };
        setFoundationData({
            ...foundationData,
            items: [...foundationData.items, newItem]
        });
    };

    const removeItem = (index: number) => {
        if (!foundationData) return;
        if (foundationData.items.length === 1) {
            toast.error('You need at least one foundation item');
            return;
        }
        const newItems = foundationData.items.filter((_, i) => i !== index);
        setFoundationData({ ...foundationData, items: newItems });
    };

    const moveItem = (index: number, direction: 'up' | 'down') => {
        if (!foundationData) return;
        const newItems = [...foundationData.items];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newItems.length) return;
        [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
        setFoundationData({ ...foundationData, items: newItems });
    };

    // ============================================================================
    // Image Upload Handler
    // ============================================================================

    const handleImageUpload = async (index: number, file: File) => {
        if (!foundationData || !foundationData._id) {
            toast.error('Please save the foundation first before uploading images');
            return;
        }

        setUploadingIndex(index);
        const toastId = toast.loading('Uploading image...');

        try {
            const response = await foundationAPI.uploadImage(foundationData._id, index, file);
            
            if (response.success && response.data) {
                setFoundationData(response.data);
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

    // ============================================================================
    // Save Handler
    // ============================================================================

    const handleSave = async () => {
        if (!foundationData) return;
        
        setIsSaving(true);
        const toastId = toast.loading(isNew ? 'Creating foundation...' : 'Saving foundation...');
        
        try {
            let response;
            if (isNew || !foundationData._id) {
                const { _id, createdAt, updatedAt, ...createData } = foundationData;
                response = await foundationAPI.create(createData);
            } else {
                response = await foundationAPI.update(foundationData._id, foundationData);
            }
            
            if (response.success) {
                toast.success(isNew ? 'Foundation created successfully!' : 'Foundation updated successfully!', { id: toastId });
                setIsNew(false);
                await fetchFoundationData();
            } else {
                toast.error(response.message || 'Failed to save foundation', { id: toastId });
            }
        } catch (error) {
            console.error('Error saving foundation:', error);
            toast.error('Failed to save foundation', { id: toastId });
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
                    <p className="text-gray-500 text-sm mt-4">Loading foundation section...</p>
                </div>
            </div>
        );
    }

    if (!foundationData) {
        return (
            <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8">
                <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80">
                    <div className="text-6xl mb-4">🏗️</div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">No Foundation Data</h2>
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
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Foundation Section</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        {isNew ? 'Create a new foundation section' : 'Manage the foundation section content for your homepage.'}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchFoundationData}
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
                                {isNew ? 'Create Foundation' : 'Save Changes'}
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Status Banner */}
            {!isNew && foundationData._id && (
                <div className={`p-4 rounded-xl border ${foundationData.isActive ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {foundationData.isActive ? (
                                <Eye className="w-5 h-5 text-emerald-600" />
                            ) : (
                                <EyeOff className="w-5 h-5 text-slate-400" />
                            )}
                            <span className={`text-sm font-semibold ${foundationData.isActive ? 'text-emerald-700' : 'text-slate-500'}`}>
                                {foundationData.isActive ? 'Active' : 'Inactive'}
                            </span>
                            {foundationData.updatedAt && (
                                <span className="text-xs text-slate-400">
                                    Last updated: {new Date(foundationData.updatedAt).toLocaleString()}
                                </span>
                            )}
                        </div>
                        <button
                            onClick={async () => {
                                if (!foundationData._id) return;
                                try {
                                    const response = await foundationAPI.toggleStatus(foundationData._id);
                                    if (response.success) {
                                        toast.success(`Foundation ${response.data?.isActive ? 'activated' : 'deactivated'}`);
                                        await fetchFoundationData();
                                    }
                                } catch (error) {
                                    toast.error('Failed to toggle status');
                                }
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${foundationData.isActive ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}
                        >
                            {foundationData.isActive ? 'Deactivate' : 'Activate'}
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
                    onClick={() => setActiveTab('items')}
                    className={`px-4 py-2.5 text-sm font-bold border-b-2 transition ${
                        activeTab === 'items'
                            ? 'border-[#1b7936] text-[#1b7936]'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                >
                    Foundation Items ({foundationData.items?.length || 0})
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
                                value={foundationData.heading || ''}
                                onChange={(e) => updateField('heading', e.target.value)}
                                placeholder="e.g., Build Our Foundation"
                                className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Subtitle <span className="text-rose-500">*</span>
                            </label>
                            <textarea
                                value={foundationData.subtitle || ''}
                                onChange={(e) => updateField('subtitle', e.target.value)}
                                rows={3}
                                placeholder="Enter the subtitle for the foundation section..."
                                className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Background Color
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        value={foundationData.backgroundColor || '#ffffff'}
                                        onChange={(e) => updateField('backgroundColor', e.target.value)}
                                        className="w-12 h-11 rounded-xl border border-slate-200 cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={foundationData.backgroundColor || ''}
                                        onChange={(e) => updateField('backgroundColor', e.target.value)}
                                        className="flex-1 px-3.5 py-2 text-sm text-black bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition font-mono"
                                        placeholder="#ffffff"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Text Color
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        value={foundationData.textColor || '#071322'}
                                        onChange={(e) => updateField('textColor', e.target.value)}
                                        className="w-12 h-11 rounded-xl border border-slate-200 cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={foundationData.textColor || ''}
                                        onChange={(e) => updateField('textColor', e.target.value)}
                                        className="flex-1 px-3.5 py-2 text-sm text-black bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition font-mono"
                                        placeholder="#071322"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'items' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Foundation Items</h3>
                            <button
                                onClick={addItem}
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#1b7936] hover:bg-[#155f2b] px-3 py-1.5 rounded-xl transition"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Add Item
                            </button>
                        </div>

                        {foundationData.items?.length === 0 ? (
                            <div className="text-center py-10 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                <p className="text-xs text-slate-400 font-medium">No items configured. Click &quot;Add Item&quot; to get started.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {foundationData.items.map((item, index) => (
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
                                                    disabled={index === foundationData.items.length - 1}
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
                                            currentImage={item.imageUrl || ''}
                                            onUpload={(file) => handleImageUpload(index, file)}
                                            isUploading={uploadingIndex === index}
                                            itemTitle={item.title || `Item ${index + 1}`}
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
                                                    placeholder="e.g., Values"
                                                    className="w-full px-3 py-1.5 text-sm text-black bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                                    Image Alt Text
                                                </label>
                                                <input
                                                    type="text"
                                                    value={item.imageAlt || ''}
                                                    onChange={(e) => updateItem(index, 'imageAlt', e.target.value)}
                                                    placeholder="e.g., Values - EVNGEN core principles"
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
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                                    Background Color
                                                </label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="color"
                                                        value={item.bgClass || '#0c1f38'}
                                                        onChange={(e) => updateItem(index, 'bgClass', e.target.value)}
                                                        className="w-10 h-9 rounded-lg border border-slate-200 cursor-pointer"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={item.bgClass || ''}
                                                        onChange={(e) => updateItem(index, 'bgClass', e.target.value)}
                                                        className="flex-1 px-3 py-1.5 text-sm text-black bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b7936]/15 focus:border-[#1b7936] transition font-mono"
                                                        placeholder="#0c1f38"
                                                    />
                                                </div>
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