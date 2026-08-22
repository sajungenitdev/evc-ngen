'use client';

import { useState } from 'react';
import { Phone } from 'lucide-react';

export default function RequestSurveySection() {
    const [activeTab, setActiveTab] = useState<'survey' | 'call'>('survey');
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        company: '',
        address: '',
        chargersCount: '1–2',
        preferredDate: '',
        details: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log({ type: activeTab, ...formData });
    };

    return (
        <section className="bg-white py-20 px-6 md:px-12 lg:px-20">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                    
                    {/* Left Column: Form (Span 7) */}
                    <div className="lg:col-span-7 bg-white rounded-3xl p-8 sm:p-10 form-box">
                        <div className="mb-8">
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#071322] tracking-tight mb-1">
                                Tell Us About Your Site
                            </h2>
                            <p className="text-gray-500 text-xs sm:text-sm">
                                Fields marked * are required.
                            </p>
                        </div>

                        {/* Interactive Toggle Tabs */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <button
                                type="button"
                                onClick={() => setActiveTab('survey')}
                                className={`py-3.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-xs ${
                                    activeTab === 'survey'
                                        ? 'border-2 border-[#1b7936] text-[#1b7936] bg-[#f0fdf4]'
                                        : 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                                }`}
                            >
                                Site Survey
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('call')}
                                className={`py-3.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-xs ${
                                    activeTab === 'call'
                                        ? 'border-2 border-[#1b7936] text-[#1b7936] bg-[#f0fdf4]'
                                        : 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                                }`}
                            >
                                Consultation Call
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Name & Phone Row */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-[#071322]">Name *</label>
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
                                    <label className="block text-xs font-bold text-[#071322]">Phone *</label>
                                    <input
                                        type="tel"
                                        required
                                        placeholder="+1 555 000 0000"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm text-[#071322] focus:outline-none focus:ring-2 focus:ring-[#1b7936]"
                                    />
                                </div>
                            </div>

                            {/* Email & Company Row */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-[#071322]">Email *</label>
                                    <input
                                        type="email"
                                        required
                                        placeholder="jane@company.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm text-[#071322] focus:outline-none focus:ring-2 focus:ring-[#1b7936]"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-[#071322]">Company</label>
                                    <input
                                        type="text"
                                        placeholder="Company name"
                                        value={formData.company}
                                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm text-[#071322] focus:outline-none focus:ring-2 focus:ring-[#1b7936]"
                                    />
                                </div>
                            </div>

                            {/* Site Address */}
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-[#071322]">Site Address</label>
                                <input
                                    type="text"
                                    placeholder="Street, city, state"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm text-[#071322] focus:outline-none focus:ring-2 focus:ring-[#1b7936]"
                                />
                            </div>

                            {/* Number of Chargers & Preferred Date Row */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-[#071322]">Number of Chargers Needed</label>
                                    <select
                                        value={formData.chargersCount}
                                        onChange={(e) => setFormData({ ...formData, chargersCount: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm text-[#071322] bg-white focus:outline-none focus:ring-2 focus:ring-[#1b7936]"
                                    >
                                        <option value="1–2">1–2</option>
                                        <option value="3–5">3–5</option>
                                        <option value="6-10">6–10</option>
                                        <option value="10+">10+</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-[#071322]">Preferred Date</label>
                                    <input
                                        type="date"
                                        value={formData.preferredDate}
                                        onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm text-[#071322] focus:outline-none focus:ring-2 focus:ring-[#1b7936]"
                                    />
                                </div>
                            </div>

                            {/* Additional Details */}
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-[#071322]">Additional Details</label>
                                <textarea
                                    rows={4}
                                    placeholder="Tell us about the site, vehicle types, timeline..."
                                    value={formData.details}
                                    onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm text-[#071322] focus:outline-none focus:ring-2 focus:ring-[#1b7936]"
                                />
                            </div>

                            {/* Submit Button */}
                            <div>
                                <button
                                    type="submit"
                                    className="w-full bg-[#1b7936] hover:bg-[#155f2b] text-white font-bold text-sm py-4 rounded-xl shadow-lg transition-colors"
                                >
                                    {activeTab === 'survey' ? 'Request Site Survey' : 'Request Consultation Call'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Right Column: What to Expect & Prefer to Talk Now (Span 5) */}
                    <div className="lg:col-span-5 space-y-6">
                        
                        {/* What to Expect Box */}
                        <div className="bg-[#f8f9fa] border border-gray-100 rounded-3xl p-8  space-y-6">
                            <h3 className="text-base sm:text-lg font-bold text-[#071322]">
                                What to Expect
                            </h3>
                            
                            <div className="space-y-5">
                                {/* Step 1 */}
                                <div className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-full bg-[#1b7936] text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-sm">
                                        1
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-[#071322]">We schedule a call or visit</h4>
                                        <p className="text-gray-500 text-xs mt-0.5">Within one business day of your request.</p>
                                    </div>
                                </div>

                                {/* Step 2 */}
                                <div className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-full bg-[#1b7936] text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-sm">
                                        2
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-[#071322]">We assess your site</h4>
                                        <p className="text-gray-500 text-xs mt-0.5">Electrical capacity, parking layout, and usage patterns.</p>
                                    </div>
                                </div>

                                {/* Step 3 */}
                                <div className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-full bg-[#1b7936] text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-sm">
                                        3
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-[#071322]">You receive a proposal</h4>
                                        <p className="text-gray-500 text-xs mt-0.5">Hardware recommendation, pricing, and installation plan.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Prefer to Talk Now Card */}
                        <div className="bg-[#f8f9fa] border border-gray-100 rounded-3xl p-6 flex items-center gap-4 ">
                            <div className="w-12 h-12 rounded-full bg-[#1b7936] text-white flex items-center justify-center flex-shrink-0 shadow-md">
                                <Phone className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-xs font-extrabold text-[#071322] tracking-wider uppercase mb-0.5">Prefer to talk now?</div>
                                <div className="text-sm font-bold text-gray-700">Call +1 (800) 555-0199</div>
                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </section>
    );
}