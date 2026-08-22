// app/(main)/brands/[brand]/page.tsx
'use client';

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { use, useState, useMemo } from 'react';
import Image from 'next/image';
import { brandsList, productsList } from '@/lib/productsDb';
import PageHeader from '@/components/pagesComps/PageHeader';
import { Star, ArrowLeft, Zap, Battery, Plug, Wrench, CheckCircle2, Globe, Calendar, MapPin } from 'lucide-react';

interface PageProps {
    params: Promise<{ brand: string }>;
}

export default function BrandDetailPage({ params }: PageProps) {
    const { brand } = use(params);
    const [activeTab, setActiveTab] = useState<'all' | 'chargers' | 'accessories'>('all');

    const brandInfo = brandsList.find(b => b.id === brand);

    if (!brandInfo || brand === 'all') {
        notFound();
    }

    // Brand specific mock overviews
    const brandOverviews: Record<string, { title: string; description: string; founded: string; headquarters: string; website: string }> = {
        'evngen': {
            title: 'EVNGEN Pro - Premium EV Charging Solutions',
            description: 'EVNGEN Pro is a leading manufacturer of premium EV charging solutions, offering innovative, reliable, and high-performance charging infrastructure for residential, commercial, and fleet applications.',
            founded: '2018',
            headquarters: 'California, USA',
            website: 'www.evngenpro.com'
        },
        'gridpower': {
            title: 'GridPower Industrial - Heavy-Duty Infrastructure',
            description: 'GridPower Industrial specializes in heavy-duty, high-power EV charging solutions designed for demanding commercial and industrial environments with exceptional reliability.',
            founded: '2015',
            headquarters: 'Texas, USA',
            website: 'www.gridpower.com'
        },
        'ecocharge': {
            title: 'EcoCharge Home - Sustainable Home Charging',
            description: 'EcoCharge Home is dedicated to making sustainable EV charging accessible for every household, combining sleek Scandinavian design with intelligent home energy features.',
            founded: '2020',
            headquarters: 'Oregon, USA',
            website: 'www.ecocharge.com'
        }
    };

    const overview = brandOverviews[brand] || {
        title: `${brandInfo.name} - Quality EV Solutions`,
        description: `${brandInfo.name} delivers reliable, high-performance EV charging solutions designed for residential, commercial, and industrial deployments.`,
        founded: 'N/A',
        headquarters: 'Global',
        website: 'www.example.com'
    };

    // Filtered lists based on tabs
    const brandProducts = useMemo(() => {
        return productsList.filter(p => p.brand === brand);
    }, [brand]);

    const filteredCatalog = useMemo(() => {
        if (activeTab === 'chargers') return brandProducts.filter(p => p.category !== 'accessories');
        if (activeTab === 'accessories') return brandProducts.filter(p => p.category === 'accessories');
        return brandProducts;
    }, [brandProducts, activeTab]);

    return (
        <div className="bg-[#f8f9fa] min-h-screen">
            {/* Immersive Brand Hero Banner */}
            <section className="relative bg-[#0c1f38] text-white py-20 overflow-hidden border-b border-white/10">
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#3ec06a]/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="max-w-7xl mx-auto relative z-10 space-y-6">
                    <Link
                        href="/ev-chargers"
                        className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-[#3ec06a] hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Catalog
                    </Link>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pt-4">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-white/10 border border-white/20 flex items-center justify-center text-3xl sm:text-4xl font-extrabold text-[#3ec06a] shadow-xl">
                                {brandInfo.name.charAt(0)}
                            </div>
                            <div className="space-y-2">
                                <span className="bg-[#3ec06a]/20 text-[#3ec06a] border border-[#3ec06a]/30 text-[10px] font-extrabold uppercase px-3 py-1 rounded-full">
                                    Verified Brand Partner
                                </span>
                                <h1 className="text-3xl mt-3 sm:text-5xl font-extrabold tracking-tight">
                                    {brandInfo.name}
                                </h1>
                                <p>{overview.title}</p>
                            </div>
                        </div>

                        {/* Metadata Pills */}
                        <div className="flex flex-wrap gap-4 text-xs font-bold text-gray-300">
                            <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-2.5">
                                <Calendar className="w-4 h-4 text-[#3ec06a]" />
                                <span>Est. {overview.founded}</span>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-2.5">
                                <MapPin className="w-4 h-4 text-[#3ec06a]" />
                                <span>{overview.headquarters}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="max-w-7xl mx-auto py-16  space-y-16">

                {/* Brand Story & Mission Card */}
                <div className="space-y-6">
                    <h3 className="text-xl sm:text-2xl font-extrabold text-[#071322]">
                        {overview.title}
                    </h3>
                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed max-w-4xl">
                        {overview.description}
                    </p>
                    <div className="pt-2">
                        <a
                            href={`https://${overview.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-xs font-extrabold text-[#1b7936] hover:text-[#071322] transition-colors"
                        >
                            <Globe className="w-4 h-4" /> Visit Official Website ({overview.website}) →
                        </a>
                    </div>
                </div>

                {/* Product Catalog Section with Navigation Tabs */}
                <div className="space-y-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-6">
                        <div>
                            <h3 className="text-2xl font-extrabold text-[#071322] tracking-tight">
                                Elements & Equipment
                            </h3>
                            <p className="text-xs text-gray-500 font-semibold mt-1">
                                Showing {filteredCatalog.length} available items from {brandInfo.name}
                            </p>
                        </div>

                        {/* Interactive Tab Switcher */}
                        <div className="flex bg-gray-200/70 p-1 rounded-xl text-xs font-bold">
                            <button
                                onClick={() => setActiveTab('all')}
                                className={`px-4 py-2 rounded-lg transition-all ${activeTab === 'all' ? 'bg-white text-[#071322] shadow-xs' : 'text-gray-600 hover:text-black'}`}
                            >
                                All Items ({brandProducts.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('chargers')}
                                className={`px-4 py-2 rounded-lg transition-all ${activeTab === 'chargers' ? 'bg-white text-[#071322] shadow-xs' : 'text-gray-600 hover:text-black'}`}
                            >
                                Chargers
                            </button>
                            <button
                                onClick={() => setActiveTab('accessories')}
                                className={`px-4 py-2 rounded-lg transition-all ${activeTab === 'accessories' ? 'bg-white text-[#071322] shadow-xs' : 'text-gray-600 hover:text-black'}`}
                            >
                                Accessories
                            </button>
                        </div>
                    </div>

                    {/* Products Grid */}
                    {filteredCatalog.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 space-y-3">
                            <div className="text-4xl">🔌</div>
                            <h4 className="text-lg font-bold text-[#071322]">No items found in this category</h4>
                            <p className="text-gray-500 text-xs">Try selecting a different filter tab above.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredCatalog.map((product) => (
                                <div
                                    key={product.id}
                                    className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
                                >
                                    {/* Thumbnail with Category Badge */}
                                    <Link href={`/ev-chargers/${product.id}`} className="block relative h-56 overflow-hidden bg-[#f8f9fa]">
                                        <Image
                                            src={product.imageUrl}
                                            alt={product.name}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute top-3 left-3">
                                            <span className="bg-[#1b7936] text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                                                {product.categoryLabel}
                                            </span>
                                        </div>
                                    </Link>

                                    {/* Product Info - Simple Layout */}
                                    <div className="p-5 space-y-3 flex-1 flex flex-col">
                                        {/* Product Name */}
                                        <Link href={`/ev-chargers/${product.id}`}>
                                            <h4 className="text-lg font-extrabold text-[#071322] group-hover:text-[#1b7936] transition-colors leading-tight">
                                                {product.name}
                                            </h4>
                                        </Link>

                                        {/* Model */}
                                        <p className="text-xs text-gray-400 font-bold">
                                            Model: {product.model}
                                        </p>

                                        {/* Specs List - Simple Bullet Points */}
                                        <div className="space-y-1.5 pt-1">
                                            {product.specs.slice(0, 4).map((spec, idx) => (
                                                <div key={idx} className="flex items-start gap-2 text-xs text-gray-600">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#3ec06a] mt-1.5 flex-shrink-0"></span>
                                                    <span className="leading-snug">{spec}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Action Button */}
                                        <div className="pt-4 mt-auto">
                                            <Link
                                                href={`/ev-chargers/${product.id}`}
                                                className="block w-full text-center bg-[#1b7936] hover:bg-[#155f2b] text-white font-bold text-sm py-3 rounded-xl transition-all shadow-sm"
                                            >
                                                View Technical Details
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}