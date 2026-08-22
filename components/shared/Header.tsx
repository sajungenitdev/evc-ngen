// components/shared/Header.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
    const isActive = (path: string) => {
        if (path === '/') {
            return pathname === path;
        }
        return pathname.startsWith(path);
    };

    return (
        <header className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 ${
            isScrolled ? 'bg-[#0c1f38]/95 backdrop-blur-md shadow-lg' : 'bg-[#0c1f38]'
        } border-b border-white/10`}>
            <div className="flex items-center justify-between gap-4 py-3 px-6 max-w-7xl mx-auto">
                {/* Logo */}
                <Link href="/" className="text-2xl font-extrabold tracking-tight whitespace-nowrap flex-shrink-0">
                    <span className="text-white">EV</span>
                    <span className="text-[#3ec06a]">NGEN</span>
                </Link>

                {/* Navigation - Desktop */}
                <nav className="hidden lg:flex gap-6 text-sm font-semibold items-center whitespace-nowrap">
                    
                    {/* Products Dropdown */}
                    <div
                        onMouseEnter={() => handleMouseEnter('products')}
                        onMouseLeave={handleMouseLeave}
                        className="relative py-2"
                    >
                        <Link
                            href="/ev-chargers"
                            className={`flex items-center gap-1 transition-colors ${isActive('/ev-chargers') ? 'text-[#3ec06a]' : 'text-[#c7d2de] hover:text-[#3ec06a]'}`}
                        >
                            Products <span className="text-[9px]">▾</span>
                        </Link>
                        {activeDropdown === 'products' && (
                            <div className="absolute top-full left-0 pt-2 z-[100]">
                                <MegaMenu type="products" />
                            </div>
                        )}
                    </div>

                    {/* Solutions Dropdown */}
                    <div
                        onMouseEnter={() => handleMouseEnter('solutions')}
                        onMouseLeave={handleMouseLeave}
                        className="relative py-2"
                    >
                        <Link
                            href="/solutions"
                            className={`flex items-center gap-1 transition-colors ${isActive('/solutions') ? 'text-[#3ec06a]' : 'text-[#c7d2de] hover:text-[#3ec06a]'}`}
                        >
                            Solutions <span className="text-[9px]">▾</span>
                        </Link>
                        {activeDropdown === 'solutions' && (
                            <div className="absolute top-full left-0 pt-2 z-[100]">
                                <MegaMenu type="solutions" />
                            </div>
                        )}
                    </div>

                    {/* Industries Dropdown */}
                    <div
                        onMouseEnter={() => handleMouseEnter('industries')}
                        onMouseLeave={handleMouseLeave}
                        className="relative py-2"
                    >
                        <Link
                            href="/industries"
                            className={`flex items-center gap-1 transition-colors ${isActive('/industries') ? 'text-[#3ec06a]' : 'text-[#c7d2de] hover:text-[#3ec06a]'}`}
                        >
                            Industries <span className="text-[9px]">▾</span>
                        </Link>
                        {activeDropdown === 'industries' && (
                            <div className="absolute top-full left-0 pt-2 z-[100]">
                                <MegaMenu type="industries" />
                            </div>
                        )}
                    </div>

                    {/* Accessories Dropdown */}
                    <div
                        onMouseEnter={() => handleMouseEnter('accessories')}
                        onMouseLeave={handleMouseLeave}
                        className="relative py-2"
                    >
                        <Link
                            href="/ev-chargers?category=accessories"
                            className={`flex items-center gap-1 transition-colors ${pathname.includes('accessories') ? 'text-[#3ec06a]' : 'text-[#c7d2de] hover:text-[#3ec06a]'}`}
                        >
                            Accessories <span className="text-[9px]">▾</span>
                        </Link>
                        {activeDropdown === 'accessories' && (
                            <div className="absolute top-full left-0 pt-2 z-[100]">
                                <MegaMenu type="accessories" />
                            </div>
                        )}
                    </div>

                    {/* Training Dropdown */}
                    <div
                        onMouseEnter={() => handleMouseEnter('training')}
                        onMouseLeave={handleMouseLeave}
                        className="relative py-2"
                    >
                        <Link
                            href="/training"
                            className={`flex items-center gap-1 transition-colors ${isActive('/training') ? 'text-[#3ec06a]' : 'text-[#c7d2de] hover:text-[#3ec06a]'}`}
                        >
                            Training <span className="text-[9px]">▾</span>
                        </Link>
                        {activeDropdown === 'training' && (
                            <div className="absolute top-full left-0 pt-2 z-[100]">
                                <MegaMenu type="training" />
                            </div>
                        )}
                    </div>

                    {/* Service Dropdown */}
                    <div
                        onMouseEnter={() => handleMouseEnter('services')}
                        onMouseLeave={handleMouseLeave}
                        className="relative py-2"
                    >
                        <Link
                            href="/services"
                            className={`flex items-center gap-1 transition-colors ${isActive('/services') ? 'text-[#3ec06a]' : 'text-[#c7d2de] hover:text-[#3ec06a]'}`}
                        >
                            Service <span className="text-[9px]">▾</span>
                        </Link>
                        {activeDropdown === 'services' && (
                            <div className="absolute top-full left-0 pt-2 z-[100]">
                                <MegaMenu type="services" />
                            </div>
                        )}
                    </div>
                </nav>

                {/* Right Action Buttons */}
                <div className="hidden sm:flex gap-2 flex-shrink-0">
                    <Link
                        href="/request-survey"
                        className="bg-[#1f7a3d] text-white px-3.5 py-2.5 rounded text-xs font-bold whitespace-nowrap hover:bg-[#166030] transition-colors"
                    >
                        Request Site Survey
                    </Link>
                    <Link
                        href="/contact"
                        className={`px-3.5 py-2.5 rounded text-xs font-bold whitespace-nowrap transition-colors ${
                            isActive('/contact') ? 'bg-[#3ec06a] text-white' : 'bg-white/10 border border-white/25 text-white hover:bg-white/20'
                        }`}
                    >
                        Contact
                    </Link>
                </div>

                {/* Mobile Menu Hamburger Button */}
                <button
                    onClick={() => setMobileMenuOpen(true)}
                    className="lg:hidden text-white text-2xl focus:outline-none hover:text-[#3ec06a] transition-colors"
                    aria-label="Open Menu"
                >
                    ☰
                </button>
            </div>

            {/* Mobile Off-Canvas Slide-out Panel */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-[200] flex">
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                        onClick={() => setMobileMenuOpen(false)}
                    ></div>

                    <div className="relative ml-auto w-full max-w-xs bg-[#0c1f38] text-white h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto border-l border-white/10 animate-slide-in-right">
                        <div className="space-y-6">
                            <div className="flex items-center justify-between border-b border-white/10 pb-4">
                                <Link href="/" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-extrabold tracking-tight">
                                    <span className="text-white">EV</span>
                                    <span className="text-[#3ec06a]">NGEN</span>
                                </Link>
                                <button
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="text-gray-400 hover:text-white text-xl font-bold transition-colors"
                                >
                                    ✕
                                </button>
                            </div>

                            <nav className="flex flex-col space-y-4 text-sm font-semibold">
                                <Link href="/ev-chargers" onClick={() => setMobileMenuOpen(false)} className={isActive('/ev-chargers') ? 'text-[#3ec06a]' : 'text-[#c7d2de]'}>Products</Link>
                                <Link href="/solutions" onClick={() => setMobileMenuOpen(false)} className={isActive('/solutions') ? 'text-[#3ec06a]' : 'text-[#c7d2de]'}>Solutions</Link>
                                <Link href="/industries" onClick={() => setMobileMenuOpen(false)} className={isActive('/industries') ? 'text-[#3ec06a]' : 'text-[#c7d2de]'}>Industries</Link>
                                <Link href="/ev-chargers?category=accessories" onClick={() => setMobileMenuOpen(false)} className="text-[#c7d2de]">Accessories</Link>
                                <Link href="/training" onClick={() => setMobileMenuOpen(false)} className={isActive('/training') ? 'text-[#3ec06a]' : 'text-[#c7d2de]'}>Training</Link>
                                <Link href="/services" onClick={() => setMobileMenuOpen(false)} className={isActive('/services') ? 'text-[#3ec06a]' : 'text-[#c7d2de]'}>Service</Link>
                            </nav>
                        </div>

                        <div className="pt-6 border-t border-white/10 flex flex-col gap-3">
                            <Link href="/request-survey" onClick={() => setMobileMenuOpen(false)} className="w-full bg-[#1f7a3d] text-center text-white px-4 py-3 rounded-xl text-xs font-bold hover:bg-[#166030]">
                                Request Site Survey
                            </Link>
                            <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="w-full bg-white/10 border border-white/25 text-center text-white px-4 py-3 rounded-xl text-xs font-bold hover:bg-white/20">
                                Contact
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}