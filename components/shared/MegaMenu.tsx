// components/shared/MegaMenu.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, useMemo, useRef } from 'react';
import { getImageUrl, isDefaultImage } from '@/utils/imageHelper';
import { usePathname } from 'next/navigation';

export type MegaMenuType =
    | 'products'
    | 'solutions'
    | 'industries'
    | 'accessories'
    | 'training'
    | 'services'
    | 'brands';

interface MegaMenuProps {
    type: MegaMenuType;
}

interface Service {
    _id?: string;
    id?: string;
    title: string;
    badge?: string;
    description?: string;
    details?: string;
    icon?: string;
    imageUrl?: string;
    link?: string;
    color?: string;
    isActive?: boolean;
    category?: string;
}

interface Brand {
    _id?: string;
    id?: string;
    name: string;
    slug?: string;
    description?: string;
    icon?: string;
    logo?: string;
    isActive?: boolean;
}

interface Category {
    _id?: string;
    id?: string;
    name: string;
    slug?: string;
    icon?: string;
    description?: string;
    productCount?: number;
    isActive?: boolean;
    order?: number;
}

interface Product {
    _id?: string;
    id?: string;
    name: string;
    model?: string;
    brand?: string;
    category?: string | { _id?: string; id?: string; slug?: string; name?: string };
    categoryLabel?: string;
    specs?: string[];
    imageUrl?: string;
    price?: number;
    rating?: number;
    isActive?: boolean;
}

interface Accessory {
    _id?: string;
    id?: string;
    name: string;
    model?: string;
    brand?: string;
    category?: string;
    accessoryType?: string;
    imageUrl?: string;
    price?: number;
    isActive?: boolean;
    parentProductId?: string;
}

interface Solution {
    _id?: string;
    id: string;
    label: string;
    link: string;
    desc: string;
    imageUrl: string;
    title: string;
    subtitle: string;
    overview: string;
    isActive: boolean;
    features: string[];
}

interface Industry {
    _id: string;
    id: string;
    label: string;
    slug: string;
    desc: string;
    icon: string;
    imageUrl: string;
    title: string;
    subtitle: string;
    overview: string;
    challenges: string[];
    solutions: string[];
    benefits: string[];
    caseStudy: {
        title: string;
        description: string;
        imageUrl: string;
        link: string;
    };
    features: string[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

interface Training {
    _id: string;
    id: string;
    title: string;
    badge: string;
    description: string;
    details: string;
    duration: string;
    format: string;
    imageUrl: string;
    link: string;
    color: string;
    icon: string;
    features: string[];
    price: string;
    schedule: string;
    prerequisites: string[];
    actionText: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const CACHE_TTL_MS = 5000;

// ============================================================================
// Cache System
// ============================================================================
interface CacheStore {
    data: {
        services?: Service[];
        brands?: Brand[];
        categories?: Category[];
        products?: Product[];
        accessories?: Accessory[];
        solutions?: Solution[];
        industries?: Industry[];
        training?: Training[];
    };
    timestamp: {
        services?: number;
        brands?: number;
        products?: number;
        accessories?: number;
        solutions?: number;
        industries?: number;
        training?: number;
    };
    inFlight: {
        services?: Promise<Service[]>;
        brands?: Promise<Brand[]>;
        products?: Promise<{ categories: Category[]; products: Product[] }>;
        accessories?: Promise<Accessory[]>;
        solutions?: Promise<Solution[]>;
        industries?: Promise<Industry[]>;
        training?: Promise<Training[]>;
    };
}

const memoryCache: CacheStore = {
    data: {},
    timestamp: {},
    inFlight: {}
};

const isCacheValid = (key: 'services' | 'brands' | 'products' | 'accessories' | 'solutions' | 'industries' | 'training'): boolean => {
    const ts = memoryCache.timestamp[key];
    if (!ts) return false;
    return Date.now() - ts < CACHE_TTL_MS;
};

const extractDataArray = <T,>(json: any): T[] => {
    if (Array.isArray(json)) return json;
    if (json && Array.isArray(json.data)) return json.data;
    if (json && Array.isArray(json.result)) return json.result;
    return [];
};

const getCleanSlug = (product: Product | Accessory): string => {
    const val = product.id || product._id || product.name || 'product';
    const parts = val.split('-');
    const lastPart = parts[parts.length - 1];
    if (/^\d+$/.test(lastPart)) {
        return parts.slice(0, -1).join('-');
    }
    return val;
};

const createSlug = (text?: string): string =>
    text
        ?.toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '') || 'item';

const generateCleanSlug = (text: string): string => {
    if (!text) return 'solution';
    return text
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
};

// ============================================================================
// Accessory Type Mapping
// ============================================================================
const accessoryTypeMap: Record<string, { label: string; icon: string; description: string }> = {
    cable: { label: 'Cables & Leads', icon: '🔌', description: 'Type 1, Type 2, CCS & NACS' },
    adapter: { label: 'Adapters & Connectors', icon: '🔗', description: 'Cross-standard charging adapters' },
    mount: { label: 'Mounting Pedestals', icon: '📍', description: 'Freestanding & wall-mount options' },
    rfid: { label: 'RFID Cards & Fobs', icon: '💳', description: 'Authentication for shared chargers' },
    management: { label: 'Cable Management', icon: '📜', description: 'Wall holders & retractable reels' },
    cover: { label: 'Protective Covers', icon: '🛡️', description: 'Weatherproofing for outdoor units' },
    pedestal: { label: 'Mounting Pedestals', icon: '🏗️', description: 'Freestanding & wall-mount options' },
    meter: { label: 'Power Meters', icon: '📊', description: 'Sub-metering & circuit protection' },
    signage: { label: 'Signage & Bollards', icon: '🚧', description: 'Bay marking & vehicle protection' },
    replacement: { label: 'Replacement Parts', icon: '🔧', description: 'EVSE diagnostics & spares' },
    other: { label: 'Other Accessories', icon: '📦', description: 'Additional EV charging accessories' },
};

// ============================================================================
// Helper: Group Accessories by Type
// ============================================================================
const groupAccessoriesByType = (accessories: Accessory[]) => {
    const grouped: Record<string, Accessory[]> = {};

    accessories.forEach((acc) => {
        const type = acc.accessoryType || 'other';
        if (!grouped[type]) {
            grouped[type] = [];
        }
        grouped[type].push(acc);
    });

    return grouped;
};

// ============================================================================
// Helper Hooks
// ============================================================================
const useMegaMenuData = (type: MegaMenuType) => {
    const [services, setServices] = useState<Service[]>(memoryCache.data.services || []);
    const [brands, setBrands] = useState<Brand[]>(memoryCache.data.brands || []);
    const [products, setProducts] = useState<Product[]>(memoryCache.data.products || []);
    const [categories, setCategories] = useState<Category[]>(memoryCache.data.categories || []);
    const [accessories, setAccessories] = useState<Accessory[]>(memoryCache.data.accessories || []);
    const [solutions, setSolutions] = useState<Solution[]>(memoryCache.data.solutions || []);
    const [industries, setIndustries] = useState<Industry[]>(memoryCache.data.industries || []);
    const [training, setTraining] = useState<Training[]>(memoryCache.data.training || []);

    const isDynamicType = type === 'services' || type === 'brands' || type === 'products' || type === 'accessories' || type === 'solutions' || type === 'industries' || type === 'training';

    const [isLoading, setIsLoading] = useState<boolean>(() => {
        if (!isDynamicType) return false;
        if (type === 'services') return !memoryCache.data.services;
        if (type === 'brands') return !memoryCache.data.brands;
        if (type === 'products') return !memoryCache.data.products || !memoryCache.data.categories;
        if (type === 'accessories') return !memoryCache.data.accessories;
        if (type === 'solutions') return !memoryCache.data.solutions;
        if (type === 'industries') return !memoryCache.data.industries;
        if (type === 'training') return !memoryCache.data.training;
        return false;
    });

    const isMountedRef = useRef(true);

    useEffect(() => {
        isMountedRef.current = true;
        let autoRefetchTimer: NodeJS.Timeout | null = null;

        const syncData = async (force: boolean = false) => {
            // Services
            if (type === 'services') {
                const hasValidCache = isCacheValid('services');
                if (!force && hasValidCache) return;

                if (!memoryCache.data.services) setIsLoading(true);

                if (!memoryCache.inFlight.services) {
                    memoryCache.inFlight.services = (async () => {
                        const res = await fetch(`${API_BASE_URL}/services`);
                        const json = await res.json();
                        return extractDataArray<Service>(json).filter((s) => s.isActive !== false);
                    })();
                }

                try {
                    const items = await memoryCache.inFlight.services;
                    memoryCache.data.services = items;
                    memoryCache.timestamp.services = Date.now();
                    if (isMountedRef.current) {
                        setServices(items);
                        setIsLoading(false);
                    }
                } catch (err) {
                    console.error('Error fetching services:', err);
                } finally {
                    delete memoryCache.inFlight.services;
                    if (isMountedRef.current) setIsLoading(false);
                }
            }

            // Brands
            if (type === 'brands') {
                const hasValidCache = isCacheValid('brands');
                if (!force && hasValidCache) return;

                if (!memoryCache.data.brands) setIsLoading(true);

                if (!memoryCache.inFlight.brands) {
                    memoryCache.inFlight.brands = (async () => {
                        const res = await fetch(`${API_BASE_URL}/brands`);
                        const json = await res.json();
                        return extractDataArray<Brand>(json).filter((b) => b.isActive !== false);
                    })();
                }

                try {
                    const items = await memoryCache.inFlight.brands;
                    memoryCache.data.brands = items;
                    memoryCache.timestamp.brands = Date.now();
                    if (isMountedRef.current) {
                        setBrands(items);
                        setIsLoading(false);
                    }
                } catch (err) {
                    console.error('Error fetching brands:', err);
                } finally {
                    delete memoryCache.inFlight.brands;
                    if (isMountedRef.current) setIsLoading(false);
                }
            }

            // Products & Categories
            if (type === 'products') {
                const hasValidCache = isCacheValid('products');
                if (!force && hasValidCache) return;

                if (!memoryCache.data.products || !memoryCache.data.categories) setIsLoading(true);

                if (!memoryCache.inFlight.products) {
                    memoryCache.inFlight.products = (async () => {
                        const [catRes, prodRes] = await Promise.all([
                            fetch(`${API_BASE_URL}/categories`),
                            fetch(`${API_BASE_URL}/products`)
                        ]);

                        const [catJson, prodJson] = await Promise.all([catRes.json(), prodRes.json()]);

                        const activeCategories = extractDataArray<Category>(catJson)
                            .filter((c) => c.isActive !== false)
                            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

                        const activeProducts = extractDataArray<Product>(prodJson).filter(
                            (p) => p.isActive !== false
                        );

                        return { categories: activeCategories, products: activeProducts };
                    })();
                }

                try {
                    const { categories: fetchedCats, products: fetchedProds } = await memoryCache.inFlight.products;
                    memoryCache.data.categories = fetchedCats;
                    memoryCache.data.products = fetchedProds;
                    memoryCache.timestamp.products = Date.now();
                    if (isMountedRef.current) {
                        setCategories(fetchedCats);
                        setProducts(fetchedProds);
                        setIsLoading(false);
                    }
                } catch (err) {
                    console.error('Error fetching products/categories:', err);
                } finally {
                    delete memoryCache.inFlight.products;
                    if (isMountedRef.current) setIsLoading(false);
                }
            }

            // Accessories
            if (type === 'accessories') {
                const hasValidCache = isCacheValid('accessories');
                if (!force && hasValidCache) return;

                if (!memoryCache.data.accessories) setIsLoading(true);

                if (!memoryCache.inFlight.accessories) {
                    memoryCache.inFlight.accessories = (async () => {
                        const res = await fetch(`${API_BASE_URL}/accessories?limit=1000`);
                        const json = await res.json();
                        return extractDataArray<Accessory>(json).filter((a) => a.isActive !== false);
                    })();
                }

                try {
                    const items = await memoryCache.inFlight.accessories;
                    memoryCache.data.accessories = items;
                    memoryCache.timestamp.accessories = Date.now();
                    if (isMountedRef.current) {
                        setAccessories(items);
                        setIsLoading(false);
                    }
                } catch (err) {
                    console.error('Error fetching accessories:', err);
                } finally {
                    delete memoryCache.inFlight.accessories;
                    if (isMountedRef.current) setIsLoading(false);
                }
            }

            // Industries
            if (type === 'industries') {
                const hasValidCache = isCacheValid('industries');
                if (!force && hasValidCache) return;

                if (!memoryCache.data.industries) setIsLoading(true);

                if (!memoryCache.inFlight.industries) {
                    memoryCache.inFlight.industries = (async () => {
                        const res = await fetch(`${API_BASE_URL}/industries?limit=100&isActive=true`);
                        const json = await res.json();
                        const industries = extractDataArray<Industry>(json).filter((i) => i.isActive !== false);
                        return industries;
                    })();
                }

                try {
                    const items = await memoryCache.inFlight.industries;
                    memoryCache.data.industries = items;
                    memoryCache.timestamp.industries = Date.now();
                    if (isMountedRef.current) {
                        setIndustries(items);
                        setIsLoading(false);
                    }
                } catch (err) {
                    console.error('Error fetching industries:', err);
                } finally {
                    delete memoryCache.inFlight.industries;
                    if (isMountedRef.current) setIsLoading(false);
                }
            }

            // Training
            if (type === 'training') {
                const hasValidCache = isCacheValid('training');
                if (!force && hasValidCache) return;

                if (!memoryCache.data.training) setIsLoading(true);

                if (!memoryCache.inFlight.training) {
                    memoryCache.inFlight.training = (async () => {
                        const res = await fetch(`${API_BASE_URL}/training?limit=100&isActive=true`);
                        const json = await res.json();
                        const training = extractDataArray<Training>(json).filter((t) => t.isActive !== false);
                        return training;
                    })();
                }

                try {
                    const items = await memoryCache.inFlight.training;
                    memoryCache.data.training = items;
                    memoryCache.timestamp.training = Date.now();
                    if (isMountedRef.current) {
                        setTraining(items);
                        setIsLoading(false);
                    }
                } catch (err) {
                    console.error('Error fetching training:', err);
                } finally {
                    delete memoryCache.inFlight.training;
                    if (isMountedRef.current) setIsLoading(false);
                }
            }

            // Solutions
            if (type === 'solutions') {
                const hasValidCache = isCacheValid('solutions');
                if (!force && hasValidCache) return;

                if (!memoryCache.data.solutions) setIsLoading(true);

                if (!memoryCache.inFlight.solutions) {
                    memoryCache.inFlight.solutions = (async () => {
                        const res = await fetch(`${API_BASE_URL}/solutions?limit=100`);
                        const json = await res.json();
                        const solutions = extractDataArray<Solution>(json).filter((s) => s.isActive !== false);

                        return solutions.map((s) => {
                            const cleanSlug = s.id && !s.id.includes(' ')
                                ? s.id.toLowerCase().replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-')
                                : generateCleanSlug(s.label);

                            return {
                                ...s,
                                icon: '📋',
                                desc: s.desc || s.subtitle || '',
                                link: s.link && !s.link.includes(' ')
                                    ? s.link
                                    : `/solutions/${cleanSlug}`,
                                _slug: cleanSlug,
                            };
                        });
                    })();
                }

                try {
                    const items = await memoryCache.inFlight.solutions;
                    memoryCache.data.solutions = items;
                    memoryCache.timestamp.solutions = Date.now();
                    if (isMountedRef.current) {
                        setSolutions(items);
                        setIsLoading(false);
                    }
                } catch (err) {
                    console.error('Error fetching solutions:', err);
                } finally {
                    delete memoryCache.inFlight.solutions;
                    if (isMountedRef.current) setIsLoading(false);
                }
            }
        };

        if (isDynamicType) {
            syncData();
            autoRefetchTimer = setInterval(() => {
                syncData(true);
            }, CACHE_TTL_MS);
        } else {
            setIsLoading(false);
        }

        return () => {
            isMountedRef.current = false;
            if (autoRefetchTimer) clearInterval(autoRefetchTimer);
        };
    }, [type, isDynamicType]);

    const activeProductCategories = useMemo(() => {
        if (type !== 'products') return [];

        if (categories.length === 0 && products.length > 0) {
            return [
                {
                    category: { id: 'all', name: 'All Chargers', icon: '⚡', isActive: true },
                    products: products.slice(0, 6)
                }
            ];
        }

        return categories
            .map((cat) => {
                const catIdentifiers = [cat.id, cat._id, cat.slug, cat.name?.toLowerCase()].filter(Boolean);

                const matchedProducts = products.filter((p) => {
                    if (!p.category) return false;
                    if (typeof p.category === 'string') {
                        return catIdentifiers.includes(p.category) || catIdentifiers.includes(p.category.toLowerCase());
                    }
                    if (typeof p.category === 'object') {
                        const prodCatIds = [p.category.id, p.category._id, p.category.slug, p.category.name?.toLowerCase()].filter(Boolean);
                        return catIdentifiers.some((id) => prodCatIds.includes(id));
                    }
                    return false;
                });

                return {
                    category: cat,
                    products: matchedProducts.slice(0, 3)
                };
            })
            .filter((group) => group.products.length > 0)
            .slice(0, 3);
    }, [categories, products, type]);

    const groupedAccessories = useMemo(() => {
        if (type !== 'accessories') return {};
        if (accessories.length > 0) {
            return groupAccessoriesByType(accessories);
        }
        return {};
    }, [accessories, type]);

    const accessoryTypeSummary = useMemo(() => {
        if (type !== 'accessories') return [];

        const typeCounts: Record<string, { count: number; label: string; icon: string; description: string }> = {};

        accessories.forEach((acc) => {
            const type = acc.accessoryType || 'other';
            if (!typeCounts[type]) {
                const typeInfo = accessoryTypeMap[type] || accessoryTypeMap.other;
                typeCounts[type] = {
                    count: 0,
                    label: typeInfo.label,
                    icon: typeInfo.icon,
                    description: typeInfo.description
                };
            }
            typeCounts[type].count++;
        });

        return Object.entries(typeCounts)
            .map(([type, data]) => ({ type, ...data }))
            .sort((a, b) => b.count - a.count);
    }, [accessories, type]);

    const getAccessoriesByType = (type: string) => {
        return accessories.filter((a) => (a.accessoryType || 'other') === type);
    };

    return {
        services,
        brands,
        products,
        categories,
        accessories,
        solutions,
        industries,
        training,
        isLoading,
        activeProductCategories,
        groupedAccessories,
        accessoryTypeSummary,
        getAccessoriesByType,
        memoryCache,
        isCacheValid
    };
};

// ============================================================================
// Menu Components
// ============================================================================

// ----------------------------------------------------------------------------
// Products Menu
// ----------------------------------------------------------------------------
const ProductsMenu: React.FC<{
    categories: Category[];
    products: Product[];
    isLoading: boolean;
}> = ({ categories, products, isLoading }) => {
    const activeProductCategories = useMemo(() => {
        if (categories.length === 0 && products.length > 0) {
            return [
                {
                    category: { id: 'all', name: 'All Chargers', icon: '⚡', isActive: true },
                    products: products.slice(0, 6)
                }
            ];
        }

        return categories
            .map((cat) => {
                const catIdentifiers = [cat.id, cat._id, cat.slug, cat.name?.toLowerCase()].filter(Boolean);

                const matchedProducts = products.filter((p) => {
                    if (!p.category) return false;
                    if (typeof p.category === 'string') {
                        return catIdentifiers.includes(p.category) || catIdentifiers.includes(p.category.toLowerCase());
                    }
                    if (typeof p.category === 'object') {
                        const prodCatIds = [p.category.id, p.category._id, p.category.slug, p.category.name?.toLowerCase()].filter(Boolean);
                        return catIdentifiers.some((id) => prodCatIds.includes(id));
                    }
                    return false;
                });

                return {
                    category: cat,
                    products: matchedProducts.slice(0, 3)
                };
            })
            .filter((group) => group.products.length > 0)
            .slice(0, 3);
    }, [categories, products]);

    return (
        <div className="bg-white rounded-2xl shadow-2xl p-6 flex flex-col w-250 max-w-[95vw] text-left">
            <div className="flex gap-6">
                <div className="w-55 shrink-0">
                    <Link
                        href="/ev-chargers"
                        className="relative w-55 rounded-xl overflow-hidden shrink-0 block bg-[#071322] hover:bg-[#132c4e] transition-colors group p-6 min-h-55 h-full"
                    >
                        <div className="absolute inset-0 z-0">
                            <Image
                                src="/images/help/make-easy.jpg"
                                alt="EV Charging Promo"
                                fill
                                sizes="220px"
                                className="object-cover opacity-40 group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#071322] via-[#071322]/60 to-transparent" />
                        </div>
                        <div className="relative z-10 h-full flex flex-col justify-between">
                            <div className="text-white font-bold text-[14px] leading-snug drop-shadow-sm w-25 break-words">
                                Make EV charging easy
                            </div>
                            <div className="text-[#1b7936] font-light text-[12px] flex items-center gap-1.5 group-hover:gap-2.5 transition-all mt-4">
                                EV Chargers →
                            </div>
                        </div>
                    </Link>
                </div>

                <div className="flex-1 flex gap-5 min-w-0">
                    {isLoading ? (
                        [1, 2, 3].map((i) => (
                            <div key={i} className="flex-1 min-w-0 animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-24 mb-3" />
                                <div className="space-y-3">
                                    {[1, 2, 3].map((j) => (
                                        <div key={j} className="space-y-1">
                                            <div className="h-3.5 bg-gray-200 rounded w-32" />
                                            <div className="h-2.5 bg-gray-100 rounded w-24" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : activeProductCategories.length > 0 ? (
                        activeProductCategories.map(({ category, products: catProducts }, index) => (
                            <div
                                key={category.id || category._id || index}
                                className={`flex-1 min-w-0 ${index > 0 ? 'border-l border-gray-200/70 pl-5' : ''}`}
                            >
                                <Link
                                    href={`/ev-chargers?category=${category.slug || category.id || category._id || ''}`}
                                    className="text-[#071322] font-bold text-[14px] mb-3 truncate hover:text-[#1b7936] transition-colors block"
                                >
                                    {category.icon ? `${category.icon} ` : ''}{category.name}
                                </Link>
                                <div className="space-y-3">
                                    {catProducts.map((p) => {
                                        const slug = getCleanSlug(p);
                                        return (
                                            <div key={p._id || p.id} className="group min-w-0">
                                                <Link
                                                    href={`/ev-chargers/${slug}`}
                                                    className="block text-[#071322] text-[14px] hover:text-[#1b7936] transition-colors leading-tight truncate"
                                                    title={p.name}
                                                >
                                                    {p.name}
                                                </Link>
                                                <div className="text-gray-400 text-[11px] leading-relaxed font-normal mt-0.5 truncate">
                                                    {p.specs?.[0] ? `${p.specs[0]} • ` : ''}Model: {p.model || 'N/A'}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex-1 text-center py-8 text-gray-500 text-sm">
                            No products available
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ----------------------------------------------------------------------------
// Solutions Menu
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// Solutions Menu - FIXED with Active States
// ----------------------------------------------------------------------------
const SolutionsMenu: React.FC<{
    solutions: Solution[];
    isLoading: boolean;
}> = ({ solutions, isLoading }) => {
    const displaySolutions = solutions.slice(0, 6);
    const pathname = usePathname(); // ✅ Add this import

    // Helper to check if a solution is active
    const isSolutionActive = (solution: Solution) => {
        const cleanSlug = solution.label
            ? solution.label
                .toLowerCase()
                .trim()
                .replace(/\s+/g, '-')
                .replace(/[^\w\-]+/g, '')
                .replace(/\-\-+/g, '-')
                .replace(/^-+/, '')
                .replace(/-+$/, '')
            : 'solution';

        const link = `/solutions/${cleanSlug}`;
        return pathname === link || pathname.startsWith(`${link}/`);
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-3xl shadow-2xl p-8 w-205 max-w-[95vw] text-left space-y-6 border border-gray-100">
                <div className="font-bold text-[#1b7936] uppercase tracking-widest">SOLUTIONS</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="animate-pulse flex items-center gap-3.5 p-3.5 rounded-2xl border border-gray-100">
                            <div className="w-10 h-10 rounded-xl bg-gray-200" />
                            <div className="flex-1">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                                <div className="h-3 bg-gray-100 rounded w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (solutions.length === 0) {
        return (
            <div className="bg-white rounded-3xl shadow-2xl p-8 w-205 max-w-[95vw] text-left space-y-6 border border-gray-100">
                <div className="font-bold text-[#1b7936] uppercase tracking-widest">SOLUTIONS</div>
                <div className="text-center py-8 text-gray-500 text-sm">
                    No solutions available.
                </div>
                <div className="pt-4 border-t border-gray-200">
                    <Link href="/solutions" className="font-bold text-[#1b7936] hover:underline">
                        View All Solutions →
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-205 max-w-[95vw] text-left space-y-6 border border-gray-100">
            {/* SOLUTIONS Header */}
            <div className="font-bold text-[#1b7936] uppercase tracking-widest">SOLUTIONS</div>

            {/* Solutions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displaySolutions.map((solution) => {
                    const cleanSlug = solution.label
                        ? solution.label
                            .toLowerCase()
                            .trim()
                            .replace(/\s+/g, '-')
                            .replace(/[^\w\-]+/g, '')
                            .replace(/\-\-+/g, '-')
                            .replace(/^-+/, '')
                            .replace(/-+$/, '')
                        : 'solution';

                    const link = `/solutions/${cleanSlug}`;
                    const imageUrl = solution.imageUrl ? getImageUrl(solution.imageUrl) : null;
                    const hasValidImage = imageUrl && !isDefaultImage(solution.imageUrl);
                    const isActive = isSolutionActive(solution);

                    return (
                        <Link
                            key={solution.id || solution._id}
                            href={link}
                            className={`group p-4 rounded-2xl border transition-all flex items-center gap-3.5 min-w-0 ${isActive
                                ? 'bg-[#e8f5e9] border-[#1b7936]/30 shadow-sm'  // ✅ Active state
                                : 'bg-white border-transparent hover:bg-[#f8f9fa] hover:border-gray-200'  // ✅ Normal state
                                }`}
                        >
                            <div className={`w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center shrink-0 text-base shadow-xs ${isActive ? 'bg-[#1b7936] text-white' : 'bg-[#e8f5e9]'
                                }`}>
                                {hasValidImage ? (
                                    <img
                                        src={imageUrl}
                                        alt={solution.label}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                            const parent = target.parentElement;
                                            if (parent) {
                                                const fallback = document.createElement('span');
                                                fallback.className = 'text-xl';
                                                fallback.textContent = '📋';
                                                parent.appendChild(fallback);
                                            }
                                        }}
                                    />
                                ) : (
                                    <span className="text-xl">{isActive ? '✓' : '📋'}</span>
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <h4 className={`font-bold sm:text-[14px] transition-colors truncate ${isActive ? 'text-[#1b7936]' : 'text-[#071322] group-hover:text-[#1b7936]'
                                    }`}>
                                    {solution.label}
                                </h4>
                                <p className="text-gray-500 text-[11px] leading-snug mt-0.5 truncate">
                                    {solution.desc || solution.subtitle}
                                </p>
                            </div>
                            {isActive && (
                                <span className="w-1.5 h-1.5 rounded-full bg-[#1b7936] flex-shrink-0" />
                            )}
                        </Link>
                    );
                })}
            </div>

            {/* Cases Section */}
            <div className="bg-[#f8f9fa] rounded-2xl p-6 border border-gray-200/80 space-y-4">
                <div className="font-bold text-[#1b7936] uppercase tracking-widest">CASES</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8 text-xs">
                    <div className="min-w-0 truncate">
                        <span className="font-bold text-[#071322]">Limited grid capacity?</span>
                        <span className="text-gray-600"> — Add 40kW of chargers without exceeding existing service.</span>
                    </div>
                    <div className="min-w-0 truncate">
                        <span className="font-bold text-[#071322]">24/7 uptime needed?</span>
                        <span className="text-gray-600"> — Keep chargers running through grid outages with a microgrid.</span>
                    </div>
                    <div className="min-w-0 truncate">
                        <span className="font-bold text-[#071322]">Want to use solar?</span>
                        <span className="text-gray-600"> — Combine EV charging with solar + storage.</span>
                    </div>
                    <div className="min-w-0 truncate">
                        <span className="font-bold text-[#071322]">Need to bill tenants?</span>
                        <span className="text-gray-600"> — Meter and invoice usage automatically over OCPP.</span>
                    </div>
                </div>
            </div>

            {/* View All Link */}
            <div className="pt-4 border-t border-gray-200">
                <Link href="/solutions" className="font-bold text-[#1b7936] hover:underline">
                    View All Solutions →
                </Link>
            </div>
        </div>
    );
};

// ----------------------------------------------------------------------------
// Accessories Menu
// ----------------------------------------------------------------------------
const AccessoriesMenu: React.FC<{
    accessories: Accessory[];
    isLoading: boolean;
}> = ({ accessories, isLoading }) => {
    const groupedAccessories = useMemo(() => {
        if (accessories.length === 0) return {};
        const grouped: Record<string, Accessory[]> = {};
        accessories.forEach((acc) => {
            const type = acc.accessoryType || 'other';
            if (!grouped[type]) grouped[type] = [];
            grouped[type].push(acc);
        });
        return grouped;
    }, [accessories]);

    const sortedTypes = useMemo(() => {
        const types = Object.keys(groupedAccessories);
        return types
            .map((type) => ({
                type,
                count: groupedAccessories[type].length,
                label: accessoryTypeMap[type]?.label || 'Other',
                icon: accessoryTypeMap[type]?.icon || '📦',
                description: accessoryTypeMap[type]?.description || 'Additional EV charging accessories'
            }))
            .sort((a, b) => b.count - a.count);
    }, [groupedAccessories]);

    const getAccessoriesByType = (type: string) => {
        return groupedAccessories[type] || [];
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-3xl shadow-2xl p-8 w-210 max-w-[95vw] text-left space-y-6 border border-gray-100">
                <div className="font-bold text-[#1b7936] uppercase tracking-widest">ACCESSORIES</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="animate-pulse flex items-center gap-3.5 p-3.5 rounded-2xl border border-gray-100">
                            <div className="w-10 h-10 rounded-xl bg-gray-200" />
                            <div className="flex-1">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                                <div className="h-3 bg-gray-100 rounded w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (accessories.length === 0) {
        return (
            <div className="bg-white rounded-3xl shadow-2xl p-8 w-210 max-w-[95vw] text-left space-y-6 border border-gray-100">
                <div className="font-bold text-[#1b7936] uppercase tracking-widest">ACCESSORIES</div>
                <div className="text-center py-8 text-gray-500 text-sm">No accessories available.</div>
                <div className="pt-4 border-t border-gray-200">
                    <Link href="/accessories" className="font-bold text-[#1b7936] hover:underline">
                        View All Accessories →
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-210 max-w-[95vw] text-left space-y-6 border border-gray-100">
            <div className="font-bold text-[#1b7936] uppercase tracking-widest">ACCESSORIES</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {sortedTypes.slice(0, 6).map((typeInfo) => {
                    const typeAccessories = getAccessoriesByType(typeInfo.type);
                    const displayAccessories = typeAccessories.slice(0, 3);
                    const hasMore = typeAccessories.length > 3;

                    return (
                        <div key={typeInfo.type} className="space-y-2">
                            <div className="space-y-2">
                                {displayAccessories.map((acc) => {
                                    const slug = getCleanSlug(acc);
                                    const imageUrl = acc.imageUrl ? getImageUrl(acc.imageUrl) : null;
                                    const hasValidImage = imageUrl && !isDefaultImage(acc.imageUrl || '');

                                    return (
                                        <Link
                                            key={acc._id || acc.id}
                                            href={`/ev-chargers/${slug}`}
                                            className="flex items-center gap-3 group p-2 rounded-xl hover:bg-[#f8f9fa] transition-colors min-w-0"
                                        >
                                            <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#e8f5e9] flex items-center justify-center shrink-0 text-base shadow-xs">
                                                {hasValidImage ? (
                                                    <img
                                                        src={imageUrl}
                                                        alt={acc.name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement;
                                                            target.style.display = 'none';
                                                            const parent = target.parentElement;
                                                            if (parent) {
                                                                const fallback = document.createElement('span');
                                                                fallback.className = 'text-xl';
                                                                fallback.textContent = typeInfo.icon || '📦';
                                                                parent.appendChild(fallback);
                                                            }
                                                        }}
                                                    />
                                                ) : (
                                                    <span className="text-xl">{typeInfo.icon || '📦'}</span>
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="text-[#071322] text-[13px] hover:text-[#1b7936] transition-colors leading-tight truncate">
                                                    {acc.name}
                                                </div>
                                                <div className="text-gray-400 text-[10px] leading-relaxed font-normal truncate">
                                                    {acc.model || typeInfo.label}
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                                {hasMore && (
                                    <Link
                                        href={`/accessories?type=${typeInfo.type}`}
                                        className="text-xs text-[#1b7936] hover:underline font-medium block pl-2"
                                    >
                                        +{typeAccessories.length - 3} more...
                                    </Link>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="pt-4 border-t border-gray-200">
                <Link href="/accessories" className="font-bold text-[#1b7936] hover:underline">
                    View All Accessories →
                </Link>
            </div>
        </div>
    );
};

// ----------------------------------------------------------------------------
// Brands Menu - FIXED with Active States
// ----------------------------------------------------------------------------
const BrandsMenu: React.FC<{
    brands: Brand[];
    isLoading: boolean;
}> = ({ brands, isLoading }) => {
    const displayBrands = brands.slice(0, 4);
    const pathname = usePathname();

    // Helper to check if a brand is active
    const isBrandActive = (brand: Brand) => {
        const brandSlug = brand.slug || brand.id || brand._id;
        const link = `/brands/${brandSlug}`;
        return pathname === link || pathname.startsWith(`${link}/`);
    };

    return (
        <div className="bg-white rounded-3xl shadow-2xl p-6 w-90 max-w-[95vw] text-left space-y-6 border border-gray-100">
            {/* BRANDS Header */}
            <div className="font-bold text-[#1b7936] uppercase tracking-widest mb-2">BRANDS</div>

            {isLoading ? (
                <div className="grid grid-cols-1 gap-2">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="animate-pulse flex items-center gap-4 p-2 rounded-2xl border border-gray-100">
                            <div className="w-12 h-12 rounded-xl bg-gray-200" />
                            <div className="flex-1">
                                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                                <div className="h-3 bg-gray-100 rounded w-2/3" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : displayBrands.length > 0 ? (
                <div className="grid grid-cols-1 gap-2 mb-2">
                    {displayBrands.map((brand) => {
                        const isActive = isBrandActive(brand);
                        const brandSlug = brand.slug || brand.id || brand._id;

                        return (
                            <Link
                                key={brand._id || brand.id}
                                href={`/brands/${brandSlug}`}
                                className={`group p-2 rounded-2xl border transition-all flex items-center gap-4 ${isActive
                                        ? 'bg-[#e8f5e9] border-[#1b7936]/30 shadow-sm'  // ✅ Active state
                                        : 'border-transparent hover:bg-[#f8f9fa] hover:border-gray-200'  // ✅ Normal state
                                    }`}
                            >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-xl shadow-xs ${isActive ? 'bg-[#1b7936] text-white' : 'bg-[#e8f5e9]'
                                    }`}>
                                    {brand.icon || '⚡'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className={`text-[14px] mb-1 truncate transition-colors ${isActive
                                            ? 'text-[#1b7936] font-bold'
                                            : 'text-[#071322] font-bold group-hover:text-[#1b7936]'
                                        }`}>
                                        {brand.name}
                                        {isActive && (
                                            <span className="ml-1.5 text-[10px] text-[#1b7936]">●</span>
                                        )}
                                    </h4>
                                    <p className={`text-[12px] leading-snug line-clamp-1 ${isActive ? 'text-[#1b7936]/80' : 'text-gray-500'
                                        }`}>
                                        {brand.description || `${brand.name} - EV charging solutions`}
                                    </p>
                                </div>
                                {isActive && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#1b7936] flex-shrink-0" />
                                )}
                            </Link>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-8 text-gray-500 text-sm">No brands available.</div>
            )}

            {/* View All Link */}
            <div className="pt-2">
                <Link
                    href="/brands"
                    className={`font-medium text-xs transition-colors ${pathname === '/brands'
                            ? 'text-[#1b7936] font-bold'
                            : 'text-[#1b7936] hover:underline'
                        }`}
                >
                    View All Brands →
                </Link>
            </div>
        </div>
    );
};

// ----------------------------------------------------------------------------
// Services Menu
// ----------------------------------------------------------------------------
const ServicesMenu: React.FC<{
    services: Service[];
    isLoading: boolean;
}> = ({ services, isLoading }) => {
    const displayServices = services.slice(0, 6);

    return (
        <div className="bg-white rounded-3xl shadow-2xl p-5 w-120 max-w-[95vw] text-left space-y-6 border border-gray-100">
            <div className="font-bold text-[#1b7936] uppercase tracking-widest mb-2">SERVICES</div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="animate-pulse flex items-center gap-3.5 p-3.5 rounded-2xl border border-gray-100">
                            <div className="w-10 h-10 rounded-xl bg-gray-200" />
                            <div className="flex-1">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                                <div className="h-3 bg-gray-100 rounded w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : displayServices.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                    {displayServices.map((item) => (
                        <Link
                            key={item._id || item.id}
                            href={`/services/${createSlug(item.title || item.id)}`}
                            className="group p-3.5 rounded-2xl border border-transparent hover:bg-[#f8f9fa] hover:border-gray-200 transition-all flex items-center gap-3.5 min-w-0"
                        >
                            <div className="w-10 h-10 rounded-xl bg-[#e8f5e9] flex items-center justify-center shrink-0 text-base shadow-xs">
                                {item.icon || '📋'}
                            </div>
                            <div className="min-w-0 flex-1">
                                <h4 className="text-[#071322] font-bold sm:text-[14px] group-hover:text-[#1b7936] transition-colors truncate" title={item.title}>
                                    {item.title}
                                </h4>
                                <p className="text-gray-500 text-[11px] leading-snug mt-0.5 truncate" title={item.description || item.details}>
                                    {item.description || item.details}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 text-gray-500 text-sm">No services available.</div>
            )}

            <div className="pt-4">
                <Link href="/services" className="font-light text-xs text-[#1b7936] hover:underline">
                    View All Services →
                </Link>
            </div>
        </div>
    );
};

// ----------------------------------------------------------------------------
// Industries Menu
// ----------------------------------------------------------------------------
const IndustriesMenu: React.FC<{
    industries: Industry[];
    isLoading: boolean;
}> = ({ industries, isLoading }) => {
    const displayIndustries = industries.slice(0, 6);

    if (isLoading) {
        return (
            <div className="bg-white rounded-3xl shadow-2xl p-8 w-205 max-w-[95vw] text-left space-y-6 border border-gray-100">
                <div className="font-bold text-[#1b7936] uppercase tracking-widest">INDUSTRIES</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="animate-pulse flex items-center gap-3.5 p-3.5 rounded-2xl border border-gray-100">
                            <div className="w-10 h-10 rounded-xl bg-gray-200" />
                            <div className="flex-1">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                                <div className="h-3 bg-gray-100 rounded w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (industries.length === 0) {
        return (
            <div className="bg-white rounded-3xl shadow-2xl p-8 w-205 max-w-[95vw] text-left space-y-6 border border-gray-100">
                <div className="font-bold text-[#1b7936] uppercase tracking-widest">INDUSTRIES</div>
                <div className="text-center py-8 text-gray-500 text-sm">No industries available.</div>
                <div className="pt-4 border-t border-gray-200">
                    <Link href="/industries" className="font-bold text-[#1b7936] hover:underline">
                        View All Industries →
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-205 max-w-[95vw] text-left space-y-6 border border-gray-100">
            <div className="font-bold text-[#1b7936] uppercase tracking-widest">INDUSTRIES</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {displayIndustries.map((industry) => {
                    const icon = industry.icon || '🏢';
                    const imageUrl = industry.imageUrl ? getImageUrl(industry.imageUrl) : null;
                    const hasValidImage = imageUrl && !isDefaultImage(industry.imageUrl);

                    return (
                        <Link
                            key={industry._id || industry.id}
                            href={`/industries/${industry.id || industry.slug}`}
                            className="group p-3.5 rounded-2xl border border-transparent hover:bg-[#f8f9fa] hover:border-gray-200 transition-all flex items-start gap-3 min-w-0"
                        >
                            <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#e8f5e9] flex items-center justify-center shrink-0 text-base shadow-xs">
                                {hasValidImage ? (
                                    <img
                                        src={imageUrl}
                                        alt={industry.label}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                            const parent = target.parentElement;
                                            if (parent) {
                                                const fallback = document.createElement('span');
                                                fallback.className = 'text-xl';
                                                fallback.textContent = icon;
                                                parent.appendChild(fallback);
                                            }
                                        }}
                                    />
                                ) : (
                                    <span className="text-xl">{icon}</span>
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <h4 className="text-[#071322] font-bold sm:text-[14px] group-hover:text-[#1b7936] transition-colors truncate" title={industry.label}>
                                    {industry.label}
                                </h4>
                                <p className="text-gray-500 text-[11px] leading-snug mt-0.5 truncate" title={industry.desc}>
                                    {industry.desc || industry.subtitle || `${industry.label} solutions`}
                                </p>
                            </div>
                        </Link>
                    );
                })}
            </div>
            <div className="pt-4 border-t border-gray-200">
                <Link href="/industries" className="font-bold text-[#1b7936] hover:underline">
                    View All Industries →
                </Link>
            </div>
        </div>
    );
};

// ----------------------------------------------------------------------------
// Training Menu
// ----------------------------------------------------------------------------
const TrainingMenu: React.FC<{
    training: Training[];
    isLoading: boolean;
}> = ({ training, isLoading }) => {
    const displayTraining = training.slice(0, 6);

    if (isLoading) {
        return (
            <div className="bg-white rounded-3xl shadow-2xl p-6 w-170 max-w-[95vw] text-left space-y-6 border border-gray-100">
                <div className="font-bold text-[#1b7936] uppercase tracking-widest">TRAINING</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="animate-pulse flex items-center gap-3.5 p-3.5 rounded-2xl border border-gray-100">
                            <div className="w-10 h-10 rounded-xl bg-gray-200" />
                            <div className="flex-1">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                                <div className="h-3 bg-gray-100 rounded w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (training.length === 0) {
        return (
            <div className="bg-white rounded-3xl shadow-2xl p-6 w-170 max-w-[95vw] text-left space-y-6 border border-gray-100">
                <div className="font-bold text-[#1b7936] uppercase tracking-widest">TRAINING</div>
                <div className="text-center py-8 text-gray-500 text-sm">No training programs available.</div>
                <div className="pt-4 border-t border-gray-200">
                    <Link href="/training" className="font-bold text-[#1b7936] hover:underline">
                        View All Training →
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl shadow-2xl p-6 w-170 max-w-[95vw] text-left space-y-6 border border-gray-100">
            <div className="font-bold text-[#1b7936] uppercase tracking-widest">TRAINING</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayTraining.map((item) => {
                    const imageUrl = item.imageUrl ? getImageUrl(item.imageUrl) : null;
                    const hasValidImage = imageUrl && !isDefaultImage(item.imageUrl);

                    return (
                        <Link
                            key={item._id || item.id}
                            href={`/training/${item.id}`}
                            className="group p-3.5 rounded-2xl border border-transparent hover:bg-[#f8f9fa] hover:border-gray-200 transition-all flex items-center gap-3.5 min-w-0"
                        >
                            <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#e8f5e9] flex items-center justify-center shrink-0 text-base shadow-xs">
                                {hasValidImage ? (
                                    <img
                                        src={imageUrl}
                                        alt={item.title}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                            const parent = target.parentElement;
                                            if (parent) {
                                                const fallback = document.createElement('span');
                                                fallback.className = 'text-xl';
                                                fallback.textContent = item.icon || '📋';
                                                parent.appendChild(fallback);
                                            }
                                        }}
                                    />
                                ) : (
                                    <span className="text-xl">{item.icon || '📋'}</span>
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <h4 className="text-[#071322] font-bold sm:text-[14px] group-hover:text-[#1b7936] transition-colors truncate" title={item.title}>
                                    {item.title}
                                </h4>
                                <p className="text-gray-500 text-[11px] font-light mt-0.5 truncate" title={item.description}>
                                    {item.description}
                                </p>
                            </div>
                        </Link>
                    );
                })}
            </div>
            <div className="pt-4 border-t border-gray-200">
                <Link href="/training" className="font-bold text-[#1b7936] hover:underline">
                    View All Training Programs →
                </Link>
            </div>
        </div>
    );
};

// ============================================================================
// Main MegaMenu Component
// ============================================================================
export default function MegaMenu({ type }: MegaMenuProps) {
    const {
        services,
        brands,
        products,
        categories,
        accessories,
        industries,
        training,
        solutions,
        isLoading
    } = useMegaMenuData(type);

    switch (type) {
        case 'products':
            return <ProductsMenu categories={categories} products={products} isLoading={isLoading} />;
        case 'solutions':
            return <SolutionsMenu solutions={solutions} isLoading={isLoading} />;
        case 'accessories':
            return <AccessoriesMenu accessories={accessories} isLoading={isLoading} />;
        case 'brands':
            return <BrandsMenu brands={brands} isLoading={isLoading} />;
        case 'services':
            return <ServicesMenu services={services} isLoading={isLoading} />;
        case 'industries':
            return <IndustriesMenu industries={industries} isLoading={isLoading} />;
        case 'training':
            return <TrainingMenu training={training} isLoading={isLoading} />;
        default:
            return null;
    }
}