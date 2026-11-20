import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    cpus: 1,
  },
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
  async rewrites() {
    return [
      {
        source: "/login",
        destination: "/admin/login",
      },
      {
        source: "/bookings",
        destination: "/admin/bookings",
      },
      {
        source: "/tours",
        destination: "/admin/tours",
      },
      {
        source: "/tours/:path*",
        destination: "/admin/tours/:path*",
      },
      {
        source: "/destinations",
        destination: "/admin/destinations",
      },
      {
        source: "/blogs",
        destination: "/admin/blogs",
      },
      {
        source: "/blogs/:path*",
        destination: "/admin/blogs/:path*",
      },
      {
        source: "/leads",
        destination: "/admin/leads",
      },
      {
        source: "/users",
        destination: "/admin/users",
      },
      {
        source: "/settings",
        destination: "/admin/settings",
      },
      {
        source: "/profile",
        destination: "/admin/profile",
      },
      {
        source: "/about",
        destination: "/admin/about",
      },
    ];
  },
};

export default nextConfig;
