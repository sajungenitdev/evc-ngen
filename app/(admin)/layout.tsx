// app/(admin)/layout.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
// Make sure this path is correct
import Sidebar from '@/components/Admin/Sidebar';
// or if the file is named sidebar.tsx (lowercase)
// import Sidebar from '@/components/Admin/sidebar';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileOpen, setMobileOpen] = useState(false);
    const pathname = usePathname();

    // Close mobile sidebar on route change
    useEffect(() => {
        setMobileOpen(false);
    }, [pathname]);

    // Handle window resize for responsive
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

    // Get page title from pathname
    const getPageTitle = () => {
        const path = pathname?.split('/').pop() || 'Dashboard';
        return path.replace(/-/g, ' ').charAt(0).toUpperCase() + path.replace(/-/g, ' ').slice(1);
    };

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
                {/* Header */}
                <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-30">
                    <div className="flex items-center gap-3">
                        {/* Mobile Menu Button */}
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
                        {/* System Status */}
                        <div className="hidden sm:flex items-center gap-2 text-xs">
                            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                            <span className="text-gray-500">System Online</span>
                        </div>

                        {/* User Avatar */}
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-sm">
                                A
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50">
                    {children}
                </main>
            </div>
        </div>
    );
}