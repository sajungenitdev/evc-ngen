// components/Home/StoriesSection.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { storiesAPI, StoriesData, Category } from '@/lib/api/stories';
import { Loader2 } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://evc-ngen-server.onrender.com/api';
const IMAGE_BASE_URL = API_BASE_URL.replace(/\/api$/, '');

// ============================================================================
// Story Image Component (Same pattern as ProductThumbnail)
// ============================================================================

interface StoryImageProps {
    imageUrl: string;
    alt: string;
    className?: string;
    fallback?: React.ReactNode;
}

const StoryImage: React.FC<StoryImageProps> = ({
    imageUrl,
    alt,
    className = 'w-full h-full object-cover',
    fallback = '📖'
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

        return `${IMAGE_BASE_URL}/uploads/stories/${trimmed}`;
    };

    const fullUrl = getFullUrl(imageUrl);

    const showFallback = !imageUrl || hasError || !fullUrl;

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
            onError={() => {
                console.error('❌ Failed to load story image:', fullUrl);
                setHasError(true);
            }}
            loading="lazy"
        />
    );
};

// ============================================================================
// Default Data
// ============================================================================

const DEFAULT_STORIES_DATA: StoriesData = {
    _id: '',
    heading: 'Discover Our Stories',
    subtitle: 'Real deployments, real impact — a closer look at how our charging infrastructure performs in the field.',
    mainStory: {
        quote: 'EVNGEN completed a 120kW DC fast-charging hub deployment in under six weeks, from site survey to grid commissioning — powering a commercial fleet depot around the clock.',
        linkText: 'See All Deployment Stories →',
        link: '/stories',
        imageUrl: '/images/stories/EVNGEN completed.webp',
        isActive: true
    },
    categories: [
        {
            title: 'At Home',
            imageUrl: '/images/stories/at-home.jpg',
            link: '/solutions?tab=home',
            order: 0,
            isActive: true
        },
        {
            title: 'At Work',
            imageUrl: '/images/stories/at-work.avif',
            link: '/solutions?tab=work',
            order: 1,
            isActive: true
        },
        {
            title: 'On the Road',
            imageUrl: '/images/stories/on-the-road.jpg',
            link: '/solutions?tab=road',
            order: 2,
            isActive: true
        },
        {
            title: 'At Retail',
            imageUrl: '/images/stories/At-Retail.webp',
            link: '/solutions?tab=retail',
            order: 3,
            isActive: true
        }
    ],
    isActive: true,
    backgroundColor: '#ffffff',
    textColor: '#071322',
    sectionId: 'stories'
};

// ============================================================================
// Main Component
// ============================================================================

export default function StoriesSection() {
    const [storiesData, setStoriesData] = useState<StoriesData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStories = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const response = await storiesAPI.getActive();

                if (response.success && response.data) {
                    setStoriesData(response.data);
                } else {
                    setStoriesData(DEFAULT_STORIES_DATA);
                }
            } catch (error) {
                console.error('Error fetching stories:', error);
                setError('Failed to load stories data');
                setStoriesData(DEFAULT_STORIES_DATA);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStories();
    }, []);

    if (isLoading) {
        return (
            <section className="bg-white py-24 pt-16 px-6 md:px-12 lg:px-20">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-12 h-12 text-[#1b7936] animate-spin" />
                    </div>
                </div>
            </section>
        );
    }

    if (!storiesData || !storiesData.mainStory || !storiesData.categories) {
        return null;
    }

    const activeCategories = storiesData.categories.filter(cat => cat.isActive !== false);

    if (activeCategories.length === 0) {
        return null;
    }

    const { mainStory, heading, subtitle } = storiesData;

    return (
        <section className="bg-white py-24 pt-16 px-6 md:px-12 lg:px-20 relative overflow-hidden">
            <div className="max-w-7xl mx-auto">
                {/* Heading & Subtitle */}
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#071322] tracking-tight mb-4">
                        {heading}
                    </h2>
                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                        {subtitle}
                    </p>
                </div>

                {/* Main Featured Banner Card */}
                <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl min-h-[400px] flex items-center mb-10 border border-gray-100 bg-[#071322]">
                    {/* Background Image with Overlay */}
                    <div className="absolute inset-0">
                        <StoryImage
                            imageUrl={mainStory.imageUrl}
                            alt="Featured Deployment Story"
                            className="object-cover opacity-60 w-full h-full"
                            fallback="📖"
                        />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-[#071322] via-[#071322]/80 to-transparent"></div>

                    {/* Content */}
                    <div className="relative z-10 max-w-2xl p-8 sm:p-12 lg:p-16 text-white space-y-6">
                        <p className="text-base sm:text-lg md:text-xl font-medium leading-relaxed tracking-tight">
                            {mainStory.quote}
                        </p>
                        <Link
                            href={mainStory.link || '/stories'}
                            className="inline-block text-[#3ec06a] hover:text-[#3ec06a]/80 font-bold text-sm sm:text-base transition-colors"
                        >
                            {mainStory.linkText || 'See All Deployment Stories →'}
                        </Link>
                    </div>
                </div>

                {/* 4 Category Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {activeCategories.map((cat, index) => (
                        <Link
                            key={cat._id || index}
                            href={cat.link || '/solutions'}
                            className="relative group h-[260px] rounded-2xl overflow-hidden shadow-lg block bg-[#071322]"
                        >
                            {/* Card Background Image */}
                            <div className="absolute inset-0">
                                <StoryImage
                                    imageUrl={cat.imageUrl}
                                    alt={cat.title}
                                    className="object-cover opacity-70 group-hover:scale-105 transition-transform duration-500 w-full h-full"
                                    fallback="📖"
                                />
                            </div>
                            {/* Gradient Overlay for Text Readability */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#071322] via-[#071322]/40 to-transparent"></div>

                            {/* Title Label */}
                            <div className="absolute bottom-6 left-6 z-10">
                                <h3 className="text-white font-extrabold text-lg sm:text-xl tracking-tight">
                                    {cat.title}
                                </h3>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}