import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Allow images from any source (for QR codes etc.)
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
