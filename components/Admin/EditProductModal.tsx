// components/Admin/EditProductModal.tsx
'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import TextEditor from './TextEditor';

// -----------------------------------------------------------------------------
// 1. Types
// -----------------------------------------------------------------------------

export interface Brand {
    _id: string;
    id: string;
    name: string;
    icon?: string;
    isActive?: boolean;
}

export interface Category {
    _id: string;
    id: string;
    name: string;
    icon?: string;
    level: number;
    isActive?: boolean;
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://evc-ngen-server.onrender.com/api';
const IMG_BB_API_KEY = 'a4f5c180c07ea3daa980fcfb759c35a7';

// -----------------------------------------------------------------------------
// 2. ImgBB Upload Helper
// -----------------------------------------------------------------------------

const uploadToImgBB = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);

    try {
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMG_BB_API_KEY}`, {
            method: 'POST',
            body: formData,
        });
        const data = await response.json();

        if (data.success) {
            return data.data.url;
        }
        throw new Error(data.error?.message || 'Failed to upload to ImgBB');
    } catch (error) {
        console.error('ImgBB upload error:', error);
        throw error;
    }
};

// -----------------------------------------------------------------------------
// 3. Build Category Hierarchy
// -----------------------------------------------------------------------------

const buildCategoryHierarchy = (categories: Category[]): Category[] => {
    const mainCategories = categories.filter(c => (c.level || 0) === 0 && c.isActive !== false);
    const subCategories = categories.filter(c => (c.level || 0) > 0 && c.isActive !== false);

    return mainCategories.map(main => {
        const children = subCategories.filter(sub =>
            sub.parentId === main.id || sub.parentId === main._id
        );
        return { ...main, subcategories: children };
    });
};

// -----------------------------------------------------------------------------
// 4. Main Modal Component
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
    // ✅ State
    const [formData, setFormData] = useState<ProductFormData>(INITIAL_FORM);
    const [mainImageFile, setMainImageFile] = useState<File | null>(null);
    const [mainImagePreview, setMainImagePreview] = useState<string>('');
    const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
    const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [isUploadingGallery, setIsUploadingGallery] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const galleryInputRef = useRef<HTMLInputElement>(null);
    // ✅ Category hierarchy
    const categoryHierarchy = useMemo(() => buildCategoryHierarchy(categories), [categories]);
    const allActiveCategories = useMemo(() => categories.filter(c => c.isActive !== false), [categories]);


    // ✅ Helper: Get Full Image URL
    const getFullImageUrl = useCallback((imagePath: string): string => {
        if (!imagePath) return '';
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
        if (imagePath.startsWith('data:image') || imagePath.startsWith('blob:')) return imagePath;

        const baseUrl = API_BASE_URL.replace(/\/api$/, '');
        return imagePath.startsWith('/uploads') ? `${baseUrl}${imagePath}` : `${baseUrl}/uploads/products/${imagePath}`;
    }, []);

    // components/Admin/EditProductModal.tsx - শুধু গ্যালারি পার্সিং অংশ

    // ✅ FIXED: Parse Gallery Images - handles all formats including nested arrays
    const parseGalleryImages = useCallback((images: any): string[] => {
        if (!images) return [];

        // Helper to extract strings from nested arrays
        const extractStrings = (data: any): string[] => {
            if (!data) return [];
            if (typeof data === 'string') {
                // Try to parse if it looks like JSON
                if (data.startsWith('[') || data.startsWith('"')) {
                    try {
                        const parsed = JSON.parse(data);
                        return extractStrings(parsed);
                    } catch {
                        return data.trim() ? [data] : [];
                    }
                }
                return data.trim() ? [data] : [];
            }
            if (Array.isArray(data)) {
                const result: string[] = [];
                for (const item of data) {
                    result.push(...extractStrings(item));
                }
                return result;
            }
            return [];
        };

        // If it's already an array
        if (Array.isArray(images)) {
            const result: string[] = [];
            for (const img of images) {
                if (typeof img === 'string' && img.trim()) {
                    // Check if it's a JSON string
                    if (img.startsWith('[') || img.startsWith('"')) {
                        try {
                            const parsed = JSON.parse(img);
                            if (Array.isArray(parsed)) {
                                const extracted = extractStrings(parsed);
                                result.push(...extracted);
                            } else if (typeof parsed === 'string' && parsed.trim()) {
                                result.push(parsed);
                            }
                        } catch {
                            result.push(img);
                        }
                    } else {
                        result.push(img);
                    }
                }
            }
            return result;
        }

        // If it's a string
        if (typeof images === 'string') {
            let parsed: unknown = images;
            let attempts = 0;

            while (typeof parsed === 'string' && attempts < 10) {
                attempts++;
                try {
                    const temp = JSON.parse(parsed);
                    parsed = temp;
                } catch {
                    break;
                }
            }

            // Extract all strings from the parsed data
            const result = extractStrings(parsed);

            // ✅ Filter out any invalid URLs or empty strings
            return result.filter(img =>
                img &&
                typeof img === 'string' &&
                img.trim() !== '' &&
                (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('/uploads'))
            );
        }

        return [];
    }, []);

    // ✅ Sync product data when modal opens
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

            setMainImagePreview(getFullImageUrl(product.imageUrl || ''));
            setGalleryPreviews(galleryImages.map(img => getFullImageUrl(img)));
            setMainImageFile(null);
            setGalleryFiles([]);
        }
    }, [product, isOpen, parseGalleryImages, getFullImageUrl]);

    if (!isOpen || !product) return null;


    // ✅ Main Image Handlers
    const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

        try {
            setIsProcessing(true);
            setMainImageFile(file);
            const previewUrl = URL.createObjectURL(file);
            setMainImagePreview(previewUrl);
            setFormData(prev => ({ ...prev, imageUrl: file.name }));
            toast.success('Image selected');
        } catch (error) {
            console.error('Image selection error:', error);
            toast.error('Failed to process image');
        } finally {
            setIsProcessing(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const removeMainImage = () => {
        if (mainImagePreview?.startsWith('blob:')) URL.revokeObjectURL(mainImagePreview);
        setMainImageFile(null);
        setMainImagePreview('');
        setFormData(prev => ({ ...prev, imageUrl: '' }));
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // ✅ Gallery Image Handlers
    const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        if (galleryPreviews.length + files.length > 10) {
            toast.error('Maximum 10 gallery images allowed');
            if (galleryInputRef.current) galleryInputRef.current.value = '';
            return;
        }

        setIsUploadingGallery(true);
        const toastId = toast.loading(`Uploading ${files.length} image(s) to ImgBB...`);

        try {
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

            if (validFiles.length === 0) {
                toast.error('No valid images to upload', { id: toastId });
                setIsUploadingGallery(false);
                return;
            }

            // ✅ Upload to ImgBB immediately
            const uploadPromises = validFiles.map(file => uploadToImgBB(file));
            const uploadedUrls = await Promise.all(uploadPromises);

            // ✅ Update state with ImgBB URLs
            setGalleryPreviews(prev => [...prev, ...uploadedUrls]);
            setGalleryFiles(prev => [...prev, ...validFiles]);
            setFormData(prev => ({
                ...prev,
                galleryImages: [...prev.galleryImages, ...uploadedUrls]
            }));

            toast.success(`${uploadedUrls.length} image(s) uploaded to ImgBB!`, { id: toastId });
        } catch (error) {
            console.error('Gallery upload error:', error);
            toast.error('Failed to upload images', { id: toastId });
        } finally {
            setIsUploadingGallery(false);
            if (galleryInputRef.current) galleryInputRef.current.value = '';
        }
    };

    const removeGalleryImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            galleryImages: prev.galleryImages.filter((_, i) => i !== index)
        }));
        setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
        setGalleryFiles(prev => prev.filter((_, i) => i !== index));
    };

    // ✅ Form Field Handlers
    const updateField = <K extends keyof ProductFormData>(field: K, value: ProductFormData[K]) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const updateTechnicalDetails = <K extends keyof TechnicalDetails>(field: K, value: string) => {
        setFormData(prev => ({
            ...prev,
            technicalDetails: { ...prev.technicalDetails, [field]: value }
        }));
    };

    // ✅ Submit Handler
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // ✅ Validation
        if (!formData.name.trim()) {
            toast.error('Product name is required');
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
        if (!mainImagePreview && !product?.imageUrl) {
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
            // ✅ Upload main image if new
            let mainImageUrl = formData.imageUrl;
            if (mainImageFile) {
                toast.loading('Uploading main image to ImgBB...', { id: toastId });
                mainImageUrl = await uploadToImgBB(mainImageFile);
            } else if (mainImagePreview?.startsWith('blob:')) {
                const response = await fetch(mainImagePreview);
                const blob = await response.blob();
                const file = new File([blob], 'main-image.jpg', { type: 'image/jpeg' });
                toast.loading('Uploading main image to ImgBB...', { id: toastId });
                mainImageUrl = await uploadToImgBB(file);
            }

            // ✅ Build payload
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

            setMainImageFile(null);
            setGalleryFiles([]);
        } catch (error) {
            console.error('Submit error:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to submit form', { id: toastId });
        } finally {
            setIsProcessing(false);
        }
    };

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] shadow-2xl border border-slate-200 flex flex-col">

                {/* Header */}
                <div className="sticky top-0 z-10 bg-white rounded-t-3xl px-6 sm:px-8 pt-6 pb-4 border-b border-slate-100 shrink-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold tracking-tight text-slate-900">Edit Product</h2>
                            <p className="text-xs text-slate-500 mt-0.5">Update product specifications, media, and inventory</p>
                        </div>
                        <button
                            onClick={onClose}
                            disabled={isSubmitting || isProcessing || isUploadingGallery}
                            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition disabled:opacity-50"
                            aria-label="Close modal"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6">
                    <form onSubmit={handleSubmit} className="space-y-6" id="edit-product-form">

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

                            <div className="sm:col-span-2">
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Category Group <span className="text-rose-500">*</span>
                                    <span className="text-[10px] font-normal text-slate-400 ml-2">(Includes sub-categories)</span>
                                </label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => {
                                        const selectedId = e.target.value;
                                        const selectedCat = allActiveCategories.find(c => (c.id || c._id) === selectedId);
                                        setFormData(prev => ({
                                            ...prev,
                                            category: selectedId,
                                            categoryLabel: selectedCat?.name || prev.categoryLabel,
                                        }));
                                    }}
                                    required
                                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-700 transition"
                                >
                                    <option value="">Select category...</option>
                                    {categoryHierarchy.map((main) => (
                                        <optgroup key={main.id || main._id} label={`${main.icon || '📂'} ${main.name}`}>
                                            <option value={main.id || main._id}>─ {main.icon || '📂'} {main.name}</option>
                                            {main.subcategories?.map((sub) => (
                                                <option key={sub.id || sub._id} value={sub.id || sub._id} className="pl-4">
                                                    &nbsp;&nbsp;└─ {sub.icon || '📁'} {sub.name}
                                                </option>
                                            ))}
                                        </optgroup>
                                    ))}
                                </select>
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
                                    {mainImagePreview ? (
                                        <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shrink-0 shadow-xs">
                                            <img
                                                src={mainImagePreview}
                                                alt="Product preview"
                                                className="w-full h-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={removeMainImage}
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
                                            disabled={isProcessing || isSubmitting || isUploadingGallery}
                                            className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 transition disabled:opacity-50"
                                        >
                                            {mainImagePreview ? 'Change Cover Image' : 'Select Cover Image'}
                                        </button>
                                        <p className="text-[11px] text-slate-400 mt-1">JPEG, PNG, WEBP (Max 5MB)</p>
                                    </div>

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleMainImageUpload}
                                        className="hidden"
                                    />
                                </div>
                            </div>

                            {/* Gallery Images */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Product Gallery (Up to 10 Images)
                                </label>
                                <div className="flex flex-wrap gap-3">
                                    {galleryPreviews.map((preview, index) => {
                                        const imageSrc = preview && (preview.startsWith('http://') || preview.startsWith('https://'))
                                            ? preview
                                            : getFullImageUrl(preview);
                                        console.log('Gallery Image Preview:', imageSrc);
                                        return (
                                            <div key={index} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 group">
                                                {imageSrc ? (
                                                    <img
                                                        src={imageSrc}
                                                        alt={`Gallery ${index + 1}`}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement;
                                                            target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"%3E%3Crect width="80" height="80" fill="%23f1f5f9"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%2394a3b8" font-size="24"%3E🖼%3C/text%3E%3C/svg%3E';
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100">
                                                        <span className="text-2xl">🖼️</span>
                                                    </div>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => removeGalleryImage(index)}
                                                    className="absolute top-1 right-1 w-5 h-5 bg-rose-600 hover:bg-rose-700 text-white rounded-full flex items-center justify-center text-xs transition-colors shadow-sm opacity-0 group-hover:opacity-100"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        );
                                    })}
                                    {galleryPreviews.length < 10 && (
                                        <label className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center cursor-pointer hover:border-[#0B192C] transition-colors bg-slate-50 hover:bg-slate-100">
                                            <input
                                                ref={galleryInputRef}
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                onChange={handleGalleryUpload}
                                                className="hidden"
                                            />
                                            {isUploadingGallery ? (
                                                <svg className="animate-spin h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                            ) : (
                                                <span className="text-2xl text-slate-400">+</span>
                                            )}
                                        </label>
                                    )}
                                </div>
                                <p className="text-[11px] text-slate-400 mt-1">
                                    {galleryPreviews.length} of 10 images • Images are uploaded to ImgBB
                                </p>
                            </div>
                        </div>

                        {/* Specifications & Features */}
                        <div className="border-t border-slate-100 pt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Key Specifications (One per line)
                                </label>
                                <textarea
                                    value={formData.specs.join('\n')}
                                    onChange={(e) => updateField('specs', e.target.value.split('\n').filter(s => s.trim()))}
                                    rows={3}
                                    placeholder="350kW Peak Delivery&#10;Dual CCS2 Connectors"
                                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900 placeholder:text-slate-400 transition resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Core Features (One per line)
                                </label>
                                <textarea
                                    value={formData.features.join('\n')}
                                    onChange={(e) => updateField('features', e.target.value.split('\n').filter(s => s.trim()))}
                                    rows={3}
                                    placeholder="OCPP 2.0.1 Ready&#10;Liquid-cooled Cables"
                                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900 placeholder:text-slate-400 transition resize-none"
                                />
                            </div>
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

                            <TextEditor
                                label="Full Technical & Marketing Description"
                                value={formData.description}
                                onChange={(val) => updateField('description', val)}
                                placeholder="In-depth equipment details..."
                                minHeight={180}
                            />
                        </div>

                        {/* Technical Specifications */}
                        <div className="border-t border-slate-100 pt-5 space-y-3">
                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Hardware Engineering Specs</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {[
                                    { key: 'powerOutput', label: 'Power Output', placeholder: '350kW DC' },
                                    { key: 'inputVoltage', label: 'Input Voltage', placeholder: '480V 3-Phase' },
                                    { key: 'connectorType', label: 'Connector Standard', placeholder: 'Dual CCS2' },
                                    { key: 'enclosureRating', label: 'Enclosure Protection', placeholder: 'IP55 / IK10' },
                                    { key: 'warranty', label: 'Warranty Period', placeholder: '5 Years Complete' },
                                    { key: 'dimensions', label: 'Dimensions (H × W × D)', placeholder: '1950 × 750 × 600 mm' },
                                    { key: 'weight', label: 'Unit Weight', placeholder: '350 kg' },
                                ].map(({ key, label, placeholder }) => (
                                    <div key={key}>
                                        <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                            {label} <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.technicalDetails[key as keyof TechnicalDetails]}
                                            onChange={(e) => updateTechnicalDetails(key as keyof TechnicalDetails, e.target.value)}
                                            placeholder={placeholder}
                                            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-900 transition"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Active Status */}
                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-semibold text-slate-700">Catalog Status</span>
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
                                disabled={isSubmitting || isProcessing || isUploadingGallery}
                                className="px-6 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold transition disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="edit-product-form"
                                disabled={isSubmitting || isProcessing || isUploadingGallery}
                                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold shadow-xs transition disabled:opacity-50 flex items-center justify-center gap-2 min-w-[140px]"
                            >
                                {(isSubmitting || isProcessing || isUploadingGallery) && (
                                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                )}
                                {isSubmitting ? 'Saving...' : 'Update Product'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}