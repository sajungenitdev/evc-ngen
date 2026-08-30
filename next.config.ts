/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'chat.deepseek.com',
                pathname: '/**',
            },
            // Keep any existing patterns you already have
            {
                protocol: 'https',
                hostname: 'evc-ngen-pi.vercel.app',
                pathname: '/**',
            },
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '5000',
                pathname: '/**',
            },
             {
                protocol: 'https',
                hostname: 'example.com',
                pathname: '/**',
            },
        ],
    },
};

module.exports = nextConfig;