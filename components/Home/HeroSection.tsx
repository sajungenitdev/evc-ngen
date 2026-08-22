// components/Home/HeroSection.tsx
import Link from 'next/link';
import { Zap, BatteryCharging, GraduationCap, Wrench } from 'lucide-react';

export default function HeroSection() {
    return (
        <section className="bg-ev-dark-blue text-white py-20 flex flex-col justify-center">
            <div className="max-w-7xl py-20 mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                {/* Left Content Column */}
                <div className="lg:col-span-7 space-y-8">
                    {/* Badge */}
                    <div className="inline-block">
                        <span className="border border-[#22c55e] text-[#22c55e] text-xs font-bold tracking-wider px-4 py-1.5 rounded-full uppercase">
                            EV Charging Infrastructure
                        </span>
                    </div>

                    {/* Headline */}
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1]">
                        Supply. Install.<br />
                        <span className="text-[#22c55e]">Train. Support.</span>
                    </h1>

                    {/* Description */}
                    <p className="text-gray-300 text-base sm:text-lg leading-relaxed max-w-2xl font-normal">
                        EVNGEN delivers end-to-end EV charging infrastructure — charger supply, installation, OCPP software, technical training, and long-term O&M support for government, commercial, and fleet projects.
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-4 pt-2">
                        <Link
                            href="/request-survey"
                            className="bg-[#22c55e] hover:bg-[#1ea34d] text-white font-semibold px-6 py-3.5 rounded-md transition-colors duration-200 text-sm md:text-base"
                        >
                            Request Free Site Survey
                        </Link>
                        <Link
                            href="/about"
                            className="bg-[#1e293b]/60 hover:bg-[#1e293b] border border-gray-700/60 text-white font-semibold px-6 py-3.5 rounded-md transition-colors duration-200 text-sm md:text-base"
                        >
                            Download Company Profile
                        </Link>
                    </div>
                </div>

                {/* Right Cards Container */}
                <div className="lg:col-span-5 bg-[#131d2e]/80 border border-gray-800/80 rounded-xl p-4 sm:p-5 space-y-3.5 shadow-xl">
                    {/* Card 1 */}
                    <Link
                        href="/solutions?tab=ac"
                        className="flex items-center gap-4 bg-[#1e293b]/70 hover:bg-[#1e293b] p-4 rounded-lg transition-colors border border-transparent hover:border-gray-700/50 group"
                    >
                        <div className="w-12 h-12 rounded-lg bg-[#22c55e] text-white flex items-center justify-center flex-shrink-0">
                            <Zap className="w-6 h-6 fill-current" />
                        </div>
                        <div>
                            <div className="text-gray-400 text-xs font-medium mb-1">AC Chargers</div>
                            <div className="text-white font-bold text-base sm:text-lg">7 kW – 22 kW</div>
                        </div>
                    </Link>

                    {/* Card 2 */}
                    <Link
                        href="/solutions?tab=dc"
                        className="flex items-center gap-4 bg-[#1e293b]/70 hover:bg-[#1e293b] p-4 rounded-lg transition-colors border border-transparent hover:border-gray-700/50 group"
                    >
                        <div className="w-12 h-12 rounded-lg bg-[#22c55e] text-white flex items-center justify-center flex-shrink-0">
                            <BatteryCharging className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-gray-400 text-xs font-medium mb-1">DC Fast Chargers</div>
                            <div className="text-white font-bold text-base sm:text-lg">60 kW – 180 kW+</div>
                        </div>
                    </Link>

                    {/* Card 3 */}
                    <Link
                        href="/training"
                        className="flex items-center gap-4 bg-[#1e293b]/70 hover:bg-[#1e293b] p-4 rounded-lg transition-colors border border-transparent hover:border-gray-700/50 group"
                    >
                        <div className="w-12 h-12 rounded-lg bg-[#2a3b5c] text-[#818cf8] flex items-center justify-center flex-shrink-0">
                            <GraduationCap className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-gray-400 text-xs font-medium mb-1">Training &amp; Certification</div>
                            <div className="text-white font-bold text-base sm:text-lg">Technician to Engineer</div>
                        </div>
                    </Link>

                    {/* Card 4 */}
                    <Link
                        href="/services"
                        className="flex items-center gap-4 bg-[#1e293b]/70 hover:bg-[#1e293b] p-4 rounded-lg transition-colors border border-transparent hover:border-gray-700/50 group"
                    >
                        <div className="w-12 h-12 rounded-lg bg-[#2a3b5c] text-[#94a3b8] flex items-center justify-center flex-shrink-0">
                            <Wrench className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-gray-400 text-xs font-medium mb-1">O&amp;M / AMC Support</div>
                            <div className="text-white font-bold text-base sm:text-lg">Preventive + Corrective</div>
                        </div>
                    </Link>
                </div>
            </div>
        </section>
    );
}