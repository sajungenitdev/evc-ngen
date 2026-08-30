// app/(main)/brands/page.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import PageHeader from '@/components/pagesComps/PageHeader';
import { Star, Zap, Battery, Plug, Wrench, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

interface Brand {
    _id: string;
    id: string;
    name: string;
    slug: string;
    description: string;
    icon: string;
    logo: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

interface Product {
    _id: string;
    id: string;
    name: string;
    brand: string;
    imageUrl: string;
    rating: number;
    model: string;
    price: number;
    category: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function BrandsPage() {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // ============================================
    // Fetch Brands from API
    // ============================================
    useEffect(() => {
        const fetchBrands = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/brands`);
                const data = await response.json();
                if (data.success) {
                    const activeBrands = data.data.filter((b: Brand) => b.isActive !== false);
                    setBrands(activeBrands);
                } else {
                    toast.error(data.message || 'Failed to load brands');
                }
            } catch (error) {
                console.error('Failed to fetch brands:', error);
                toast.error('Failed to load brands');
            }
        };

        fetchBrands();
    }, []);

    // ============================================
    // Fetch Products from API
    // ============================================
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/products`);
                const data = await response.json();
                if (data.success) {
                    setProducts(data.data || []);
                }
            } catch (error) {
                console.error('Failed to fetch products:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // ============================================
    // Helper Functions
    // ============================================
    const getBrandProducts = (brandId: string) => {
        return products.filter(p => p.brand === brandId);
    };

    const getBrandIcon = (brandName: string) => {
        const icons: Record<string, any> = {
            'evngen': Zap,
            'gridpower': Battery,
            'ecocharge': Plug,
        };
        const lowerName = brandName.toLowerCase();
        for (const [key, icon] of Object.entries(icons)) {
            if (lowerName.includes(key)) {
                return icon;
            }
        }
        return Wrench;
    };

    const getBrandColor = (brandName: string) => {
        const colors: Record<string, string> = {
            'evngen': 'bg-[#0c1f38]',
            'gridpower': 'bg-[#1f7a3d]',
            'ecocharge': 'bg-[#12946b]',
        };
        const lowerName = brandName.toLowerCase();
        for (const [key, color] of Object.entries(colors)) {
            if (lowerName.includes(key)) {
                return color;
            }
        }
        return 'bg-[#0c1f38]';
    };

    // ============================================
    // Loading State
    // ============================================
    if (isLoading) {
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
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-24">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="animate-pulse bg-white border border-gray-200 rounded-2xl overflow-hidden">
                                <div className="bg-gray-200 p-6 h-28"></div>
                                <div className="p-6 space-y-3">
                                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4].map((j) => (
                                            <div key={j} className="w-10 h-10 rounded-full bg-gray-200"></div>
                                        ))}
                                    </div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        );
    }

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

            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-24">
                {/* Brands Grid */}
                {brands.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">🏷️</div>
                        <h3 className="text-2xl font-extrabold text-[#071322]">No Brands Found</h3>
                        <p className="text-gray-500 text-sm mt-2">No brands are currently available.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {brands.map((brand) => {
                            const brandProducts = getBrandProducts(brand.id);
                            const Icon = getBrandIcon(brand.name);
                            const colorClass = getBrandColor(brand.name);
                            const totalProducts = brandProducts.length;
                            const avgRating = brandProducts.length > 0
                                ? brandProducts.reduce((acc, p) => acc + (p.rating || 0), 0) / brandProducts.length
                                : 0;

                            return (
                                <Link
                                    key={brand._id || brand.id}
                                    href={`/brands/${brand.id}`}
                                    className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                                >
                                    {/* Brand Header */}
                                    <div className={`${colorClass} p-6 flex items-center justify-between`}>
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl">
                                                {brand.icon || <Icon className="w-7 h-7 text-white" />}
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-extrabold text-white">
                                                    {brand.name}
                                                </h3>
                                                <p className="text-white/70 text-xs font-medium">
                                                    {totalProducts} {totalProducts === 1 ? 'Product' : 'Products'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-white/50 group-hover:text-white transition-colors">
                                            <ArrowRight className="w-5 h-5" />
                                        </div>
                                    </div>

                                    {/* Brand Description */}
                                    {brand.description && (
                                        <div className="px-6 pt-4">
                                            <p className="text-gray-500 text-xs line-clamp-2">
                                                {brand.description}
                                            </p>
                                        </div>
                                    )}

                                    {/* Brand Stats */}
                                    <div className="p-6 space-y-3">
                                        <div className="flex items-center gap-4 text-sm">
                                            <div className="flex items-center gap-1">
                                                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                                <span className="font-bold text-[#071322]">
                                                    {avgRating > 0 ? avgRating.toFixed(1) : 'N/A'}
                                                </span>
                                                <span className="text-gray-400 text-xs">
                                                    ({totalProducts} {totalProducts === 1 ? 'review' : 'reviews'})
                                                </span>
                                            </div>
                                            <span className="text-gray-300">|</span>
                                            <span className="text-gray-500 text-xs">
                                                {totalProducts} Products
                                            </span>
                                        </div>

                                        {/* Product Preview */}
                                        {totalProducts > 0 && (
                                            <div className="flex -space-x-2">
                                                {brandProducts.slice(0, 4).map((product) => (
                                                    <div
                                                        key={product._id || product.id}
                                                        className="w-10 h-10 rounded-full border-2 border-white bg-[#f8f9fa] overflow-hidden"
                                                    >
                                                        {product.imageUrl ? (
                                                            <Image
                                                                src={product.imageUrl}
                                                                alt={product.name}
                                                                width={40}
                                                                height={40}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-xs bg-gray-100">
                                                                {product.name?.charAt(0) || 'P'}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                                {totalProducts > 4 && (
                                                    <div className="w-10 h-10 rounded-full border-2 border-white bg-[#f8f9fa] flex items-center justify-center text-xs font-bold text-gray-500">
                                                        +{totalProducts - 4}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className="pt-2 text-[#1b7936] font-semibold text-sm group-hover:underline inline-flex items-center gap-1">
                                            View All Products
                                            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}

                {/* Stats Section */}
                {brands.length > 0 && (
                    <div className="mt-16 bg-[#f8f9fa] rounded-3xl p-8 text-center border border-gray-200">
                        <h3 className="text-2xl font-extrabold text-[#071322]">
                            {brands.length} Trusted {brands.length === 1 ? 'Brand' : 'Brands'}
                        </h3>
                        <p className="text-gray-500 text-sm mt-2 max-w-2xl mx-auto">
                            We partner with leading manufacturers to bring you the best EV charging solutions on the market.
                        </p>
                    </div>
                )}
            </section>
        </div>
    );
}