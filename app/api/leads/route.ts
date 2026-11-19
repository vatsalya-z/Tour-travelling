import { NextResponse } from "next/server";
import { getSupabaseApiClient } from "@/lib/supabase/api";

/**
 * POST /api/leads
 * Public endpoint to submit a new tour enquiry / lead.
 * Sanitizes and validates data on the server before insertion.
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
      customer_id,
      customer_name,
      customer_email,
      country_code = "+91",
      customer_phone,
      tour_id,
      tour_name,
      tour_slug,
      destination_id,
      destination_name,
      package_url,
      package_price,
      preferred_travel_date,
      travellers_count = 1,
      message,
      travelling_with,
      booking_timeline,
      travel_date_flexibility,
      flight_assistance,
      preferred_contact_time,
      source_page,
      source_cta,
    } = body;

    // Enforce Customer Login Requirement
    if (!customer_id || typeof customer_id !== "string" || !customer_id.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required: Without login, no user can submit an enquiry. Please sign in with your customer account.",
        },
        { status: 401 }
      );
    }

    // 1. Validation
    if (!customer_name || typeof customer_name !== "string" || customer_name.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "Please enter your full name (at least 2 characters)." },
        { status: 400 }
      );
    }

    if (!customer_phone || typeof customer_phone !== "string" || customer_phone.trim().replace(/\D/g, "").length < 10) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid mobile number (at least 10 digits)." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!customer_email || typeof customer_email !== "string" || !emailRegex.test(customer_email.trim())) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const parsedTravellers = parseInt(String(travellers_count), 10);
    if (isNaN(parsedTravellers) || parsedTravellers < 1) {
      return NextResponse.json(
        { success: false, error: "Number of travellers must be at least 1." },
        { status: 400 }
      );
    }

    // 2. Validate Travel Date (if provided, must not be in the past)
    if (preferred_travel_date) {
      const selectedDate = new Date(preferred_travel_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (isNaN(selectedDate.getTime())) {
        return NextResponse.json(
          { success: false, error: "Preferred travel date is invalid." },
          { status: 400 }
        );
      }

      if (selectedDate < today) {
        return NextResponse.json(
          { success: false, error: "Travel date cannot be in the past." },
          { status: 400 }
        );
      }
    }

    const { client } = getSupabaseApiClient();
    if (!client) {
      return NextResponse.json(
        { success: false, error: "Database service is not configured." },
        { status: 500 }
      );
    }

    // Format phone with country code
    const rawPhone = String(customer_phone).trim();
    const formattedPhone = rawPhone.startsWith("+")
      ? rawPhone
      : `${String(country_code).trim()} ${rawPhone}`;

    // Determine travel date (fallback to tomorrow if missing)
    let formattedTravelDate: string;
    if (preferred_travel_date) {
      formattedTravelDate = String(preferred_travel_date).split("T")[0];
    } else {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      formattedTravelDate = tomorrow.toISOString().split("T")[0];
    }

    // Resolve tour_id (must be a valid UUID in public.tours)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
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

    // Calculate total price
    let calculatedPrice = 0;
    if (package_price && Number(package_price) > 0) {
      calculatedPrice = Number(package_price) * parsedTravellers;
    } else if (resolvedTourPrice && resolvedTourPrice > 0) {
      calculatedPrice = resolvedTourPrice * parsedTravellers;
    }

    // Build rich special_requests summary
    const inquiryItems: string[] = [];
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

    const formattedSpecialRequests = inquiryItems.length > 0
      ? `• ${inquiryItems.join("\n• ")}`
      : null;

    // Validate customer_id as UUID
    const validUserId = customer_id && uuidRegex.test(String(customer_id)) ? String(customer_id) : null;

    // Primary action: Save directly into public.bookings for "Bookings & Customer Inquiries" panel
    const bookingPayload = {
      tour_id: finalTourId,
      user_id: validUserId,
      customer_name: customer_name.trim(),
      customer_email: customer_email.trim().toLowerCase(),
      customer_phone: formattedPhone,
      travellers_count: parsedTravellers,
      travel_date: formattedTravelDate,
      total_price: calculatedPrice,
      status: "pending",
      special_requests: formattedSpecialRequests,
    };

    const { data: bookingData, error: bookingError } = await client
      .from("bookings")
      .insert(bookingPayload)
      .select()
      .single();

    if (bookingError) {
      console.error("[Leads API] Error saving to bookings table:", bookingError);
    }

    // Also attempt saving to tour_leads table if it exists
    const leadPayload = {
      customer_id: validUserId,
      customer_name: customer_name.trim(),
      customer_email: customer_email.trim().toLowerCase(),
      country_code: country_code.trim(),
      customer_phone: customer_phone.trim(),
      tour_id: finalTourId,
      tour_name: displayPackageName,
      tour_slug: tour_slug?.trim() || null,
      destination_id: destination_id && uuidRegex.test(String(destination_id)) ? destination_id : null,
      destination_name: destination_name?.trim() || null,
      package_url: package_url?.trim() || null,
      package_price: calculatedPrice,
      preferred_travel_date: formattedTravelDate,
      travellers_count: parsedTravellers,
      message: message?.trim() || null,
      travelling_with: travelling_with?.trim() || null,
      booking_timeline: booking_timeline?.trim() || null,
      travel_date_flexibility: travel_date_flexibility?.trim() || null,
      flight_assistance: flight_assistance?.trim() || null,
      preferred_contact_time: preferred_contact_time?.trim() || null,
      lead_status: "NEW",
      source_page: source_page?.trim() || null,
      source_cta: source_cta?.trim() || "Package Enquiry",
    };

    try {
      await client.from("tour_leads").insert(leadPayload);
    } catch {
      // Non-critical if tour_leads is not configured
    }

    if (bookingError) {
      return NextResponse.json(
        { success: false, error: bookingError.message || "Failed to save enquiry." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Enquiry submitted successfully and saved to Bookings panel.",
        data: bookingData,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("[Leads API] Unexpected error:", err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
