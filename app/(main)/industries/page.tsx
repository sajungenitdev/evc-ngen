// app/(main)/industries/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import PageHeader from '@/components/pagesComps/PageHeader';
import { ArrowRight, Search, Loader2 } from 'lucide-react';
import { getImageUrl, isDefaultImage } from '@/utils/imageHelper';

// Industry Interface
interface Industry {
    _id: string;
    id: string;
    label: string;
    slug: string;
    desc: string;
    icon: string;
    imageUrl: string;
    title: string;
    subtitle: string;
    overview: string;
    challenges: string[];
    solutions: string[];
    benefits: string[];
    caseStudy: {
        title: string;
        description: string;
        imageUrl: string;
        link: string;
    };
    features: string[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://evc-ngen-server.onrender.com/api';

export default function IndustriesPage() {
    const [industries, setIndustries] = useState<Industry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch industries from API
    useEffect(() => {
        const fetchIndustries = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`${API_BASE_URL}/industries?limit=100&isActive=true`);
                const data = await res.json();

                if (data.success) {
                    setIndustries(data.data || []);
                } else {
                    console.error('Failed to fetch industries:', data.message);
                    setIndustries([]);
                }
            } catch (error) {
                console.error('Error fetching industries:', error);
                setIndustries([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchIndustries();
    }, []);

    // Filter industries based on search
    const filteredIndustries = industries.filter(industry =>
        industry.label?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        industry.desc?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        industry.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Helper to get icon
    const getIndustryIcon = (industry: Industry) => {
        return industry.icon || '🏢';
    };

    // Helper to get image URL
    const getIndustryImageUrl = (imageUrl: string) => {
        if (!imageUrl) return '/images/industries/default.jpg';
        return getImageUrl(imageUrl);
    };

    // ✅ Helper to encode the industry ID for URL
    const getEncodedLink = (industry: Industry) => {
        const id = industry.id || industry.slug || industry._id;
        // Encode special characters for URL
        const encodedId = encodeURIComponent(id);
        return `/industries/${encodedId}`;
    };

    // ✅ Helper to get clean display label
    const getDisplayLabel = (label: string) => {
        if (!label) return 'Unnamed Industry';
        return label;
    };

    return (
        <div className="bg-white min-h-screen">
            <PageHeader
                breadcrumbs={[
                    { label: 'Home', link: '/' },
                    { label: 'Industries' }
                ]}
                imageUrl="/images/help/industries-hero.jpg"
                title="Industries We Serve"
                description="From fuel retail to fleet logistics, we provide tailored EV charging solutions for every industry."
            />

            <section className="max-w-7xl mx-auto py-12 pb-24 px-4 sm:px-6">

                {/* Search Bar */}
                <div className="mb-10 max-w-2xl mx-auto">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search industries..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#f8f9fa] border border-gray-200 rounded-2xl px-5 py-3.5 pl-12 text-sm focus:outline-none focus:border-[#1b7936] transition-colors"
                        />
                        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-12 h-12 text-[#1b7936] animate-spin" />
                        <p className="text-gray-500 text-sm mt-4">Loading industries...</p>
                    </div>
                )}

                {/* Industries Grid */}
                {!isLoading && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredIndustries.map((industry) => {
                                const icon = getIndustryIcon(industry);
                                const imageUrl = getIndustryImageUrl(industry.imageUrl);
                                const hasValidImage = imageUrl && !isDefaultImage(industry.imageUrl);
                                const encodedLink = getEncodedLink(industry);
                                const displayLabel = getDisplayLabel(industry.label);

                                return (
                                    <Link
                                        key={industry._id || industry.id}
                                        href={encodedLink}
                                        className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                                    >
                                        {/* Image */}
                                        <div className="relative h-53 overflow-hidden bg-[#f8f9fa]">
                                            {hasValidImage ? (
                                                <img
                                                    src={imageUrl}
                                                    alt={displayLabel}
                                                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.style.display = 'none';
                                                        const parent = target.parentElement;
                                                        if (parent) {
                                                            const fallback = document.createElement('div');
                                                            fallback.className = 'w-full h-full flex items-center justify-center text-6xl bg-[#f8f9fa]';
                                                            fallback.textContent = icon;
                                                            parent.appendChild(fallback);
                                                        }
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-6xl bg-[#f8f9fa]">
                                                    {icon}
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-[#0B192C]/60 to-transparent"></div>
                                            {/* <div className="absolute bottom-4 left-4 text-white text-3xl">
                                                {icon}
                                            </div> */}
                                        </div>

                                        {/* Content */}
                                        <div className="p-5">
                                            <h3 className="text-lg font-extrabold text-[#0B192C] group-hover:text-[#1b7936] transition-colors">
                                                {displayLabel}
                                            </h3>
                                            <p className="text-sm font-semibold text-[#0B192C] mt-1 leading-relaxed">
                                                {industry.subtitle || industry.title || ''}
                                            </p>
                                            <p className="text-gray-500 text-xs mt-2 leading-relaxed line-clamp-2">
                                                {industry.desc || 'Industry solutions for EV charging'}
                                            </p>
                                            <div className="mt-3 flex items-center text-[#1b7936] font-semibold text-sm group-hover:gap-2 transition-all">
                                                Learn More <ArrowRight className="w-4 h-4 ml-1 group-hover:ml-2 transition-all" />
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>

                        {/* No Results */}
                        {filteredIndustries.length === 0 && (
                            <div className="text-center py-20">
                                <div className="text-6xl mb-4">🔍</div>
                                <h3 className="text-2xl font-extrabold text-[#071322]">No industries found</h3>
                                <p className="text-gray-500 text-sm mt-2">
                                    Try adjusting your search terms.
                                </p>
                            </div>
                        )}
                    </>
                )}

                {/* CTA */}
                <div className="mt-20 bg-gradient-to-br from-[#0B192C] to-[#1b7936] rounded-3xl p-12 text-center text-white">
                    <h2 className="text-3xl font-extrabold mb-4">
                        Don't See Your Industry?
                    </h2>
                    <p className="text-white/80 text-sm max-w-2xl mx-auto mb-8">
                        We work with organizations across all sectors. Contact us to discuss your specific needs.
                    </p>
                    <Link
                        href="/contact"
                        className="bg-white text-[#0B192C] hover:bg-gray-100 font-bold px-8 py-3.5 rounded-xl transition-colors inline-block"
                    >
                        Contact Our Team
                    </Link>
                </div>

            </section>
        </div>
    );
}