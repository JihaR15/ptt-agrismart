import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  images: {
    domains: ['lh3.googleusercontent.com', 'i.pinimg.com'], // Daftarkan domain Google dan Pinterest (fallback)
  },
};

export default nextConfig;
