// components/Admin/AdminHeader.tsx
'use client';

import React, { useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AdminHeaderProps {
    user?: {
        name?: string;
        email?: string;
        role?: string;
    } | null;
    logout: () => void;
    userMenuOpen: boolean;
    setUserMenuOpen: (value: boolean | ((prev: boolean) => boolean)) => void;
    toggleMobileMenu: () => void;
}

export default function AdminHeader({
    user,
    logout,
    userMenuOpen,
    setUserMenuOpen,
    toggleMobileMenu,
}: AdminHeaderProps) {
    const pathname = usePathname();
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Get page title from pathname
    const pageTitle = useMemo(() => {
        const segment = pathname?.split('/').filter(Boolean).pop() || 'Dashboard';
        return segment
            .replace(/-/g, ' ')
            .replace(/\b\w/g, (char) => char.toUpperCase());
    }, [pathname]);

    // Get user initial
    const userInitial = user?.name?.charAt(0)?.toUpperCase() || 'U';

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setUserMenuOpen(false);
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setUserMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [setUserMenuOpen]);

    return (
        <header className="sticky top-0 z-20 h-16 bg-slate-900 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-8 flex items-center justify-between shrink-0 transition-colors">
            {/* Left Section: Mobile Toggle & Context Breadcrumbs */}
            <div className="flex items-center gap-3.5 min-w-0">
                <button
                    onClick={toggleMobileMenu}
                    className="lg:hidden p-2 -ml-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 border border-transparent hover:border-slate-700/60 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                    aria-label="Toggle navigation menu"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                    </svg>
                </button>

                <nav aria-label="Breadcrumbs" className="flex items-center gap-2 text-sm min-w-0">
                    <Link href="/dashboard"><span className="text-slate-500 font-medium hidden sm:inline hover:text-slate-400 transition-colors">
                        Dashboard
                    </span></Link>
                    <span className="text-slate-700 hidden sm:inline select-none">/</span>
                    <span className="font-semibold text-slate-100 tracking-tight truncate">
                        {pageTitle}
                    </span>
                </nav>
            </div>

            {/* Right Section: System Telemetry & Profile Menu */}
            <div className="flex items-center gap-4">
                {/* Live Online Telemetry Indicator */}
                <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                    <span className="text-xs font-medium tracking-wide">Live</span>
                </div>

                {/* User Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setUserMenuOpen((prev) => !prev)}
                        className="flex items-center gap-2.5 p-1 rounded-full sm:rounded-xl sm:px-2.5 sm:py-1.5 hover:bg-slate-800/80 border border-transparent hover:border-slate-700/60 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                        aria-expanded={userMenuOpen}
                        aria-haspopup="true"
                    >
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold text-xs flex items-center justify-center shadow-md shadow-emerald-500/10 ring-1 ring-white/10">
                            {userInitial}
                        </div>
                        <div className="hidden md:flex flex-col text-left">
                            <span className="text-xs font-semibold text-slate-200 leading-tight truncate max-w-[120px]">
                                {user?.name || 'Admin User'}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium capitalize leading-tight">
                                {user?.role || 'Administrator'}
                            </span>
                        </div>
                        <svg
                            className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${userMenuOpen ? 'rotate-180 text-emerald-400' : ''}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2.5"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                    </button>

                    {/* Dropdown Menu Flyout */}
                    {userMenuOpen && (
                        <div className="absolute right-0 mt-2.5 w-60 bg-slate-900/100 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-700/80 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 origin-top-right">
                            <div className="px-4 py-3 border-b border-slate-800/80">
                                <p className="text-xs font-semibold text-slate-100 truncate">{user?.name}</p>
                                <p className="text-[11px] text-slate-400 truncate mt-0.5">{user?.email}</p>
                            </div>

                            <div className="py-1.5 px-1">
                                <Link
                                    href="/profile"
                                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/70 transition-colors"
                                    onClick={() => setUserMenuOpen(false)}
                                >
                                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                    </svg>
                                    Account Settings
                                </Link>
                            </div>

                            <div className="border-t border-slate-800/80 pt-1.5 px-1">
                                <button
                                    onClick={() => {
                                        setUserMenuOpen(false);
                                        logout();
                                    }}
                                    className="flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                                >
                                    <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                                    </svg>
                                    Sign out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}