'use client';

import Link from 'next/link';
import Image from 'next/image';
import { solutionsSectionData, SolutionItem } from '@/lib/db';

export default function SolutionsSection() {
    const items = solutionsSectionData.items;

    return (
        <section className="bg-white py-10 px-6 md:px-12 lg:px-20 relative overflow-hidden">
            <div className="max-w-7xl mx-auto">
                {/* Heading & Subtitle */}
                <div className="text-center max-w-2xl mx-auto mb-20">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#14304f] tracking-tight mb-4">
                        {solutionsSectionData.heading}
                    </h2>
                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                        {solutionsSectionData.subtitle}
                    </p>
                </div>

                {/* Alternating Grid Layout matching the Image Blueprint */}
                <div className="grid grid-cols-1 md:grid-cols-2 ">

                    {/* Row 1: Left Image, Right Card (Power Quality) */}
                    <div className="relative w-full h-[380px] sm:h-[420px]  overflow-hidden shadow-lg bg-gray-100">
                        <Image
                            src={items[0].imageUrl}
                            alt={items[0].title}
                            fill
                            className="object-cover"
                        />
                    </div>
                    <SolutionCard item={items[0]} />

                    {/* Row 2: Left Card (EV Charging), Right Image */}
                    <SolutionCard item={items[1]} />
                    <div className="relative w-full h-[380px] sm:h-[420px]  overflow-hidden shadow-lg bg-gray-100">
                        <Image
                            src={items[1].imageUrl}
                            alt={items[1].title}
                            fill
                            className="object-cover"
                        />
                    </div>

                    {/* Row 3: Left Image, Right Card (Energy Storage) */}
                    <div className="relative w-full h-[380px] sm:h-[420px]  overflow-hidden shadow-lg bg-gray-100">
                        <Image
                            src={items[2].imageUrl}
                            alt={items[2].title}
                            fill
                            className="object-cover"
                        />
                    </div>
                    <SolutionCard item={items[2]} />

                    {/* Row 4: Left Card (Battery Testing), Right Image */}
                    <SolutionCard item={items[3]} />
                    <div className="relative w-full h-[380px] sm:h-[420px]  overflow-hidden shadow-lg bg-gray-100">
                        <Image
                            src={items[3].imageUrl}
                            alt={items[3].title}
                            fill
                            className="object-cover"
                        />
                    </div>

                </div>
            </div>
        </section>
    );
}

function SolutionCard({ item }: { item: SolutionItem }) {
    return (
        <div className="bg-gradient-to-br from-[#12583c] via-[#0d3630] to-[#071322]
  p-8 sm:p-10 text-white shadow-xl flex flex-col items-start justify-center
  gap-6 text-start h-[380px] sm:h-[420px]">
            <div>
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2 text-white">
                    {item.title}
                </h3>
                <h4 className="text-[#3ec06a] font-semibold text-xs sm:text-sm mb-4 tracking-wide">
                    {item.subtitle}
                </h4>
                <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                    {item.description}
                </p>
            </div>

            <div>
                <Link
                    href={`/solutions/${item.slug}`}
                    className="inline-flex items-center gap-2 border border-white/30 hover:border-[#3ec06a] hover:bg-white/10 text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-full transition-all duration-200 group"
                >
                    View More
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
            </div>
        </div>
    );
}