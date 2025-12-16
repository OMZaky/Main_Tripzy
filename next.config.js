/** @type {import('next').NextConfig} */
const nextConfig = {
    // Allow external images from Unsplash
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
        ],
    },

    // Add headers to fix Firebase Auth popup issue
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'Cross-Origin-Opener-Policy',
                        value: 'same-origin-allow-popups',
                    },
                ],
            },
        ];
    },
};

module.exports = nextConfig;
