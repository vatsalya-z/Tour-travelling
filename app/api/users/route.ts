import { NextResponse } from "next/server";
import { getSupabaseApiClient } from "@/lib/supabase/api";
import { verifyAdminAuth } from "@/lib/supabase/auth-guard";

/**
 * GET /api/users
 * Fetches user & customer profiles from public.profiles table.
 * Strictly protected for administrators.
 */
export async function GET(request: Request) {
  try {
    // 1. Verify admin authorization
    const auth = await verifyAdminAuth(request);
    if (!auth.isAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: auth.error || "Forbidden: Administrator access required",
        },
        { status: auth.statusCode || 403 }
      );
    }

    const { client, isAdmin } = getSupabaseApiClient();

    if (!client) {
      return NextResponse.json(
        {
          success: false,
          error: "Supabase credentials are not configured in .env.local",
        },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");
    const email = searchParams.get("email");
    const search = searchParams.get("search");
    const limitParam = parseInt(searchParams.get("limit") || "100", 10);
    const limit = isNaN(limitParam) ? 100 : Math.min(Math.max(limitParam, 1), 200);

    // 2. Fetch profiles
    let query = client
      .from("profiles")
      .select("id, full_name, email, mobile_number, role, avatar_url, created_at, updated_at")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (role && role !== "all") {
      const mappedRole = role === "user" ? "customer" : role;
      query = query.eq("role", mappedRole);
    }

    if (email) {
      query = query.eq("email", email.trim().toLowerCase());
    }

    if (search) {
      const q = search.trim();
      query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%,mobile_number.ilike.%${q}%`);
    }

    const { data: profiles, error: profileError } = await query;

    let userList = profiles || [];

    // Fallback to auth.users if profiles table is empty
    if ((!userList || userList.length === 0) && isAdmin) {
      const { data: authData } = await client.auth.admin.listUsers({ perPage: limit });
      if (authData?.users && authData.users.length > 0) {
        userList = authData.users.map((u) => ({
          id: u.id,
          email: u.email || null,
          full_name: u.user_metadata?.full_name || null,
          mobile_number: u.user_metadata?.mobile_number || null,
          role: u.user_metadata?.role || "customer",
          avatar_url: u.user_metadata?.avatar_url || null,
          created_at: u.created_at,
          updated_at: u.updated_at || u.created_at,
        }));
      }
    }

    // 3. Fetch summary bookings to attach total_bookings & total_spent per customer
    const { data: allBookings } = await client
      .from("bookings")
      .select("id, user_id, customer_email, total_price, status");

    const enrichedUsers = userList.map((p) => {
      const pEmail = (p.email || "").toLowerCase();
      const pBookings = (allBookings || []).filter(
        (b) =>
          (b.user_id && b.user_id === p.id) ||
          (b.customer_email && b.customer_email.toLowerCase() === pEmail)
      );

      const confirmedCount = pBookings.filter(
        (b) => b.status === "confirmed" || b.status === "completed"
      ).length;

      const totalSpent = pBookings
        .filter((b) => b.status === "confirmed" || b.status === "completed")
        .reduce((sum, b) => sum + (Number(b.total_price) || 0), 0);

      return {
        ...p,
        total_bookings: pBookings.length,
        confirmed_bookings: confirmedCount,
        total_spent: totalSpent,
      };
    });

    return NextResponse.json({
      success: true,
      count: enrichedUsers.length,
      data: enrichedUsers,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
