import { NextResponse } from "next/server";
import { getSupabaseApiClient } from "@/lib/supabase/api";

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * GET /api/destinations
 * Fetches destination spots / regions from public.destinations table.
 */
export async function GET(request: Request) {
  try {
    const { client } = getSupabaseApiClient();

    if (!client) {
      return NextResponse.json(
        { success: false, error: "Supabase credentials are not configured in .env.local" },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const state = searchParams.get("state");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    let query = client
      .from("destinations")
      .select("*")
      .order("name", { ascending: true });

    if (state) {
      query = query.eq("state", state);
    }

    if (status) {
      query = query.eq("status", status);
    }

    if (search) {
      const q = search.trim();
      query = query.or(`name.ilike.%${q}%,state.ilike.%${q}%`);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      count: data?.length || 0,
      data: data || [],
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

/**
 * POST /api/destinations
 * Creates a new holiday destination spot matching public.destinations SQL schema.
 */
export async function POST(request: Request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const {
      name,
      slug,
      state,
      description,
      cover_image,
      gallery_images = [],
      best_time_to_visit,
      attractions = [],
      meta_title,
      meta_description,
      status = "published",
    } = body || {};

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "name is required" },
        { status: 400 }
      );
    }

    if (!state || typeof state !== "string" || !state.trim()) {
      return NextResponse.json(
        { success: false, error: "state is required" },
        { status: 400 }
      );
    }

    const cleanSlug = slug && typeof slug === "string" && slug.trim()
      ? generateSlug(slug)
      : generateSlug(name);

    const validStatuses = ["published", "draft"];
    const assignedStatus = validStatuses.includes(status) ? status : "published";

    const { client } = getSupabaseApiClient();

    if (!client) {
      return NextResponse.json(
        { success: false, error: "Supabase credentials are not configured in .env.local" },
        { status: 500 }
      );
    }

    const payload = {
      name: name.trim(),
      slug: cleanSlug,
      state: state.trim(),
      description: description ? String(description).trim() : null,
      cover_image: cover_image ? String(cover_image).trim() : null,
      gallery_images: Array.isArray(gallery_images) ? gallery_images : [],
      best_time_to_visit: best_time_to_visit ? String(best_time_to_visit).trim() : null,
      attractions: Array.isArray(attractions) ? attractions : [],
      meta_title: meta_title ? String(meta_title).trim() : null,
      meta_description: meta_description ? String(meta_description).trim() : null,
      status: assignedStatus,
    };

    const { data, error } = await client
      .from("destinations")
      .insert(payload)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Destination created successfully",
        data,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

