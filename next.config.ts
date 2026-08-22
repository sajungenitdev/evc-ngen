// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // ✅ ডায়নামিক রেন্ডারিং চালু করুন (static export বন্ধ)
    output: 'standalone',
    
    // ✅ ইমেজ ডোমেইন কনফিগারেশন
    images: {
        domains: ['localhost', 'images.unsplash.com'],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
            {
                protocol: 'https',
                hostname: 'via.placeholder.com',
            },
        ],
    },

    // ✅ যদি আরও কনফিগারেশন প্রয়োজন হয়
    // experimental: {
    //     // কোন experimental feature চালু করতে চাইলে
    // },
};

export default nextConfig;