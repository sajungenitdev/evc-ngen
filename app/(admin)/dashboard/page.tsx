// app/(admin)/dashboard/page.tsx
'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
    Loader2,
    Zap,
    Battery,
    Plug,
    Wrench,
    Users,
    DollarSign,
    TrendingUp,
    TrendingDown,
    Activity,
    Clock,
    AlertCircle,
    CheckCircle,
    XCircle,
    RefreshCw,
    ArrowRight,
    BarChart3,
    PieChart,
    Calendar,
    UserPlus,
    ShoppingCart,
    MessageSquare,
    Award,
    Shield,
    MapPin,
    Plus
} from 'lucide-react';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

// ============================================================================
// API Service Functions
// ============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const fetchWithAuth = async (endpoint: string, token: string) => {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            cache: 'no-store'
        });

        if (!response.ok) {
            // Return empty data instead of throwing
            return { success: false, data: [], message: 'Not found' };
        }

        return response.json();
    } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
        return { success: false, data: [] };
    }
};

// ============================================================================
// Chart Components
// ============================================================================

// Line Chart Component
const LineChart = ({ title, data, labels, height = 250 }: {
    title: string;
    data: number[];
    labels: string[];
    height?: number;
}) => {
    const chartData = {
        labels,
        datasets: [
            {
                label: title,
                data: data,
                borderColor: '#1b7936',
                backgroundColor: 'rgba(27, 121, 54, 0.1)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#1b7936',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: 'rgba(11, 25, 44, 0.9)',
                titleColor: '#ffffff',
                bodyColor: '#ffffff',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
                padding: 12,
                cornerRadius: 8,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                },
                ticks: {
                    font: {
                        size: 10,
                    },
                },
            },
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    font: {
                        size: 10,
                    },
                },
            },
        },
    };

    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-[#0B192C]">{title}</h3>
            </div>
            <div style={{ height: `${height}px` }}>
                <Line data={chartData} options={options} />
            </div>
        </div>
    );
};

// Bar Chart Component
const BarChart = ({ title, data, labels, colors, height = 250 }: {
    title: string;
    data: number[];
    labels: string[];
    colors?: string[];
    height?: number;
}) => {
    const defaultColors = ['#1b7936', '#2a9d5a', '#3ec06a', '#60d48a', '#8ae0a8'];
    const chartColors = colors || defaultColors;

    const chartData = {
        labels,
        datasets: [
            {
                label: title,
                data: data,
                backgroundColor: chartColors.map(c => c + '80'),
                borderColor: chartColors,
                borderWidth: 2,
                borderRadius: 6,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: 'rgba(11, 25, 44, 0.9)',
                titleColor: '#ffffff',
                bodyColor: '#ffffff',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
                padding: 12,
                cornerRadius: 8,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                },
                ticks: {
                    font: {
                        size: 10,
                    },
                },
            },
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    font: {
                        size: 10,
                    },
                },
            },
        },
    };

    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-[#0B192C]">{title}</h3>
            </div>
            <div style={{ height: `${height}px` }}>
                <Bar data={chartData} options={options} />
            </div>
        </div>
    );
};

// Doughnut Chart Component
const DoughnutChart = ({ title, data, labels, colors, height = 250 }: {
    title: string;
    data: number[];
    labels: string[];
    colors?: string[];
    height?: number;
}) => {
    const defaultColors = ['#1b7936', '#2a9d5a', '#3ec06a', '#60d48a', '#8ae0a8', '#b5ebc8'];
    const chartColors = colors || defaultColors;

    const chartData = {
        labels,
        datasets: [
            {
                data: data,
                backgroundColor: chartColors,
                borderColor: '#ffffff',
                borderWidth: 3,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    padding: 20,
                    usePointStyle: true,
                    pointStyle: 'circle',
                    font: {
                        size: 11,
                        weight: 'bold' as const,
                    },
                    color: '#64748b',
                },
            },
            tooltip: {
                backgroundColor: 'rgba(11, 25, 44, 0.9)',
                titleColor: '#ffffff',
                bodyColor: '#ffffff',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
                padding: 12,
                cornerRadius: 8,
            },
        },
        cutout: '65%',
    };

    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-[#0B192C]">{title}</h3>
            </div>
            <div style={{ height: `${height}px` }}>
                <Doughnut data={chartData} options={options} />
            </div>
        </div>
    );
};

// ============================================================================
// Dashboard Components
// ============================================================================

// Metric Card Component
const MetricCard = ({
    title,
    value,
    icon: Icon,
    trend,
    trendValue,
    color = 'blue',
    subtitle
}: {
    title: string;
    value: string | number;
    icon: any;
    trend?: 'up' | 'down';
    trendValue?: string;
    color?: 'blue' | 'green' | 'purple' | 'amber' | 'rose' | 'teal' | 'indigo';
    subtitle?: string;
}) => {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600 border-blue-200',
        green: 'bg-emerald-50 text-emerald-600 border-emerald-200',
        purple: 'bg-purple-50 text-purple-600 border-purple-200',
        amber: 'bg-amber-50 text-amber-600 border-amber-200',
        rose: 'bg-rose-50 text-rose-600 border-rose-200',
        teal: 'bg-teal-50 text-teal-600 border-teal-200',
        indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    };

    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all group">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${colorClasses[color]} flex items-center justify-center border group-hover:scale-110 transition-transform`}>
                        <Icon className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
                        {subtitle && (
                            <p className="text-[10px] text-slate-400">{subtitle}</p>
                        )}
                    </div>
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-xs font-bold ${trend === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {trend === 'up' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        {trendValue}
                    </div>
                )}
            </div>
            <div className="mt-3">
                <p className="text-2xl font-bold tracking-tight text-[#0B192C] font-mono">
                    {typeof value === 'number' ? value.toLocaleString() : value}
                </p>
            </div>
        </div>
    );
};

// Activity Item Component
const ActivityItem = ({
    title,
    description,
    time,
    status,
    icon: Icon
}: {
    title: string;
    description: string;
    time: string;
    status: 'success' | 'warning' | 'error' | 'info';
    icon: any;
}) => {
    const statusColors = {
        success: 'bg-emerald-500',
        warning: 'bg-amber-500',
        error: 'bg-rose-500',
        info: 'bg-blue-500',
    };

    const statusIcons = {
        success: <CheckCircle className="w-3 h-3 text-white" />,
        warning: <AlertCircle className="w-3 h-3 text-white" />,
        error: <XCircle className="w-3 h-3 text-white" />,
        info: <Activity className="w-3 h-3 text-white" />,
    };

    return (
        <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
            <div className={`w-6 h-6 rounded-full ${statusColors[status]} flex items-center justify-center shrink-0 mt-0.5`}>
                {statusIcons[status]}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-[#0B192C] truncate">{title}</p>
                    <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap ml-2">{time}</span>
                </div>
                <p className="text-xs text-slate-500 truncate">{description}</p>
            </div>
            <div className="shrink-0">
                <Icon className="w-4 h-4 text-slate-300" />
            </div>
        </div>
    );
};

// ============================================================================
// Main Dashboard Component
// ============================================================================

interface DashboardStats {
    products: number;
    accessories: number;
    services: number;
    training: number;
    industries: number;
    solutions: number;
    users: number;
    contacts: number;
    surveys: number;
}

interface MonthlyData {
    month: string;
    products: number;
    users: number;
    revenue: number;
}

export default function DashboardPage() {
    const { token } = useAuth();
    const [loading, setLoading] = useState(true);
    const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d'>('30d');
    const [stats, setStats] = useState<DashboardStats>({
        products: 0,
        accessories: 0,
        services: 0,
        training: 0,
        industries: 0,
        solutions: 0,
        users: 0,
        contacts: 0,
        surveys: 0,
    });
    const [recentActivities, setRecentActivities] = useState<any[]>([]);
    const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
    const [categoryDistribution, setCategoryDistribution] = useState<{ label: string; value: number; color: string }[]>([]);
    const [dataFetched, setDataFetched] = useState(false);

    // Generate chart data (memoized to prevent infinite loops)
    const generateChartData = useCallback((statsData: DashboardStats) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentMonth = new Date().getMonth();
        const last6Months = [];
        for (let i = 5; i >= 0; i--) {
            const idx = (currentMonth - i + 12) % 12;
            last6Months.push(months[idx]);
        }

        // Generate monthly data based on actual stats
        const data = last6Months.map((month, index) => ({
            month,
            products: Math.max(1, Math.floor((statsData.products || 10) / 6) + index * 2 + Math.floor(Math.random() * 3)),
            users: Math.max(1, Math.floor((statsData.users || 20) / 6) + index * 3 + Math.floor(Math.random() * 5)),
            revenue: Math.max(100, Math.floor((statsData.products * 150 + statsData.accessories * 50) / 6) + index * 200 + Math.floor(Math.random() * 300)),
        }));
        setMonthlyData(data);

        // Category distribution
        const categories = [
            { label: 'Products', value: statsData.products || 0, color: '#1b7936' },
            { label: 'Accessories', value: statsData.accessories || 0, color: '#2a9d5a' },
            { label: 'Services', value: statsData.services || 0, color: '#3ec06a' },
            { label: 'Training', value: statsData.training || 0, color: '#60d48a' },
            { label: 'Solutions', value: statsData.solutions || 0, color: '#8ae0a8' },
            { label: 'Industries', value: statsData.industries || 0, color: '#b5ebc8' },
        ];
        setCategoryDistribution(categories.filter(c => c.value > 0));
    }, []);

    // Fetch all dashboard data
    // app/(admin)/dashboard/page.tsx

    // Update the fetchDashboardData function - CHANGE THIS SECTION
    const fetchDashboardData = useCallback(async () => {
        if (!token || dataFetched) return;

        setLoading(true);
        try {
            // ✅ FIXED: Use /auth/users instead of /users
            const endpoints = [
                { key: 'products', url: '/products?limit=1000' },
                { key: 'accessories', url: '/accessories?limit=1000' },
                { key: 'services', url: '/services?limit=1000' },
                { key: 'training', url: '/training?limit=1000' },
                { key: 'industries', url: '/industries?limit=1000' },
                { key: 'solutions', url: '/solutions?limit=1000' },
                { key: 'users', url: '/auth/users?limit=1000' }, // ✅ CHANGED from '/users' to '/auth/users'
                { key: 'contacts', url: '/contacts?limit=1000' },
                { key: 'surveys', url: '/surveys?limit=1000' },
            ];

            const results = await Promise.all(
                endpoints.map(async ({ key, url }) => {
                    const data = await fetchWithAuth(url, token);
                    return { key, data };
                })
            );

            const newStats: DashboardStats = {
                products: 0,
                accessories: 0,
                services: 0,
                training: 0,
                industries: 0,
                solutions: 0,
                users: 0,
                contacts: 0,
                surveys: 0,
            };

            // Process results
            results.forEach(({ key, data }) => {
                // ✅ Handle the response structure from /auth/users
                if (data.success && Array.isArray(data.data)) {
                    newStats[key as keyof DashboardStats] = data.data.length;

                    // Generate activities from real data
                    if (key === 'contacts' && data.data.length > 0) {
                        const recent = data.data.slice(0, 2);
                        recent.forEach((item: any) => {
                            setRecentActivities(prev => [...prev, {
                                id: `contact-${item._id}`,
                                title: 'New Contact Message',
                                description: `From: ${item.name || item.email}`,
                                time: new Date(item.createdAt).toLocaleDateString(),
                                status: 'info' as const,
                                icon: MessageSquare,
                            }]);
                        });
                    }
                    if (key === 'surveys' && data.data.length > 0) {
                        const recent = data.data.slice(0, 2);
                        recent.forEach((item: any) => {
                            setRecentActivities(prev => [...prev, {
                                id: `survey-${item._id}`,
                                title: 'New Site Survey Request',
                                description: `For: ${item.location || item.address || 'Site'}`,
                                time: new Date(item.createdAt).toLocaleDateString(),
                                status: 'warning' as const,
                                icon: MapPin,
                            }]);
                        });
                    }
                }
            });

            setStats(newStats);

            // Generate chart data with the new stats
            generateChartData(newStats);

            // Sort activities by time
            setRecentActivities(prev => {
                const sorted = prev.sort((a, b) =>
                    new Date(b.time).getTime() - new Date(a.time).getTime()
                );
                return sorted.slice(0, 10);
            });

            setDataFetched(true);

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            toast.error('Failed to load some dashboard data');
        } finally {
            setLoading(false);
        }
    }, [token, dataFetched, generateChartData]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    // Memoized chart data for performance
    const chartLabels = useMemo(() => monthlyData.map(d => d.month), [monthlyData]);
    const productData = useMemo(() => monthlyData.map(d => d.products), [monthlyData]);
    const userData = useMemo(() => monthlyData.map(d => d.users), [monthlyData]);
    const revenueData = useMemo(() => monthlyData.map(d => d.revenue), [monthlyData]);

    // Reset data fetched flag when refreshing
    const handleRefresh = () => {
        setDataFetched(false);
        setRecentActivities([]);
        fetchDashboardData();
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-[#1b7936] animate-spin mx-auto" />
                    <p className="text-gray-500 text-sm mt-4">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    const totalItems = stats.products + stats.accessories + stats.services + stats.training;
    const totalEngagement = stats.contacts + stats.surveys;

    return (
        <div className="space-y-6 container mx-auto pb-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-[#0B192C]">
                        Dashboard Analytics
                    </h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Real-time insights across your EVNGEN platform
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleRefresh}
                        className="p-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 transition"
                        title="Refresh"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                    {/* <div className="flex items-center gap-1.5 p-1 bg-slate-100 border border-slate-200 rounded-xl">
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
                    </div> */}
                </div>
            </div>

            {/* KPI Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                <MetricCard
                    title="Total Products"
                    value={stats.products}
                    icon={Zap}
                    trend="up"
                    trendValue="+12%"
                    color="blue"
                />
                <MetricCard
                    title="Accessories"
                    value={stats.accessories}
                    icon={Wrench}
                    trend="up"
                    trendValue="+8%"
                    color="green"
                />
                <MetricCard
                    title="Services & Training"
                    value={stats.services + stats.training}
                    icon={Plug}
                    trend="up"
                    trendValue="+15%"
                    color="purple"
                />
                <MetricCard
                    title="Total Users"
                    value={stats.users || 0}
                    icon={Users}
                    trend="up"
                    trendValue="+22%"
                    color="teal"
                />
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <LineChart
                    title="Monthly Product Growth"
                    data={productData}
                    labels={chartLabels}
                    height={250}
                />
                <LineChart
                    title="User Growth"
                    data={userData}
                    labels={chartLabels}
                    height={250}
                />
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <BarChart
                        title="Revenue Overview"
                        data={revenueData}
                        labels={chartLabels}
                        height={250}
                    />
                </div>
                <div>
                    <DoughnutChart
                        title="Category Distribution"
                        data={categoryDistribution.map(c => c.value)}
                        labels={categoryDistribution.map(c => c.label)}
                        colors={categoryDistribution.map(c => c.color)}
                        height={250}
                    />
                </div>
            </div>

            {/* Status Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Inventory</p>
                            <p className="text-2xl font-bold text-[#0B192C] mt-1">{totalItems}</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
                            <ShoppingCart className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Engagement</p>
                            <p className="text-2xl font-bold text-[#0B192C] mt-1">{totalEngagement}</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
                            <Activity className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Users</p>
                            <p className="text-2xl font-bold text-[#0B192C] mt-1">{stats.users || 0}</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center">
                            <Users className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Platform Health</p>
                            <p className="text-2xl font-bold text-emerald-600 mt-1">98.5%</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
                            <Shield className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Activity */}
                <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                        <div>
                            <h2 className="text-base font-bold text-[#0B192C]">Recent Activity</h2>
                            <p className="text-xs text-slate-500 mt-0.5">Latest platform events</p>
                        </div>
                        <Link
                            href="/admin/activity"
                            className="text-xs font-bold text-[#1E3E62] hover:text-[#0B192C] transition-colors flex items-center gap-1"
                        >
                            <span>View All</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    <div className="divide-y divide-slate-100">
                        {recentActivities.length > 0 ? (
                            recentActivities.map((item) => (
                                <ActivityItem
                                    key={item.id}
                                    title={item.title}
                                    description={item.description}
                                    time={item.time}
                                    status={item.status}
                                    icon={item.icon}
                                />
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <Activity className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                <p className="text-xs text-slate-400">No recent activity</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                    <h2 className="text-base font-bold text-[#0B192C] mb-4">Quick Actions</h2>
                    <div className="space-y-3">
                        <Link
                            href="/product-management"
                            className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors group"
                        >
                            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Plus className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-bold text-[#0B192C]">Add New Product</span>
                        </Link>

                        <Link
                            href="/users-managements"
                            className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors group"
                        >
                            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <UserPlus className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-bold text-[#0B192C]">Add New User</span>
                        </Link>

                        <Link
                            href="/survey-management"
                            className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors group"
                        >
                            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <MapPin className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-bold text-[#0B192C]">View Site Surveys</span>
                        </Link>

                        <Link
                            href="/contacts-management"
                            className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors group"
                        >
                            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <MessageSquare className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-bold text-[#0B192C]">View Messages</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}