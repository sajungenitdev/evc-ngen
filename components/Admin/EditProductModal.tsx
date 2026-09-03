// components/Admin/EditProductModal.tsx
'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import TextEditor from './TextEditor';

// -----------------------------------------------------------------------------
// 1. Types & Data Contracts
// -----------------------------------------------------------------------------

export interface Brand {
    _id: string;
    id: string;
    name: string;
    description?: string;
    icon?: string;
    isActive: boolean;
}

export interface Category {
    _id: string;
    id: string;
    name: string;
    description?: string;
    icon?: string;
    level: number;
    isActive: boolean;
    parentId?: string | null;
    subcategories?: Category[];
}

export interface TechnicalDetails {
    powerOutput: string;
    inputVoltage: string;
    connectorType: string;
    enclosureRating: string;
    warranty: string;
    dimensions: string;
    weight: string;
}

export interface Product {
    _id: string;
    id: string;
    name: string;
    model: string;
    brand: string;
    brandDetails?: Brand;
    category: string;
    categoryDetails?: Category;
    categoryLabel: string;
    imageUrl: string;
    galleryImages: string[];
    price: number;
    rating: number;
    specs: string[];
    shortDescription: string;
    description: string;
    features: string[];
    technicalDetails: TechnicalDetails;
    stock: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ProductFormData {
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
    technicalDetails: TechnicalDetails;
    stock: number;
    isActive: boolean;
}

interface EditProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: ProductFormData) => Promise<void>;
    product: Product | null;
    brands: Brand[];
    categories: Category[];
    isSubmitting: boolean;
}

const INITIAL_TECHNICAL_DETAILS: TechnicalDetails = {
    powerOutput: '',
    inputVoltage: '',
    connectorType: '',
    enclosureRating: '',
    warranty: '',
    dimensions: '',
    weight: '',
};

const INITIAL_FORM: ProductFormData = {
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
    technicalDetails: INITIAL_TECHNICAL_DETAILS,
    stock: 0,
    isActive: true,
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const IMAGE_BASE_URL = API_BASE_URL.replace(/\/api$/, '');

// -----------------------------------------------------------------------------
// 2. ImgBB Upload Helper
// -----------------------------------------------------------------------------

const uploadToImgBB = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);

    try {
        const response = await fetch('https://api.imgbb.com/1/upload?key=a4f5c180c07ea3daa980fcfb759c35a7', {
            method: 'POST',
            body: formData,
        });
        const data = await response.json();

        if (data.success) {
            return data.data.url;
        } else {
            throw new Error(data.error?.message || 'Failed to upload to ImgBB');
        }
    } catch (error) {
        console.error('ImgBB upload error:', error);
        throw error;
    }
};

// -----------------------------------------------------------------------------
// 3. Gallery Upload Component
// -----------------------------------------------------------------------------

interface GalleryUploadProps {
    value?: string[];
    onChange: (images: string[]) => void;
    onFilesChange?: (files: File[]) => void;
    maxImages?: number;
    maxSize?: number;
}

const GalleryUpload: React.FC<GalleryUploadProps> = ({
    value = [],
    onChange,
    onFilesChange,
    maxImages = 10,
    maxSize = 5,
}) => {
    const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
    const [localPreviews, setLocalPreviews] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const getFullImageUrl = (imagePath: string): string => {
        if (!imagePath) return '';
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath;
        }
        if (imagePath.startsWith('data:image')) {
            return imagePath;
        }
        if (imagePath.startsWith('blob:')) {
            return imagePath;
        }
        if (imagePath.startsWith('/uploads')) {
            return `${IMAGE_BASE_URL}${imagePath}`;
        }
        return `${IMAGE_BASE_URL}/uploads/products/${imagePath}`;
    };

    useEffect(() => {
        if (galleryFiles.length > 0) {
            const blobUrls = galleryFiles.map((file) => URL.createObjectURL(file));
            setLocalPreviews(blobUrls);
            return;
        }

        if (value && value.length > 0) {
            let imageArray: string[] = [];
            if (Array.isArray(value)) {
                imageArray = value;
            } else if (typeof value === 'string') {
                try {
                    const parsed = JSON.parse(value);
                    if (Array.isArray(parsed)) imageArray = parsed;
                } catch {
                    imageArray = [];
                }
            }

            const previews = imageArray.map((img) => getFullImageUrl(img));
            setLocalPreviews(previews);
        } else {
            setLocalPreviews([]);
        }
    }, [value, galleryFiles]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        const currentCount = Array.isArray(value) ? value.length : 0;
        if (files.length + currentCount > maxImages) {
            toast.error(`Maximum ${maxImages} images allowed`);
            return;
        }

        const validFiles: File[] = [];
        const newPreviews: string[] = [];

        for (const file of files) {
            if (!file.type.startsWith('image/')) {
                toast.error(`${file.name} is not a supported image file`);
                continue;
            }

            if (file.size > maxSize * 1024 * 1024) {
                toast.error(`${file.name} exceeds the ${maxSize}MB size limit`);
                continue;
            }

            validFiles.push(file);
            newPreviews.push(URL.createObjectURL(file));
        }

        if (validFiles.length === 0) return;

        const updatedFiles = [...galleryFiles, ...validFiles];
        setGalleryFiles(updatedFiles);
        onFilesChange?.(updatedFiles);

        setLocalPreviews((prev) => [...prev, ...newPreviews]);

        const currentValues = Array.isArray(value) ? value : [];
        onChange([...currentValues, ...validFiles.map((f) => f.name)]);

        toast.success(`Added ${validFiles.length} image(s)`);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const removeImage = (index: number) => {
        const newFiles = galleryFiles.filter((_, i) => i !== index);
        setGalleryFiles(newFiles);
        onFilesChange?.(newFiles);

        if (localPreviews[index]?.startsWith('blob:')) {
            URL.revokeObjectURL(localPreviews[index]);
        }

        const newPreviews = localPreviews.filter((_, i) => i !== index);
        setLocalPreviews(newPreviews);

        const currentValues = Array.isArray(value) ? value : [];
        onChange(currentValues.filter((_, i) => i !== index));
    };

    useEffect(() => {
        return () => {
            localPreviews.forEach((url) => {
                if (url.startsWith('blob:')) {
                    URL.revokeObjectURL(url);
                }
            });
        };
    }, [localPreviews]);

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Product Gallery
                </label>
                <span className="text-xs text-slate-400">
                    {localPreviews.length} / {maxImages} uploaded
                </span>
            </div>

            <div className="flex flex-wrap gap-3">
                {localPreviews.map((img, index) => (
                    <div
                        key={index}
                        className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 shadow-xs group"
                    >
                        <img
                            src={img}
                            alt={`Gallery preview ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 w-5 h-5 bg-rose-600 text-white rounded-full flex items-center justify-center text-xs hover:bg-rose-700 transition shadow-xs z-10"
                            title="Remove image"
                        >
                            ✕
                        </button>
                    </div>
                ))}

                {localPreviews.length < maxImages && (
                    <label className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-200 hover:border-slate-400 flex flex-col items-center justify-center cursor-pointer transition bg-slate-50/60 hover:bg-slate-50">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                        <span className="text-xl text-slate-400 leading-none mb-0.5">+</span>
                        <span className="text-[10px] font-semibold text-slate-500">Upload</span>
                    </label>
                )}
            </div>
            <p className="text-[11px] text-slate-400">Supported formats: JPEG, PNG, WEBP (up to {maxSize}MB each)</p>
        </div>
    );
};

// -----------------------------------------------------------------------------
// 4. Text Array Input Component
// -----------------------------------------------------------------------------

const TextArrayInput = ({
    value = [],
    onChange,
    label,
    placeholder,
}: {
    value?: string[];
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

    const removeItem = useCallback(
        (index: number) => {
            onChange(value.filter((_, i) => i !== index));
        },
        [onChange, value]
    );

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addItem();
            }
        },
        [addItem]
    );

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
                    className="flex-1 px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900 placeholder:text-slate-400 transition"
                />
                <button
                    type="button"
                    onClick={addItem}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold transition shrink-0"
                >
                    Add
                </button>
            </div>
            {value.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                    {value.map((item, index) => (
                        <span
                            key={index}
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium rounded-full"
                        >
                            {item}
                            <button
                                type="button"
                                onClick={() => removeItem(index)}
                                className="text-slate-400 hover:text-rose-600 transition"
                                aria-label={`Remove ${item}`}
                            >
                                ✕
                            </button>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
};

// -----------------------------------------------------------------------------
// 5. Build Category Hierarchy
// -----------------------------------------------------------------------------

const buildCategoryHierarchy = (categories: Category[]): Category[] => {
    const mainCategories = categories.filter(c => (c.level || 0) === 0 && c.isActive !== false);
    const subCategories = categories.filter(c => (c.level || 0) > 0 && c.isActive !== false);

    return mainCategories.map(main => {
        const children = subCategories.filter(sub =>
            sub.parentId === main.id ||
            sub.parentId === main._id ||
            sub.parentId === main.id?.toString() ||
            sub.parentId === main._id?.toString()
        );
        return {
            ...main,
            subcategories: children,
        };
    });
};

// -----------------------------------------------------------------------------
// 6. Main Modal Component
// -----------------------------------------------------------------------------

export default function EditProductModal({
    isOpen,
    onClose,
    onSubmit,
    product,
    brands,
    categories,
    isSubmitting,
}: EditProductModalProps) {
    const [formData, setFormData] = useState<ProductFormData>(INITIAL_FORM);
    const [mainImageFile, setMainImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const getFullImageUrl = useCallback((imagePath: string): string => {
        if (!imagePath) return '';
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath;
        }
        if (imagePath.startsWith('data:image')) {
            return imagePath;
        }
        if (imagePath.startsWith('blob:')) {
            return imagePath;
        }
        if (imagePath.startsWith('/uploads')) {
            return `${IMAGE_BASE_URL}${imagePath}`;
        }
        return `${IMAGE_BASE_URL}/uploads/products/${imagePath}`;
    }, []);

    const parseGalleryImages = useCallback((images: any): string[] => {
        if (!images) return [];
        if (Array.isArray(images)) {
            return images.filter(img => img && typeof img === 'string' && img.trim() !== '');
        }
        if (typeof images === 'string') {
            try {
                let parsed: unknown = images;
                while (typeof parsed === 'string' && parsed.startsWith('[')) {
                    parsed = JSON.parse(parsed);
                }
                return Array.isArray(parsed) ? parsed : [];
            } catch {
                return [];
            }
        }
        return [];
    }, []);

    // Sync product data when modal opens
    useEffect(() => {
        if (product && isOpen) {
            const galleryImages = parseGalleryImages(product.galleryImages);

            setFormData({
                name: product.name || '',
                model: product.model || '',
                brand: product.brand || '',
                category: product.category || '',
                categoryLabel: product.categoryLabel || '',
                imageUrl: product.imageUrl || '',
                galleryImages: galleryImages,
                price: product.price || 0,
                rating: product.rating || 0,
                specs: product.specs || [],
                shortDescription: product.shortDescription || '',
                description: product.description || '',
                features: product.features || [],
                technicalDetails: {
                    powerOutput: product.technicalDetails?.powerOutput || '',
                    inputVoltage: product.technicalDetails?.inputVoltage || '',
                    connectorType: product.technicalDetails?.connectorType || '',
                    enclosureRating: product.technicalDetails?.enclosureRating || '',
                    warranty: product.technicalDetails?.warranty || '',
                    dimensions: product.technicalDetails?.dimensions || '',
                    weight: product.technicalDetails?.weight || '',
                },
                stock: product.stock || 0,
                isActive: product.isActive !== undefined ? product.isActive : true,
            });

            setImagePreview(getFullImageUrl(product.imageUrl || ''));
            setMainImageFile(null);
            setGalleryFiles([]);
        }
    }, [product, isOpen, parseGalleryImages, getFullImageUrl]);

    if (!isOpen || !product) return null;

    // Category hierarchy for dropdown
    const categoryHierarchy = useMemo(() => {
        return buildCategoryHierarchy(categories);
    }, [categories]);

    const allActiveCategories = useMemo(() => {
        return categories.filter((c) => c.isActive !== false);
    }, [categories]);

    // Main Image Handlers
    const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please upload a valid image file');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size should not exceed 5MB');
            return;
        }

        setMainImageFile(file);
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);
        setFormData((prev) => ({ ...prev, imageUrl: file.name }));
        toast.success('Cover image chosen');

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, []);

    const removeCoverImage = useCallback(() => {
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

    // Category Selector Handler
    const handleCategoryChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedId = e.target.value;
        const selectedCat = allActiveCategories.find((c) => (c.id || c._id) === selectedId);
        setFormData((prev) => ({
            ...prev,
            category: selectedId,
            categoryLabel: selectedCat?.name || prev.categoryLabel,
        }));
    }, [allActiveCategories]);

    // Update field handler
    const updateField = useCallback(<K extends keyof ProductFormData>(field: K, value: ProductFormData[K]) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    }, []);

    const updateTechnicalDetails = useCallback(<K extends keyof TechnicalDetails>(field: K, value: string) => {
        setFormData((prev) => ({
            ...prev,
            technicalDetails: {
                ...prev.technicalDetails,
                [field]: value,
            },
        }));
    }, []);

    // Submit handler
    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            toast.error('Product name is required');
            return;
        }
        if (!formData.model.trim()) {
            toast.error('Model identifier is required');
            return;
        }
        if (!formData.brand) {
            toast.error('Brand selection is required');
            return;
        }
        if (!formData.category) {
            toast.error('Category selection is required');
            return;
        }
        if (!imagePreview && !product?.imageUrl) {
            toast.error('A primary cover image is required');
            return;
        }
        if (!formData.technicalDetails.weight.trim()) {
            toast.error('Technical specification: Weight is required');
            return;
        }

        setIsProcessing(true);
        const toastId = toast.loading('Saving product...');

        try {
            // Upload main image if it's a new file
            let mainImageUrl = formData.imageUrl;
            if (mainImageFile) {
                toast.loading('Uploading main image to ImgBB...', { id: toastId });
                mainImageUrl = await uploadToImgBB(mainImageFile);
            } else if (imagePreview && imagePreview.startsWith('blob:')) {
                const response = await fetch(imagePreview);
                const blob = await response.blob();
                const file = new File([blob], 'main-image.jpg', { type: 'image/jpeg' });
                toast.loading('Uploading main image to ImgBB...', { id: toastId });
                mainImageUrl = await uploadToImgBB(file);
            }

            // Build payload
            const payload: ProductFormData = {
                ...formData,
                imageUrl: mainImageUrl,
                galleryImages: formData.galleryImages || [],
                technicalDetails: {
                    powerOutput: formData.technicalDetails.powerOutput.trim() || 'N/A',
                    inputVoltage: formData.technicalDetails.inputVoltage.trim() || 'N/A',
                    connectorType: formData.technicalDetails.connectorType.trim() || 'N/A',
                    enclosureRating: formData.technicalDetails.enclosureRating.trim() || 'N/A',
                    warranty: formData.technicalDetails.warranty.trim() || 'N/A',
                    dimensions: formData.technicalDetails.dimensions.trim() || 'N/A',
                    weight: formData.technicalDetails.weight.trim(),
                },
            };

            await onSubmit(payload);
            toast.success('Product updated successfully!', { id: toastId });

        } catch (error) {
            console.error('Submit error:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to submit form', { id: toastId });
        } finally {
            setIsProcessing(false);
        }
    }, [formData, mainImageFile, imagePreview, product, onSubmit]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] shadow-2xl border border-slate-200 flex flex-col">

                {/* Sticky Header */}
                <div className="sticky top-0 z-10 bg-white rounded-t-3xl px-6 sm:px-8 pt-6 pb-4 border-b border-slate-100 shrink-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold tracking-tight text-slate-900">Edit Product</h2>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Update product specifications, media, and inventory
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            disabled={isSubmitting || isProcessing}
                            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition disabled:opacity-50"
                            aria-label="Close modal"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* General Information */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Product Name <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => updateField('name', e.target.value)}
                                    required
                                    placeholder="e.g., Ultra-Fast DC Charger 350kW"
                                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900 placeholder:text-slate-400 transition"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Model Code <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.model}
                                    onChange={(e) => updateField('model', e.target.value)}
                                    required
                                    placeholder="e.g., SXC-DCF-350"
                                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900 placeholder:text-slate-400 transition font-mono"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Brand Partner <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={formData.brand}
                                    onChange={(e) => updateField('brand', e.target.value)}
                                    required
                                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-700 transition"
                                >
                                    <option value="">Select brand...</option>
                                    {brands.filter(b => b.isActive !== false).map((brand) => (
                                        <option key={brand.id || brand._id} value={brand.id || brand._id}>
                                            {brand.icon} {brand.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Category Dropdown with Sub-categories */}
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Category Group <span className="text-rose-500">*</span>
                                    <span className="text-[10px] font-normal text-slate-400 ml-2">
                                        (Includes sub-categories)
                                    </span>
                                </label>
                                <select
                                    value={formData.category}
                                    onChange={handleCategoryChange}
                                    required
                                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-700 transition"
                                >
                                    <option value="">Select category...</option>
                                    {categoryHierarchy.map((mainCategory) => (
                                        <optgroup
                                            key={mainCategory.id || mainCategory._id}
                                            label={`${mainCategory.icon || '📂'} ${mainCategory.name}`}
                                        >
                                            <option value={mainCategory.id || mainCategory._id}>
                                                ─ {mainCategory.icon || '📂'} {mainCategory.name}
                                            </option>
                                            {mainCategory.subcategories && mainCategory.subcategories.length > 0 && (
                                                mainCategory.subcategories.map((sub) => (
                                                    <option
                                                        key={sub.id || sub._id}
                                                        value={sub.id || sub._id}
                                                        className="pl-4"
                                                    >
                                                        &nbsp;&nbsp;└─ {sub.icon || '📁'} {sub.name}
                                                    </option>
                                                ))
                                            )}
                                        </optgroup>
                                    ))}
                                    {allActiveCategories
                                        .filter(c => (c.level || 0) > 0 && !categoryHierarchy.some(main =>
                                            main.subcategories?.some(sub => (sub.id || sub._id) === (c.id || c._id))
                                        ))
                                        .map((subCategory) => (
                                            <option key={subCategory.id || subCategory._id} value={subCategory.id || subCategory._id}>
                                                &nbsp;&nbsp;└─ {subCategory.icon || '📁'} {subCategory.name}
                                            </option>
                                        ))
                                    }
                                </select>
                                <p className="text-[11px] text-slate-400 mt-1">Main categories shown with their sub-categories indented</p>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Base Price ($) <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => updateField('price', parseFloat(e.target.value) || 0)}
                                    required
                                    min="0"
                                    step="0.01"
                                    placeholder="0.00"
                                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900 font-mono transition"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Available Stock
                                </label>
                                <input
                                    type="number"
                                    value={formData.stock}
                                    onChange={(e) => updateField('stock', parseInt(e.target.value, 10) || 0)}
                                    min="0"
                                    placeholder="0"
                                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900 font-mono transition"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Rating (0.0 - 5.0)
                                </label>
                                <input
                                    type="number"
                                    value={formData.rating}
                                    onChange={(e) => updateField('rating', parseFloat(e.target.value) || 0)}
                                    min="0"
                                    max="5"
                                    step="0.1"
                                    placeholder="5.0"
                                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900 font-mono transition"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Category Tag / Label
                                </label>
                                <input
                                    type="text"
                                    value={formData.categoryLabel}
                                    onChange={(e) => updateField('categoryLabel', e.target.value)}
                                    placeholder="e.g., DC Fast"
                                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900 placeholder:text-slate-400 transition"
                                />
                            </div>
                        </div>

                        {/* Media Section */}
                        <div className="border-t border-slate-100 pt-5 space-y-5">
                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Product Media</h3>

                            {/* Cover Image */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Primary Cover Image <span className="text-rose-500">*</span>
                                </label>
                                <div className="flex items-center gap-4">
                                    {imagePreview ? (
                                        <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shrink-0 shadow-xs">
                                            <img
                                                src={imagePreview.startsWith('blob:') ? imagePreview : getFullImageUrl(imagePreview)}
                                                alt="Product preview"
                                                className="w-full h-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={removeCoverImage}
                                                className="absolute top-1.5 right-1.5 w-5 h-5 bg-rose-600 text-white rounded-full flex items-center justify-center text-xs hover:bg-rose-700 transition shadow-xs z-10"
                                                title="Remove image"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 bg-slate-50/60 shrink-0">
                                            <span className="text-2xl">📷</span>
                                        </div>
                                    )}

                                    <div className="flex-1">
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isProcessing || isSubmitting}
                                            className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 transition disabled:opacity-50"
                                        >
                                            {imagePreview ? 'Change Cover Image' : 'Select Cover Image'}
                                        </button>
                                        <p className="text-[11px] text-slate-400 mt-1">JPEG, PNG, WEBP (Max 5MB)</p>
                                        {mainImageFile && (
                                            <p className="text-xs text-emerald-600 font-medium mt-1">
                                                ✓ {mainImageFile.name} ({(mainImageFile.size / 1024).toFixed(1)} KB)
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

                            {/* Gallery Upload */}
                            <GalleryUpload
                                value={formData.galleryImages}
                                onChange={(images) => updateField('galleryImages', images)}
                                onFilesChange={setGalleryFiles}
                                maxImages={10}
                                maxSize={5}
                            />
                        </div>

                        {/* Specifications & Features */}
                        <div className="border-t border-slate-100 pt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                            <TextArrayInput
                                label="Key Specifications"
                                value={formData.specs}
                                onChange={(specs) => updateField('specs', specs)}
                                placeholder="e.g., 350kW Peak Delivery"
                            />

                            <TextArrayInput
                                label="Core Features"
                                value={formData.features}
                                onChange={(features) => updateField('features', features)}
                                placeholder="e.g., OCPP 2.0.1 Ready"
                            />
                        </div>

                        {/* Descriptions */}
                        <div className="border-t border-slate-100 pt-5 space-y-4">
                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Descriptions</h3>

                            <TextEditor
                                label="Short Overview"
                                required
                                value={formData.shortDescription}
                                onChange={(val) => updateField('shortDescription', val)}
                                placeholder="Brief product summary..."
                                minHeight={120}
                            />

                            <TextEditor                                label="Full Technical & Marketing Description"
                                value={formData.description}
                                onChange={(val) => updateField('description', val)}
                                placeholder="In-depth equipment details..."
                                minHeight={180}
                            />
                        </div>

                        {/* Technical Specifications */}
                        <div className="border-t border-slate-100 pt-5 space-y-3">
                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                                Hardware Engineering Specs
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                        Power Output <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.technicalDetails.powerOutput}
                                        onChange={(e) => updateTechnicalDetails('powerOutput', e.target.value)}
                                        placeholder="350kW DC"
                                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900 transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                        Input Voltage <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.technicalDetails.inputVoltage}
                                        onChange={(e) => updateTechnicalDetails('inputVoltage', e.target.value)}
                                        placeholder="480V 3-Phase"
                                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900 transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                        Connector Standard <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.technicalDetails.connectorType}
                                        onChange={(e) => updateTechnicalDetails('connectorType', e.target.value)}
                                        placeholder="Dual CCS2"
                                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900 transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                        Enclosure Protection <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.technicalDetails.enclosureRating}
                                        onChange={(e) => updateTechnicalDetails('enclosureRating', e.target.value)}
                                        placeholder="IP55 / IK10"
                                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900 transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                        Warranty Period <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.technicalDetails.warranty}
                                        onChange={(e) => updateTechnicalDetails('warranty', e.target.value)}
                                        placeholder="5 Years Complete"
                                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900 transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                        Dimensions (H × W × D) <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.technicalDetails.dimensions}
                                        onChange={(e) => updateTechnicalDetails('dimensions', e.target.value)}
                                        placeholder="1950 × 750 × 600 mm"
                                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900 transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                        Unit Weight <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.technicalDetails.weight}
                                        onChange={(e) => updateTechnicalDetails('weight', e.target.value)}
                                        placeholder="350 kg"
                                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900 transition"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Active Status Toggle */}
                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-semibold text-slate-700">
                                    Catalog Status
                                </span>
                                <span className={`text-xs font-medium ${formData.isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                                    {formData.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>

                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={(e) => updateField('isActive', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-slate-900/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-900"></div>
                            </label>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-5 border-t border-slate-100 justify-end">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isSubmitting || isProcessing}
                                className="px-6 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold transition disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting || isProcessing}
                                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold shadow-xs transition disabled:opacity-50 flex items-center justify-center gap-2 min-w-[140px]"
                            >
                                {isSubmitting || isProcessing ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    'Update Product'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}