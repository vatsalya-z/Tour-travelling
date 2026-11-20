import { NextResponse } from "next/server";
import { getSupabaseApiClient } from "@/lib/supabase/api";
import { verifyAdminAuth } from "@/lib/supabase/auth-guard";

interface RouteParams {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * GET /api/blogs/slug/[slug]
 * Public endpoint to fetch a single published blog by its URL slug.
 * Also returns related published articles.
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { slug } = await params;

    if (!slug || typeof slug !== "string" || !slug.trim()) {
      return NextResponse.json(
        { success: false, error: "Blog slug is required" },
        { status: 400 }
      );
    }

    const { client } = getSupabaseApiClient();
    if (!client) {
      return NextResponse.json(
        { success: false, error: "Database configuration not found" },
        { status: 500 }
      );
    }

    const cleanSlug = slug.trim();

    // 1. Fetch the primary blog
    const { data: blog, error } = await client
      .from("blogs")
      .select("*")
      .eq("slug", cleanSlug)
      .maybeSingle();

    if (error) {
      if (error.code === "42P01") {
        return NextResponse.json(
          { success: false, error: "Blogs database table not initialized yet" },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    if (!blog) {
      return NextResponse.json(
        { success: false, error: `Blog with slug '${cleanSlug}' was not found.` },
        { status: 404 }
      );
    }

    // 2. Access control: Draft or Unpublished blogs can only be previewed by admins
    if (blog.status !== "PUBLISHED") {
      const auth = await verifyAdminAuth(request);
      if (!auth.isAdmin) {
        return NextResponse.json(
          { success: false, error: "This article is currently not published." },
          { status: 404 }
        );
      }
    }

    // 3. Fetch related published blogs
    let relatedBlogs: any[] = [];
    try {
      let relQuery = client
        .from("blogs")
        .select("id, title, slug, excerpt, featured_image, category, author_name, published_at")
        .eq("status", "PUBLISHED")
        .neq("id", blog.id)
        .order("published_at", { ascending: false })
        .limit(3);

      if (blog.category) {
        relQuery = relQuery.eq("category", blog.category);
      }

      const { data: relData } = await relQuery;
      relatedBlogs = relData || [];

      // If category didn't have 3, fetch latest published blogs
      if (relatedBlogs.length < 3) {
        const { data: latestData } = await client
          .from("blogs")
          .select("id, title, slug, excerpt, featured_image, category, author_name, published_at")
          .eq("status", "PUBLISHED")
          .neq("id", blog.id)
          .order("published_at", { ascending: false })
          .limit(3);

        relatedBlogs = latestData || [];
      }
    } catch {}

    return NextResponse.json({
      success: true,
      data: {
        ...blog,
        related: relatedBlogs,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

