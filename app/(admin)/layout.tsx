

// app/(admin)/layout.tsx
'use client';

import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Admin/Sidebar';
import AdminHeader from '@/components/Admin/AdminHeader';
import AdminFooter from '@/components/Admin/AdminFooter';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, logout, isLoading, isAuthenticated } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
    const [userMenuOpen, setUserMenuOpen] = useState<boolean>(false);

    const hasRedirected = useRef<boolean>(false);
    const prevPathnameRef = useRef<string | null>(null);

    // Auth guard
    useEffect(() => {
        if (!isLoading && !isAuthenticated && !hasRedirected.current) {
            hasRedirected.current = true;
            router.replace('/login');
        }
        if (isAuthenticated) {
            hasRedirected.current = false;
        }
    }, [isLoading, isAuthenticated, router]);

    // Close menus on route change
    useLayoutEffect(() => {
        if (prevPathnameRef.current !== pathname) {
            if (isMobileMenuOpen) {
                setIsMobileMenuOpen(false);
            }
            if (userMenuOpen) {
                setUserMenuOpen(false);
            }
            prevPathnameRef.current = pathname;
        }
    }, [pathname, isMobileMenuOpen, userMenuOpen]);

    // Toggle functions
    const toggleSidebar = useCallback(() => {
        setIsSidebarOpen((prev) => !prev);
    }, []);

    const toggleMobileMenu = useCallback(() => {
        setIsMobileMenuOpen((prev) => !prev);
    }, []);

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen w-screen flex items-center justify-center bg-slate-950">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full border-2 border-emerald-500/20 border-t-emerald-400 animate-spin" />
                        <div className="absolute w-6 h-6 rounded-full bg-emerald-500/10 blur-xs" />
                    </div>
                    <span className="text-xs font-semibold text-slate-400 tracking-widest uppercase">
                        Initializing Workspace
                    </span>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) return null;

    return (
        <div className="flex h-screen w-screen overflow-hidden text-slate-100 antialiased font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block shrink-0 relative z-30 h-full">
                <Sidebar
                    isOpen={isSidebarOpen}
                    onToggle={toggleSidebar}
                    isMobile={false}
                />
            </div>

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 lg:hidden transition-all duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* Mobile Sidebar */}
            <div className="lg:hidden">
                <Sidebar
                    isOpen={isMobileMenuOpen}
                    onToggle={toggleMobileMenu}
                    isMobile={true}
                    onClose={() => setIsMobileMenuOpen(false)}
                />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative z-0">
                {/* ✅ Admin Header Component */}
                <AdminHeader
                    user={user}
                    logout={logout}
                    userMenuOpen={userMenuOpen}
                    setUserMenuOpen={setUserMenuOpen}
                    toggleMobileMenu={toggleMobileMenu}
                />

                {/* Content Viewport */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                    {children}
                </main>
                <AdminFooter className="mt-auto" />
            </div>
        </div>
    );
}