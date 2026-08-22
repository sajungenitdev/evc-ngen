'use client';

import Link from 'next/link';
import { Wrench, ClipboardList, Construction, Wifi, Headphones } from 'lucide-react';
import { endToEndSetupData } from '@/lib/db';

export default function EndToEndSetupSection() {
    const { headingPart1, headingPart2, steps, ctaButton } = endToEndSetupData;

    const renderIcon = (type: string) => {
        const iconClass = "w-6 h-6 text-[#1b7936]";
        switch (type) {
            case 'wrench': return <Wrench className={iconClass} />;
            case 'clipboard': return <ClipboardList className={iconClass} />;
            case 'construction': return <Construction className={iconClass} />;
            case 'wifi': return <Wifi className={iconClass} />;
            case 'headset': return <Headphones className={iconClass} />;
            default: return <Wrench className={iconClass} />;
        }
    };

    return (
        <section className="bg-white py-24 px-6 md:px-12 lg:px-20 relative overflow-hidden">
            <div className="max-w-7xl mx-auto text-center">
                {/* Heading */}
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-20 text-[#071322]">
                    {headingPart1}{' '}
                    <span className="text-[#1b7936]">{headingPart2}</span>
                </h2>

                {/* 5 Steps Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-16 items-start">
                    {steps.map((step, index) => (
                        <div key={index} className="flex flex-col items-center text-center space-y-5 px-2">
                            {/* Circular Icon Wrapper */}
                            <div className="w-20 h-20 rounded-full bg-[#e8f5e9] flex items-center justify-center shadow-inner transition-transform duration-300 hover:scale-105">
                                {renderIcon(step.iconType)}
                            </div>
                            {/* Title & Description */}
                            <div className="space-y-2">
                                <h3 className="text-base sm:text-lg font-bold text-[#071322] tracking-tight">
                                    {step.title}
                                </h3>
                                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                                    {step.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Consultation Button */}
                <div>
                    <Link
                        href={ctaButton.link}
                        className="inline-block bg-[#1b7936] hover:bg-[#155f2b] text-white font-bold text-sm sm:text-base px-8 py-4 rounded-full shadow-lg transition-all duration-200 hover:scale-105"
                    >
                        {ctaButton.text}
                    </Link>
                </div>
            </div>
        </section>
    );
}