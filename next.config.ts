/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            // ✅ Add your Render.com hostname
            {
                protocol: 'https',
                hostname: 'evc-ngen-server.onrender.com',
                pathname: '/**',
            },
            // ✅ Add DeepSeek
            {
                protocol: 'https',
                hostname: 'chat.deepseek.com',
                pathname: '/**',
            },
            // ✅ Add Vercel deployment
            {
                protocol: 'https',
                hostname: 'evc-ngen-pi.vercel.app',
                pathname: '/**',
            },
            // ✅ Add localhost
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '5000',
                pathname: '/**',
            },
            // ✅ Add example.com (keep if needed)
            {
                protocol: 'https',
                hostname: 'example.com',
                pathname: '/**',
            },
            // ✅ Add any other hosts you're using
            {
                protocol: 'https',
                hostname: '**.vercel.app',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: '**.onrender.com',
                pathname: '/**',
            },
        ],
    },
    // ... other config
};

module.exports = nextConfig;