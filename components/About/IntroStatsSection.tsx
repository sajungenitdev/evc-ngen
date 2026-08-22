'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
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
    sidebarNav,
    stats,
}: IntroStatsProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });

    return (
        <section ref={ref} className="py-20 bg-gray-100 px-6 md:px-12 lg:px-20 border-b border-gray-100 overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

                    {/* Left Column: Main Intro Content (Span 7 with Slide-in Animation) */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className="lg:col-span-7 space-y-6"
                    >
                        <div className="text-[#3ec06a] text-xs font-extrabold uppercase tracking-widest">
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

                    {/* Right Column: Sidebar Navigation & Stat Cards (Span 5 with Slide-in Animation) */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
                        className="lg:col-span-5 space-y-6"
                    >
                        {/* Sidebar Navigation */}
                        <div className="bg-[#f8f9fa] border border-gray-200/80 rounded-2xl overflow-hidden shadow-sm">
                            {sidebarNav.map((item, index) => (
                                <Link
                                    key={index}
                                    href={item.link}
                                    className={`block px-6 py-4 text-sm font-bold transition-colors ${
                                        item.active
                                            ? 'text-[#071322] bg-white border-l-4 border-[#3ec06a]'
                                            : 'text-gray-500 hover:text-[#071322] hover:bg-gray-100/50 border-t border-gray-200/60'
                                    }`}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>

                        {/* Animated 2x2 Stats Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            {stats.map((stat, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                                    transition={{ duration: 0.5, delay: 0.3 + idx * 0.1 }}
                                    whileHover={{ scale: 1.03 }}
                                    className="bg-[#f8f9fa] border border-gray-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between transition-shadow hover:shadow-md"
                                >
                                    <div className="text-2xl sm:text-3xl font-extrabold text-[#3ec06a] tracking-tight mb-2">
                                        {stat.value}
                                    </div>
                                    <div className="text-gray-500 text-xs sm:text-sm font-medium leading-snug">
                                        {stat.label}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}