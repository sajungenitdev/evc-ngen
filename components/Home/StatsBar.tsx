// components/Home/StatsBar.tsx
'use client';

import { useState, useEffect } from 'react';
import { statsAPI, StatsData, StatItem } from '@/lib/api/stats';
import Counter from './Counter';
import { Loader2 } from 'lucide-react';

// Default stats data (fallback)
const DEFAULT_STATS: StatsData = {
    _id: '',
    items: [
        {
            end: 200000,
            suffix: '+',
            label: 'Products',
            duration: 2500,
            prefix: '',
            isActive: true
        },
        {
            end: 5000,
            suffix: '+',
            label: 'Accessories',
            duration: 2000,
            prefix: '',
            isActive: true
        },
        {
            end: 50,
            suffix: '+',
            label: 'Services',
            duration: 1500,
            prefix: '',
            isActive: true
        },
        {
            end: 24,
            suffix: '/7',
            label: 'Training',
            duration: 1000,
            prefix: '',
            isActive: true
        }
    ],
    isActive: true,
    backgroundColor: '#0c1b2e',
    textColor: '#ffffff',
    borderColor: 'rgba(255,255,255,0.1)'
};

export default function StatsBar(): JSX.Element {
    const [statsData, setStatsData] = useState<StatsData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect((): (() => void) => {
        let isMounted = true;

        const fetchStats = async (): Promise<void> => {
            try {
                setIsLoading(true);
                setError(null);
                
                const response = await statsAPI.getActive();
                
                if (isMounted) {
                    if (response.success && response.data) {
                        setStatsData(response.data);
                    } else {
                        // Use default data if no stats exist
                        setStatsData(DEFAULT_STATS);
                    }
                }
            } catch (error) {
                if (isMounted) {
                    console.error('Error fetching stats:', error);
                    setError('Failed to load statistics');
                    // Set default data on error
                    setStatsData(DEFAULT_STATS);
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchStats();

        return (): void => {
            isMounted = false;
        };
    }, []);

    // Loading state
    if (isLoading) {
        return (
            <section className="bg-[#0c1b2e] py-5 border-b border-white/10">
                <div className="max-w-7xl mx-auto w-full px-6 md:px-12 lg:px-20">
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-8 h-8 text-white/50 animate-spin" />
                    </div>
                </div>
            </section>
        );
    }

    // No data state
    if (!statsData || !statsData.items || statsData.items.length === 0) {
        return (
            <section className="bg-[#0c1b2e] py-5 border-b border-white/10">
                <div className="max-w-7xl mx-auto w-full px-6 md:px-12 lg:px-20">
                    <div className="text-center py-8">
                        <p className="text-white/50 text-sm">No statistics available</p>
                    </div>
                </div>
            </section>
        );
    }

    // Filter only active items
    const activeItems: StatItem[] = statsData.items.filter(
        (item: StatItem) => item.isActive !== false
    );

    if (activeItems.length === 0) {
        return (
            <section className="bg-[#0c1b2e] py-5 border-b border-white/10">
                <div className="max-w-7xl mx-auto w-full px-6 md:px-12 lg:px-20">
                    <div className="text-center py-8">
                        <p className="text-white/50 text-sm">No active statistics</p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section 
            className="py-5 border-b"
            style={{
                backgroundColor: statsData.backgroundColor || '#0c1b2e',
                borderColor: statsData.borderColor || 'rgba(255,255,255,0.1)',
                color: statsData.textColor || '#ffffff'
            }}
        >
            <div className="max-w-7xl mx-auto w-full px-6 md:px-12 lg:px-20">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {activeItems.map((item: StatItem, index: number) => (
                        <Counter
                            key={item._id || index}
                            end={item.end}
                            suffix={item.suffix}
                            label={item.label}
                            duration={item.duration || 2000}
                            prefix={item.prefix || ''}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}