import { NextResponse } from "next/server";
import { getSupabaseApiClient } from "@/lib/supabase/api";
import { verifyAdminAuth } from "@/lib/supabase/auth-guard";
import { slugify } from "@/lib/utils";
import { Blog } from "@/types/blog";

const DEFAULT_BLOGS: Blog[] = [
  {
    id: "b1111111-1111-4111-8111-111111111111",
    title: "Exploring the Magical Dal Lake and Snow Valleys of Kashmir",
    slug: "exploring-dal-lake-snow-valleys-kashmir",
    excerpt: "Glide on shikaras across serene Dal Lake, surrounded by floating gardens and snow-capped Himalayan peaks.",
    content: "Exploring the Magical Dal Lake and Snow Valleys of Kashmir",
    featured_image: "/images/blogs/kashmir-dal-lake.webp",
    category: "Himalayan Escapes",
    author_name: "TourTripHolidays Editorial",
    seo_title: "Exploring the Magical Dal Lake and Snow Valleys of Kashmir",
    seo_description: "Glide on shikaras across serene Dal Lake, surrounded by floating gardens and snow-capped Himalayan peaks.",
    focus_keyword: "kashmir dal lake",
    image_alt: "Shikara on Dal Lake Srinagar with snow mountains background Kashmir",
    status: "PUBLISHED",
    published_at: "2026-11-01T10:00:00.000Z",
    created_at: "2026-11-01T10:00:00.000Z",
    updated_at: "2026-11-01T10:00:00.000Z",
  },
  {
    id: "b2222222-2222-4222-8222-222222222222",
    title: "Cruising the Emerald Backwaters and Coconut Lagoons of Kerala",
    slug: "cruising-emerald-backwaters-kerala",
    excerpt: "Experience tranquil luxury on traditional houseboats drifting along palms-fringed backwaters of Alleppey.",
    content: "Cruising the Emerald Backwaters and Coconut Lagoons of Kerala",
    featured_image: "/images/blogs/kerala-backwaters.webp",
    category: "Beach & Coastal",
    author_name: "TourTripHolidays Editorial",
    seo_title: "Cruising the Emerald Backwaters and Coconut Lagoons of Kerala",
    seo_description: "Experience tranquil luxury on traditional houseboats drifting along palms-fringed backwaters of Alleppey.",
    focus_keyword: "kerala backwaters alleppey",
    image_alt: "Traditional houseboat gliding through Alleppey backwaters Kerala",
    status: "PUBLISHED",
    published_at: "2026-11-03T10:00:00.000Z",
    created_at: "2026-11-03T10:00:00.000Z",
    updated_at: "2026-11-03T10:00:00.000Z",
  },
  {
    id: "b3333333-3333-4333-8333-333333333333",
    title: "Royal Heritage: Magnificent Forts, Palaces & Desert Nights of Rajasthan",
    slug: "royal-heritage-forts-palaces-rajasthan",
    excerpt: "Step back into imperial history with grand sandstone citadels, intricate jharokhas, and desert culture.",
    content: "Royal Heritage: Magnificent Forts, Palaces & Desert Nights of Rajasthan",
    featured_image: "/images/blogs/rajasthan-royal-forts.webp",
    category: "Heritage & Culture",
    author_name: "TourTripHolidays Editorial",
    seo_title: "Royal Heritage: Magnificent Forts, Palaces & Desert Nights of Rajasthan",
    seo_description: "Step back into imperial history with grand sandstone citadels, intricate jharokhas, and desert culture.",
    focus_keyword: "rajasthan forts palaces",
    image_alt: "Grand Rajasthan fortress illuminated at golden hour sunset",
    status: "PUBLISHED",
    published_at: "2026-11-05T10:00:00.000Z",
    created_at: "2026-11-05T10:00:00.000Z",
    updated_at: "2026-11-05T10:00:00.000Z",
  },
  {
    id: "b4444444-4444-4444-8444-444444444444",
    title: "Unwinding in Himachal: Pine Forests, Mountain Passes & Serene Vistas",
    slug: "unwinding-in-himachal-pine-forests-passes",
    excerpt: "Breathe crisp mountain air among alpine pines, winding scenic roads, and tranquil Himalayan settlements.",
    content: "Unwinding in Himachal: Pine Forests, Mountain Passes & Serene Vistas",
    featured_image: "/images/blogs/himachal-snow-valleys.webp",
    category: "Himalayan Escapes",
    author_name: "TourTripHolidays Editorial",
    seo_title: "Unwinding in Himachal: Pine Forests, Mountain Passes & Serene Vistas",
    seo_description: "Breathe crisp mountain air among alpine pines, winding scenic roads, and tranquil Himalayan settlements.",
    focus_keyword: "himachal pine forests valleys",
    image_alt: "Evergreen pine forests and snow Himalayan peaks Himachal Pradesh",
    status: "PUBLISHED",
    published_at: "2026-11-07T10:00:00.000Z",
    created_at: "2026-11-07T10:00:00.000Z",
    updated_at: "2026-11-07T10:00:00.000Z",
  },
  {
    id: "b5555555-5555-4555-8555-555555555555",
    title: "Coastal Charm: Sun-Kissed Beaches, Historic Chapels & Sunsets in Goa",
    slug: "coastal-charm-beaches-sunsets-goa",
    excerpt: "Golden Arabian Sea shorelines, warm tropical breezes, Portuguese architecture, and coastal hospitality.",
    content: "Coastal Charm: Sun-Kissed Beaches, Historic Chapels & Sunsets in Goa",
    featured_image: "/images/blogs/goa-coastal-sunsets.webp",
    category: "Beach & Coastal",
    author_name: "TourTripHolidays Editorial",
    seo_title: "Coastal Charm: Sun-Kissed Beaches, Historic Chapels & Sunsets in Goa",
    seo_description: "Golden Arabian Sea shorelines, warm tropical breezes, Portuguese architecture, and coastal hospitality.",
    focus_keyword: "goa beaches sunsets",
    image_alt: "Tropical Goa coastline with palm trees and sunset glow",
    status: "PUBLISHED",
    published_at: "2026-11-09T10:00:00.000Z",
    created_at: "2026-11-09T10:00:00.000Z",
    updated_at: "2026-11-09T10:00:00.000Z",
  },
  {
    id: "b6666666-6666-4666-8666-666666666666",
    title: "Spiritual Serenity: Timeless Ghats and Sacred Evening Aarti in Varanasi",
    slug: "spiritual-serenity-timeless-ghats-varanasi",
    excerpt: "Witness centuries of living spiritual heritage along ancient riverbanks illuminated by twilight diya lamps.",
    content: "Spiritual Serenity: Timeless Ghats and Sacred Evening Aarti in Varanasi",
    featured_image: "/images/blogs/varanasi-ganges-ghats.webp",
    category: "Spiritual Journeys",
    author_name: "TourTripHolidays Editorial",
    seo_title: "Spiritual Serenity: Timeless Ghats and Sacred Evening Aarti in Varanasi",
    seo_description: "Witness centuries of living spiritual heritage along ancient riverbanks illuminated by twilight diya lamps.",
    focus_keyword: "varanasi ghats ganga aarti",
    image_alt: "Evening Ganga Aarti and floating diya lamps on Varanasi ghats",
    status: "PUBLISHED",
    published_at: "2026-11-11T10:00:00.000Z",
    created_at: "2026-11-11T10:00:00.000Z",
    updated_at: "2026-11-11T10:00:00.000Z",
  },
];

/**
 * GET /api/admin/blogs
 * Admin endpoint to list all blogs with status filter, search, and pagination.
 */
export async function GET(request: Request) {
  try {
    const auth = await verifyAdminAuth(request);
    if (!auth.isAdmin) {
      return NextResponse.json(
        { success: false, error: auth.error || "Forbidden: Administrator access required" },
        { status: auth.statusCode || 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const limitParam = parseInt(searchParams.get("limit") || "50", 10);
    const pageParam = parseInt(searchParams.get("page") || "1", 10);

    const limit = isNaN(limitParam) ? 50 : Math.min(Math.max(limitParam, 1), 100);
    const page = isNaN(pageParam) ? 1 : Math.max(pageParam, 1);
    const offset = (page - 1) * limit;

    const { client } = getSupabaseApiClient();

    if (client) {
      try {
        let query = client
          .from("blogs")
          .select("*", { count: "exact" })
          .order("created_at", { ascending: false })
          .range(offset, offset + limit - 1);

        if (status && status !== "ALL") {
          query = query.eq("status", status.toUpperCase());
        }

        if (category && category !== "ALL") {
          query = query.eq("category", category);
        }

        if (search && search.trim()) {
          const q = search.trim();
          query = query.or(`title.ilike.%${q}%,slug.ilike.%${q}%,author_name.ilike.%${q}%`);
        }

        const { data: blogs, count, error } = await query;

        if (!error && Array.isArray(blogs) && blogs.length > 0) {
          return NextResponse.json({
            success: true,
            count: count || blogs.length,
            page,
            limit,
            data: blogs,
          });
        }
      } catch (dbErr) {
        console.warn("[GET /api/admin/blogs] DB error, serving default blogs:", dbErr);
      }
    }

    // Fallback response with the 6 blogs
    let filtered = DEFAULT_BLOGS;
    if (status && status !== "ALL") {
      filtered = filtered.filter((b) => b.status === status.toUpperCase());
    }
    if (category && category !== "ALL") {
      filtered = filtered.filter((b) => b.category === category);
    }
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          (b.category || "").toLowerCase().includes(q) ||
          (b.author_name || "").toLowerCase().includes(q)
      );
    }

    return NextResponse.json({
      success: true,
      count: filtered.length,
      page,
      limit,
      data: filtered.slice(offset, offset + limit),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

/**
 * POST /api/admin/blogs
 * Admin endpoint to create a new blog article.
 */
export async function POST(request: Request) {
  try {
    const auth = await verifyAdminAuth(request);
    if (!auth.isAdmin) {
      return NextResponse.json(
        { success: false, error: auth.error || "Forbidden: Administrator access required" },
        { status: auth.statusCode || 403 }
      );
    }

    const { client } = getSupabaseApiClient();
    if (!client) {
      return NextResponse.json(
        { success: false, error: "Database configuration not found in environment" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const {
      title,
      slug: customSlug,
      excerpt,
      content,
      featured_image,
      category,
      author_name,
      seo_title,
      seo_description,
      focus_keyword,
      image_alt,
      status = "DRAFT",
    } = body || {};

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json(
        { success: false, error: "Blog title is required" },
        { status: 400 }
      );
    }

    const cleanContent = typeof content === "string" && content.trim() ? content.trim() : title.trim();

    // Generate or clean slug
    let baseSlug = customSlug && typeof customSlug === "string" && customSlug.trim()
      ? slugify(customSlug.trim())
      : slugify(title.trim());

    if (!baseSlug) {
      baseSlug = `blog-${Date.now()}`;
    }

    // Check slug uniqueness
    const { data: existingSlug } = await client
      .from("blogs")
      .select("id")
      .eq("slug", baseSlug)
      .maybeSingle();

    let finalSlug = baseSlug;
    if (existingSlug) {
      finalSlug = `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    const cleanStatus = ["DRAFT", "PUBLISHED", "UNPUBLISHED"].includes(status?.toUpperCase())
      ? status.toUpperCase()
      : "DRAFT";

    const publishedAt =
      cleanStatus === "PUBLISHED" ? new Date().toISOString() : null;

    const newBlog = {
      title: title.trim(),
      slug: finalSlug,
      excerpt: excerpt?.trim() || null,
      content: cleanContent,
      featured_image: featured_image?.trim() || null,
      category: category?.trim() || "Travel Guide",
      author_name: author_name?.trim() || "TourTripHolidays Editorial",
      seo_title: seo_title?.trim() || title.trim(),
      seo_description: seo_description?.trim() || excerpt?.trim() || null,
      focus_keyword: focus_keyword?.trim() || null,
      image_alt: image_alt?.trim() || title.trim(),
      status: cleanStatus,
      published_at: publishedAt,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: inserted, error: insertError } = await client
      .from("blogs")
      .insert(newBlog)
      .select()
      .single();

    if (insertError) {
      console.error("[POST /api/admin/blogs] Insert error:", insertError.message);
      return NextResponse.json(
        { success: false, error: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Blog created successfully",
        data: inserted,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
