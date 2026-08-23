'use client';

import Link from 'next/link';
import Image from 'next/image';
import { storiesSectionData } from '@/lib/db';

export default function StoriesSection() {
    const { mainStory, categories } = storiesSectionData;

    return (
        <section className="bg-white py-24 pt-16 px-6 md:px-12 lg:px-20 relative overflow-hidden">
            <div className="max-w-7xl mx-auto">
                {/* Heading & Subtitle */}
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#071322] tracking-tight mb-4">
                        {storiesSectionData.heading}
                    </h2>
                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                        {storiesSectionData.subtitle}
                    </p>
                </div>

                {/* Main Featured Banner Card */}
                <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl min-h-[400px] flex items-center mb-10 border border-gray-100 bg-[#071322]">
                    {/* Background Image with Overlay */}
                    <Image
                        src={mainStory.imageUrl}
                        alt="Featured Deployment Story"
                        fill
                        className="object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#071322] via-[#071322]/80 to-transparent"></div>

                    {/* Content */}
                    <div className="relative z-10 max-w-2xl p-8 sm:p-12 lg:p-16 text-white space-y-6">
                        <p className="text-base sm:text-lg md:text-xl font-medium leading-relaxed tracking-tight">
                            {mainStory.quote}
                        </p>
                        <Link
                            href={"/about"}
                            className="inline-block text-[#3ec06a] hover:text-[#3ec06a]/80 font-bold text-sm sm:text-base transition-colors"
                        >
                            {mainStory.linkText}
                        </Link>
                    </div>
                </div>

                {/* 4 Category Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {categories.map((cat, index) => (
                        <Link
                            key={index}
                            href={cat.link}
                            className="relative group h-[260px] rounded-2xl overflow-hidden shadow-lg block bg-[#071322]"
                        >
                            {/* Card Background Image */}
                            <Image
                                src={cat.imageUrl}
                                alt={cat.title}
                                fill
                                className="object-cover opacity-70 group-hover:scale-105 transition-transform duration-500"
                            />
                            {/* Gradient Overlay for Text Readability */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#071322] via-[#071322]/40 to-transparent"></div>

                            {/* Title Label */}
                            <div className="absolute bottom-6 left-6 z-10">
                                <h3 className="text-white font-extrabold text-lg sm:text-xl tracking-tight">
                                    {cat.title}
                                </h3>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}