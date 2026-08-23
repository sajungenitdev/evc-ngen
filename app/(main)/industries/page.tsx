// app/(main)/industries/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { industriesList, getIndustryIcon } from '@/lib/industriesDb';
import PageHeader from '@/components/pagesComps/PageHeader';
import { ArrowRight, Search } from 'lucide-react';

export default function IndustriesPage() {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredIndustries = industriesList.filter(industry =>
        industry.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        industry.desc.toLowerCase().includes(searchQuery.toLowerCase())
    );

    console.log(filteredIndustries, "filteredIndustries")
    return (
        <div className="bg-white min-h-screen">
            <PageHeader
                breadcrumbs={[
                    { label: 'Home', link: '/' },
                    { label: 'Industries' }
                ]}
                imageUrl="/images/help/industries-hero.jpg"
                title="Industries We Serve"
                description="From fuel retail to fleet logistics, we provide tailored EV charging solutions for every industry."
            />

            <section className="max-w-7xl mx-auto py-12 pb-24">

                {/* Search Bar */}
                <div className="mb-10 max-w-2xl mx-auto">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search industries..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#f8f9fa] border border-gray-200 rounded-2xl px-5 py-3.5 pl-12 text-sm focus:outline-none focus:border-[#1b7936] transition-colors"
                        />
                        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                </div>

                {/* Industries Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredIndustries.map((industry) => {
                        const icon = getIndustryIcon(industry.id);
                        return (
                            <Link
                                key={industry.id}
                                href={`/industries/${industry.id}`}
                                className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                            >
                                {/* Image */}
                                <div className="relative h-48 overflow-hidden bg-[#f8f9fa]">
                                    <Image
                                        src={industry.imageUrl}
                                        alt={industry.label}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-linear-to-t from-ev-dark-blue/60 to-transparent"></div>
                                    <div className="absolute bottom-4 left-4 text-white text-3xl">
                                        {icon}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-5">
                                    <h3 className="text-lg font-extrabold text-ev-dark-green group-hover:text-[#1b7936] transition-colors">
                                        {industry.label}
                                    </h3>
                                    <p className="text-sm font-semibold text-[#071322] mt-1 leading-relaxed">
                                        {industry.subtitle}
                                    </p>
                                    <p className="text-gray-500 text-xs mt-2 leading-relaxed">
                                        {industry.desc}
                                    </p>
                                    <div className="mt-3 flex items-center text-[#1b7936] font-semibold text-sm group-hover:gap-2 transition-all">
                                        Learn More <ArrowRight className="w-4 h-4 ml-1 group-hover:ml-2 transition-all" />
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* No Results */}
                {filteredIndustries.length === 0 && (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-2xl font-extrabold text-[#071322]">No industries found</h3>
                        <p className="text-gray-500 text-sm mt-2">
                            Try adjusting your search terms.
                        </p>
                    </div>
                )}


                {/* CTA */}
                <div className="mt-20 bg-linear-to-br from-ev-dark-blue to-ev-dark-green rounded-3xl p-12 text-center text-white">
                    <h2 className="text-3xl font-extrabold mb-4">
                        Don't See Your Industry?
                    </h2>
                    <p className="text-white/80 text-sm max-w-2xl mx-auto mb-8">
                        We work with organizations across all sectors. Contact us to discuss your specific needs.
                    </p>
                    <Link
                        href="/contact"
                        className="bg-white text-ev-dark-blue hover:bg-gray-100 font-bold px-8 py-3.5 rounded-xl transition-colors inline-block"
                    >
                        Contact Our Team
                    </Link>
                </div>

            </section>
        </div>
    );
}