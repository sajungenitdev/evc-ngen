'use client';

import Link from 'next/link';
import Image from 'next/image';
import { evShopSectionData } from '@/lib/db';

export default function ShopSection() {
    const { heading, items, viewAllButton } = evShopSectionData;

    return (
        <section className="bg-white py-24 px-6 md:px-12 lg:px-20 relative overflow-hidden">
            <div className="max-w-7xl mx-auto text-center">
                {/* Heading */}
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#071322] tracking-tight mb-16">
                    {heading}
                </h2>

                {/* 3 Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    {items.map((item, index) => (
                        <div
                            key={index}
                            className={`relative rounded-3xl p-8 sm:p-10 text-white flex flex-col justify-between h-[360px] sm:h-[400px] shadow-xl text-left overflow-hidden ${item.bgClass} transition-all duration-300 hover:-translate-y-1.5 group`}
                        >
                            {/* Background Image & Gradient Overlay */}
                            <Image
                                src={item.imageUrl}
                                alt={item.title}
                                fill
                                className="object-cover opacity-40 group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#071322] via-[#071322]/40 to-transparent"></div>

                            <div className="relative z-10"></div> {/* Spacer to push content down */}
                            
                            <div className="relative z-10 space-y-6">
                                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight drop-shadow-sm">
                                    {item.title}
                                </h3>
                                <div>
                                    <Link
                                        href={item.link}
                                        className="inline-block border border-white/60 hover:border-white hover:bg-white/10 text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-lg transition-all duration-200 backdrop-blur-xs"
                                    >
                                        {item.buttonText}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* View All Button */}
                <div>
                    <Link
                        href={viewAllButton.link}
                        className="inline-block bg-[#166030] hover:bg-[#114b24] text-white font-bold text-sm px-8 py-3.5 rounded-full shadow-md transition-all duration-200 hover:scale-105"
                    >
                        {viewAllButton.text}
                    </Link>
                </div>
            </div>
        </section>
    );
}