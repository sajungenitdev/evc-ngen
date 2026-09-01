/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            // ✅ ImgBB - for product images
            {
                protocol: 'https',
                hostname: 'i.ibb.co',
                port: '',
                pathname: '/**',
                search: '',
            },
            // ✅ ImgBB alternative domain
            {
                protocol: 'https',
                hostname: 'ibb.co',
                port: '',
                pathname: '/**',
                search: '',
            },
            // ✅ Your Render.com backend
            {
                protocol: 'https',
                hostname: 'evc-ngen-server.onrender.com',
                port: '',
                pathname: '/**',
                search: '',
            },
            // ✅ Your Vercel deployment
            {
                protocol: 'https',
                hostname: 'evc-ngen-pi.vercel.app',
                port: '',
                pathname: '/**',
                search: '',
            },
            // ✅ DeepSeek
            {
                protocol: 'https',
                hostname: 'chat.deepseek.com',
                port: '',
                pathname: '/**',
                search: '',
            },
            // ✅ Local development
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '5000',
                pathname: '/**',
                search: '',
            },
            // ✅ Fallback for any Vercel deployment
            {
                protocol: 'https',
                hostname: '**.vercel.app',
                port: '',
                pathname: '/**',
                search: '',
            },
            // ✅ Fallback for any Render deployment
            {
                protocol: 'https',
                hostname: '**.onrender.com',
                port: '',
                pathname: '/**',
                search: '',
            },
            // ✅ Additional common image hosts (optional)
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
                port: '',
                pathname: '/**',
                search: '',
            },
            {
                protocol: 'https',
                hostname: 'via.placeholder.com',
                port: '',
                pathname: '/**',
                search: '',
            },
        ],
        // ✅ Image optimization settings (optional but recommended)
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        formats: ['image/webp'],
        minimumCacheTTL: 60,
    },

    // ✅ Enable React strict mode
    reactStrictMode: true,

    // ✅ Compress images (if using Webpack)
    swcMinify: true,

    // ✅ Environment variables (optional - for build time)
    env: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
        NEXT_PUBLIC_IS_RENDER: process.env.NEXT_PUBLIC_IS_RENDER,
    },

    // ✅ Experimental features (optional)
    experimental: {
        optimizePackageImports: ['lucide-react'],
        webpackBuildWorker: true,
    },

    // ✅ Headers for security and performance
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY',
                    },
                    {
                        key: 'X-XSS-Protection',
                        value: '1; mode=block',
                    },
                ],
            },
            {
                source: '/_next/image',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
        ];
    },
};

module.exports = nextConfig;