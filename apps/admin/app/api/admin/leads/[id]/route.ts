import { NextResponse } from "next/server";
import { getSupabaseApiClient } from "@/lib/supabase/api";
import { verifyAdminAuth } from "@/lib/supabase/auth-guard";

const VALID_STATUSES = [
  "NEW",
  "CONTACTED",
  "FOLLOW_UP",
  "INTERESTED",
  "CONVERTED",
  "CLOSED",
  "NOT_INTERESTED",
];

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/leads/[id]
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const auth = await verifyAdminAuth(request);
    if (!auth.isAdmin) {
      return NextResponse.json(
        { success: false, error: auth.error || "Unauthorized." },
        { status: auth.statusCode || 401 }
      );
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: "Missing lead ID." }, { status: 400 });
    }

    const { client } = getSupabaseApiClient();
    if (!client) {
      return NextResponse.json({ success: false, error: "Database not configured." }, { status: 500 });
    }

    const { data, error } = await client
      .from("tour_leads")
      .select(`
        *,
        assignee:profiles!tour_leads_assigned_to_fkey(id, full_name, email)
      `)
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json({ success: false, error: error?.message || "Lead not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/leads/[id]
 * Updates lead status, internal admin notes, and assigned admin.
 */
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const auth = await verifyAdminAuth(request);
    if (!auth.isAdmin) {
      return NextResponse.json(
        { success: false, error: auth.error || "Unauthorized." },
        { status: auth.statusCode || 401 }
      );
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: "Missing lead ID." }, { status: 400 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, error: "Invalid JSON body." }, { status: 400 });
    }

    const updates: Record<string, string | number | null | undefined> = {};

    if (body.lead_status !== undefined) {
      if (!VALID_STATUSES.includes(body.lead_status)) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
          },
          { status: 400 }
        );
      }
      updates.lead_status = body.lead_status;
    }

    if (body.admin_notes !== undefined) {
      updates.admin_notes = typeof body.admin_notes === "string" ? body.admin_notes.trim() : null;
    }

    if (body.assigned_to !== undefined) {
      updates.assigned_to = body.assigned_to || null;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, error: "No fields provided to update." },
        { status: 400 }
      );
    }

    updates.updated_at = new Date().toISOString();

    const { client } = getSupabaseApiClient();
    if (!client) {
      return NextResponse.json({ success: false, error: "Database not configured." }, { status: 500 });
    }

    const { data, error } = await client
      .from("tour_leads")
      .update(updates)
      .eq("id", id)
      .select(`
        *,
        assignee:profiles!tour_leads_assigned_to_fkey(id, full_name, email)
      `)
      .single();

    if (error) {
      console.error("[Admin Lead Update] Error:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Lead updated successfully.",
      data,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/leads/[id]
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const auth = await verifyAdminAuth(request);
    if (!auth.isAdmin) {
      return NextResponse.json(
        { success: false, error: auth.error || "Unauthorized." },
        { status: auth.statusCode || 401 }
      );
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: "Missing lead ID." }, { status: 400 });
    }

    const { client } = getSupabaseApiClient();
    if (!client) {
      return NextResponse.json({ success: false, error: "Database not configured." }, { status: 500 });
    }

    const { error } = await client.from("tour_leads").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Lead deleted successfully.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
