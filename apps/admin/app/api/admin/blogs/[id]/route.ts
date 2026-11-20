import { NextResponse } from "next/server";
import { getSupabaseApiClient } from "@/lib/supabase/api";
import { verifyAdminAuth } from "@/lib/supabase/auth-guard";
import { slugify } from "@/lib/utils";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * PUT /api/admin/blogs/[id]
 * Updates an existing blog article.
 */
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const auth = await verifyAdminAuth(request);
    if (!auth.isAdmin) {
      return NextResponse.json(
        { success: false, error: auth.error || "Forbidden: Administrator access required" },
        { status: auth.statusCode || 403 }
      );
    }

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

    const body = await request.json();
    const blogId = id.trim();

    // Fetch existing blog record
    const { data: existing, error: fetchError } = await client
      .from("blogs")
      .select("*")
      .eq("id", blogId)
      .maybeSingle();

    if (fetchError || !existing) {
      return NextResponse.json(
        { success: false, error: "Blog post not found" },
        { status: 404 }
      );
    }

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (body.title !== undefined) updates.title = String(body.title).trim();
    if (body.excerpt !== undefined) updates.excerpt = body.excerpt ? String(body.excerpt).trim() : null;
    if (body.content !== undefined) updates.content = String(body.content).trim();
    if (body.featured_image !== undefined) updates.featured_image = body.featured_image ? String(body.featured_image).trim() : null;
    if (body.category !== undefined) updates.category = body.category ? String(body.category).trim() : null;
    if (body.author_name !== undefined) updates.author_name = body.author_name ? String(body.author_name).trim() : null;
    if (body.seo_title !== undefined) updates.seo_title = body.seo_title ? String(body.seo_title).trim() : null;
    if (body.seo_description !== undefined) updates.seo_description = body.seo_description ? String(body.seo_description).trim() : null;
    if (body.focus_keyword !== undefined) updates.focus_keyword = body.focus_keyword ? String(body.focus_keyword).trim() : null;
    if (body.image_alt !== undefined) updates.image_alt = body.image_alt ? String(body.image_alt).trim() : null;

    // Slug update with uniqueness check
    if (body.slug !== undefined && body.slug.trim()) {
      const cleanSlug = slugify(body.slug.trim());
      if (cleanSlug !== existing.slug) {
        const { data: conflict } = await client
          .from("blogs")
          .select("id")
          .eq("slug", cleanSlug)
          .neq("id", blogId)
          .maybeSingle();

        if (conflict) {
          return NextResponse.json(
            { success: false, error: `Slug '${cleanSlug}' is already in use by another article` },
            { status: 409 }
          );
        }
        updates.slug = cleanSlug;
      }
    }

    // Status transition & published_at handling
    if (body.status !== undefined) {
      const targetStatus = String(body.status).toUpperCase();
      if (["DRAFT", "PUBLISHED", "UNPUBLISHED"].includes(targetStatus)) {
        updates.status = targetStatus;
        if (targetStatus === "PUBLISHED" && !existing.published_at) {
          updates.published_at = new Date().toISOString();
        }
      }
    }

    const { data: updated, error: updateError } = await client
      .from("blogs")
      .update(updates)
      .eq("id", blogId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Blog updated successfully",
      data: updated,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/blogs/[id]
 * Deletes a blog article by ID.
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const auth = await verifyAdminAuth(request);
    if (!auth.isAdmin) {
      return NextResponse.json(
        { success: false, error: auth.error || "Forbidden: Administrator access required" },
        { status: auth.statusCode || 403 }
      );
    }

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

    const blogId = id.trim();

    const { error: deleteError } = await client
      .from("blogs")
      .delete()
      .eq("id", blogId);

    if (deleteError) {
      return NextResponse.json(
        { success: false, error: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Blog deleted successfully",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

