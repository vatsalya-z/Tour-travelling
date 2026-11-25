import type { MetadataRoute } from "next";
import { getAllPublishedTourSlugs } from "@/lib/tour-service";
import { DEFAULT_BLOGS } from "@/lib/blog-default-data";
import { getSupabaseApiClient } from "@/lib/supabase/api";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tourtripholidays.com";

  // Core Static Routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${siteUrl}/packages`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/odisha-tours`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  // Published Tour Packages Routes (Drafts are strictly excluded)
  const tourSlugs = await getAllPublishedTourSlugs();
  const tourRoutes: MetadataRoute.Sitemap = tourSlugs.map((slug) => ({
    url: `${siteUrl}/tours/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  // Published Blog Posts Routes
  let blogSlugs: string[] = DEFAULT_BLOGS.filter((b) => b.status === "PUBLISHED").map((b) => b.slug);
  try {
    const { client } = getSupabaseApiClient();
    if (client) {
      const { data } = await client.from("blogs").select("slug").eq("status", "PUBLISHED");
      if (data && data.length > 0) {
        blogSlugs = data.map((b) => b.slug);
      }
    }
  } catch (err) {
    console.warn("Could not fetch blog slugs for sitemap:", err);
  }

  const blogRoutes: MetadataRoute.Sitemap = blogSlugs.map((slug) => ({
    url: `${siteUrl}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.75,
  }));

  return [...staticRoutes, ...tourRoutes, ...blogRoutes];
}
