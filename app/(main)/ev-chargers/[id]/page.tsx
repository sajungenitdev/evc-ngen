// app/(main)/ev-chargers/[id]/page.tsx
'use client';

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { use } from 'react';
import PageHeader from '@/components/pagesComps/PageHeader';
import {
    CheckCircle2,
    MessageSquare,
    ShieldCheck,
    Truck,
    Clock,
    Award,
    Zap,
    Battery,
    Plug,
    Shield,
    Ruler,
    Weight,
    Calendar,
    Star,
    Mail,
    Phone,
    ArrowLeft,
    Package,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getImageUrl, isDefaultImage } from '@/utils/imageHelper';

// ============================================
// Types
// ============================================
interface Product {
    _id: string;
    id: string;
    name: string;
    brand: string;
    model: string;
    description: string;
    shortDescription: string;
    category: string;
    categoryLabel: string;
    specs: string[];
    features: string[];
    imageUrl: string;
    galleryImages: string[];
    price: number;
    rating: number;
    stock: number;
    isActive: boolean;
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

interface Accessory {
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
    accessoryType: string;
    parentProductId: string;
    parentProductDetails?: {
        id: string;
        name: string;
        model: string;
    };
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

interface Brand {
    _id: string;
    id: string;
    name: string;
    icon: string;
    logo: string;
    isActive: boolean;
}

interface PageProps {
    params: Promise<{ id: string }>;
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
// Helper Functions
// ============================================
const getCleanSlug = (itemId: string) => {
    if (!itemId) return 'item';
    const parts = itemId.split('-');
    const lastPart = parts[parts.length - 1];
    if (/^\d+$/.test(lastPart)) {
        return parts.slice(0, -1).join('-');
    }
    return itemId;
};

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
// Helper: Find Product OR Accessory
// ============================================
const findProductOrAccessory = async (itemId: string) => {
    // Try 1: Check if it's a Product
    try {
        const productRes = await fetch(`${API_BASE_URL}/products/${itemId}`);
        const productData = await productRes.json();
        if (productData.success) {
            return { success: true, data: productData.data, type: 'product' };
        }
    } catch (error) {
        console.error('Product fetch error:', error);
    }

    // Try 2: Check if it's an Accessory
    try {
        const accessoryRes = await fetch(`${API_BASE_URL}/accessories/${itemId}`);
        const accessoryData = await accessoryRes.json();
        if (accessoryData.success) {
            return { success: true, data: accessoryData.data, type: 'accessory' };
        }
    } catch (error) {
        console.error('Accessory fetch error:', error);
    }

    // Try 3: Search products by partial match
    try {
        const searchRes = await fetch(`${API_BASE_URL}/products?search=${itemId}`);
        const searchData = await searchRes.json();
        if (searchData.success && searchData.data.length > 0) {
            const matched = searchData.data.find((p: Product) =>
                p.id === itemId ||
                p.id.startsWith(itemId) ||
                p.id.includes(itemId) ||
                getCleanSlug(p.id) === itemId
            );
            if (matched) {
                return { success: true, data: matched, type: 'product' };
            }
        }
    } catch (error) {
        console.error('Product search error:', error);
    }

    // Try 4: Search accessories by partial match
    try {
        const searchRes = await fetch(`${API_BASE_URL}/accessories?search=${itemId}`);
        const searchData = await searchRes.json();
        if (searchData.success && searchData.data.length > 0) {
            const matched = searchData.data.find((a: Accessory) =>
                a.id === itemId ||
                a.id.startsWith(itemId) ||
                a.id.includes(itemId) ||
                getCleanSlug(a.id) === itemId
            );
            if (matched) {
                return { success: true, data: matched, type: 'accessory' };
            }
        }
    } catch (error) {
        console.error('Accessory search error:', error);
    }

    return { success: false };
};

// ============================================
// Main Component
// ============================================
export default function ProductDetailPage({ params }: PageProps) {
    const { id } = use(params);
    const decodedId = decodeURIComponent(id);

    // State
    const [product, setProduct] = useState<Product | null>(null);
    const [accessory, setAccessory] = useState<Accessory | null>(null);
    const [isAccessory, setIsAccessory] = useState(false);
    const [brand, setBrand] = useState<Brand | null>(null);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('description');
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    // ============================================
    // Fetch Data
    // ============================================
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // 1. Find Product or Accessory
                const result = await findProductOrAccessory(decodedId);
                if (!result.success) {
                    toast.error('Item not found');
                    notFound();
                    return;
                }

                const foundItem = result.data;
                const itemType = result.type;

                if (itemType === 'accessory') {
                    setIsAccessory(true);
                    setAccessory(foundItem);
                    setSelectedImageIndex(0);

                    // Fetch brand for accessory
                    if (foundItem.brand) {
                        try {
                            const brandRes = await fetch(`${API_BASE_URL}/brands/${foundItem.brand}`);
                            const brandData = await brandRes.json();
                            if (brandData.success) {
                                setBrand(brandData.data);
                            }
                        } catch (error) {
                            console.error('Failed to fetch brand:', error);
                        }
                    }
                } else {
                    setIsAccessory(false);
                    setProduct(foundItem);
                    setSelectedImageIndex(0);

                    // 2. Fetch Brand Details
                    if (foundItem.brand) {
                        try {
                            const brandRes = await fetch(`${API_BASE_URL}/brands/${foundItem.brand}`);
                            const brandData = await brandRes.json();
                            if (brandData.success) {
                                setBrand(brandData.data);
                            }
                        } catch (error) {
                            console.error('Failed to fetch brand:', error);
                        }
                    }

                    // 3. Fetch Related Products (only for products)
                    try {
                        const relatedRes = await fetch(
                            `${API_BASE_URL}/products?category=${foundItem.category}&limit=4`
                        );
                        const relatedData = await relatedRes.json();
                        if (relatedData.success) {
                            const filtered = relatedData.data.filter(
                                (p: Product) => p._id !== foundItem._id && p.id !== foundItem.id
                            );
                            setRelatedProducts(filtered.slice(0, 3));
                        }
                    } catch (error) {
                        console.error('Failed to fetch related products:', error);
                    }
                }

            } catch (error: any) {
                console.error('Fetch error:', error);
                toast.error(error.message || 'Failed to load item');
                notFound();
            } finally {
                setIsLoading(false);
            }
        };

        if (decodedId) {
            fetchData();
        }
    }, [decodedId]);

    // ============================================
    // Handle Thumbnail Click
    // ============================================
    const handleThumbnailClick = (index: number) => {
        setSelectedImageIndex(index);
    };

    // ============================================
    // Loading State
    // ============================================
    if (isLoading) {
        return (
            <main className="min-h-screen bg-white">
                <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 pb-24">
                    <div className="animate-pulse">
                        <div className="h-6 bg-slate-200 rounded w-32 mb-8"></div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                            <div className="space-y-6">
                                <div className="h-12 bg-slate-200 rounded w-3/4"></div>
                                <div className="h-6 bg-slate-200 rounded w-24"></div>
                                <div className="h-32 bg-slate-200 rounded"></div>
                            </div>
                            <div className="h-[400px] bg-slate-200 rounded-3xl"></div>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    // ============================================
    // Render Accessory Detail
    // ============================================
    if (isAccessory && accessory) {
        const images = accessory.galleryImages && accessory.galleryImages.length > 0
            ? [accessory.imageUrl, ...accessory.galleryImages]
            : [accessory.imageUrl];

        const currentImage = images[selectedImageIndex] || accessory.imageUrl;

        const techDetails = accessory.technicalDetails ? [
            { label: 'Power Output', value: accessory.technicalDetails.powerOutput, icon: Zap },
            { label: 'Input Voltage', value: accessory.technicalDetails.inputVoltage, icon: Battery },
            { label: 'Connector Type', value: accessory.technicalDetails.connectorType, icon: Plug },
            { label: 'Enclosure Rating', value: accessory.technicalDetails.enclosureRating, icon: Shield },
            { label: 'Warranty', value: accessory.technicalDetails.warranty, icon: Calendar },
            { label: 'Dimensions', value: accessory.technicalDetails.dimensions, icon: Ruler },
            { label: 'Weight', value: accessory.technicalDetails.weight, icon: Weight },
        ].filter(d => d.value && d.value !== '') : [];

        return (
            <main className="min-h-screen bg-white">
                <PageHeader
                    breadcrumbs={[
                        { label: 'Home', link: '/' },
                        { label: 'Accessories', link: '/ev-chargers?category=accessories' },
                        { label: accessory.name }
                    ]}
                    imageUrl={accessory.imageUrl || '/images/help/evchargers-2048px-4445-2x1-1.webp'}
                    title={accessory.name}
                    description={`Model: ${accessory.model} — ${accessory.categoryLabel || accessory.category} accessory`}
                />

                <section className="py-8 px-4 md:px-8 lg:px-16">
                    <div className="max-w-7xl mx-auto">
                        {/* Main Content */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            {/* Left: Image */}
                            <div className="lg:sticky lg:top-24 self-start">
                                <div className="relative h-[550px] rounded-md overflow-hidden bg-[#f8f9fa] shadow-lg flex items-center justify-center">
                                    <ProductThumbnail
                                        imageUrl={currentImage}
                                        name={accessory.name}
                                        className="w-full h-full object-contain"
                                    />
                                    {images.length > 1 && (
                                        <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full">
                                            {selectedImageIndex + 1} / {images.length}
                                        </div>
                                    )}
                                </div>

                                {images.length > 1 && (
                                    <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                                        {images.map((img, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleThumbnailClick(idx)}
                                                className={`w-20 h-20 rounded-md overflow-hidden border-2 transition-all flex-shrink-0 bg-[#f8f9fa] cursor-pointer hover:opacity-80 ${selectedImageIndex === idx
                                                    ? 'border-[#1b7936] shadow-md'
                                                    : 'border-transparent hover:border-gray-300'
                                                    }`}
                                            >
                                                <ProductThumbnail
                                                    imageUrl={img}
                                                    name={`${accessory.name} - ${idx + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Right: Details */}
                            <div className="space-y-6">
                                <div className="flex flex-wrap items-center gap-2">
                                    {/* <span className="inline-flex items-center gap-1.5 bg-[#e8f5e9] text-[#1b7936] border border-[#1b7936]/20 text-xs font-extrabold uppercase px-3 py-1 rounded-full">
                                        <Package className="w-3.5 h-3.5" /> Accessory
                                    </span> */}
                                    <span className="inline-flex items-center gap-1.5 pe-0  text-[#1b7936] text-xs font-extrabold uppercase px-3 py-1 rounded-full">
                                        {getAccessoryTypeLabel(accessory.accessoryType)}
                                    </span>
                                    {brand && (
                                        <span className="inline-flex items-center gap-1.5 ps-0  text-[#1b7936] text-xs font-extrabold uppercase px-3 py-1 rounded-full">
                                            -{brand.icon} {brand.name}
                                        </span>
                                    )}
                                </div>

                                <h1 className="text-3xl sm:text-4xl font-extrabold text-[#071322] tracking-tight">
                                    {accessory.name}
                                </h1>
                                <p className="text-sm text-gray-400 font-normal">Model: {accessory.model}</p>

                                {/* <div className="flex items-center gap-3">
                                    <div className="flex items-center">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-5 h-5 ${i < Math.floor(accessory.rating || 0)
                                                    ? 'text-yellow-400 fill-yellow-400'
                                                    : 'text-gray-300'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-sm font-bold text-[#071322]">{accessory.rating || 0}</span>
                                </div> */}

                                {accessory.price > 0 && (
                                    <div className="flex items-center gap-3">
                                        <span className="text-3xl font-extrabold text-[#071322]">
                                            ${accessory.price}
                                        </span>
                                    </div>
                                )}

                                {accessory.shortDescription && (
                                    <p className="text-gray-600 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: accessory.shortDescription }} />
                                )}

                                {accessory.parentProductDetails && (
                                    <div className="bg-[#f8f9fa] rounded-2xl p-4">
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Compatible With</p>
                                        <Link
                                            href={`/ev-chargers/${getCleanSlug(accessory.parentProductDetails.id || accessory.parentProductId)}`}
                                            className="text-[#1b7936] font-semibold hover:underline"
                                        >
                                            {accessory.parentProductDetails.name} ({accessory.parentProductDetails.model})
                                        </Link>
                                    </div>
                                )}

                                <div className="flex flex-wrap gap-3 pt-2">
                                    <Link
                                        href={`/contact?product=${accessory.model}`}
                                        className="flex-1 min-w-[200px] inline-flex items-center justify-center gap-2 bg-[#1b7936] hover:bg-[#155f2b] text-white font-bold text-sm px-6 py-3.5 rounded-xl shadow-md transition-all"
                                    >
                                        <MessageSquare className="w-4 h-4" /> Send Inquiry Now
                                    </Link>
                                </div>

                                <div className="border-t border-gray-200 pt-6">
                                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-3">
                                        Need help? Contact our team
                                    </p>
                                    <div className="flex flex-wrap gap-4">
                                        <a href="tel:+18005550199" className="flex items-center gap-2 text-sm text-[#071322] font-semibold hover:text-[#1b7936] transition-colors">
                                            <Phone className="w-4 h-4 text-[#1b7936]" />
                                            +1 (800) 555-0199
                                        </a>
                                        <a href="mailto:info@evngen.com" className="flex items-center gap-2 text-sm text-[#071322] font-semibold hover:text-[#1b7936] transition-colors">
                                            <Mail className="w-4 h-4 text-[#1b7936]" />
                                            info@evngen.com
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Accessory Description */}
                        <div className="mt-16">
                            <div className="border-b border-gray-200 relative">
                                <nav className="flex gap-8 overflow-x-auto">
                                    <button
                                        onClick={() => setActiveTab('description')}
                                        className={`pb-4 text-sm font-bold transition-colors relative whitespace-nowrap ${activeTab === 'description'
                                            ? 'text-[#1b7936]'
                                            : 'text-gray-500 hover:text-[#071322]'
                                            }`}
                                    >
                                        Description
                                        {activeTab === 'description' && (
                                            <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#1b7936] rounded-full"></span>
                                        )}
                                    </button>
                                </nav>
                            </div>

                            <div className="mt-8">
                                <h3 className="text-2xl font-extrabold text-[#071322] tracking-tight mb-4">
                                    Accessory Description
                                </h3>
                                <p className="text-gray-600 text-base leading-relaxed text-justify" dangerouslySetInnerHTML={{ __html: accessory.description || accessory.shortDescription }} />
                                {techDetails.length > 0 && (
                                    <div className="mt-8">
                                        <h4 className="text-lg font-extrabold text-[#071322] tracking-tight mb-4">
                                            Technical Details
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {techDetails.map((detail, idx) => {
                                                const Icon = detail.icon;
                                                return (
                                                    <div key={idx} className="flex items-center gap-3 bg-[#f8f9fa] p-3 rounded-xl border border-gray-200/60">
                                                        <Icon className="w-5 h-5 text-[#1b7936]" />
                                                        <div>
                                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{detail.label}</p>
                                                            <p className="text-sm font-semibold text-[#071322]">{detail.value}</p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        );
    }

    // ============================================
    // Render Product Detail
    // ============================================
    if (!product) {
        notFound();
    }

    const productImages = product.galleryImages && product.galleryImages.length > 0
        ? [product.imageUrl, ...product.galleryImages]
        : [product.imageUrl];

    const currentImage = productImages[selectedImageIndex] || product.imageUrl;

    const techDetails = product.technicalDetails ? [
        { label: 'Power Output', value: product.technicalDetails.powerOutput, icon: Zap },
        { label: 'Input Voltage', value: product.technicalDetails.inputVoltage, icon: Battery },
        { label: 'Connector Type', value: product.technicalDetails.connectorType, icon: Plug },
        { label: 'Enclosure Rating', value: product.technicalDetails.enclosureRating, icon: Shield },
        { label: 'Warranty', value: product.technicalDetails.warranty, icon: Calendar },
        { label: 'Dimensions', value: product.technicalDetails.dimensions, icon: Ruler },
        { label: 'Weight', value: product.technicalDetails.weight, icon: Weight },
    ].filter(d => d.value && d.value !== '') : [];

    const tabs = [
        { id: 'description', label: 'Description' },
        { id: 'specifications', label: 'Specifications' },
        { id: 'features', label: 'Features' },
    ];

    return (
        <main className="min-h-screen bg-white">
            <PageHeader
                breadcrumbs={[
                    { label: 'Home', link: '/' },
                    { label: 'EV Chargers', link: '/ev-chargers' },
                    { label: product.name }
                ]}
                imageUrl={product.imageUrl || '/images/help/evchargers-2048px-4445-2x1-1.webp'}
                title={product.name}
                description={`Model: ${product.model} — High-performance ${product.categoryLabel || product.category} engineered for reliability.`}
            />

            <section className="py-8 px-4 md:px-8 lg:px-16">
                <div className="max-w-7xl mx-auto">

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Left: Image Gallery */}
                        <div className="lg:sticky lg:top-24 self-start">
                            <div className="relative h-[550px] rounded-md overflow-hidden bg-[#f8f9fa] shadow-lg flex items-center justify-center">
                                <ProductThumbnail
                                    imageUrl={currentImage}
                                    name={product.name}
                                    className="w-full h-full object-contain"
                                />
                                {productImages.length > 1 && (
                                    <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full">
                                        {selectedImageIndex + 1} / {productImages.length}
                                    </div>
                                )}
                            </div>

                            {productImages.length > 1 && (
                                <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                                    {productImages.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleThumbnailClick(idx)}
                                            className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 bg-[#f8f9fa] cursor-pointer hover:opacity-80 ${selectedImageIndex === idx
                                                ? 'border-[#1b7936] shadow-md'
                                                : 'border-transparent hover:border-gray-300'
                                                }`}
                                        >
                                            <ProductThumbnail
                                                imageUrl={img}
                                                name={`${product.name} - ${idx + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Right: Product Info */}
                        <div className="space-y-6">
                            <div className="flex flex-wrap items-center gap-2">
                                {/* <span className="inline-flex items-center gap-1.5 bg-[#e8f5e9] text-[#1b7936] border border-[#1b7936]/20 text-xs font-extrabold uppercase px-3 py-1 rounded-full">
                                    <ShieldCheck className="w-3.5 h-3.5" /> Certified
                                </span> */}
                                <span className="inline-flex items-center gap-1.5  text-emerald-600 text-sm  uppercase py-1 rounded-full">
                                    {product.categoryLabel || product.category}
                                </span>
                                {brand && (
                                    <span className="inline-flex items-center gap-1.5  text-emerald-600 text-sm  uppercase px-3 ps-0 py-1 rounded-full">
                                        {brand.icon} {brand.name}
                                    </span>
                                )}
                            </div>

                            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#071322] tracking-tight">
                                {product.name}
                            </h1>
                            <p className="text-sm text-gray-400 ">Model: {product.model}</p>

                            {/* <div className="flex items-center gap-3">
                                <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-5 h-5 ${i < Math.floor(product.rating || 0)
                                                ? 'text-yellow-400 fill-yellow-400'
                                                : 'text-gray-300'
                                                }`}
                                        />
                                    ))}
                                </div>
                                <span className="text-sm font-bold text-[#071322]">{product.rating || 0}</span>
                                <span className="text-sm text-gray-400">(24 reviews)</span>
                            </div> */}

                            {/* {product.price > 0 && (
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl font-extrabold text-[#071322]">
                                        ${product.price}
                                    </span>
                                    <span className="text-sm text-gray-400 line-through">${(product.price * 1.2).toFixed(0)}</span>
                                    <span className="bg-[#e8f5e9] text-[#1b7936] text-xs font-bold px-2.5 py-1 rounded-full">
                                        Save 20%
                                    </span>
                                </div>
                            )} */}

                            {product.shortDescription && (
                                <p className="text-gray-600 text-sm leading-relaxed overflow-hidden break-words whitespace-normal">
                                    <span dangerouslySetInnerHTML={{ __html: product.shortDescription }} />
                                </p>
                            )}


                            <div className="flex flex-wrap gap-3 pt-2">
                                <Link
                                    href={`/contact?product=${product.model}`}
                                    className="flex-1 min-w-[200px] inline-flex items-center justify-center gap-2 bg-[#1b7936] hover:bg-[#155f2b] text-white font-bold text-sm px-6 py-3.5 rounded-md shadow-md transition-all"
                                >
                                    <MessageSquare className="w-4 h-4" /> Send Inquiry Now
                                </Link>
                                <Link
                                    href="/request-survey"
                                    className="flex-1 min-w-[160px] inline-flex items-center justify-center gap-2 bg-[#f8f9fa] border border-gray-200 hover:bg-gray-200 text-[#071322] font-bold text-sm px-6 py-3.5 rounded-md transition-all"
                                >
                                    Request Site Survey
                                </Link>
                            </div>
                            {product.specs && product.specs.length > 0 && (
                                <div className="bg-[#f8f9fa] rounded-2xl p-4 space-y-2">
                                    <h4 className="text-xs font-extrabold text-[#071322] uppercase tracking-wider">
                                        Key Specifications
                                    </h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        {product.specs.slice(0, 4).map((spec, idx) => (
                                            <div key={idx} className="flex items-start gap-2 text-xs text-gray-600">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-[#3ec06a] flex-shrink-0 mt-0.5" />
                                                <span className="font-medium" dangerouslySetInnerHTML={{ __html: spec }} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* <div className="grid grid-cols-3 gap-3 pt-2">
                                <div className="bg-[#f8f9fa] rounded-xl p-3 text-center">
                                    <Truck className="w-5 h-5 text-[#1b7936] mx-auto mb-1" />
                                    <p className="text-[10px] font-bold text-gray-500 uppercase">Free Shipping</p>
                                </div>
                                <div className="bg-[#f8f9fa] rounded-xl p-3 text-center">
                                    <Clock className="w-5 h-5 text-[#1b7936] mx-auto mb-1" />
                                    <p className="text-[10px] font-bold text-gray-500 uppercase">2-3 Days Delivery</p>
                                </div>
                                <div className="bg-[#f8f9fa] rounded-xl p-3 text-center">
                                    <Award className="w-5 h-5 text-[#1b7936] mx-auto mb-1" />
                                    <p className="text-[10px] font-bold text-gray-500 uppercase">2 Year Warranty</p>
                                </div>
                            </div> */}

                            <div className="border-t border-gray-200 pt-6">
                                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-3">
                                    Need help? Contact our team
                                </p>
                                <div className="flex flex-wrap gap-4">
                                    <a href="tel:+18005550199" className="flex items-center gap-2 text-sm text-[#071322] font-semibold hover:text-[#1b7936] transition-colors">
                                        <Phone className="w-4 h-4 text-[#1b7936]" />
                                        +1 (800) 555-0199
                                    </a>
                                    <a href="mailto:info@evngen.com" className="flex items-center gap-2 text-sm text-[#071322] font-semibold hover:text-[#1b7936] transition-colors">
                                        <Mail className="w-4 h-4 text-[#1b7936]" />
                                        info@evngen.com
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="mt-16">
                        <div className="border-b border-gray-200 relative">
                            <nav className="flex gap-8 overflow-x-auto">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`pb-4 text-sm font-bold transition-colors relative whitespace-nowrap ${activeTab === tab.id
                                            ? 'text-[#1b7936]'
                                            : 'text-gray-500 hover:text-[#071322]'
                                            }`}
                                    >
                                        {tab.label}
                                        {activeTab === tab.id && (
                                            <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#1b7936] rounded-full"></span>
                                        )}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        <div className="mt-8">
                            {activeTab === 'description' && (
                                <div>
                                    <h3 className="text-2xl font-extrabold text-[#071322] tracking-tight mb-4">
                                        Product Description
                                    </h3>
                                    <p className="text-gray-600 text-base leading-relaxed" dangerouslySetInnerHTML={{ __html: product.description }} />
                                    {techDetails.length > 0 && (
                                        <div className="mt-8">
                                            <h4 className="text-lg font-extrabold text-[#071322] tracking-tight mb-4">
                                                Technical Details
                                            </h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {techDetails.map((detail, idx) => {
                                                    const Icon = detail.icon;
                                                    return (
                                                        <div key={idx} className="flex items-center gap-3 bg-[#f8f9fa] p-3 rounded-xl border border-gray-200/60">
                                                            <Icon className="w-5 h-5 text-[#1b7936]" />
                                                            <div>
                                                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{detail.label}</p>
                                                                <p className="text-sm font-semibold text-[#071322]">{detail.value}</p>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'specifications' && (
                                <div className="space-y-8">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-2xl font-extrabold text-[#071322] tracking-tight">
                                            Technical Specifications
                                        </h3>
                                        <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                                            {product.specs?.length || 0} specs
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {product.specs && product.specs.length > 0 ? (
                                            product.specs.map((spec, idx) => (
                                                <div key={idx} className="flex items-start gap-3 bg-white p-4 rounded-xl border border-gray-200/60 shadow-sm hover:shadow-md transition-shadow">
                                                    <CheckCircle2 className="w-5 h-5 text-[#3ec06a] flex-shrink-0 mt-0.5" />
                                                    <span className="text-gray-700 text-sm font-medium leading-snug">{spec}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-gray-400 text-sm col-span-2 text-center py-8">No specifications available.</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'features' && (
                                <div className="space-y-8">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-2xl font-extrabold text-[#071322] tracking-tight">
                                            Key Features
                                        </h3>
                                        <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                                            {product.features?.length || 0} features
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {product.features && product.features.length > 0 ? (
                                            product.features.map((feature, idx) => (
                                                <div key={idx} className="flex items-start gap-3 bg-white p-4 rounded-xl border border-gray-200/60 shadow-sm hover:shadow-md transition-shadow">
                                                    <div className="w-8 h-8 rounded-full bg-[#e8f5e9] flex items-center justify-center flex-shrink-0">
                                                        <CheckCircle2 className="w-4 h-4 text-[#1b7936]" />
                                                    </div>
                                                    <span className="text-gray-700 text-sm font-medium leading-snug">{feature}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-gray-400 text-sm col-span-2 text-center py-8">No features available.</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Related Products */}
                    {relatedProducts.length > 0 && (
                        <div className="mt-16 space-y-6 mb-20">
                            <div className="flex items-center justify-between">
                                <h3 className="text-2xl font-extrabold text-[#071322] tracking-tight">
                                    Related Products
                                </h3>
                                <Link href="/ev-chargers" className="text-sm text-[#1b7936] font-semibold hover:underline">
                                    View All →
                                </Link>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {relatedProducts.map((related) => {
                                    const cleanSlug = getCleanSlug(related.id || related.name);
                                    return (
                                        <Link
                                            key={related._id || related.id}
                                            href={`/ev-chargers/${cleanSlug}`}
                                            className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1"
                                        >
                                            <div className="relative h-70 bg-[#f8f9fa]">
                                                <ProductThumbnail
                                                    imageUrl={related.imageUrl}
                                                    name={related.name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                                <div className="absolute top-2 left-2">
                                                    <span className="bg-[#1b7936]/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                        {related.categoryLabel || related.category}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="p-4">
                                                <h4 className="text-sm font-extrabold text-[#071322] group-hover:text-[#1b7936] transition-colors line-clamp-2">
                                                    {related.name}
                                                </h4>
                                                <p className="text-xs text-gray-400 mt-1">{related.model}</p>
                                                <div className="flex items-center justify-between mt-3 overflow-hidden">
                                                    <span className="text-sm text-[#071322] wrap-break-word line-clamp-2 max-w-full">
                                                        <span dangerouslySetInnerHTML={{ __html: related.shortDescription }} />
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}