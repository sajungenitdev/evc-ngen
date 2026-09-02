// app/(main)/services/[id]/page.tsx
'use client';

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { use } from 'react';
import Image from 'next/image';
import PageHeader from '@/components/pagesComps/PageHeader';
import {
    ArrowLeft,
    CheckCircle2,
    Clock,
    Award,
    Mail,
    Phone,
    MessageSquare,
    ArrowRight,
    Loader2
} from 'lucide-react';
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
    related?: Service[];
}

interface ServiceCategory {
    _id: string;
    id: string;
    name: string;
    icon: string;
    color: string;
    isActive: boolean;
}

interface PageProps {
    params: Promise<{ id: string }>;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function ServiceDetailPage({ params }: PageProps) {
    const { id } = use(params);
    const decodedId = decodeURIComponent(id);
    const [service, setService] = useState<Service | null>(null);
    const [allServices, setAllServices] = useState<Service[]>([]);
    const [categories, setCategories] = useState<ServiceCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [notFoundError, setNotFoundError] = useState(false);

    // ============================================
    // Fetch Categories
    // ============================================
    const fetchCategories = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/service-categories`);
            const data = await response.json();
            if (data.success) {
                setCategories(data.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    // ============================================
    // Create Slug Helper
    // ============================================
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
    // Fetch Service - IMPROVED
    // ============================================

    const fetchService = useCallback(async () => {
        setIsLoading(true);
        setNotFoundError(false);

        try {
            // Try direct lookup first
            const encodedId = encodeURIComponent(decodedId);
            const response = await fetch(`${API_BASE_URL}/services/${encodedId}`);
            const data = await response.json();

            if (data.success && data.data) {
                setService(data.data);
                setIsLoading(false);
                return;
            }

            // If direct lookup fails, try all services
            const allServicesResponse = await fetch(`${API_BASE_URL}/services?limit=1000`);
            const allServicesData = await allServicesResponse.json();

            if (allServicesData.success && Array.isArray(allServicesData.data)) {
                const servicesList = allServicesData.data;
                setAllServices(servicesList);

                // Try to find by matching id or title
                let found = servicesList.find((s: Service) => {
                    // Check if the URL slug matches the service id (with or without timestamp)
                    const serviceId = s.id || '';
                    const cleanServiceId = serviceId.replace(/-\d+$/, '');
                    const cleanUrlId = decodedId.replace(/-\d+$/, '');

                    return serviceId === decodedId ||
                        cleanServiceId === cleanUrlId ||
                        s.title.toLowerCase() === decodedId.replace(/-/g, ' ').toLowerCase() ||
                        s.title.toLowerCase().replace(/\s+/g, '-') === decodedId;
                });

                if (found) {
                    setService(found);
                    setIsLoading(false);
                    return;
                }

                setNotFoundError(true);
                setIsLoading(false);
                toast.error('Service not found');
                return;
            }

            setNotFoundError(true);
            setIsLoading(false);

        } catch (error: any) {
            console.error('Fetch error:', error);
            setNotFoundError(true);
            setIsLoading(false);
            toast.error(error.message || 'Failed to load service');
        }
    }, [decodedId]);

    // ============================================
    // Initial Fetch
    // ============================================
    useEffect(() => {
        if (decodedId) {
            fetchService();
            fetchCategories();
        }
    }, [decodedId, fetchService]);

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

    // ============================================
    // Loading State
    // ============================================
    if (isLoading) {
        return (
            <div className="bg-white min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-[#1b7936] animate-spin mx-auto" />
                    <p className="text-gray-500 text-sm mt-4">Loading service details...</p>
                </div>
            </div>
        );
    }

    if (!service || notFoundError) {
        return (
            <div className="bg-white min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                    <div className="text-6xl mb-6">🔍</div>
                    <h1 className="text-3xl font-extrabold text-[#071322] mb-4">Service Not Found</h1>
                    <p className="text-gray-500 text-sm max-w-md mx-auto mb-8">
                        The service you're looking for doesn't exist or has been removed.
                    </p>
                    <Link
                        href="/services"
                        className="inline-flex items-center gap-2 bg-[#1b7936] hover:bg-[#155f2b] text-white font-bold px-6 py-3 rounded-xl transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Services
                    </Link>
                </div>
            </div>
        );
    }

    // Get related services from the service object
    const relatedServices = service.related || [];

    return (
        <div className="bg-white min-h-screen">
            <PageHeader
                breadcrumbs={[
                    { label: 'Home', link: '/' },
                    { label: 'Services', link: '/services' },
                    { label: service.title }
                ]}
                imageUrl={service.imageUrl || '/images/help/services-hero.jpg'}
                title={service.title}
                description={service.description}
            />

            <section className="max-w-7xl mx-auto py-12 pb-24 px-4 sm:px-6 lg:px-8">

                {/* Overview */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16 items-center">
                    <div className="space-y-6">
                        <div className={`${service.color} inline-block text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full`}>
                            {service.badge}
                        </div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#071322] tracking-tight">
                                {service.title}
                            </h1>
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: service.details }} />

                        <div className="flex flex-wrap gap-4 text-sm">
                            {service.price && (
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Award className="w-5 h-5 text-[#1b7936]" />
                                    <span className="font-semibold">{service.price}</span>
                                </div>
                            )}
                            {service.duration && (
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Clock className="w-5 h-5 text-[#1b7936]" />
                                    <span className="font-semibold">{service.duration}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <Link
                                href={`/contact?service=${service.id}`}
                                className="inline-flex items-center gap-2 bg-[#1b7936] hover:bg-[#155f2b] text-white font-bold text-sm px-6 py-3 rounded-xl transition-all"
                            >
                                <MessageSquare className="w-4 h-4" />
                                Request This Service
                            </Link>
                            <Link
                                href="/contact"
                                className="inline-flex items-center gap-2 bg-[#f8f9fa] border border-gray-200 hover:bg-gray-200 text-[#071322] font-bold text-sm px-6 py-3 rounded-xl transition-all"
                            >
                                Contact Our Team
                            </Link>
                        </div>
                    </div>

                    <div className="relative h-[300px] lg:h-[400px] rounded-md overflow-hidden shadow-2xl bg-[#f8f9fa]">
                        {service.imageUrl && !service.imageUrl.startsWith('data:') ? (
                            <Image
                                src={service.imageUrl}
                                alt={service.title}
                                fill
                                className="object-cover"
                                priority
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    const parent = target.parentElement;
                                    if (parent) {
                                        const fallback = document.createElement('div');
                                        fallback.className = 'w-full h-full flex items-center justify-center text-6xl text-slate-300';
                                        fallback.textContent = service.icon || '📋';
                                        parent.appendChild(fallback);
                                    }
                                }}
                            />
                        ) : service.imageUrl && service.imageUrl.startsWith('data:') ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={service.imageUrl}
                                alt={service.title}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-6xl text-slate-300">
                                {service.icon}
                            </div>
                        )}
                    </div>
                </div>

                {/* Rich Description */}
                {service.richDescription && (
                    <div className="mb-10">
                        <div
                            className="rich-text-content text-gray-600 text-sm leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: service.richDescription }}
                        />
                    </div>
                )}

                {/* Features */}
                {service.features && service.features.length > 0 && (
                    <div className="mb-10">
                        <h3 className="text-2xl font-extrabold text-[#071322] mb-6">
                            Service Features
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {service.features.map((feature, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-start gap-3 bg-white p-4 rounded-xl border border-gray-200/60 shadow-sm hover:shadow-md transition-shadow"
                                >
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

                {/* Process */}
                {service.process && service.process.length > 0 && (
                    <div className="mb-16 bg-[#f8f9fa] rounded-3xl p-8 border border-gray-200/80">
                        <h3 className="text-2xl font-extrabold text-[#071322] mb-6">
                            Our Process
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {service.process.map((step, idx) => (
                                <div key={idx} className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-[#1b7936] flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
                                        {idx + 1}
                                    </div>
                                    <span className="text-gray-700 text-sm font-medium leading-snug">
                                        {step}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Related Services */}
                {relatedServices.length > 0 ? (
                    <div className="mt-16">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-extrabold text-[#071322]">
                                Related Services
                            </h3>
                            <Link
                                href="/services"
                                className="text-sm text-[#1b7936] font-semibold hover:underline"
                            >
                                View All →
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {relatedServices.map((related) => {
                                const relatedLink = related.link && !related.link.includes(' ')
                                    ? related.link
                                    : `/services/${createSlug(related.id || related.title)}`;

                                return (
                                    <Link
                                        key={related._id || related.id}
                                        href={relatedLink}
                                        className="group bg-white border border-gray-200 rounded-md overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1"
                                    >
                                        <div className={`${related.color || 'bg-[#0c1f38]'} p-4 flex items-center gap-3`}>
                                            <span className="text-2xl">{related.icon || '📋'}</span>
                                            <h4 className="text-white font-extrabold text-sm truncate">
                                                {related.title}
                                            </h4>
                                        </div>
                                        <div className="p-4">
                                            <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">
                                                {related.description}
                                            </p>
                                            <div className="mt-2 text-[#1b7936] font-semibold text-xs group-hover:underline flex items-center gap-1">
                                                Learn More <ArrowRight className="w-3 h-3" />
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="mt-16 bg-gray-50 rounded-3xl p-12 text-center border border-gray-200/80">
                        <div className="text-5xl mb-4">🔗</div>
                        <h3 className="text-xl font-extrabold text-[#071322] mb-2">
                            No Related Services
                        </h3>
                        <p className="text-gray-500 text-sm max-w-md mx-auto">
                            There are currently no other services in the{' '}
                            <strong>{getCategoryName(service.category)}</strong> category.
                        </p>
                        <Link
                            href="/services"
                            className="inline-flex items-center gap-2 mt-4 text-[#1b7936] font-semibold hover:underline text-sm"
                        >
                            Browse all services <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                )}

                {/* CTA */}
                <div className="mt-16 bg-gradient-to-br from-[#0c1f38] to-[#1f7a3d] rounded-3xl p-12 text-center text-white">
                    <h2 className="text-3xl font-extrabold mb-4">
                        Ready to Get Started?
                    </h2>
                    <p className="text-white/80 text-sm max-w-2xl mx-auto mb-8">
                        Contact our team to discuss your service needs and get a customized solution.
                    </p>
                    <div className="flex flex-wrap justify-center gap-6">
                        <a
                            href="tel:+18005550199"
                            className="flex items-center gap-2 text-white hover:text-[#3ec06a] transition-colors"
                        >
                            <Phone className="w-5 h-5" />
                            +1 (800) 555-0199
                        </a>
                        <a
                            href="mailto:services@evngen.com"
                            className="flex items-center gap-2 text-white hover:text-[#3ec06a] transition-colors"
                        >
                            <Mail className="w-5 h-5" />
                            services@evngen.com
                        </a>
                        <Link
                            href="/contact"
                            className="bg-white text-[#0c1f38] hover:bg-gray-100 font-bold px-8 py-3.5 rounded-xl transition-colors"
                        >
                            Contact Our Team
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}