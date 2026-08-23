import IntroStatsSection from '@/components/About/IntroStatsSection';
import NarrativeRowsSection from '@/components/About/NarrativeRowsSection';
import PartnersSection from '@/components/About/PartnersSection';
import TimelineSection from '@/components/About/TimelineSection';
import StatsBar from '@/components/Home/StatsBar';
import PageHeader from '@/components/pagesComps/PageHeader';
import { aboutPageData } from '@/lib/db';
import React from 'react';

const Page = () => {
    const {
        header,
        headerLabel,
        title,
        introParagraph1,
        introParagraph2,
        sidebarNav,
        stats,
        whoWeAre,
        mission,
        partners,
        timeline
    } = aboutPageData;

    return (
        <main className="min-h-screen bg-white">
            {/* Branded Page Header */}
            <PageHeader
                breadcrumbs={header.breadcrumbs}
                imageUrl={header.imageUrl}
                title="Engineering electric energy freedom"
                description={header.description}
            />
            <StatsBar/>

            {/* Top Intro & Stats Grid Section */}
            <IntroStatsSection
                headerLabel={headerLabel}
                title={title}
                introParagraph1={introParagraph1}
                introParagraph2={introParagraph2}
                sidebarNav={sidebarNav}
                stats={stats}
            />

            {/* Who We Are & Our Mission Rows */}
            <NarrativeRowsSection
                whoWeAre={whoWeAre}
                mission={mission}
            />

            {/* Company Timeline (2009 - 2026) */}
            <TimelineSection timeline={timeline} />

            {/* Global Partners Logo Grid */}
            <PartnersSection partners={partners} />
        </main>
    );
};

export default Page;