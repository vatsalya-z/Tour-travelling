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

    const leadPayload = {
      customer_id: customer_id || null,
      customer_name: customer_name.trim(),
      customer_email: customer_email.trim().toLowerCase(),
      country_code: country_code.trim(),
      customer_phone: customer_phone.trim(),
      tour_id: tour_id || null,
      tour_name: tour_name?.trim() || null,
      tour_slug: tour_slug?.trim() || null,
      destination_id: destination_id || null,
      destination_name: destination_name?.trim() || null,
      package_url: package_url?.trim() || null,
      package_price: package_price ? Number(package_price) : null,
      preferred_travel_date: preferred_travel_date || null,
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

    const { data, error } = await client
      .from("tour_leads")
      .insert(leadPayload)
      .select()
      .single();

    if (error) {
      console.error("[Leads API] Insert error:", error);
      return NextResponse.json(
        { success: false, error: error.message || "Failed to save enquiry." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Enquiry submitted successfully.",
        data,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("[Leads API] Unexpected error:", err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
