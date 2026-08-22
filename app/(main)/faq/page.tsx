'use client';

import { useState } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/pagesComps/PageHeader';
import { faqPageData } from '@/lib/db';
import { ChevronDown, Search, MessageSquare } from 'lucide-react';

export default function FAQPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [openIndex, setOpenIndex] = useState<number | null>(0);
    const [activeCategory, setActiveCategory] = useState('All');

    const { header, categories, faqs, ctaBanner } = faqPageData;

    const filteredFaqs = faqs.filter(faq => {
        const matchesCategory = activeCategory === 'All' || faq.category === activeCategory;
        const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <main className="min-h-screen bg-white">
            {/* Branded Page Header */}
            <PageHeader
                breadcrumbs={header.breadcrumbs}
                imageUrl={header.imageUrl}
                title={header.title}
                description={header.description}
            />

            {/* Main Content Section */}
            <section className="py-20 px-6 md:px-12 lg:px-20">
                <div className="max-w-5xl mx-auto space-y-12">
                    
                    {/* Search Bar & Category Filters */}
                    <div className="space-y-6">
                        {/* Search Input */}
                        <div className="relative max-w-xl mx-auto">
                            <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                <Search className="w-5 h-5" />
                            </span>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search questions about chargers, installation, software..."
                                className="w-full bg-[#f8f9fa] text-[#071322] placeholder-gray-400 text-sm pl-12 pr-6 py-4 rounded-full shadow-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1b7936]"
                            />
                        </div>

                        {/* Category Filter Pills */}
                        <div className="flex flex-wrap justify-center gap-2 pt-2">
                            {categories.map((cat, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-xs ${
                                        activeCategory === cat
                                            ? 'bg-[#1b7936] text-white'
                                            : 'bg-[#f8f9fa] text-gray-600 hover:bg-gray-200 border border-gray-200'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* FAQ Accordion List */}
                    <div className="space-y-4">
                        {filteredFaqs.length > 0 ? (
                            filteredFaqs.map((faq, index) => {
                                const isOpen = openIndex === index;
                                return (
                                    <div
                                        key={index}
                                        className="bg-[#f8f9fa] border border-gray-200/80 rounded-2xl overflow-hidden transition-all shadow-xs"
                                    >
                                        <button
                                            onClick={() => setOpenIndex(isOpen ? null : index)}
                                            className="w-full text-left p-6 flex items-center justify-between gap-4 focus:outline-none"
                                        >
                                            <span className="text-base sm:text-lg font-bold text-[#071322]">
                                                {faq.question}
                                            </span>
                                            <span className={`w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0 transition-transform duration-200 shadow-xs ${isOpen ? 'rotate-180 bg-[#1b7936] text-white' : 'text-gray-600'}`}>
                                                <ChevronDown className="w-4 h-4" />
                                            </span>
                                        </button>

                                        {isOpen && (
                                            <div className="px-6 pb-6 pt-2 text-gray-600 text-sm sm:text-base leading-relaxed border-t border-gray-200/50">
                                                {faq.answer}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-16 bg-[#f8f9fa] rounded-2xl border border-gray-200">
                                <p className="text-gray-500 text-sm">No matching questions found. Try a different search term.</p>
                            </div>
                        )}
                    </div>

                    {/* Still Have Questions CTA Banner */}
                    <div className="bg-[#0c1f38] text-white rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-xl relative overflow-hidden mt-16">
                        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-[#3ec06a]/10 rounded-full blur-2xl pointer-events-none"></div>
                        <div className="relative z-10 max-w-xl mx-auto space-y-3">
                            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                                {ctaBanner.title}
                            </h3>
                            <p className="text-gray-300 text-sm leading-relaxed">
                                {ctaBanner.description}
                            </p>
                            <div className="pt-4 flex flex-wrap justify-center gap-4">
                                <Link
                                    href={ctaBanner.primaryButton.link}
                                    className="inline-flex items-center gap-2 bg-[#3ec06a] hover:bg-[#34a55b] text-[#071322] font-bold text-sm px-8 py-3.5 rounded-xl shadow-lg transition-all"
                                >
                                    <MessageSquare className="w-4 h-4" />
                                    {ctaBanner.primaryButton.text}
                                </Link>
                                <Link
                                    href={ctaBanner.secondaryButton.link}
                                    className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold text-sm px-8 py-3.5 rounded-xl border border-white/20 transition-all"
                                >
                                    {ctaBanner.secondaryButton.text}
                                </Link>
                            </div>
                        </div>
                    </div>

                </div>
            </section>
        </main>
    );
}