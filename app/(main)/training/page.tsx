// app/(main)/training/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/pagesComps/PageHeader';
import { Loader2 } from 'lucide-react';

// Training Interface
interface Training {
    _id: string;
    id: string;
    title: string;
    categoryId: string;
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

interface TrainingCategory {
    _id: string;
    id: string;
    name: string;
    slug: string;
    description: string;
    icon: string;
    color: string;
    order: number;
    isActive: boolean;
    trainingCount?: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function TrainingPage() {
    const [trainings, setTrainings] = useState<Training[]>([]);
    const [categories, setCategories] = useState<TrainingCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch categories and trainings
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Fetch categories
                const catRes = await fetch(`${API_BASE_URL}/training-categories?limit=100&isActive=true`);
                const catData = await catRes.json();
                if (catData.success) {
                    setCategories(catData.data || []);
                }

                // Fetch trainings
                const trainRes = await fetch(`${API_BASE_URL}/training?limit=100&isActive=true`);
                const trainData = await trainRes.json();
                if (trainData.success) {
                    setTrainings(trainData.data || []);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                setTrainings([]);
                setCategories([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // Build categories list with counts
    const categoryList = useMemo(() => {
        const list: Array<{ id: string; label: string; icon: string; count: number; color?: string }> = [
            { id: 'all', label: 'All Programs', icon: '📋', count: trainings.length }
        ];

        categories.forEach(cat => {
            const count = trainings.filter(t => t.categoryId === cat.id).length;
            list.push({
                id: cat.id,
                label: cat.name,
                icon: cat.icon || '📋',
                count: count,
                color: cat.color
            });
        });

        return list;
    }, [categories, trainings]);

    // Filter programs based on active category
    const filteredPrograms = useMemo(() => {
        if (activeCategory === 'all') return trainings;
        return trainings.filter(t => t.categoryId === activeCategory);
    }, [trainings, activeCategory]);

    // Search filter
    const searchedPrograms = useMemo(() => {
        if (!searchQuery.trim()) return filteredPrograms;
        const query = searchQuery.toLowerCase().trim();
        return filteredPrograms.filter(p =>
            p.title.toLowerCase().includes(query) ||
            p.description.toLowerCase().includes(query) ||
            p.badge.toLowerCase().includes(query) ||
            p.details?.toLowerCase().includes(query)
        );
    }, [filteredPrograms, searchQuery]);

    return (
        <div className="bg-white min-h-screen">
            <PageHeader
                breadcrumbs={[
                    { label: 'Home', link: '/' },
                    { label: 'Training' }
                ]}
                imageUrl="/images/help/training-hero.jpg"
                title="Training & Certification"
                description="Programs for installers, technicians, and operators to install, maintain, and troubleshoot EV charging systems."
            />

            <section className="max-w-7xl mx-auto py-12 pb-24 px-4 sm:px-6">

                {/* ========================================== */}
                {/* CATEGORY TABS - Dynamic from API            */}
                {/* ========================================== */}
                <div className="mb-8 overflow-x-auto">
                    <div className="flex flex-wrap gap-2 pb-2 justify-center">
                        {categoryList.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`px-4 py-2.5 text-sm font-bold cursor-pointer rounded-full transition-all flex items-center gap-2 whitespace-nowrap ${
                                    activeCategory === cat.id
                                        ? 'bg-[#1b7936] text-white shadow-md'
                                        : 'text-gray-600 bg-[#f1f1f1] hover:bg-gray-200'
                                }`}
                            >
                                <span>{cat.icon}</span>
                                <span>{cat.label}</span>
                                {cat.count > 0 && (
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                                        activeCategory === cat.id
                                            ? 'bg-white/20 text-white'
                                            : 'bg-gray-300 text-gray-700'
                                    }`}>
                                        {cat.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Search Bar */}
                {/* <div className="mb-8 max-w-md">
                    <input
                        type="text"
                        placeholder="Search training programs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-2.5 text-sm bg-[#f8f9fa] border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#1b7936] transition-all"
                    />
                </div> */}

                {/* ========================================== */}
                {/* LOADING STATE                              */}
                {/* ========================================== */}
                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-12 h-12 text-[#1b7936] animate-spin" />
                        <p className="text-gray-500 text-sm mt-4">Loading training programs...</p>
                    </div>
                )}

                {/* ========================================== */}
                {/* TRAINING PROGRAMS GRID                    */}
                {/* ========================================== */}
                {!isLoading && (
                    <>
                        {searchedPrograms.length === 0 ? (
                            <div className="text-center py-20">
                                <div className="text-6xl mb-4">📋</div>
                                <h3 className="text-2xl font-extrabold text-[#071322]">No training programs found</h3>
                                <p className="text-gray-500 text-sm mt-2">
                                    {searchQuery ? 'Try adjusting your search terms.' : 'No programs in this category yet.'}
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {searchedPrograms.map((program) => (
                                    <div
                                        key={program._id || program.id}
                                        className="bg-white border border-gray-200/80 rounded-xl p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-xs hover:shadow-md transition-all"
                                    >
                                        <div className="space-y-3">
                                            {/* Badge / Category */}
                                            {program.badge && (
                                                <span
                                                    className="text-xs font-bold uppercase tracking-wider block"
                                                    style={{ color: program.color || '#1b7936' }}
                                                >
                                                    {program.badge}
                                                </span>
                                            )}

                                            {/* Icon and Title */}
                                            <div className="flex items-center gap-2">
                                                {program.icon && (
                                                    <span className="text-2xl">{program.icon}</span>
                                                )}
                                                <h3 className="text-xl font-bold text-[#071322] leading-snug">
                                                    {program.title}
                                                </h3>
                                            </div>

                                            {/* Category Tag */}
                                            {program.categoryId && (
                                                <span className="inline-block text-xs px-2.5 py-0.5 rounded-full bg-[#f0f7f0] text-[#1b7936] font-medium">
                                                    {categories.find(c => c.id === program.categoryId)?.name || program.categoryId}
                                                </span>
                                            )}

                                            {/* Description / Details */}
                                            <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                                                {program.details || program.description}
                                            </p>

                                            {/* Duration & Format */}
                                            {(program.duration || program.format) && (
                                                <div className="flex flex-wrap gap-3 pt-1">
                                                    {program.duration && (
                                                        <span className="text-xs bg-[#f8f9fa] px-3 py-1 rounded-full text-gray-600 border border-gray-200">
                                                            ⏱ {program.duration}
                                                        </span>
                                                    )}
                                                    {program.format && (
                                                        <span className="text-xs bg-[#f8f9fa] px-3 py-1 rounded-full text-gray-600 border border-gray-200">
                                                            📋 {program.format}
                                                        </span>
                                                    )}
                                                    {program.price && (
                                                        <span className="text-xs bg-[#e8f5e9] px-3 py-1 rounded-full text-[#1b7936] border border-[#1b7936]/20 font-semibold">
                                                            {program.price}
                                                        </span>
                                                    )}
                                                </div>
                                            )}

                                            {/* Features Preview */}
                                            {program.features && program.features.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5 pt-1">
                                                    {program.features.slice(0, 3).map((feature, idx) => (
                                                        <span key={idx} className="text-xs text-gray-500">
                                                            ✓ {feature}
                                                        </span>
                                                    ))}
                                                    {program.features.length > 3 && (
                                                        <span className="text-xs text-gray-400">
                                                            +{program.features.length - 3} more
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Action Link */}
                                        <div>
                                            <Link
                                                href={`/training/${program.id}`}
                                                className="inline-flex items-center gap-1.5 text-sm font-semibold hover:underline transition-all"
                                                style={{ color: program.color || '#1b7936' }}
                                            >
                                                <span>{program.actionText || "Learn More"}</span>
                                                <span className="text-base">→</span>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* ========================================== */}
                {/* CTA SECTION                               */}
                {/* ========================================== */}
                <div className="mt-20 bg-gradient-to-br from-[#0c1f38] to-[#1f7a3d] rounded-3xl p-12 text-center text-white">
                    <h2 className="text-3xl font-extrabold mb-4">
                        Need Custom Training?
                    </h2>
                    <p className="text-white/80 text-sm max-w-2xl mx-auto mb-8">
                        We offer customized training programs tailored to your organization's specific needs. Contact our training team to discuss your requirements.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link
                            href="/contact"
                            className="bg-white text-[#0c1f38] hover:bg-gray-100 font-bold px-8 py-3.5 rounded-xl transition-colors"
                        >
                            Contact Training Team
                        </Link>
                        <Link
                            href="/request-survey"
                            className="bg-white/20 hover:bg-white/30 text-white font-bold px-8 py-3.5 rounded-xl border border-white/30 transition-colors"
                        >
                            Request Custom Program
                        </Link>
                    </div>
                </div>

            </section>
        </div>
    );
}