import { NextResponse } from "next/server";
import { getSupabaseApiClient } from "@/lib/supabase/api";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/users/[id]
 * Fetches a single user's profile by their unique ID (UUID).
 * Also attaches any bookings associated with this user.
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
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
    const { data: profile, error: profileError } = await client
      .from("profiles")
      .select("id, full_name, email, mobile_number, role, avatar_url, created_at, updated_at")
      .eq("id", userId)
      .maybeSingle();

    let userData = profile;

    // 2. Fallback to Supabase Auth if not found in profiles (and admin client is available)
    if (!userData && isAdmin) {
      const { data: authUser, error: authError } = await client.auth.admin.getUserById(userId);

      if (!authError && authUser?.user) {
        const u = authUser.user;
        const rawRole = u.user_metadata?.role || "customer";
        const normalizedRole = rawRole === "admin" ? "admin" : "customer";

        userData = {
          id: u.id,
          email: u.email || null,
          full_name: u.user_metadata?.full_name || null,
          mobile_number: u.user_metadata?.mobile_number || null,
          role: normalizedRole,
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
          error: `User with ID '${userId}' not found`,
        },
        { status: 404 }
      );
    }

    // 3. Optionally fetch user's booking history from public.bookings table
    const { data: userBookings } = await client
      .from("bookings")
      .select("id, tour_id, customer_name, customer_email, customer_phone, travellers_count, travel_date, total_price, status, created_at, tour:tours(id, name, slug, price, cover_image)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    return NextResponse.json({
      success: true,
      data: {
        ...userData,
        bookings: userBookings || [],
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

/**
 * PUT /api/users/[id]
 * Updates a user's profile data (full_name, mobile_number, role, avatar_url).
 */
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const userId = id.trim();

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const { full_name, mobile_number, role, avatar_url } = body || {};

    const { client, isAdmin } = getSupabaseApiClient();

    if (!client) {
      return NextResponse.json(
        { success: false, error: "Supabase credentials are not configured in .env.local" },
        { status: 500 }
      );
    }

    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (full_name !== undefined) updatePayload.full_name = full_name ? String(full_name).trim() : null;
    if (mobile_number !== undefined) updatePayload.mobile_number = mobile_number ? String(mobile_number).trim() : null;
    if (avatar_url !== undefined) updatePayload.avatar_url = avatar_url ? String(avatar_url).trim() : null;
    if (role !== undefined) {
      updatePayload.role = role === "admin" ? "admin" : "customer";
    }

    const { data: updatedProfile, error: updateError } = await client
      .from("profiles")
      .update(updatePayload)
      .eq("id", userId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
    }

    // Also update Supabase Auth metadata if admin client is available
    if (isAdmin && (full_name !== undefined || mobile_number !== undefined || role !== undefined)) {
      await client.auth.admin.updateUserById(userId, {
        user_metadata: {
          full_name: updatePayload.full_name,
          mobile_number: updatePayload.mobile_number,
          role: updatePayload.role,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "User profile updated successfully",
      data: updatedProfile,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

/**
 * DELETE /api/users/[id]
 * Deletes a user from public.profiles and auth.users (requires admin service role).
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const userId = id.trim();

    const { client, isAdmin } = getSupabaseApiClient();

    if (!client) {
      return NextResponse.json(
        { success: false, error: "Supabase credentials are not configured in .env.local" },
        { status: 500 }
      );
    }

    if (isAdmin) {
      // Admin delete deletes from auth.users (cascades to profiles)
      const { error: deleteAuthError } = await client.auth.admin.deleteUser(userId);
      if (deleteAuthError) {
        return NextResponse.json({ success: false, error: deleteAuthError.message }, { status: 500 });
      }
    } else {
      // Fallback: delete from public.profiles only
      const { error: deleteProfileError } = await client.from("profiles").delete().eq("id", userId);
      if (deleteProfileError) {
        return NextResponse.json({ success: false, error: deleteProfileError.message }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      message: `User '${userId}' deleted successfully`,
    });
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
      "Access-Control-Allow-Methods": "GET, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

