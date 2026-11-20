import { NextResponse } from "next/server";
import { getSupabaseApiClient } from "@/lib/supabase/api";
import { verifyAdminAuth } from "@/lib/supabase/auth-guard";

/**
 * GET /api/admin/leads
 * Admin-protected endpoint to fetch tour leads with search, filters, and pagination.
 */
export async function GET(request: Request) {
  try {
    const auth = await verifyAdminAuth(request);
    if (!auth.isAdmin) {
      return NextResponse.json(
        { success: false, error: auth.error || "Unauthorized. Admin privileges required." },
        { status: auth.statusCode || 401 }
      );
    }

    const { client } = getSupabaseApiClient();
    if (!client) {
      return NextResponse.json(
        { success: false, error: "Database service is not configured." },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status")?.trim() || "";
    const destination = searchParams.get("destination")?.trim() || "";
    const startDate = searchParams.get("startDate")?.trim() || "";
    const endDate = searchParams.get("endDate")?.trim() || "";
    const pageParam = parseInt(searchParams.get("page") || "1", 10);
    const limitParam = parseInt(searchParams.get("limit") || "20", 10);

    const page = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
    const limit = isNaN(limitParam) || limitParam < 1 ? 20 : Math.min(limitParam, 100);
    const offset = (page - 1) * limit;

    let query = client
      .from("tour_leads")
      .select(
        `
        *,
        assignee:profiles!tour_leads_assigned_to_fkey(id, full_name, email)
      `,
        { count: "exact" }
      )
      .order("created_at", { ascending: false });

    // Status filter
    if (status && status !== "all") {
      query = query.eq("lead_status", status);
    }

    // Destination filter
    if (destination && destination !== "all") {
      query = query.ilike("destination_name", `%${destination}%`);
    }

    // Date range filter
    if (startDate) {
      query = query.gte("created_at", `${startDate}T00:00:00.000Z`);
    }
    if (endDate) {
      query = query.lte("created_at", `${endDate}T23:59:59.999Z`);
    }

    // Multi-field search
    if (search) {
      query = query.or(
        `customer_name.ilike.%${search}%,customer_email.ilike.%${search}%,customer_phone.ilike.%${search}%,tour_name.ilike.%${search}%,destination_name.ilike.%${search}%`
      );
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;

    if (error) {
      console.error("[Admin Leads API] Query error:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit) || 1;

    return NextResponse.json({
      success: true,
      data: data || [],
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("[Admin Leads API] Unexpected error:", err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
