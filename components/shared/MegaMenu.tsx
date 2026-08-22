// components/shared/MegaMenu.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { solutionsList, getSolutionIcon } from '@/lib/solutionsDb';
import { productsList, productCategories, brandsList } from '@/lib/productsDb';
import { industriesList, getIndustryIcon } from '@/lib/industriesDb';
import { trainingPrograms } from '@/lib/trainingDb';
import { servicesList } from '@/lib/servicesDb';

interface MegaMenuProps {
    type: 'products' | 'solutions' | 'industries' | 'accessories' | 'training' | 'services';
}

export default function MegaMenu({ type }: MegaMenuProps) {
    // Get products by category
    const getCategoryProducts = (categoryId: string) => {
        return productsList.filter(p => p.category === categoryId);
    };

    // Accessories Data
    const accessoriesData = [
        { label: 'Charging Cables & Leads', link: '/ev-chargers?filter=accessories', desc: 'Type 1, Type 2, CCS & NACS', icon: '🔌' },
        { label: 'Adapters & Connectors', link: '/ev-chargers?filter=accessories', desc: 'Cross-standard charging adapters', icon: '🔗' },
        { label: 'Cable Management', link: '/ev-chargers?filter=accessories', desc: 'Wall holders & retractable reels', icon: '📜' },
        { label: 'RFID Cards & Access Fobs', link: '/ev-chargers?filter=accessories', desc: 'Authentication for shared chargers', icon: '💳' },
        { label: 'Protective Covers & Enclosures', link: '/ev-chargers?filter=accessories', desc: 'Weatherproofing for outdoor units', icon: '🛡️' },
        { label: 'Mounting Pedestals & Stands', link: '/ev-chargers?filter=accessories', desc: 'Freestanding & wall-mount options', icon: '📍' },
        { label: 'Power Meters & Load Management', link: '/ev-chargers?filter=accessories', desc: 'Sub-metering & circuit protection', icon: '📊' },
        { label: 'Signage & Bollards', link: '/ev-chargers?filter=accessories', desc: 'Bay marking & vehicle protection', icon: '🚧' },
        { label: 'Replacement Parts & Test Equipment', link: '/ev-chargers?filter=accessories', desc: 'EVSE diagnostics & spares', icon: '🔧' }
    ];

    // ==========================================
    // PRODUCTS MEGA MENU
    // ==========================================
    if (type === 'products') {
        return (
            <div className="bg-white rounded-2xl shadow-2xl p-6 flex flex-col w-[1000px] max-w-[95vw] text-left">
                <div className="flex gap-6">
                    <div className="w-[220px] flex-shrink-0">
                        <Link
                            href="/ev-chargers"
                            className="relative w-[220px] rounded-xl overflow-hidden flex-shrink-0 block bg-[#0c1f38] hover:bg-[#132c4e] transition-colors group p-6 min-h-[220px] h-full"
                        >
                            <div className="absolute inset-0 z-0">
                                <Image
                                    src="/images/help/make-easy.jpg"
                                    alt="EV Charging Promo"
                                    fill
                                    className="object-cover opacity-40 group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0c1f38] via-[#0c1f38]/60 to-transparent"></div>
                            </div>
                            <div className="relative z-10 h-full flex flex-col justify-between">
                                <div className="text-white font-extrabold text-sm leading-snug drop-shadow-sm w-[100px] break-words">
                                    Make EV charging easy
                                </div>
                                <div className="text-[#3ec06a] font-bold text-sm flex items-center gap-1.5 group-hover:gap-2.5 transition-all mt-4">
                                    EV Chargers →
                                </div>
                            </div>
                        </Link>
                    </div>

                    <div className="flex-1 flex gap-5 min-w-0">
                        <div className="flex-1 min-w-0">
                            <Link href="/ev-chargers?category=ac-chargers" className="text-[#0c1f38] font-extrabold text-sm mb-3 truncate hover:text-[#3ec06a] transition-colors block">
                                AC Chargers
                            </Link>
                            <div className="space-y-3">
                                {getCategoryProducts('ac-chargers').slice(0, 3).map((p) => (
                                    <div key={p.id} className="group min-w-0">
                                        <Link href={`/ev-chargers/${p.id}`} className="block text-[#0c1f38] font-semibold text-sm hover:text-[#3ec06a] transition-colors leading-tight truncate" title={p.name}>
                                            {p.name}
                                        </Link>
                                        <div className="text-gray-400 text-[11px] leading-relaxed font-normal mt-0.5 truncate">
                                            {p.specs[0] || ''} • Model: {p.model}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex-1 min-w-0 border-l border-gray-200/70 pl-5">
                            <Link href="/ev-chargers?category=dc-chargers" className="text-[#0c1f38] font-extrabold text-sm mb-3 truncate hover:text-[#3ec06a] transition-colors block">
                                DC Chargers
                            </Link>
                            <div className="space-y-3">
                                {getCategoryProducts('dc-chargers').slice(0, 3).map((p) => (
                                    <div key={p.id} className="group min-w-0">
                                        <Link href={`/ev-chargers/${p.id}`} className="block text-[#0c1f38] font-semibold text-sm hover:text-[#3ec06a] transition-colors leading-tight truncate" title={p.name}>
                                            {p.name}
                                        </Link>
                                        <div className="text-gray-400 text-[11px] leading-relaxed font-normal mt-0.5 truncate">
                                            {p.specs[0] || ''} • Model: {p.model}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex-1 min-w-0 border-l border-gray-200/70 pl-5">
                            <Link href="/ev-chargers?category=accessories" className="text-[#0c1f38] font-extrabold text-sm mb-3 truncate hover:text-[#3ec06a] transition-colors block">
                                Accessories
                            </Link>
                            <div className="space-y-3">
                                {[...getCategoryProducts('accessories'), ...getCategoryProducts('storage')].slice(0, 3).map((p) => (
                                    <div key={p.id} className="group min-w-0">
                                        <Link href={`/ev-chargers/${p.id}`} className="block text-[#0c1f38] font-semibold text-sm hover:text-[#3ec06a] transition-colors leading-tight truncate" title={p.name}>
                                            {p.name}
                                        </Link>
                                        <div className="text-gray-400 text-[11px] leading-relaxed font-normal mt-0.5 truncate">
                                            {p.specs[0] || ''} • Model: {p.model}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-5 pt-4 border-t border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link href="/brands" className="text-xs font-semibold text-[#1b7936] hover:underline flex items-center gap-1.5">
                            <span className="text-gray-400 font-normal">View All</span> Brand →
                        </Link>
                        <Link href="/categories" className="text-xs font-semibold text-[#1b7936] hover:underline flex items-center gap-1.5">
                            <span className="text-gray-400 font-normal">View All</span> Category →
                        </Link>
                    </div>
                    <Link href="/ev-chargers" className="text-xs font-bold text-white bg-[#1b7936] px-4 py-1.5 rounded-lg hover:bg-[#155f2b] transition-colors">
                        View All Products
                    </Link>
                </div>
            </div>
        );
    }

    // ==========================================
    // SOLUTIONS MEGA MENU
    // ==========================================
    if (type === 'solutions') {
        const dynamicSolutions = solutionsList.map(solution => ({
            id: solution.id,
            label: solution.label,
            link: solution.link,
            desc: solution.desc,
            icon: getSolutionIcon(solution.id)
        }));

        return (
            <div className="bg-white rounded-3xl shadow-2xl p-8 w-[820px] max-w-[95vw] text-left space-y-6 border border-gray-100">
                <div className="text-xs font-extrabold text-[#1b7936] uppercase tracking-widest">SOLUTIONS</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {dynamicSolutions.map((solution, idx) => (
                        <Link
                            key={solution.id}
                            href={solution.link}
                            className={`group p-4 rounded-2xl border transition-all flex items-center gap-3.5 min-w-0 ${idx === 0 ? 'bg-[#f8f9fa] border-gray-200/80 shadow-2xs' : 'bg-white border-transparent hover:bg-[#f8f9fa] hover:border-gray-200'
                                }`}
                        >
                            <div className="w-10 h-10 rounded-xl bg-[#e8f5e9] flex items-center justify-center flex-shrink-0 text-base shadow-2xs">
                                {solution.icon}
                            </div>
                            <div className="min-w-0 flex-1">
                                <h4 className="text-[#0c1f38] font-extrabold text-xs sm:text-sm group-hover:text-[#1b7936] transition-colors truncate">
                                    {solution.label}
                                </h4>
                                <p className="text-gray-500 text-[11px] leading-snug mt-0.5 truncate">
                                    {solution.desc}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
                <div className="bg-[#f8f9fa] rounded-2xl p-6 border border-gray-200/80 space-y-4">
                    <div className="text-xs font-extrabold text-[#1b7936] uppercase tracking-widest">CASES</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8 text-xs">
                        <div className="min-w-0 truncate">
                            <span className="font-extrabold text-[#071322]">Limited grid capacity?</span>
                            <span className="text-gray-600"> — Add 40kW of chargers without exceeding an existing electrical service.</span>
                        </div>
                        <div className="min-w-0 truncate">
                            <span className="font-extrabold text-[#071322]">24/7 uptime needed?</span>
                            <span className="text-gray-600"> — Keep chargers running through grid outages with a microgrid.</span>
                        </div>
                        <div className="min-w-0 truncate">
                            <span className="font-extrabold text-[#071322]">Want to use solar?</span>
                            <span className="text-gray-600"> — Combine EV charging with an on-site solar + storage system.</span>
                        </div>
                        <div className="min-w-0 truncate">
                            <span className="font-extrabold text-[#071322]">Need to bill tenants?</span>
                            <span className="text-gray-600"> — Meter and invoice usage automatically over OCPP.</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ==========================================
    // INDUSTRIES MEGA MENU
    // ==========================================
    if (type === 'industries') {
        const dynamicIndustries = industriesList.map(industry => ({
            id: industry.id,
            label: industry.label,
            link: `/industries/${industry.id}`,
            desc: industry.desc,
            icon: getIndustryIcon(industry.id)
        }));

        return (
            <div className="bg-white rounded-3xl shadow-2xl p-8 w-[820px] max-w-[95vw] text-left space-y-6 border border-gray-100">
                <div className="text-xs font-extrabold text-[#1b7936] uppercase tracking-widest">INDUSTRIES</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {dynamicIndustries.map((item, idx) => (
                        <Link
                            key={item.id}
                            href={item.link}
                            className="group p-3.5 rounded-2xl border border-transparent hover:bg-[#f8f9fa] hover:border-gray-200 transition-all flex items-start gap-3 min-w-0"
                        >
                            <div className="text-xl flex-shrink-0">{item.icon}</div>
                            <div className="min-w-0 flex-1">
                                <h4 className="text-[#0c1f38] font-extrabold text-xs sm:text-sm group-hover:text-[#1b7936] transition-colors truncate" title={item.label}>
                                    {item.label}
                                </h4>
                                <p className="text-gray-500 text-[11px] leading-snug mt-0.5 truncate" title={item.desc}>
                                    {item.desc}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
                <div className="bg-[#f8f9fa] rounded-2xl p-6 border border-gray-200/80 space-y-4">
                    <div className="text-xs font-extrabold text-[#1b7936] uppercase tracking-widest">CASES</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8 text-xs">
                        <div className="min-w-0 truncate">
                            <span className="font-extrabold text-[#071322]">Fuel retailer</span>
                            <span className="text-gray-600"> — Add DC fast bays beside the pumps without rebuilding the forecourt.</span>
                        </div>
                        <div className="min-w-0 truncate">
                            <span className="font-extrabold text-[#071322]">Condo board</span>
                            <span className="text-gray-600"> — Fit 40 charging bays in a garage without a full service upgrade.</span>
                        </div>
                        <div className="min-w-0 truncate">
                            <span className="font-extrabold text-[#071322]">City office</span>
                            <span className="text-gray-600"> — Curbside chargers with public usage reporting & OCPP compliance.</span>
                        </div>
                        <div className="min-w-0 truncate">
                            <span className="font-extrabold text-[#071322]">Mall operator</span>
                            <span className="text-gray-600"> — Free charging for shoppers, billed separately to tenants.</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ==========================================
    // ACCESSORIES MEGA MENU
    // ==========================================
    if (type === 'accessories') {
        return (
            <div className="bg-white rounded-3xl shadow-2xl p-8 w-[840px] max-w-[95vw] text-left space-y-6 border border-gray-100">
                <div className="text-xs font-extrabold text-[#1b7936] uppercase tracking-widest">ACCESSORIES</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {accessoriesData.map((item, idx) => (
                        <Link
                            key={idx}
                            href={item.link}
                            className="group p-3.5 rounded-2xl border border-transparent hover:bg-[#f8f9fa] hover:border-gray-200 transition-all flex items-center gap-3.5 min-w-0"
                        >
                            <div className="w-10 h-10 rounded-xl bg-[#e8f5e9] flex items-center justify-center flex-shrink-0 text-base shadow-2xs">
                                {item.icon}
                            </div>
                            <div className="min-w-0 flex-1">
                                <h4 className="text-[#0c1f38] font-extrabold text-xs sm:text-sm group-hover:text-[#1b7936] transition-colors truncate" title={item.label}>
                                    {item.label}
                                </h4>
                                <p className="text-gray-500 text-[11px] leading-snug mt-0.5 truncate" title={item.desc}>
                                    {item.desc}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
                <div className="pt-4 border-t border-gray-200">
                    <Link
                        href="/ev-chargers?category=accessories"
                        className="text-xs font-extrabold text-[#1b7936] hover:underline"
                    >
                        View All Accessories →
                    </Link>
                </div>
            </div>
        );
    }

    // ==========================================
    // TRAINING MEGA MENU
    // ==========================================
    if (type === 'training') {
        const dynamicTraining = trainingPrograms.map(program => ({
            id: program.id,
            label: program.title,
            link: program.link,
            desc: program.description,
            icon: program.icon,
            badge: program.badge
        }));

        return (
            <div className="bg-white rounded-3xl shadow-2xl p-8 w-[680px] max-w-[95vw] text-left space-y-6 border border-gray-100">
                <div className="text-xs font-extrabold text-[#1b7936] uppercase tracking-widest">TRAINING</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {dynamicTraining.map((item) => (
                        <Link
                            key={item.id}
                            href={item.link}
                            className="group p-3.5 rounded-2xl border border-transparent hover:bg-[#f8f9fa] hover:border-gray-200 transition-all flex items-center gap-3.5 min-w-0"
                        >
                            <div className="w-10 h-10 rounded-xl bg-[#e8f5e9] flex items-center justify-center flex-shrink-0 text-base shadow-2xs">
                                {item.icon}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="text-[10px] text-[#1b7936] font-bold uppercase tracking-wider">
                                    {item.badge}
                                </div>
                                <h4 className="text-[#0c1f38] font-extrabold text-xs sm:text-sm group-hover:text-[#1b7936] transition-colors truncate" title={item.label}>
                                    {item.label}
                                </h4>
                                <p className="text-gray-500 text-[11px] leading-snug mt-0.5 truncate" title={item.desc}>
                                    {item.desc}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
                <div className="pt-4 border-t border-gray-200">
                    <Link
                        href="/training"
                        className="text-xs font-extrabold text-[#1b7936] hover:underline"
                    >
                        View All Training Programs →
                    </Link>
                </div>
            </div>
        );
    }

    // ==========================================
    // SERVICES MEGA MENU
    // ==========================================
    if (type === 'services') {
        const dynamicServices = servicesList.map(service => ({
            id: service.id,
            label: service.title,
            link: service.link,
            desc: service.description,
            icon: service.icon,
            badge: service.badge
        }));

        return (
            <div className="bg-white rounded-3xl shadow-2xl p-8 w-[680px] max-w-[95vw] text-left space-y-6 border border-gray-100">
                <div className="text-xs font-extrabold text-[#1b7936] uppercase tracking-widest">SERVICES</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {dynamicServices.map((item) => (
                        <Link
                            key={item.id}
                            href={item.link}
                            className="group p-3.5 rounded-2xl border border-transparent hover:bg-[#f8f9fa] hover:border-gray-200 transition-all flex items-center gap-3.5 min-w-0"
                        >
                            <div className="w-10 h-10 rounded-xl bg-[#e8f5e9] flex items-center justify-center flex-shrink-0 text-base shadow-2xs">
                                {item.icon}
                            </div>
                            <div className="min-w-0 flex-1">
                                {/* <div className="text-[10px] text-[#1b7936] font-bold uppercase tracking-wider">
                                    {item.badge}
                                </div> */}
                                <h4 className="text-[#0c1f38] font-extrabold text-xs sm:text-sm group-hover:text-[#1b7936] transition-colors truncate" title={item.label}>
                                    {item.label}
                                </h4>
                                <p className="text-gray-500 text-[11px] leading-snug mt-0.5 truncate" title={item.desc}>
                                    {item.desc}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
                <div className="pt-4 border-t border-gray-200">
                    <Link
                        href="/services"
                        className="text-xs font-extrabold text-[#1b7936] hover:underline"
                    >
                        View All Services →
                    </Link>
                </div>
            </div>
        );
    }

    // Fallback (should never happen)
    return null;
}