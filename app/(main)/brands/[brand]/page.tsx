// app/(main)/brands/[brand]/page.tsx
'use client';

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { use, useState, useEffect, useMemo } from 'react';
import PageHeader from '@/components/pagesComps/PageHeader';
import { Star, ArrowLeft, Zap, Battery, Plug, Wrench, CheckCircle2, Globe, Calendar, MapPin, Loader2, AdIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { getImageUrl, isDefaultImage } from '@/utils/imageHelper';

// ============================================
// Types
// ============================================
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
    model: string;
    category: string;
    categoryLabel: string;
    specs: string[];
    imageUrl: string;
    rating: number;
    price: number;
    isActive: boolean;
}

interface PageProps {
    params: Promise<{ brand: string }>;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const IMAGE_BASE_URL = API_BASE_URL.replace(/\/api$/, '');

// ============================================
// Product Thumbnail Component
// ============================================
interface ProductThumbnailProps {
    imageUrl: string;
    name: string;
    className?: string;
}

const ProductThumbnail: React.FC<ProductThumbnailProps> = ({
    imageUrl,
    name,
    className = ''
}) => {
    const [hasError, setHasError] = useState<boolean>(false);

    const getFullUrl = (path: string): string | null => {
        if (!path || path.trim() === '') return null;
        const trimmed = path.trim();

        if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
            return trimmed;
        }

        if (trimmed.startsWith('/uploads')) {
            return `${IMAGE_BASE_URL}${trimmed}`;
        }

        return `${IMAGE_BASE_URL}/uploads/products/${trimmed}`;
    };

    const fullUrl = getFullUrl(imageUrl);

    const showFallback = !imageUrl || hasError || !fullUrl || isDefaultImage(imageUrl);

    if (showFallback) {
        return (
            <div className={`w-full h-full flex items-center justify-center bg-gray-100 ${className}`}>
                <span className="text-2xl">⚡</span>
            </div>
        );
    }

    return (
        <img
            src={fullUrl}
            alt={name}
            className={`w-full h-full object-cover ${className}`}
            onError={(e) => {
                console.error('❌ Failed to load image:', fullUrl);
                setHasError(true);
                e.currentTarget.style.display = 'none';
            }}
            loading="lazy"
        />
    );
};

// ============================================
// Helper: Get Clean Slug
// ============================================
const getCleanSlug = (productId: string) => {
    if (!productId) return 'product';
    const parts = productId.split('-');
    const lastPart = parts[parts.length - 1];
    if (/^\d+$/.test(lastPart)) {
        return parts.slice(0, -1).join('-');
    }
    return productId;
};

// ============================================
// Get Brand Overview Info
// ============================================
const getBrandOverview = (brandName: string) => {
    const overviews: Record<string, { founded: string; headquarters: string; website: string }> = {
        'evngen': {
            founded: '2018',
            headquarters: 'California, USA',
            website: 'www.evngenpro.com'
        },
        'gridpower': {
            founded: '2015',
            headquarters: 'Texas, USA',
            website: 'www.gridpower.com'
        },
        'ecocharge': {
            founded: '2020',
            headquarters: 'Oregon, USA',
            website: 'www.ecocharge.com'
        }
    };
    const lowerName = brandName.toLowerCase();
    for (const [key, value] of Object.entries(overviews)) {
        if (lowerName.includes(key)) {
            return value;
        }
    }
    return {
        founded: 'N/A',
        headquarters: 'Global',
        website: 'www.example.com'
    };
};

// ============================================
// Get Brand Icon
// ============================================
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

export default function BrandDetailPage({ params }: PageProps) {
    const { brand } = use(params);
    const [activeTab, setActiveTab] = useState<'all' | 'chargers' | 'accessories'>('all');
    const [brandInfo, setBrandInfo] = useState<Brand | null>(null);
    const [brandProducts, setBrandProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isProductsLoading, setIsProductsLoading] = useState(true);

    // ============================================
    // Fetch Brand Details - FIXED
    // ============================================
    useEffect(() => {
        const fetchBrand = async () => {
            try {
                setIsLoading(true);

                const response = await fetch(`${API_BASE_URL}/brands/${brand}`);
                const data = await response.json();

                if (data.success && data.data) {
                    setBrandInfo(data.data);
                    setIsLoading(false);
                    return;
                }

                // If brand not found, try to find by slug from all brands
                const allBrandsRes = await fetch(`${API_BASE_URL}/brands`);
                const allBrandsData = await allBrandsRes.json();

                if (allBrandsData.success && Array.isArray(allBrandsData.data)) {
                    const found = allBrandsData.data.find(
                        (b: any) => b.slug === brand || b.id === brand
                    );
                    if (found) {
                        setBrandInfo(found);
                        setIsLoading(false);
                        return;
                    }
                }

                // Brand not found
                toast.error('Brand not found');
                setIsLoading(false);
                notFound();

            } catch (error) {
                console.error('Failed to fetch brand:', error);
                toast.error('Failed to load brand');
                setIsLoading(false);
                notFound();
            }
        };

        if (brand) {
            fetchBrand();
        }
    }, [brand]);

    // ============================================
    // Fetch Products by Brand
    // ============================================
    useEffect(() => {
        const fetchProducts = async () => {
            if (!brandInfo) return;

            setIsProductsLoading(true);
            try {
                // Use the brand's id (which is the slug) to fetch products
                const brandId = brandInfo.id || brandInfo._id;
                const response = await fetch(`${API_BASE_URL}/products?brand=${brandId}&limit=1000`);
                const data = await response.json();

                if (data.success) {
                    setBrandProducts(data.data || []);
                } else {
                    // Fallback: try using the brand name
                    const fallbackResponse = await fetch(`${API_BASE_URL}/products?brand=${brandInfo.name}&limit=1000`);
                    const fallbackData = await fallbackResponse.json();
                    if (fallbackData.success) {
                        setBrandProducts(fallbackData.data || []);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch products:', error);
                setBrandProducts([]);
            } finally {
                setIsProductsLoading(false);
            }
        };

        if (brandInfo) {
            fetchProducts();
        }
    }, [brandInfo]);

    // ============================================
    // Filter Products by Tab
    // ============================================
    const filteredCatalog = useMemo(() => {
        if (activeTab === 'chargers') {
            return brandProducts.filter(p => p.category !== 'accessories' && p.category !== 'storage');
        }
        if (activeTab === 'accessories') {
            return brandProducts.filter(p => p.category === 'accessories' || p.category === 'storage');
        }
        return brandProducts;
    }, [brandProducts, activeTab]);

    // ============================================
    // Loading State
    // ============================================
    if (isLoading) {
        return (
            <div className="bg-[#f8f9fa] min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-[#1b7936] animate-spin mx-auto" />
                    <p className="text-gray-500 text-sm mt-4">Loading brand details...</p>
                </div>
            </div>
        );
    }

    if (!brandInfo) {
        notFound();
    }

    const overview = getBrandOverview(brandInfo.name);
    const Icon = getBrandIcon(brandInfo.name);
    const totalProducts = brandProducts.length;

    return (
        <div className="bg-[#f8f9fa] min-h-screen">
            {/* Immersive Brand Hero Banner */}
            <section className="relative bg-[#0c1f38] text-white py-20 overflow-hidden border-b border-white/10">
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#3ec06a]/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
                    <Link
                        href="/brands"
                        className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-[#3ec06a] hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Brands
                    </Link>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pt-4">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-white/10 border border-white/20 flex items-center justify-center text-3xl sm:text-4xl font-extrabold text-[#3ec06a] shadow-xl">
                                {brandInfo.icon || <AdIcon className="w-10 h-10 text-[#3ec06a]" />}
                            </div>
                            <div className="space-y-2">
                                <span className="bg-[#3ec06a]/20 text-[#3ec06a] border border-[#3ec06a]/30 text-[10px] font-extrabold uppercase px-3 py-1 rounded-full">
                                    Verified Brand Partner
                                </span>
                                <h1 className="text-3xl mt-3 sm:text-5xl font-extrabold tracking-tight">
                                    {brandInfo.name}
                                </h1>
                                <p className="text-white/80 text-sm">{brandInfo.description || `${brandInfo.name} - EV charging solutions`}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
                {/* Brand Story & Mission Card */}
                <div className="space-y-6">
                    <h3 className="text-xl sm:text-2xl font-extrabold text-[#071322]">
                        {brandInfo.description ? `${brandInfo.name} - Premium EV Charging Solutions` : `About ${brandInfo.name}`}
                    </h3>
                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed max-w-4xl">
                        {brandInfo.description || `${brandInfo.name} delivers reliable, high-performance EV charging solutions designed for residential, commercial, and industrial deployments.`}
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
                                {isProductsLoading ? 'Loading products...' : `Showing ${filteredCatalog.length} available items from ${brandInfo.name}`}
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

                    {/* Products Grid with ProductThumbnail */}
                    {isProductsLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="bg-white border border-gray-200 rounded-2xl overflow-hidden animate-pulse">
                                    <div className="h-56 bg-gray-200"></div>
                                    <div className="p-5 space-y-3">
                                        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                        <div className="space-y-2">
                                            <div className="h-3 bg-gray-200 rounded w-full"></div>
                                            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filteredCatalog.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 space-y-3">
                            <div className="text-4xl">🔌</div>
                            <h4 className="text-lg font-bold text-[#071322]">No items found in this category</h4>
                            <p className="text-gray-500 text-xs">Try selecting a different filter tab above.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredCatalog.map((product) => (
                                <div
                                    key={product._id || product.id}
                                    className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
                                >
                                    {/* Thumbnail with ProductThumbnail */}
                                    <Link href={`/ev-chargers/${getCleanSlug(product.id || product.name)}`} className="block relative h-56 overflow-hidden bg-[#f8f9fa]">
                                        <ProductThumbnail
                                            imageUrl={product.imageUrl}
                                            name={product.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute top-3 left-3">
                                            <span className="bg-[#1b7936] text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                                                {product.categoryLabel || product.category}
                                            </span>
                                        </div>
                                    </Link>

                                    {/* Product Info */}
                                    <div className="p-5 space-y-3 flex-1 flex flex-col">
                                        {/* Product Name */}
                                        <Link href={`/ev-chargers/${getCleanSlug(product.id || product.name)}`}>
                                            <h4 className="text-lg font-extrabold text-[#071322] group-hover:text-[#1b7936] transition-colors leading-tight">
                                                {product.name}
                                            </h4>
                                        </Link>

                                        {/* Model */}
                                        <p className="text-xs text-gray-400 font-bold">
                                            Model: {product.model || 'N/A'}
                                        </p>

                                        {/* Specs List */}
                                        {product.specs && product.specs.length > 0 && (
                                            <div className="space-y-1.5 pt-1">
                                                {product.specs.slice(0, 4).map((spec, idx) => (
                                                    <div key={idx} className="flex items-start gap-2 text-xs text-gray-600">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-[#3ec06a] mt-1.5 flex-shrink-0"></span>
                                                        <span className="leading-snug">{spec}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Action Button */}
                                        <div className="pt-4 mt-auto">
                                            <Link
                                                href={`/ev-chargers/${getCleanSlug(product.id || product.name)}`}
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