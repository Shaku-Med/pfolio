/** @type {import('next').NextConfig} */
import dotenv from 'dotenv'
dotenv.config()

const nextConfig = {
    async headers() {
        return [{
            source: '/(.*)',
            headers: [{
                    key: 'X-Frame-Options',
                    value: 'DENY',
                },
                {
                    key: 'Content-Security-Policy',
                    value: "frame-ancestors 'none'",
                },
            ],
        }];
    },
    // Add these to help with module resolution
    experimental: {
        esmExternals: true,
    },
    webpack: (config, { isServer }) => {
        // Ensure consistent module resolution
        config.resolve.symlinks = false;
        return config;
    },
};

export default nextConfig