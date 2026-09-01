// components/Home/ChargingNeedsSection.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { getImageUrl, isDefaultImage } from '@/utils/imageHelper';

// ============================================================================
// Types
// ============================================================================

interface Product {
    _id: string;
    id: string;
    name: string;
    model: string;
    brand: string;
    category: string;
    categoryLabel: string;
    imageUrl: string;
    galleryImages?: string[];
    price: number;
    rating: number;
    stock: number;
    isActive: boolean;
    shortDescription: string;
    specs: string[];
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
    createdAt: string;
    updatedAt: string;
}

// ============================================================================
// Image Component with proper error handling
// ============================================================================

interface ProductImageProps {
    imageUrl: string | null | undefined;
    alt: string;
    className?: string;
    fallback?: React.ReactNode;
    onError?: () => void;
}

const ProductImage: React.FC<ProductImageProps> = ({
    imageUrl,
    alt,
    className = 'w-full h-full object-cover',
    fallback = '⚡',
    onError
}) => {
    const [hasError, setHasError] = useState<boolean>(false);
    const [fullUrl, setFullUrl] = useState<string | null>(null);

    useEffect(() => {
        // Reset error state when imageUrl changes
        setHasError(false);
        const url = getImageUrl(imageUrl);
        setFullUrl(url);

        // Debug logging
        console.log('🖼️ ProductImage Debug:', {
            imageUrl,
            fullUrl: url,
            isDefault: isDefaultImage(imageUrl)
        });
    }, [imageUrl]);

    const showFallback = !imageUrl || hasError || !fullUrl || isDefaultImage(imageUrl);

    if (showFallback) {
        return (
            <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
                <span className="text-4xl opacity-40">{fallback}</span>
            </div>
        );
    }

    return (
        <img
            src={fullUrl}
            alt={alt}
            className={className}
            onError={(e) => {
                console.error('❌ Failed to load product image:', fullUrl);
                setHasError(true);
                if (onError) onError();
            }}
            loading="lazy"
            onLoad={() => {
                console.log('✅ Image loaded successfully:', fullUrl);
            }}
        />
    );
};

// ============================================================================
// Main Component
// ============================================================================

export default function ChargingNeedsSection() {
    const [activeTab, setActiveTab] = useState<string>('');
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const response = await fetch(`${API_BASE_URL}/products?limit=100`, {
                    cache: 'no-store',
                    headers: {
                        'Cache-Control': 'no-cache, no-store, must-revalidate',
                        'Pragma': 'no-cache'
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();

                if (data.success && Array.isArray(data.data)) {
                    const activeProducts = (data.data as Product[]).filter((p) => p.isActive !== false);
                    setProducts(activeProducts);

                    const uniqueCategories = Array.from(
                        new Set(activeProducts.map((p) => p.category))
                    ).filter((category): category is string => typeof category === 'string' && category);

                    setCategories(uniqueCategories);

                    if (uniqueCategories.length > 0) {
                        setActiveTab(uniqueCategories[0]);
                    }

                    // Debug: Log first product image
                    if (activeProducts.length > 0) {
                        console.log('📦 Sample product image:', {
                            name: activeProducts[0].name,
                            imageUrl: activeProducts[0].imageUrl,
                            fullUrl: getImageUrl(activeProducts[0].imageUrl)
                        });
                    }
                } else {
                    setError('Failed to load products');
                    setProducts([]);
                }
            } catch (error) {
                console.error('Error fetching products:', error);
                setError('Failed to load products');
                setProducts([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, [API_BASE_URL]);

    // Get category label (convert category ID to display name)
    const getCategoryLabel = (categoryId: string): string => {
        const labels: Record<string, string> = {
            'ac-chargers': 'AC Chargers',
            'ac-charger': 'AC Chargers',
            'dc-chargers': 'DC Chargers',
            'dc-charger': 'DC Chargers',
            'accessories': 'Accessories',
            'cables': 'Cables & Connectors',
            'commercial': 'Commercial',
            'residential': 'Residential',
        };
        return labels[categoryId] || categoryId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    // Filter products by selected category
    const filteredProducts = products.filter((product) => product.category === activeTab);

    // Get only 3 products max
    const displayProducts = filteredProducts.slice(0, 3);

    // Loading state
    if (isLoading) {
        return (
            <section className="bg-[#f8f9fa] py-24 px-6 md:px-12 lg:px-20">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-12 h-12 text-[#1b7936] animate-spin" />
                    </div>
                </div>
            </section>
        );
    }

    // Error state
    if (error) {
        return (
            <section className="bg-[#f8f9fa] py-24 px-6 md:px-12 lg:px-20">
                <div className="max-w-7xl mx-auto text-center">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#071322] tracking-tight mb-8">
                        For All Your Charging Needs
                    </h2>
                    <p className="text-red-500 text-lg">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 inline-block bg-[#166030] hover:bg-[#114b24] text-white font-bold text-sm px-8 py-3.5 rounded-full transition-all duration-200"
                    >
                        Retry
                    </button>
                </div>
            </section>
        );
    }

    // No products state
    if (products.length === 0 || categories.length === 0) {
        return (
            <section className="bg-[#f8f9fa] py-24 px-6 md:px-12 lg:px-20">
                <div className="max-w-7xl mx-auto text-center">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#071322] tracking-tight mb-8">
                        For All Your Charging Needs
                    </h2>
                    <p className="text-gray-500 text-lg">No products available at the moment.</p>
                </div>
            </section>
        );
    }

    return (
        <section className="bg-[#f8f9fa] py-24 px-6 md:px-12 lg:px-20 relative overflow-hidden">
            <div className="max-w-7xl mx-auto text-center">
                {/* Heading */}
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#071322] tracking-tight mb-8">
                    For All Your Charging Needs
                </h2>

                {/* Tab Switcher - Dynamic from categories */}
                <div className="flex justify-center mb-16">
                    <div className="inline-flex bg-[#edf2f7] rounded-full border border-gray-300 relative p-0.5 flex-wrap justify-center">
                        {categories.slice(0, 4).map((category, index) => {
                            const isActive = activeTab === category;
                            const totalCategories = categories.slice(0, 4).length;
                            const isFirst = index === 0;
                            const isLast = index === totalCategories - 1;

                            let borderRadius = 'rounded-full';
                            if (isActive) {
                                if (isFirst && totalCategories > 1) {
                                    borderRadius = 'rounded-l-full rounded-r-none';
                                } else if (isLast && totalCategories > 1) {
                                    borderRadius = 'rounded-r-full rounded-l-none';
                                }
                            }

                            return (
                                <button
                                    key={category}
                                    onClick={() => setActiveTab(category)}
                                    className={`relative px-7 py-2.5 text-xs sm:text-sm font-bold tracking-wider transition-all duration-300 ease-in-out ${borderRadius} ${isActive
                                            ? 'bg-[#071322] text-white shadow-md scale-[1.02]'
                                            : 'bg-transparent text-gray-500 hover:text-[#071322] hover:bg-white/30'
                                        }`}
                                >
                                    {getCategoryLabel(category)}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {displayProducts.map((product) => (
                        <div
                            key={product._id || product.id}
                            className="bg-white rounded-2xl border border-gray-200 flex flex-col justify-between text-center overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
                        >
                            {/* Product Image Area */}
                            <div className="relative w-full h-56 bg-[#eef2f6] flex items-center justify-center p-6 overflow-hidden">
                                <ProductImage
                                    imageUrl={product.imageUrl}
                                    alt={product.name}
                                    className="object-cover w-full h-full"
                                    fallback="⚡"
                                />
                            </div>

                            {/* Content Area */}
                            <div className="p-6 sm:p-8 flex flex-col grow justify-between space-y-4">
                                <div className="space-y-2">
                                    <h3 className="text-lg font-bold text-[#071322] tracking-tight line-clamp-1">
                                        {product.name}
                                    </h3>
                                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-3" dangerouslySetInnerHTML={{ __html: product.shortDescription }} />
                                    {product.specs && product.specs.length > 0 && (
                                        <div className="flex flex-wrap gap-1 justify-center mt-2">
                                            {product.specs.slice(0, 2).map((spec, idx) => (
                                                <span key={idx} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                                    {spec}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <Link
                                        href={`/ev-chargers/${product.id || product._id}`}
                                        className="inline-block border border-[#071322] hover:bg-[#071322] hover:text-white text-[#071322] font-bold text-sm px-6 py-2.5 rounded-xl transition-all duration-200"
                                    >
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Show message if no products found in selected category */}
                {displayProducts.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">No products available in {getCategoryLabel(activeTab)}.</p>
                    </div>
                )}

                {/* View All Button */}
                <div className="mt-12">
                    <Link
                        href="/ev-chargers"
                        className="inline-block bg-[#166030] hover:bg-[#114b24] text-white font-bold text-sm px-8 py-3.5 rounded-full shadow-md transition-all duration-200 hover:scale-105"
                    >
                        View All Products
                    </Link>
                </div>
            </div>
        </section>
    );
}