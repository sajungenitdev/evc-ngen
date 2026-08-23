// app/(admin)/dashboard/page.tsx
'use client';

import React from 'react';

export default function DashboardPage() {
    const stats = [
        { label: 'Total Chargers', value: '24', icon: '⚡', color: 'bg-blue-500' },
        { label: 'Active Sessions', value: '12', icon: '🔌', color: 'bg-green-500' },
        { label: 'Total Users', value: '156', icon: '👤', color: 'bg-purple-500' },
        { label: 'Revenue Today', value: '$1,240', icon: '💰', color: 'bg-yellow-500' },
    ];

    return (
        <div>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">{stat.label}</p>
                                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                            </div>
                            <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center text-2xl`}>
                                {stat.icon}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h2>
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((_, index) => (
                        <div key={index} className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                            <div className="flex-1">
                                <p className="text-sm text-gray-700">Charger #124 started charging session</p>
                                <p className="text-xs text-gray-400">2 minutes ago</p>
                            </div>
                            <span className="text-xs text-emerald-600 font-medium">Active</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}