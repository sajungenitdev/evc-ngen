// components/Admin/AccessoryFormModal.tsx
'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import { isDefaultImage } from '@/utils/imageHelper';
import TextEditor from './TextEditor';

// ============================================
// TYPES
// ============================================

export interface TechnicalDetails {
    powerOutput?: string;
    inputVoltage?: string;
    connectorType?: string;
    dimensions?: string;
    weight?: string;
    enclosureRating?: string;
    warranty?: string;
}

export interface AccessoryFormData {
    name: string;
    model: string;
    brand: string;
    category: string;
    categoryLabel?: string;
    imageUrl?: string;
    galleryImages?: string[];
    price: number;
    rating?: number;
    specs?: string[];
    shortDescription?: string;
    description?: string;
    features?: string[];
    technicalDetails?: TechnicalDetails;
    stock: number;
    isActive: boolean;
    isAccessory?: boolean;
    parentProductId: string;
    compatibleWith?: string[];
    accessoryType: string;
}

export interface Brand {
    _id: string;
    id?: string;
    name: string;
    icon?: string;
    isActive: boolean;
}

export interface Product {
    _id: string;
    id?: string;
    name: string;
    model: string;
    isActive: boolean;
}

export interface Category {
    _id: string;
    id?: string;
    name: string;
    icon?: string;
    isActive: boolean;
    level?: number;
    parentId?: string | null;
    subcategories?: Category[];
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const IMAGE_BASE_URL = API_BASE_URL.replace(/\/api$/, '').replace(/\/api\/?$/, '');

// ============================================
// TEXT ARRAY INPUT COMPONENT
// ============================================

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

// ============================================
// GALLERY UPLOAD COMPONENT
// ============================================

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

            const previews = imageArray.map((img: string) => {
                if (img.startsWith('data:image') || img.startsWith('http://') || img.startsWith('https://')) {
                    return img;
                }
                if (img.startsWith('/uploads')) {
                    return `${IMAGE_BASE_URL}${img}`;
                }
                return `${IMAGE_BASE_URL}/uploads/products/${img}`;
            });
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
            <p className="text-[11px] text-slate-400">Supported formats: JPEG, PNG, WEBP (up to {maxSize}MB each) Dimensions: (620px x 550px)</p>
        </div>
    );
};

// ============================================
// HELPER: Build Category Hierarchy with Sub-categories
// ============================================

const buildCategoryHierarchy = (categories: Category[]): Category[] => {
    // Get all main categories (level 0)
    const mainCategories = categories.filter(c => (c.level || 0) === 0 && c.isActive !== false);

    // Get all sub-categories (level > 0)
    const subCategories = categories.filter(c => (c.level || 0) > 0 && c.isActive !== false);

    // Build hierarchy
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

// ============================================
// MAIN MODAL COMPONENT
// ============================================

export default function AccessoryFormModal({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    brands = [],
    products = [],
    categories = [],
    isSubmitting,
    title = 'Add New Accessory',
    submitLabel = 'Create Accessory',
}: AccessoryFormModalProps) {
    const [formData, setFormData] = useState<AccessoryFormData>(INITIAL_FORM);
    const [mainImageFile, setMainImageFile] = useState<File | null>(null);
    const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Sync Form State
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    ...INITIAL_FORM,
                    ...initialData,
                    technicalDetails: {
                        ...INITIAL_FORM.technicalDetails,
                        ...(initialData.technicalDetails || {}),
                    },
                });
                if (initialData.imageUrl) {
                    const url = initialData.imageUrl.startsWith('/uploads')
                        ? `${IMAGE_BASE_URL}${initialData.imageUrl}`
                        : initialData.imageUrl;
                    setImagePreview(url);
                } else {
                    setImagePreview('');
                    setMainImageFile(null);
                }
                setGalleryFiles([]);
            } else {
                setFormData(INITIAL_FORM);
                setImagePreview('');
                setMainImageFile(null);
                setGalleryFiles([]);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            }
        }
    }, [initialData, isOpen]);

    // Clean up Object URL
    useEffect(() => {
        return () => {
            if (imagePreview && imagePreview.startsWith('blob:')) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    // Active Catalogs - Only show active products and categories
    const activeProducts = useMemo(() => {
        return products
            .filter((p) => p.isActive !== false && p.name?.trim())
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [products]);

    const activeBrands = useMemo(() => {
        return brands.filter((b) => b.isActive !== false);
    }, [brands]);

    // Build category hierarchy with sub-categories
    const categoryHierarchy = useMemo(() => {
        return buildCategoryHierarchy(categories);
    }, [categories]);

    // Get all active categories (including sub-categories) for the flat list
    const allActiveCategories = useMemo(() => {
        return categories.filter((c) => c.isActive !== false);
    }, [categories]);

    // Cover Image Handler
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

    // Submit Handler
    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();

            if (!formData.name.trim()) {
                toast.error('Accessory name is required');
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
            if (!formData.parentProductId) {
                toast.error('Parent product assignment is required');
                return;
            }
            if (!formData.accessoryType) {
                toast.error('Accessory classification type is required');
                return;
            }
            if (!mainImageFile && !initialData?.imageUrl) {
                toast.error('A primary cover image is required');
                return;
            }

            // Validate that selected product is active
            const selectedProduct = products.find(
                p => p._id === formData.parentProductId || p.id === formData.parentProductId
            );
            if (selectedProduct && !selectedProduct.isActive) {
                toast.error('Cannot assign accessory to an inactive product. Please select an active product.');
                return;
            }

            setIsProcessing(true);

            try {
                const formDataToSend = new FormData();

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

                formDataToSend.append('specs', JSON.stringify(formData.specs || []));
                formDataToSend.append('features', JSON.stringify(formData.features || []));
                formDataToSend.append('compatibleWith', JSON.stringify([formData.parentProductId]));

                formDataToSend.append('shortDescription', formData.shortDescription || '');
                formDataToSend.append('description', formData.description || '');

                formDataToSend.append(
                    'technicalDetails',
                    JSON.stringify({
                        powerOutput: formData.technicalDetails?.powerOutput || 'N/A',
                        inputVoltage: formData.technicalDetails?.inputVoltage || 'N/A',
                        connectorType: formData.technicalDetails?.connectorType || 'N/A',
                        dimensions: formData.technicalDetails?.dimensions || 'N/A',
                        weight: formData.technicalDetails?.weight || 'N/A',
                        enclosureRating: formData.technicalDetails?.enclosureRating || 'N/A',
                        warranty: formData.technicalDetails?.warranty || 'N/A',
                    })
                );

                galleryFiles.forEach((file) => {
                    formDataToSend.append('galleryImages', file);
                });

                if (mainImageFile) {
                    formDataToSend.append('image', mainImageFile);
                }

                await onSubmit(formDataToSend);

                if (!isSubmitting) {
                    setFormData(INITIAL_FORM);
                    setMainImageFile(null);
                    setGalleryFiles([]);
                    setImagePreview('');
                }
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : 'Failed to save accessory';
                toast.error(message);
            } finally {
                setIsProcessing(false);
            }
        },
        [formData, mainImageFile, galleryFiles, initialData, onSubmit, isSubmitting, products]
    );

    const updateField = useCallback(
        <K extends keyof AccessoryFormData>(field: K, value: AccessoryFormData[K]) => {
            setFormData((prev) => ({ ...prev, [field]: value }));
        },
        []
    );

    const updateTechnicalDetails = useCallback(
        <K extends keyof TechnicalDetails>(field: K, value: string) => {
            setFormData((prev) => ({
                ...prev,
                technicalDetails: {
                    ...prev.technicalDetails,
                    [field]: value,
                },
            }));
        },
        []
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] shadow-2xl border border-slate-200 flex flex-col">

                {/* Sticky Header - Fixed at top */}
                <div className="sticky top-0 z-10 bg-white rounded-t-3xl px-6 sm:px-8 pt-6 pb-4 border-b border-slate-100 shrink-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold tracking-tight text-slate-900">{title}</h2>
                            <p className="text-xs text-slate-500 mt-0.5">
                                {title.includes('Edit') ? 'Update accessory information and technical specs' : 'Create a hardware accessory profile linked to compatible charging hardware'}
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
                <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6">
                    {/* Modal Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* General Information */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Accessory Name <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => updateField('name', e.target.value)}
                                    required
                                    placeholder="e.g. Type 2 High-Duty Fast Charging Cable"
                                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900 placeholder:text-slate-400 transition"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Model Number <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.model}
                                    onChange={(e) => updateField('model', e.target.value)}
                                    required
                                    placeholder="e.g. CBL-T2-7M"
                                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900 placeholder:text-slate-400 transition"
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
                                    {activeBrands.map((brand) => (
                                        <option key={brand.id || brand._id} value={brand.id || brand._id}>
                                            {brand.icon} {brand.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* UPDATED: Category Dropdown with Sub-categories */}
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Category Group <span className="text-rose-500">*</span>
                                    <span className="text-[10px] font-normal text-slate-400 ml-2">
                                        (Includes sub-categories)
                                    </span>
                                </label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => {
                                        const categoryId = e.target.value;
                                        const found = allActiveCategories.find((c) => (c.id || c._id) === categoryId);
                                        setFormData((prev) => ({
                                            ...prev,
                                            category: categoryId,
                                            categoryLabel: found?.name || '',
                                        }));
                                    }}
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
                                    {/* Show any sub-categories not attached to a main category */}
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
                                    Accessory Type <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={formData.accessoryType}
                                    onChange={(e) => updateField('accessoryType', e.target.value)}
                                    required
                                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-700 transition"
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
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Price (USD) <span className="text-rose-500">*</span>
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
                                    Stock Count
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

                            {/* UPDATED: Parent Product Dropdown - Only Active Products */}
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Target Compatible Product <span className="text-rose-500">*</span>
                                    <span className="text-[10px] font-normal text-slate-400 ml-2">
                                        (Only active products shown)
                                    </span>
                                </label>
                                <select
                                    value={formData.parentProductId}
                                    onChange={(e) => {
                                        const parentId = e.target.value;
                                        setFormData((prev) => ({
                                            ...prev,
                                            parentProductId: parentId,
                                            compatibleWith: parentId ? [parentId] : [],
                                        }));
                                    }}
                                    required
                                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-700 transition"
                                >
                                    <option value="">Select compatible charger...</option>
                                    {activeProducts.length > 0 ? (
                                        activeProducts.map((product) => (
                                            <option
                                                key={product.id || product._id}
                                                value={product.id || product._id}
                                                className="py-1"
                                            >
                                                ✅ {product.name} ({product.model})
                                            </option>
                                        ))
                                    ) : (
                                        <option value="" disabled className="text-amber-600">
                                            ⚠️ No active products available. Please create a product first.
                                        </option>
                                    )}
                                </select>
                                {formData.parentProductId && activeProducts.length > 0 && (
                                    <p className="text-[11px] text-emerald-600 font-medium mt-1">
                                        ✓ Compatible with selected product
                                    </p>
                                )}
                                {activeProducts.length === 0 && (
                                    <p className="text-[11px] text-amber-600 font-medium mt-1">
                                        ⚠️ No active products available. Please create and activate a product first.
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Media Section */}
                        <div className="border-t border-slate-100 pt-5 space-y-5">
                            <div>
                                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Product Media</h3>

                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Primary Image <span className="text-rose-500">*</span>
                                </label>
                                <div className="flex items-center gap-4">
                                    {imagePreview ? (
                                        <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shrink-0 shadow-xs">
                                            <img
                                                src={imagePreview}
                                                alt="Accessory preview"
                                                className="w-full h-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={removeCoverImage}
                                                className="absolute top-1 right-1 w-5 h-5 bg-rose-600 text-white rounded-full flex items-center justify-center text-xs hover:bg-rose-700 transition shadow-xs z-10"
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
                                            {imagePreview ? 'Change Primary Image' : 'Select Cover Image'}
                                        </button>
                                        <p className="text-[11px] text-slate-400 mt-1">JPEG, PNG, WEBP (Max 5MB). Dimensions: (620px x 550px)</p>
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

                        {/* Description Section */}
                        <div className="border-t border-slate-100 pt-5 space-y-4">
                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Descriptions & Content</h3>

                            <TextEditor
                                label="Short Overview"
                                required
                                value={formData.shortDescription || ''}
                                onChange={(val) => updateField('shortDescription', val)}
                                placeholder="Brief summary of the accessory..."
                                minHeight={120}
                            />

                            <TextEditor
                                label="Comprehensive Details"
                                value={formData.description || ''}
                                onChange={(val) => updateField('description', val)}
                                placeholder="Detailed technical overview and product compatibility notes..."
                                minHeight={180}
                            />
                        </div>

                        {/* Specifications & Features */}
                        <div className="border-t border-slate-100 pt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                            <TextArrayInput
                                label="Key Specifications"
                                value={formData.specs}
                                onChange={(specs) => updateField('specs', specs)}
                                placeholder="e.g. 32A Current Capacity"
                            />

                            <TextArrayInput
                                label="Features & Benefits"
                                value={formData.features}
                                onChange={(features) => updateField('features', features)}
                                placeholder="e.g. Weatherproof Ergonomic Grip"
                            />
                        </div>

                        {/* Technical Engineering Details */}
                        <div className="border-t border-slate-100 pt-5 space-y-3">
                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                                Engineering & Hardware Specifications
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                        Power Rating
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.technicalDetails?.powerOutput || ''}
                                        onChange={(e) => updateTechnicalDetails('powerOutput', e.target.value)}
                                        placeholder="e.g. 22 kW"
                                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900 transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                        Input Voltage
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.technicalDetails?.inputVoltage || ''}
                                        onChange={(e) => updateTechnicalDetails('inputVoltage', e.target.value)}
                                        placeholder="e.g. 400V AC"
                                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900 transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                        Connector Standard
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.technicalDetails?.connectorType || ''}
                                        onChange={(e) => updateTechnicalDetails('connectorType', e.target.value)}
                                        placeholder="e.g. CCS2 / Type 2"
                                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900 transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                        IP / Enclosure Rating
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.technicalDetails?.enclosureRating || ''}
                                        onChange={(e) => updateTechnicalDetails('enclosureRating', e.target.value)}
                                        placeholder="e.g. IP66"
                                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900 transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                        Dimensions
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.technicalDetails?.dimensions || ''}
                                        onChange={(e) => updateTechnicalDetails('dimensions', e.target.value)}
                                        placeholder="e.g. 5m Cable Length"
                                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900 transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                        Weight
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.technicalDetails?.weight || ''}
                                        onChange={(e) => updateTechnicalDetails('weight', e.target.value)}
                                        placeholder="e.g. 3.2 kg"
                                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900 transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                        Warranty Term
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.technicalDetails?.warranty || ''}
                                        onChange={(e) => updateTechnicalDetails('warranty', e.target.value)}
                                        placeholder="e.g. 3 Years Limited"
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

                            {/* Toggle Switch */}
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

                        {/* Action Buttons - Right Aligned */}
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
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            />
                                        </svg>
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    submitLabel
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}