// components/Home/FoundationSection.tsx
'use client';

import Image from 'next/image';
import { foundationData } from '@/lib/db';

export default function FoundationSection() {
    return (
        <section className="bg-white py-24 px-6 md:px-12 lg:px-20">
            <div className="max-w-7xl mx-auto">
                {/* Heading & Subtitle */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#14304f] tracking-tight mb-4">
                        {foundationData.heading}
                    </h2>
                    <p className="text-[#5a6472] text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
                        {foundationData.subtitle}
                    </p>
                </div>

                {/* 4 Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {foundationData.items.map((item, index) => (
                        <div
                            key={index}
                            className={`${item.bgClass} relative rounded-lg overflow-hidden min-h-[420px] group cursor-pointer transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl`}
                        >
                            {/* Background Image */}
                            <div className="absolute inset-0">
                                <Image
                                    src={item.imageUrl}
                                    alt={item.imageAlt}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                />
                                {/* Image Overlay with Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0c1f38]/90 via-[#0c1f38]/50 to-transparent"></div>
                            </div>

                            {/* Content */}
                            <div className="relative z-10 h-full flex flex-col justify-end p-6 pb-8">
                                <h3 className="text-white font-extrabold text-2xl mb-3 tracking-tight">
                                    {item.title}
                                </h3>
                                <p className="text-[#d8dfe8] text-sm leading-relaxed">
                                    {item.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}