import type { NextConfig } from 'next';

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
];

const config: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  poweredByHeader: false,
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  compress: true,
  images: { formats: ['image/avif', 'image/webp'] },

  async redirects() {
    return [
      // Old query-string track URLs keep working: /track?track=3 -> /track/3
      { source: '/track', has: [{ type: 'query', key: 'track', value: '(?<id>[0-9]+)' }], destination: '/track/:id', permanent: true },
      { source: '/track', destination: '/track/1', permanent: false },
      // Old static-site URLs
      { source: '/index.html', destination: '/', permanent: true },
      { source: '/:page(abstract|committee|registration).html', destination: '/:page', permanent: true },
      { source: '/track.html', destination: '/track', permanent: true },
    ];
  },

  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      { source: '/assets/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=3600, stale-while-revalidate=86400' }] },
    ];
  },
};

export default config;
