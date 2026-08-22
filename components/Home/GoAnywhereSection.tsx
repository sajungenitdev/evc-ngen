'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Search } from 'lucide-react';
import { goAnywhereSectionData } from '@/lib/db';

export default function GoAnywhereSection() {
    const { locationCard, appCard, catalogCard } = goAnywhereSectionData;
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <section className="bg-white py-24 px-6 md:px-12 lg:px-20 relative overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Card 1: Go Anywhere (Location Search) */}
                    <div className={`relative rounded-3xl p-8 sm:p-10 flex flex-col justify-between shadow-lg overflow-hidden min-h-[360px] ${locationCard.bgClass}`}>
                        <Image
                            src={locationCard.imageUrl}
                            alt="Location Background"
                            fill
                            className="object-cover opacity-15"
                        />
                        <div className="relative z-10 space-y-4">
                            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#071322] tracking-tight">
                                {locationCard.title}
                            </h3>
                            <button className="inline-flex items-center gap-1.5 text-[#1b7936] text-xs font-bold uppercase tracking-wider hover:underline">
                                <MapPin className="w-4 h-4" />
                                {locationCard.locationText}
                            </button>
                        </div>

                        <div className="relative z-10 pt-6">
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                    <Search className="w-4 h-4" />
                                </span>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder={locationCard.placeholder}
                                    className="w-full bg-white text-[#071322] placeholder-gray-400 text-xs sm:text-sm pl-11 pr-4 py-3.5 rounded-full shadow-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1b7936]"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Download our App */}
                    <Link
                        href={appCard.link}
                        className={`relative rounded-3xl p-8 sm:p-10 flex flex-col justify-between shadow-lg overflow-hidden min-h-[360px] ${appCard.bgClass} group transition-all duration-300 hover:-translate-y-1`}
                    >
                        <Image
                            src={appCard.imageUrl}
                            alt="Download App Background"
                            fill
                            className="object-cover opacity-25 group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="relative z-10">
                            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                                {appCard.title}
                            </h3>
                        </div>
                        <div className="relative z-10 text-white font-bold text-2xl group-hover:translate-x-2 transition-transform">
                            {appCard.linkText}
                        </div>
                    </Link>

                    {/* Card 3: View Product Catalog */}
                    <Link
                        href={catalogCard.link}
                        className={`relative rounded-3xl p-8 sm:p-10 flex flex-col justify-between shadow-lg overflow-hidden min-h-[360px] ${catalogCard.bgClass} group transition-all duration-300 hover:-translate-y-1`}
                    >
                        <Image
                            src={catalogCard.imageUrl}
                            alt="Catalog Background"
                            fill
                            className="object-cover opacity-25 group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="relative z-10">
                            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                                {catalogCard.title}
                            </h3>
                        </div>
                        <div className="relative z-10 text-white font-bold text-2xl group-hover:translate-x-2 transition-transform">
                            {catalogCard.linkText}
                        </div>
                    </Link>

                </div>
            </div>
        </section>
    );
}