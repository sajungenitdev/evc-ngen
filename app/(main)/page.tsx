// app/(main)/page.tsx
'use client';

import ChargingNeedsSection from "@/components/Home/ChargingNeedsSection";
import EndToEndSetupSection from "@/components/Home/EndToEndSetupSection";
import FoundationSection from "@/components/Home/FoundationSection";
import GoAnywhereSection from "@/components/Home/GoAnywhereSection";
import HelpSupportSection from "@/components/Home/HelpSupportSection";
import HeroSection from "@/components/Home/HeroSection";
import ShopSection from "@/components/Home/ShopSection";
import SolutionsSection from "@/components/Home/SolutionsSection";
import StatsBar from "@/components/Home/StatsBar";
import StoriesSection from "@/components/Home/StoriesSection";


export default function HomePage() {
    return (
        <div className="font-sans bg-white text-[#14304f]">
            <HeroSection />
            <StatsBar />
            <FoundationSection/>
            <SolutionsSection/>
            <StoriesSection/>
            <HelpSupportSection/>
            <ShopSection/>
            <ChargingNeedsSection/>
            <EndToEndSetupSection/>
            <GoAnywhereSection/>
        </div>
    );
}