// components/Admin/ViewProductModal.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { isDefaultImage } from '@/utils/imageHelper';

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

interface ViewProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onEdit: () => void;
    product: Product | null;
    brands: Brand[];
    categories: Category[];
}

// -----------------------------------------------------------------------------
// 2. Image Component for View Modal - Using SAME logic as ProductThumbnail
// -----------------------------------------------------------------------------

interface ModalImageProps {
    src: string;
    alt: string;
    className?: string;
    fallback?: string;
}

const ModalImage: React.FC<ModalImageProps> = ({
    src,
    alt,
    className = 'w-full h-full object-cover',
    fallback = '⚡'
}) => {
    const [hasError, setHasError] = useState<boolean>(false);

    // ✅ EXACT SAME logic as ProductThumbnail - this is what works!
    const getFullUrl = (path: string): string | null => {
        if (!path || path.trim() === '') return null;

        const trimmed = path.trim();

        // Already a full URL
        if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
            return trimmed;
        }

        // ✅ Use the base URL without /api
        const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || 'http://localhost:5000';

        // Relative path starting with /uploads
        if (trimmed.startsWith('/uploads')) {
            return `${baseUrl}${trimmed}`;
        }

        // Just a filename
        return `${baseUrl}/uploads/products/${trimmed}`;
    };

    const fullUrl = useMemo(() => {
        return getFullUrl(src);
    }, [src]);

    // Check if we should show fallback
    const showFallback = useMemo(() => {
        return !src || hasError || isDefaultImage(src) || !fullUrl;
    }, [src, hasError, fullUrl]);

    // Reset error when src changes
    useEffect(() => {
        setHasError(false);
    }, [src]);

    if (showFallback) {
        return (
            <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
                <span className="text-2xl">{fallback}</span>
            </div>
        );
    }

    return (
        <img
            src={fullUrl}
            alt={alt}
            className={className}
            onError={() => setHasError(true)}
            loading="lazy"
        />
    );
};

// -----------------------------------------------------------------------------
// 3. Main View Modal Component
// -----------------------------------------------------------------------------

export default function ViewProductModal({
    isOpen,
    onClose,
    onEdit,
    product,
    brands,
    categories,
}: ViewProductModalProps) {
    if (!isOpen || !product) return null;

    const brandRecord = brands.find((b) => b.id === product.brand || b._id === product.brand) || product.brandDetails;
    const categoryRecord = categories.find((c) => c.id === product.category || c._id === product.category) || product.categoryDetails;

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(price || 0);
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        } catch {
            return 'Invalid date';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B192C]/40 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-200 text-slate-800">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                    <div>
                        <h2 className="text-lg font-bold text-[#0B192C]">Product Telemetry & Specs</h2>
                        <p className="text-xs text-slate-500">Live operational specs and catalog information</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                        aria-label="Close dialog"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="space-y-5">
                    {/* Header Banner with Image */}
                    <div className="flex items-start gap-4">
                        <div className="w-20 h-20 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                            <ModalImage
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                fallback="⚡"
                            />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-lg font-bold text-[#0B192C] truncate">{product.name}</h3>
                                <span
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${product.isActive
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                                            : 'bg-rose-50 text-rose-700 border-rose-200/80'
                                        }`}
                                >
                                    <span className={`w-1.5 h-1.5 rounded-full ${product.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                    {product.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            <p className="text-xs font-mono text-slate-500 mt-0.5">Model: {product.model || 'N/A'}</p>
                            <p className="text-[11px] text-slate-400 font-mono">ID / SKU: {product.id || product._id}</p>
                        </div>
                    </div>

                    {/* Gallery Images Strip */}
                    {product.galleryImages && product.galleryImages.length > 0 && (
                        <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Media Gallery</span>
                            <div className="flex flex-wrap gap-2">
                                {product.galleryImages.map((img, idx) => (
                                    <div key={idx} className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200/80 bg-white shrink-0 shadow-2xs">
                                        <ModalImage
                                            src={img}
                                            alt={`Gallery ${idx + 1}`}
                                            className="w-full h-full object-cover"
                                            fallback="🖼️"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quick Metric Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Base Price</span>
                            <span className="font-bold text-[#0B192C] font-mono text-sm block mt-1">{formatPrice(product.price)}</span>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Inventory</span>
                            <span className={`font-bold font-mono text-sm block mt-1 ${product.stock > 10 ? 'text-emerald-600' : product.stock > 0 ? 'text-amber-600' : 'text-rose-600'
                                }`}>
                                {product.stock || 0} Units
                            </span>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Rating</span>
                            <span className="font-bold text-amber-600 font-mono text-sm block mt-1">⭐ {product.rating || 0} / 5.0</span>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Category Tag</span>
                            <span className="font-bold text-slate-700 text-sm block mt-1 truncate">{product.categoryLabel || 'Standard'}</span>
                        </div>
                    </div>

                    {/* Partner & Categorization Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Brand Manufacturer</span>
                            <div className="flex items-center gap-2 mt-1.5">
                                <span className="text-base">{brandRecord?.icon || '🏷️'}</span>
                                <span className="font-bold text-[#0B192C] text-xs">{brandRecord?.name || product.brand || 'Unassigned'}</span>
                            </div>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Classification Category</span>
                            <div className="flex items-center gap-2 mt-1.5">
                                <span className="text-base">{categoryRecord?.icon || '📂'}</span>
                                <span className="font-bold text-[#0B192C] text-xs">{categoryRecord?.name || product.category || 'Unassigned'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Specifications & Features */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {product.specs && product.specs.length > 0 && (
                            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Highlights</span>
                                <ul className="text-xs text-slate-700 space-y-1">
                                    {product.specs.map((item, idx) => (
                                        <li key={idx} className="flex items-start gap-1.5">
                                            <span className="text-emerald-500 font-bold">✓</span>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {product.features && product.features.length > 0 && (
                            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Core Features</span>
                                <ul className="text-xs text-slate-700 space-y-1">
                                    {product.features.map((item, idx) => (
                                        <li key={idx} className="flex items-start gap-1.5">
                                            <span className="text-cyan-500 font-bold">•</span>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Technical Engineering Specifications */}
                    {product.technicalDetails && (
                        <div className="border-t border-slate-100 pt-4">
                            <h4 className="text-xs font-bold text-[#0B192C] uppercase tracking-wider mb-3">Hardware Engineering Specs</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                                <div className="p-2.5 bg-slate-50 border border-slate-200/70 rounded-xl">
                                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Power Output</span>
                                    <span className="font-semibold text-slate-800 font-mono mt-0.5 block">{product.technicalDetails.powerOutput || 'N/A'}</span>
                                </div>
                                <div className="p-2.5 bg-slate-50 border border-slate-200/70 rounded-xl">
                                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Input Voltage</span>
                                    <span className="font-semibold text-slate-800 font-mono mt-0.5 block">{product.technicalDetails.inputVoltage || 'N/A'}</span>
                                </div>
                                <div className="p-2.5 bg-slate-50 border border-slate-200/70 rounded-xl">
                                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Connector Type</span>
                                    <span className="font-semibold text-slate-800 font-mono mt-0.5 block">{product.technicalDetails.connectorType || 'N/A'}</span>
                                </div>
                                <div className="p-2.5 bg-slate-50 border border-slate-200/70 rounded-xl">
                                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Enclosure Rating</span>
                                    <span className="font-semibold text-slate-800 font-mono mt-0.5 block">{product.technicalDetails.enclosureRating || 'N/A'}</span>
                                </div>
                                <div className="p-2.5 bg-slate-50 border border-slate-200/70 rounded-xl">
                                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Warranty Period</span>
                                    <span className="font-semibold text-slate-800 mt-0.5 block">{product.technicalDetails.warranty || 'N/A'}</span>
                                </div>
                                <div className="p-2.5 bg-slate-50 border border-slate-200/70 rounded-xl">
                                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Dimensions</span>
                                    <span className="font-semibold text-slate-800 font-mono mt-0.5 block truncate">{product.technicalDetails.dimensions || 'N/A'}</span>
                                </div>
                                <div className="p-2.5 bg-slate-50 border border-slate-200/70 rounded-xl sm:col-span-3">
                                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Unit Weight</span>
                                    <span className="font-semibold text-slate-800 font-mono mt-0.5 block">{product.technicalDetails.weight || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Descriptions */}
                    {product.shortDescription && (
                        <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Short Overview</span>
                            <div className="text-xs text-slate-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: product.shortDescription }} />
                        </div>
                    )}

                    {product.description && (
                        <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Full Description</span>
                            <div className="text-xs text-slate-700 leading-relaxed max-w-none prose prose-slate prose-sm" dangerouslySetInnerHTML={{ __html: product.description }} />
                        </div>
                    )}

                    {/* Metadata Footer */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                        <span>Created: {formatDate(product.createdAt)}</span>
                        <span>Updated: {formatDate(product.updatedAt)}</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-5 mt-5 border-t border-slate-100">
                    <button
                        onClick={onEdit}
                        className="flex-1 bg-[#0B192C] hover:bg-[#1E3E62] text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-[#0B192C]/10 transition-colors"
                    >
                        Edit Product
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}