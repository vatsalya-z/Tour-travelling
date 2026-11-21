import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tourtripholidays.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/my-enquiries"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
