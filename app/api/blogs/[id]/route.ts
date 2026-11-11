import { NextResponse } from "next/server";
import { getSupabaseApiClient } from "@/lib/supabase/api";
import { verifyAdminAuth } from "@/lib/supabase/auth-guard";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/blogs/[id]
 * Fetches a single blog by ID.
 * If status is DRAFT/UNPUBLISHED, requires admin authorization.
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!id || typeof id !== "string" || !id.trim()) {
      return NextResponse.json(
        { success: false, error: "Blog ID is required" },
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

    const { data: blog, error } = await client
      .from("blogs")
      .select("*")
      .eq("id", id.trim())
      .maybeSingle();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    if (!blog) {
      return NextResponse.json(
        { success: false, error: "Blog post not found" },
        { status: 404 }
      );
    }

    // If blog is not PUBLISHED, only authenticated admins may view it
    if (blog.status !== "PUBLISHED") {
      const auth = await verifyAdminAuth(request);
      if (!auth.isAdmin) {
        return NextResponse.json(
          { success: false, error: "Article is not published" },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: blog,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

