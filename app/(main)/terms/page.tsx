// app/(main)/terms/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import PageHeader from '@/components/pagesComps/PageHeader';
import { termsAPI, TermsData, filterActiveSections, getTermsImageUrl } from '@/lib/api/terms';
import { ShieldCheck, MessageSquare } from 'lucide-react';

// ============================================================================
// Default Data
// ============================================================================

const DEFAULT_TERMS_DATA: TermsData = {
    _id: '',
    header: {
        breadcrumbs: [
            { label: 'Home', link: '/' },
            { label: 'Terms & Conditions' }
        ],
        imageUrl: '/images/help/EV Charging_1.jpg',
        title: 'Terms & Conditions',
        description: 'Review our terms of service, hardware warranties, and commercial usage policies.'
    },
    lastUpdated: `Last Updated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
    sections: [
        {
            heading: '1. Acceptance of Terms',
            content: 'By accessing and using EVNGEN\'s website, products, and services, you agree to comply with and be bound by these Terms & Conditions. If you do not agree with any part of these terms, you must not use our services.',
            order: 0,
            isActive: true
        },
        {
            heading: '2. Hardware & Equipment Warranty',
            content: 'EVNGEN warrants that all EV charging hardware and equipment shall be free from defects in materials and workmanship for a period of 2 to 5 years from the date of purchase, depending on the specific product model. Warranty claims must be submitted through our official support portal and are subject to verification by our engineering team.',
            order: 1,
            isActive: true
        },
        {
            heading: '3. Commercial & Fleet Services',
            content: 'Services provided to commercial operators and fleet clients are governed by mutually agreed statements of work and service-level agreements. Additional terms apply to site installation, load balancing, grid integration, and OCPP backend connectivity.',
            order: 2,
            isActive: true
        },
        {
            heading: '4. Intellectual Property Rights',
            content: 'All content on this website, including but not limited to text, graphics, logos, images, software, and source code, is the property of EVNGEN and protected by international copyright and trademark laws.',
            order: 3,
            isActive: true
        },
        {
            heading: '5. Software Licensing & OCPP Compliance',
            content: 'EVNGEN\'s OCPP-compliant backend software and cloud management platform are licensed on a subscription basis. Users are granted a non-exclusive, non-transferable right to access and use the software strictly in accordance with the subscription terms and conditions.',
            order: 4,
            isActive: true
        },
        {
            heading: '6. Limitation of Liability',
            content: 'To the fullest extent permitted by law, EVNGEN shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from the use or inability to use our products or services.',
            order: 5,
            isActive: true
        },
        {
            heading: '7. Governing Law',
            content: 'These Terms & Conditions are governed by and construed in accordance with the laws of the jurisdiction in which EVNGEN operates. Any disputes arising out of or relating to these terms shall be resolved through binding arbitration.',
            order: 6,
            isActive: true
        }
    ],
    isActive: true
};

// ============================================================================
// Main Component
// ============================================================================

export default function TermsPage() {
    const [termsData, setTermsData] = useState<TermsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTermsData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const response = await termsAPI.getActive();

                if (response.success && response.data) {
                    setTermsData(response.data);
                } else {
                    setTermsData(DEFAULT_TERMS_DATA);
                }
            } catch (error) {
                console.error('Error fetching Terms data:', error);
                setError('Failed to load Terms data');
                setTermsData(DEFAULT_TERMS_DATA);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTermsData();
    }, []);

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-[#1b7936] animate-spin mx-auto" />
                    <p className="text-gray-500 text-sm mt-4">Loading Terms & Conditions...</p>
                </div>
            </div>
        );
    }

    if (!termsData) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <p className="text-gray-500">No terms data available</p>
            </div>
        );
    }

    const { header, lastUpdated, sections } = termsData;
    const activeSections = filterActiveSections(sections);

    return (
        <main className="min-h-screen bg-white">
            {/* Branded Page Header */}
            <PageHeader
                breadcrumbs={header.breadcrumbs}
                imageUrl={getTermsImageUrl(header.imageUrl)}
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
                        <span>{lastUpdated || 'Last Updated: N/A'}</span>
                    </div>

                    {/* Terms Sections */}
                    <div className="space-y-10">
                        {activeSections.map((section, index) => (
                            <div key={section._id || index} className="space-y-3">
                                <h2 className="text-xl sm:text-2xl font-extrabold text-[#071322] tracking-tight">
                                    {section.heading}
                                </h2>
                                <div
                                    className="text-gray-600 text-sm sm:text-base leading-relaxed prose prose-sm max-w-none"
                                    dangerouslySetInnerHTML={{ __html: section.content }}
                                />
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