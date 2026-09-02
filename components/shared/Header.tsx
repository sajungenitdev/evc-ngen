// components/shared/Header.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, Menu, X } from 'lucide-react';
import MegaMenu from './MegaMenu';

export default function Header() {
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const pathname = usePathname();
    const dropdownTimeout = useRef<NodeJS.Timeout | null>(null);

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close dropdown on route change
    useEffect(() => {
        setActiveDropdown(null);
        setMobileMenuOpen(false);
    }, [pathname]);

    // Handle dropdown with delay
    const handleMouseEnter = (type: string) => {
        if (dropdownTimeout.current) {
            clearTimeout(dropdownTimeout.current);
            dropdownTimeout.current = null;
        }
        setActiveDropdown(type);
    };

    const handleMouseLeave = () => {
        dropdownTimeout.current = setTimeout(() => {
            setActiveDropdown(null);
        }, 200);
    };

    // Check if link is active
    const isActive = (path: string, exact: boolean = false) => {
        if (exact) {
            return pathname === path;
        }
        // Handle dynamic routes like /ev-chargers?category=accessories
        if (path.includes('?')) {
            const basePath = path.split('?')[0];
            return pathname.startsWith(basePath);
        }
        // Don't match /contact when on /contact/subpage
        if (path === '/contact' && pathname === '/contact') {
            return true;
        }
        if (path === '/contact' && pathname.startsWith('/contact/')) {
            return false;
        }
        return pathname.startsWith(path) && path !== '/';
    };

    // Check if any child route is active (for dropdown parent)
    const isParentActive = (paths: string[]) => {
        return paths.some(path => pathname.startsWith(path));
    };

    // Navigation items configuration
    const navItems = [
        {
            key: 'products',
            label: 'Products',
            href: '/ev-chargers',
            paths: ['/ev-chargers', '/products', '/accessories']
        },
        {
            key: 'brands',
            label: 'Brands',
            href: '/brands',
            paths: ['/brands']
        },
        {
            key: 'solutions',
            label: 'Solutions',
            href: '/solutions',
            paths: ['/solutions']
        },
        {
            key: 'industries',
            label: 'Industries',
            href: '/industries',
            paths: ['/industries']
        },
        {
            key: 'accessories',
            label: 'Accessories',
            href: '/ev-chargers?category=accessories',
            paths: ['/accessories', '/ev-chargers']
        },
        {
            key: 'training',
            label: 'Training',
            href: '/training',
            paths: ['/training']
        },
        {
            key: 'services',
            label: 'Service',
            href: '/services',
            paths: ['/services']
        },
    ];

    return (
        <header className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                ? 'bg-[#0B192C]/95 backdrop-blur-md shadow-lg'
                : 'bg-[#0B192C]'
            } border-b border-white/10`}>
            <div className="flex items-center justify-between gap-4 py-3 px-6 max-w-7xl mx-auto">
                {/* Logo */}
                <Link href="/" className="text-2xl font-extrabold tracking-tight whitespace-nowrap shrink-0 group">
                    <span className="text-white group-hover:text-[#1b7936] transition-colors">EV</span>
                    <span className="text-[#1b7936]">NGEN</span>
                </Link>

                {/* Navigation - Desktop */}
                <nav className="hidden lg:flex gap-1 text-sm font-semibold items-center">
                    {navItems.map((item) => {
                        const isItemActive = isParentActive(item.paths);
                        const hasDropdown = ['products', 'brands', 'solutions', 'industries', 'accessories', 'training', 'services'].includes(item.key);

                        return (
                            <div
                                key={item.key}
                                onMouseEnter={() => hasDropdown && handleMouseEnter(item.key)}
                                onMouseLeave={hasDropdown ? handleMouseLeave : undefined}
                                className="relative"
                            >
                                <Link
                                    href={item.href}
                                    className={`
                                        flex items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200
                                        ${isItemActive
                                            ? 'text-[#1b7936] bg-white/5'
                                            : 'text-gray-300 hover:text-white hover:bg-white/5'
                                        }
                                    `}
                                >
                                    {item.label}
                                    {hasDropdown && (
                                        <ChevronDown className={`
                                            w-3.5 h-3.5 transition-transform duration-200
                                            ${activeDropdown === item.key ? 'rotate-180' : ''}
                                            ${isItemActive ? 'text-[#1b7936]' : 'text-gray-400'}
                                        `} />
                                    )}
                                </Link>
                                {hasDropdown && activeDropdown === item.key && (
                                    <div className="absolute top-full left-0 pt-2 z-100">
                                        <MegaMenu type={item.key as any} />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </nav>

                {/* Right Action Buttons */}
                <div className="hidden sm:flex gap-2 shrink-0">
                    <Link
                        href="/request-survey"
                        className="bg-[#1b7936] text-white px-4 py-2.5 rounded-md text-xs font-bold whitespace-nowrap hover:bg-[#166a2e] transition-all duration-200 hover:scale-105 shadow-lg shadow-[#1b7936]/20"
                    >
                        Request Site Survey
                    </Link>
                    <Link
                        href="/contact"
                        className={`
                            px-4 py-2.5 rounded-md text-xs font-bold whitespace-nowrap transition-all duration-200
                            ${isActive('/contact', true)
                                ? 'bg-[#1b7936] text-white shadow-lg shadow-[#1b7936]/20'
                                : 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
                            }
                        `}
                    >
                        Contact
                    </Link>
                </div>

                {/* Mobile Menu Hamburger Button */}
                <button
                    onClick={() => setMobileMenuOpen(true)}
                    className="lg:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
                    aria-label="Open Menu"
                >
                    <Menu className="w-6 h-6" />
                </button>
            </div>

            {/* Mobile Off-Canvas Slide-out Panel */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-200 flex">
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                        onClick={() => setMobileMenuOpen(false)}
                    />
                    <div className="relative ml-auto w-full max-w-xs bg-[#0B192C] text-white h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto border-l border-white/10 animate-slide-in-right">
                        <div className="space-y-6">
                            <div className="flex items-center justify-between border-b border-white/10 pb-4">
                                <Link href="/" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-extrabold tracking-tight">
                                    <span className="text-white">EV</span>
                                    <span className="text-[#1b7936]">NGEN</span>
                                </Link>
                                <button
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <nav className="flex flex-col space-y-1 text-sm font-semibold">
                                {navItems.map((item) => {
                                    const isItemActive = isParentActive(item.paths);
                                    return (
                                        <Link
                                            key={item.key}
                                            href={item.href}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className={`
                                                px-4 py-3 rounded-xl transition-all duration-200
                                                ${isItemActive
                                                    ? 'text-[#1b7936] bg-white/5'
                                                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                                                }
                                            `}
                                        >
                                            {item.label}
                                            {isItemActive && (
                                                <span className="ml-2 text-[10px] text-[#1b7936]">●</span>
                                            )}
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>

                        <div className="pt-6 border-t border-white/10 flex flex-col gap-3">
                            <Link
                                href="/request-survey"
                                onClick={() => setMobileMenuOpen(false)}
                                className="w-full bg-[#1b7936] text-center text-white px-4 py-3 rounded-xl text-xs font-bold hover:bg-[#166a2e] transition-colors"
                            >
                                Request Site Survey
                            </Link>
                            <Link
                                href="/contact"
                                onClick={() => setMobileMenuOpen(false)}
                                className="w-full bg-white/10 border border-white/20 text-center text-white px-4 py-3 rounded-xl text-xs font-bold hover:bg-white/20 transition-colors"
                            >
                                Contact
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}