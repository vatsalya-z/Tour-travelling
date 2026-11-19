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
      .select("*, tour:tours(id, name, slug, price, cover_image), customer:profiles(id, full_name, email, mobile_number, role)")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (status) {
      query = query.eq("status", status);
    }

    if (user_id && customer_email) {
      query = query.or(`user_id.eq.${user_id},customer_email.eq.${customer_email.trim().toLowerCase()}`);
    } else if (user_id) {
      query = query.eq("user_id", user_id);
    } else if (customer_email) {
      query = query.eq("customer_email", customer_email.trim().toLowerCase());
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
      tour_name,
      tour_slug,
      destination_id,
      destination_name,
      package_url,
      package_price,
      user_id,
      customer_id,
      customer_name,
      customer_email,
      country_code = "+91",
      customer_phone,
      travellers_count,
      travel_date,
      preferred_travel_date,
      total_price,
      status,
      special_requests,
      message,
      travelling_with,
      booking_timeline,
      travel_date_flexibility,
      flight_assistance,
      preferred_contact_time,
      source_page,
      source_cta,
    } = body || {};

    // 0. Enforce Customer Login Requirement
    const rawUserId = user_id || customer_id;
    if (!rawUserId || typeof rawUserId !== "string" || !rawUserId.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required: Without login, no user can submit an enquiry. Please sign in with your customer account.",
        },
        { status: 401 }
      );
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(rawUserId.trim())) {
      return NextResponse.json(
        { success: false, error: "Invalid customer account session. Please sign in again." },
        { status: 400 }
      );
    }
    const validUserId = rawUserId.trim();

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

    // Determine travel date (travel_date or preferred_travel_date, fallback to tomorrow)
    const effectiveTravelDate = travel_date || preferred_travel_date;
    let formattedTravelDate: string;
    if (effectiveTravelDate) {
      formattedTravelDate = String(effectiveTravelDate).split("T")[0];
    } else {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      formattedTravelDate = tomorrow.toISOString().split("T")[0];
    }

    // Format phone with country code if not already included
    const rawPhone = String(customer_phone).trim();
    const formattedPhone = rawPhone.startsWith("+")
      ? rawPhone
      : `${String(country_code).trim()} ${rawPhone}`;

    const validStatuses = ["pending", "confirmed", "cancelled", "completed"];
    const assignedStatus = status && validStatuses.includes(status) ? status : "pending";

    const { client } = getSupabaseApiClient();

    if (!client) {
      return NextResponse.json(
        { success: false, error: "Supabase credentials are not configured in .env.local" },
        { status: 500 }
      );
    }

    // 2. Resolve tour_id (must be a valid UUID in public.tours)
    let finalTourId: string | null = null;
    let resolvedTourPrice: number | null = null;
    let resolvedTourName: string | null = null;

    if (tour_id && uuidRegex.test(String(tour_id))) {
      const { data: tourRecord } = await client
        .from("tours")
        .select("id, name, price")
        .eq("id", tour_id)
        .maybeSingle();

      if (tourRecord) {
        finalTourId = tourRecord.id;
        resolvedTourPrice = tourRecord.price ? Number(tourRecord.price) : null;
        resolvedTourName = tourRecord.name;
      }
    }

    // If not resolved yet, try tour_slug
    if (!finalTourId && (tour_slug || (tour_id && !uuidRegex.test(String(tour_id))))) {
      const slugToLookup = tour_slug || tour_id;
      const { data: tourBySlug } = await client
        .from("tours")
        .select("id, name, price")
        .eq("slug", slugToLookup)
        .maybeSingle();

      if (tourBySlug) {
        finalTourId = tourBySlug.id;
        resolvedTourPrice = tourBySlug.price ? Number(tourBySlug.price) : null;
        resolvedTourName = tourBySlug.name;
      }
    }

    // If still not resolved, try tour_name
    if (!finalTourId && tour_name) {
      const { data: tourByName } = await client
        .from("tours")
        .select("id, name, price")
        .ilike("name", `%${String(tour_name).trim()}%`)
        .limit(1)
        .maybeSingle();

      if (tourByName) {
        finalTourId = tourByName.id;
        resolvedTourPrice = tourByName.price ? Number(tourByName.price) : null;
        resolvedTourName = tourByName.name;
      }
    }

    // 4. Calculate total price
    const paxCount = travellers_count ? Math.max(parseInt(String(travellers_count), 10) || 1, 1) : 1;
    let calculatedPrice = 0;
    if (typeof total_price === "number" && total_price > 0) {
      calculatedPrice = total_price;
    } else if (package_price && Number(package_price) > 0) {
      calculatedPrice = Number(package_price) * paxCount;
    } else if (resolvedTourPrice && resolvedTourPrice > 0) {
      calculatedPrice = resolvedTourPrice * paxCount;
    }

    // 5. Build rich special_requests summary containing all multi-step form answers
    const inquiryItems: string[] = [];
    inquiryItems.push(`Customer ID: ${validUserId}`);
    const displayPackageName =
      resolvedTourName ||
      tour_name ||
      (destination_name ? `${destination_name} Tour Package` : null);

    if (displayPackageName) {
      inquiryItems.push(
        `Tour / Package: ${displayPackageName}${
          destination_name && !displayPackageName.includes(destination_name)
            ? ` (${destination_name})`
            : ""
        }`
      );
    }
    if (travelling_with) {
      inquiryItems.push(`Travelling With: ${travelling_with}`);
    }
    if (flight_assistance) {
      inquiryItems.push(`Flight Assistance: ${flight_assistance}`);
    }
    if (travel_date_flexibility) {
      inquiryItems.push(`Date Flexibility: ${travel_date_flexibility}`);
    }
    if (booking_timeline) {
      inquiryItems.push(`Booking Timeline: ${booking_timeline}`);
    }
    if (preferred_contact_time) {
      inquiryItems.push(`Best Time to Contact: ${preferred_contact_time}`);
    }
    if (source_page || source_cta) {
      inquiryItems.push(`Source: ${source_page || "Website"}${source_cta ? ` (${source_cta})` : ""}`);
    }
    if (message && String(message).trim()) {
      inquiryItems.push(`Customer Note: ${String(message).trim()}`);
    }

    let finalSpecialRequests = special_requests ? String(special_requests).trim() : "";
    if (inquiryItems.length > 0) {
      const formattedItems = inquiryItems.join("\n• ");
      finalSpecialRequests = finalSpecialRequests
        ? `${finalSpecialRequests}\n\n[Enquiry Questionnaire]\n• ${formattedItems}`
        : `• ${formattedItems}`;
    }

    const bookingPayload = {
      tour_id: finalTourId,
      user_id: validUserId,
      customer_name: customer_name.trim(),
      customer_email: customer_email.trim().toLowerCase(),
      customer_phone: formattedPhone,
      travellers_count: paxCount,
      travel_date: formattedTravelDate,
      total_price: calculatedPrice,
      status: assignedStatus,
      special_requests: finalSpecialRequests || null,
    };

    const { data, error } = await client
      .from("bookings")
      .insert(bookingPayload)
      .select()
      .single();

    if (error) {
      console.error("[Bookings API] Insert error:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Booking / Customer Inquiry created successfully",
        data,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

/**
 * PATCH /api/bookings
 * Updates booking status using the Admin Service Role client (bypasses RLS).
 */
export async function PATCH(request: Request) {
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

    const { id, status } = body || {};

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { success: false, error: "Booking ID is required" },
        { status: 400 }
      );
    }

    const validStatuses = ["pending", "confirmed", "cancelled", "completed"];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    const { client } = getSupabaseApiClient();
    if (!client) {
      return NextResponse.json(
        { success: false, error: "Database service is not configured" },
        { status: 500 }
      );
    }

    const { data, error } = await client
      .from("bookings")
      .update({ status })
      .eq("id", id)
      .select("*, tour:tours(id, name, slug, price, cover_image)")
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Booking status updated successfully",
      data,
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
      "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

