// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // ✅ গুরুত্বপূর্ণ: Static export বন্ধ করুন
    output: 'standalone',
    
    images: {
        domains: ['localhost', 'images.unsplash.com'],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
        ],
    },
};

export default nextConfig;