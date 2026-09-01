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
    ImageIcon,
    ChevronDown,
    ChevronRight
} from 'lucide-react';
import { storiesAPI, StoriesData, Category, MainStory } from '@/lib/api/stories';
import { getImageUrl } from '@/utils/imageHelper';

// ============================================================================
// Types
// ============================================================================

interface ImageUploadProps {
    label: string;
    value: string;
    onUpload: (files: File[]) => Promise<void>;
    onRemove: () => Promise<void>;
    isUploading: boolean;
    itemTitle?: string;
    index?: number;
    onFileSelect?: (file: File) => void;
}

// ============================================================================
// Image Upload Component
// ============================================================================

const ImageUpload: React.FC<ImageUploadProps> = ({
    label,
    value,
    onUpload,
    onRemove,
    isUploading,
    itemTitle = 'image',
    index,
    onFileSelect
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string>('');
    const [hasError, setHasError] = useState<boolean>(false);

    useEffect(() => {
        if (value) {
            const fullUrl = getImageUrl(value);
            setPreview(fullUrl || '');
            setHasError(false);
        } else {
            setPreview('');
        }
    }, [value]);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const validFiles: File[] = [];
        for (const file of Array.from(files)) {
            if (!file.type.startsWith('image/')) {
                toast.error(`${file.name} is not an image`);
                continue;
            }
            if (file.size > 5 * 1024 * 1024) {
                toast.error(`${file.name} exceeds 5MB limit`);
                continue;
            }
            validFiles.push(file);
        }

        if (validFiles.length === 0) return;

        // ✅ Store file for later use in save
        if (onFileSelect && validFiles.length > 0) {
            onFileSelect(validFiles[0]);
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
            setHasError(false);
        };
        reader.readAsDataURL(validFiles[0]);

        await onUpload(validFiles);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleImageError = () => {
        setHasError(true);
    };

    const handleRemove = async () => {
        await onRemove();
        setPreview('');
        setHasError(false);
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
                <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
                    {preview && !hasError ? (
                        <img
                            src={preview}
                            alt={itemTitle}
                            className="w-full h-full object-cover"
                            onError={handleImageError}
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
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                        id={`upload-${label.replace(/\s/g, '-')}-${index || ''}`}
                    />
                    <div className="flex flex-wrap gap-2">
                        <label
                            htmlFor={`upload-${label.replace(/\s/g, '-')}-${index || ''}`}
                            className="inline-flex items-center gap-2 px-4 py-2 border-2 border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer transition"
                        >
                            <Upload className="w-3.5 h-3.5" />
                            {preview ? 'Change Image' : 'Upload Image'}
                        </label>
                        {preview && (
                            <button
                                type="button"
                                onClick={handleRemove}
                                className="px-4 py-2 border border-rose-200 hover:bg-rose-50 rounded-xl text-xs font-semibold text-rose-600 transition"
                            >
                                Remove
                            </button>
                        )}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                        JPEG, PNG, WebP (Max 5MB)
                    </p>
                    {value && value.includes('i.ibb.co') && (
                        <p className="text-[10px] text-emerald-600 mt-0.5">✅ Hosted on ImgBB</p>
                    )}
                </div>
            </div>
        </div>
    );
};

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
    categories: [],
    isActive: true,
    backgroundColor: '#ffffff',
    textColor: '#071322',
    sectionId: 'stories'
};

// ============================================================================
// Category Card Component
// ============================================================================

interface CategoryCardProps {
    category: Category;
    index: number;
    totalCategories: number;
    onUpdate: (index: number, field: keyof Category, value: any) => void;
    onRemove: (index: number) => void;
    onMove: (index: number, direction: 'up' | 'down') => void;
    onImageUpload: (index: number, files: File[]) => Promise<void>;
    onImageRemove: (index: number) => Promise<void>;
    isUploading: boolean;
    onFileSelect?: (index: number, file: File) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
    category,
    index,
    totalCategories,
    onUpdate,
    onRemove,
    onMove,
    onImageUpload,
    onImageRemove,
    isUploading,
    onFileSelect
}) => {
    const [isExpanded, setIsExpanded] = useState<boolean>(true);
    const imageUrl = category.imageUrl ? getImageUrl(category.imageUrl) : null;

    return (
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-sm transition-shadow">
            {/* Card Header */}
            <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
                        {imageUrl ? (
                            <img
                                src={imageUrl}
                                alt={category.title || 'Category'}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                                <ImageIcon className="w-4 h-4" />
                            </div>
                        )}
                    </div>
                    <div className="min-w-0">
                        <span className="text-sm font-semibold text-slate-900 truncate block">
                            {category.title || `Category ${index + 1}`}
                        </span>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${category.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                                {category.isActive ? 'Active' : 'Inactive'}
                            </span>
                            {category.imageUrl && category.imageUrl.includes('i.ibb.co') && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                                    ☁️ ImgBB
                                </span>
                            )}
                            <span className="text-[10px] text-slate-400">
                                Order: {index + 1}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                        onClick={() => onMove(index, 'up')}
                        disabled={index === 0}
                        className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30 transition"
                        title="Move Up"
                    >
                        <MoveUp className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onMove(index, 'down')}
                        disabled={index === totalCategories - 1}
                        className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30 transition"
                        title="Move Down"
                    >
                        <MoveDown className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onRemove(index)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition"
                        title="Delete"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-slate-400">
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {/* Card Body */}
            {isExpanded && (
                <div className="p-4 border-t border-slate-100 space-y-4">
                    <ImageUpload
                        label="Category Image"
                        value={category.imageUrl || ''}
                        onUpload={async (files) => {
                            if (files.length > 0) {
                                await onImageUpload(index, files);
                            }
                        }}
                        onRemove={async () => {
                            await onImageRemove(index);
                        }}
                        isUploading={isUploading}
                        itemTitle={category.title || `Category ${index + 1}`}
                        index={index}
                        onFileSelect={(file) => {
                            if (onFileSelect) {
                                onFileSelect(index, file);
                            }
                        }}
                    />

                    {imageUrl && (
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Live Preview</p>
                            <div className="flex items-center gap-3">
                                <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
                                    <img
                                        src={imageUrl}
                                        alt={category.title || 'Preview'}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-slate-900 truncate">
                                        {category.title || 'Untitled Category'}
                                    </p>
                                    <p className="text-xs text-slate-500 truncate">
                                        {category.link || '/solutions'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                Title <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={category.title}
                                onChange={(e) => onUpdate(index, 'title', e.target.value)}
                                placeholder="e.g., At Home"
                                className="w-full px-3 py-2 text-sm text-black bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-500 transition"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                Link
                            </label>
                            <input
                                type="text"
                                value={category.link}
                                onChange={(e) => onUpdate(index, 'link', e.target.value)}
                                placeholder="/solutions?tab=home"
                                className="w-full px-3 py-2 text-sm text-black bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-500 transition"
                            />
                        </div>
                        <div className="flex items-center gap-3 pt-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={category.isActive}
                                    onChange={(e) => onUpdate(index, 'isActive', e.target.checked)}
                                    className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                />
                                <span className="text-xs font-semibold text-slate-700">Active</span>
                            </label>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ============================================================================
// Main Component
// ============================================================================

export default function StoriesAdminPage() {
    const { token } = useAuth();
    const [storiesData, setStoriesData] = useState<StoriesData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [isNew, setIsNew] = useState<boolean>(false);
    const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
    const [mainSectionExpanded, setMainSectionExpanded] = useState<boolean>(true);

    // ✅ Track files for upload
    const [mainImageFile, setMainImageFile] = useState<File | null>(null);
    const [categoryFiles, setCategoryFiles] = useState<Map<number, File>>(new Map());

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

    const updateField = useCallback((path: string, value: any) => {
        if (!storiesData) return;
        const newData = { ...storiesData };
        const keys = path.split('.');
        let current: any = newData;
        for (let i = 0; i < keys.length - 1; i++) {
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
        setStoriesData(newData);
    }, [storiesData]);

    const updateMainStory = useCallback((field: keyof MainStory, value: any) => {
        if (!storiesData) return;
        setStoriesData({
            ...storiesData,
            mainStory: { ...storiesData.mainStory, [field]: value }
        });
    }, [storiesData]);

    const updateCategory = useCallback((index: number, field: keyof Category, value: any) => {
        if (!storiesData) return;
        const newCategories = [...storiesData.categories];
        newCategories[index] = { ...newCategories[index], [field]: value };
        setStoriesData({ ...storiesData, categories: newCategories });
    }, [storiesData]);

    const addCategory = useCallback(() => {
        if (!storiesData) return;

        const newCategory: Category = {
            title: `Category ${storiesData.categories.length + 1}`,
            imageUrl: '',
            link: '/solutions',
            order: storiesData.categories.length,
            isActive: true
        };

        setStoriesData({
            ...storiesData,
            categories: [...storiesData.categories, newCategory]
        });

        toast.success('New category added');
    }, [storiesData]);

    const removeCategory = useCallback((index: number) => {
        if (!storiesData) return;
        if (storiesData.categories.length === 1) {
            toast.error('You need at least one category');
            return;
        }

        const newCategories = storiesData.categories.filter((_, i) => i !== index);
        const reorderedCategories = newCategories.map((cat, i) => ({
            ...cat,
            order: i
        }));
        setStoriesData({ ...storiesData, categories: reorderedCategories });
        toast.success('Category removed');
    }, [storiesData]);

    const moveCategory = useCallback((index: number, direction: 'up' | 'down') => {
        if (!storiesData) return;
        const newCategories = [...storiesData.categories];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newCategories.length) return;

        [newCategories[index], newCategories[targetIndex]] = [newCategories[targetIndex], newCategories[index]];

        const reorderedCategories = newCategories.map((cat, i) => ({
            ...cat,
            order: i
        }));
        setStoriesData({ ...storiesData, categories: reorderedCategories });
    }, [storiesData]);

    // ============================================================================
    // Image Upload Handlers
    // ============================================================================

    const handleMainImageUpload = useCallback(async (files: File[]) => {
        if (!storiesData || !storiesData._id) {
            toast.error('Please save the section first before uploading images');
            return;
        }

        setUploadingIndex(-1);
        const toastId = toast.loading('Uploading main story image to ImgBB...');

        try {
            const response = await storiesAPI.uploadMainImage(storiesData._id, files[0]);
            if (response.success && response.data) {
                setStoriesData(response.data);
                setMainImageFile(null);
                toast.success('Main story image uploaded!', { id: toastId });
            } else {
                toast.error(response.message || 'Failed to upload image', { id: toastId });
            }
        } catch (error) {
            console.error('Error uploading main image:', error);
            toast.error('Failed to upload image', { id: toastId });
        } finally {
            setUploadingIndex(null);
        }
    }, [storiesData]);

    const handleCategoryImageUpload = useCallback(async (index: number, files: File[]) => {
        if (!storiesData || !storiesData._id) {
            toast.error('Please save the section first');
            return;
        }

        setUploadingIndex(index);
        const toastId = toast.loading(`Uploading image for category ${index + 1}...`);

        try {
            const response = await storiesAPI.uploadCategoryImage(storiesData._id, index, files[0]);

            if (response.success && response.data) {
                setStoriesData(response.data);
                setCategoryFiles(prev => {
                    const newMap = new Map(prev);
                    newMap.delete(index);
                    return newMap;
                });
                toast.success(`Category ${index + 1} image uploaded!`, { id: toastId });
            } else {
                toast.error(response.message || 'Failed to upload image', { id: toastId });
            }
        } catch (error) {
            console.error('Error uploading category image:', error);
            toast.error('Failed to upload image', { id: toastId });
        } finally {
            setUploadingIndex(null);
        }
    }, [storiesData]);

    const handleRemoveMainImage = useCallback(async () => {
        if (!storiesData || !storiesData._id) return;

        const toastId = toast.loading('Removing image...');

        try {
            const response = await storiesAPI.removeMainImage(storiesData._id);
            if (response.success && response.data) {
                setStoriesData(response.data);
                setMainImageFile(null);
                toast.success('Image removed!', { id: toastId });
            } else {
                toast.error(response.message || 'Failed to remove image', { id: toastId });
            }
        } catch (error) {
            console.error('Error removing image:', error);
            toast.error('Failed to remove image', { id: toastId });
        }
    }, [storiesData]);

    const handleRemoveCategoryImage = useCallback(async (index: number) => {
        if (!storiesData || !storiesData._id) return;

        const toastId = toast.loading('Removing image...');

        try {
            const response = await storiesAPI.removeCategoryImage(storiesData._id, index);
            if (response.success && response.data) {
                setStoriesData(response.data);
                setCategoryFiles(prev => {
                    const newMap = new Map(prev);
                    newMap.delete(index);
                    return newMap;
                });
                toast.success('Image removed!', { id: toastId });
            } else {
                toast.error(response.message || 'Failed to remove image', { id: toastId });
            }
        } catch (error) {
            console.error('Error removing image:', error);
            toast.error('Failed to remove image', { id: toastId });
        }
    }, [storiesData]);

    // ============================================================================
    // ✅ FIXED: Save Handler with FormData
    // ============================================================================

    const handleSave = useCallback(async () => {
        if (!storiesData) return;

        setIsSaving(true);
        const toastId = toast.loading(isNew ? 'Creating stories section...' : 'Saving stories section...');

        try {
            let response;

            // ✅ Use FormData for file uploads
            const formData = new FormData();

            // Append basic fields
            formData.append('heading', storiesData.heading || '');
            formData.append('subtitle', storiesData.subtitle || '');
            formData.append('isActive', String(storiesData.isActive));
            formData.append('backgroundColor', storiesData.backgroundColor || '#ffffff');
            formData.append('textColor', storiesData.textColor || '#071322');
            formData.append('sectionId', storiesData.sectionId || 'stories');

            // Append main story as JSON
            formData.append('mainStory', JSON.stringify({
                quote: storiesData.mainStory.quote || '',
                linkText: storiesData.mainStory.linkText || 'See All Deployment Stories →',
                link: storiesData.mainStory.link || '/stories',
                imageUrl: storiesData.mainStory.imageUrl || '',
                isActive: storiesData.mainStory.isActive
            }));

            // Append categories as JSON
            formData.append('categories', JSON.stringify(storiesData.categories || []));

            // ✅ Append main image file if selected
            if (mainImageFile) {
                formData.append('mainImage', mainImageFile);
                console.log('📸 Appending main image:', mainImageFile.name);
            }

            // ✅ Append category image files if selected
            if (categoryFiles.size > 0) {
                categoryFiles.forEach((file, index) => {
                    formData.append(`category_${index}`, file);
                    console.log(`📸 Appending category ${index} image:`, file.name);
                });
            }

            if (isNew || !storiesData._id) {
                response = await storiesAPI.createWithFormData(formData);
            } else {
                response = await storiesAPI.updateWithFormData(storiesData._id, formData);
            }

            if (response.success) {
                toast.success(isNew ? 'Stories section created!' : 'Stories section updated!', { id: toastId });
                setIsNew(false);
                // Clear file states after successful save
                setMainImageFile(null);
                setCategoryFiles(new Map());
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
    }, [storiesData, isNew, fetchStoriesData, mainImageFile, categoryFiles]);

    // ============================================================================
    // File selection handlers
    // ============================================================================

    const handleMainFileSelect = useCallback((file: File) => {
        setMainImageFile(file);
    }, []);

    const handleCategoryFileSelect = useCallback((index: number, file: File) => {
        setCategoryFiles(prev => {
            const newMap = new Map(prev);
            newMap.set(index, file);
            return newMap;
        });
    }, []);

    // ============================================================================
    // Loading State
    // ============================================================================

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto" />
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
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
                        className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition disabled:opacity-50 shadow-sm hover:shadow"
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

            {/* ============================================================ */}
            {/* CONTENT SECTION */}
            {/* ============================================================ */}

            <div className="space-y-6">
                {/* 1. Content Section */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                    <div
                        className="flex items-center justify-between p-5 cursor-pointer hover:bg-slate-50/50 transition-colors"
                        onClick={() => setMainSectionExpanded(!mainSectionExpanded)}
                    >
                        <h2 className="text-sm font-bold text-slate-900">📝 Content</h2>
                        <button className="text-slate-400">
                            {mainSectionExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                    </div>
                    {mainSectionExpanded && (
                        <div className="p-5 border-t border-slate-100 space-y-4">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Heading <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={storiesData.heading || ''}
                                    onChange={(e) => updateField('heading', e.target.value)}
                                    placeholder="e.g., Discover Our Stories"
                                    className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-500 transition"
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
                                    className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-500 transition resize-none"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* 2. Main Story Section */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-slate-100">
                        <h2 className="text-sm font-bold text-slate-900">⭐ Main Story</h2>
                    </div>
                    <div className="p-5 space-y-4">
                        <ImageUpload
                            label="Main Story Image"
                            value={storiesData.mainStory.imageUrl || ''}
                            onUpload={handleMainImageUpload}
                            onRemove={handleRemoveMainImage}
                            isUploading={uploadingIndex === -1}
                            itemTitle="Main Story"
                            onFileSelect={handleMainFileSelect}
                        />

                        <div>
                            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Quote <span className="text-rose-500">*</span>
                            </label>
                            <textarea
                                value={storiesData.mainStory.quote || ''}
                                onChange={(e) => updateMainStory('quote', e.target.value)}
                                rows={4}
                                placeholder="Enter the main story quote..."
                                className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-500 transition resize-none"
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
                                    className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-500 transition"
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
                                    className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-500 transition"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={storiesData.mainStory.isActive}
                                    onChange={(e) => updateMainStory('isActive', e.target.checked)}
                                    className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                />
                                <span className="text-xs font-semibold text-slate-700">Main Story Active</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* 3. Categories Section with Repeater */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between p-5 border-b border-slate-100">
                        <h2 className="text-sm font-bold text-slate-900">
                            📂 Categories ({storiesData.categories?.length || 0})
                        </h2>
                        <button
                            onClick={addCategory}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 px-3 py-1.5 rounded-xl transition"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            Add Category
                        </button>
                    </div>
                    <div className="p-4 space-y-3">
                        {storiesData.categories?.length === 0 ? (
                            <div className="text-center py-8 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                <p className="text-xs text-slate-400 font-medium">No categories configured. Click "Add Category" to get started.</p>
                            </div>
                        ) : (
                            storiesData.categories.map((category, index) => (
                                <CategoryCard
                                    key={`${category._id || category.title}-${index}`}
                                    category={category}
                                    index={index}
                                    totalCategories={storiesData.categories.length}
                                    onUpdate={updateCategory}
                                    onRemove={removeCategory}
                                    onMove={moveCategory}
                                    onImageUpload={handleCategoryImageUpload}
                                    onImageRemove={handleRemoveCategoryImage}
                                    isUploading={uploadingIndex === index}
                                    onFileSelect={handleCategoryFileSelect}
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}