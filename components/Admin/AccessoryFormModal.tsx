// components/Admin/AccessoryFormModal.tsx
'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import { isDefaultImage } from '@/utils/imageHelper';
import TextEditor from './TextEditor';

// ============================================
// TYPES
// ============================================
interface AccessoryFormData {
    name: string;
    model: string;
    brand: string;
    category: string;
    categoryLabel: string;
    imageUrl: string;
    galleryImages: string[];
    price: number;
    rating: number;
    specs: string[];
    shortDescription: string;
    description: string;
    features: string[];
    technicalDetails: {
        powerOutput: string;
        inputVoltage: string;
        connectorType: string;
        dimensions: string;
        weight: string;
        enclosureRating: string;
        warranty: string;
    };
    stock: number;
    isActive: boolean;
    isAccessory: boolean;
    parentProductId: string;
    compatibleWith: string[];
    accessoryType: string;
}

interface Brand {
    _id: string;
    id: string;
    name: string;
    icon: string;
    isActive: boolean;
}

interface Product {
    _id: string;
    id: string;
    name: string;
    model: string;
    isActive: boolean;
}

interface Category {
    _id: string;
    id: string;
    name: string;
    icon: string;
    isActive: boolean;
    level?: number;
}

interface AccessoryFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (formData: FormData) => Promise<void>;
    initialData?: AccessoryFormData | null;
    brands: Brand[];
    products: Product[];
    categories?: Category[];
    isSubmitting: boolean;
    title?: string;
    submitLabel?: string;
}

// ============================================
// CONSTANTS
// ============================================
const accessoryTypes = [
    { value: 'cable', label: '🔌 Cable' },
    { value: 'adapter', label: '🔗 Adapter' },
    { value: 'mount', label: '📍 Mount' },
    { value: 'rfid', label: '💳 RFID' },
    { value: 'management', label: '📜 Management' },
    { value: 'cover', label: '🛡️ Cover' },
    { value: 'pedestal', label: '🏗️ Pedestal' },
    { value: 'meter', label: '📊 Meter' },
    { value: 'signage', label: '🚧 Signage' },
    { value: 'replacement', label: '🔧 Replacement' },
    { value: 'other', label: '📦 Other' },
];

const INITIAL_FORM: AccessoryFormData = {
    name: '',
    model: '',
    brand: '',
    category: '',
    categoryLabel: '',
    imageUrl: '',
    galleryImages: [],
    price: 0,
    rating: 0,
    specs: [],
    shortDescription: '',
    description: '',
    features: [],
    technicalDetails: {
        powerOutput: '',
        inputVoltage: '',
        connectorType: '',
        dimensions: '',
        weight: '',
        enclosureRating: '',
        warranty: '',
    },
    stock: 0,
    isActive: true,
    isAccessory: true,
    parentProductId: '',
    compatibleWith: [],
    accessoryType: 'other',
};

// ============================================
// CONSTANTS FOR IMAGE URL
// ============================================

// ✅ FIX: Remove /api from the URL for images
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const IMAGE_BASE_URL = API_BASE_URL.replace(/\/api$/, '').replace(/\/api\/?$/, '');

console.log('🔍 IMAGE_BASE_URL:', IMAGE_BASE_URL);

// ============================================
// TEXT ARRAY INPUT COMPONENT
// ============================================
const TextArrayInput = ({
    value,
    onChange,
    label,
    placeholder
}: {
    value: string[];
    onChange: (value: string[]) => void;
    label: string;
    placeholder: string;
}) => {
    const [inputValue, setInputValue] = useState('');

    const addItem = useCallback(() => {
        if (inputValue.trim()) {
            onChange([...value, inputValue.trim()]);
            setInputValue('');
        }
    }, [inputValue, onChange, value]);

    const removeItem = useCallback((index: number) => {
        onChange(value.filter((_, i) => i !== index));
    }, [onChange, value]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addItem();
        }
    }, [addItem]);

    return (
        <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                {label}
            </label>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="flex-1 px-3.5 py-2 text-sm text-black bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all"
                />
                <button
                    type="button"
                    onClick={addItem}
                    className="px-4 py-2 bg-[#0B192C] text-white rounded-xl text-sm font-bold hover:bg-[#1E3E62] transition-colors whitespace-nowrap"
                >
                    Add
                </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
                {value.map((item, index) => (
                    <span
                        key={index}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-full"
                    >
                        {item}
                        <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="text-emerald-400 hover:text-emerald-600 transition-colors"
                        >
                            ×
                        </button>
                    </span>
                ))}
            </div>
        </div>
    );
};

// ============================================
// GALLERY UPLOAD COMPONENT - STORE AS FILES
// ============================================
interface GalleryUploadProps {
    value: string[]; // Store image URLs from server
    onChange: (images: string[]) => void;
    onFilesChange?: (files: File[]) => void; // For storing File objects
    maxImages?: number;
    maxSize?: number;
}
// components/Admin/AccessoryFormModal.tsx - Updated GalleryUpload

// components/Admin/AccessoryFormModal.tsx - Updated GalleryUpload

// components/Admin/AccessoryFormModal.tsx - Complete Fixed GalleryUpload

const GalleryUpload: React.FC<GalleryUploadProps> = ({
    value = [],
    onChange,
    onFilesChange,
    maxImages = 10,
    maxSize = 5,
}) => {
    const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
    const [localPreviews, setLocalPreviews] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [failedImages, setFailedImages] = useState<Set<number>>(new Set());
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Initialize local previews from existing server URLs OR new files
    useEffect(() => {
        console.log('📸 GalleryUpload - value received:', value);
        console.log('📸 GalleryUpload - galleryFiles length:', galleryFiles.length);

        // If we have gallery files (new uploads), use their blob URLs
        if (galleryFiles.length > 0) {
            const blobUrls = galleryFiles.map(file => URL.createObjectURL(file));
            setLocalPreviews(blobUrls);
            setFailedImages(new Set());
            return;
        }

        // If we have existing value (server URLs or filenames)
        if (value && value.length > 0) {
            // Check if value is an array, if not, try to parse it
            let imageArray = value;
            if (typeof value === 'string') {
                try {
                    imageArray = JSON.parse(value);
                } catch (e) {
                    imageArray = [];
                }
            }

            // Ensure it's an array
            if (!Array.isArray(imageArray)) {
                imageArray = [];
            }

            console.log('📸 GalleryUpload - parsed imageArray:', imageArray);

            const previews = imageArray.map((img: string) => {
                // If it's already a full URL (base64 or http)
                if (img.startsWith('data:image') || img.startsWith('http://') || img.startsWith('https://')) {
                    return img;
                }
                // If it starts with /uploads, prepend base URL
                if (img.startsWith('/uploads')) {
                    return `${IMAGE_BASE_URL}${img}`;
                }
                // If it's just a filename, assume it's in /uploads/products/
                const fullUrl = `${IMAGE_BASE_URL}/uploads/products/${img}`;
                console.log(`📸 GalleryUpload - generated URL for ${img}:`, fullUrl);
                return fullUrl;
            });
            setLocalPreviews(previews);
            setFailedImages(new Set());
        } else {
            setLocalPreviews([]);
            setFailedImages(new Set());
        }
    }, [value, galleryFiles]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        // Check current count
        let currentCount = 0;
        if (Array.isArray(value)) {
            currentCount = value.length;
        } else if (typeof value === 'string') {
            try {
                const parsed = JSON.parse(value);
                if (Array.isArray(parsed)) {
                    currentCount = parsed.length;
                }
            } catch (e) {
                currentCount = 0;
            }
        }

        if (files.length + currentCount > maxImages) {
            toast.error(`Maximum ${maxImages} images allowed`);
            return;
        }

        setIsUploading(true);

        try {
            const validFiles: File[] = [];
            const newPreviews: string[] = [];

            for (const file of files) {
                if (!file.type.startsWith('image/')) {
                    toast.error(`${file.name} is not an image`);
                    continue;
                }

                if (file.size > maxSize * 1024 * 1024) {
                    toast.error(`${file.name} exceeds ${maxSize}MB limit`);
                    continue;
                }

                validFiles.push(file);
                // ✅ Create blob URL for preview
                const previewUrl = URL.createObjectURL(file);
                newPreviews.push(previewUrl);
            }

            if (validFiles.length === 0) return;

            // ✅ Store files for later submission
            const updatedFiles = [...galleryFiles, ...validFiles];
            setGalleryFiles(updatedFiles);
            if (onFilesChange) {
                onFilesChange(updatedFiles);
            }

            // ✅ Update local previews with blob URLs
            setLocalPreviews([...localPreviews, ...newPreviews]);

            // ✅ Update value with filenames (for server storage reference)
            let currentValue = [];
            if (Array.isArray(value)) {
                currentValue = value;
            } else if (typeof value === 'string') {
                try {
                    const parsed = JSON.parse(value);
                    if (Array.isArray(parsed)) {
                        currentValue = parsed;
                    }
                } catch (e) {
                    currentValue = [];
                }
            }

            const newFileNames = validFiles.map(f => f.name);
            const updatedValue = [...currentValue, ...newFileNames];
            onChange(updatedValue);

            toast.success(`Added ${validFiles.length} image(s)`);
        } catch (error) {
            console.error('Gallery upload error:', error);
            toast.error('Failed to upload images');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const removeImage = (index: number) => {
        // Remove from files
        const newFiles = galleryFiles.filter((_, i) => i !== index);
        setGalleryFiles(newFiles);
        if (onFilesChange) {
            onFilesChange(newFiles);
        }

        // Revoke blob URL to avoid memory leaks
        if (localPreviews[index]?.startsWith('blob:')) {
            URL.revokeObjectURL(localPreviews[index]);
        }

        // Remove from previews
        const newPreviews = localPreviews.filter((_, i) => i !== index);
        setLocalPreviews(newPreviews);

        // Remove from value
        let currentValue = [];
        if (Array.isArray(value)) {
            currentValue = value;
        } else if (typeof value === 'string') {
            try {
                const parsed = JSON.parse(value);
                if (Array.isArray(parsed)) {
                    currentValue = parsed;
                }
            } catch (e) {
                currentValue = [];
            }
        }

        const newValue = currentValue.filter((_, i) => i !== index);
        onChange(newValue);

        // Reset failed images set
        setFailedImages(new Set());
    };

    // Get current count safely
    const getCurrentCount = () => {
        if (Array.isArray(value)) {
            return value.length;
        }
        if (typeof value === 'string') {
            try {
                const parsed = JSON.parse(value);
                if (Array.isArray(parsed)) {
                    return parsed.length;
                }
            } catch (e) {
                return 0;
            }
        }
        return 0;
    };

    // ✅ Clean up blob URLs on unmount
    useEffect(() => {
        return () => {
            localPreviews.forEach(url => {
                if (url.startsWith('blob:')) {
                    URL.revokeObjectURL(url);
                }
            });
        };
    }, []);

    return (
        <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                {`Product Gallery (Up to ${maxImages} Images)`}
            </label>
            <div className="flex flex-wrap gap-3">
                {localPreviews.map((img, index) => {
                    const hasFailed = failedImages.has(index);
                    console.log(`📸 GalleryUpload - rendering image ${index}:`, img, 'hasFailed:', hasFailed);
                    return (
                        <div key={index} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 shadow-xs">
                            {!hasFailed ? (
                                <img
                                    src={img}
                                    alt={`Gallery ${index + 1}`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        console.error('❌ Failed to load gallery image:', img);
                                        setFailedImages(prev => new Set(prev).add(index));
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                        const parent = target.parentElement;
                                        if (parent) {
                                            const fallback = document.createElement('div');
                                            fallback.className = 'w-full h-full flex items-center justify-center text-2xl bg-gray-100';
                                            fallback.textContent = '🖼️';
                                            parent.appendChild(fallback);
                                        }
                                    }}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-2xl bg-gray-100">
                                    🖼️
                                </div>
                            )}
                            <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors z-10"
                            >
                                ×
                            </button>
                        </div>
                    );
                })}
                {getCurrentCount() < maxImages && (
                    <label className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center cursor-pointer hover:border-[#0B192C] transition-colors bg-slate-50">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                        <span className="text-2xl text-slate-400">+</span>
                    </label>
                )}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
                {getCurrentCount()} of {maxImages} images selected
            </p>
            {isUploading && (
                <p className="text-xs text-blue-500 mt-1">Uploading images...</p>
            )}
        </div>
    );
};

// ============================================
// PRODUCT THUMBNAIL COMPONENT
// ============================================
interface ProductThumbnailProps {
    imageUrl: string;
    name: string;
    className?: string;
}

const ProductThumbnail: React.FC<ProductThumbnailProps> = ({
    imageUrl,
    name,
    className = ''
}) => {
    const [hasError, setHasError] = useState<boolean>(false);

    const getFullUrl = useCallback((path: string): string | null => {
        if (!path || path.trim() === '') return null;
        const trimmed = path.trim();

        if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
            return trimmed;
        }

        const baseUrl = IMAGE_BASE_URL;

        if (trimmed.startsWith('/uploads')) {
            return `${baseUrl}${trimmed}`;
        }

        return `${baseUrl}/uploads/products/${trimmed}`;
    }, []);

    const fullUrl = getFullUrl(imageUrl);

    const showFallback = !imageUrl || hasError || !fullUrl || isDefaultImage(imageUrl);

    if (showFallback) {
        return (
            <div className={`w-full h-full flex items-center justify-center bg-gray-100 ${className}`}>
                <span className="text-2xl">⚡</span>
            </div>
        );
    }

    return (
        <img
            src={fullUrl}
            alt={name}
            className={`w-full h-full object-cover ${className}`}
            onError={(e) => {
                console.error('❌ Failed to load image:', fullUrl);
                setHasError(true);
                e.currentTarget.style.display = 'none';
            }}
            loading="lazy"
        />
    );
};

// ============================================
// MAIN MODAL COMPONENT
// ============================================
export default function AccessoryFormModal({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    brands,
    products,
    categories = [],
    isSubmitting,
    title = 'Add New Accessory',
    submitLabel = 'Create Accessory',
}: AccessoryFormModalProps) {
    const [formData, setFormData] = useState<AccessoryFormData>(INITIAL_FORM);
    const [mainImageFile, setMainImageFile] = useState<File | null>(null);
    const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ============================================
    // EFFECTS
    // ============================================

    // Reset form when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData(initialData);
                if (initialData.imageUrl) {
                    const url = initialData.imageUrl.startsWith('/uploads')
                        ? `${IMAGE_BASE_URL}${initialData.imageUrl}`
                        : initialData.imageUrl;
                    setImagePreview(url || '');
                } else {
                    setImagePreview('');
                    setMainImageFile(null);
                }
                // Reset gallery files
                setGalleryFiles([]);
            } else {
                setFormData({ ...INITIAL_FORM });
                setImagePreview('');
                setMainImageFile(null);
                setGalleryFiles([]);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            }
        }
    }, [initialData, isOpen]);

    // Clean up preview URLs on unmount
    useEffect(() => {
        return () => {
            if (imagePreview && imagePreview.startsWith('blob:')) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    // ============================================
    // MEMOIZED VALUES
    // ============================================

    const activeProducts = useMemo(() => {
        if (!products || !Array.isArray(products)) {
            return [];
        }
        return products.filter(p => p.isActive !== false && p.name && p.name.trim() !== '');
    }, [products]);

    const activeBrands = useMemo(() => {
        return brands?.filter(b => b.isActive !== false) || [];
    }, [brands]);

    const activeCategories = useMemo(() => {
        if (!categories || !Array.isArray(categories)) {
            return [];
        }
        return categories.filter(c => c.isActive !== false);
    }, [categories]);

    // ============================================
    // HANDLERS
    // ============================================

    const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
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

        setMainImageFile(file);
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);
        setFormData((prev) => ({ ...prev, imageUrl: file.name }));
        toast.success('Image selected');

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, []);

    const removeImage = useCallback(() => {
        if (imagePreview && imagePreview.startsWith('blob:')) {
            URL.revokeObjectURL(imagePreview);
        }
        setMainImageFile(null);
        setImagePreview('');
        setFormData((prev) => ({ ...prev, imageUrl: '' }));
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [imagePreview]);

    const handleGalleryFilesChange = useCallback((files: File[]) => {
        setGalleryFiles(files);
    }, []);

    // Handle Form Submit
    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate required fields
        if (!formData.name.trim()) {
            toast.error('Accessory name is required');
            return;
        }
        if (!formData.model.trim()) {
            toast.error('Model is required');
            return;
        }
        if (!formData.brand) {
            toast.error('Brand is required');
            return;
        }
        if (!formData.category) {
            toast.error('Category is required');
            return;
        }
        if (!formData.parentProductId) {
            toast.error('Parent product is required');
            return;
        }
        if (!formData.accessoryType) {
            toast.error('Accessory type is required');
            return;
        }
        if (!mainImageFile && !initialData?.imageUrl) {
            toast.error('Main image is required');
            return;
        }

        setIsProcessing(true);

        try {
            const formDataToSend = new FormData();

            // Append all text fields
            formDataToSend.append('name', formData.name.trim());
            formDataToSend.append('model', formData.model.trim());
            formDataToSend.append('brand', formData.brand);
            formDataToSend.append('category', formData.category);
            formDataToSend.append('categoryLabel', formData.categoryLabel || 'Accessory');
            formDataToSend.append('price', String(formData.price || 0));
            formDataToSend.append('rating', String(formData.rating || 0));
            formDataToSend.append('stock', String(formData.stock || 0));
            formDataToSend.append('isActive', String(formData.isActive));
            formDataToSend.append('parentProductId', formData.parentProductId);
            formDataToSend.append('accessoryType', formData.accessoryType);
            formDataToSend.append('isAccessory', 'true');

            // Append arrays as JSON strings
            formDataToSend.append('specs', JSON.stringify(formData.specs || []));
            formDataToSend.append('features', JSON.stringify(formData.features || []));
            formDataToSend.append('compatibleWith', JSON.stringify([formData.parentProductId]));

            // Append descriptions
            formDataToSend.append('shortDescription', formData.shortDescription || '');
            formDataToSend.append('description', formData.description || '');

            // Append technical details as JSON
            formDataToSend.append('technicalDetails', JSON.stringify({
                powerOutput: formData.technicalDetails.powerOutput || 'N/A',
                inputVoltage: formData.technicalDetails.inputVoltage || 'N/A',
                connectorType: formData.technicalDetails.connectorType || 'N/A',
                dimensions: formData.technicalDetails.dimensions || 'N/A',
                weight: formData.technicalDetails.weight || 'N/A',
                enclosureRating: formData.technicalDetails.enclosureRating || 'N/A',
                warranty: formData.technicalDetails.warranty || 'N/A',
            }));

            // ✅ Append gallery images as FILES (not base64)
            galleryFiles.forEach((file) => {
                formDataToSend.append('galleryImages', file);
            });

            // Append main image if new file selected
            if (mainImageFile) {
                formDataToSend.append('image', mainImageFile);
            }

            console.log('📦 Sending Accessory FormData:');
            for (let [key, value] of formDataToSend.entries()) {
                if (value instanceof File) {
                    console.log(`  ${key}: File(${value.name}, ${value.size} bytes)`);
                } else {
                    console.log(`  ${key}: ${value}`);
                }
            }

            await onSubmit(formDataToSend);

            if (!isSubmitting) {
                setFormData(INITIAL_FORM);
                setMainImageFile(null);
                setGalleryFiles([]);
                setImagePreview('');
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            }
        } catch (error) {
            console.error('Submit error:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to submit form');
        } finally {
            setIsProcessing(false);
        }
    }, [formData, mainImageFile, galleryFiles, initialData, onSubmit, isSubmitting]);

    const updateField = useCallback(<K extends keyof AccessoryFormData>(
        field: K,
        value: AccessoryFormData[K]
    ) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    }, []);

    const updateTechnicalDetails = useCallback(<K extends keyof AccessoryFormData['technicalDetails']>(
        field: K,
        value: string
    ) => {
        setFormData((prev) => ({
            ...prev,
            technicalDetails: { ...prev.technicalDetails, [field]: value }
        }));
    }, []);

    const handleParentProductChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        const parentId = e.target.value;
        setFormData((prev) => ({
            ...prev,
            parentProductId: parentId,
            compatibleWith: parentId ? [parentId] : []
        }));
    }, []);

    // ============================================
    // CONDITIONAL RETURN
    // ============================================

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B192C]/40 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-200">
                {/* HEADER */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                    <div>
                        <h2 className="text-lg font-bold text-[#0B192C]">{title}</h2>
                        <p className="text-xs text-slate-500">
                            {title.includes('Edit') ? 'Update accessory details' : 'Create a new product accessory'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors disabled:opacity-50"
                        aria-label="Close modal"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* FORM */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Accessory Name <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => updateField('name', e.target.value)}
                                required
                                placeholder="e.g., Type 2 Charging Cable 5m"
                                className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Model <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.model}
                                onChange={(e) => updateField('model', e.target.value)}
                                required
                                placeholder="e.g., CBL-T2-5M"
                                className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Brand <span className="text-rose-500">*</span>
                            </label>
                            <select
                                value={formData.brand}
                                onChange={(e) => updateField('brand', e.target.value)}
                                required
                                className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all"
                            >
                                <option value="">Select a brand...</option>
                                {activeBrands.map((brand) => (
                                    <option key={brand.id || brand._id} value={brand.id || brand._id}>
                                        {brand.icon} {brand.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Category <span className="text-rose-500">*</span>
                            </label>
                            <select
                                value={formData.category}
                                onChange={(e) => {
                                    const categoryId = e.target.value;
                                    const selectedCategory = activeCategories.find(c => c.id === categoryId || c._id === categoryId);
                                    setFormData((prev) => ({
                                        ...prev,
                                        category: categoryId,
                                        categoryLabel: selectedCategory?.name || ''
                                    }));
                                }}
                                required
                                className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all"
                            >
                                <option value="">Select a category...</option>
                                {activeCategories.map((category) => (
                                    <option key={category.id || category._id} value={category.id || category._id}>
                                        {category.icon} {category.name}
                                    </option>
                                ))}
                            </select>
                            {activeCategories.length === 0 && (
                                <p className="text-xs text-amber-600 mt-1">
                                    ⚠️ No categories available. Please create a category first.
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Accessory Type <span className="text-rose-500">*</span>
                            </label>
                            <select
                                value={formData.accessoryType}
                                onChange={(e) => updateField('accessoryType', e.target.value)}
                                required
                                className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all"
                            >
                                <option value="">Select type...</option>
                                {accessoryTypes.map((type) => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Price ($) <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="number"
                                value={formData.price}
                                onChange={(e) => updateField('price', parseFloat(e.target.value) || 0)}
                                required
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Stock
                            </label>
                            <input
                                type="number"
                                value={formData.stock}
                                onChange={(e) => updateField('stock', parseInt(e.target.value) || 0)}
                                min="0"
                                placeholder="0"
                                className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Parent Product <span className="text-rose-500">*</span>
                            </label>
                            <select
                                value={formData.parentProductId}
                                onChange={handleParentProductChange}
                                required
                                className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all"
                            >
                                <option value="">Select a parent product...</option>
                                {activeProducts.length > 0 ? (
                                    activeProducts.map((product) => (
                                        <option
                                            key={product.id || product._id}
                                            value={product.id || product._id}
                                        >
                                            {product.name} {product.model ? `(${product.model})` : ''}
                                        </option>
                                    ))
                                ) : (
                                    <option value="" disabled>No products available. Create a product first.</option>
                                )}
                            </select>
                            {activeProducts.length === 0 && (
                                <p className="text-xs text-amber-600 mt-1">
                                    ⚠️ No active products available. Please create a product first.
                                </p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">
                                Total products: {products?.length || 0}
                            </p>
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Rating (0.0 - 5.0)
                            </label>
                            <input
                                type="number"
                                value={formData.rating}
                                onChange={(e) => updateField('rating', parseFloat(e.target.value) || 0)}
                                min="0"
                                max="5"
                                step="0.1"
                                placeholder="0.0"
                                className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all"
                            />
                        </div>
                    </div>

                    {/* Product Media */}
                    <div className="border-t border-slate-100 pt-4">
                        <h3 className="text-xs font-bold text-[#0B192C] uppercase tracking-wider mb-3">Product Media</h3>

                        {/* Primary Cover Image */}
                        <div className="mb-4">
                            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Primary Cover Image <span className="text-rose-500">*</span>
                                {isProcessing && <span className="text-blue-500 ml-2">(Processing...)</span>}
                            </label>
                            <div className="flex items-center gap-4">
                                {imagePreview ? (
                                    <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0 bg-slate-50">
                                        {imagePreview.startsWith('blob:') ? (
                                            <img
                                                src={imagePreview}
                                                alt="Accessory preview"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <ProductThumbnail
                                                imageUrl={imagePreview}
                                                name="Accessory preview"
                                                className="w-full h-full object-cover"
                                            />
                                        )}
                                        <button
                                            type="button"
                                            onClick={removeImage}
                                            className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors shadow-sm"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ) : (
                                    <div className="w-24 h-24 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 bg-slate-50 flex-shrink-0">
                                        <span className="text-2xl">📷</span>
                                    </div>
                                )}

                                <div className="flex-1">
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isProcessing || isSubmitting}
                                        className="px-4 py-2 border-2 border-dashed border-slate-300 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-colors text-sm text-slate-600 w-full disabled:opacity-50"
                                    >
                                        {isProcessing ? 'Processing...' : imagePreview ? 'Change Image' : 'Upload Cover Image'}
                                    </button>
                                    <p className="text-xs text-slate-400 mt-1">Select an image file (JPEG, PNG, WEBP, max 5MB)</p>
                                    {mainImageFile && (
                                        <p className="text-xs text-emerald-600 mt-1">
                                            Selected: {mainImageFile.name} ({(mainImageFile.size / 1024).toFixed(1)} KB)
                                        </p>
                                    )}
                                </div>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                            </div>
                        </div>

                        {/* Gallery Images - Updated to use files */}
                        <div>
                            <GalleryUpload
                                value={formData.galleryImages}
                                onChange={(images) => updateField('galleryImages', images)}
                                onFilesChange={handleGalleryFilesChange}
                                maxImages={10}
                                maxSize={5}
                            />
                        </div>
                    </div>

                    {/* Descriptions */}
                    <div className="border-t border-slate-100 pt-4 space-y-4">
                        <h3 className="text-xs font-bold text-[#0B192C] uppercase tracking-wider mb-2">Descriptions</h3>

                        <TextEditor
                            label="Short Overview"
                            required
                            value={formData.shortDescription}
                            onChange={(value) => updateField('shortDescription', value)}
                            placeholder="Write a brief product teaser..."
                            height={140}
                        />

                        <TextEditor
                            label="Full Technical & Marketing Description"
                            value={formData.description}
                            onChange={(value) => updateField('description', value)}
                            placeholder="Write in-depth equipment details..."
                            height={220}
                        />
                    </div>

                    {/* Specs */}
                    <div className="border-t border-slate-100 pt-4">
                        <TextArrayInput
                            label="Specifications"
                            value={formData.specs}
                            onChange={(specs) => updateField('specs', specs)}
                            placeholder="Enter a specification and press Enter"
                        />
                    </div>

                    {/* Features */}
                    <div className="border-t border-slate-100 pt-4">
                        <TextArrayInput
                            label="Features"
                            value={formData.features}
                            onChange={(features) => updateField('features', features)}
                            placeholder="Enter a feature and press Enter"
                        />
                    </div>

                    {/* Technical Details */}
                    <div className="border-t border-slate-100 pt-4">
                        <h4 className="text-sm font-bold text-[#0B192C] mb-4">Hardware Engineering Specs</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Power Output
                                </label>
                                <input
                                    type="text"
                                    value={formData.technicalDetails.powerOutput}
                                    onChange={(e) => updateTechnicalDetails('powerOutput', e.target.value)}
                                    placeholder="e.g., 7.4kW"
                                    className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Input Voltage
                                </label>
                                <input
                                    type="text"
                                    value={formData.technicalDetails.inputVoltage}
                                    onChange={(e) => updateTechnicalDetails('inputVoltage', e.target.value)}
                                    placeholder="e.g., 230V"
                                    className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Connector Type
                                </label>
                                <input
                                    type="text"
                                    value={formData.technicalDetails.connectorType}
                                    onChange={(e) => updateTechnicalDetails('connectorType', e.target.value)}
                                    placeholder="e.g., Type 2"
                                    className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Enclosure Rating
                                </label>
                                <input
                                    type="text"
                                    value={formData.technicalDetails.enclosureRating}
                                    onChange={(e) => updateTechnicalDetails('enclosureRating', e.target.value)}
                                    placeholder="e.g., IP67"
                                    className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Warranty
                                </label>
                                <input
                                    type="text"
                                    value={formData.technicalDetails.warranty}
                                    onChange={(e) => updateTechnicalDetails('warranty', e.target.value)}
                                    placeholder="e.g., 2 years"
                                    className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Dimensions
                                </label>
                                <input
                                    type="text"
                                    value={formData.technicalDetails.dimensions}
                                    onChange={(e) => updateTechnicalDetails('dimensions', e.target.value)}
                                    placeholder="e.g., 300 x 200 x 150mm"
                                    className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Weight
                                </label>
                                <input
                                    type="text"
                                    value={formData.technicalDetails.weight}
                                    onChange={(e) => updateTechnicalDetails('weight', e.target.value)}
                                    placeholder="e.g., 4.5kg"
                                    className="w-full px-3.5 py-2 text-black text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Active Flag */}
                    <div className="flex items-center gap-2 pt-1">
                        <input
                            type="checkbox"
                            id="accessory-active"
                            checked={formData.isActive}
                            onChange={(e) => updateField('isActive', e.target.checked)}
                            className="w-4 h-4 rounded-md border-slate-300 text-[#0B192C] focus:ring-[#0B192C]"
                        />
                        <label htmlFor="accessory-active" className="text-xs font-semibold text-slate-700 cursor-pointer">
                            Accessory Active
                        </label>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-5 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="flex-1 px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || isProcessing}
                            className="flex-1 bg-[#0B192C] hover:bg-[#1E3E62] text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-[#0B192C]/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSubmitting || isProcessing ? (
                                <>
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    {isSubmitting ? 'Saving...' : 'Processing...'}
                                </>
                            ) : submitLabel}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}