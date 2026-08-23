// app/(main)/services/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { servicesList } from '@/lib/servicesDb';
import PageHeader from '@/components/pagesComps/PageHeader';
import { ArrowRight, CheckCircle2, Clock, Award } from 'lucide-react';

export default function ServicesPage() {
    const [activeCategory, setActiveCategory] = useState('all');

    const categories = [
        { id: 'all', label: 'All Services' },
        { id: 'assessment', label: 'Assessment' },
        { id: 'installation', label: 'Installation' },
        { id: 'maintenance', label: 'Maintenance' },
        { id: 'support', label: 'Support' },
        { id: 'training', label: 'Training' },
        { id: 'custom', label: 'Custom' }
    ];

    const filteredServices = activeCategory === 'all'
        ? servicesList
        : servicesList.filter(s => {
            if (activeCategory === 'assessment') return s.id === 'site-survey-design';
            if (activeCategory === 'installation') return s.id === 'installation-commissioning';
            if (activeCategory === 'maintenance') return s.id === 'maintenance-om';
            if (activeCategory === 'support') return s.id === 'software-remote-support';
            if (activeCategory === 'training') return s.id === 'training-certification';
            if (activeCategory === 'custom') return s.id === 'custom-solutions';
            return true;
        });

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

            <section className="max-w-7xl mx-auto py-12 pb-24">

                {/* Category Tabs */}
                <div className="mb-10 overflow-x-auto">
                    <div className="flex gap-2  pb-0.5 min-w-max">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`px-5 py-2.5 cursor-pointer text-sm font-bold rounded-full transition-all ${activeCategory === cat.id
                                    ? 'bg-[#1b7936] text-white shadow-md'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Services Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredServices.map((service) => (
                        <div
                            key={service.id}
                            className="bg-white border border-gray-200/80 rounded-xl p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-xs hover:shadow-md transition-all"
                        >
                            <div className="space-y-3">
                                {/* Category / Badge */}
                                <span className="text-[#1b7936] text-xs font-bold uppercase tracking-wider block">
                                    {service.badge}
                                </span>

                                {/* Title */}
                                <h3 className="text-xl font-bold text-[#071322] leading-snug">
                                    {service.title}
                                </h3>

                                {/* Details / Description */}
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    {service.details}
                                </p>
                            </div>

                            {/* Action Link */}
                            <div>
                                <Link
                                    href={service.link}
                                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1b7936] hover:text-[#145a27] hover:underline transition-all"
                                >
                                    <span>{service.actionText || "Request a Service"}</span>
                                    <span className="text-base">→</span>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>

                {/* No Results */}
                {filteredServices.length === 0 && (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-2xl font-extrabold text-[#071322]">No services found</h3>
                        <p className="text-gray-500 text-sm mt-2">Try selecting a different category.</p>
                    </div>
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