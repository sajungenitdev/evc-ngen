'use client';

import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useState, use } from 'react';
import PageHeader from '@/components/pagesComps/PageHeader';
import { solutionsList } from '@/lib/solutionsDb';
import { CheckCircle2, MessageSquare, } from 'lucide-react';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function SolutionDetailPage({ params }: PageProps) {
    const { id } = use(params);
    const solution = solutionsList.find((s) => s.id === id);

    const [activeTab, setActiveTab] = useState(0);

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
                imageUrl={solution.imageUrl}
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
                        <p className="text-gray-600 font-light pt-4 w-2/4 text-sm sm:text-base leading-relaxed">
                            {solution.overview}
                        </p>
                    </div>

                    {/* SECTION 1: Interactive Tabs (Matching exact design reference) */}
                    {solution.section1 && (
                        <div className="space-y-12">
                            {/* Navigation Tabs Header with bottom line */}
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

                            {/* Active Tab Content Area */}
                            <div className="max-w-7xl mx-auto">
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                                    {/* Right Side: Content */}
                                    <div className="lg:col-span-6 space-y-6">
                                        <span className="text-[#1b7936] text-xs font-extrabold uppercase tracking-widest">
                                            {solution.section1.tabs[activeTab].badge}
                                        </span>
                                        <h3 className="text-3xl sm:text-4xl font-extrabold text-[#071322] tracking-tight leading-tight">
                                            {solution.section1.tabs[activeTab].title}
                                        </h3>
                                        <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                                            {solution.section1.tabs[activeTab].description}
                                        </p>
                                        <div className="flex flex-wrap gap-8 pt-2">
                                            {solution.section1.tabs[activeTab].links.map((lnk, linkIdx) => (
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
                                    {/* Left Side: Dynamic Image for Active Tab */}
                                    <div className="lg:col-span-6 relative h-90 sm:h-100 rounded-xl overflow-hidden  bg-[#f8f9fa]">
                                        <Image
                                            src={solution.section1.tabs[activeTab].imageUrl}
                                            alt={solution.section1.tabs[activeTab].title}
                                            fill
                                            className="object-cover transition-opacity duration-500"
                                        />
                                    </div>

                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>
            {/* SECTION 2: Charging Solutions for Electric Vehicles */}
            {solution.section2 && (
                <div className="bg-[#f3f6f9] py-16 px-4 sm:px-8">
                    <div className="max-w-7xl mx-auto">
                        {/* Optional Title (Remove if not needed) */}
                        {solution.section2.title && (
                            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 text-center mb-8 capitalize">
                                {solution.section2.title}
                            </h3>
                        )}

                        {/* Grid Layout matching the image */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            {solution.section2.useCases.map((useCase, idx) => (
                                <Link
                                    key={idx}
                                    href={useCase.link}
                                    className="bg-white border border-gray-200/80 rounded-xl p-4 sm:p-5 flex items-center gap-3 transition-all hover:shadow-md hover:-translate-y-0.5 group"
                                >
                                    {/* Icon container */}
                                    <span className="text-xl shrink-0 flex items-center justify-center">
                                        {useCase.icon}
                                    </span>

                                    {/* Label */}
                                    <span className="text-sm sm:text-base font-bold text-slate-800 capitalize leading-tight">
                                        {useCase.label}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            <section className="py-20 px-6 md:px-12 lg:px-20">
                <div className="max-w-7xl mx-auto space-y-24">
                    {/* SECTION 3: Solar & Smart Billing Cards */}
                    {solution.section3 && (
                        <div className="space-y-6">
                            {/* Section Header */}
                            <div className="space-y-2">
                                <span className="text-[#1b7936] text-xs font-bold uppercase tracking-wider">
                                    {solution.section3.badge}
                                </span>
                                <h3 className="text-3xl font-extrabold text-[#071322] tracking-tight">
                                    {solution.section3.title}
                                </h3>
                            </div>

                            {/* Cards Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {solution.section3.cards.map((card, idx) => (
                                    <div
                                        key={idx}
                                        className="bg-white border border-gray-200/80 rounded-xl p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-xs hover:shadow-md transition-shadow"
                                    >
                                        <div className="space-y-3">
                                            {/* Title with Inline Icon */}
                                            <div className="flex items-center gap-2.5">
                                                <span className="text-xl shrink-0">
                                                    {card.icon || (card.theme === 'dark' ? '💥' : '📄')}
                                                </span>
                                                <h4 className="text-lg font-bold text-[#071322]">
                                                    {card.title}
                                                </h4>
                                            </div>

                                            {/* Description */}
                                            <p className="text-gray-600 text-sm leading-relaxed">
                                                {card.description}
                                            </p>
                                        </div>

                                        {/* Action Link */}
                                        <div>
                                            <Link
                                                href={card.actionLink}
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

                    {/* Key Capabilities / Specifications */}
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

                    {/* SECTION 4: Platform Summary & Consultation CTA */}
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
                                        href={solution.section4.buttonLink}
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