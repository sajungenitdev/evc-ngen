// components/About/PartnersSection.tsx
'use client';

import React, { useRef } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { motion, useInView } from 'framer-motion';
import { ImageHelperNarrative } from '@/components/ImageHelperNarrative';

interface Partner {
    name: string;
    logo: string;
    isActive?: boolean;
}

interface PartnersProps {
    partners: Partner[];
}

export default function PartnersSection({ partners }: PartnersProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });

    // Filter active partners
    const activePartners = partners.filter(p => p.isActive !== false);

    // Initialize Embla with loop and autoplay plugin
    const [emblaRef] = useEmblaCarousel(
        { loop: true, align: 'start', skipSnaps: false },
        [Autoplay({ delay: 3000, stopOnInteraction: false, stopOnMouseEnter: true })]
    );

    if (activePartners.length === 0) {
        return null;
    }

    return (
        <section ref={ref} className="py-24 px-6 md:px-12 lg:px-20 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto text-center space-y-12">

                {/* Section Header with Animation */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="space-y-3"
                >
                    <span className="text-[#3ec06a] text-xs font-extrabold uppercase tracking-widest">Global Partners</span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-[#071322] tracking-tight">
                        Trusted by Industry Leaders & Operators Worldwide
                    </h2>
                </motion.div>

                {/* Embla Carousel Viewport with Animation */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
                    className="overflow-hidden cursor-grab active:cursor-grabbing"
                    ref={emblaRef}
                >
                    <div className="flex items-center -ml-6">
                        {activePartners.map((partner, idx) => (
                            <div
                                key={idx}
                                className="flex-[0_0_50%] sm:flex-[0_0_33.333%] lg:flex-[0_0_16.666%] pl-6 min-w-0"
                            >
                                <div className="h-24 flex items-center justify-center relative group">
                                    {partner.logo ? (
                                        <ImageHelperNarrative
                                            src={partner.logo}
                                            alt={partner.name}
                                            className="object-contain p-2 transition-transform duration-300 group-hover:scale-105 max-h-full w-auto"
                                            fallback={
                                                <span className="text-2xl font-bold text-gray-400">
                                                    {partner.name.charAt(0).toUpperCase()}
                                                </span>
                                            }
                                        />
                                    ) : (
                                        <span className="text-2xl font-bold text-gray-400">
                                            {partner.name.charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

            </div>
        </section>
    );
}