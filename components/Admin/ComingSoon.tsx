// components/Admin/ComingSoon.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ComingSoonProps {
    title?: string;
    description?: string;
    icon?: React.ReactNode;
    progress?: number; // 0-100
    features?: string[];
    showBackButton?: boolean;
    showDashboardButton?: boolean;
    customAction?: {
        label: string;
        onClick: () => void;
    };
    badge?: string;
    estimatedDate?: string;
}

export default function ComingSoon({
    title = 'Module Under Construction',
    description = 'We are fine-tuning this telemetry feature to provide advanced analytics, automated controls, and seamless management.',
    icon,
    progress = 75,
    features = ['Real-time Telemetry', 'Batch Configuration', 'Export Reports', 'Role Auditing'],
    showBackButton = true,
    showDashboardButton = true,
    customAction,
    badge = 'Active Sprint',
    estimatedDate = 'Q3 Release',
}: ComingSoonProps) {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [isSubscribed, setIsSubscribed] = useState(false);

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        if (email.trim()) {
            setIsSubscribed(true);
            setEmail('');
        }
    };

    return (
        <div className="min-h-[calc(100vh-140px)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
            <div className="max-w-2xl w-full">
                {/* Main Card */}
                <div className="relative overflow-hidden bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 md:p-12 shadow-xl shadow-slate-900/5 backdrop-blur-sm">
                    {/* Decorative Background Accents */}
                    <div className="absolute -right-16 -top-16 w-56 h-56 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -left-16 -bottom-16 w-56 h-56 bg-[#0B192C]/5 rounded-full blur-3xl pointer-events-none" />

                    {/* Central Icon Header */}
                    <div className="flex justify-center mb-6">
                        <div className="relative group">
                            {/* Outer Glow Ring */}
                            <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500/20 to-[#1E3E62]/20 rounded-3xl blur-sm group-hover:blur-md transition-all duration-300" />
                            
                            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-[#0B192C] via-[#1E3E62] to-cyan-700 flex items-center justify-center text-white shadow-xl shadow-[#0B192C]/20 border border-white/10 group-hover:scale-105 transition-transform duration-300">
                                {icon ? (
                                    <div className="text-3xl sm:text-4xl text-cyan-300">{icon}</div>
                                ) : (
                                    <svg className="w-10 h-10 sm:w-12 sm:h-12 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.67 2.67 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091.737.042 1.503-.14 2.213" />
                                    </svg>
                                )}
                            </div>

                            {/* Corner Status Pill */}
                            <span className="absolute -top-1.5 -right-1.5 px-2 py-0.5 bg-cyan-500 text-white text-[9px] font-bold tracking-wider rounded-full shadow-md uppercase">
                                Soon
                            </span>
                        </div>
                    </div>

                    {/* Headline & Badges */}
                    <div className="text-center max-w-lg mx-auto">
                        <div className="inline-flex items-center gap-2 mb-3">
                            <span className="px-3 py-1 bg-[#0B192C]/5 text-[#0B192C] text-xs font-bold rounded-full border border-[#0B192C]/10 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                                {badge}
                            </span>
                            {estimatedDate && (
                                <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full border border-slate-200">
                                    🗓️ {estimatedDate}
                                </span>
                            )}
                        </div>

                        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B192C] tracking-tight">
                            {title}
                        </h1>

                        <p className="mt-2.5 text-xs sm:text-sm text-slate-500 leading-relaxed">
                            {description}
                        </p>
                    </div>

                    {/* Milestone Progress Bar */}
                    {progress !== undefined && progress > 0 && (
                        <div className="mt-8 bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5">
                            <div className="flex items-center justify-between text-xs font-bold mb-2">
                                <span className="text-slate-600 uppercase tracking-wider text-[10px]">Sprint Delivery Progress</span>
                                <span className="text-[#0B192C] font-mono">{progress}%</span>
                            </div>
                            <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden p-0.5">
                                <div
                                    className="h-full bg-gradient-to-r from-[#0B192C] via-[#1E3E62] to-cyan-500 rounded-full transition-all duration-1000 shadow-sm"
                                    style={{ width: `${Math.min(progress, 100)}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Features Roadmap Pill Grid */}
                    {features && features.length > 0 && (
                        <div className="mt-6">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center mb-3">
                                Planned Capabilities
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                {features.map((feature, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-2.5 p-2.5 bg-slate-50/80 hover:bg-slate-50 border border-slate-200/70 rounded-xl transition-colors"
                                    >
                                        <div className="w-6 h-6 rounded-lg bg-[#0B192C] text-cyan-300 font-bold text-[10px] flex items-center justify-center shrink-0">
                                            {index + 1}
                                        </div>
                                        <span className="text-xs font-semibold text-slate-700 truncate">
                                            {feature}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Interactive Notification Subscribe */}
                    <div className="mt-8 pt-6 border-t border-slate-100">
                        {isSubscribed ? (
                            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-xs font-semibold text-emerald-700 animate-in fade-in">
                                ✓ You’re on the priority notification list for this update.
                            </div>
                        ) : (
                            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
                                <input
                                    type="email"
                                    placeholder="Enter work email for early access..."
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="flex-1 px-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]/20 focus:border-[#0B192C] transition-all"
                                />
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-[#0B192C] hover:bg-[#1E3E62] text-white text-xs font-bold rounded-xl transition-colors shrink-0 shadow-xs"
                                >
                                    Notify Me
                                </button>
                            </form>
                        )}
                    </div>

                    {/* Navigation CTA Buttons */}
                    <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                        {showBackButton && (
                            <button
                                onClick={() => router.back()}
                                className="w-full sm:w-auto px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 group"
                            >
                                <svg className="w-4 h-4 text-slate-400 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                                </svg>
                                <span>Go Back</span>
                            </button>
                        )}

                        {customAction && (
                            <button
                                onClick={customAction.onClick}
                                className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-[#0B192C] to-[#1E3E62] hover:to-[#2A5280] text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-[#0B192C]/10 flex items-center justify-center gap-2 group"
                            >
                                <span>{customAction.label}</span>
                                <svg className="w-4 h-4 text-cyan-400 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                </svg>
                            </button>
                        )}

                        {showDashboardButton && !customAction && (
                            <Link
                                href="/dashboard"
                                className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-[#0B192C] to-[#1E3E62] hover:to-[#2A5280] text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-[#0B192C]/10 flex items-center justify-center gap-2 group"
                            >
                                <span>Return to Dashboard</span>
                                <svg className="w-4 h-4 text-cyan-400 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                </svg>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Subtext Footer */}
                <p className="text-center text-[11px] text-slate-400 font-medium mt-6">
                    ⚡ EVNGEN Command Center • Release Candidate Framework
                </p>
            </div>
        </div>
    );
}