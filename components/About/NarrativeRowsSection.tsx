'use client';

import Image from 'next/image';
import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface NarrativeProps {
    whoWeAre: { title: string; paragraph1: string; paragraph2: string; imageUrl: string };
    mission: { title: string; paragraph1: string; paragraph2: string; imageUrl: string };
}

export default function NarrativeRowsSection({ whoWeAre, mission }: NarrativeProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });

    return (
        <section ref={ref} className="py-24 px-6 md:px-12 lg:px-20 space-y-24 overflow-hidden">
            <div className="max-w-7xl mx-auto space-y-24">

                {/* Who We Are Row */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center"
                >
                    <div className="relative rounded-3xl overflow-hidden shadow-2xl h-[360px] sm:h-[420px] bg-[#0c1f38] group">
                        <Image
                            alt="Who We Are"
                            className="object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                            fill
                            src={whoWeAre.imageUrl}
                        />
                    </div>
                    <div className="space-y-6">
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-[#071322] tracking-tight">
                            {whoWeAre.title}
                        </h2>
                        <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                            {whoWeAre.paragraph1}
                        </p>
                        <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                            {whoWeAre.paragraph2}
                        </p>
                    </div>
                </motion.div>

                {/* Our Mission Row */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center"
                >
                    <div className="space-y-6 order-2 lg:order-1">
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-[#071322] tracking-tight">
                            {mission.title}
                        </h2>
                        <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                            {mission.paragraph1}
                        </p>
                        <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                            {mission.paragraph2}
                        </p>
                    </div>
                    <div className="relative rounded-3xl overflow-hidden shadow-2xl h-[360px] sm:h-[420px] bg-[#0c1f38] order-1 lg:order-2 group">
                        <Image
                            alt="Our Mission"
                            className="object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                            fill
                            src={mission.imageUrl}
                        />
                    </div>
                </motion.div>

            </div>
        </section>
    );
}