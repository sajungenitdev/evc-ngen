'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Phone, Mail, MessageCircle, Smartphone } from 'lucide-react';

export default function ContactSection() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        company: '',
        interest: 'Basic EV Charger',
        message: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle form submission logic here
        console.log(formData);
    };

    return (
        <section className="bg-white py-20 px-6 md:px-12 lg:px-20">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

                    {/* Left Column: Send Us an Inquiry Form (Span 7) */}
                    <div className="lg:col-span-7 bg-white rounded-3xl p-8 sm:p-10 form-box ">
                        <div className="mb-8">
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#071322] tracking-tight mb-1">
                                Send Us an Inquiry
                            </h2>
                            <p className="text-gray-500 text-xs sm:text-sm">
                                Fields marked * are required.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Name & Email Row */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-[#071322]">
                                        Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Jane Doe"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm text-[#071322] focus:outline-none focus:ring-2 focus:ring-[#1b7936]"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-[#071322]">
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        placeholder="jane@company.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm text-[#071322] focus:outline-none focus:ring-2 focus:ring-[#1b7936]"
                                    />
                                </div>
                            </div>

                            {/* Company Name */}
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-[#071322]">
                                    Company
                                </label>
                                <input
                                    type="text"
                                    placeholder="Company name"
                                    value={formData.company}
                                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm text-[#071322] focus:outline-none focus:ring-2 focus:ring-[#1b7936]"
                                />
                            </div>

                            {/* I'm interested in */}
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-[#071322]">
                                    I&apos;m interested in
                                </label>
                                <select
                                    value={formData.interest}
                                    onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm text-[#071322] bg-white focus:outline-none focus:ring-2 focus:ring-[#1b7936]"
                                >
                                    <option value="Basic EV Charger">Basic EV Charger</option>
                                    <option value="DC Fast Charger">DC Fast Charger</option>
                                    <option value="Charging Station with OCPP">Charging Station with OCPP</option>
                                    <option value="Dual-Port Wallbox">Dual-Port Wallbox</option>
                                </select>
                            </div>

                            {/* Message */}
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-[#071322]">
                                    Message *
                                </label>
                                <textarea
                                    required
                                    rows={4}
                                    placeholder="Tell us about your project..."
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm text-[#071322] focus:outline-none focus:ring-2 focus:ring-[#1b7936]"
                                />
                            </div>

                            {/* Submit Button */}
                            <div>
                                <button
                                    type="submit"
                                    className="w-full bg-[#1b7936] hover:bg-[#155f2b] text-white font-bold text-sm py-4 rounded-xl shadow-lg transition-colors"
                                >
                                    Send Inquiry Now
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Right Column: Contact Cards & Site Visit Banner (Span 5) */}
                    <div className="lg:col-span-5 space-y-6">

                        {/* Phone Card */}
                        <div className="bg-[#f5f6f8] border border-gray-100 rounded-2xl p-5 flex items-center gap-4 ">
                            <div className="w-12 h-12 rounded-full bg-[#1b7936] text-white flex items-center justify-center flex-shrink-0 shadow-md">
                                <Phone className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-xs font-extrabold text-[#071322] tracking-wider uppercase mb-0.5">Phone</div>
                                <div className="text-sm font-bold text-gray-700">+1 (800) 555-0199</div>
                            </div>
                        </div>

                        {/* Email Card */}
                        <div className="bg-[#f5f6f8] border border-gray-100 rounded-2xl p-5 flex items-center gap-4 ">
                            <div className="w-12 h-12 rounded-full bg-[#1b7936] text-white flex items-center justify-center flex-shrink-0 shadow-md">
                                <Mail className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-xs font-extrabold text-[#071322] tracking-wider uppercase mb-0.5">Email</div>
                                <div className="text-sm font-bold text-gray-700">info@evngen.com</div>
                            </div>
                        </div>

                        {/* WeChat Card */}
                        <div className="bg-[#f5f6f8] border border-gray-100 rounded-2xl p-5 flex items-center gap-4 ">
                            <div className="w-12 h-12 rounded-full bg-[#1b7936] text-white flex items-center justify-center flex-shrink-0 shadow-md">
                                <MessageCircle className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-xs font-extrabold text-[#071322] tracking-wider uppercase mb-0.5">WeChat</div>
                                <div className="text-sm font-bold text-gray-700">EVNGEN_Global</div>
                            </div>
                        </div>

                        {/* WhatsApp Card */}
                        <div className="bg-[#f5f6f8] border border-gray-100 rounded-2xl p-5 flex items-center gap-4 ">
                            <div className="w-12 h-12 rounded-full bg-[#1b7936] text-white flex items-center justify-center flex-shrink-0 shadow-md">
                                <Smartphone className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-xs font-extrabold text-[#071322] tracking-wider uppercase mb-0.5">WhatsApp</div>
                                <div className="text-sm font-bold text-gray-700">+1 (800) 555-0199</div>
                            </div>
                        </div>

                        {/* Site Visit Banner Card */}
                        <div className="bg-[#114b34] rounded-3xl p-8 text-white shadow-xl space-y-6">
                            <div>
                                <h3 className="text-lg sm:text-xl font-bold tracking-tight mb-2">
                                    Need a site visit instead?
                                </h3>
                                <p className="text-gray-200 text-xs sm:text-sm leading-relaxed">
                                    Request a free on-site survey or a consultation call with our engineering team.
                                </p>
                            </div>
                            <div>
                                <Link
                                    href="/request-survey"
                                    className="inline-block bg-white text-[#071322] hover:bg-gray-100 font-bold text-xs sm:text-sm px-6 py-3 rounded-xl transition-colors shadow-md"
                                >
                                    Request Survey / Consult
                                </Link>
                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </section>
    );
}