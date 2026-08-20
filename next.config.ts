import type { NextConfig } from 'next';

const staticExport = process.env.STATIC_EXPORT === '1';

const nextConfig: NextConfig = {
  output: staticExport ? 'export' : 'standalone',
  trailingSlash: true,
  ...(staticExport
    ? {}
    : {
        async rewrites() {
          return [
            { source: '/api/chat/stream/', destination: '/api/chat/stream' },
          ];
        },
      }),
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'imagekit.io' },
      { protocol: 'https', hostname: 'i.pinimg.com' },
      { protocol: 'https', hostname: 'cdn.dribbble.com' },
      { protocol: 'https', hostname: 'i.postimg.cc' },
      { protocol: 'https', hostname: 'images-na.ssl-images-amazon.com' },
    ],
  },
};

export default nextConfig;
