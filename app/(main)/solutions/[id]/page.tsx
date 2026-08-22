'use client';

import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useState, use } from 'react';
import PageHeader from '@/components/pagesComps/PageHeader';
import { solutionsList } from '@/lib/solutionsDb';
import { CheckCircle2, ArrowLeft, MessageSquare, Sun, FileText } from 'lucide-react';

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

            <section className="py-20 px-6 md:px-12 lg:px-20 bg-[#f5f6f8]">
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

                                    {/* Left Side: Dynamic Image for Active Tab */}
                                    <div className="lg:col-span-6 relative h-[360px] sm:h-[400px] rounded-xl overflow-hidden  bg-[#f8f9fa]">
                                        <Image
                                            src={solution.section1.tabs[activeTab].imageUrl}
                                            alt={solution.section1.tabs[activeTab].title}
                                            fill
                                            className="object-cover transition-opacity duration-500"
                                        />
                                    </div>

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

                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>
            {/* SECTION 2: Charging Solutions for Electric Vehicles */}
            {solution.section2 && (
                <div className="bg-[#0c1f38] overflow-hidden  mt-0">
                    <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">

                        {/* Left Side: Full-Height Image Container */}
                        <div className="lg:col-span-5 relative min-h-[360px] lg:min-h-full bg-[#0c1f38]">
                            <Image
                                src={solution.section2.imageUrl}
                                alt={solution.section2.title}
                                fill
                                className="object-cover opacity-90"
                            />
                        </div>

                        {/* Right Side: Section Title & Grid */}
                        <div className="lg:col-span-7 py-24 px-14 flex flex-col justify-center">
                            <div>
                                <h3 className="text-2xl text-center capitalize sm:text-3xl font-extrabold tracking-tight text-white">
                                    {solution.section2.title}
                                </h3>
                            </div>

                            <div className="grid grid-cols-2 mt-10 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                                {solution.section2.useCases.map((useCase, idx) => (
                                    <Link
                                        key={idx}
                                        href={useCase.link}
                                        className="bg-[#0c1f38] capitalize border border-white/10 hover:border-[#3ec06a]/50 rounded-sm p-5 flex flex-col items-center text-center gap-3 group transition-all hover:-translate-y-1 relative overflow-hidden"
                                    >
                                        {/* Icon / Image container */}
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 text-lg">
                                            <span>{useCase.icon}</span>
                                        </div>

                                        <span className="text-xs font-bold text-gray-200 group-hover:text-[#3ec06a] transition-colors">
                                            {useCase.label}
                                        </span>

                                        {/* Green Bottom Indicator Line */}
                                        <div className="w-full h-1 bg-[#3ec06a] rounded-full mt-auto"></div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            )}
            <section className="py-20 px-6 md:px-12 lg:px-20">
                <div className="max-w-7xl mx-auto space-y-24">
                    {/* SECTION 3: Solar & Smart Billing Cards */}
                    {solution.section3 && (
                        <div className="space-y-10">
                            <div className="space-y-2">
                                <span className="text-[#1b7936] text-xs font-extrabold uppercase tracking-widest">
                                    {solution.section3.badge}
                                </span>
                                <h3 className="text-3xl font-extrabold text-[#071322] tracking-tight">
                                    {solution.section3.title}
                                </h3>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {solution.section3.cards.map((card, idx) => (
                                    <div
                                        key={idx}
                                        className={`rounded-3xl p-8 sm:p-12 flex flex-col justify-between space-y-8 ${card.theme === 'dark'
                                            ? 'bg-[#123a2b] text-white'
                                            : 'bg-[#4c8f74] text-white'
                                            }`}
                                    >
                                        <div className="space-y-4">
                                            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                                                {card.theme === 'dark' ? <Sun className="w-6 h-6 text-[#3ec06a]" /> : <FileText className="w-6 h-6 text-white" />}
                                            </div>
                                            <h4 className="text-2xl font-extrabold tracking-tight">{card.title}</h4>
                                            <p className="text-gray-200 text-sm leading-relaxed">{card.description}</p>
                                        </div>
                                        <div>
                                            <Link
                                                href={card.actionLink}
                                                className="inline-flex items-center gap-2 text-sm font-extrabold text-[#3ec06a] hover:text-white transition-colors"
                                            >
                                                {card.actionText}
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
                                    <CheckCircle2 className="w-6 h-6 text-[#3ec06a] flex-shrink-0 mt-0.5" />
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