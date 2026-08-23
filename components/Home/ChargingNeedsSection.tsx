'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { productsList } from '@/lib/productsDb';

export default function ChargingNeedsSection() {
    const [activeTab, setActiveTab] = useState<'ac' | 'dc'>('ac');

    // Filter products from productsList by category
    const filteredProducts = productsList.filter(
        (product) => {
            if (activeTab === 'ac') {
                return product.category === 'ac-chargers';
            } else {
                return product.category === 'dc-chargers';
            }
        }
    );

    return (
        <section className="bg-[#f8f9fa] py-24 px-6 md:px-12 lg:px-20 relative overflow-hidden">
            <div className="max-w-7xl mx-auto text-center">
                {/* Heading */}
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#071322] tracking-tight mb-8">
                    For All Your Charging Needs
                </h2>

                {/* Tab Switcher with smooth transitions */}
                <div className="flex justify-center mb-16">
                    <div className="inline-flex bg-[#edf2f7] rounded-full border border-gray-300 relative p-0.5">
                        {[
                            { id: 'ac', label: 'AC CHARGER' },
                            { id: 'dc', label: 'DC CHARGER' }
                        ].map((tab, index) => {
                            const isActive = activeTab === tab.id;
                            const isFirst = index === 0;
                            const isLast = index === 1;

                            let borderRadius = 'rounded-full';
                            if (isActive) {
                                if (isFirst) {
                                    borderRadius = 'rounded-l-full rounded-r-none';
                                } else if (isLast) {
                                    borderRadius = 'rounded-r-full rounded-l-none';
                                }
                            } else {
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

                {/* Products Grid - Shows filtered products from productsList */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {filteredProducts.map((product) => (
                        <div
                            key={product.id}
                            className="bg-white rounded-2xl border border-gray-200 flex flex-col justify-between text-center overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
                        >
                            {/* Product Image Area */}
                            <div className="relative w-full h-56 bg-[#eef2f6] flex items-center justify-center p-6">
                                <Image
                                    src={product.imageUrl}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>

                            {/* Content Area */}
                            <div className="p-6 sm:p-8 flex flex-col grow justify-between space-y-4">
                                <div className="space-y-2">
                                    <h3 className="text-lg font-bold text-[#071322] tracking-tight">
                                        {product.name}
                                    </h3>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        {product.shortDescription.length > 50
                                            ? `${product.shortDescription.slice(0, 80)}...`
                                            : product.shortDescription}
                                    </p>
                                </div>

                                <div>
                                    <Link
                                        href={`/ev-chargers/${product.id}`}
                                        className="inline-block border border-[#071322] hover:bg-[#071322] hover:text-white text-[#071322] font-bold text-sm px-6 py-2.5 rounded-xl transition-all duration-200"
                                    >
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Show message if no products found */}
                {filteredProducts.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">No {activeTab.toUpperCase()} chargers available.</p>
                    </div>
                )}
            </div>
        </section>
    );
}