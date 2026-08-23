'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { chargingNeedsData } from '@/lib/db';

export default function ChargingNeedsSection() {
    const [activeTab, setActiveTab] = useState<'ac' | 'dc'>('ac');

    const filteredProducts = chargingNeedsData.products.filter(
        (product) => product.category === activeTab
    );

    return (
        <section className="bg-[#f8f9fa] py-24 px-6 md:px-12 lg:px-20 relative overflow-hidden">
            <div className="max-w-7xl mx-auto text-center">
                {/* Heading */}
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#071322] tracking-tight mb-8">
                    {chargingNeedsData.heading}
                </h2>

                {/* Tab Switcher with smooth transitions */}
                <div className="flex justify-center mb-16">
                    <div className="inline-flex bg-[#edf2f7] rounded-full border border-gray-300 relative">
                        {chargingNeedsData.tabs.map((tab, index) => {
                            const isActive = activeTab === tab.id;
                            const isFirst = index === 0;
                            const isLast = index === chargingNeedsData.tabs.length - 1;

                            // Determine border radius based on active state and position
                            let borderRadius = 'rounded-full';
                            if (isActive) {
                                if (isFirst) {
                                    borderRadius = 'rounded-l-full rounded-r-none';
                                } else if (isLast) {
                                    borderRadius = 'rounded-r-full rounded-l-none';
                                }
                            } else {
                                // For inactive buttons, make them fully rounded but with smooth transition
                                borderRadius = 'rounded-full';
                            }

                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as 'ac' | 'dc')}
                                    className={`relative px-7 py-2.5 text-xs sm:text-sm font-bold tracking-wider transition-all duration-300 ease-in-out ${borderRadius} ${isActive
                                        ? 'bg-[#071322] text-white shadow-md scale-[1.02]'
                                        : 'bg-transparent text-gray-500 hover:text-[#071322] hover:bg-white/30'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Products Grid */}
                <div className="flex flex-wrap justify-center gap-8 items-stretch">
                    {filteredProducts.map((product) => (
                        <div
                            key={product.id}
                            className="bg-white rounded-2xl border border-gray-300 flex flex-col items-center justify-between text-center overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl w-full md:w-[calc(33.333%-1.33rem)] max-w-sm"
                        >
                            {/* Product Image Area */}
                            <div className="relative w-full h-64 bg-[#eef2f6] flex items-center justify-center p-6">
                                <Image
                                    src={product.image}
                                    alt={product.title}
                                    fill
                                    className="object-cover "
                                />
                            </div>

                            {/* Content Area */}
                            <div className="p-8 sm:p-10 flex flex-col flex-grow justify-between space-y-6 w-full">
                                <div className="space-y-3">
                                    <h3 className="text-md sm:text-md font-bold text-[#071322] tracking-tight">
                                        {product.title}
                                    </h3>
                                    <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                                        {product.description}
                                    </p>
                                </div>

                                <div>
                                    <Link
                                        href={product.link}
                                        className="inline-block border border-[#071322] hover:bg-[#071322] hover:text-white text-[#071322] font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl transition-all duration-200 shadow-xs"
                                    >
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}