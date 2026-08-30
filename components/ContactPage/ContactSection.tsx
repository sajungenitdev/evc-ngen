// components/Home/ContactSection.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Phone, Mail, MessageCircle, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';

interface FormData {
    name: string;
    email: string;
    company: string;
    interest: string;
    message: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function ContactSection() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        company: '',
        interest: 'Basic EV Charger',
        message: '',
    });

    const validateEmail = (email: string): boolean => {
        return /^\S+@\S+\.\S+$/.test(email);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitError('');

        try {
            // Validate name
            if (formData.name.trim().length < 2) {
                const errorMsg = 'Please enter your full name';
                setSubmitError(errorMsg);
                toast.error(errorMsg);
                setIsSubmitting(false);
                return;
            }

            // Validate email
            if (!validateEmail(formData.email)) {
                const errorMsg = 'Please enter a valid email address';
                setSubmitError(errorMsg);
                toast.error(errorMsg);
                setIsSubmitting(false);
                return;
            }

            // Validate message
            if (formData.message.trim().length < 10) {
                const errorMsg = 'Please enter a message with at least 10 characters';
                setSubmitError(errorMsg);
                toast.error(errorMsg);
                setIsSubmitting(false);
                return;
            }

            const payload = {
                name: formData.name.trim(),
                email: formData.email.trim().toLowerCase(),
                company: formData.company || '',
                interest: formData.interest,
                message: formData.message.trim(),
            };

            const response = await fetch(`${API_BASE_URL}/contacts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (data.success) {
                setIsSubmitted(true);
                toast.success(data.message || 'Inquiry submitted successfully!');
                // Reset form
                setFormData({
                    name: '',
                    email: '',
                    company: '',
                    interest: 'Basic EV Charger',
                    message: '',
                });
                setSubmitError('');
            } else {
                let errorMsg = data.message || 'Failed to submit inquiry. Please try again.';
                if (errorMsg.includes('already have a pending')) {
                    errorMsg = 'You already have a pending inquiry. We will contact you soon.';
                }
                setSubmitError(errorMsg);
                toast.error(errorMsg);
            }
        } catch (error: any) {
            const errorMsg = 'Network error. Please check your connection and try again.';
            setSubmitError(errorMsg);
            toast.error(errorMsg);
            console.error('Submit error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    return (
        <section className="bg-white py-20 px-6 md:px-12 lg:px-20">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

                    {/* Left Column: Send Us an Inquiry Form */}
                    <div className="lg:col-span-7 bg-white rounded-3xl p-8 sm:p-10 form-box">
                        <div className="mb-8">
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#071322] tracking-tight mb-1">
                                Send Us an Inquiry
                            </h2>
                            <p className="text-gray-500 text-xs sm:text-sm">
                                Fields marked * are required.
                            </p>
                        </div>

                        {/* Success Message */}
                        {isSubmitted && (
                            <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 text-[#1b7936] text-sm font-medium">
                                ✅ Thanks — your inquiry has been received. Our team will contact you soon.
                            </div>
                        )}

                        {/* Error Message */}
                        {submitError && !isSubmitted && (
                            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium">
                                ⚠️ {submitError}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Name & Email Row */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-[#071322]">
                                        Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        placeholder="Jane Doe"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm text-[#071322] focus:outline-none focus:ring-2 focus:ring-[#1b7936]"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-[#071322]">
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        placeholder="jane@company.com"
                                        value={formData.email}
                                        onChange={handleChange}
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
                                    name="company"
                                    placeholder="Company name"
                                    value={formData.company}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm text-[#071322] focus:outline-none focus:ring-2 focus:ring-[#1b7936]"
                                />
                            </div>

                            {/* I'm interested in */}
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-[#071322]">
                                    I&apos;m interested in
                                </label>
                                <select
                                    name="interest"
                                    value={formData.interest}
                                    onChange={handleChange}
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
                                    name="message"
                                    required
                                    rows={4}
                                    placeholder="Tell us about your project..."
                                    value={formData.message}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm text-[#071322] focus:outline-none focus:ring-2 focus:ring-[#1b7936]"
                                />
                                <p className="text-xs text-gray-400">
                                    {formData.message.length}/2000 characters
                                </p>
                            </div>

                            {/* Submit Button */}
                            <div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-[#1b7936] hover:bg-[#155f2b] text-white font-bold text-sm py-4 rounded-xl shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Submitting...
                                        </span>
                                    ) : (
                                        'Send Inquiry Now'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Right Column: Contact Cards & Site Visit Banner */}
                    <div className="lg:col-span-5 space-y-6">

                        {/* Phone Card */}
                        <div className="bg-[#f5f6f8] border border-gray-100 rounded-2xl p-5 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-[#1b7936] text-white flex items-center justify-center flex-shrink-0 shadow-md">
                                <Phone className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-xs font-extrabold text-[#071322] tracking-wider uppercase mb-0.5">Phone</div>
                                <a href="tel:+18005550199" className="text-sm font-bold text-gray-700 hover:text-[#1b7936] transition-colors">
                                    +1 (800) 555-0199
                                </a>
                            </div>
                        </div>

                        {/* Email Card */}
                        <div className="bg-[#f5f6f8] border border-gray-100 rounded-2xl p-5 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-[#1b7936] text-white flex items-center justify-center flex-shrink-0 shadow-md">
                                <Mail className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-xs font-extrabold text-[#071322] tracking-wider uppercase mb-0.5">Email</div>
                                <a href="mailto:info@evngen.com" className="text-sm font-bold text-gray-700 hover:text-[#1b7936] transition-colors">
                                    info@evngen.com
                                </a>
                            </div>
                        </div>

                        {/* WeChat Card */}
                        <div className="bg-[#f5f6f8] border border-gray-100 rounded-2xl p-5 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-[#1b7936] text-white flex items-center justify-center flex-shrink-0 shadow-md">
                                <MessageCircle className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-xs font-extrabold text-[#071322] tracking-wider uppercase mb-0.5">WeChat</div>
                                <div className="text-sm font-bold text-gray-700">EVNGEN_Global</div>
                            </div>
                        </div>

                        {/* WhatsApp Card */}
                        <div className="bg-[#f5f6f8] border border-gray-100 rounded-2xl p-5 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-[#1b7936] text-white flex items-center justify-center flex-shrink-0 shadow-md">
                                <Smartphone className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-xs font-extrabold text-[#071322] tracking-wider uppercase mb-0.5">WhatsApp</div>
                                <a href="https://wa.me/18005550199" target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-gray-700 hover:text-[#1b7936] transition-colors">
                                    +1 (800) 555-0199
                                </a>
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