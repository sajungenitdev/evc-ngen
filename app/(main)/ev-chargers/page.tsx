// app/(main)/ev-chargers/page.tsx
'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { productsList, productCategories, brandsList, getProductPrice, getProductRating } from '@/lib/productsDb';
import PageHeader from '@/components/pagesComps/PageHeader';
import {
    Star,
    Zap,
    Battery,
    Plug,
    Wrench,
    Search,
    X,
    ArrowRight
} from 'lucide-react';

export default function EVChargersPage() {
    const searchParams = useSearchParams();
    const categoryParam = searchParams.get('category');

    // ==========================================
    // STATE MANAGEMENT
    // ==========================================
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('featured');

    // ==========================================
    // EFFECT - URL থেকে ক্যাটাগরি সেট করুন
    // ==========================================
    useEffect(() => {
        if (categoryParam) {
            const validCategories = ['ac-chargers', 'dc-chargers', 'accessories', 'storage'];
            if (validCategories.includes(categoryParam)) {
                setActiveTab(categoryParam);
            }
        }
    }, [categoryParam]);

    // Get products by category for tabs
    const getCategoryProducts = (categoryId: string) => {
        if (categoryId === 'all') return productsList;
        return productsList.filter(p => p.category === categoryId);
    };

    // Tab configuration with icons
    const tabs = [
        { id: 'all', label: 'All', icon: Battery, count: productsList.length },
        { id: 'ac-chargers', label: 'AC Chargers', icon: Plug, count: productsList.filter(p => p.category === 'ac-chargers').length },
        { id: 'dc-chargers', label: 'DC Chargers', icon: Zap, count: productsList.filter(p => p.category === 'dc-chargers').length },
        { id: 'accessories', label: 'Accessories', icon: Wrench, count: productsList.filter(p => p.category === 'accessories').length },
    ];

    // Filter and sort products
    const filteredProducts = useMemo(() => {
        let products = getCategoryProducts(activeTab);

        // Search filter
        if (searchQuery) {
            products = products.filter(p =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.model.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        return products;
    }, [activeTab, searchQuery]);

    // Sort products
    const sortedProducts = useMemo(() => {
        const sorted = [...filteredProducts];
        switch (sortBy) {
            case 'price-low':
                return sorted.sort((a, b) => getProductPrice(a.id) - getProductPrice(b.id));
            case 'price-high':
                return sorted.sort((a, b) => getProductPrice(b.id) - getProductPrice(a.id));
            case 'name':
                return sorted.sort((a, b) => a.name.localeCompare(b.name));
            case 'rating':
                return sorted.sort((a, b) => getProductRating(b.id) - getProductRating(a.id));
            default:
                return sorted;
        }
    }, [filteredProducts, sortBy]);

    // Clear search
    const clearSearch = () => {
        setSearchQuery('');
    };

    return (
        <div className="bg-white min-h-screen">
            {/* Page Header */}
            <PageHeader
                breadcrumbs={[
                    { label: 'Home', link: '/' },
                    { label: 'EV Chargers' }
                ]}
                imageUrl="/images/help/evchargers-2048px-4445-2x1-1.webp"
                title="EV Chargers"
                description="From compact home wallboxes to high-power DC fast chargers, our full lineup covers 7kW to 1280kW — built for residential, commercial, and fleet applications."
            />

            {/* Main Content Container */}
            <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-10">

                {/* ========================================== */}
                {/* SEARCH BAR                                  */}
                {/* ========================================== */}
                <div className="mb-8">
                    <div className="relative max-w-2xl mx-auto">
                        <input
                            type="text"
                            placeholder="Search by product name or model..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#f8f9fa] border border-gray-200 rounded-2xl px-5 py-3.5 pl-12 text-sm focus:outline-none focus:border-[#1b7936] transition-colors"
                        />
                        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        {searchQuery && (
                            <button
                                onClick={clearSearch}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* ========================================== */}
                {/* TABS NAVIGATION - NEW DESIGN                */}
                {/* ========================================== */}
                <div className="mb-10">
                    <div className="flex flex-wrap gap-1.5">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                                        flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-full transition-all
                                        ${isActive
                                            ? 'bg-[#1b7936] text-white shadow-md shadow-[#1b7936]/20'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }
                                    `}
                                >
                                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                                    {tab.label}
                                    <span className={`
                                        text-xs px-2 py-0.5 rounded-full
                                        ${isActive
                                            ? 'bg-white/20 text-white'
                                            : 'bg-gray-200 text-gray-500'
                                        }
                                    `}>
                                        {tab.count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ========================================== */}
                {/* TOOLBAR - Results Count & Sort             */}
                {/* ========================================== */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <p className="text-sm text-gray-600">
                        Showing <span className="font-extrabold text-[#071322]">{sortedProducts.length}</span> products
                        {activeTab !== 'all' && (
                            <span className="text-gray-400 ml-1">
                                in {tabs.find(t => t.id === activeTab)?.label}
                            </span>
                        )}
                    </p>

                    <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500 font-semibold hidden sm:inline">Sort by:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-[#f8f9fa] border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-[#071322] focus:outline-none focus:border-[#1b7936]"
                        >
                            <option value="featured">Featured Order</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                            <option value="name">Alphabetical (A-Z)</option>
                            <option value="rating">Top Rated</option>
                        </select>
                    </div>
                </div>

                {/* ========================================== */}
                {/* PRODUCT CARDS GRID                         */}
                {/* ========================================== */}
                {sortedProducts.length === 0 ? (
                    <div className="text-center py-24 bg-gray-50 rounded-3xl border border-dashed border-gray-200 space-y-4">
                        <div className="text-6xl">🔌</div>
                        <h3 className="text-2xl font-extrabold text-[#071322]">No products found</h3>
                        <p className="text-gray-500 text-sm max-w-sm mx-auto">
                            {searchQuery
                                ? `No results found for "${searchQuery}". Try adjusting your search.`
                                : `No products available in ${tabs.find(t => t.id === activeTab)?.label}.`}
                        </p>
                        {(searchQuery || activeTab !== 'all') && (
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setActiveTab('all');
                                }}
                                className="bg-[#1b7936] text-white text-sm font-bold px-6 py-2.5 rounded-xl hover:bg-[#155f2b] transition-colors"
                            >
                                View All Products
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                        {sortedProducts.map((product) => {
                            const rating = getProductRating(product.id);
                            const price = getProductPrice(product.id);
                            return (
                                <div
                                    key={product.id}
                                    className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
                                >
                                    {/* Product Thumbnail */}
                                    <Link href={`/ev-chargers/${product.id}`} className="block relative h-52 overflow-hidden bg-[#f8f9fa]">
                                        <Image
                                            src={product.imageUrl}
                                            alt={product.name}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute top-3 left-3 flex flex-col gap-1">
                                            <span className="bg-[#1b7936] text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                                                {product.categoryLabel}
                                            </span>
                                        </div>
                                        <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                                            ${price}
                                        </div>
                                    </Link>

                                    {/* Product Details */}
                                    <div className="p-5 space-y-3">
                                        <div className="flex items-center gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-3.5 h-3.5 ${i < Math.floor(rating)
                                                        ? 'text-yellow-400 fill-yellow-400'
                                                        : 'text-gray-200'
                                                        }`}
                                                />
                                            ))}
                                            <span className="text-[11px] text-gray-400 font-semibold ml-1">({rating})</span>
                                        </div>

                                        <Link href={`/ev-chargers/${product.id}`}>
                                            <h3 className="text-base font-extrabold text-[#071322] group-hover:text-[#1b7936] transition-colors line-clamp-2">
                                                {product.name}
                                            </h3>
                                        </Link>
                                        <p className="text-xs text-gray-400 font-bold">Model: {product.model}</p>

                                        {/* Key Specs */}
                                        <div className="space-y-1.5 pt-1">
                                            {product.specs.slice(0, 2).map((spec, idx) => (
                                                <div key={idx} className="flex items-start gap-2 text-xs text-gray-600 font-medium">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#3ec06a] mt-1.5 flex-shrink-0"></span>
                                                    <span className="line-clamp-1">{spec}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Action Button */}
                                        <Link
                                            href={`/ev-chargers/${product.id}`}
                                            className="block w-full text-center bg-[#1b7936] hover:bg-[#155f2b] text-white font-bold text-sm py-3 rounded-xl transition-all"
                                        >
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ========================================== */}
                {/* VIEW ALL CATEGORIES LINK                   */}
                {/* ========================================== */}
                <div className="mt-12 text-center">
                    <Link
                        href="/categories"
                        className="inline-flex items-center gap-2 text-[#1b7936] font-semibold hover:underline"
                    >
                        Browse All Categories <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>

            {/* ========================================== */}
            {/* BOTTOM CTA SECTION                         */}
            {/* ========================================== */}
            <section className="bg-[#f8f9fa] py-16 px-6 md:px-12 border-t border-gray-200">
                <div className="max-w-4xl mx-auto text-center space-y-4">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-[#071322]">
                        Need Help Choosing the Right Charger?
                    </h2>
                    <p className="text-gray-600 text-sm max-w-xl mx-auto leading-relaxed">
                        Our engineering team can assist you with power load sizing, site surveys, and OCPP protocol configuration.
                    </p>
                    <Link
                        href="/contact"
                        className="inline-block bg-[#1b7936] text-white px-8 py-3.5 rounded-xl font-bold text-sm hover:bg-[#155f2b] transition-colors shadow-md"
                    >
                        Contact Our Team
                    </Link>
                </div>
            </section>
        </div>
    );
}