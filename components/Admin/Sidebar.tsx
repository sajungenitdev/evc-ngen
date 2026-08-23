// components/Admin/Sidebar.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { menuItems, MenuItem } from './menu';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarProps {
    isOpen: boolean;
    onToggle: () => void;
    isMobile?: boolean;
    onClose?: () => void;
}

export default function Sidebar({ isOpen, onToggle, isMobile, onClose }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { logout, user } = useAuth();
    const [expandedItems, setExpandedItems] = useState<string[]>([]);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const isActive = (href: string) => {
        return pathname === href || pathname?.startsWith(href + '/');
    };

    const toggleExpand = (href: string) => {
        setExpandedItems(prev =>
            prev.includes(href)
                ? prev.filter(item => item !== href)
                : [...prev, href]
        );
    };

    const handleLogout = async () => {
        if (isLoggingOut) return;

        setIsLoggingOut(true);
        try {
            // Call logout from AuthContext - this clears localStorage and state
            await logout();
            // Router push is handled inside logout function
        } catch (error) {
            console.error('Logout error:', error);
            // Fallback - force redirect
            router.push('/login');
        } finally {
            setIsLoggingOut(false);
        }
    };

    const renderMenuItem = (item: MenuItem, level: number = 0) => {
        const active = isActive(item.href);
        const hasSubItems = item.subItems && item.subItems.length > 0;
        const isExpanded = expandedItems.includes(item.href);

        return (
            <div key={item.href} className="w-full">
                <Link
                    href={item.href}
                    onClick={(e) => {
                        if (hasSubItems && isOpen) {
                            e.preventDefault();
                            toggleExpand(item.href);
                        }
                        if (isMobile && onClose) {
                            onClose();
                        }
                    }}
                    className={`
                        flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-200 group relative w-full
                        ${active
                            ? 'bg-emerald-500/20 text-emerald-400 shadow-lg shadow-emerald-500/10'
                            : 'text-white/60 hover:bg-white/5 hover:text-white'
                        }
                        ${!isOpen && 'justify-center'}
                        ${level > 0 && isOpen && 'pl-9'}
                    `}
                    title={!isOpen ? item.name : ''}
                >
                    <span className="text-xl flex-shrink-0 flex items-center justify-center">{item.icon}</span>

                    {isOpen && (
                        <>
                            <span className="text-sm font-medium whitespace-nowrap flex-1 truncate text-left">
                                {item.name}
                            </span>
                            {item.badge && (
                                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">
                                    {item.badge}
                                </span>
                            )}
                            {hasSubItems && (
                                <span className={`text-xs transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>
                                    ▶
                                </span>
                            )}
                        </>
                    )}

                    {/* Tooltip on hover when collapsed */}
                    {!isOpen && !isMobile && (
                        <span className="fixed left-20 ml-2 px-2.5 py-1.5 bg-slate-900 border border-white/10 text-white text-xs rounded-md shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                            {item.name}
                            {item.badge && ` (${item.badge})`}
                        </span>
                    )}
                </Link>

                {/* Sub-items */}
                {hasSubItems && isOpen && isExpanded && (
                    <div className="ml-4 space-y-1 mt-1 border-l border-white/10 pl-2">
                        {item.subItems!.map(subItem => renderMenuItem(subItem, level + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <aside
            className={`
                flex flex-col bg-[#0c1f38] transition-all duration-300 flex-shrink-0 h-full select-none
                ${isMobile
                    ? `fixed top-0 left-0 z-50 w-64 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`
                    : `relative ${isOpen ? 'w-64' : 'w-20'}`
                }
            `}
        >
            {/* Desktop Edge Floating Toggler */}
            {!isMobile && (
                <button
                    onClick={onToggle}
                    className="absolute -right-3 top-6 z-50 w-6 h-6 bg-[#0c1f38] border border-white/20 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:border-emerald-400/50 shadow-md transition-all duration-200"
                    aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                >
                    <svg
                        className={`w-3.5 h-3.5 transition-transform duration-300 ${!isOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2.5"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
            )}

            {/* Header / Logo */}
            <div className={`
                flex items-center px-4 py-5 border-b border-white/10 h-20
                ${isOpen ? 'justify-start' : 'justify-center'}
            `}>
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-10 h-10 bg-gradient-to-tr from-emerald-600 to-teal-400 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 flex-shrink-0">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    {isOpen && (
                        <span className="text-white font-bold text-lg whitespace-nowrap tracking-wide">
                            EV<span className="text-emerald-400">NGEN</span>
                        </span>
                    )}
                </div>
            </div>

            {/* User Info (when open) */}
            {isOpen && user && (
                <div className="px-4 py-3 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-sm">
                            {user.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium truncate">{user.name}</p>
                            <p className="text-white/40 text-xs truncate">{user.email}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto overflow-x-hidden">
                {menuItems.map(item => renderMenuItem(item))}
            </nav>

            {/* Bottom Section / Logout */}
            <div className="p-3 border-t border-white/10">
                <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className={`
                        w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-200 group relative
                        ${isLoggingOut
                            ? 'text-white/30 cursor-not-allowed'
                            : 'text-white/40 hover:text-red-400 hover:bg-red-500/10 cursor-pointer'
                        }
                        ${!isOpen && 'justify-center'}
                    `}
                    title={!isOpen ? 'Logout' : ''}
                >
                    {isLoggingOut ? (
                        <>
                            <svg className="w-5 h-5 flex-shrink-0 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            {isOpen && <span className="text-sm font-medium">Logging out...</span>}
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            {isOpen && <span className="text-sm font-medium">Logout</span>}
                        </>
                    )}

                    {!isOpen && !isMobile && !isLoggingOut && (
                        <span className="fixed left-20 ml-2 px-2.5 py-1.5 bg-slate-900 border border-white/10 text-white text-xs rounded-md shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                            Logout
                        </span>
                    )}
                </button>
            </div>
        </aside>
    );
}