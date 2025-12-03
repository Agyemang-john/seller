import type { NextConfig } from 'next';
import withPWA from 'next-pwa';

const nextConfig: NextConfig = {
  // Moved metadataBase to the metadata export in your layout files
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/media/**',
      },
      {
        protocol: 'https',
        hostname: 'negromart-space.sfo3.cdn.digitaloceanspaces.com',
        pathname: '/**',
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Updated for Next.js 15.5.2
  typedRoutes: true,

}

export default withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
})(nextConfig);