'use client';

import Link from 'next/link';
import PageHeader from '@/components/pagesComps/PageHeader';
import { termsPageData } from '@/lib/db';
import { ShieldCheck, MessageSquare } from 'lucide-react';

export default function TermsPage() {
    const { header, lastUpdated, sections } = termsPageData;

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
                <div className="max-w-7xl mx-auto space-y-12">
                    
                    {/* Meta Info Box */}
                    <div className="flex items-center justify-between bg-[#f8f9fa] border border-gray-200/80 px-6 py-4 rounded-2xl text-xs sm:text-sm text-gray-500">
                        <span className="flex items-center gap-2 font-bold text-[#071322]">
                            <ShieldCheck className="w-4 h-4 text-[#1b7936]" />
                            Official Legal Policy
                        </span>
                        <span>{lastUpdated}</span>
                    </div>

                    {/* Terms Sections */}
                    <div className="space-y-10">
                        {sections.map((section, index) => (
                            <div key={index} className="space-y-3">
                                <h2 className="text-xl sm:text-2xl font-extrabold text-[#071322] tracking-tight">
                                    {section.heading}
                                </h2>
                                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                                    {section.content}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Contact Support Footer Box */}
                    <div className="bg-[#0c1f38] text-white rounded-3xl p-8 sm:p-10 text-center space-y-4 shadow-xl mt-16">
                        <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                            Have questions about our terms?
                        </h3>
                        <p className="text-gray-300 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
                            If you require clarification regarding commercial agreements, hardware warranties, or software licensing, please reach out to our legal and support team.
                        </p>
                        <div className="pt-2">
                            <Link
                                href="/contact"
                                className="inline-flex items-center gap-2 bg-[#3ec06a] hover:bg-[#34a55b] text-[#071322] font-bold text-sm px-8 py-3.5 rounded-xl shadow-lg transition-all"
                            >
                                <MessageSquare className="w-4 h-4" />
                                Contact Legal Team
                            </Link>
                        </div>
                    </div>

                </div>
            </section>
        </main>
    );
}