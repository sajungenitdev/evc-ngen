// components/Home/HelpSupportSection.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { helpSupportAPI, HelpSupportData } from '@/lib/api/helpSupport';
import { Loader2 } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const IMAGE_BASE_URL = API_BASE_URL.replace(/\/api$/, '');

// ============================================================================
// Image Component (Same pattern as ProductThumbnail)
// ============================================================================

interface HelpImageProps {
    imageUrl: string;
    alt: string;
    className?: string;
    fallback?: React.ReactNode;
}

const HelpImage: React.FC<HelpImageProps> = ({
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

        return `${IMAGE_BASE_URL}/uploads/help-support/${trimmed}`;
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
                console.error('❌ Failed to load help image:', fullUrl);
                setHasError(true);
            }}
            loading="lazy"
        />
    );
};

// ============================================================================
// Default Data
// ============================================================================

const DEFAULT_HELP_DATA: HelpSupportData = {
    _id: '',
    salesCard: {
        status: 'Sales Team Online',
        title: 'Need help choosing a charger?',
        highlightText: 'Talk to our team.',
        buttonText: 'Call +1 (800) 555-0199',
        phoneLink: '18005550199',
        imageUrl: '/images/help/need-help.jpg',
        isActive: true
    },
    ticketCard: {
        description: 'Need something else? Raise a ticket and we\'ll get back to you.',
        linkText: 'Raise a Ticket →',
        link: '/contact',
        imageUrl: '/images/help/Raise-Ticket.jpg',
        isActive: true
    },
    supportHubCard: {
        description: 'Find answers, guides, and advice, all in one place',
        linkText: 'Visit our Support Hub →',
        link: '/faq',
        imageUrl: '/images/help/charge-ev_9-1.webp',
        isActive: true
    },
    reviewCard: {
        description: 'Help us continue to improve our network',
        linkText: 'Leave a Review →',
        link: '/contact',
        imageUrl: '/images/help/improve-our-network.jpg',
        isActive: true
    },
    socialCard: {
        title: 'Stay connected',
        imageUrl: '/images/help/Stay-connected.jpg',
        socials: [
            { name: 'X', link: 'https://twitter.com', isActive: true },
            { name: 'in', link: 'https://linkedin.com', isActive: true },
            { name: 'f', link: 'https://facebook.com', isActive: true }
        ],
        isActive: true
    },
    isActive: true,
    sectionId: 'help-support'
};

// ============================================================================
// Main Component
// ============================================================================

export default function HelpSupportSection() {
    const [helpData, setHelpData] = useState<HelpSupportData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchHelpData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const response = await helpSupportAPI.getActive();

                if (response.success && response.data) {
                    setHelpData(response.data);
                } else {
                    setHelpData(DEFAULT_HELP_DATA);
                }
            } catch (error) {
                console.error('Error fetching help data:', error);
                setError('Failed to load help data');
                setHelpData(DEFAULT_HELP_DATA);
            } finally {
                setIsLoading(false);
            }
        };

        fetchHelpData();
    }, []);

    // Loading state
    if (isLoading) {
        return (
            <section className="bg-ev-light-gray py-24 px-6 md:px-12 lg:px-20">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-12 h-12 text-[#1b7936] animate-spin" />
                    </div>
                </div>
            </section>
        );
    }

    if (!helpData) {
        return null;
    }

    const { salesCard, ticketCard, supportHubCard, reviewCard, socialCard } = helpData;

    // Filter active socials
    const activeSocials = socialCard?.socials?.filter(s => s.isActive !== false) || [];

    return (
        <section className="bg-ev-light-gray py-24 px-6 md:px-12 lg:px-20 relative overflow-hidden">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Top Row: 2 Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* Sales Team Card (Span 8) */}
                    <div className="relative lg:col-span-8 rounded-3xl p-8 sm:p-12 text-white flex flex-col justify-between shadow-xl min-h-90 overflow-hidden bg-[#114b34] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl group">
                        <div className="absolute inset-0">
                            <HelpImage
                                imageUrl={salesCard.imageUrl}
                                alt="Sales Team Background"
                                className="object-cover opacity-30 group-hover:scale-105 transition-transform duration-700 w-full h-full"
                                fallback="📞"
                            />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-[#114b34] via-[#114b34]/90 to-transparent"></div>

                        <div className="relative z-10">
                            {/* Online Status Badge */}
                            <div className="flex items-center gap-2 mb-6">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e] animate-pulse"></span>
                                <span className="text-[#22c55e] text-xs font-bold uppercase tracking-wider">
                                    {salesCard.status || 'Sales Team Online'}
                                </span>
                            </div>
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
                                {salesCard.title || 'Need help choosing a charger?'}{' '}
                                <span className="text-[#22c55e]">{salesCard.highlightText || 'Talk to our team.'}</span>
                            </h2>
                        </div>

                        <div className="relative z-10 pt-8">
                            <Link
                                href={`/contact`}
                                className="inline-block mt-4 bg-[#1b7936] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#155f2b] transition-colors"
                            >
                                {salesCard.buttonText || 'Call +1 (800) 555-0199'}
                            </Link>
                        </div>
                    </div>

                    {/* Raise a Ticket Card (Span 4) */}
                    <div className="relative lg:col-span-4 rounded-3xl p-8 sm:p-10 text-white flex flex-col justify-between shadow-xl min-h-90 overflow-hidden bg-[#648777] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl group">
                        <div className="absolute inset-0">
                            <HelpImage
                                imageUrl={ticketCard.imageUrl}
                                alt="Raise a Ticket Background"
                                className="object-cover opacity-30 group-hover:scale-105 transition-transform duration-700 w-full h-full"
                                fallback="🎫"
                            />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-[#071322] via-[#36495d]/60 to-transparent"></div>

                        <p className="relative z-10 text-xl sm:text-2xl font-bold leading-snug tracking-tight">
                            {ticketCard.description || 'Need something else? Raise a ticket and we\'ll get back to you.'}
                        </p>
                        <div className="relative z-10">
                            <Link
                                href={ticketCard.link || '/contact'}
                                className="inline-flex items-center gap-1 text-white font-bold text-sm hover:translate-x-1 transition-transform"
                            >
                                {ticketCard.linkText || 'Raise a Ticket →'}
                            </Link>
                        </div>
                    </div>

                </div>

                {/* Bottom Row: 3 Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Support Hub Card */}
                    <div className="relative rounded-3xl p-8 sm:p-10 flex flex-col justify-between shadow-sm min-h-70 overflow-hidden bg-[#e9edf060] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl group">
                        <div className="absolute inset-0">
                            <HelpImage
                                imageUrl={supportHubCard.imageUrl}
                                alt="Support Hub Background"
                                className="object-cover group-hover:scale-105 transition-transform duration-700 w-full h-full"
                                fallback="📚"
                            />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-[#071322] via-[#36495d]/60 to-transparent"></div>

                        <p className="relative z-10 text-lg sm:text-xl font-bold text-white leading-snug">
                            {supportHubCard.description || 'Find answers, guides, and advice, all in one place'}
                        </p>
                        <div className="relative z-10">
                            <Link
                                href={supportHubCard.link || '/faq'}
                                className="inline-flex items-center gap-1 text-white font-bold text-sm hover:translate-x-1 transition-transform"
                            >
                                {supportHubCard.linkText || 'Visit our Support Hub →'}
                            </Link>
                        </div>
                    </div>

                    {/* Leave a Review Card */}
                    <div className="relative rounded-3xl p-8 sm:p-10 flex flex-col justify-between shadow-sm min-h-70 overflow-hidden bg-[#071322] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl group">
                        <div className="absolute inset-0">
                            <HelpImage
                                imageUrl={reviewCard.imageUrl}
                                alt="Leave a Review Background"
                                className="object-cover opacity-60 group-hover:scale-105 transition-transform duration-700 w-full h-full"
                                fallback="⭐"
                            />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-[#071322] via-[#36495d]/60 to-transparent"></div>

                        <p className="relative z-10 text-lg sm:text-xl font-bold text-white leading-snug drop-shadow-sm">
                            {reviewCard.description || 'Help us continue to improve our network'}
                        </p>
                        <div className="relative z-10">
                            <Link
                                href={reviewCard.link || '/contact'}
                                className="inline-flex underline items-center gap-1 text-white font-bold text-sm hover:translate-x-1 transition-transform drop-shadow-sm"
                            >
                                {reviewCard.linkText || 'Leave a Review →'}
                            </Link>
                        </div>
                    </div>

                    {/* Stay Connected Card */}
                    <div className="relative rounded-3xl p-8 sm:p-10 flex flex-col justify-between shadow-sm min-h-70 overflow-hidden bg-[#071322] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl group">
                        <div className="absolute inset-0">
                            <HelpImage
                                imageUrl={socialCard.imageUrl}
                                alt="Stay Connected Background"
                                className="object-cover opacity-60 group-hover:scale-105 transition-transform duration-700 w-full h-full"
                                fallback="🌐"
                            />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-[#071322] via-[#36495d]/60 to-transparent"></div>

                        <h3 className="relative z-10 text-lg sm:text-xl font-bold text-white">
                            {socialCard.title || 'Stay connected'}
                        </h3>
                        <div className="relative z-10 flex gap-3">
                            {activeSocials.map((social, idx) => (
                                <a
                                    key={idx}
                                    href={social.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 rounded-full bg-[#114b34] hover:bg-[#0c3625] text-white flex items-center justify-center font-bold text-sm transition-all duration-200 hover:scale-110 shadow-md"
                                >
                                    {social.name}
                                </a>
                            ))}
                        </div>
                    </div>

                </div>

            </div>
        </section>
    );
}