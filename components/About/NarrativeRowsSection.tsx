'use client';

import Image from 'next/image';
import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

interface NarrativeItem {
    title: string;
    paragraph1: string;
    paragraph2: string;
    imageUrl: string;
    highlights?: string[];
}

interface NarrativeProps {
    whoWeAre: NarrativeItem;
    mission: NarrativeItem;
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
                    className="grid grid-cols-1 lg:grid-cols-2 items-center gap-10 lg:gap-12"
                >
                    <div className="relative rounded-xl overflow-hidden shadow-2xl h-90 sm:h-105 bg-ev-dark-blue group">
                        <Image
                            alt="Who We Are"
                            className="object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                            fill
                            src={whoWeAre.imageUrl}
                        />
                    </div>
                    <div className="space-y-6 ps-0 lg:ps-10">
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-[#071322] tracking-tight">
                            {whoWeAre.title}
                        </h2>
                        <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                            {whoWeAre.paragraph1}
                        </p>
                        <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                            {whoWeAre.paragraph2}
                        </p>

                        {/* Who We Are Checklist */}
                        {whoWeAre.highlights && whoWeAre.highlights.length > 0 && (
                            <ul className="space-y-3 pt-2">
                                {whoWeAre.highlights.map((item, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-[#1b7936] shrink-0 mt-0.5" />
                                        <span className="text-sm sm:text-base text-gray-700 font-medium leading-normal">
                                            {item}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </motion.div>

                {/* Our Mission Row */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
                    className="grid grid-cols-1 lg:grid-cols-2 items-center gap-10 lg:gap-12"
                >
                    <div className="space-y-6 order-2 lg:order-1 pe-0 lg:pe-10">
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-[#071322] tracking-tight">
                            {mission.title}
                        </h2>

                        <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                            {mission.paragraph1}
                        </p>

                        <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                            {mission.paragraph2}
                        </p>

                        {/* Mission Checklist */}
                        {mission.highlights && mission.highlights.length > 0 && (
                            <ul className="space-y-3 pt-2">
                                {mission.highlights.map((item, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-[#1b7936] shrink-0 mt-0.5" />
                                        <span className="text-sm sm:text-base text-gray-700 font-medium leading-normal">
                                            {item}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="relative rounded-xl overflow-hidden shadow-2xl h-90 sm:h-105 bg-ev-dark-blue order-1 lg:order-2 group">
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