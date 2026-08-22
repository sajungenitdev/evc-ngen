'use client';

import React, { useRef } from 'react';
import { Zap, Calendar } from 'lucide-react';
import { motion, useInView } from 'framer-motion';

interface TimelineProps {
    timeline: Array<{ year: string; title: string; description: string }>;
}

export default function TimelineSection({ timeline }: TimelineProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });

    return (
        <section ref={ref} className="py-24 px-6 md:px-12 lg:px-20 bg-[#f8f9fa] text-[#071322] relative overflow-hidden border-y border-gray-200/60">
            {/* Background Soft Glow Accents */}
            <div className="absolute top-1/4 left-0 w-96 h-96 bg-[#3ec06a]/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-10 right-0 w-96 h-96 bg-[#1b7936]/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="max-w-6xl mx-auto space-y-20 relative z-10">
                
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="text-center space-y-4 max-w-2xl mx-auto"
                >
                    <span className="inline-flex items-center gap-1.5 bg-[#e8f5e9] text-[#1b7936] border border-[#1b7936]/20 text-xs font-extrabold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-xs">
                        <Zap className="w-3.5 h-3.5" /> Our Journey
                    </span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#071322]">
                        Milestones That Shaped Our Growth
                    </h2>
                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                        From our foundation in power electronics to leading the global EV charging revolution.
                    </p>
                </motion.div>

                {/* Animated Timeline Container */}
                <div className="relative">
                    
                    {/* Central Vertical Connecting Line (Desktop) */}
                    <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 top-8 bottom-8 w-1 bg-gradient-to-b from-[#1b7936] via-[#3ec06a] to-gray-200"></div>

                    <div className="space-y-16 lg:space-y-24">
                        {timeline.map((item, idx) => {
                            const isEven = idx % 2 === 0;
                            return (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                                    transition={{ duration: 0.6, ease: 'easeOut', delay: 0.15 * idx }}
                                    className="relative flex flex-col lg:flex-row items-center transition-all duration-500"
                                >
                                    
                                    {/* Left Content (For Even Index on Desktop) */}
                                    <div className={`w-full lg:w-1/2 lg:pr-16 ${isEven ? 'lg:text-right' : 'lg:order-2 lg:pl-16 lg:text-left'} text-left`}>
                                        <div className="space-y-3 group cursor-pointer">
                                            
                                            {/* Year Badge */}
                                            <div className={`inline-flex items-center gap-1.5 bg-[#e8f5e9] text-[#1b7936] border border-[#1b7936]/20 font-extrabold text-xs px-4 py-1.5 rounded-full shadow-xs ${isEven ? 'lg:ml-auto' : ''}`}>
                                                <Calendar className="w-3.5 h-3.5" />
                                                {item.year}
                                            </div>

                                            <h3 className="text-2xl font-extrabold text-[#071322] group-hover:text-[#1b7936] transition-colors">
                                                {item.title}
                                            </h3>
                                            
                                            <p className="text-gray-600 text-sm sm:text-base leading-relaxed max-w-lg">
                                                {item.description}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Center Node Indicator (Desktop) */}
                                    <div className="hidden lg:flex absolute left-1/2 transform -translate-x-1/2 w-10 h-10 rounded-full bg-white border-4 border-[#1b7936] items-center justify-center shadow-md z-20">
                                        <div className="w-3 h-3 bg-[#3ec06a] rounded-full animate-pulse"></div>
                                    </div>

                                    {/* Empty Right Column Spacer (For Balance) */}
                                    <div className={`hidden lg:block w-1/2 ${isEven ? 'lg:order-2' : 'lg:order-1'}`}></div>

                                </motion.div>
                            );
                        })}
                    </div>

                </div>

            </div>
        </section>
    );
}