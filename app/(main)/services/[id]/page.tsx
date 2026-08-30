// app/(main)/services/[id]/page.tsx
'use client';

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
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
    ArrowRight
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
    const [categories, setCategories] = useState<ServiceCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);

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
    // Fetch Service
    // ============================================
    useEffect(() => {
        const fetchService = async () => {
            setIsLoading(true);
            try {
                const encodedId = encodeURIComponent(decodedId);
                const response = await fetch(`${API_BASE_URL}/services/${encodedId}`);
                const data = await response.json();

                if (data.success) {
                    setService(data.data);
                } else {
                    toast.error(data.message || 'Service not found');
                }
            } catch (error: any) {
                console.error('Fetch error:', error);
                toast.error(error.message || 'Failed to load service');
            } finally {
                setIsLoading(false);
            }
        };

        if (decodedId) {
            fetchService();
            fetchCategories();
        }
    }, [decodedId]);

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

    // Helper to create clean slug
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
    // Loading State
    // ============================================
    if (isLoading) {
        return (
            <div className="bg-white min-h-screen">
                <div className="max-w-7xl mx-auto py-12 pb-24">
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
            </div>
        );
    }

    if (!service) {
        notFound();
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

            <section className="max-w-7xl mx-auto py-12 pb-24">

                {/* Overview */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                    <div className="space-y-6">
                        <div className={`${service.color} inline-block text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full`}>
                            {service.badge}
                        </div>
                        <div className="flex items-center gap-3">
                            {/* <span className="text-5xl">{service.icon}</span> */}
                            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#071322] tracking-tight">
                                {service.title}
                            </h1>
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            {service.details || service.description}
                        </p>

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

                    <div className="relative h-[300px] lg:h-[400px] rounded-3xl overflow-hidden shadow-2xl bg-[#f8f9fa]">
                        {service.imageUrl && !service.imageUrl.startsWith('data:') ? (
                            <Image
                                src={service.imageUrl}
                                alt={service.title}
                                fill
                                className="object-cover"
                                priority
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
                <div className="mb-10">
                    {service.richDescription && (
                        <div className="w-full">
                            <div
                                className="rich-text-content text-gray-600 text-sm leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: service.richDescription }}
                            />
                        </div>
                    )}
                </div>
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
                                        className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1"
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