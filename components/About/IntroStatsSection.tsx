'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

interface IntroStatsProps {
    headerLabel: string;
    title: string;
    introParagraph1: string;
    introParagraph2: string;
    sidebarNav: Array<{ label: string; link: string; active: boolean }>;
    stats: Array<{ value: string; label: string }>;
}

export default function IntroStatsSection({
    headerLabel,
    title,
    introParagraph1,
    introParagraph2,
    stats,
}: IntroStatsProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });

    return (
        <section ref={ref} className="py-20 bg-gray-100 px-6 md:px-12 lg:px-20 border-b border-gray-100 overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <div className=" items-center">

                    {/* Left Column: Main Intro Content (Span 7 with Slide-in Animation) */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className="lg:col-span-7 space-y-6"
                    >
                        <div className="text-ev-green text-xs font-extrabold uppercase tracking-widest">
                            {headerLabel}
                        </div>

                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#071322] tracking-tight leading-tight">
                            {title}
                        </h1>

                        <div className="space-y-4 pt-2 text-gray-600 text-sm sm:text-base leading-relaxed">
                            <p>{introParagraph1}</p>
                            <p>{introParagraph2}</p>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}