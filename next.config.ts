import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.mzstatic.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.ytimg.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
