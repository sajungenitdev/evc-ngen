// app/(auth)/login/page.tsx
'use client';

import React, { useState, useEffect, memo, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

// --- Charging Visual Component ---
const ChargingVisual = memo(function ChargingVisual() {
    const [batteryLevel, setBatteryLevel] = useState(68);
    const [powerOutput, setPowerOutput] = useState(148.4);

    useEffect(() => {
        const interval = setInterval(() => {
            setBatteryLevel((prev) => (prev >= 100 ? 15 : prev + 1));
            setPowerOutput((prev) => +(145 + Math.random() * 8).toFixed(1));
        }, 120);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="hidden md:flex w-1/2 flex-col justify-between p-10 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-emerald-950/40 relative overflow-hidden border-l border-white/5">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between text-xs font-mono tracking-wider text-emerald-400/80 z-10">
                <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 backdrop-blur-md">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>GRID SYNCED // DC ULTRA FAST</span>
                </div>
                <span className="text-slate-400">BAY #04-B</span>
            </div>

            <div className="my-auto relative flex flex-col items-center justify-center py-6">
                <svg
                    className="w-full max-w-sm h-48 drop-shadow-[0_0_25px_rgba(16,185,129,0.25)]"
                    viewBox="0 0 400 180"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M 50 130 C 70 130, 85 105, 110 105 L 260 105 C 290 105, 310 130, 350 130"
                        stroke="rgba(255,255,255,0.15)"
                        strokeWidth="2"
                        strokeDasharray="4 4"
                    />
                    <path
                        d="M 60 130 L 95 95 L 150 65 L 250 65 L 305 95 L 345 130 Z"
                        stroke="rgba(52, 211, 153, 0.4)"
                        strokeWidth="1.5"
                        fill="url(#carGradient)"
                    />
                    <path
                        d="M 152 70 L 245 70 L 285 95 L 115 95 Z"
                        fill="rgba(16, 185, 129, 0.08)"
                        stroke="rgba(52, 211, 153, 0.3)"
                        strokeWidth="1"
                    />
                    <circle cx="110" cy="130" r="20" stroke="#34d399" strokeWidth="2" fill="#0b1329" />
                    <circle cx="110" cy="130" r="8" fill="#34d399" className="animate-pulse" />
                    <circle cx="290" cy="130" r="20" stroke="#34d399" strokeWidth="2" fill="#0b1329" />
                    <circle cx="290" cy="130" r="8" fill="#34d399" className="animate-pulse" />
                    <path
                        d="M 380 160 L 320 160 C 300 160, 305 130, 290 130"
                        stroke="rgba(52, 211, 153, 0.2)"
                        strokeWidth="4"
                        fill="none"
                    />
                    <path
                        d="M 380 160 L 320 160 C 300 160, 305 130, 290 130"
                        stroke="#10b981"
                        strokeWidth="4"
                        fill="none"
                        className="animate-laser"
                    />
                    <defs>
                        <linearGradient id="carGradient" x1="60" y1="65" x2="345" y2="130" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#10b981" stopOpacity="0.2" />
                            <stop stopColor="#064e3b" stopOpacity="0.05" />
                        </linearGradient>
                    </defs>
                </svg>

                <div className="grid grid-cols-2 gap-3 w-full max-w-xs mt-2">
                    <div className="bg-slate-950/40 border border-white/5 p-2.5 rounded-xl backdrop-blur-sm text-center">
                        <div className="text-[11px] uppercase tracking-wider text-slate-400">Power Delivery</div>
                        <div className="text-base font-semibold text-white font-mono">{powerOutput} <span className="text-xs text-emerald-400">kW</span></div>
                    </div>
                    <div className="bg-slate-950/40 border border-white/5 p-2.5 rounded-xl backdrop-blur-sm text-center">
                        <div className="text-[11px] uppercase tracking-wider text-slate-400">Voltage</div>
                        <div className="text-base font-semibold text-white font-mono">792 <span className="text-xs text-emerald-400">V</span></div>
                    </div>
                </div>
            </div>

            <div className="space-y-2 z-10 bg-slate-950/50 p-4 rounded-2xl border border-white/5 backdrop-blur-md">
                <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Battery State of Charge
                    </span>
                    <span className="text-emerald-400 font-mono font-bold text-sm">{batteryLevel}%</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden p-[1px] border border-white/10">
                    <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-300 rounded-full relative transition-all duration-150"
                        style={{ width: `${batteryLevel}%` }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
                    </div>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>Target: 80% (Optimized)</span>
                    <span>~12 mins remaining</span>
                </div>
            </div>
        </div>
    );
});

// --- Main Login Page ---
export default function LoginPage() {
    const router = useRouter();
    const { login, isLoading: authLoading, isAuthenticated, user } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);
    const hasRedirected = useRef(false);

    // Check if already authenticated on mount
    useEffect(() => {
        // Simple check - if token exists in localStorage, redirect
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (token && userData && !hasRedirected.current) {
            console.log('✅ Token found, redirecting to dashboard...');
            hasRedirected.current = true;
            setIsRedirecting(true);
            router.replace('/dashboard');
        }
    }, [router]);

    // Redirect if auth state says authenticated
    useEffect(() => {
        if (isAuthenticated && user && !hasRedirected.current) {
            console.log('✅ Auth state says authenticated, redirecting...');
            hasRedirected.current = true;
            setIsRedirecting(true);
            router.replace('/dashboard');
        }
    }, [isAuthenticated, user, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            console.log('🔐 Attempting login for:', email);

            const result = await login({ email, password });
            console.log('📦 Login result:', result);

            if (result.success) {
                console.log('✅ Login successful! Redirecting to dashboard...');
                hasRedirected.current = true;
                setIsRedirecting(true);
                router.replace('/dashboard');
            } else {
                console.error('❌ Login failed:', result.error);
                setError(result.error || 'Invalid email or password. Please try again.');
                setIsLoading(false);
            }
        } catch (err) {
            console.error('❌ Unexpected error:', err);
            setError('An unexpected error occurred. Please try again.');
            setIsLoading(false);
        }
    };

    // Show loading/redirecting state
    if (isRedirecting || (isAuthenticated && user)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#060b13]">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-emerald-400 font-medium">Redirecting to dashboard...</p>
                    <p className="text-slate-500 text-sm mt-2">Please wait</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#060b13] p-4 relative overflow-hidden selection:bg-emerald-500 selection:text-white">
            {/* Background Subtle Grid Pattern */}
            <div
                className="absolute inset-0 opacity-[0.12] pointer-events-none"
                style={{
                    backgroundImage: `radial-gradient(circle at 50% 50%, #10b981 1px, transparent 1px)`,
                    backgroundSize: '36px 36px'
                }}
            />

            {/* Ambient Radial Blobs */}
            <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse-glow" />
            <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse-glow" />

            {/* Main Glass Card */}
            <div className="w-full max-w-4xl bg-slate-900/40 backdrop-blur-2xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-white/10 overflow-hidden flex flex-col md:flex-row relative z-10 transition-all duration-300">

                {/* Left Side - Login Form */}
                <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-between">
                    <div>
                        {/* Brand Logo */}
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 bg-gradient-to-tr from-emerald-600 to-teal-400 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-1 ring-white/20">
                                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-white font-black text-xl tracking-tight leading-none">
                                    EV<span className="text-emerald-400 font-extrabold">NGEN</span>
                                </h1>
                                <p className="text-slate-400 text-xs font-medium tracking-wide mt-0.5">Control Terminal</p>
                            </div>
                        </div>

                        {/* Header Text */}
                        <div className="mb-8">
                            <h2 className="text-white text-2xl font-bold tracking-tight">Welcome back</h2>
                            <p className="text-slate-400 text-sm mt-1">Authenticate to manage fleet charging operations</p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2">
                                <span>⚠️</span>
                                {error}
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Email Field */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                                    Work Email
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                        </svg>
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="admin@evngen.com"
                                        required
                                        className="w-full pl-10 pr-4 py-3 bg-slate-950/40 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••••••"
                                        required
                                        className="w-full pl-10 pr-11 py-3 bg-slate-950/40 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? (
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                            </svg>
                                        ) : (
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Extras */}
                            <div className="flex items-center justify-between text-xs pt-1">
                                <label className="flex items-center gap-2 text-slate-400 hover:text-slate-300 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="w-4 h-4 rounded bg-slate-950/40 border-white/10 text-emerald-500 focus:ring-0 focus:ring-offset-0 accent-emerald-500"
                                    />
                                    <span>Remember me</span>
                                </label>
                                <Link
                                    href="/forgot-password"
                                    className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                                >
                                    Forgot password?
                                </Link>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading || authLoading}
                                className="w-full mt-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold py-3.5 rounded-xl transition-all duration-200 relative overflow-hidden shadow-lg shadow-emerald-500/20 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    {isLoading ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4 text-slate-950" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            <span>Authenticating...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Sign In to Terminal</span>
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                            </svg>
                                        </>
                                    )}
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            </button>
                        </form>

                        <p className="text-center text-slate-400 text-xs mt-6">
                            Need access?{' '}
                            <Link href="/register" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
                                Request admin credentials
                            </Link>
                        </p>
                    </div>

                    {/* Infrastructure Footer Status */}
                    <div className="pt-8 mt-6 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            <span>Nodes operational</span>
                        </div>
                        <span>TLS 1.3 Encrypted</span>
                    </div>
                </div>

                {/* Right Side - Visuals */}
                <ChargingVisual />
            </div>
        </div>
    );
}