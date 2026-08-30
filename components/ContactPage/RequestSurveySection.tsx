// components/Home/RequestSurveySection.tsx
'use client';

import { useState } from 'react';
import { Phone } from 'lucide-react';
import toast from 'react-hot-toast';

interface FormData {
    name: string;
    phone: string;
    email: string;
    company: string;
    address: string;
    chargersCount: string;
    preferredDate: string;
    preferredTime: string;
    details: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function RequestSurveySection() {
    const [activeTab, setActiveTab] = useState<'survey' | 'call'>('survey');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [submitError, setSubmitError] = useState('');

    const [formData, setFormData] = useState<FormData>({
        name: '',
        phone: '',
        email: '',
        company: '',
        address: '',
        chargersCount: '1–2',
        preferredDate: '',
        preferredTime: 'any',
        details: '',
    });

    // Validation helpers
    const validatePhone = (phone: string): boolean => {
        const cleaned = phone.replace(/[\s\-\(\)]/g, '');
        return /^\+?[1-9]\d{9,14}$/.test(cleaned);
    };

    const validateEmail = (email: string): boolean => {
        return /^\S+@\S+\.\S+$/.test(email);
    };

    const cleanPhone = (phone: string): string => {
        return phone.replace(/[\s\-\(\)]/g, '');
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

            // Validate phone
            const cleanedPhone = cleanPhone(formData.phone);
            if (!validatePhone(cleanedPhone)) {
                const errorMsg = 'Please enter a valid phone number with country code (e.g., +1234567890)';
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

            // Validate address for survey
            if (activeTab === 'survey' && !formData.address.trim()) {
                const errorMsg = 'Please enter your site address';
                setSubmitError(errorMsg);
                toast.error(errorMsg);
                setIsSubmitting(false);
                return;
            }

            // Prepare payload based on request type
            const payload = {
                name: formData.name.trim(),
                phone: cleanedPhone,
                email: formData.email.trim().toLowerCase(),
                company: formData.company || '',
                address: activeTab === 'survey' ? formData.address.trim() : '',
                chargersCount: formData.chargersCount,
                preferredDate: formData.preferredDate || null,
                preferredTime: formData.preferredTime || 'any',
                details: formData.details || '',
                requestType: activeTab,
                callPurpose: activeTab === 'call' ? formData.details || '' : '',
                callDuration: activeTab === 'call' ? '30min' : undefined,
            };

            const response = await fetch(`${API_BASE_URL}/surveys`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (data.success) {
                setIsSubmitted(true);
                toast.success(data.message || 'Request submitted successfully!');
                // Reset form
                setFormData({
                    name: '',
                    phone: '',
                    email: '',
                    company: '',
                    address: '',
                    chargersCount: '1–2',
                    preferredDate: '',
                    preferredTime: 'any',
                    details: '',
                });
                // Reset error
                setSubmitError('');
            } else {
                // Handle specific error messages from backend
                let errorMsg = data.message || 'Failed to submit request. Please try again.';
                
                // Check for duplicate request
                if (errorMsg.includes('already have a pending')) {
                    errorMsg = 'You already have a pending request. We will contact you soon.';
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
        
        // Special handling for phone to only allow digits and +
        if (name === 'phone') {
            const cleaned = value.replace(/[^0-9\+]/g, '');
            setFormData({ ...formData, [name]: cleaned });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    return (
        <section className="bg-white py-20 px-6 md:px-12 lg:px-20">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

                    {/* Left Column: Form (Span 7) */}
                    <div className="lg:col-span-7 bg-white rounded-3xl p-8 sm:p-10 form-box">
                        <div className="mb-6">
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#071322] tracking-tight mb-1">
                                Tell Us About Your Site
                            </h2>
                            <p className="text-gray-500 text-xs sm:text-sm">
                                Fields marked * are required.
                            </p>
                        </div>

                        {/* Success Message */}
                        {isSubmitted && (
                            <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 text-[#1b7936] text-sm font-medium">
                                ✅ Thanks — your request has been received. Our team will contact you to schedule.
                            </div>
                        )}

                        {/* Error Message */}
                        {submitError && !isSubmitted && (
                            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium">
                                ⚠️ {submitError}
                            </div>
                        )}

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
                                📋 Site Survey
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
                                📞 Consultation Call
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Name Field */}
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-[#071322]">
                                    Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm text-[#071322] focus:outline-none focus:ring-2 focus:ring-[#1b7936]"
                                    placeholder="John Doe"
                                />
                            </div>

                            {/* Phone Field */}
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-[#071322]">
                                    Phone <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="tel"
                                        name="phone"
                                        required
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="+1234567890"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm text-[#071322] focus:outline-none focus:ring-2 focus:ring-[#1b7936]"
                                    />
                                    {formData.phone.length > 0 && validatePhone(formData.phone) && (
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 text-sm font-bold">✓</span>
                                    )}
                                </div>
                                <p className="text-xs text-gray-400">
                                    Enter phone with country code (e.g., +1234567890 or 1234567890)
                                </p>
                            </div>

                            {/* Email Field */}
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-[#071322]">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="john@example.com"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm text-[#071322] focus:outline-none focus:ring-2 focus:ring-[#1b7936]"
                                    />
                                    {formData.email.length > 0 && validateEmail(formData.email) && (
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 text-sm font-bold">✓</span>
                                    )}
                                </div>
                            </div>

                            {/* Company Field */}
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-[#071322]">
                                    Company
                                </label>
                                <input
                                    type="text"
                                    name="company"
                                    value={formData.company}
                                    onChange={handleChange}
                                    placeholder="EVNGEN Inc."
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm text-[#071322] focus:outline-none focus:ring-2 focus:ring-[#1b7936]"
                                />
                            </div>

                            {/* Site Address Field (Conditional display for 'survey' mode) */}
                            {activeTab === 'survey' && (
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-[#071322]">
                                        Site Address <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="address"
                                        required
                                        value={formData.address}
                                        onChange={handleChange}
                                        placeholder="123 Main St, City, State, ZIP"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm text-[#071322] focus:outline-none focus:ring-2 focus:ring-[#1b7936]"
                                    />
                                </div>
                            )}

                            {/* Number of Chargers Needed Select */}
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-[#071322]">
                                    Number of Chargers Needed
                                </label>
                                <select
                                    name="chargersCount"
                                    value={formData.chargersCount}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm text-[#071322] bg-white focus:outline-none focus:ring-2 focus:ring-[#1b7936]"
                                >
                                    <option value="1–2">1–2</option>
                                    <option value="3–10">3–10</option>
                                    <option value="11–50">11–50</option>
                                    <option value="50+">50+</option>
                                </select>
                            </div>

                            {/* Preferred Date Field */}
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-[#071322]">
                                    Preferred Date
                                </label>
                                <input
                                    type="date"
                                    name="preferredDate"
                                    value={formData.preferredDate}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm text-[#071322] focus:outline-none focus:ring-2 focus:ring-[#1b7936]"
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>

                            {/* Preferred Time Field */}
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-[#071322]">
                                    Preferred Time
                                </label>
                                <select
                                    name="preferredTime"
                                    value={formData.preferredTime}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm text-[#071322] bg-white focus:outline-none focus:ring-2 focus:ring-[#1b7936]"
                                >
                                    <option value="any">Any Time</option>
                                    <option value="morning">Morning (9AM - 12PM)</option>
                                    <option value="afternoon">Afternoon (12PM - 5PM)</option>
                                    <option value="evening">Evening (5PM - 8PM)</option>
                                </select>
                            </div>

                            {/* Additional Details Textarea */}
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-[#071322]">
                                    {activeTab === 'survey' ? 'Additional Details' : 'Call Purpose'}
                                </label>
                                <textarea
                                    name="details"
                                    rows={4}
                                    value={formData.details}
                                    onChange={handleChange}
                                    placeholder={activeTab === 'survey' 
                                        ? 'Any specific requirements or questions about your site...'
                                        : 'What would you like to discuss during the consultation call?'
                                    }
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm text-[#071322] focus:outline-none focus:ring-2 focus:ring-[#1b7936]"
                                />
                            </div>

                            {/* Dynamic Submit Button */}
                            <div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-[#1b7936] hover:bg-[#155f2b] text-white font-bold text-sm py-4 rounded-xl shadow-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                                        activeTab === 'survey' ? 'Request Site Survey' : 'Request Consultation Call'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Right Column: What to Expect & Prefer to Talk Now (Span 5) */}
                    <div className="lg:col-span-5 space-y-6">

                        {/* What to Expect Box */}
                        <div className="bg-[#f8f9fa] border border-gray-100 rounded-3xl p-8 space-y-6">
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
                        <div className="bg-[#f8f9fa] border border-gray-100 rounded-3xl p-6 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-[#1b7936] text-white flex items-center justify-center flex-shrink-0 shadow-md">
                                <Phone className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-xs font-extrabold text-[#071322] tracking-wider uppercase mb-0.5">Prefer to talk now?</div>
                                <a href="tel:+18005550199" className="text-sm font-bold text-[#1b7936] hover:underline">
                                    Call +1 (800) 555-0199
                                </a>
                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </section>
    );
}