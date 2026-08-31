// components/Home/FoundationSection.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

import { Loader2 } from 'lucide-react';
import { FoundationData } from '@/lib/api/about';
import { foundationAPI, FoundationData, FoundationItem } from '@/lib/api/foundation';

// Default data as fallback
const DEFAULT_FOUNDATION: FoundationData = {
    _id: '',
    heading: 'Build Our Foundation',
    subtitle: 'EVNGEN is driven by a mission to make electric energy work harder for people and the planet — engineering every product around reliability, efficiency, and long-term value.',
    items: [
        {
            title: 'Values',
            description: 'Sincerity, integrity, and long-termism guide every decision we make.',
            bgClass: '#0c1f38',
            imageUrl: '/images/foundation/EV-Article-Charging-RR.jpg',
            imageAlt: 'Values - EVNGEN core principles',
            order: 0,
            isActive: true
        },
        {
            title: 'Development',
            description: 'Unceasing in effort, boundless in reach.',
            bgClass: '#16493f',
            imageUrl: '/images/foundation/ev-2-edit.min_.jpg',
            imageAlt: 'Development - EVNGEN growth',
            order: 1,
            isActive: true
        },
        {
            title: 'Technology',
            description: 'Be the energy master in the grid.',
            bgClass: '#0c2138',
            imageUrl: '/images/foundation/innovations-voitures-electriques.jpg',
            imageAlt: 'Technology - EVNGEN innovation',
            order: 2,
            isActive: true
        },
        {
            title: 'Sustainability',
            description: 'Driving the transition to a greener, sustainable future.',
            bgClass: '#183a1f',
            imageUrl: '/images/foundation/green_EV_charger_and_car_smart_city_Adobe_rt.jpg',
            imageAlt: 'Sustainability - EVNGEN green future',
            order: 3,
            isActive: true
        }
    ],
    isActive: true,
    backgroundColor: '#ffffff',
    textColor: '#071322'
};

export default function FoundationSection() {
    const [foundationData, setFoundationData] = useState<FoundationData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFoundation = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const response = await foundationAPI.getActive();

                if (response.success && response.data) {
                    setFoundationData(response.data);
                } else {
                    // Use default data if API fails
                    setFoundationData(DEFAULT_FOUNDATION);
                }
            } catch (error) {
                console.error('Error fetching foundation:', error);
                setError('Failed to load foundation data');
                // Use default data on error
                setFoundationData(DEFAULT_FOUNDATION);
            } finally {
                setIsLoading(false);
            }
        };

        fetchFoundation();
    }, []);

    // Loading state
    if (isLoading) {
        return (
            <section className="bg-white py-24 px-6 md:px-12 lg:px-20">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-12 h-12 text-[#1b7936] animate-spin" />
                    </div>
                </div>
            </section>
        );
    }

    // No data state
    if (!foundationData || !foundationData.items || foundationData.items.length === 0) {
        return null;
    }

    // Filter active items
    const activeItems = foundationData.items.filter(
        (item: FoundationItem) => item.isActive !== false
    );

    if (activeItems.length === 0) {
        return null;
    }

    // Get image URL helper
    const getImageUrl = (imageUrl: string): string => {
        if (!imageUrl) return '';
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            return imageUrl;
        }
        const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || 'http://localhost:5000';
        return `${baseUrl}${imageUrl}`;
    };

    return (
        <section className="bg-white py-24 px-6 md:px-12 lg:px-20">
            <div className="max-w-7xl mx-auto">
                {/* Heading & Subtitle */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#14304f] tracking-tight mb-4">
                        {foundationData.heading}
                    </h2>
                    <p className="text-[#5a6472] text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
                        {foundationData.subtitle}
                    </p>
                </div>

                {/* 4 Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {activeItems.map((item: FoundationItem, index: number) => (
                        <div
                            key={item._id || index}
                            className="relative rounded-lg overflow-hidden min-h-[420px] group cursor-pointer transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl"
                            style={{ backgroundColor: item.bgClass || '#0c1f38' }}
                        >
                            {/* Background Image */}
                            <div className="absolute inset-0">
                                {item.imageUrl ? (
                                    <img
                                        src={getImageUrl(item.imageUrl)}
                                        alt={item.imageAlt || item.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-6xl text-white/20 bg-[#0c1f38]">
                                        🏗️
                                    </div>
                                )}
                                {/* Image Overlay with Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0c1f38]/90 via-[#0c1f38]/50 to-transparent"></div>
                            </div>

                            {/* Content */}
                            <div className="relative z-10 h-full flex flex-col justify-end p-6 pb-8">
                                <h3 className="text-white font-extrabold text-2xl mb-3 tracking-tight">
                                    {item.title}
                                </h3>
                                <p className="text-[#d8dfe8] text-sm leading-relaxed">
                                    {item.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}