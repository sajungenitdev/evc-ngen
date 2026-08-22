import Link from 'next/link';
import PageHeader from '@/components/pagesComps/PageHeader';
import { Zap, ShoppingBag, LifeBuoy, Home } from 'lucide-react';

export default function NotFound() {
    return (
        <main className="min-h-screen bg-white flex flex-col">
            {/* Standard Branded Page Header */}
            <PageHeader
                breadcrumbs={[
                    { label: 'Home', link: '/' },
                    { label: '404 - Page Not Found' }
                ]}
                imageUrl="/images/help/EV Charging_1.jpg"
                title="Page Not Found"
                description="It looks like this connection got unplugged or the page has moved to a new route."
            />

            {/* Content Section */}
            <div className="flex-1 flex items-center justify-center py-20 px-6 md:px-12 lg:px-20">
                <div className="max-w-4xl w-full text-center space-y-12">

                    {/* Error Indicator Box */}
                    <div className="bg-[#0c1f38] text-white p-10 sm:p-14 rounded-3xl shadow-2xl relative overflow-hidden">
                        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-[#3ec06a]/10 rounded-full blur-2xl pointer-events-none"></div>
                        <div className="relative z-10 space-y-4 max-w-xl mx-auto">
                            <span className="text-[#3ec06a] text-xs font-extrabold uppercase tracking-widest">
                                Error 404 — Route Disconnected
                            </span>
                            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                                Lost your charge? Let&apos;s get you back on the grid.
                            </h2>
                            <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                                The link you followed might be broken, or the page may have been decommissioned. Explore our primary EV charging infrastructure solutions below.
                            </p>
                            <div className="pt-4">
                                <Link
                                    href="/"
                                    className="inline-flex items-center gap-2 bg-[#3ec06a] hover:bg-[#34a55b] text-[#071322] font-bold text-sm px-8 py-3.5 rounded-xl shadow-lg transition-all duration-200 hover:scale-105"
                                >
                                    <Home className="w-4 h-4" />
                                    Return to Homepage
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Helpful Quick Navigation Links */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">

                        {/* Chargers Link */}
                        <Link
                            href="/ev-chargers"
                            className="bg-[#f8f9fa] border border-gray-100 hover:border-[#3ec06a]/50 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
                        >
                            <div className="w-10 h-10 rounded-xl bg-[#0c1f38] text-[#3ec06a] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Zap className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-[#071322] mb-1">Browse Chargers</h3>
                                <p className="text-gray-500 text-xs leading-relaxed">Explore AC wallboxes, DC fast chargers, and OCPP stations.</p>
                            </div>
                        </Link>

                        {/* Shop Link */}
                        <Link
                            href="/ev-chargers?filter=accessories"
                            className="bg-[#f8f9fa] border border-gray-100 hover:border-[#3ec06a]/50 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
                        >
                            <div className="w-10 h-10 rounded-xl bg-[#0c1f38] text-[#3ec06a] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <ShoppingBag className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-[#071322] mb-1">EV Shop Online</h3>
                                <p className="text-gray-500 text-xs leading-relaxed">Shop cables, connectors, accessories, and hardware.</p>
                            </div>
                        </Link>

                        {/* Support Link */}
                        <Link
                            href="/contact"
                            className="bg-[#f8f9fa] border border-gray-100 hover:border-[#3ec06a]/50 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
                        >
                            <div className="w-10 h-10 rounded-xl bg-[#0c1f38] text-[#3ec06a] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <LifeBuoy className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-[#071322] mb-1">Get Support</h3>
                                <p className="text-gray-500 text-xs leading-relaxed">Talk to our sales team or request a site survey.</p>
                            </div>
                        </Link>

                    </div>

                </div>
            </div>
        </main>
    );
}