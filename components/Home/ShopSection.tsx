// components/Home/ShopSection.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { evShopAPI, EvShopData, ShopItem } from '@/lib/api/evShop';
import { Loader2 } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const IMAGE_BASE_URL = API_BASE_URL.replace(/\/api$/, '');

// ============================================================================
// Shop Image Component (Same pattern as ProductThumbnail)
// ============================================================================

interface ShopImageProps {
    imageUrl: string;
    alt: string;
    className?: string;
    fallback?: React.ReactNode;
}

const ShopImage: React.FC<ShopImageProps> = ({
    imageUrl,
    alt,
    className = 'w-full h-full object-cover',
    fallback = '🛒'
}) => {
    const [hasError, setHasError] = useState<boolean>(false);

    const getFullUrl = (path: string): string | null => {
        if (!path || path.trim() === '') return null;
        const trimmed = path.trim();

        if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
            return trimmed;
        }

        if (trimmed.startsWith('data:image')) {
            return trimmed;
        }

        if (trimmed.startsWith('/uploads')) {
            return `${IMAGE_BASE_URL}${trimmed}`;
        }

        if (trimmed.startsWith('/images')) {
            return `${IMAGE_BASE_URL}${trimmed}`;
        }

        return `${IMAGE_BASE_URL}/uploads/ev-shop/${trimmed}`;
    };

    const fullUrl = getFullUrl(imageUrl);

    const showFallback = !imageUrl || hasError || !fullUrl;

    if (showFallback) {
        return (
            <div className={`flex items-center justify-center bg-gray-800 ${className}`}>
                <span className="text-4xl opacity-40">{fallback}</span>
            </div>
        );
    }

    return (
        <img
            src={fullUrl}
            alt={alt}
            className={className}
            onError={() => {
                console.error('❌ Failed to load shop image:', fullUrl);
                setHasError(true);
            }}
            loading="lazy"
        />
    );
};

// ============================================================================
// Default Data
// ============================================================================

const DEFAULT_SHOP_DATA: EvShopData = {
    _id: '',
    heading: 'EV Shop Online',
    items: [
        {
            title: 'Chargers',
            buttonText: 'Shop',
            link: '/ev-chargers?category=chargers',
            bgClass: 'bg-gradient-to-br from-[#1b854a] to-[#125530]',
            imageUrl: '/images/help/charger.jpg',
            order: 0,
            isActive: true
        },
        {
            title: 'Cables & Connectors',
            buttonText: 'Shop',
            link: '/ev-chargers?category=cables',
            bgClass: 'bg-gradient-to-br from-[#176641] to-[#0a1c2e]',
            imageUrl: '/images/help/group-of-EV-charging-stations.jpg',
            order: 1,
            isActive: true
        },
        {
            title: 'Accessories',
            buttonText: 'Shop',
            link: '/ev-chargers?category=accessories',
            bgClass: 'bg-gradient-to-br from-[#144a35] to-[#071322]',
            imageUrl: '/images/help/Accessories.jpg',
            order: 2,
            isActive: true
        }
    ],
    viewAllButton: {
        text: 'View All',
        link: '/ev-chargers',
        isActive: true
    },
    isActive: true,
    backgroundColor: '#ffffff',
    textColor: '#071322',
    sectionId: 'ev-shop'
};

// ============================================================================
// Main Component
// ============================================================================

export default function ShopSection() {
    const [shopData, setShopData] = useState<EvShopData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchShopData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const response = await evShopAPI.getActive();

                if (response.success && response.data) {
                    setShopData(response.data);
                } else {
                    setShopData(DEFAULT_SHOP_DATA);
                }
            } catch (error) {
                console.error('Error fetching shop data:', error);
                setError('Failed to load shop data');
                setShopData(DEFAULT_SHOP_DATA);
            } finally {
                setIsLoading(false);
            }
        };

        fetchShopData();
    }, []);

    // Loading state
    if (isLoading) {
        return (
            <section className="bg-white py-24 px-6 md:px-12 lg:px-20">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-12 h-12 text-[#1b7936] animate-spin" />
                    </div>
                </div>
            </section>
        );
    }

    if (!shopData || !shopData.items || shopData.items.length === 0) {
        return null;
    }

    const activeItems = shopData.items.filter(item => item.isActive !== false);

    if (activeItems.length === 0) {
        return null;
    }

    const { heading, viewAllButton } = shopData;

    return (
        <section className="bg-white py-24 px-6 md:px-12 lg:px-20 relative overflow-hidden">
            <div className="max-w-7xl mx-auto text-center">
                {/* Heading */}
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#071322] tracking-tight mb-16">
                    {heading}
                </h2>

                {/* 3 Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    {activeItems.map((item, index) => (
                        <div
                            key={item._id || index}
                            className={`relative rounded-3xl p-8 sm:p-10 text-white flex flex-col justify-between h-[360px] sm:h-[400px] shadow-xl text-left overflow-hidden ${item.bgClass} transition-all duration-300 hover:-translate-y-1.5 group`}
                        >
                            {/* Background Image & Gradient Overlay */}
                            <div className="absolute inset-0">
                                <ShopImage
                                    imageUrl={item.imageUrl}
                                    alt={item.title}
                                    className="object-cover opacity-40 group-hover:scale-105 transition-transform duration-700 w-full h-full"
                                    fallback="🛒"
                                />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-[#071322] via-[#071322]/40 to-transparent"></div>

                            <div className="relative z-10"></div> {/* Spacer to push content down */}

                            <div className="relative z-10 space-y-6">
                                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight drop-shadow-sm">
                                    {item.title}
                                </h3>
                                <div>
                                    <Link
                                        href={item.link}
                                        className="inline-block border border-white/60 hover:border-white hover:bg-white/10 text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-lg transition-all duration-200 backdrop-blur-xs"
                                    >
                                        {item.buttonText}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* View All Button */}
                {viewAllButton && viewAllButton.isActive !== false && (
                    <div>
                        <Link
                            href={viewAllButton.link}
                            className="inline-block bg-[#166030] hover:bg-[#114b24] text-white font-bold text-sm px-8 py-3.5 rounded-full shadow-md transition-all duration-200 hover:scale-105"
                        >
                            {viewAllButton.text}
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
}