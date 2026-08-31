// components/Home/HeroSection.tsx
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Zap, BatteryCharging, GraduationCap, Wrench, Loader2 } from 'lucide-react';
import { heroAPI } from '@/lib/api/hero';

// Icon mapping
const iconMap: Record<string, any> = {
    'Zap': Zap,
    'BatteryCharging': BatteryCharging,
    'GraduationCap': GraduationCap,
    'Wrench': Wrench,
};

interface HeroData {
    badge: {
        text: string;
        color: string;
        bgColor: string;
    };
    headline: {
        main: string;
        highlight: string;
        highlightColor: string;
    };
    description: string;
    buttons: Array<{
        label: string;
        link: string;
        type: 'primary' | 'secondary' | 'outline';
        icon?: string;
        isActive: boolean;
    }>;
    cards: Array<{
        title: string;
        subtitle: string;
        link: string;
        icon: string;
        iconBgColor: string;
        iconTextColor: string;
        isActive: boolean;
    }>;
}

export default function HeroSection() {
    const [heroData, setHeroData] = useState<HeroData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchHeroData = async () => {
            try {
                const response = await heroAPI.getActive();
                if (response.success) {
                    setHeroData(response.data);
                }
            } catch (error) {
                console.error('Error fetching hero data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchHeroData();
    }, []);

    if (isLoading) {
        return (
            <section className="bg-ev-dark-blue text-white py-20 flex flex-col justify-center min-h-[400px]">
                <div className="max-w-7xl py-20 mx-auto w-full flex items-center justify-center">
                    <Loader2 className="w-12 h-12 text-[#22c55e] animate-spin" />
                </div>
            </section>
        );
    }

    if (!heroData) {
        return null;
    }

    const getButtonStyles = (type: string) => {
        switch (type) {
            case 'primary':
                return 'bg-[#22c55e] hover:bg-[#1ea34d] text-white';
            case 'secondary':
                return 'bg-[#1e293b]/60 hover:bg-[#1e293b] border border-gray-700/60 text-white';
            case 'outline':
                return 'border border-[#22c55e] hover:bg-[#22c55e]/10 text-[#22c55e]';
            default:
                return 'bg-[#22c55e] hover:bg-[#1ea34d] text-white';
        }
    };

    const activeButtons = heroData.buttons?.filter(b => b.isActive !== false) || [];
    const activeCards = heroData.cards?.filter(c => c.isActive !== false) || [];

    return (
        <section className="bg-ev-dark-blue text-white py-20 flex flex-col justify-center">
            <div className="max-w-7xl py-20 mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                {/* Left Content Column */}
                <div className="lg:col-span-7 space-y-8">
                    {/* Badge */}
                    <div className="inline-block">
                        <span 
                            className="text-xs font-bold tracking-wider px-4 py-1.5 rounded-full uppercase border"
                            style={{
                                color: heroData.badge?.color || '#22c55e',
                                borderColor: heroData.badge?.color || '#22c55e',
                                backgroundColor: heroData.badge?.bgColor || 'transparent'
                            }}
                        >
                            {heroData.badge?.text || 'EV Charging Infrastructure'}
                        </span>
                    </div>

                    {/* Headline */}
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1]">
                        {heroData.headline?.main || 'Supply. Install.'}<br />
                        <span style={{ color: heroData.headline?.highlightColor || '#22c55e' }}>
                            {heroData.headline?.highlight || 'Train. Support.'}
                        </span>
                    </h1>

                    {/* Description */}
                    <p className="text-gray-300 text-base sm:text-lg leading-relaxed max-w-2xl font-normal">
                        {heroData.description}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-4 pt-2">
                        {activeButtons.map((button, index) => (
                            <Link
                                key={index}
                                href={button.link}
                                className={`font-semibold px-6 py-3.5 rounded-md transition-colors duration-200 text-sm md:text-base ${getButtonStyles(button.type)}`}
                            >
                                {button.label}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Right Cards Container */}
                <div className="lg:col-span-5 bg-[#131d2e]/80 border border-gray-800/80 rounded-xl p-4 sm:p-5 space-y-3.5 shadow-xl">
                    {activeCards.map((card, index) => {
                        const IconComponent = iconMap[card.icon] || Zap;
                        return (
                            <Link
                                key={index}
                                href={card.link}
                                className="flex items-center gap-4 bg-[#1e293b]/70 hover:bg-[#1e293b] p-4 rounded-lg transition-colors border border-transparent hover:border-gray-700/50 group"
                            >
                                <div 
                                    className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                                    style={{
                                        backgroundColor: card.iconBgColor || '#22c55e'
                                    }}
                                >
                                    <IconComponent 
                                        className="w-6 h-6"
                                        style={{
                                            color: card.iconTextColor || '#ffffff',
                                            fill: card.icon === 'Zap' ? 'currentColor' : 'none'
                                        }}
                                    />
                                </div>
                                <div>
                                    <div className="text-gray-400 text-xs font-medium mb-1">{card.subtitle}</div>
                                    <div className="text-white font-bold text-base sm:text-lg">{card.title}</div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}