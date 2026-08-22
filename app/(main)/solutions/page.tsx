'use client';

import Link from 'next/link';
import Image from 'next/image';
import { solutionsList } from '@/lib/solutionsDb';
import { ArrowRight, Zap, ShieldCheck, BatteryCharging, Cpu } from 'lucide-react';

export default function SolutionsPage() {
    // Helper to assign specific icons to solutions
    const getSolutionIcon = (id: string) => {
        switch (id) {
            case 'ev-charging': return <Zap className="w-4 h-4 text-[#3ec06a]" />;
            case 'power-quality': return <ShieldCheck className="w-4 h-4 text-[#3ec06a]" />;
            case 'energy-storage': return <BatteryCharging className="w-4 h-4 text-[#3ec06a]" />;
            default: return <Cpu className="w-4 h-4 text-[#3ec06a]" />;
        }
    };

    return (
        <div className="bg-[#f8f9fa] min-h-screen">

            {/* Hero Section */}
            <section className="relative bg-[#0c1f38] text-white py-24 px-6 md:px-12 lg:px-20 overflow-hidden border-b border-white/10">
                {/* Background Soft Glow Accents */}
                <div className="absolute top-1/4 left-0 w-96 h-96 bg-[#3ec06a]/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#1b7936]/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="max-w-7xl mx-auto relative z-10 space-y-6 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 bg-[#e8f5e9]/10 text-[#3ec06a] border border-[#3ec06a]/30 text-xs font-extrabold tracking-widest px-4 py-1.5 rounded-full uppercase shadow-xs">
                        <Zap className="w-3.5 h-3.5" /> Our Core Technologies
                    </div>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight max-w-3xl mx-auto md:mx-0">
                        Powering the <span className="text-[#3ec06a]">Future</span> of Energy Infrastructure
                    </h1>
                    <p className="text-gray-300 text-base sm:text-lg max-w-2xl leading-relaxed mx-auto md:mx-0">
                        End-to-end modular solutions engineered for high-performance EV charging, grid security, energy storage, and rigorous battery testing.
                    </p>
                </div>
            </section>

            {/* Solutions 3-Column Uniform Grid Section */}
            <section className="max-w-7xl mx-auto py-24 ">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {solutionsList.map((solution) => (
                        <Link
                            key={solution.id}
                            href={solution.link}
                            className="group bg-white rounded-xl shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-200/80 hover:border-[#3ec06a]/60 flex flex-col justify-between"
                        >
                            {/* Image Container with Zoom Effect */}
                            <div className="relative h-60 overflow-hidden bg-[#0c1f38]">
                                <Image
                                    src={solution.imageUrl}
                                    alt={solution.label}
                                    fill
                                    className="object-cover opacity-90 group-hover:scale-110 transition-transform duration-700 ease-out"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0c1f38]/70 via-transparent to-transparent"></div>
                                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold text-[#071322] shadow-sm flex items-center gap-1.5">
                                    {getSolutionIcon(solution.id)}
                                    {solution.desc}
                                </div>
                            </div>

                            {/* Content Container */}
                            <div className="p-8 flex flex-col justify-between flex-1 space-y-6">
                                <div className="space-y-3">
                                    <h3 className="text-xl sm:text-2xl font-extrabold text-[#071322] group-hover:text-[#1b7936] transition-colors">
                                        {solution.label}
                                    </h3>
                                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                                        {solution.subtitle}
                                    </p>
                                </div>

                                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                                    <span className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#1b7936]">
                                        Explore Solution <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                                    </span>
                                    <span className="text-[11px] font-bold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-md">
                                        Modular
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Bottom Support CTA Banner */}
            <section className="pb-24 px-6 md:px-12 lg:px-20 max-w-7xl mx-auto">
                <div className="bg-[#0c1f38] text-white rounded-3xl p-8 sm:p-14 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-xl">
                    <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-[#3ec06a]/10 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="space-y-3 relative z-10 max-w-xl text-center md:text-left">
                        <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                            Need a custom engineering specification?
                        </h3>
                        <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                            Our team provides custom hardware integration, load calculations, and full OCPP software deployment support.
                        </p>
                    </div>
                    <div className="relative z-10 flex-shrink-0">
                        <Link
                            href="/contact"
                            className="inline-flex items-center gap-2 bg-[#3ec06a] hover:bg-[#34a55b] text-[#071322] font-bold text-sm px-8 py-4 rounded-xl shadow-lg transition-all"
                        >
                            Request Engineering Consult
                        </Link>
                    </div>
                </div>
            </section>

        </div>
    );
}