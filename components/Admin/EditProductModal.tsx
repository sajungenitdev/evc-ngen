// components/Admin/EditProductModal.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import TextEditor from './TextEditor';
import GalleryUpload from './GalleryUpload';

// -----------------------------------------------------------------------------
// 1. Types & Data Contracts
// -----------------------------------------------------------------------------

export interface Brand {
    _id: string;
    id: string;
    name: string;
    description?: string;
    icon?: string;
}

export interface Category {
    _id: string;
    id: string;
    name: string;
    description?: string;
    icon?: string;
    level: number;
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

// -----------------------------------------------------------------------------
// 2. High-Speed Client Image Compressor Helper
// -----------------------------------------------------------------------------

async function compressImage(file: File, maxWidth = 1200, quality = 0.8): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const elem = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                elem.width = width;
                elem.height = height;
                const ctx = elem.getContext('2d');
                if (!ctx) {
                    resolve(event.target?.result as string);
                    return;
                }

                ctx.drawImage(img, 0, 0, width, height);
                const compressedBase64 = elem.toDataURL('image/webp', quality);
                resolve(compressedBase64);
            };
            img.onerror = (error) => reject(error);
        };
        reader.onerror = (error) => reject(error);
    });
}

// -----------------------------------------------------------------------------
// 3. Main Modal Component
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
    const [mainImagePreview, setMainImagePreview] = useState<string>('');
    const [isCompressing, setIsCompressing] = useState<boolean>(false);
    const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const getFullImageUrl = (imagePath: string): string => {
        if (!imagePath) return '';

        // If it's already a full URL (ImgBB, etc.)
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath;
        }

        // If it's a base64 data URL
        if (imagePath.startsWith('data:image')) {
            return imagePath;
        }

        // If it's a blob URL
        if (imagePath.startsWith('blob:')) {
            return imagePath;
        }

        const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || 'http://localhost:5000';

        // If it starts with /uploads
        if (imagePath.startsWith('/uploads')) {
            return `${baseUrl}${imagePath}`;
        }

        // Default: assume it's in uploads/products
        return `${baseUrl}/uploads/products/${imagePath}`;
    };

    // Parse gallery images helper
    const parseGalleryImages = (images: any): string[] => {
        if (!images) return [];
        if (Array.isArray(images)) return images;
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
    };

    // Sync product record on modal open
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

            // Set the full URL for preview
            setMainImagePreview(getFullImageUrl(product.imageUrl || ''));
            setGalleryFiles([]);
        }
    }, [product, isOpen]);

    if (!isOpen || !product) return null;

    // Fast Compressed Main Image Upload Handler
    const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file');
            return;
        }

        try {
            setIsCompressing(true);
            const compressed = await compressImage(file, 1200, 0.82);
            setMainImagePreview(compressed);
            setFormData((prev) => ({ ...prev, imageUrl: compressed }));
            toast.success('Main image updated');
        } catch (error) {
            console.error('Compression error:', error);
            toast.error('Failed to process image');
        } finally {
            setIsCompressing(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const removeMainImage = () => {
        setMainImagePreview('');
        setFormData((prev) => ({ ...prev, imageUrl: '' }));
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // Category Selector Handler
    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedId = e.target.value;
        const selectedCat = categories.find((c) => c.id === selectedId || c._id === selectedId);
        setFormData((prev) => ({
            ...prev,
            category: selectedId,
            categoryLabel: selectedCat?.name || prev.categoryLabel,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.imageUrl) {
            toast.error('Main image is required');
            return;
        }

        // Validate required technical fields
        if (!formData.technicalDetails.weight.trim()) {
            toast.error('Technical specification: Weight is required');
            return;
        }

        // Clean and safe payload construction
        const payload: ProductFormData = {
            ...formData,
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
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] shadow-2xl border border-slate-200 flex flex-col">
                {/* Fixed Header */}
                <div className="sticky top-0 z-10 bg-white rounded-t-3xl px-6 sm:px-8 pt-6 pb-4 border-b border-slate-100 shrink-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-[#0B192C]">Edit Product</h2>
                            <p className="text-xs text-slate-500">Update unit catalog specifications, media, and inventory</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6">
                    <form onSubmit={handleSubmit} className="space-y-6" id="edit-product-form">
                        {/* Basic Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Product Name <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    placeholder="e.g., Ultra-Fast DC Charger 350kW"
                                    className="w-full px-3.5 py-2 text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Model Code <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.model}
                                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                                    required
                                    placeholder="e.g., SXC-DCF-350"
                                    className="w-full px-3.5 py-2 text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all font-mono"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Brand Partner <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={formData.brand}
                                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                    required
                                    className="w-full px-3.5 py-2 text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all"
                                >
                                    <option value="">Select Brand</option>
                                    {brands.map((brand) => (
                                        <option key={brand.id || brand._id} value={brand.id || brand._id}>
                                            {brand.name}
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
                                    onChange={handleCategoryChange}
                                    required
                                    className="w-full px-3.5 py-2 text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all"
                                >
                                    <option value="">Select Category</option>
                                    {categories
                                        .filter((c) => c.level === 0)
                                        .map((category) => (
                                            <option key={category.id || category._id} value={category.id || category._id}>
                                                {category.name}
                                            </option>
                                        ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Base Price ($) <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                                    required
                                    min="0"
                                    step="0.01"
                                    placeholder="0.00"
                                    className="w-full px-3.5 py-2 text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all font-mono"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Available Stock (Units)
                                </label>
                                <input
                                    type="number"
                                    value={formData.stock}
                                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value, 10) || 0 })}
                                    min="0"
                                    placeholder="0"
                                    className="w-full px-3.5 py-2 text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all font-mono"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Current Rating (0.0 - 5.0)
                                </label>
                                <input
                                    type="number"
                                    value={formData.rating}
                                    onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) || 0 })}
                                    min="0"
                                    max="5"
                                    step="0.1"
                                    placeholder="5.0"
                                    className="w-full px-3.5 py-2 text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all font-mono"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Category Tag / Label
                                </label>
                                <input
                                    type="text"
                                    value={formData.categoryLabel}
                                    onChange={(e) => setFormData({ ...formData, categoryLabel: e.target.value })}
                                    placeholder="e.g., DC Fast"
                                    className="w-full px-3.5 py-2 text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all"
                                />
                            </div>
                        </div>

                        {/* Image Upload Section */}
                        <div className="border-t border-slate-100 pt-4">
                            <h3 className="text-xs font-bold text-[#0B192C] uppercase tracking-wider mb-3">Product Media</h3>

                            {/* Main Cover Image */}
                            <div className="mb-4">
                                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Primary Cover Image <span className="text-rose-500">*</span>
                                </label>
                                <div className="flex items-center gap-4">
                                    {mainImagePreview ? (
                                        <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-slate-200 shrink-0 bg-slate-50 shadow-xs">
                                            <img src={getFullImageUrl(mainImagePreview)} alt="Main product" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={removeMainImage}
                                                className="absolute top-1.5 right-1.5 w-5 h-5 bg-rose-600 hover:bg-rose-700 text-white rounded-full flex items-center justify-center text-xs transition-colors shadow-sm"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 bg-slate-50 shrink-0">
                                            <span className="text-2xl">📷</span>
                                        </div>
                                    )}

                                    <div className="flex-1">
                                        <button
                                            type="button"
                                            disabled={isCompressing}
                                            onClick={() => fileInputRef.current?.click()}
                                            className="px-4 py-2 border-2 border-dashed border-slate-200 hover:border-[#0B192C] hover:bg-slate-50 rounded-xl transition-all text-xs font-bold text-slate-700 w-full disabled:opacity-50"
                                        >
                                            {isCompressing
                                                ? 'Optimizing Image...'
                                                : mainImagePreview
                                                    ? 'Change Cover Image'
                                                    : 'Upload Cover Image'}
                                        </button>
                                        <p className="text-[10px] text-slate-400 mt-1">Images are automatically scaled and compressed for speed.</p>
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

                            {/* Gallery Images Component */}
                            <div>
                                <GalleryUpload
                                    label="Product Gallery (Up to 10 Images)"
                                    value={formData.galleryImages}
                                    onChange={(images) => setFormData({ ...formData, galleryImages: images })}
                                    onFilesChange={setGalleryFiles}
                                    maxImages={10}
                                    maxSize={5}
                                />
                            </div>
                        </div>

                        {/* Specifications & Features */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Highlights (One per line)
                                </label>
                                <textarea
                                    value={formData.specs.join('\n')}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            specs: e.target.value.split('\n').filter((s) => s.trim()),
                                        })
                                    }
                                    rows={3}
                                    placeholder="350kW Peak Delivery&#10;Dual CCS2 Connectors&#10;Dynamic Load Balancing"
                                    className="w-full px-3.5 py-2 text-xs sm:text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Core Features (One per line)
                                </label>
                                <textarea
                                    value={formData.features.join('\n')}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            features: e.target.value.split('\n').filter((s) => s.trim()),
                                        })
                                    }
                                    rows={3}
                                    placeholder="OCPP 2.0.1 Ready&#10;Liquid-cooled Cables&#10;Touchscreen UI"
                                    className="w-full px-3.5 py-2 text-xs sm:text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all resize-none"
                                />
                            </div>
                        </div>

                        {/* Text Editors */}
                        <div className="border-t border-slate-100 pt-4 space-y-4">
                            <h3 className="text-xs font-bold text-[#0B192C] uppercase tracking-wider mb-2">Descriptions</h3>

                            <TextEditor
                                label="Short Overview"
                                required
                                value={formData.shortDescription}
                                onChange={(value) => setFormData({ ...formData, shortDescription: value })}
                                placeholder="Write a brief product teaser..."
                                minHeight={140}
                            />

                            <TextEditor
                                label="Full Technical & Marketing Description"
                                value={formData.description}
                                onChange={(value) => setFormData({ ...formData, description: value })}
                                placeholder="Write in-depth equipment details..."
                                minHeight={220}
                            />
                        </div>

                        {/* Technical Specifications */}
                        <div className="border-t border-slate-100 pt-4">
                            <h3 className="text-xs font-bold text-[#0B192C] uppercase tracking-wider mb-3">
                                Hardware Engineering Specs
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                        Power Output
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.technicalDetails.powerOutput}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                technicalDetails: { ...formData.technicalDetails, powerOutput: e.target.value },
                                            })
                                        }
                                        placeholder="350kW DC"
                                        className="w-full px-3 py-2 text-xs sm:text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                        Input Voltage
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.technicalDetails.inputVoltage}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                technicalDetails: { ...formData.technicalDetails, inputVoltage: e.target.value },
                                            })
                                        }
                                        placeholder="480V 3-Phase"
                                        className="w-full px-3 py-2 text-xs sm:text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                        Connector Standard
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.technicalDetails.connectorType}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                technicalDetails: { ...formData.technicalDetails, connectorType: e.target.value },
                                            })
                                        }
                                        placeholder="Dual CCS2"
                                        className="w-full px-3 py-2 text-xs sm:text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                        Enclosure Protection
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.technicalDetails.enclosureRating}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                technicalDetails: { ...formData.technicalDetails, enclosureRating: e.target.value },
                                            })
                                        }
                                        placeholder="IP55 / IK10"
                                        className="w-full px-3 py-2 text-xs sm:text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                        Warranty Period
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.technicalDetails.warranty}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                technicalDetails: { ...formData.technicalDetails, warranty: e.target.value },
                                            })
                                        }
                                        placeholder="5 Years Complete"
                                        className="w-full px-3 py-2 text-xs sm:text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                        Dimensions (H × W × D)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.technicalDetails.dimensions}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                technicalDetails: { ...formData.technicalDetails, dimensions: e.target.value },
                                            })
                                        }
                                        placeholder="1950 × 750 × 600 mm"
                                        className="w-full px-3 py-2 text-xs sm:text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all"
                                    />
                                </div>

                                {/* Required Weight Field */}
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                        Unit Weight <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.technicalDetails.weight}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                technicalDetails: { ...formData.technicalDetails, weight: e.target.value },
                                            })
                                        }
                                        placeholder="e.g., 350 kg"
                                        className="w-full px-3 py-2 text-xs sm:text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/15 focus:border-[#0B192C] transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Active State */}
                        <div className="flex items-center gap-2 pt-1">
                            <input
                                type="checkbox"
                                id="edit-prod-active"
                                checked={formData.isActive}
                                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                className="w-4 h-4 rounded-md border-slate-300 text-[#0B192C] focus:ring-[#0B192C]"
                            />
                            <label htmlFor="edit-prod-active" className="text-xs font-semibold text-slate-700 cursor-pointer">
                                Product is Active & Visible in Catalog
                            </label>
                        </div>
                    </form>
                </div>

                {/* Fixed Footer */}
                <div className="sticky bottom-0 z-10 bg-white rounded-b-3xl px-6 sm:px-8 py-4 border-t border-slate-100 shrink-0">
                    <div className="flex gap-3 justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting || isCompressing}
                            className="px-6 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold transition disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            form="edit-product-form"
                            disabled={isSubmitting || isCompressing}
                            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold shadow-xs transition disabled:opacity-50 flex items-center justify-center gap-2 min-w-[140px]"
                        >
                            {(isSubmitting || isCompressing) && (
                                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                            )}
                            {isSubmitting ? 'Saving...' : 'Update Product'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}