import type { NextConfig } from "next";

const ADMIN_URL = process.env.NEXT_PUBLIC_ADMIN_URL || "https://admin.tourtripholidays.com";

const nextConfig: NextConfig = {
  experimental: {
    cpus: 1,
    agentUpgrade: false,
  } as any,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/admin",
        destination: `${ADMIN_URL}/admin`,
        permanent: false,
      },
      {
        source: "/admin/:path*",
        destination: `${ADMIN_URL}/admin/:path*`,
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
