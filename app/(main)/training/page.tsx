// app/(main)/training/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { trainingPrograms, getUpcomingEvents } from '@/lib/trainingDb';
import PageHeader from '@/components/pagesComps/PageHeader';
import {
    ArrowRight,
    Calendar,
    Clock,
    MapPin,
    Users,
    CheckCircle2,
    GraduationCap,
    Award,
    Zap,
    ShieldCheck,
    Wrench,
    MessageSquare
} from 'lucide-react';

export default function TrainingPage() {
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const upcomingEvents = getUpcomingEvents(3);

    // Categories
    const categories = [
        { id: 'all', label: 'All Programs' },
        { id: 'certification', label: 'Certification' },
        { id: 'technical', label: 'Technical Training' },
        { id: 'safety', label: 'Safety & Compliance' },
        { id: 'software', label: 'Software & Platform' }
    ];

    // Filter programs based on category
    const filteredPrograms = activeCategory === 'all'
        ? trainingPrograms
        : trainingPrograms.filter(p => {
            if (activeCategory === 'certification') return p.badge.includes('CERTIFICATION');
            if (activeCategory === 'technical') return p.title.includes('Technician') || p.title.includes('Diagnostics');
            if (activeCategory === 'safety') return p.title.includes('Safety');
            if (activeCategory === 'software') return p.title.includes('OCPP') || p.title.includes('Platform');
            return true;
        });

    return (
        <div className="bg-white min-h-screen">
            <PageHeader
                breadcrumbs={[
                    { label: 'Home', link: '/' },
                    { label: 'Training' }
                ]}
                imageUrl="/images/help/training-hero.jpg"
                title="Training & Certification"
                description="Programs for installers, technicians, and operators to install, maintain, and troubleshoot EV charging systems."
            />

            <section className="max-w-7xl mx-auto py-12 pb-24">

                {/* ========================================== */}
                {/* CATEGORY TABS                              */}
                {/* ========================================== */}
                <div className="mb-10 overflow-x-auto">
                    <div className="flex gap-2 min-w-max pb-2">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={` px-5 py-2.5 text-sm font-bold cursor-pointer rounded-full transition-all ${activeCategory === cat.id
                                    ? 'bg-[#1b7936] text-white shadow-md'
                                    : 'text-gray-500 bg-[#e4e4e4] hover:text-[#071322] hover:bg-gray-100'
                                    }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ========================================== */}
                {/* TRAINING PROGRAMS GRID                    */}
                {/* ========================================== */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredPrograms.map((program) => (
                        <div
                            key={program.id}
                            className="bg-white border border-gray-200/80 rounded-xl p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-xs hover:shadow-md transition-all"
                        >
                            <div className="space-y-3">
                                {/* Badge / Category */}
                                <span className="text-[#1b7936] text-xs font-bold uppercase tracking-wider block">
                                    {program.badge}
                                </span>

                                {/* Title */}
                                <h3 className="text-xl font-bold text-[#071322] leading-snug">
                                    {program.title}
                                </h3>

                                {/* Description / Details */}
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    {program.details}
                                </p>
                            </div>

                            {/* Action Link */}
                            <div>
                                <Link
                                    href={program.link}
                                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1b7936] hover:text-[#145a27] hover:underline transition-all"
                                >
                                    <span>{program.actionText || "Apply for Certification"}</span>
                                    <span className="text-base">→</span>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
                {/* ========================================== */}
                {/* CTA SECTION                               */}
                {/* ========================================== */}
                <div className="mt-20 bg-gradient-to-br from-[#0c1f38] to-[#1f7a3d] rounded-3xl p-12 text-center text-white">
                    <h2 className="text-3xl font-extrabold mb-4">
                        Need Custom Training?
                    </h2>
                    <p className="text-white/80 text-sm max-w-2xl mx-auto mb-8">
                        We offer customized training programs tailored to your organization's specific needs. Contact our training team to discuss your requirements.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link
                            href="/contact"
                            className="bg-white text-[#0c1f38] hover:bg-gray-100 font-bold px-8 py-3.5 rounded-xl transition-colors"
                        >
                            Contact Training Team
                        </Link>
                        <Link
                            href="/request-survey"
                            className="bg-white/20 hover:bg-white/30 text-white font-bold px-8 py-3.5 rounded-xl border border-white/30 transition-colors"
                        >
                            Request Custom Program
                        </Link>
                    </div>
                </div>

            </section>
        </div>
    );
}