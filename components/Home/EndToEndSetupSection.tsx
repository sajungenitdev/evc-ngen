'use client';

import Link from 'next/link';
import { endToEndSetupData } from '@/lib/db';

export default function EndToEndSetupSection() {
    const { headingPart1, headingPart2, steps, ctaButton } = endToEndSetupData;

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
                    {steps.map((step, index) => {
                        const IconComponent = step.icon;
                        return (
                            <div
                                key={index}
                                className="bg-white border border-gray-200/80 rounded-xl p-6 flex flex-col justify-between space-y-4 hover:shadow-md transition-all"
                            >
                                <div className="space-y-3">
                                    {/* Header with Icon and Title */}
                                    <div className="flex items-center gap-2.5">
                                        <IconComponent className="w-5 h-5 text-gray-500 shrink-0" />
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
                <div className="pt-4">
                    <Link
                        href={ctaButton.link}
                        className="inline-block bg-[#28bf61] hover:bg-[#22a854] text-white font-semibold text-sm sm:text-base px-7 py-3 rounded-full transition-all duration-200"
                    >
                        {ctaButton.text}
                    </Link>
                </div>
            </div>
        </section>
    );
}