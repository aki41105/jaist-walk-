import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  basePath: '/jaist-walk',
  // Allow images from any source (for QR codes etc.)
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
