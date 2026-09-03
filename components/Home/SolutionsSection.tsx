// components/Home/SolutionsSection.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { solutionSectionAPI, SolutionItem, SolutionSectionData } from '@/lib/api/solutionSection';
import { Loader2 } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://evc-ngen-server.onrender.com/api';
const IMAGE_BASE_URL = API_BASE_URL.replace(/\/api$/, '');

// ============================================================================
// Solution Image Component
// ============================================================================

interface SolutionImageProps {
    imageUrl: string;
    title: string;
    className?: string;
}

const SolutionImage: React.FC<SolutionImageProps> = ({
    imageUrl,
    title,
    className = ''
}) => {
    const [hasError, setHasError] = useState<boolean>(false);

    const getFullUrl = (path: string): string | null => {
        if (!path || path.trim() === '') return null;
        const trimmed = path.trim();

        if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
            return trimmed;
        }

        if (trimmed.startsWith('/uploads')) {
            return `${IMAGE_BASE_URL}${trimmed}`;
        }

        // For /images/ paths
        if (trimmed.startsWith('/images')) {
            return `${IMAGE_BASE_URL}${trimmed}`;
        }

        return `${IMAGE_BASE_URL}/uploads/solutions/${trimmed}`;
    };

    const fullUrl = getFullUrl(imageUrl);

    const showFallback = !imageUrl || hasError || !fullUrl;

    // Check if it's a default/placeholder image
    const isDefault = imageUrl?.includes('default') ||
        imageUrl?.includes('placeholder') ||
        imageUrl?.includes('no-image');

    if (showFallback || isDefault) {
        return (
            <div className={`w-full h-full flex items-center justify-center bg-gray-100 ${className}`}>
                <span className="text-6xl opacity-20">💡</span>
            </div>
        );
    }

    return (
        <img
            src={fullUrl}
            alt={title}
            className={`w-full h-full object-cover ${className}`}
            onError={(e) => {
                console.error('❌ Failed to load solution image:', fullUrl);
                setHasError(true);
                e.currentTarget.style.display = 'none';
            }}
            loading="lazy"
        />
    );
};

// ============================================================================
// Default Data
// ============================================================================

const DEFAULT_SOLUTIONS_DATA: SolutionSectionData = {
    _id: '',
    heading: 'Deliver Our Solutions',
    subtitle: 'We deliver cutting-edge technologies across Power Quality, EV Charging, Energy Storage, and Battery Testing.',
    items: [
        {
            title: 'Power Quality',
            slug: 'power-quality',
            subtitle: 'Enhancing Energy Efficiency, Safeguarding Grid Security',
            description: 'Comprehensive low-voltage power quality solutions that optimize electricity usage across industrial and commercial environments.',
            link: '/solutions',
            imageUrl: '/images/solutions/EV-Charging-eBook-landing-page.jpg',
            order: 0,
            isActive: true
        },
        {
            title: 'EV Charging',
            slug: 'ev-charging',
            subtitle: 'Fast on Demand, Intelligently Efficient',
            description: 'High-efficiency power modules and reliable charging systems spanning 7kW to 1,280kW for residential, commercial, and fleet use.',
            link: '/ev-chargers',
            imageUrl: '/images/solutions/images.jpg',
            order: 1,
            isActive: true
        },
        {
            title: 'Energy Storage',
            slug: 'energy-storage',
            subtitle: 'Empowering Partners, Empowering Energy Freedom',
            description: 'Modular storage solutions tailored for utility-scale, commercial & industrial, and microgrid applications.',
            link: '/about',
            imageUrl: '/images/solutions/Energy Storage.webp',
            order: 2,
            isActive: true
        },
        {
            title: 'Battery Testing',
            slug: 'battery-testing',
            subtitle: 'Advanced Battery Test Solutions to Empower Green Energy',
            description: 'Innovative, intelligent, safe, and reliable test & formation-grading solutions for world-class battery labs and production lines.',
            link: '/about',
            imageUrl: '/images/solutions/Battery Testing.jpg',
            order: 3,
            isActive: true
        }
    ],
    isActive: true,
    backgroundColor: '#ffffff',
    textColor: '#071322',
    sectionId: 'solutions'
};

// ============================================================================
// Main Component
// ============================================================================

export default function SolutionsSection() {
    const [solutionsData, setSolutionsData] = useState<SolutionSectionData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSolutions = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const response = await solutionSectionAPI.getActive();

                if (response.success && response.data) {
                    setSolutionsData(response.data);
                } else {
                    // Use default data if API fails
                    setSolutionsData(DEFAULT_SOLUTIONS_DATA);
                }
            } catch (error) {
                console.error('Error fetching solutions:', error);
                setError('Failed to load solutions data');
                // Use default data on error
                setSolutionsData(DEFAULT_SOLUTIONS_DATA);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSolutions();
    }, []);

    // Loading state
    if (isLoading) {
        return (
            <section className="bg-white py-10 px-6 md:px-12 lg:px-20">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-12 h-12 text-[#1b7936] animate-spin" />
                    </div>
                </div>
            </section>
        );
    }

    // No data state
    if (!solutionsData || !solutionsData.items || solutionsData.items.length === 0) {
        return null;
    }

    // Filter active items
    const activeItems = solutionsData.items.filter(item => item.isActive !== false);

    if (activeItems.length === 0) {
        return null;
    }

    return (
        <section className="bg-white py-10 px-6 md:px-12 lg:px-20 relative overflow-hidden">
            <div className="max-w-7xl mx-auto">
                {/* Heading & Subtitle */}
                <div className="text-center max-w-2xl mx-auto mb-20">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#14304f] tracking-tight mb-4">
                        {solutionsData.heading}
                    </h2>
                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                        {solutionsData.subtitle}
                    </p>
                </div>

                {/* Alternating Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2">
                    {/* Row 1: Left Image, Right Card */}
                    <div className="relative w-full h-[380px] sm:h-[420px] overflow-hidden shadow-lg bg-gray-100">
                        <SolutionImage
                            imageUrl={activeItems[0]?.imageUrl || ''}
                            title={activeItems[0]?.title || 'Solution'}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <SolutionCard item={activeItems[0]} />

                    {/* Row 2: Left Card, Right Image */}
                    {activeItems[1] && (
                        <>
                            <SolutionCard item={activeItems[1]} />
                            <div className="relative w-full h-[380px] sm:h-[420px] overflow-hidden shadow-lg bg-gray-100">
                                <SolutionImage
                                    imageUrl={activeItems[1].imageUrl || ''}
                                    title={activeItems[1].title || 'Solution'}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </>
                    )}

                    {/* Row 3: Left Image, Right Card */}
                    {activeItems[2] && (
                        <>
                            <div className="relative w-full h-[380px] sm:h-[420px] overflow-hidden shadow-lg bg-gray-100">
                                <SolutionImage
                                    imageUrl={activeItems[2].imageUrl || ''}
                                    title={activeItems[2].title || 'Solution'}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <SolutionCard item={activeItems[2]} />
                        </>
                    )}

                    {/* Row 4: Left Card, Right Image */}
                    {activeItems[3] && (
                        <>
                            <SolutionCard item={activeItems[3]} />
                            <div className="relative w-full h-[380px] sm:h-[420px] overflow-hidden shadow-lg bg-gray-100">
                                <SolutionImage
                                    imageUrl={activeItems[3].imageUrl || ''}
                                    title={activeItems[3].title || 'Solution'}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </section>
    );
}

// ============================================================================
// Solution Card Component
// ============================================================================

interface SolutionCardProps {
    item: SolutionItem;
}

function SolutionCard({ item }: SolutionCardProps) {
    return (
        <div className="bg-gradient-to-br from-[#12583c] via-[#0d3630] to-[#071322] p-8 sm:p-10 text-white shadow-xl flex flex-col items-start justify-center gap-6 text-start h-[380px] sm:h-[420px]">
            <div>
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2 text-white">
                    {item.title}
                </h3>
                <h4 className="text-[#3ec06a] font-semibold text-xs sm:text-sm mb-4 tracking-wide">
                    {item.subtitle}
                </h4>
                <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                    {item.description}
                </p>
            </div>

            <div>
                <Link
                    href={item.link || `/solutions/${item.slug}`}
                    className="inline-flex items-center gap-2 border border-white/30 hover:border-[#3ec06a] hover:bg-white/10 text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-full transition-all duration-200 group"
                >
                    View More
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
            </div>
        </div>
    );
}