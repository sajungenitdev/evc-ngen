// app/(main)/solutions/page.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { ArrowRight, Zap, ShieldCheck, BatteryCharging, Cpu, Loader2 } from 'lucide-react';
import { getImageUrl, isDefaultImage } from '@/utils/imageHelper';

interface Solution {
    _id: string;
    id: string;
    label: string;
    link: string;
    desc: string;
    imageUrl: string;
    title: string;
    subtitle: string;
    overview: string;
    isActive: boolean;
    features: string[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://evc-ngen-server.onrender.com/api';

// Helper to assign specific icons to solutions
const getSolutionIcon = (id: string) => {
    switch (id) {
        case 'ev-charging': return <Zap className="w-4 h-4 text-[#3ec06a]" />;
        case 'power-quality': return <ShieldCheck className="w-4 h-4 text-[#3ec06a]" />;
        case 'energy-storage': return <BatteryCharging className="w-4 h-4 text-[#3ec06a]" />;
        default: return <Cpu className="w-4 h-4 text-[#3ec06a]" />;
    }
};

// ✅ Image Component for Solutions
const SolutionImage: React.FC<{
    src: string;
    alt: string;
    className?: string;
    fallback?: string;
}> = ({ src, alt, className = 'w-full h-full object-cover', fallback = '📋' }) => {
    const [hasError, setHasError] = useState(false);

    const fullUrl = src ? getImageUrl(src) : null;
    const isValidImage = fullUrl && !hasError && !isDefaultImage(src);

    if (!isValidImage) {
        return (
            <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
                <span className="text-4xl">{fallback}</span>
            </div>
        );
    }

    return (
        <img
            src={fullUrl}
            alt={alt}
            className={className}
            onError={() => setHasError(true)}
            loading="lazy"
        />
    );
};

export default function SolutionsPage() {
    const [solutions, setSolutions] = useState<Solution[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSolutions = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/solutions`);
                const data = await response.json();
                if (data.success) {
                    setSolutions(data.data.filter((s: Solution) => s.isActive !== false));
                }
            } catch (error) {
                console.error('Failed to fetch solutions:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSolutions();
    }, []);

    // Loading state
    if (isLoading) {
        return (
            <div className="bg-[#f8f9fa] min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="animate-spin h-12 w-12 text-[#1b7936] mx-auto" />
                    <p className="text-gray-500 mt-4 text-sm">Loading solutions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#f8f9fa] min-h-screen">

            {/* Hero Section */}
            <section className="relative bg-[#0c1f38] text-white py-24 overflow-hidden border-b border-white/10">
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
                {solutions.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-4xl mb-4">📋</div>
                        <h3 className="text-2xl font-bold text-[#071322]">No solutions available</h3>
                        <p className="text-gray-500 mt-2">Check back soon for our latest solutions.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {solutions.map((solution) => (
                            <Link
                                key={solution._id}
                                href={`/solutions/${solution.id || solution.label.toLowerCase().replace(/\s+/g, '-')}`}
                                className="group bg-white rounded-xl shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-200/80 hover:border-[#3ec06a]/60 flex flex-col justify-between"
                            >
                                {/* Image Container with Zoom Effect */}
                                <div className="relative h-60 overflow-hidden bg-[#0c1f38]">
                                    <SolutionImage
                                        src={solution.imageUrl}
                                        alt={solution.label}
                                        className="object-cover opacity-90 group-hover:scale-110 transition-transform duration-700 ease-out"
                                        fallback="📋"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0c1f38]/70 via-transparent to-transparent"></div>
                                    <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold text-[#071322] shadow-sm flex items-center gap-1.5">
                                        {getSolutionIcon(solution.id)}
                                        {solution.desc || solution.subtitle?.substring(0, 30) || 'Solution'}
                                    </div>
                                </div>

                                {/* Content Container */}
                                <div className="p-8 flex flex-col justify-between flex-1 space-y-6">
                                    <div className="space-y-3">
                                        <h3 className="text-xl sm:text-2xl font-extrabold text-[#071322] group-hover:text-[#1b7936] transition-colors">
                                            {solution.label}
                                        </h3>
                                        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                                            {solution.subtitle || solution.desc || solution.overview?.substring(0, 120) || 'Comprehensive energy solution'}
                                        </p>
                                    </div>

                                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                                        <span className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#1b7936]">
                                            Explore Solution <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                                        </span>
                                        <span className="text-[11px] font-bold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-md">
                                            {solution.features?.length || 0} Features
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            {/* Bottom Support CTA Banner */}
            <section className="pb-24 max-w-7xl mx-auto">
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