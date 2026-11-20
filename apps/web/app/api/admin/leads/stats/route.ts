import { NextResponse } from "next/server";
import { getSupabaseApiClient } from "@/lib/supabase/api";
import { verifyAdminAuth } from "@/lib/supabase/auth-guard";

/**
 * GET /api/admin/leads/stats
 * Returns counts of leads by status for dashboard summary cards.
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

    // Run parallel count queries for all statuses
    const [totalRes, newRes, contactedRes, followUpRes, convertedRes, interestedRes, closedRes] =
      await Promise.all([
        client.from("tour_leads").select("*", { count: "exact", head: true }),
        client.from("tour_leads").select("*", { count: "exact", head: true }).eq("lead_status", "NEW"),
        client.from("tour_leads").select("*", { count: "exact", head: true }).eq("lead_status", "CONTACTED"),
        client.from("tour_leads").select("*", { count: "exact", head: true }).eq("lead_status", "FOLLOW_UP"),
        client.from("tour_leads").select("*", { count: "exact", head: true }).eq("lead_status", "CONVERTED"),
        client.from("tour_leads").select("*", { count: "exact", head: true }).eq("lead_status", "INTERESTED"),
        client.from("tour_leads").select("*", { count: "exact", head: true }).eq("lead_status", "CLOSED"),
      ]);

    if (totalRes.error) {
      console.error("[Leads Stats API] Error fetching stats:", totalRes.error);
      return NextResponse.json({ success: false, error: totalRes.error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        totalLeads: totalRes.count || 0,
        newLeads: newRes.count || 0,
        contactedLeads: contactedRes.count || 0,
        followUpLeads: followUpRes.count || 0,
        convertedLeads: convertedRes.count || 0,
        interestedLeads: interestedRes.count || 0,
        closedLeads: closedRes.count || 0,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("[Leads Stats API] Unexpected error:", err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
