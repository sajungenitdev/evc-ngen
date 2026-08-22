// app/(main)/brands/page.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { brandsList, productsList } from '@/lib/productsDb';
import PageHeader from '@/components/pagesComps/PageHeader';
import { Star, Zap, Battery, Plug, Wrench } from 'lucide-react';

export default function BrandsPage() {
    // Get products by brand
    const getBrandProducts = (brandId: string) => {
        return productsList.filter(p => p.brand === brandId);
    };

    // Get brand icon
    const getBrandIcon = (brandId: string) => {
        const icons: Record<string, any> = {
            'evngen': Zap,
            'gridpower': Battery,
            'ecocharge': Plug,
        };
        const Icon = icons[brandId] || Wrench;
        return Icon;
    };

    // Get brand color
    const getBrandColor = (brandId: string) => {
        const colors: Record<string, string> = {
            'evngen': 'bg-[#0c1f38]',
            'gridpower': 'bg-[#1f7a3d]',
            'ecocharge': 'bg-[#12946b]',
        };
        return colors[brandId] || 'bg-[#0c1f38]';
    };

    const activeBrands = brandsList.filter(b => b.id !== 'all');

    return (
        <div className="bg-white min-h-screen">
            <PageHeader
                breadcrumbs={[
                    { label: 'Home', link: '/' },
                    { label: 'Brands' }
                ]}
                imageUrl="/images/help/evchargers-2048px-4445-2x1-1.webp"
                title="Our Brands"
                description="Discover high-quality charging solutions from our trusted brand partners."
            />

            <section className="max-w-7xl mx-auto py-12 pb-24">
                {/* Brands Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {activeBrands.map((brand) => {
                        const brandProducts = getBrandProducts(brand.id);
                        const Icon = getBrandIcon(brand.id);
                        const colorClass = getBrandColor(brand.id);
                        const totalProducts = brandProducts.length;
                        const avgRating = brandProducts.reduce((acc, p) => acc + p.rating, 0) / (totalProducts || 1);

                        return (
                            <Link
                                key={brand.id}
                                href={`/brands/${brand.id}`}
                                className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                            >
                                {/* Brand Header */}
                                <div className={`${colorClass} p-6 flex items-center justify-between`}>
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl">
                                            <Icon className="w-7 h-7 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-extrabold text-white">
                                                {brand.name}
                                            </h3>
                                            <p className="text-white/70 text-xs font-medium">
                                                {totalProducts} Products
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-white/50 group-hover:text-white transition-colors">
                                        →
                                    </div>
                                </div>

                                {/* Brand Stats */}
                                <div className="p-6 space-y-3">
                                    <div className="flex items-center gap-4 text-sm">
                                        <div className="flex items-center gap-1">
                                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                            <span className="font-bold text-[#071322]">
                                                {avgRating.toFixed(1)}
                                            </span>
                                            <span className="text-gray-400 text-xs">
                                                ({totalProducts} reviews)
                                            </span>
                                        </div>
                                        <span className="text-gray-300">|</span>
                                        <span className="text-gray-500 text-xs">
                                            {totalProducts} Products
                                        </span>
                                    </div>

                                    {/* Product Preview */}
                                    <div className="flex -space-x-2">
                                        {brandProducts.slice(0, 4).map((product) => (
                                            <div
                                                key={product.id}
                                                className="w-10 h-10 rounded-full border-2 border-white bg-[#f8f9fa] overflow-hidden"
                                            >
                                                <Image
                                                    src={product.imageUrl}
                                                    alt={product.name}
                                                    width={40}
                                                    height={40}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ))}
                                        {totalProducts > 4 && (
                                            <div className="w-10 h-10 rounded-full border-2 border-white bg-[#f8f9fa] flex items-center justify-center text-xs font-bold text-gray-500">
                                                +{totalProducts - 4}
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-2 text-[#1b7936] font-semibold text-sm group-hover:underline">
                                        View All Products →
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* Stats Section */}
                <div className="mt-16 bg-[#f8f9fa] rounded-3xl p-8 text-center border border-gray-200">
                    <h3 className="text-2xl font-extrabold text-[#071322]">
                        {activeBrands.length} Trusted Brands
                    </h3>
                    <p className="text-gray-500 text-sm mt-2 max-w-2xl mx-auto">
                        We partner with leading manufacturers to bring you the best EV charging solutions on the market.
                    </p>
                </div>
            </section>
        </div>
    );
}