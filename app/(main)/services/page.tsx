// app/(main)/services/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/pagesComps/PageHeader';
import { Clock, Award } from 'lucide-react';
import toast from 'react-hot-toast';

interface Service {
    _id: string;
    id: string;
    title: string;
    badge: string;
    description: string;
    richDescription?: string;
    details: string;
    icon: string;
    imageUrl: string;
    link: string;
    color: string;
    features: string[];
    process: string[];
    price: string;
    duration: string;
    actionText: string;
    isActive: boolean;
    category: string;
    createdAt: string;
    updatedAt: string;
}

interface ServiceCategory {
    _id: string;
    id: string;
    name: string;
    slug: string;
    description: string;
    icon: string;
    color: string;
    order: number;
    isActive: boolean;
    serviceCount: number;
}

interface CategoryStats {
    [key: string]: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function ServicesPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [categories, setCategories] = useState<ServiceCategory[]>([]);
    const [activeCategory, setActiveCategory] = useState('all');
    const [isLoading, setIsLoading] = useState(true);
    const [totalServices, setTotalServices] = useState(0);

    // ============================================
    // Fetch Data
    // ============================================
    const fetchServices = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/services`);
            const data = await response.json();

            if (data.success) {
                setServices(data.data || []);
                setTotalServices(data.stats?.total || 0);
            } else {
                toast.error(data.message || 'Failed to load services');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to load services');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchCategories = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/service-categories`);
            const data = await response.json();

            if (data.success) {
                setCategories(data.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    }, []);

    useEffect(() => {
        fetchServices();
        fetchCategories();
    }, [fetchServices, fetchCategories]);

    const createSlug = (text: string) => {
        return text
            .toString()
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-')
            .replace(/^-+/, '')
            .replace(/-+$/, '');
    };


    // ============================================
    // Filter Logic
    // ============================================
    const filteredServices = activeCategory === 'all'
        ? services
        : services.filter(s => s.category === activeCategory);

    // ============================================
    // Helper Functions
    // ============================================
    const getCategoryName = (categoryId: string) => {
        const found = categories.find(c => c.id === categoryId);
        return found?.name || categoryId;
    };

    const getCategoryIcon = (categoryId: string) => {
        const found = categories.find(c => c.id === categoryId);
        return found?.icon || '📂';
    };

    const getCategoryColor = (categoryId: string) => {
        const found = categories.find(c => c.id === categoryId);
        return found?.color || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    const getCategoryServiceCount = (categoryId: string) => {
        return services.filter(s => s.category === categoryId).length;
    };
    console.log(services, "services")
    // ============================================
    // Category Tab Button Component
    // ============================================
    const CategoryTab = ({ category }: { category: ServiceCategory }) => {
        const count = getCategoryServiceCount(category.id);
        const isActive = activeCategory === category.id;

        return (
            <button
                onClick={() => setActiveCategory(category.id)}
                className={`px-5 py-2.5 cursor-pointer text-sm font-bold rounded-full transition-all whitespace-nowrap flex items-center gap-2 ${isActive
                    ? 'bg-[#1b7936] text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
            >
                <span>{category.icon}</span>
                <span>{category.name}</span>
                {count > 0 && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
                        }`}>
                        {count}
                    </span>
                )}
            </button>
        );
    };

    return (
        <div className="bg-white min-h-screen">
            <PageHeader
                breadcrumbs={[
                    { label: 'Home', link: '/' },
                    { label: 'Services' }
                ]}
                imageUrl="/images/help/services-hero.jpg"
                title="Our Services"
                description="End-to-end EV charging services from site survey to ongoing maintenance and support."
            />

            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-24">
                {/* Category Tabs - Dynamic */}
                <div className="mb-10 overflow-x-auto">
                    <div className="flex gap-2 pb-0.5 min-w-max">
                        {/* All Services Tab */}
                        <button
                            onClick={() => setActiveCategory('all')}
                            className={`px-5 py-2.5 cursor-pointer text-sm font-bold rounded-full transition-all whitespace-nowrap flex items-center gap-2 ${activeCategory === 'all'
                                ? 'bg-[#1b7936] text-white shadow-md'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            <span>📋</span>
                            <span>All Services</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${activeCategory === 'all' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
                                }`}>
                                {totalServices}
                            </span>
                        </button>

                        {/* Dynamic Category Tabs - Only show categories with services */}
                        {categories
                            .filter(cat => cat.isActive && getCategoryServiceCount(cat.id) > 0)
                            .map((category) => (
                                <CategoryTab key={category.id} category={category} />
                            ))}
                    </div>
                </div>

                {/* Loading State */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-white border border-gray-200/80 rounded-xl p-6 sm:p-8 animate-pulse">
                                <div className="space-y-3">
                                    <div className="h-4 bg-slate-200 rounded w-24"></div>
                                    <div className="h-6 bg-slate-200 rounded w-48"></div>
                                    <div className="h-20 bg-slate-200 rounded"></div>
                                </div>
                                <div className="mt-4 h-4 bg-slate-200 rounded w-32"></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <>
                        {/* Services Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {filteredServices.map((service) => {
                                const categoryColor = getCategoryColor(service.category);
                                const categoryName = getCategoryName(service.category);
                                const categoryIcon = getCategoryIcon(service.category);

                                return (
                                    <div
                                        key={service.id}
                                        className="bg-white border border-gray-200/80 rounded-xl p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-xs hover:shadow-md transition-all hover:-translate-y-1"
                                    >
                                        <div className="space-y-3">
                                            {/* Category / Badge */}
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-[#1b7936] text-xs font-bold uppercase tracking-wider">
                                                    {service.badge}
                                                </span>
                                                <span className="text-xs text-slate-400">•</span>
                                                <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${categoryColor}`}>
                                                    <span>{categoryIcon}</span>
                                                    <span>{categoryName}</span>
                                                </span>
                                            </div>

                                            {/* Icon & Title */}
                                            <div className="flex items-center gap-3">
                                                <span className="text-3xl">{service.icon}</span>
                                                <h3 className="text-xl font-bold text-[#071322] leading-snug">
                                                    {service.title}
                                                </h3>
                                            </div>

                                            {/* Details / Description */}
                                            <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                                                {service.details || service.description}
                                            </p>

                                            {/* Features Preview */}
                                            {service.features && service.features.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5 mt-1">
                                                    {service.features.slice(0, 3).map((feature, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                                                        >
                                                            ✓ {feature.length > 20 ? feature.slice(0, 20) + '...' : feature}
                                                        </span>
                                                    ))}
                                                    {service.features.length > 3 && (
                                                        <span className="text-xs text-gray-400">
                                                            +{service.features.length - 3} more
                                                        </span>
                                                    )}
                                                </div>
                                            )}

                                            {/* Price & Duration */}
                                            <div className="flex items-center gap-4 text-sm flex-wrap">
                                                {service.price && (
                                                    <div className="flex items-center gap-1 text-gray-600">
                                                        <Award className="w-4 h-4 text-[#1b7936]" />
                                                        <span className="font-semibold text-[#1b7936]">{service.price}</span>
                                                    </div>
                                                )}
                                                {service.duration && (
                                                    <div className="flex items-center gap-1 text-gray-600">
                                                        <Clock className="w-4 h-4 text-[#1b7936]" />
                                                        <span className="font-semibold">{service.duration}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Action Link */}
                                        <div>
                                            <Link
                                                href={`/services/${service.id}`}  // ✅ Use the actual service id
                                                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1b7936] hover:text-[#145a27] hover:underline transition-all group"
                                            >
                                                <span>{service.actionText || "Request a Service"}</span>
                                                <span className="text-base transition-transform group-hover:translate-x-1">→</span>
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* No Results */}
                        {filteredServices.length === 0 && (
                            <div className="text-center py-20">
                                <div className="text-6xl mb-4">🔍</div>
                                <h3 className="text-2xl font-extrabold text-[#071322]">No services found</h3>
                                <p className="text-gray-500 text-sm mt-2">
                                    {activeCategory === 'all'
                                        ? 'No services are currently available.'
                                        : `No services available in "${getCategoryName(activeCategory)}" category.`
                                    }
                                </p>
                                {activeCategory !== 'all' && (
                                    <button
                                        onClick={() => setActiveCategory('all')}
                                        className="mt-4 text-[#1b7936] font-semibold hover:underline"
                                    >
                                        View all services →
                                    </button>
                                )}
                            </div>
                        )}
                    </>
                )}

                {/* CTA */}
                <div className="mt-20 bg-gradient-to-br from-[#0c1f38] to-[#1f7a3d] rounded-3xl p-12 text-center text-white">
                    <h2 className="text-3xl font-extrabold mb-4">
                        Need a Custom Service Package?
                    </h2>
                    <p className="text-white/80 text-sm max-w-2xl mx-auto mb-8">
                        We design comprehensive service packages tailored to your specific needs. Contact us to discuss your requirements.
                    </p>
                    <Link
                        href="/contact"
                        className="bg-white text-[#0c1f38] hover:bg-gray-100 font-bold px-8 py-3.5 rounded-xl transition-colors inline-block"
                    >
                        Contact Our Team
                    </Link>
                </div>
            </section>
        </div>
    );
}