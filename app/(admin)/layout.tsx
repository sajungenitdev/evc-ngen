// app/(admin)/layout.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Admin/Sidebar';
import Link from 'next/link';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, logout, isLoading, isAuthenticated } = useAuth();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileOpen, setMobileOpen] = useState(false);
    const pathname = usePathname();
    const hasRedirected = useRef(false);

    // ✅ Redirect if not authenticated
    useEffect(() => {
        console.log('📊 AdminLayout - Auth State:', { isLoading, isAuthenticated, user: user?.name });

        if (!isLoading && !isAuthenticated && !hasRedirected.current) {
            console.log('🔒 Not authenticated, redirecting to login...');
            hasRedirected.current = true;
            router.replace('/login');
        }

        // ✅ If authenticated, reset redirect flag
        if (isAuthenticated) {
            hasRedirected.current = false;
        }
    }, [isLoading, isAuthenticated, router, user]);

    // ✅ Listen for auth changes and redirect if needed
    useEffect(() => {
        const handleAuthChange = () => {
            const token = localStorage.getItem('token');
            if (!token && isAuthenticated) {
                console.log('🔑 Token removed, redirecting to login...');
                router.replace('/login');
            }
        };

        // Check on interval
        const interval = setInterval(handleAuthChange, 5000);
        return () => clearInterval(interval);
    }, [isAuthenticated, router]);

    useEffect(() => {
        setMobileOpen(false);
    }, [pathname]);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setSidebarOpen(false);
            } else {
                setSidebarOpen(true);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleSidebar = () => {
        if (window.innerWidth < 1024) {
            setMobileOpen(!mobileOpen);
        } else {
            setSidebarOpen(!sidebarOpen);
        }
    };

    const closeMobile = () => {
        setMobileOpen(false);
    };

    const getPageTitle = () => {
        const path = pathname?.split('/').pop() || 'Dashboard';
        return path.replace(/-/g, ' ').charAt(0).toUpperCase() + path.replace(/-/g, ' ').slice(1);
    };

    const getUserInitials = () => {
        if (user?.name) {
            return user.name.charAt(0).toUpperCase();
        }
        return 'U';
    };

    // Show loading state
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#060b13]">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-emerald-400 font-medium">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    // Don't render if not authenticated
    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block">
                <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
            </div>

            {/* Mobile Sidebar Overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={closeMobile}
                />
            )}

            {/* Mobile Sidebar */}
            <div className="lg:hidden">
                <Sidebar
                    isOpen={mobileOpen}
                    onToggle={toggleSidebar}
                    isMobile={true}
                    onClose={closeMobile}
                />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-30">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={toggleSidebar}
                            className="lg:hidden text-gray-600 hover:text-gray-900 text-2xl"
                            aria-label="Toggle menu"
                        >
                            ☰
                        </button>
                        <h1 className="text-lg sm:text-xl font-semibold text-gray-800 capitalize">
                            {getPageTitle()}
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-2 text-xs">
                            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                            <span className="text-gray-500">System Online</span>
                        </div>

                        <div className="relative group">
                            <button className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-sm">
                                    {getUserInitials()}
                                </div>
                                <span className="hidden sm:block text-sm text-gray-700">
                                    {user?.name || 'User'}
                                </span>
                                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                <div className="py-1">
                                    <div className="px-4 py-2 border-b border-gray-100">
                                        <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                                        <p className="text-xs text-gray-500">{user?.email}</p>
                                    </div>
                                    <Link
                                        href="/profile"
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                    >
                                        Profile Settings
                                    </Link>
                                    <button
                                        onClick={logout}
                                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50">
                    {children}
                </main>
            </div>
        </div>
    );
}