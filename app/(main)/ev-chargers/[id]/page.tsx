// app/(main)/ev-chargers/[id]/ProductDetailClient.tsx
'use client';

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { productsList, brandsList, getRelatedProducts } from '@/lib/productsDb';
import PageHeader from '@/components/pagesComps/PageHeader';
import {
    CheckCircle2,
    ArrowLeft,
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
} from 'lucide-react';
import Image from 'next/image';
import ProductImageGallery from '@/components/Products/ProductImageGallery';

interface ProductDetailClientProps {
    id: string;
}

export default function ProductDetailClient({ id }: ProductDetailClientProps) {
    const [isMounted, setIsMounted] = useState(false);
    const [activeTab, setActiveTab] = useState('description');
    
    useEffect(() => {
        setIsMounted(true);
    }, []);

    const product = productsList.find((p) => p.id === id);

    if (!isMounted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1b7936] mx-auto"></div>
                    <p className="text-gray-500 mt-4 text-sm">Loading product details...</p>
                </div>
            </div>
        );
    }

    if (!product) {
        notFound();
    }

    const brand = brandsList.find(b => b.id === product.brand);
    const relatedProducts = getRelatedProducts(product.id, 3);

    // Generate multiple images for slider
    const productImages = product.galleryImages || [product.imageUrl];

    // Technical details mapping with icons
    const techDetails = [
        { label: 'Power Output', value: product.technicalDetails.powerOutput, icon: Zap },
        { label: 'Input Voltage', value: product.technicalDetails.inputVoltage, icon: Battery },
        { label: 'Connector Type', value: product.technicalDetails.connectorType, icon: Plug },
        { label: 'Enclosure Rating', value: product.technicalDetails.enclosureRating, icon: Shield },
        { label: 'Warranty', value: product.technicalDetails.warranty, icon: Calendar },
        { label: 'Dimensions', value: product.technicalDetails.dimensions, icon: Ruler },
        { label: 'Weight', value: product.technicalDetails.weight, icon: Weight },
    ];

    // Tab data
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
                imageUrl={product.imageUrl}
                title={product.name}
                description={`Model: ${product.model} — High-performance ${product.categoryLabel.toLowerCase()} engineered for reliability.`}
            />

            <section className="py-8 px-4 md:px-8 lg:px-16">
                <div className="max-w-7xl mx-auto">

                    {/* Back Link */}
                    <div className="mb-6">
                        <Link
                            href="/ev-chargers"
                            className="inline-flex items-center gap-2 text-sm font-semibold text-[#1b7936] hover:text-[#071322] transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back to EV Chargers
                        </Link>
                    </div>

                    {/* ========================================== */}
                    {/* MAIN PRODUCT SECTION - Image Slider + Info  */}
                    {/* ========================================== */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                        {/* LEFT: Image Gallery */}
                        <div className="lg:sticky lg:top-24 self-start">
                            <ProductImageGallery
                                images={productImages}
                                productName={product.name}
                            />
                        </div>

                        {/* RIGHT: Product Information */}
                        <div className="space-y-6">
                            {/* Badges */}
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 bg-[#e8f5e9] text-[#1b7936] border border-[#1b7936]/20 text-xs font-extrabold uppercase px-3 py-1 rounded-full">
                                    <ShieldCheck className="w-3.5 h-3.5" /> Certified
                                </span>
                                <span className="inline-flex items-center gap-1.5 bg-[#f0f0f0] text-[#071322] text-xs font-extrabold uppercase px-3 py-1 rounded-full">
                                    {product.categoryLabel}
                                </span>
                                {brand && (
                                    <span className="inline-flex items-center gap-1.5 bg-[#f0f0f0] text-[#071322] text-xs font-extrabold uppercase px-3 py-1 rounded-full">
                                        {brand.name}
                                    </span>
                                )}
                            </div>

                            {/* Product Name & Model */}
                            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#071322] tracking-tight">
                                {product.name}
                            </h1>
                            <p className="text-sm text-gray-400 font-bold">Model: {product.model}</p>

                            {/* Rating */}
                            <div className="flex items-center gap-3">
                                <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-5 h-5 ${i < Math.floor(product.rating)
                                                ? 'text-yellow-400 fill-yellow-400'
                                                : i < product.rating
                                                    ? 'text-yellow-400 fill-yellow-400 opacity-50'
                                                    : 'text-gray-300'
                                                }`}
                                        />
                                    ))}
                                </div>
                                <span className="text-sm font-bold text-[#071322]">{product.rating}</span>
                                <span className="text-sm text-gray-400">(24 reviews)</span>
                            </div>

                            {/* Price */}
                            <div className="flex items-center gap-3">
                                <span className="text-3xl font-extrabold text-[#071322]">
                                    ${product.price}
                                </span>
                                <span className="text-sm text-gray-400 line-through">${(product.price * 1.2).toFixed(0)}</span>
                                <span className="bg-[#e8f5e9] text-[#1b7936] text-xs font-bold px-2.5 py-1 rounded-full">
                                    Save 20%
                                </span>
                            </div>

                            {/* Short Description */}
                            <p className="text-gray-600 text-sm leading-relaxed">
                                {product.shortDescription || product.description}
                            </p>

                            {/* Key Specifications - Quick Overview */}
                            <div className="bg-[#f8f9fa] rounded-2xl p-4 space-y-2">
                                <h4 className="text-xs font-extrabold text-[#071322] uppercase tracking-wider">
                                    Key Specifications
                                </h4>
                                <div className="grid grid-cols-2 gap-3">
                                    {product.specs.slice(0, 4).map((spec, idx) => (
                                        <div key={idx} className="flex items-start gap-2 text-xs text-gray-600">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-[#3ec06a] flex-shrink-0 mt-0.5" />
                                            <span className="font-medium">{spec}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-3 pt-2">
                                <Link
                                    href={`/contact?product=${product.model}`}
                                    className="flex-1 min-w-[200px] inline-flex items-center justify-center gap-2 bg-[#1b7936] hover:bg-[#155f2b] text-white font-bold text-sm px-6 py-3.5 rounded-xl shadow-md transition-all"
                                >
                                    <MessageSquare className="w-4 h-4" /> Send Inquiry Now
                                </Link>
                                <Link
                                    href={`/request-survey`}
                                    className="flex-1 min-w-[160px] inline-flex items-center justify-center gap-2 bg-[#f8f9fa] border border-gray-200 hover:bg-gray-200 text-[#071322] font-bold text-sm px-6 py-3.5 rounded-xl transition-all"
                                >
                                    Request Site Survey
                                </Link>
                            </div>

                            {/* Quick Info */}
                            <div className="grid grid-cols-3 gap-3 pt-2">
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
                            </div>

                            {/* Contact Info */}
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

                    {/* ========================================== */}
                    {/* TABS NAVIGATION                            */}
                    {/* ========================================== */}
                    <div className="mt-16">
                        <div className="border-b border-gray-200 relative">
                            <nav className="flex gap-8 overflow-x-auto">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`pb-4 text-sm font-bold transition-colors relative whitespace-nowrap ${
                                            activeTab === tab.id
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

                        {/* Tab Content */}
                        <div className="mt-8">
                            {/* Description Tab */}
                            {activeTab === 'description' && (
                                <div>
                                    <h3 className="text-2xl font-extrabold text-[#071322] tracking-tight mb-4">
                                        Product Description
                                    </h3>
                                    <p className="text-gray-600 text-base leading-relaxed text-justify">
                                        {product.description}
                                    </p>
                                </div>
                            )}

                            {/* Specifications Tab */}
                            {activeTab === 'specifications' && (
                                <div className="space-y-8">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-2xl font-extrabold text-[#071322] tracking-tight">
                                            Technical Specifications
                                        </h3>
                                        <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                                            {product.specs.length} specs
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {product.specs.map((spec, idx) => (
                                            <div key={idx} className="flex items-start gap-3 bg-white p-4 rounded-xl border border-gray-200/60 shadow-sm hover:shadow-md transition-shadow">
                                                <CheckCircle2 className="w-5 h-5 text-[#3ec06a] flex-shrink-0 mt-0.5" />
                                                <span className="text-gray-700 text-sm font-medium leading-snug">
                                                    {spec}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Features Tab */}
                            {activeTab === 'features' && (
                                <div className="space-y-8">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-2xl font-extrabold text-[#071322] tracking-tight">
                                            Key Features
                                        </h3>
                                        <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                                            {product.features.length} features
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {product.features.map((feature, idx) => (
                                            <div key={idx} className="flex items-start gap-3 bg-white p-4 rounded-xl border border-gray-200/60 shadow-sm hover:shadow-md transition-shadow">
                                                <div className="w-8 h-8 rounded-full bg-[#e8f5e9] flex items-center justify-center flex-shrink-0">
                                                    <CheckCircle2 className="w-4 h-4 text-[#1b7936]" />
                                                </div>
                                                <span className="text-gray-700 text-sm font-medium leading-snug">
                                                    {feature}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ========================================== */}
                    {/* RELATED PRODUCTS                           */}
                    {/* ========================================== */}
                    {relatedProducts.length > 0 ? (
                        <div className="mt-16 space-y-6 mb-20">
                            <div className="flex items-center justify-between">
                                <h3 className="text-2xl font-extrabold text-[#071322] tracking-tight">
                                    Related Products
                                </h3>
                                <Link
                                    href="/ev-chargers"
                                    className="text-sm text-[#1b7936] font-semibold hover:underline"
                                >
                                    View All →
                                </Link>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {relatedProducts.map((related) => (
                                    <Link
                                        key={related.id}
                                        href={`/ev-chargers/${related.id}`}
                                        className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1"
                                    >
                                        <div className="relative h-48 bg-[#f8f9fa]">
                                            <Image
                                                src={related.imageUrl}
                                                alt={related.name}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                            <div className="absolute top-2 left-2">
                                                <span className="bg-[#1b7936]/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                    {related.categoryLabel}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <h4 className="text-sm font-extrabold text-[#071322] group-hover:text-[#1b7936] transition-colors line-clamp-2">
                                                {related.name}
                                            </h4>
                                            <p className="text-xs text-gray-400 mt-1">{related.model}</p>
                                            <div className="flex items-center justify-between mt-3">
                                                <span className="text-sm font-bold text-[#071322]">${related.price}</span>
                                                <div className="flex items-center gap-0.5">
                                                    <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                                                    <span className="text-xs text-gray-400">{related.rating}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="mt-16 bg-[#f8f9fa] rounded-2xl p-8 text-center border border-gray-200">
                            <div className="text-4xl mb-3">🔌</div>
                            <h3 className="text-xl font-extrabold text-[#071322] mb-2">
                                More Products Coming Soon
                            </h3>
                            <p className="text-gray-500 text-sm max-w-md mx-auto">
                                We're expanding our {product.categoryLabel} lineup. Check back soon for more options.
                            </p>
                            <Link
                                href="/ev-chargers"
                                className="inline-block mt-4 text-[#1b7936] font-semibold hover:underline"
                            >
                                Browse All Products →
                            </Link>
                        </div>
                    )}

                </div>
            </section>
        </main>
    );
}