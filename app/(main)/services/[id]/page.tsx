// app/(main)/services/[id]/page.tsx
'use client';

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { use } from 'react';
import Image from 'next/image';
import { servicesList, getRelatedServices } from '@/lib/servicesDb';
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

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function ServiceDetailPage({ params }: PageProps) {
    const { id } = use(params);
    const service = servicesList.find(s => s.id === id);

    if (!service) {
        notFound();
    }

    const relatedServices = getRelatedServices(service.id, 3);

    return (
        <div className="bg-white min-h-screen">
            <PageHeader
                breadcrumbs={[
                    { label: 'Home', link: '/' },
                    { label: 'Services', link: '/services' },
                    { label: service.title }
                ]}
                imageUrl={service.imageUrl}
                title={service.title}
                description={service.description}
            />

            <section className="max-w-7xl mx-auto px-6 md:px-12 py-12 pb-24">

                {/* Back Link */}
                <Link
                    href="/services"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#1b7936] hover:text-[#071322] transition-colors mb-8"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to All Services
                </Link>

                {/* Overview */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <span className="text-5xl">{service.icon}</span>
                            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#071322] tracking-tight">
                                {service.title}
                            </h1>
                        </div>
                        <div className={`${service.color} inline-block text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full`}>
                            {service.badge}
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            {service.details}
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
                                <MessageSquare className="w-4 h-4" /> Request This Service
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
                        <Image
                            src={service.imageUrl}
                            alt={service.title}
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                </div>

                {/* Features */}
                <div className="mb-16">
                    <h3 className="text-2xl font-extrabold text-[#071322] mb-6">
                        Service Features
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {service.features.map((feature, idx) => (
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
                {relatedServices.length > 0 && (
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
                            {relatedServices.map((related) => (
                                <Link
                                    key={related.id}
                                    href={related.link}
                                    className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1"
                                >
                                    <div className={`${related.color} p-4 flex items-center gap-3`}>
                                        <span className="text-2xl">{related.icon}</span>
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
                            ))}
                        </div>
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