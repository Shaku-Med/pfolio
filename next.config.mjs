/** @type {import('next').NextConfig} */
import dotenv from 'dotenv'
dotenv.config()
    // 
const nextConfig = {
    async headers() {
        return [{
            source: '/(.*)',
            headers: [{
                    key: 'X-Frame-Options',
                    value: 'DENY', // Reminder // or 'SAMEORIGIN'
                },
                {
                    key: 'Content-Security-Policy',
                    value: "frame-ancestors 'none'", // Reminder // or "frame-ancestors 'self'"
                },
            ],
        }, ];
    },
    // async rewrites() {
    //     return [{
    //         source: '/:path*',
    //         destination: '/[...slug]',
    //     }, ];
    // },
};

export default nextConfig