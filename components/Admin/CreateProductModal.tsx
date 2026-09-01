// components/Admin/CreateProductModal.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
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

interface CreateProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (formData: FormData) => Promise<void>;
    brands: Brand[];
    categories: Category[];
    isSubmitting: boolean;
}

// -----------------------------------------------------------------------------
// 2. Main Modal Component
// -----------------------------------------------------------------------------

export default function CreateProductModal({
    isOpen,
    onClose,
    onSubmit,
    brands,
    categories,
    isSubmitting,
}: CreateProductModalProps) {
    const [formData, setFormData] = useState<ProductFormData>(INITIAL_FORM);

    // Store actual File objects
    const [mainImageFile, setMainImageFile] = useState<File | null>(null);
    const [mainImagePreview, setMainImagePreview] = useState<string>('');
    const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
    const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Reset form when modal closes
    useEffect(() => {
        if (!isOpen) {
            setFormData(INITIAL_FORM);
            setMainImageFile(null);
            setMainImagePreview('');
            setGalleryFiles([]);
            setGalleryPreviews([]);
            setIsProcessing(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    }, [isOpen]);

    // Cleanup preview URLs
    useEffect(() => {
        return () => {
            if (mainImagePreview && mainImagePreview.startsWith('blob:')) {
                URL.revokeObjectURL(mainImagePreview);
            }
            galleryPreviews.forEach(url => {
                if (url.startsWith('blob:')) {
                    URL.revokeObjectURL(url);
                }
            });
        };
    }, [mainImagePreview, galleryPreviews]);

    if (!isOpen) return null;

    // Handle Main Image Upload
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
            setFormData((prev) => ({ ...prev, imageUrl: file.name }));
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
        if (mainImagePreview && mainImagePreview.startsWith('blob:')) {
            URL.revokeObjectURL(mainImagePreview);
        }
        setMainImageFile(null);
        setMainImagePreview('');
        setFormData((prev) => ({ ...prev, imageUrl: '' }));
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // Handle Gallery Images Upload
    const handleGalleryUpload = (files: File[]) => {
        const validFiles = files.filter(file => {
            if (!file.type.startsWith('image/')) {
                toast.error(`${file.name} is not an image`);
                return false;
            }
            if (file.size > 5 * 1024 * 1024) {
                toast.error(`${file.name} is too large (max 5MB)`);
                return false;
            }
            return true;
        });

        if (validFiles.length === 0) return;

        const newFiles = [...galleryFiles, ...validFiles];
        if (newFiles.length > 10) {
            toast.error('Maximum 10 gallery images allowed');
            return;
        }

        setGalleryFiles(newFiles);

        // Create previews
        const newPreviews = validFiles.map(file => URL.createObjectURL(file));
        setGalleryPreviews([...galleryPreviews, ...newPreviews]);

        setFormData((prev) => ({
            ...prev,
            galleryImages: newFiles.map(f => f.name)
        }));
    };

    const removeGalleryImage = (index: number) => {
        if (galleryPreviews[index] && galleryPreviews[index].startsWith('blob:')) {
            URL.revokeObjectURL(galleryPreviews[index]);
        }
        const newFiles = galleryFiles.filter((_, i) => i !== index);
        const newPreviews = galleryPreviews.filter((_, i) => i !== index);
        setGalleryFiles(newFiles);
        setGalleryPreviews(newPreviews);
        setFormData((prev) => ({
            ...prev,
            galleryImages: newFiles.map(f => f.name)
        }));
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

    // ✅ COMPLETE handleSubmit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate required fields
        if (!formData.name) {
            toast.error('Product name is required');
            return;
        }
        if (!formData.model) {
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
        if (!mainImageFile) {
            toast.error('Main image is required');
            return;
        }

        // Validate ALL technical details
        const techDetails = formData.technicalDetails;
        if (!techDetails.powerOutput.trim()) {
            toast.error('Technical specification: Power Output is required');
            return;
        }
        if (!techDetails.inputVoltage.trim()) {
            toast.error('Technical specification: Input Voltage is required');
            return;
        }
        if (!techDetails.connectorType.trim()) {
            toast.error('Technical specification: Connector Type is required');
            return;
        }
        if (!techDetails.enclosureRating.trim()) {
            toast.error('Technical specification: Enclosure Rating is required');
            return;
        }
        if (!techDetails.warranty.trim()) {
            toast.error('Technical specification: Warranty is required');
            return;
        }
        if (!techDetails.dimensions.trim()) {
            toast.error('Technical specification: Dimensions is required');
            return;
        }
        if (!techDetails.weight.trim()) {
            toast.error('Technical specification: Weight is required');
            return;
        }

        try {
            setIsProcessing(true);

            // Create FormData object
            const formDataToSend = new FormData();

            // Append all text fields
            formDataToSend.append('name', formData.name);
            formDataToSend.append('model', formData.model);
            formDataToSend.append('brand', formData.brand);
            formDataToSend.append('category', formData.category);
            formDataToSend.append('categoryLabel', formData.categoryLabel || formData.category);
            formDataToSend.append('price', String(formData.price || 0));
            formDataToSend.append('rating', String(formData.rating || 0));
            formDataToSend.append('stock', String(formData.stock || 0));
            formDataToSend.append('isActive', String(formData.isActive));

            // Append arrays as JSON strings
            formDataToSend.append('specs', JSON.stringify(formData.specs || []));
            formDataToSend.append('features', JSON.stringify(formData.features || []));

            // Append descriptions
            formDataToSend.append('shortDescription', formData.shortDescription || '');
            formDataToSend.append('description', formData.description || '');

            // Append technical details as JSON
            formDataToSend.append('technicalDetails', JSON.stringify({
                powerOutput: techDetails.powerOutput.trim(),
                inputVoltage: techDetails.inputVoltage.trim(),
                connectorType: techDetails.connectorType.trim(),
                enclosureRating: techDetails.enclosureRating.trim(),
                warranty: techDetails.warranty.trim(),
                dimensions: techDetails.dimensions.trim(),
                weight: techDetails.weight.trim(),
            }));

            // Append main image file
            if (mainImageFile) {
                formDataToSend.append('image', mainImageFile);
            }

            // Append gallery images - each with the same field name 'galleryImages'
            galleryFiles.forEach((file) => {
                formDataToSend.append('galleryImages', file);
            });

            // Log what we're sending for debugging
            console.log('📦 Sending FormData:');
            for (let [key, value] of formDataToSend.entries()) {
                if (value instanceof File) {
                    console.log(`  ${key}: File(${value.name}, ${value.size} bytes)`);
                } else {
                    console.log(`  ${key}: ${value}`);
                }
            }

            // Submit the FormData
            await onSubmit(formDataToSend);

            // Reset form on success
            if (!isSubmitting) {
                setFormData(INITIAL_FORM);
                setMainImageFile(null);
                setMainImagePreview('');
                setGalleryFiles([]);
                setGalleryPreviews([]);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                toast.success('Product created successfully!');
            }

        } catch (error) {
            console.error('Submit error:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to submit form');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B192C]/40 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-200">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                    <div>
                        <h2 className="text-lg font-bold text-[#0B192C]">Add New Product</h2>
                        <p className="text-xs text-slate-500">Configure catalog unit specifications and media</p>
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

                <form onSubmit={handleSubmit} className="space-y-6">
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
                                Base Price ($)
                            </label>
                            <input
                                type="text"  // ✅ Change from "number" to "text" to allow empty value
                                value={formData.price === 0 ? '' : formData.price}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    // Allow empty or valid numbers with decimal
                                    if (value === '') {
                                        setFormData({ ...formData, price: 0 });
                                    } else if (/^\d*\.?\d*$/.test(value)) {
                                        setFormData({ ...formData, price: parseFloat(value) || 0 });
                                    }
                                }}
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
                                Initial Rating (0.0 - 5.0)
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
                                        <img src={mainImagePreview} alt="Main product" className="w-full h-full object-cover" />
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
                                        disabled={isProcessing}
                                        onClick={() => fileInputRef.current?.click()}
                                        className="px-4 py-2 border-2 border-dashed border-slate-200 hover:border-[#0B192C] hover:bg-slate-50 rounded-xl transition-all text-xs font-bold text-slate-700 w-full disabled:opacity-50"
                                    >
                                        {isProcessing
                                            ? 'Processing...'
                                            : mainImageFile
                                                ? `Change Image (${mainImageFile.name})`
                                                : 'Upload Cover Image'}
                                    </button>
                                    <p className="text-[10px] text-slate-400 mt-1">
                                        {mainImageFile
                                            ? `Selected: ${mainImageFile.name} (${(mainImageFile.size / 1024).toFixed(1)} KB)`
                                            : 'Select an image file (JPEG, PNG, WEBP, max 5MB)'}
                                    </p>
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
                            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Product Gallery (Up to 10 Images)
                            </label>
                            <div className="flex flex-wrap gap-3">
                                {galleryPreviews.map((preview, index) => (
                                    <div key={index} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200">
                                        <img src={preview} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeGalleryImage(index)}
                                            className="absolute top-1 right-1 w-4 h-4 bg-rose-600 hover:bg-rose-700 text-white rounded-full flex items-center justify-center text-xs transition-colors"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                                {galleryPreviews.length < 10 && (
                                    <label className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center cursor-pointer hover:border-[#0B192C] transition-colors bg-slate-50">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={(e) => {
                                                const files = Array.from(e.target.files || []);
                                                if (files.length + galleryFiles.length > 10) {
                                                    toast.error('Maximum 10 images allowed');
                                                    return;
                                                }
                                                handleGalleryUpload(files);
                                            }}
                                            className="hidden"
                                        />
                                        <span className="text-2xl text-slate-400">+</span>
                                    </label>
                                )}
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1">
                                {galleryFiles.length} of 10 images selected
                            </p>
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

                    {/* Descriptions */}
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
                                    Power Output <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
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
                                    Input Voltage <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
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
                                    Connector Standard <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
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
                                    Enclosure Protection <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
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
                                    Warranty Period <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
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
                                    Dimensions (H × W × D) <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
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
                            id="create-prod-active"
                            checked={formData.isActive}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                            className="w-4 h-4 rounded-md border-slate-300 text-[#0B192C] focus:ring-[#0B192C]"
                        />
                        <label htmlFor="create-prod-active" className="text-xs font-semibold text-slate-700 cursor-pointer">
                            Publish as Active in Live Catalog
                        </label>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-5 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs sm:text-sm font-bold transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || isProcessing}
                            className="flex-1 bg-[#0B192C] hover:bg-[#1E3E62] text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-[#0B192C]/10 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isSubmitting || isProcessing ? (
                                <>
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    {isSubmitting ? 'Creating...' : 'Processing...'}
                                </>
                            ) : (
                                'Create Product'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}