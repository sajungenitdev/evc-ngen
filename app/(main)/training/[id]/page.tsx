// app/(main)/training/[id]/page.tsx
'use client';

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { use, useState, useEffect } from 'react';
import Image from 'next/image';
import PageHeader from '@/components/pagesComps/PageHeader';
import {
    Clock,
    CheckCircle2,
    GraduationCap,
    Award,
    Mail,
    Phone,
    MessageSquare,
    Loader2
} from 'lucide-react';
import { getImageUrl, isDefaultImage } from '@/utils/imageHelper';

interface PageProps {
    params: Promise<{ id: string }>;
}

// Training Interface
interface Training {
    _id: string;
    id: string;
    title: string;
    badge: string;
    description: string;
    details: string;
    duration: string;
    format: string;
    imageUrl: string;
    link: string;
    color: string;
    icon: string;
    features: string[];
    price: string;
    schedule: string;
    prerequisites: string[];
    actionText: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function TrainingDetailPage({ params }: PageProps) {
    const { id } = use(params);
    const [training, setTraining] = useState<Training | null>(null);
    const [relatedTrainings, setRelatedTrainings] = useState<Training[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch training data
    useEffect(() => {
        const fetchTraining = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Fetch current training
                const res = await fetch(`${API_BASE_URL}/training/${id}`);
                const data = await res.json();

                if (data.success) {
                    setTraining(data.data);

                    // Fetch related trainings (exclude current)
                    const relatedRes = await fetch(`${API_BASE_URL}/training?limit=3&isActive=true`);
                    const relatedData = await relatedRes.json();

                    if (relatedData.success) {
                        const filtered = relatedData.data.filter(
                            (t: Training) => t.id !== data.data.id
                        );
                        setRelatedTrainings(filtered.slice(0, 3));
                    }
                } else {
                    setError(data.message || 'Training program not found');
                    setTraining(null);
                }
            } catch (error) {
                console.error('Error fetching training:', error);
                setError('Failed to load training data');
                setTraining(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTraining();
    }, [id]);

    // Show loading state
    if (isLoading) {
        return (
            <div className="bg-white min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-[#1b7936] animate-spin mx-auto" />
                    <p className="text-gray-500 text-sm mt-4">Loading training details...</p>
                </div>
            </div>
        );
    }

    // Show not found
    if (!training || error) {
        return (
            <div className="bg-white min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">📋</div>
                    <h1 className="text-2xl font-bold text-[#071322] mb-2">Training Not Found</h1>
                    <p className="text-gray-500 text-sm">{error || 'The training program you are looking for does not exist.'}</p>
                    <Link href="/training" className="mt-6 inline-block bg-[#1b7936] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#155f2b] transition-colors">
                        View All Training Programs
                    </Link>
                </div>
            </div>
        );
    }

    // Helper to get image URL
    const getTrainingImageUrl = (imageUrl: string | null | undefined): string => {
        if (!imageUrl) return '/images/training/default.jpg';
        const url = getImageUrl(imageUrl);
        return url || '/images/training/default.jpg';
    };

    return (
        <div className="bg-white min-h-screen">
            <PageHeader
                breadcrumbs={[
                    { label: 'Home', link: '/' },
                    { label: 'Training', link: '/training' },
                    { label: training.title }
                ]}
                imageUrl={getTrainingImageUrl(training.imageUrl)}  // ✅ Now returns string
                title={training.title}
                description={training.description}
            />

            <section className="max-w-7xl mx-auto py-12 pb-24 px-4 sm:px-6">

                {/* ========================================== */}
                {/* PROGRAM OVERVIEW                           */}
                {/* ========================================== */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <span className="text-5xl">{training.icon || '📋'}</span>
                            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#071322] tracking-tight">
                                {training.title}
                            </h1>
                        </div>
                        {training.badge && (
                            <div
                                className="inline-block text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full"
                                style={{ backgroundColor: training.color || '#1b7936' }}
                            >
                                {training.badge}
                            </div>
                        )}
                        <p className="text-gray-600 text-sm leading-relaxed">
                            {training.details || training.description}
                        </p>

                        <div className="flex flex-wrap gap-4 text-sm">
                            {training.duration && (
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Clock className="w-5 h-5 text-[#1b7936]" />
                                    <span className="font-semibold">{training.duration}</span>
                                </div>
                            )}
                            {training.format && (
                                <div className="flex items-center gap-2 text-gray-600">
                                    <GraduationCap className="w-5 h-5 text-[#1b7936]" />
                                    <span className="font-semibold">{training.format}</span>
                                </div>
                            )}
                            {training.price && (
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Award className="w-5 h-5 text-[#1b7936]" />
                                    <span className="font-semibold">{training.price}</span>
                                </div>
                            )}
                            {training.schedule && (
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Clock className="w-5 h-5 text-[#1b7936]" />
                                    <span className="font-semibold">{training.schedule}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <Link
                                href={`/contact?training=${training.id}`}
                                className="inline-flex items-center gap-2 bg-[#1b7936] hover:bg-[#155f2b] text-white font-bold text-sm px-6 py-3 rounded-xl transition-all"
                            >
                                <MessageSquare className="w-4 h-4" /> {training.actionText || 'Apply Now'}
                            </Link>
                            <Link
                                href="/contact"
                                className="inline-flex items-center gap-2 bg-[#f8f9fa] border border-gray-200 hover:bg-gray-200 text-[#071322] font-bold text-sm px-6 py-3 rounded-xl transition-all"
                            >
                                Contact Training Team
                            </Link>
                        </div>
                    </div>

                    {/* Image */}
                    <div className="relative h-[300px] lg:h-[400px] rounded-3xl overflow-hidden shadow-2xl bg-[#f8f9fa]">
                        {training.imageUrl && !isDefaultImage(training.imageUrl) ? (
                            <img
                                src={getTrainingImageUrl(training.imageUrl)}  // ✅ Now returns string
                                alt={training.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    const parent = target.parentElement;
                                    if (parent) {
                                        const fallback = document.createElement('div');
                                        fallback.className = 'w-full h-full flex items-center justify-center text-7xl bg-[#f8f9fa]';
                                        fallback.textContent = training.icon || '📋';
                                        parent.appendChild(fallback);
                                    }
                                }}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-7xl bg-[#f8f9fa]">
                                {training.icon || '📋'}
                            </div>
                        )}
                    </div>
                </div>

                {/* ========================================== */}
                {/* FEATURES SECTION                           */}
                {/* ========================================== */}
                {training.features && training.features.length > 0 && (
                    <div className="mb-16">
                        <h3 className="text-2xl font-extrabold text-[#071322] mb-6">
                            Program Features
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {training.features.map((feature, idx) => (
                                <div key={idx} className="flex items-start gap-3 bg-white p-4 rounded-xl border border-gray-200/60 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="w-8 h-8 rounded-full bg-[#e8f5e9] flex items-center justify-center shrink-0">
                                        <CheckCircle2 className="w-4 h-4 text-[#1b7936]" />
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
                {/* PREREQUISITES                              */}
                {/* ========================================== */}
                {training.prerequisites && training.prerequisites.length > 0 && (
                    <div className="mb-16 bg-[#f8f9fa] rounded-3xl p-8 border border-gray-200/80">
                        <h3 className="text-2xl font-extrabold text-[#071322] mb-4">
                            Prerequisites
                        </h3>
                        <div className="space-y-2">
                            {training.prerequisites.map((prereq, idx) => (
                                <div key={idx} className="flex items-start gap-3">
                                    <div className="w-6 h-6 rounded-full bg-[#1b7936] flex items-center justify-center shrink-0 mt-0.5">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                                    </div>
                                    <span className="text-gray-700 text-sm font-medium">
                                        {prereq}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ========================================== */}
                {/* SCHEDULE SECTION (if available)            */}
                {/* ========================================== */}
                {training.schedule && (
                    <div className="mb-16 bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
                        <h3 className="text-2xl font-extrabold text-[#071322] mb-2">
                            Upcoming Schedule
                        </h3>
                        <p className="text-gray-600 text-sm">
                            {training.schedule}
                        </p>
                    </div>
                )}

                {/* ========================================== */}
                {/* RELATED TRAINING PROGRAMS                  */}
                {/* ========================================== */}
                {relatedTrainings.length > 0 && (
                    <div className="mb-16">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-extrabold text-[#071322]">
                                Related Training Programs
                            </h3>
                            <Link
                                href="/training"
                                className="text-sm text-[#1b7936] font-semibold hover:underline"
                            >
                                View All →
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {relatedTrainings.map((item) => {
                                const imageUrl = getTrainingImageUrl(item.imageUrl);
                                const hasValidImage = imageUrl && !isDefaultImage(item.imageUrl);

                                return (
                                    <Link
                                        key={item._id || item.id}
                                        href={`/training/${item.id}`}
                                        className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1"
                                    >
                                        <div className="relative h-48 bg-[#f8f9fa]">
                                            {hasValidImage ? (
                                                <img
                                                    src={imageUrl}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.style.display = 'none';
                                                        const parent = target.parentElement;
                                                        if (parent) {
                                                            const fallback = document.createElement('div');
                                                            fallback.className = 'w-full h-full flex items-center justify-center text-4xl bg-[#f8f9fa]';
                                                            fallback.textContent = item.icon || '📋';
                                                            parent.appendChild(fallback);
                                                        }
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-4xl bg-[#f8f9fa]">
                                                    {item.icon || '📋'}
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-[#0c1f38]/60 to-transparent"></div>
                                            <div className="absolute bottom-3 left-3 text-white text-2xl">
                                                {item.icon || '📋'}
                                            </div>
                                        </div>
                                        <div className="p-5">
                                            {item.badge && (
                                                <span
                                                    className="text-xs font-bold uppercase tracking-wider"
                                                    style={{ color: item.color || '#1b7936' }}
                                                >
                                                    {item.badge}
                                                </span>
                                            )}
                                            <h4 className="text-sm font-extrabold text-[#071322] group-hover:text-[#1b7936] transition-colors mt-1">
                                                {item.title}
                                            </h4>
                                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                                {item.description || item.details}
                                            </p>
                                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                                                {item.duration && (
                                                    <span>⏱ {item.duration}</span>
                                                )}
                                                {item.format && (
                                                    <span>📋 {item.format}</span>
                                                )}
                                                {item.price && (
                                                    <span className="text-[#1b7936] font-semibold">
                                                        {item.price}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ========================================== */}
                {/* CONTACT SECTION                           */}
                {/* ========================================== */}
                <div className="bg-gradient-to-br from-[#0c1f38] to-[#1f7a3d] rounded-3xl p-12 text-center text-white">
                    <h2 className="text-3xl font-extrabold mb-4">
                        Have Questions About This Program?
                    </h2>
                    <p className="text-white/80 text-sm max-w-2xl mx-auto mb-8">
                        Our training team is here to help you choose the right program for your needs.
                    </p>
                    <div className="flex flex-wrap justify-center gap-6">
                        <a
                            href="tel:+18005550199"
                            className="flex items-center gap-2 text-white hover:text-[#1b7936] transition-colors"
                        >
                            <Phone className="w-5 h-5" />
                            +1 (800) 555-0199
                        </a>
                        <a
                            href="mailto:training@evngen.com"
                            className="flex items-center gap-2 text-white hover:text-[#1b7936] transition-colors"
                        >
                            <Mail className="w-5 h-5" />
                            training@evngen.com
                        </a>
                        <Link
                            href="/contact"
                            className="bg-white text-[#0c1f38] hover:bg-gray-100 font-bold px-8 py-3.5 rounded-xl transition-colors"
                        >
                            Contact Training Team
                        </Link>
                    </div>
                </div>

            </section>
        </div>
    );
}