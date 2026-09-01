// app/(main)/industries/[id]/page.tsx
'use client';

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { use, useState, useEffect } from 'react';
import Image from 'next/image';
import PageHeader from '@/components/pagesComps/PageHeader';
import {
    ArrowLeft,
    CheckCircle2,
    ArrowRight,
    Zap,
    MessageSquare,
    Loader2
} from 'lucide-react';
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

interface PageProps {
    params: Promise<{ id: string }>;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function IndustryDetailPage({ params }: PageProps) {
    const { id } = use(params);
    const [industry, setIndustry] = useState<Industry | null>(null);
    const [relatedIndustries, setRelatedIndustries] = useState<Industry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch industry data
    useEffect(() => {
        const fetchIndustryData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Fetch industry by ID
                const res = await fetch(`${API_BASE_URL}/industries/${id}`);
                const data = await res.json();

                if (data.success) {
                    setIndustry(data.data);
                } else {
                    setError(data.message || 'Industry not found');
                    setIndustry(null);
                }

                // Fetch related industries (exclude current)
                const relatedRes = await fetch(`${API_BASE_URL}/industries?limit=3&isActive=true`);
                const relatedData = await relatedRes.json();

                if (relatedData.success) {
                    const filtered = relatedData.data.filter(
                        (i: Industry) => i.id !== id && i.id !== data.data?.id
                    );
                    setRelatedIndustries(filtered.slice(0, 3));
                }
            } catch (error) {
                console.error('Error fetching industry:', error);
                setError('Failed to load industry data');
                setIndustry(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchIndustryData();
    }, [id]);

    // Show loading state
    if (isLoading) {
        return (
            <div className="bg-white min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-[#1b7936] animate-spin mx-auto" />
                    <p className="text-gray-500 text-sm mt-4">Loading industry details...</p>
                </div>
            </div>
        );
    }

    // Show not found - FIXED
    if (!industry || error) {
        return (
            <div className="bg-white min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">🔌</div>
                    <h1 className="text-2xl font-bold text-[#071322] mb-2">Industry Not Found</h1>
                    <p className="text-gray-500 text-sm">{error || 'The industry you are looking for does not exist.'}</p>
                    <Link
                        href="/industries"
                        className="mt-6 inline-block bg-[#1b7936] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#155f2b] transition-colors"
                    >
                        View All Industries
                    </Link>
                </div>
            </div>
        );
    }

    // Helper to get icon
    const getIndustryIcon = (industry: Industry) => {
        return industry.icon || '🏢';
    };

    // Helper to get image URL
    const getIndustryImageUrl = (imageUrl: string | null | undefined): string => {
        if (!imageUrl) return '/images/industries/default.jpg';
        const url = getImageUrl(imageUrl);
        return url || '/images/industries/default.jpg';
    };

    const icon = getIndustryIcon(industry);

    return (
        <div className="bg-white min-h-screen">
            <PageHeader
                breadcrumbs={[
                    { label: 'Home', link: '/' },
                    { label: 'Industries', link: '/industries' },
                    { label: industry.label }
                ]}
                imageUrl={getIndustryImageUrl(industry.imageUrl)}
                title={industry.label}
                description={industry.desc}
            />

            <section className="max-w-7xl mx-auto py-12 pb-24 px-4 sm:px-6">

                {/* ========================================== */}
                {/* OVERVIEW SECTION                           */}
                {/* ========================================== */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <span className="text-4xl">{icon}</span>
                            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#071322] tracking-tight">
                                {industry.label}
                            </h1>
                        </div>
                        <h2 className="text-xl font-bold text-[#1b7936]">
                            {industry.subtitle || industry.title}
                        </h2>
                        <div
                            className="text-gray-600 text-sm leading-relaxed prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: industry.overview }}
                        />
                        <div className="flex flex-wrap gap-3 pt-2">
                            <Link
                                href="/contact"
                                className="inline-flex items-center gap-2 bg-[#1b7936] hover:bg-[#155f2b] text-white font-bold text-sm px-6 py-3 rounded-xl transition-all"
                            >
                                <MessageSquare className="w-4 h-4" /> Discuss Your Project
                            </Link>
                            <Link
                                href="/request-survey"
                                className="inline-flex items-center gap-2 bg-[#f8f9fa] border border-gray-200 hover:bg-gray-200 text-[#071322] font-bold text-sm px-6 py-3 rounded-xl transition-all"
                            >
                                Request Site Survey
                            </Link>
                        </div>
                    </div>

                    {/* Image */}
                    <div className="relative h-[300px] lg:h-[400px] rounded-3xl overflow-hidden shadow-2xl bg-[#f8f9fa]">
                        {industry.imageUrl && !isDefaultImage(industry.imageUrl) ? (
                            <img
                                src={getIndustryImageUrl(industry.imageUrl) || ''}
                                alt={industry.label}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    const parent = target.parentElement;
                                    if (parent) {
                                        const fallback = document.createElement('div');
                                        fallback.className = 'w-full h-full flex items-center justify-center text-7xl bg-[#f8f9fa]';
                                        fallback.textContent = icon;
                                        parent.appendChild(fallback);
                                    }
                                }}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-7xl bg-[#f8f9fa]">
                                {icon}
                            </div>
                        )}
                    </div>
                </div>

                {/* ========================================== */}
                {/* CHALLENGES SECTION                         */}
                {/* ========================================== */}
                {industry.challenges && industry.challenges.length > 0 && (
                    <div className="mb-16">
                        <h3 className="text-2xl font-extrabold text-[#071322] mb-6">
                            Key Challenges
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {industry.challenges.map((challenge, idx) => (
                                <div key={idx} className="flex items-start gap-3 bg-[#f8f9fa] p-4 rounded-xl border border-gray-200/60">
                                    <div className="w-8 h-8 rounded-full bg-[#e8f5e9] flex items-center justify-center flex-shrink-0">
                                        <span className="text-lg">⚠️</span>
                                    </div>
                                    <span className="text-gray-700 text-sm font-medium leading-snug">
                                        {challenge}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ========================================== */}
                {/* SOLUTIONS SECTION                          */}
                {/* ========================================== */}
                {industry.solutions && industry.solutions.length > 0 && (
                    <div className="mb-16">
                        <h3 className="text-2xl font-extrabold text-[#071322] mb-6">
                            Our Solutions
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {industry.solutions.map((solution, idx) => (
                                <div key={idx} className="flex items-start gap-3 bg-white p-4 rounded-xl border border-gray-200/60 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="w-8 h-8 rounded-full bg-[#e8f5e9] flex items-center justify-center flex-shrink-0">
                                        <CheckCircle2 className="w-4 h-4 text-[#1b7936]" />
                                    </div>
                                    <span className="text-gray-700 text-sm font-medium leading-snug">
                                        {solution}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ========================================== */}
                {/* BENEFITS SECTION                           */}
                {/* ========================================== */}
                {industry.benefits && industry.benefits.length > 0 && (
                    <div className="mb-16 bg-[#f8f9fa] rounded-3xl p-8 border border-gray-200/80">
                        <h3 className="text-2xl font-extrabold text-[#071322] mb-6">
                            Key Benefits
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {industry.benefits.map((benefit, idx) => (
                                <div key={idx} className="flex items-start gap-3">
                                    <div className="w-6 h-6 rounded-full bg-[#1b7936] flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                                    </div>
                                    <span className="text-gray-700 text-sm font-medium leading-snug">
                                        {benefit}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ========================================== */}
                {/* CASE STUDY SECTION                         */}
                {/* ========================================== */}
                {industry.caseStudy && industry.caseStudy.title && (
                    <div className="mb-16">
                        <h3 className="text-2xl font-extrabold text-[#071322] mb-6">
                            Case Study
                        </h3>
                        <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all">
                            <div className="grid grid-cols-1 lg:grid-cols-2">
                                <div className="relative h-64 lg:h-auto bg-[#f8f9fa]">
                                    {industry.caseStudy.imageUrl && !isDefaultImage(industry.caseStudy.imageUrl) ? (
                                        <img
                                            src={getIndustryImageUrl(industry.caseStudy.imageUrl) || ''}
                                            alt={industry.caseStudy.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-6xl bg-[#f8f9fa]">
                                            📄
                                        </div>
                                    )}
                                </div>
                                <div className="p-8 space-y-4 flex flex-col justify-center">
                                    <h4 className="text-xl font-extrabold text-[#071322]">
                                        {industry.caseStudy.title}
                                    </h4>
                                    <p className="text-gray-600 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: industry.caseStudy.description }} /> 
                                    {industry.caseStudy.link && (
                                        <Link
                                            href={industry.caseStudy.link}
                                            className="inline-flex items-center gap-2 text-[#1b7936] font-semibold text-sm hover:gap-3 transition-all"
                                        >
                                            Read Full Case Study <ArrowRight className="w-4 h-4" />
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ========================================== */}
                {/* FEATURES SECTION                           */}
                {/* ========================================== */}
                {industry.features && industry.features.length > 0 && (
                    <div className="mb-16">
                        <h3 className="text-2xl font-extrabold text-[#071322] mb-6">
                            Features & Capabilities
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {industry.features.map((feature, idx) => (
                                <div key={idx} className="flex items-start gap-3 bg-white p-4 rounded-xl border border-gray-200/60 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="w-8 h-8 rounded-full bg-[#e8f5e9] flex items-center justify-center flex-shrink-0">
                                        <Zap className="w-4 h-4 text-[#1b7936]" />
                                    </div>
                                    <span className="text-gray-700 text-sm font-medium leading-snug">
                                        {feature}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ========================================== */}
                {/* RELATED INDUSTRIES                         */}
                {/* ========================================== */}
                {relatedIndustries.length > 0 && (
                    <div className="mt-16">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-extrabold text-[#071322]">
                                Related Industries
                            </h3>
                            <Link
                                href="/industries"
                                className="text-sm text-[#1b7936] font-semibold hover:underline"
                            >
                                View All →
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {relatedIndustries.map((related) => {
                                const relatedIcon = related.icon || '🏢';
                                return (
                                    <Link
                                        key={related._id || related.id}
                                        href={`/industries/${related.id || related.slug}`}
                                        className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1"
                                    >
                                        <div className="relative h-40 bg-[#f8f9fa]">
                                            {related.imageUrl && !isDefaultImage(related.imageUrl) ? (
                                                <Image
                                                    src={getIndustryImageUrl(related.imageUrl) || ''}
                                                    alt={related.label}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                    onError={() => {
                                                        // Image error handled by Image component fallback
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-4xl bg-[#f8f9fa]">
                                                    {relatedIcon}
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-[#0c1f38]/60 to-transparent"></div>
                                            <div className="absolute bottom-3 left-3 text-white text-2xl">
                                                {relatedIcon}
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <h4 className="text-sm font-extrabold text-[#071322] group-hover:text-[#1b7936] transition-colors">
                                                {related.label}
                                            </h4>
                                            <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                                                {related.desc || related.subtitle}
                                            </p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ========================================== */}
                {/* CTA SECTION                                */}
                {/* ========================================== */}
                <div className="mt-16 bg-gradient-to-br from-[#0c1f38] to-[#1f7a3d] rounded-3xl p-12 text-center text-white">
                    <h2 className="text-3xl font-extrabold mb-4">
                        Ready to Get Started?
                    </h2>
                    <p className="text-white/80 text-sm max-w-2xl mx-auto mb-8">
                        Contact our team to discuss your specific needs and get a customized solution for your industry.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link
                            href="/contact"
                            className="bg-white text-[#0c1f38] hover:bg-gray-100 font-bold px-8 py-3.5 rounded-xl transition-colors"
                        >
                            Contact Our Team
                        </Link>
                        <Link
                            href="/request-survey"
                            className="bg-white/20 hover:bg-white/30 text-white font-bold px-8 py-3.5 rounded-xl border border-white/30 transition-colors"
                        >
                            Request Site Survey
                        </Link>
                    </div>
                </div>

            </section>
        </div>
    );
}