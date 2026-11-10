import { NextResponse } from "next/server";
import { getSupabaseApiClient } from "@/lib/supabase/api";

/**
 * GET /api/bookings
 * Fetches bookings from public.bookings table according to SQL schema.
 * Table Schema:
 *   - id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
 *   - tour_id UUID REFERENCES public.tours(id)
 *   - user_id UUID REFERENCES public.profiles(id)
 *   - customer_name TEXT NOT NULL
 *   - customer_email TEXT NOT NULL
 *   - customer_phone TEXT NOT NULL
 *   - travellers_count INTEGER DEFAULT 1
 *   - travel_date DATE NOT NULL
 *   - total_price NUMERIC(10, 2) DEFAULT 0
 *   - status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed'))
 *   - special_requests TEXT
 *   - created_at TIMESTAMPTZ
 *   - updated_at TIMESTAMPTZ
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
    const status = searchParams.get("status");
    const customer_email = searchParams.get("customer_email");
    const user_id = searchParams.get("user_id");
    const tour_id = searchParams.get("tour_id");
    const search = searchParams.get("search");
    const limitParam = parseInt(searchParams.get("limit") || "50", 10);
    const limit = isNaN(limitParam) ? 50 : Math.min(Math.max(limitParam, 1), 100);

    let query = client
      .from("bookings")
      .select("*, tour:tours(id, name, slug, price, cover_image)")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (status) {
      query = query.eq("status", status);
    }

    if (customer_email) {
      query = query.eq("customer_email", customer_email.trim().toLowerCase());
    }

    if (user_id) {
      query = query.eq("user_id", user_id);
    }

    if (tour_id) {
      query = query.eq("tour_id", tour_id);
    }

    if (search) {
      const q = search.trim();
      query = query.or(`customer_name.ilike.%${q}%,customer_email.ilike.%${q}%,customer_phone.ilike.%${q}%`);
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
 * POST /api/bookings
 * Creates a new travel booking / customer inquiry.
 * Inserts directly into public.bookings table.
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
      tour_id,
      user_id,
      customer_name,
      customer_email,
      customer_phone,
      travellers_count,
      travel_date,
      total_price,
      status,
      special_requests,
    } = body || {};

    // 1. Validation
    if (!customer_name || typeof customer_name !== "string" || !customer_name.trim()) {
      return NextResponse.json(
        { success: false, error: "customer_name is required" },
        { status: 400 }
      );
    }

    if (!customer_email || typeof customer_email !== "string" || !customer_email.trim()) {
      return NextResponse.json(
        { success: false, error: "customer_email is required" },
        { status: 400 }
      );
    }

    if (!customer_phone || typeof customer_phone !== "string" || !customer_phone.trim()) {
      return NextResponse.json(
        { success: false, error: "customer_phone is required" },
        { status: 400 }
      );
    }

    if (!travel_date) {
      return NextResponse.json(
        { success: false, error: "travel_date is required (format: YYYY-MM-DD)" },
        { status: 400 }
      );
    }

    const validStatuses = ["pending", "confirmed", "cancelled", "completed"];
    const assignedStatus = status && validStatuses.includes(status) ? status : "pending";

    const { client } = getSupabaseApiClient();

    if (!client) {
      return NextResponse.json(
        { success: false, error: "Supabase credentials are not configured in .env.local" },
        { status: 500 }
      );
    }

    const bookingPayload = {
      tour_id: tour_id || null,
      user_id: user_id || null,
      customer_name: customer_name.trim(),
      customer_email: customer_email.trim().toLowerCase(),
      customer_phone: customer_phone.trim(),
      travellers_count: travellers_count ? Math.max(parseInt(travellers_count, 10) || 1, 1) : 1,
      travel_date: String(travel_date).split("T")[0],
      total_price: typeof total_price === "number" ? total_price : parseFloat(total_price) || 0,
      status: assignedStatus,
      special_requests: special_requests ? String(special_requests).trim() : null,
    };

    const { data, error } = await client
      .from("bookings")
      .insert(bookingPayload)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Booking created successfully",
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

