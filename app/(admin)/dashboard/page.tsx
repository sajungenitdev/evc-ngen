// app/(admin)/dashboard/page.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface MetricStat {
    id: string;
    label: string;
    value: string;
    trend: string;
    comparison: string;
    icon: string;
}

const METRICS: MetricStat[] = [
    {
        id: 'chargers',
        label: 'Total Chargers',
        value: '24',
        trend: '+2 added',
        comparison: 'vs last month',
        icon: '⚡',
    },
    {
        id: 'sessions',
        label: 'Active Sessions',
        value: '12',
        trend: '+18.4%',
        comparison: 'vs peak avg',
        icon: '🔌',
    },
    {
        id: 'users',
        label: 'Total Users',
        value: '156',
        trend: '+12.5%',
        comparison: 'vs last week',
        icon: '👥',
    },
    {
        id: 'revenue',
        label: 'Revenue Today',
        value: '$1,240.50',
        trend: '+8.2%',
        comparison: 'vs yesterday',
        icon: '💰',
    },
];

const RECENT_ACTIVITIES = [
    {
        id: 'act-1',
        title: 'Fast Charge Initialized',
        station: 'Station #04 • Bay A (DC 150kW)',
        timestamp: 'Just now',
        energy: '42.8 kWh',
        status: 'active',
    },
    {
        id: 'act-2',
        title: 'Session Concluded',
        station: 'Station #12 • Bay B (AC 22kW)',
        timestamp: '4 mins ago',
        energy: '18.2 kWh',
        status: 'completed',
    },
    {
        id: 'act-3',
        title: 'Overcurrent Warning',
        station: 'Station #09 • Connector Fault',
        timestamp: '14 mins ago',
        energy: '0.0 kWh',
        status: 'warning',
    },
    {
        id: 'act-4',
        title: 'Scheduled Overnight Charge',
        station: 'Station #01 • Fleet Terminal',
        timestamp: '32 mins ago',
        energy: '74.1 kWh',
        status: 'completed',
    },
    {
        id: 'act-5',
        title: 'Fast Charge Initialized',
        station: 'Station #07 • Bay C (DC 100kW)',
        timestamp: '58 mins ago',
        energy: '31.5 kWh',
        status: 'active',
    },
];

export default function DashboardPage() {
    const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d'>('24h');

    return (
        <div className="space-y-6 container mx-auto pb-8">
            {/* Header / Range Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-[#0B192C]">
                        Overview Analytics
                    </h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Real-time telemetry across network charging nodes
                    </p>
                </div>

                <div className="flex items-center gap-1.5 p-1 bg-slate-100 border border-slate-200 rounded-xl self-start sm:self-auto">
                    {(['24h', '7d', '30d'] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => setTimeframe(t)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${timeframe === t
                                    ? 'bg-[#0B192C] text-white shadow-xs'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                                }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            {/* KPI Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                {METRICS.map((stat) => (
                    <div
                        key={stat.id}
                        className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-[#1E3E62]/40 hover:shadow-md transition-all group"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                {stat.label}
                            </span>
                            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-lg shrink-0 group-hover:scale-110 transition-transform">
                                {stat.icon}
                            </div>
                        </div>

                        <div className="mt-3">
                            <p className="text-2xl font-bold tracking-tight text-[#0B192C] font-mono">
                                {stat.value}
                            </p>
                            <div className="flex items-center gap-1.5 mt-2 text-xs">
                                <span className="font-bold text-emerald-600 flex items-center">
                                    <svg className="w-3.5 h-3.5 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                                    </svg>
                                    {stat.trend}
                                </span>
                                <span className="text-slate-400 font-medium">{stat.comparison}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* 2-Column Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Activity Feed */}
                <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                        <div>
                            <h2 className="text-base font-bold text-[#0B192C]">Live Charging Activity</h2>
                            <p className="text-xs text-slate-500 mt-0.5">Real-time session updates</p>
                        </div>
                        <Link
                            href="/sessions"
                            className="text-xs font-bold text-[#1E3E62] hover:text-[#0B192C] transition-colors flex items-center gap-1"
                        >
                            <span>View All</span>
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                            </svg>
                        </Link>
                    </div>

                    <div className="divide-y divide-slate-100">
                        {RECENT_ACTIVITIES.map((item) => (
                            <div key={item.id} className="py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/75 px-2 rounded-xl transition-colors">
                                <div className="flex items-center gap-3.5 min-w-0">
                                    <div className="relative">
                                        <div
                                            className={`w-2.5 h-2.5 rounded-full ${item.status === 'active'
                                                    ? 'bg-emerald-500 ring-4 ring-emerald-500/20 animate-pulse'
                                                    : item.status === 'warning'
                                                        ? 'bg-amber-500 ring-4 ring-amber-500/20'
                                                        : 'bg-slate-300'
                                                }`}
                                        />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-slate-800 truncate">{item.title}</p>
                                        <p className="text-[11px] text-slate-500 truncate mt-0.5 font-mono">{item.station}</p>
                                    </div>
                                </div>

                                <div className="text-right shrink-0">
                                    <span className="text-xs font-bold text-slate-800 font-mono block">{item.energy}</span>
                                    <span className="text-[10px] text-slate-400 font-medium">{item.timestamp}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Grid & Node Health */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
                    <div>
                        <div className="pb-4 border-b border-slate-100 mb-5">
                            <h2 className="text-base font-bold text-[#0B192C]">Grid & Node Health</h2>
                            <p className="text-xs text-slate-500 mt-0.5">Terminal load distribution</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-xs font-semibold mb-1.5">
                                    <span className="text-slate-600">Total Grid Draw</span>
                                    <span className="text-[#0B192C] font-mono font-bold">380 kW / 500 kW</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                    <div className="bg-[#1E3E62] h-2 rounded-full" style={{ width: '76%' }} />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-xs font-semibold mb-1.5">
                                    <span className="text-slate-600">Terminal Availability</span>
                                    <span className="text-[#0B192C] font-mono font-bold">87.5%</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '87.5%' }} />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-xs font-semibold mb-1.5">
                                    <span className="text-slate-600">Fault Tolerance</span>
                                    <span className="text-[#0B192C] font-mono font-bold">99.9%</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                    <div className="bg-cyan-500 h-2 rounded-full" style={{ width: '99.9%' }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 pt-5 border-t border-slate-100">
                        <Link
                            href="/reports/analytics"
                            className="w-full py-2.5 px-4 bg-[#0B192C] hover:bg-[#1E3E62] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
                        >
                            <span>Open Diagnostic Report</span>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}