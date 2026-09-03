// app/(main)/solutions/[id]/page.tsx
'use client';

import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, use } from 'react';
import PageHeader from '@/components/pagesComps/PageHeader';
import { CheckCircle2, MessageSquare, Loader2 } from 'lucide-react';
import { getImageUrl, isDefaultImage } from '@/utils/imageHelper';
import toast from 'react-hot-toast';

interface PageProps {
    params: Promise<{ id: string }>;
}

interface Link {
    _id?: string;
    label: string;
    url: string;
}

interface Tab {
    _id?: string;
    tabLabel: string;
    badge: string;
    title: string;
    description: string;
    imageUrl: string;
    links: Link[];
}

interface UseCase {
    _id?: string;
    label: string;
    icon: string;
    imageUrl: string;
    link: string;
}

interface Card {
    _id?: string;
    icon: string;
    title: string;
    description: string;
    actionText: string;
    actionLink: string;
    theme: 'dark' | 'green' | 'light';
}

interface Section1 {
    tabs: Tab[];
}

interface Section2 {
    title: string;
    imageUrl: string;
    useCases: UseCase[];
}

interface Section3 {
    badge: string;
    title: string;
    cards: Card[];
}

interface Section4 {
    heading: string;
    subtext: string;
    buttonText: string;
    buttonLink: string;
}

interface Solution {
    _id: string;
    id: string;
    label: string;
    link: string;
    desc: string;
    imageUrl: string;
    title: string;
    subtitle: string;
    overview: string;
    section1: Section1;
    section2: Section2;
    section3: Section3;
    section4: Section4;
    features: string[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://evc-ngen-server.onrender.com/api';

// Helper to get clean slug
const getCleanSlug = (text: string): string => {
    if (!text) return 'solution';
    const parts = text.split('-');
    const lastPart = parts[parts.length - 1];
    if (/^\d+$/.test(lastPart)) {
        return parts.slice(0, -1).join('-');
    }
    return text;
};

// ✅ Image Component similar to ProductThumbnail
const SolutionImage: React.FC<{
    src: string;
    alt: string;
    className?: string;
    fallback?: string;
}> = ({ src, alt, className = 'w-full h-full object-cover', fallback = '📋' }) => {
    const [hasError, setHasError] = useState(false);

    const fullUrl = src ? getImageUrl(src) : null;
    const isValidImage = fullUrl && !hasError && !isDefaultImage(src);

    if (!isValidImage) {
        return (
            <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
                <span className="text-4xl">{fallback}</span>
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

export default function SolutionDetailPage({ params }: PageProps) {
    const { id } = use(params);
    const decodedId = decodeURIComponent(id);

    const [solution, setSolution] = useState<Solution | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(0);

    useEffect(() => {
        const fetchSolution = async () => {
            setIsLoading(true);
            try {
                console.log('🔍 Fetching solution with ID:', decodedId);

                const response = await fetch(`${API_BASE_URL}/solutions/${decodedId}`);
                const data = await response.json();

                console.log('📦 Response:', data);

                if (data.success) {
                    setSolution(data.data);
                    setIsLoading(false);
                    return;
                }

                const searchResponse = await fetch(`${API_BASE_URL}/solutions?limit=100`);
                const searchData = await searchResponse.json();

                if (searchData.success && searchData.data.length > 0) {
                    const found = searchData.data.find((s: Solution) => {
                        const cleanSlug = getCleanSlug(s.id || s.label);
                        return cleanSlug === decodedId ||
                            s.id === decodedId ||
                            s.label.toLowerCase().replace(/\s+/g, '-') === decodedId;
                    });

                    if (found) {
                        console.log('✅ Found solution:', found);
                        setSolution(found);
                        setIsLoading(false);
                        return;
                    }
                }

                console.log('❌ Solution not found');
                toast.error('Solution not found');
                notFound();
            } catch (error) {
                console.error('Failed to fetch solution:', error);
                toast.error('Failed to load solution');
                notFound();
            } finally {
                setIsLoading(false);
            }
        };

        if (decodedId) {
            fetchSolution();
        }
    }, [decodedId]);

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="text-center">
                    <Loader2 className="animate-spin h-12 w-12 text-[#1b7936] mx-auto" />
                    <p className="text-gray-500 mt-4 text-sm">Loading solution...</p>
                </div>
            </div>
        );
    }

    if (!solution) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-white">
            <PageHeader
                breadcrumbs={[
                    { label: 'Home', link: '/' },
                    { label: 'Solutions', link: '/solutions' },
                    { label: solution.label }
                ]}
                imageUrl={solution.imageUrl || '/images/help/EV Charging_1.jpg'}
                title={solution.title}
                description={solution.subtitle}
            />

            <section className="py-20 px-6 md:px-12 lg:px-20 bg-white">
                <div className="max-w-7xl mx-auto space-y-24">
                    {/* Overview & Technology */}
                    <div className="mb-8">
                        <h2 className="text-3xl font-extrabold text-[#071322] tracking-tight">
                            Overview & Technology
                        </h2>
                        <p className="text-gray-600 font-light pt-4 w-full lg:w-2/4 text-sm sm:text-base leading-relaxed" dangerouslySetInnerHTML={{ __html: solution.overview }} />
                    </div>

                    {/* SECTION 1: Interactive Tabs */}
                    {solution.section1 && solution.section1.tabs && solution.section1.tabs.length > 0 && (
                        <div className="space-y-12">
                            <div className="border-b border-gray-200">
                                <div className="max-w-7xl mx-auto flex gap-10 overflow-x-auto pb-0">
                                    {solution.section1.tabs.map((tab, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setActiveTab(idx)}
                                            className={`pb-4 text-sm font-bold whitespace-nowrap transition-colors border-b-2 px-1 ${activeTab === idx
                                                ? 'border-[#1b7936] text-[#071322]'
                                                : 'border-transparent text-gray-400 hover:text-gray-700'
                                                }`}
                                        >
                                            {tab.tabLabel}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="max-w-7xl mx-auto">
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                                    <div className="lg:col-span-6 space-y-6">
                                        <span className="text-[#1b7936] text-xs font-extrabold uppercase tracking-widest">
                                            {solution.section1.tabs[activeTab].badge}
                                        </span>
                                        <h3 className="text-3xl sm:text-4xl font-extrabold text-[#071322] tracking-tight leading-tight">
                                            {solution.section1.tabs[activeTab].title}
                                        </h3>
                                        <div className="text-gray-600 text-sm sm:text-base leading-relaxed wrap-break-word  max-w-full" dangerouslySetInnerHTML={{ __html: solution.section1.tabs[activeTab].description }} />
                                        <div className="flex flex-wrap gap-8 pt-2">
                                            {solution.section1.tabs[activeTab].links && solution.section1.tabs[activeTab].links.map((lnk, linkIdx) => (
                                                <Link
                                                    key={linkIdx}
                                                    href={lnk.url}
                                                    className="text-sm font-extrabold text-[#1b7936] hover:text-[#071322] transition-colors"
                                                >
                                                    {lnk.label}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="lg:col-span-6 relative h-90 sm:h-100 rounded-xl overflow-hidden ">
                                        <SolutionImage
                                            src={solution.section1.tabs[activeTab].imageUrl}
                                            alt={solution.section1.tabs[activeTab].title}
                                            className="w-full h-full object-scale-down transition-opacity duration-500"
                                            fallback="📋"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SECTION 2: Use Cases */}
                    {solution.section2 && solution.section2.useCases && solution.section2.useCases.length > 0 && (
                        <div className="bg-[#f3f6f9] py-16 px-5">
                            <div className="max-w-7xl mx-auto">
                                {solution.section2.title && (
                                    <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 text-center mb-8 capitalize">
                                        {solution.section2.title}
                                    </h3>
                                )}
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                    {solution.section2.useCases.map((useCase, idx) => (
                                        <Link
                                            key={idx}
                                            href={useCase.link || '/contact'}
                                            className="bg-white border border-gray-200/80 rounded-xl p-4 sm:p-5 flex items-center gap-3 transition-all hover:shadow-md hover:-translate-y-0.5 group"
                                        >
                                            <span className="text-xl shrink-0 flex items-center justify-center">
                                                {useCase.icon}
                                            </span>
                                            <span className="text-sm sm:text-base font-bold text-slate-800 capitalize leading-tight">
                                                {useCase.label}
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            <section className="py-20 px-6 md:px-12 lg:px-20">
                <div className="max-w-7xl mx-auto space-y-24">
                    {/* SECTION 3: Cards */}
                    {solution.section3 && solution.section3.cards && solution.section3.cards.length > 0 && (
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <span className="text-[#1b7936] text-xs font-bold uppercase tracking-wider">
                                    {solution.section3.badge}
                                </span>
                                <h3 className="text-3xl font-extrabold text-[#071322] tracking-tight">
                                    {solution.section3.title}
                                </h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {solution.section3.cards.map((card, idx) => (
                                    <div
                                        key={idx}
                                        className="bg-white border border-gray-200/80 rounded-xl p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-xs hover:shadow-md transition-shadow"
                                    >
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2.5">
                                                <span className="text-xl shrink-0">
                                                    {card.icon || '📄'}
                                                </span>
                                                <h4 className="text-lg font-bold text-[#071322]">
                                                    {card.title}
                                                </h4>
                                            </div>
                                            <p className="text-gray-600 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: card.description }} />
                                        </div>
                                        <div>
                                            <Link
                                                href={card.actionLink || '/contact'}
                                                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1b7936] hover:text-[#145a27] hover:underline transition-all"
                                            >
                                                <span>{card.actionText}</span>
                                                <span className="text-base">→</span>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Key Capabilities */}
                    {solution.features && solution.features.length > 0 && (
                        <div className="bg-[#f8f9fa] border border-gray-200/80 rounded-3xl p-8 sm:p-12 space-y-8">
                            <h3 className="text-2xl font-extrabold text-[#071322] tracking-tight">
                                Key Capabilities & Specifications
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {solution.features.map((feature, idx) => (
                                    <div key={idx} className="flex items-start gap-4 bg-white p-6 rounded-2xl border border-gray-200/60 shadow-xs">
                                        <CheckCircle2 className="w-6 h-6 text-[#3ec06a] shrink-0 mt-0.5" />
                                        <span className="text-gray-700 text-sm font-semibold leading-snug">
                                            {feature}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* SECTION 4: CTA */}
                    {solution.section4 && (
                        <div className="bg-[#0c1f38] text-white rounded-3xl p-8 sm:p-16 text-center space-y-8 relative overflow-hidden shadow-xl">
                            <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-[#3ec06a]/10 rounded-full blur-3xl pointer-events-none"></div>
                            <div className="relative z-10 max-w-2xl mx-auto space-y-4">
                                <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                                    {solution.section4.heading}
                                </h3>
                                <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                                    {solution.section4.subtext}
                                </p>
                                <div className="pt-4">
                                    <Link
                                        href={solution.section4.buttonLink || '/contact'}
                                        className="inline-flex items-center gap-2 bg-[#3ec06a] hover:bg-[#34a55b] text-[#071322] font-bold text-sm px-8 py-4 rounded-xl shadow-lg transition-all"
                                    >
                                        <MessageSquare className="w-4 h-4" />
                                        {solution.section4.buttonText}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}