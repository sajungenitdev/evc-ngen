// app/(main)/ev-chargers/page.tsx
'use client';

import { useState, useMemo, useEffect, Suspense, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import PageHeader from '@/components/pagesComps/PageHeader';
import {
    Star,
    Zap,
    Battery,
    Plug,
    Wrench,
    Search,
    X,
    ArrowRight,
    Loader2,
    Grid3x3,
    LucideIcon
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getImageUrl, isDefaultImage } from '@/utils/imageHelper';

// ============================================
// TYPES
// ============================================
interface Product {
    _id: string;
    id: string;
    name: string;
    model: string;
    brand: string;
    brandDetails?: {
        id: string;
        name: string;
        icon: string;
    };
    category: string;
    categoryDetails?: {
        id: string;
        name: string;
        icon: string;
    };
    categoryLabel: string;
    specs: string[];
    features: string[];
    imageUrl: string;
    galleryImages: string[];
    price: number;
    rating: number;
    stock: number;
    isActive: boolean;
    shortDescription: string;
    description: string;
    technicalDetails: {
        powerOutput: string;
        inputVoltage: string;
        connectorType: string;
        dimensions: string;
        weight: string;
        enclosureRating: string;
        warranty: string;
    };
    createdAt: string;
    updatedAt: string;
}

interface Category {
    _id: string;
    id: string;
    name: string;
    slug: string;
    icon: string;
    description: string;
    productCount: number;
    isActive: boolean;
    order: number;
}

interface Accessory {
    _id: string;
    id: string;
    name: string;
    model: string;
    brand: string;
    category: string;
    categoryLabel: string;
    specs: string[];
    imageUrl: string;
    price: number;
    rating: number;
    isActive: boolean;
    accessoryType: string;
}

// ============================================
// ICON MAP
// ============================================
const iconMap: Record<string, LucideIcon> = {
    'Battery': Battery,
    'Plug': Plug,
    'Zap': Zap,
    'Wrench': Wrench,
    '📂': Grid3x3,
    '⚡': Zap,
    '🔌': Plug,
    '🔋': Battery,
    '🔧': Wrench,
};

const getIconComponent = (iconName: string): LucideIcon => {
    if (!iconName) return Grid3x3;
    if (iconName in iconMap) {
        return iconMap[iconName];
    }
    const lowerName = iconName.toLowerCase();
    for (const [key, value] of Object.entries(iconMap)) {
        if (lowerName.includes(key.toLowerCase())) {
            return value;
        }
    }
    return Grid3x3;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const UPLOAD_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || 'http://localhost:5000';

// ============================================
// LOADING COMPONENT
// ============================================
function LoadingFallback() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="text-center">
                <Loader2 className="animate-spin h-12 w-12 text-[#1b7936] mx-auto" />
                <p className="text-gray-500 mt-4 text-sm">Loading chargers...</p>
            </div>
        </div>
    );
}
// app/(main)/ev-chargers/page.tsx - Updated ProductImage

// ============================================
// OPTIMIZED IMAGE COMPONENT
// ============================================
const ProductImage = ({
    src,
    alt,
    className,
    priority = false
}: {
    src: string;
    alt: string;
    className?: string;
    priority?: boolean;
}) => {
    const [imgError, setImgError] = useState(false);
    const [fullUrl, setFullUrl] = useState<string | null>(null);

    useEffect(() => {
        if (src) {
            const url = getImageUrl(src);
            setFullUrl(url);
            setImgError(false);
        } else {
            setFullUrl(null);
        }
    }, [src]);

    // Show fallback while loading or if no image
    if (!fullUrl || imgError) {
        return (
            <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300 bg-gray-100">
                <span className="text-4xl">⚡</span>
            </div>
        );
    }

    return (
        <Image
            src={fullUrl}
            alt={alt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={className || 'object-cover group-hover:scale-105 transition-transform duration-500'}
            loading={priority ? 'eager' : 'lazy'}
            priority={priority}
            onError={() => {
                console.error('❌ Failed to load image:', fullUrl);
                setImgError(true);
            }}
            unoptimized={true}
        />
    );
};

// ============================================
// CONTENT COMPONENT
// ============================================
function EVChargersContent() {
    const searchParams = useSearchParams();
    const categoryParam = searchParams.get('category');

    // ============================================
    // STATE
    // ============================================
    const [products, setProducts] = useState<Product[]>([]);
    const [accessories, setAccessories] = useState<Accessory[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('featured');
    const [isDataReady, setIsDataReady] = useState(false);

    // ============================================
    // FETCH DATA - Parallel fetching for speed
    // ============================================
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setIsDataReady(false);

            try {
                // Fetch categories, products, and accessories in parallel
                const [categoriesResponse, productsResponse, accessoriesResponse] = await Promise.all([
                    fetch(`${API_BASE_URL}/categories`, {
                        cache: 'no-store',
                        headers: {
                            'Cache-Control': 'no-cache, no-store, must-revalidate',
                            'Pragma': 'no-cache'
                        }
                    }),
                    fetch(`${API_BASE_URL}/products?limit=1000`, {
                        cache: 'no-store',
                        headers: {
                            'Cache-Control': 'no-cache, no-store, must-revalidate',
                            'Pragma': 'no-cache'
                        }
                    }),
                    fetch(`${API_BASE_URL}/accessories?limit=1000`, {
                        cache: 'no-store',
                        headers: {
                            'Cache-Control': 'no-cache, no-store, must-revalidate',
                            'Pragma': 'no-cache'
                        }
                    })
                ]);

                // Parse responses
                const categoriesData = await categoriesResponse.json();
                const productsData = await productsResponse.json();
                const accessoriesData = await accessoriesResponse.json();

                // Process categories
                if (categoriesData.success) {
                    const activeCategories = categoriesData.data
                        .filter((c: Category) => c.isActive !== false)
                        .sort((a: Category, b: Category) => (a.order || 0) - (b.order || 0));
                    console.log('✅ Categories loaded:', activeCategories.length);
                    setCategories(activeCategories);
                }

                // Process products
                if (productsData.success) {
                    const activeProducts = productsData.data.filter((p: Product) => p.isActive !== false);
                    console.log(`✅ Loaded ${activeProducts.length} products`);
                    setProducts(activeProducts);
                }

                // Process accessories
                if (accessoriesData.success) {
                    const activeAccessories = accessoriesData.data.filter((a: Accessory) => a.isActive !== false);
                    console.log(`✅ Loaded ${activeAccessories.length} accessories`);
                    setAccessories(activeAccessories);
                }

                setIsDataReady(true);
            } catch (error) {
                console.error('Failed to fetch data:', error);
                toast.error('Failed to load products');
                setIsDataReady(true);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // ============================================
    // SET ACTIVE TAB FROM URL OR DEFAULT TO 'all'
    // ============================================
    useEffect(() => {
        if (isDataReady) {
            // If there's a category parameter
            if (categoryParam) {
                // Check if it's a valid category
                const validCategories = categories.map(c => c.id);
                if (validCategories.includes(categoryParam)) {
                    setActiveTab(categoryParam);
                    return;
                }
                // Check if it's the accessories tab
                if (categoryParam === 'accessories') {
                    setActiveTab('accessories');
                    return;
                }
            }

            // ✅ Default to 'all' when no valid category param
            setActiveTab('all');
        }
    }, [categoryParam, categories, isDataReady]);

    // ============================================
    // GET PRODUCT COUNT PER CATEGORY
    // ============================================
    const getCategoryProductCount = useCallback((categoryId: string) => {
        if (categoryId === 'all') return products.length + accessories.length;
        if (categoryId === 'accessories') return accessories.length;
        return products.filter(p => p.category === categoryId).length;
    }, [products, accessories]);

    // ============================================
    // BUILD TABS DYNAMICALLY FROM CATEGORIES
    // ============================================
    const tabs = useMemo(() => {
        const allTab = {
            id: 'all',
            label: 'All Products',
            icon: Grid3x3,
            count: products.length + accessories.length
        };

        // ✅ HARDCODED ACCESSORIES TAB
        const accessoriesTab = {
            id: 'accessories',
            label: 'Accessories',
            icon: Wrench,
            count: accessories.length
        };

        // Category tabs
        const categoryTabs = categories.map(cat => {
            const Icon = getIconComponent(cat.icon);
            const count = getCategoryProductCount(cat.id);
            return {
                id: cat.id,
                label: cat.name,
                icon: Icon,
                count: count,
            };
        });

        // Only show categories with products
        const activeCategoryTabs = categoryTabs.filter(tab => tab.count > 0);

        // If no categories have products, show all categories with 0 count
        if (activeCategoryTabs.length === 0) {
            // Always show accessories tab even if 0
            const allTabs = [allTab, accessoriesTab, ...categoryTabs];
            // Remove duplicates (if a category is named "Accessories")
            const uniqueTabs = allTabs.filter((tab, index, self) =>
                index === self.findIndex(t => t.id === tab.id)
            );
            return uniqueTabs;
        }

        // Always include accessories tab
        const allTabs = [allTab, accessoriesTab, ...activeCategoryTabs];
        // Remove duplicates (if a category is named "Accessories")
        const uniqueTabs = allTabs.filter((tab, index, self) =>
            index === self.findIndex(t => t.id === tab.id)
        );
        return uniqueTabs;
    }, [categories, products, accessories, getCategoryProductCount]);

    // ============================================
    // FILTER PRODUCTS
    // ============================================
    const filteredProducts = useMemo(() => {
        let result: any[] = [];

        if (activeTab === 'all') {
            // Show both products and accessories
            result = [...products, ...accessories];
        } else if (activeTab === 'accessories') {
            // Show only accessories
            result = [...accessories];
        } else {
            // Show only products from that category
            result = products.filter(p => p.category === activeTab);
        }

        // Apply search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase().trim();
            result = result.filter(item =>
                item.name.toLowerCase().includes(query) ||
                item.model.toLowerCase().includes(query) ||
                item.categoryLabel?.toLowerCase().includes(query)
            );
        }

        return result;
    }, [products, accessories, activeTab, searchQuery]);

    // ============================================
    // SORT PRODUCTS
    // ============================================
    const sortedProducts = useMemo(() => {
        const sorted = [...filteredProducts];
        switch (sortBy) {
            case 'price-low':
                return sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
            case 'price-high':
                return sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
            case 'name':
                return sorted.sort((a, b) => a.name.localeCompare(b.name));
            case 'rating':
                return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            default:
                return sorted;
        }
    }, [filteredProducts, sortBy]);

    // ============================================
    // CLEAR SEARCH
    // ============================================
    const clearSearch = () => setSearchQuery('');

    // ============================================
    // GET CLEAN SLUG
    // ============================================
    const getCleanSlug = (itemId: string) => {
        if (!itemId) return 'product';
        const parts = itemId.split('-');
        const lastPart = parts[parts.length - 1];
        if (/^\d+$/.test(lastPart)) {
            return parts.slice(0, -1).join('-');
        }
        return itemId;
    };

    // ============================================
    // GET ACCESSORY TYPE LABEL
    // ============================================
    const getAccessoryTypeLabel = (type: string) => {
        const types: Record<string, string> = {
            cable: '🔌 Cable',
            adapter: '🔗 Adapter',
            mount: '📍 Mount',
            rfid: '💳 RFID',
            management: '📜 Management',
            cover: '🛡️ Cover',
            pedestal: '🏗️ Pedestal',
            meter: '📊 Meter',
            signage: '🚧 Signage',
            replacement: '🔧 Replacement',
            other: '📦 Other'
        };
        return types[type] || type;
    };

    // ============================================
    // RENDER
    // ============================================
    if (isLoading) {
        return (
            <div className="bg-white min-h-screen">
                <PageHeader
                    breadcrumbs={[
                        { label: 'Home', link: '/' },
                        { label: 'EV Chargers' }
                    ]}
                    imageUrl="/images/help/evchargers-2048px-4445-2x1-1.webp"
                    title="EV Chargers"
                    description="From compact home wallboxes to high-power DC fast chargers, our full lineup covers 7kW to 1280kW — built for residential, commercial, and fleet applications."
                />
                <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="animate-pulse bg-white border border-gray-200 rounded-2xl overflow-hidden">
                                <div className="h-52 bg-gray-200"></div>
                                <div className="p-5 space-y-3">
                                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                    <div className="space-y-2">
                                        <div className="h-3 bg-gray-200 rounded w-full"></div>
                                        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                                    </div>
                                    <div className="h-10 bg-gray-200 rounded-xl"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen">
            <PageHeader
                breadcrumbs={[
                    { label: 'Home', link: '/' },
                    { label: 'EV Chargers' }
                ]}
                imageUrl="/images/help/evchargers-2048px-4445-2x1-1.webp"
                title="EV Chargers"
                description="From compact home wallboxes to high-power DC fast chargers, our full lineup covers 7kW to 1280kW — built for residential, commercial, and fleet applications."
            />

            <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-10">
                {/* Search Bar */}
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

                {/* Dynamic Tabs with Accessories */}
                {tabs.length > 0 && (
                    <div className="mb-10 overflow-x-auto">
                        <div className="flex flex-wrap gap-1.5 min-w-max">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`
                                            flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-full transition-all whitespace-nowrap
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
                )}

                {/* Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <p className="text-sm text-gray-600">
                        Showing <span className="font-extrabold text-[#071322]">{sortedProducts.length}</span> items
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

                {/* Products Grid */}
                {sortedProducts.length === 0 ? (
                    <div className="text-center py-24 bg-gray-50 rounded-3xl border border-dashed border-gray-200 space-y-4">
                        <div className="text-6xl">🔌</div>
                        <h3 className="text-2xl font-extrabold text-[#071322]">No items found</h3>
                        <p className="text-gray-500 text-sm max-w-sm mx-auto">
                            {searchQuery
                                ? `No results found for "${searchQuery}". Try adjusting your search.`
                                : activeTab === 'all'
                                    ? 'No products or accessories available at the moment.'
                                    : `No items available in ${tabs.find(t => t.id === activeTab)?.label}.`}
                        </p>
                        {(searchQuery || activeTab !== 'all') && (
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setActiveTab('all');
                                }}
                                className="bg-[#1b7936] text-white text-sm font-bold px-6 py-2.5 rounded-xl hover:bg-[#155f2b] transition-colors"
                            >
                                View All Items
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                        {sortedProducts.map((item) => {
                            const cleanSlug = getCleanSlug(item.id || item.name);
                            const rating = item.rating || 0;
                            const price = item.price || 0;
                            const categoryLabel = item.categoryLabel || item.category;
                            const brandName = item.brandDetails?.name || item.brand;

                            // Check if it's an accessory
                            const isAccessory = 'accessoryType' in item;
                            const accessoryType = isAccessory ? (item as Accessory).accessoryType : null;

                            return (
                                <div
                                    key={item._id || item.id}
                                    className="bg-white border border-gray-200/100 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
                                >
                                    {/* Item Thumbnail */}
                                    <Link href={`/ev-chargers/${cleanSlug}`} className="block relative w-full h-52 overflow-hidden bg-[#f8f9fa]">
                                        <ProductImage
                                            src={item.imageUrl}
                                            alt={item.name}
                                            priority={false}
                                        />
                                        {/* Badges */}
                                        <div className="absolute top-3 left-3 flex flex-col gap-1">
                                            <span className="bg-[#1b7936] text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                                                {isAccessory ? '🔧 Accessory' : categoryLabel}
                                            </span>
                                            {isAccessory && accessoryType && (
                                                <span className="bg-[#071322]/80 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                    {getAccessoryTypeLabel(accessoryType)}
                                                </span>
                                            )}
                                        </div>
                                        {price > 0 && (
                                            <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                                                ${price}
                                            </div>
                                        )}
                                    </Link>

                                    {/* Item Details */}
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
                                            <span className="text-[11px] text-gray-400 font-semibold ml-1">
                                                {rating > 0 ? rating.toFixed(1) : 'N/A'}
                                            </span>
                                        </div>

                                        <Link href={`/ev-chargers/${cleanSlug}`}>
                                            <h3 className="text-base font-extrabold text-[#071322] group-hover:text-[#1b7936] transition-colors line-clamp-2">
                                                {item.name}
                                            </h3>
                                        </Link>
                                        <p className="text-xs text-gray-400 font-bold">Model: {item.model || 'N/A'}</p>

                                        {/* Key Specs */}
                                        {item.specs && item.specs.length > 0 && (
                                            <div className="space-y-1.5 pt-1">
                                                {item.specs.slice(0, 2).map((spec: string, idx: number) => (
                                                    <div key={idx} className="flex items-start gap-2 text-xs text-gray-600 font-medium">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-[#3ec06a] mt-1.5 shrink-0"></span>
                                                        <span className="line-clamp-1">{spec}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Action Button */}
                                        <Link
                                            href={`/ev-chargers/${cleanSlug}`}
                                            className="block w-full text-center bg-[#1b7936] hover:bg-[#155f2b] text-white font-bold text-sm py-3 rounded-xl transition-all"
                                        >
                                            Send Inquiry Now
                                        </Link>

                                        {/* Brand Link */}
                                        <div className="text-center">
                                            <Link
                                                href={`/brands/${item.brand}`}
                                                className="text-xs text-gray-400 hover:text-[#1b7936] hover:underline"
                                            >
                                                Brand: <span className="capitalize font-semibold">{brandName}</span>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* View All Categories */}
                <div className="mt-12 text-center">
                    <Link
                        href="/categories"
                        className="inline-flex items-center gap-2 text-[#1b7936] font-semibold hover:underline"
                    >
                        Browse All Categories <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>

            {/* Bottom CTA */}
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

// ============================================
// MAIN EXPORT
// ============================================
export default function EVChargersPage() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <EVChargersContent />
        </Suspense>
    );
}