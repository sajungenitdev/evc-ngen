// components/Admin/Sidebar.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { MenuItem, menuItems } from '@/components/Admin/menu';

export interface BadgeCounts {
    chargers?: number;
    users?: number;
    sessions?: number;
}

interface SidebarProps {
    isOpen: boolean;
    onToggle: () => void;
    isMobile?: boolean;
    onClose?: () => void;
    badgeCounts?: BadgeCounts;
}

export default function Sidebar({
    isOpen,
    onToggle,
    isMobile,
    onClose,
    badgeCounts = { chargers: 12, users: 156, sessions: 8 },
}: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { logout, user } = useAuth();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    // Portal states
    const [mounted, setMounted] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<{
        item: MenuItem;
        top: number;
        left: number;
    } | null>(null);

    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    const isItemActive = (href: string) => {
        if (href === '#') return false;
        return pathname === href || pathname?.startsWith(href + '/');
    };

    const isParentActive = (item: MenuItem) => {
        if (isItemActive(item.href)) return true;
        return Boolean(item.subItems?.some((sub) => isItemActive(sub.href) || pathname?.startsWith(sub.href + '/')));
    };

    const handleMouseEnter = (item: MenuItem, event: React.MouseEvent<HTMLDivElement>) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }

        const rect = event.currentTarget.getBoundingClientRect();
        setActiveDropdown({
            item,
            top: rect.top,
            left: rect.right + 6, // 6px offset to the right
        });
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setActiveDropdown(null);
        }, 150);
    };

    const handleLogout = async () => {
        if (isLoggingOut) return;
        setIsLoggingOut(true);
        try {
            await logout();
        } catch (error) {
            console.error('Logout error:', error);
            router.push('/login');
        } finally {
            setIsLoggingOut(false);
        }
    };

    return (
        <>
            <aside
                className={`
                    flex flex-col bg-slate-900 border-r border-slate-800 text-slate-300
                    transition-all duration-300 ease-in-out select-none h-full relative z-30
                    ${isMobile
                        ? `fixed inset-y-0 left-0 z-50 w-72 ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`
                        : `relative ${isOpen ? 'w-64' : 'w-20'}`
                    }
                `}
            >
                {/* Desktop Edge Collapse Button */}
                {!isMobile && (
                    <button
                        onClick={onToggle}
                        className="absolute -right-3.5 top-6 z-50 w-7 h-7 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white rounded-full flex items-center justify-center shadow-md transition-all duration-150 active:scale-95"
                        aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                    >
                        <svg
                            className={`w-3.5 h-3.5 transition-transform duration-300 ${!isOpen ? 'rotate-180' : ''}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2.5"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                        </svg>
                    </button>
                )}

                {/* Header / Logo */}
                <div className={`flex items-center px-4 h-16 border-b border-slate-800/80 shrink-0 ${isOpen ? 'justify-start' : 'justify-center'}`}>
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 shrink-0 group cursor-pointer">
                            <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        {isOpen && (
                            <div className="flex flex-col">
                                <span className="text-white font-bold text-base tracking-wide leading-none">
                                    EV<span className="text-emerald-400">NGEN</span>
                                </span>
                                <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-1">
                                    Command Center
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation List */}
                <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
                    {menuItems.map((item) => {
                        const active = isItemActive(item.href);
                        const parentActive = isParentActive(item);
                        const hasSubItems = Boolean(item.subItems && item.subItems.length > 0);
                        const count = item.badgeKey ? badgeCounts[item.badgeKey] : undefined;
                        const isHovered = activeDropdown?.item.id === item.id;

                        return (
                            <div
                                key={item.id}
                                className="relative"
                                onMouseEnter={(e) => hasSubItems && handleMouseEnter(item, e)}
                                onMouseLeave={handleMouseLeave}
                            >
                                <Link
                                    href={item.href}
                                    onClick={() => {
                                        if (isMobile && onClose) onClose();
                                        setActiveDropdown(null);
                                    }}
                                    className={`
                                        flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative group
                                        ${active || parentActive
                                            ? 'bg-emerald-500/10 text-emerald-400 font-semibold'
                                            : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                                        }
                                        ${!isOpen ? 'justify-center' : ''}
                                    `}
                                >
                                    {/* Icon */}
                                    <span className="text-lg shrink-0 transition-transform duration-300 group-hover:scale-125 group-hover:-rotate-6">
                                        {item.icon}
                                    </span>

                                    {/* Label & Badge */}
                                    {isOpen && (
                                        <>
                                            <span className="flex-1 truncate">{item.name}</span>
                                            {count !== undefined && count > 0 && (
                                                <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 rounded-full">
                                                    {count}
                                                </span>
                                            )}
                                            {hasSubItems && (
                                                <svg
                                                    className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${isHovered ? 'translate-x-1 text-emerald-400' : ''}`}
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                    strokeWidth="2.5"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                                </svg>
                                            )}
                                        </>
                                    )}

                                    {/* Collapsed Badge Dot */}
                                    {!isOpen && count !== undefined && count > 0 && (
                                        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-slate-900" />
                                    )}

                                    {/* Active Left Indicator Bar */}
                                    {(active || parentActive) && (
                                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-emerald-400 rounded-r-full shadow-sm shadow-emerald-400" />
                                    )}
                                </Link>
                            </div>
                        );
                    })}
                </nav>

                {/* Footer / User Profile & Logout */}
                <div className="p-3 border-t border-slate-800 space-y-2 shrink-0">
                    {isOpen && user && (
                        <div className="flex items-center gap-3 px-3 py-2 bg-slate-800/40 rounded-xl border border-slate-800">
                            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                                {user.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium text-slate-200 truncate">{user.name}</p>
                                <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className={`
                            w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors group
                            ${isLoggingOut
                                ? 'text-slate-600 cursor-not-allowed'
                                : 'text-slate-400 hover:text-red-400 hover:bg-red-500/10'
                            }
                            ${!isOpen ? 'justify-center' : ''}
                        `}
                        title={!isOpen ? 'Sign Out' : undefined}
                    >
                        <svg
                            className="w-5 h-5 shrink-0 transition-transform duration-200 group-hover:-translate-x-0.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                        </svg>
                        {isOpen && <span>{isLoggingOut ? 'Signing out...' : 'Sign Out'}</span>}
                    </button>
                </div>
            </aside>

            {/* Portal-Rendered Dropdown - Escapes ALL clipping & z-index constraints */}
            {mounted && activeDropdown && createPortal(
                <div
                    style={{
                        position: 'fixed',
                        top: `${activeDropdown.top}px`,
                        left: `${activeDropdown.left}px`,
                        zIndex: 99999,
                    }}
                    className="min-w-[220px] max-w-[260px] animate-in fade-in zoom-in-95 duration-100"
                    onMouseEnter={() => {
                        if (timeoutRef.current) {
                            clearTimeout(timeoutRef.current);
                            timeoutRef.current = null;
                        }
                    }}
                    onMouseLeave={handleMouseLeave}
                >
                    <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1.5 relative">
                        {/* Notch pointing left to sidebar */}
                        <div className="absolute -left-1.5 top-4 w-3 h-3 bg-slate-900 rotate-45 border-l border-t border-slate-700" />

                        {/* Title Header */}
                        <div className="px-3.5 py-1.5 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider relative z-10">
                            {activeDropdown.item.name}
                        </div>

                        {/* Submenu Items */}
                        <div className="py-1 relative z-10">
                            {activeDropdown.item.subItems?.map((sub) => {
                                const subActive = isItemActive(sub.href);
                                return (
                                    <Link
                                        key={sub.id}
                                        href={sub.href}
                                        onClick={() => {
                                            if (isMobile && onClose) onClose();
                                            setActiveDropdown(null);
                                        }}
                                        className={`
                                            flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium transition-colors group/sub
                                            ${subActive
                                                ? 'bg-emerald-500/10 text-emerald-400 font-semibold'
                                                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                            }
                                        `}
                                    >
                                        <span className="text-sm shrink-0 transition-transform duration-200 group-hover/sub:scale-125">
                                            {sub.icon}
                                        </span>
                                        <span className="truncate flex-1">{sub.name}</span>
                                        {subActive && (
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}