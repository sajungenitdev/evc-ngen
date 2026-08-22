'use client';

import { useState } from 'react';
import Link from 'next/link';
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
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#071322] tracking-tight mb-10">
                    {chargingNeedsData.heading}
                </h2>

                {/* Tab Switcher Buttons */}
                <div className="flex justify-center gap-3 mb-16">
                    {chargingNeedsData.tabs.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as 'ac' | 'dc')}
                                className={`px-6 py-3 rounded-full text-xs sm:text-sm font-bold tracking-wider transition-all duration-200 shadow-sm ${isActive
                                        ? 'bg-[#1b7936] text-white shadow-md'
                                        : 'bg-[#e2e8f0] text-[#071322] hover:bg-[#cbd5e1]'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
                    {filteredProducts.map((product) => (
                        <div
                            key={product.id}
                            className="bg-white rounded-2xl p-8 sm:p-10 shadow-lg border border-gray-100 flex flex-col justify-between text-center transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
                        >
                            <div className="space-y-4">
                                <h3 className="text-xl sm:text-2xl font-extrabold text-[#071322] tracking-tight">
                                    {product.title}
                                </h3>
                                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                                    {product.description}
                                </p>
                            </div>

                            <div className="pt-8">
                                <Link
                                    href={product.link}
                                    className="inline-block border border-[#071322] hover:bg-[#071322] hover:text-white text-[#071322] font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl transition-all duration-200 shadow-xs"
                                >
                                    View Details
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}