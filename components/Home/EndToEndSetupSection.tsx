// components/Home/EndToEndSetupSection.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { endToEndSetupAPI, EndToEndSetupData, Step, getIconEmoji } from '@/lib/api/endToEndSetup';

// ============================================================================
// Icon Mapping for Lucide Icons (will be rendered as emoji for simplicity)
// ============================================================================

// If you want to use actual Lucide icons, import them here
// import { Wrench, ClipboardList, Construction, Wifi, Headphones, CreditCard, ShieldCheck, BarChart3 } from 'lucide-react';

// For now, we'll use emoji mapping from the API service
// You can replace this with actual Lucide icons if needed

// ============================================================================
// Default Data
// ============================================================================

const DEFAULT_END_TO_END_DATA: EndToEndSetupData = {
    _id: '',
    headingPart1: 'End-to-End',
    headingPart2: 'EV Charger Setup & Support',
    steps: [
        {
            title: 'Free Site Assessment',
            description: 'End-to-end site planning to get your location deployment-ready.',
            icon: 'Wrench',
            order: 0,
            isActive: true
        },
        {
            title: 'Execution Plan & Pricing',
            description: 'Hardware recommendations, pricing, and a full installation plan.',
            icon: 'ClipboardList',
            order: 1,
            isActive: true
        },
        {
            title: 'Installation & Testing',
            description: 'Certified technicians install and test for safety and compliance.',
            icon: 'Construction',
            order: 2,
            isActive: true
        },
        {
            title: 'Onboarding & Activation',
            description: 'KYC, platform onboarding, and activation with dashboard access.',
            icon: 'Wifi',
            order: 3,
            isActive: true
        },
        {
            title: '24/7 Customer Support',
            description: 'Our team is available around the clock for technical queries.',
            icon: 'Headphones',
            order: 4,
            isActive: true
        },
        {
            title: 'Software & Billing Integration',
            description: 'Configure custom pricing, payment gateways, and automated billing controls.',
            icon: 'CreditCard',
            order: 5,
            isActive: true
        },
        {
            title: 'Preventative Maintenance',
            description: 'Routine hardware inspections and firmware updates to ensure maximum uptime.',
            icon: 'ShieldCheck',
            order: 6,
            isActive: true
        },
        {
            title: 'Analytics & Fleet Reporting',
            description: 'Track energy consumption, revenue metrics, and overall charger utilization.',
            icon: 'BarChart3',
            order: 7,
            isActive: true
        }
    ],
    ctaButton: {
        text: 'Book a Free Consultation',
        link: '/request-survey',
        isActive: true
    },
    isActive: true,
    backgroundColor: '#ffffff',
    textColor: '#071322',
    sectionId: 'end-to-end-setup'
};

// ============================================================================
// Main Component
// ============================================================================

export default function EndToEndSetupSection() {
    const [endToEndData, setEndToEndData] = useState<EndToEndSetupData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const response = await endToEndSetupAPI.getActive();

                if (response.success && response.data) {
                    setEndToEndData(response.data);
                } else {
                    setEndToEndData(DEFAULT_END_TO_END_DATA);
                }
            } catch (error) {
                console.error('Error fetching End-to-End Setup data:', error);
                setError('Failed to load data');
                setEndToEndData(DEFAULT_END_TO_END_DATA);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // Loading state
    if (isLoading) {
        return (
            <section className="bg-white py-16 px-6 md:px-12 lg:px-20">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-12 h-12 text-[#1b7936] animate-spin" />
                    </div>
                </div>
            </section>
        );
    }

    if (!endToEndData) {
        return null;
    }

    // Filter active steps
    const activeSteps = endToEndData.steps.filter(step => step.isActive !== false);

    if (activeSteps.length === 0) {
        return null;
    }

    const { headingPart1, headingPart2, ctaButton } = endToEndData;

    return (
        <section className="bg-white py-16 px-6 md:px-12 lg:px-20 relative overflow-hidden">
            <div className="max-w-7xl mx-auto text-center space-y-12">
                {/* Heading */}
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#071322]">
                    {headingPart1}{' '}
                    <span className="text-[#1b7936]">{headingPart2}</span>
                </h2>

                {/* Card Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
                    {activeSteps.map((step, index) => {
                        // Get emoji from icon name
                        const iconEmoji = getIconEmoji(step.icon);
                        return (
                            <div
                                key={step._id || index}
                                className="bg-white border border-gray-200/80 rounded-xl p-6 flex flex-col justify-between space-y-4 hover:shadow-md transition-all hover:-translate-y-0.5"
                            >
                                <div className="space-y-3">
                                    {/* Header with Icon and Title */}
                                    <div className="flex items-center gap-2.5">
                                        <span className="text-xl shrink-0">{iconEmoji}</span>
                                        <h3 className="text-base font-bold text-[#071322] leading-snug">
                                            {step.title}
                                        </h3>
                                    </div>

                                    {/* Description */}
                                    <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                                        {step.description}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* CTA Button */}
                {ctaButton && ctaButton.isActive !== false && (
                    <div className="pt-4">
                        <Link
                            href={ctaButton.link || '/request-survey'}
                            className="inline-block bg-[#28bf61] hover:bg-[#22a854] text-white font-semibold text-sm sm:text-base px-7 py-3 rounded-full transition-all duration-200 hover:scale-105 shadow-md"
                        >
                            {ctaButton.text || 'Book a Free Consultation'}
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
}