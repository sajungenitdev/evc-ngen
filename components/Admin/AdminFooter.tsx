// components/Admin/AdminFooter.tsx
'use client';

import React from 'react';
import Link from 'next/link';

interface AdminFooterProps {
    className?: string;
}

export default function AdminFooter({ className = '' }: AdminFooterProps) {
    const currentYear = new Date().getFullYear();

    return (
        <footer className={`bg-slate-900 backdrop-blur-xl border-b border-slate-800/80 backdrop-blur-sm px-6 py-4 ${className}`}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
                {/* Left Section: Copyright */}
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-300">EVNGEN</span>
                    <span>© {currentYear}</span>
                    <span className="hidden sm:inline">·</span>
                    <span className="hidden sm:inline">All rights reserved</span>
                </div>

                {/* Center Section: Version / Status */}
                <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5">
                        <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                        </span>
                        <span>System Online</span>
                    </span>
                    <span className="text-slate-600">|</span>
                    <span>v2.0.0</span>
                </div>
            </div>
        </footer>
    );
}