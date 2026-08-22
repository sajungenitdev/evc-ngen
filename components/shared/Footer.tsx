import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-ev-dark-blue pt-24 pb-5 border-t border-white/10">
            <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
                {/* Top Grid Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 pb-16">
                    {/* Brand Column (Span 2) */}
                    <div className="lg:col-span-2 space-y-4">
                        <Link href="/" className="text-2xl font-extrabold tracking-tight inline-block">
                            <span className="text-white">EV</span>
                            <span className="text-ev-green">NGEN</span>
                        </Link>
                        <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
                            Enhancing energy efficiency and empowering energy freedom through Power Quality, EV Charging, Energy Storage, and Battery Testing solutions.
                        </p>
                    </div>

                    {/* Information Column */}
                    <div className="space-y-4">
                        <h4 className="text-white font-bold text-sm tracking-wide">Information</h4>
                        <ul className="space-y-3 text-xs sm:text-sm text-gray-400">
                            <li>
                                <Link href="/solutions" className="text-ev-muted hover:text-ev-green transition-colors">
                                    Solution
                                </Link>
                            </li>
                            <li>
                                <Link href="/industries" className="text-ev-muted hover:text-ev-green transition-colors">
                                    Industries
                                </Link>
                            </li>
                            <li>
                                <Link href="/training" className="text-ev-muted hover:text-ev-green transition-colors">
                                    Training
                                </Link>
                            </li>
                            <li>
                                <Link href="/services" className="text-ev-muted hover:text-ev-green transition-colors">
                                    Services
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Service Column */}
                    <div className="space-y-4">
                        <h4 className="text-white font-bold text-sm tracking-wide">Service</h4>
                        <ul className="space-y-3 text-xs sm:text-sm text-gray-400">
                            <li>
                                <Link href="/ev-chargers" className="text-ev-muted hover:text-ev-green transition-colors">
                                    Chargers
                                </Link>
                            </li>
                            <li>
                                <Link href="/ev-chargers?filter=hardware" className="text-ev-muted hover:text-ev-green transition-colors">
                                    Hardware
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-ev-muted hover:text-ev-green transition-colors">
                                    Software
                                </Link>
                            </li>
                            <li>
                                <Link href="/ev-chargers?filter=accessories" className="text-ev-muted hover:text-ev-green transition-colors">
                                    Accessories
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Help Column */}
                    <div className="space-y-4">
                        <h4 className="text-white font-bold text-sm tracking-wide">Help</h4>
                        <ul className="space-y-3 text-xs sm:text-sm text-gray-400">
                            <li className="flex items-center gap-1.5">
                                <Link href="/about" className="text-ev-muted hover:text-ev-green transition-colors">About</Link>
                                <span className="text-gray-600">|</span>
                                <Link href="/faq" className="text-ev-muted hover:text-ev-green transition-colors">FAQ</Link>
                            </li>
                            <li className="flex items-center gap-1.5">
                                <Link href="/contact" className="text-ev-muted hover:text-ev-green transition-colors">Contact</Link>
                                <span className="text-gray-600">|</span>
                                <Link href="/request-survey" className="text-ev-muted hover:text-ev-green transition-colors">Survey</Link>
                            </li>
                            <li className="text-gray-400">+1 (800) 555-0199</li>
                            <li className="text-gray-400">info@evngen.com</li>
                            <li className="text-gray-400">WhatsApp: +1 (800) 555-0199</li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar with Divider */}
                <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500">
                    <p>© 2026 EVNGEN. All rights reserved.</p>
                    <div className="flex gap-6 mt-4 sm:mt-0">
                        <Link href="/terms" className="text-ev-muted hover:text-ev-green transition-colors">
                            Terms &amp; Conditions
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}