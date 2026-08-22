// app/(main)/training/[id]/page.tsx
'use client';

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { use } from 'react';
import Image from 'next/image';
import { trainingPrograms, getTrainingProgram, getEventsByProgram } from '@/lib/trainingDb';
import PageHeader from '@/components/pagesComps/PageHeader';
import {
    ArrowLeft,
    Calendar,
    Clock,
    MapPin,
    Users,
    CheckCircle2,
    GraduationCap,
    Award,
    Mail,
    Phone,
    MessageSquare
} from 'lucide-react';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function TrainingDetailPage({ params }: PageProps) {
    const { id } = use(params);
    const program = getTrainingProgram(id);

    if (!program) {
        notFound();
    }

    const events = getEventsByProgram(program.id);

    return (
        <div className="bg-white min-h-screen">
            <PageHeader
                breadcrumbs={[
                    { label: 'Home', link: '/' },
                    { label: 'Training', link: '/training' },
                    { label: program.title }
                ]}
                imageUrl={program.imageUrl}
                title={program.title}
                description={program.description}
            />

            <section className="max-w-7xl mx-auto py-12 pb-24">


                {/* ========================================== */}
                {/* PROGRAM OVERVIEW                           */}
                {/* ========================================== */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <span className="text-5xl">{program.icon}</span>
                            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#071322] tracking-tight">
                                {program.title}
                            </h1>
                        </div>
                        <div className={`${program.color} inline-block text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full`}>
                            {program.badge}
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            {program.details}
                        </p>

                        <div className="flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                                <Clock className="w-5 h-5 text-[#1b7936]" />
                                <span className="font-semibold">{program.duration}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                                <GraduationCap className="w-5 h-5 text-[#1b7936]" />
                                <span className="font-semibold">{program.format}</span>
                            </div>
                            {program.price && (
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Award className="w-5 h-5 text-[#1b7936]" />
                                    <span className="font-semibold">{program.price}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <Link
                                href={`/contact?training=${program.id}`}
                                className="inline-flex items-center gap-2 bg-[#1b7936] hover:bg-[#155f2b] text-white font-bold text-sm px-6 py-3 rounded-xl transition-all"
                            >
                                <MessageSquare className="w-4 h-4" /> Apply Now
                            </Link>
                            <Link
                                href="/contact"
                                className="inline-flex items-center gap-2 bg-[#f8f9fa] border border-gray-200 hover:bg-gray-200 text-[#071322] font-bold text-sm px-6 py-3 rounded-xl transition-all"
                            >
                                Contact Training Team
                            </Link>
                        </div>
                    </div>

                    <div className="relative h-[300px] lg:h-[400px] rounded-3xl overflow-hidden shadow-2xl bg-[#f8f9fa]">
                        <Image
                            src={program.imageUrl}
                            alt={program.title}
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                </div>

                {/* ========================================== */}
                {/* FEATURES SECTION                           */}
                {/* ========================================== */}
                <div className="mb-16">
                    <h3 className="text-2xl font-extrabold text-[#071322] mb-6">
                        Program Features
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {program.features.map((feature, idx) => (
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

                {/* ========================================== */}
                {/* PREREQUISITES                              */}
                {/* ========================================== */}
                {program.prerequisites && program.prerequisites.length > 0 && (
                    <div className="mb-16 bg-[#f8f9fa] rounded-3xl p-8 border border-gray-200/80">
                        <h3 className="text-2xl font-extrabold text-[#071322] mb-4">
                            Prerequisites
                        </h3>
                        <div className="space-y-2">
                            {program.prerequisites.map((prereq, idx) => (
                                <div key={idx} className="flex items-start gap-3">
                                    <div className="w-6 h-6 rounded-full bg-[#1b7936] flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                                    </div>
                                    <span className="text-gray-700 text-sm font-medium">
                                        {prereq}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}


                {/* ========================================== */}
                {/* CONTACT SECTION                           */}
                {/* ========================================== */}
                <div className="bg-gradient-to-br from-[#0c1f38] to-[#1f7a3d] rounded-3xl p-12 text-center text-white">
                    <h2 className="text-3xl font-extrabold mb-4">
                        Have Questions About This Program?
                    </h2>
                    <p className="text-white/80 text-sm max-w-2xl mx-auto mb-8">
                        Our training team is here to help you choose the right program for your needs.
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
                            href="mailto:training@evngen.com"
                            className="flex items-center gap-2 text-white hover:text-[#3ec06a] transition-colors"
                        >
                            <Mail className="w-5 h-5" />
                            training@evngen.com
                        </a>
                        <Link
                            href="/contact"
                            className="bg-white text-[#0c1f38] hover:bg-gray-100 font-bold px-8 py-3.5 rounded-xl transition-colors"
                        >
                            Contact Training Team
                        </Link>
                    </div>
                </div>

            </section>
        </div>
    );
}