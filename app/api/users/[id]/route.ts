import { NextResponse } from "next/server";
import { getSupabaseApiClient } from "@/lib/supabase/api";
import { verifyAdminAuth } from "@/lib/supabase/auth-guard";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/users/[id]
 * Fetches single customer details, complete profile info, and attached booking history.
 * Strictly protected for administrators.
 */
export async function GET(request: Request, { params }: RouteParams) {
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
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    const { client, isAdmin } = getSupabaseApiClient();

    if (!client) {
      return NextResponse.json(
        { success: false, error: "Supabase credentials are not configured in .env.local" },
        { status: 500 }
      );
    }

    const userId = id.trim();

    // 1. Fetch user from public.profiles table
    const { data: profile } = await client
      .from("profiles")
      .select("id, full_name, email, mobile_number, role, avatar_url, created_at, updated_at")
      .eq("id", userId)
      .maybeSingle();

    let userData = profile;

    // Fallback to auth.users if not found in profiles
    if (!userData && isAdmin) {
      const { data: authUser } = await client.auth.admin.getUserById(userId);
      if (authUser?.user) {
        const u = authUser.user;
        userData = {
          id: u.id,
          email: u.email || null,
          full_name: u.user_metadata?.full_name || null,
          mobile_number: u.user_metadata?.mobile_number || null,
          role: u.user_metadata?.role || "customer",
          avatar_url: u.user_metadata?.avatar_url || null,
          created_at: u.created_at,
          updated_at: u.updated_at || u.created_at,
        };
      }
    }

    if (!userData) {
      return NextResponse.json(
        {
          success: false,
          error: `Customer with ID '${userId}' not found`,
        },
        { status: 404 }
      );
    }

    // 2. Fetch full booking history for this customer (by user_id OR customer_email)
    let bookingsQuery = client
      .from("bookings")
      .select("id, tour_id, customer_name, customer_email, customer_phone, travellers_count, travel_date, total_price, status, special_requests, created_at, tour:tours(id, name, slug, price, cover_image)")
      .order("created_at", { ascending: false });

    if (userData.email) {
      bookingsQuery = bookingsQuery.or(`user_id.eq.${userId},customer_email.eq.${userData.email.toLowerCase()}`);
    } else {
      bookingsQuery = bookingsQuery.eq("user_id", userId);
    }

    const { data: userBookings, error: bookingsError } = await bookingsQuery;

    const bookingsList = userBookings || [];

    const totalSpent = bookingsList
      .filter((b) => b.status === "confirmed" || b.status === "completed")
      .reduce((sum, b) => sum + (Number(b.total_price) || 0), 0);

    const stats = {
      total_bookings: bookingsList.length,
      confirmed: bookingsList.filter((b) => b.status === "confirmed").length,
      completed: bookingsList.filter((b) => b.status === "completed").length,
      pending: bookingsList.filter((b) => b.status === "pending").length,
      cancelled: bookingsList.filter((b) => b.status === "cancelled").length,
      total_spent: totalSpent,
    };

    return NextResponse.json({
      success: true,
      data: {
        ...userData,
        stats,
        bookings: bookingsList,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

/**
 * PUT /api/users/[id]
 * Updates user role or profile information.
 * Strictly protected for administrators.
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
    const body = await request.json();
    const { role, full_name, mobile_number } = body || {};

    const { client } = getSupabaseApiClient();
    if (!client) {
      return NextResponse.json(
        { success: false, error: "Database not configured" },
        { status: 500 }
      );
    }

    const updates: Record<string, any> = {};
    if (role !== undefined) updates.role = role;
    if (full_name !== undefined) updates.full_name = full_name;
    if (mobile_number !== undefined) updates.mobile_number = mobile_number;

    const { data, error } = await client
      .from("profiles")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
