// app/(main)/about/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { aboutAPI, getAboutImageUrl, filterActive, AboutData } from '@/lib/api/about';
import PageHeader from '@/components/pagesComps/PageHeader';
import StatsBar from '@/components/Home/StatsBar';
import IntroStatsSection from '@/components/About/IntroStatsSection';
import NarrativeRowsSection from '@/components/About/NarrativeRowsSection';
import PartnersSection from '@/components/About/PartnersSection';
import TimelineSection from '@/components/About/TimelineSection';

export default function AboutPage() {
    const [aboutData, setAboutData] = useState<AboutData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAboutData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const response = await aboutAPI.getActive();

                if (response.success && response.data) {
                    setAboutData(response.data);
                } else {
                    setError('Failed to load about page data');
                }
            } catch (error) {
                console.error('Error fetching about data:', error);
                setError('An error occurred while loading the page');
            } finally {
                setIsLoading(false);
            }
        };

        fetchAboutData();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-[#1b7936] animate-spin mx-auto" />
                    <p className="text-gray-500 text-sm mt-4">Loading about page...</p>
                </div>
            </div>
        );
    }

    if (error || !aboutData) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-[#071322] mb-2">Something went wrong</h2>
                    <p className="text-gray-500 text-sm">{error || 'Unable to load about page data'}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-6 bg-[#1b7936] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#155f2b] transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-white">
            <PageHeader
                breadcrumbs={aboutData.header?.breadcrumbs || []}
                imageUrl={getAboutImageUrl(aboutData.header?.imageUrl || '')}
                title={aboutData.header?.title || 'About EVNGEN'}
                description={aboutData.header?.description || ''}
            />

            <StatsBar />

            <IntroStatsSection
                headerLabel={aboutData.headerLabel || 'ABOUT'}
                title={aboutData.title || 'Engineering electric energy freedom'}
                introParagraph1={aboutData.introParagraph1 || ''}
                introParagraph2={aboutData.introParagraph2 || ''}
                sidebarNav={aboutData.sidebarNav || []}
                stats={filterActive(aboutData.stats || [])}
            />

            <NarrativeRowsSection
                whoWeAre={aboutData.whoWeAre}
                mission={aboutData.mission}
            />

            <TimelineSection timeline={filterActive(aboutData.timeline || [])} />

            <PartnersSection partners={filterActive(aboutData.partners || [])} />
        </main>
    );
}