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
                                className={`px-5 py-2.5 text-sm font-bold rounded-full transition-all ${activeCategory === cat.id
                                    ? 'bg-[#1b7936] text-white shadow-md'
                                    : 'text-gray-500 hover:text-[#071322] hover:bg-gray-100'
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {filteredPrograms.map((program) => (
                        <div
                            key={program.id}
                            className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 group"
                        >
                            {/* Program Header with Icon */}
                            <div className={`${program.color} p-6 flex items-center justify-between`}>
                                <div className="flex items-center gap-4">
                                    <div className="text-4xl">{program.icon}</div>
                                    <div>
                                        <div className="text-white/80 text-xs font-bold uppercase tracking-wider">
                                            {program.badge}
                                        </div>
                                        <h3 className="text-white font-extrabold text-xl leading-tight">
                                            {program.title}
                                        </h3>
                                    </div>
                                </div>
                                <div className="text-white/50 group-hover:text-white transition-colors">
                                    <ArrowRight className="w-6 h-6" />
                                </div>
                            </div>

                            {/* Program Details */}
                            <div className="p-6 space-y-4">
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    {program.details}
                                </p>

                                {/* Program Info */}
                                <div className="flex flex-wrap gap-4 text-xs">
                                    <div className="flex items-center gap-1.5 text-gray-500">
                                        <Clock className="w-4 h-4 text-[#1b7936]" />
                                        {program.duration}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-gray-500">
                                        <GraduationCap className="w-4 h-4 text-[#1b7936]" />
                                        {program.format}
                                    </div>
                                    {program.price && (
                                        <div className="flex items-center gap-1.5 text-gray-500">
                                            <Award className="w-4 h-4 text-[#1b7936]" />
                                            {program.price}
                                        </div>
                                    )}
                                </div>

                                {/* Features Preview */}
                                <div className="space-y-1.5">
                                    {program.features.slice(0, 3).map((feature, idx) => (
                                        <div key={idx} className="flex items-start gap-2 text-xs text-gray-600">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-[#3ec06a] flex-shrink-0 mt-0.5" />
                                            <span>{feature}</span>
                                        </div>
                                    ))}
                                    {program.features.length > 3 && (
                                        <div className="text-xs text-gray-400 ml-5">
                                            +{program.features.length - 3} more
                                        </div>
                                    )}
                                </div>

                                {/* Action Button */}
                                <Link
                                    href={program.link}
                                    className="block w-full text-center bg-[#1b7936] hover:bg-[#155f2b] text-white font-bold text-sm py-3 rounded-xl transition-all"
                                >
                                    Apply for Certification →
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