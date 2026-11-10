import { NextResponse } from "next/server";
import { getSupabaseApiClient } from "@/lib/supabase/api";
import { verifyAdminAuth, getRequesterAuth } from "@/lib/supabase/auth-guard";
import { slugify } from "@/lib/utils";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidUUID(id: string): boolean {
  return typeof id === "string" && UUID_REGEX.test(id.trim());
}

function isValidDateString(str: string): boolean {
  const d = new Date(str);
  return !isNaN(d.getTime());
}

/**
 * GET /api/tours/[id]
 * Fetch a specific tour by its UUID.
 * Validates UUID format, checks public visibility rules.
 */
export async function GET(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!id || !isValidUUID(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid tour ID format",
          error: `The provided tour ID '${id}' is not a valid UUID`,
        },
        { status: 400 }
      );
    }

    const { client } = getSupabaseApiClient();

    if (!client) {
      return NextResponse.json(
        {
          success: false,
          message: "Database connection failed",
          error: "Supabase credentials are not configured in environment",
        },
        { status: 500 }
      );
    }

    const tourId = id.trim();

    // Query tour with joined destination details
    const { data: tour, error } = await client
      .from("tours")
      .select("*, destination:destinations(id, name, slug, state)")
      .eq("id", tourId)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to fetch tour",
          error: error.message,
        },
        { status: 500 }
      );
    }

    if (!tour) {
      return NextResponse.json(
        {
          success: false,
          message: "Tour not found",
          error: `No tour exists with the provided ID '${tourId}'`,
        },
        { status: 404 }
      );
    }

    // Visibility rules: draft tours are hidden from public non-admin users
    if (tour.status !== "published") {
      const requesterAuth = await getRequesterAuth(request);
      if (!requesterAuth.isAdmin) {
        return NextResponse.json(
          {
            success: false,
            message: "Tour not found",
            error: `No tour exists with the provided ID '${tourId}'`,
          },
          { status: 404 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Tour retrieved successfully",
      data: tour,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: message,
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/tours/[id]
 * Update an existing tour using its UUID.
 * Supports partial updates without overwriting unsupplied fields.
 * Requires admin authentication and authorization.
 */
export async function PUT(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    // 1. Extract and Console.log Bearer Token for Debugging/Verification
    const authHeader =
      request.headers.get("authorization") || request.headers.get("Authorization");
    const bearerToken =
      authHeader && authHeader.toLowerCase().startsWith("bearer ")
        ? authHeader.substring(7).trim()
        : null;

    console.log("Bearer token:", bearerToken);

    // 2. Validate UUID format
    if (!id || !isValidUUID(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid tour ID format",
          error: `The provided tour ID '${id}' is not a valid UUID`,
        },
        { status: 400 }
      );
    }

    // 2. Verify Admin Authentication and Authorization
    const authResult = await verifyAdminAuth(request);
    if (!authResult.isAdmin) {
      return NextResponse.json(
        {
          success: false,
          message:
            authResult.statusCode === 403 ? "Forbidden" : "Authentication required",
          error: authResult.error || "Administrator privileges required",
        },
        { status: authResult.statusCode || 401 }
      );
    }

    // 3. Parse JSON body
    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request",
          error: "Invalid JSON in request body",
        },
        { status: 400 }
      );
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request",
          error: "Request body must be a valid JSON object",
        },
        { status: 400 }
      );
    }

    const { client } = getSupabaseApiClient();
    if (!client) {
      return NextResponse.json(
        {
          success: false,
          message: "Database connection failed",
          error: "Supabase client not initialized",
        },
        { status: 500 }
      );
    }

    const tourId = id.trim();

    // 4. Check if tour exists
    const { data: existingTour, error: fetchError } = await client
      .from("tours")
      .select("*")
      .eq("id", tourId)
      .maybeSingle();

    if (fetchError) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to check existing tour",
          error: fetchError.message,
        },
        { status: 500 }
      );
    }

    if (!existingTour) {
      return NextResponse.json(
        {
          success: false,
          message: "Tour not found",
          error: `No tour exists with the provided ID '${tourId}'`,
        },
        { status: 404 }
      );
    }

    // 5. Build Partial Update Payload
    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    // 5a. Name
    if (body.name !== undefined) {
      if (typeof body.name !== "string" || !body.name.trim()) {
        return NextResponse.json(
          {
            success: false,
            message: "Validation failed",
            error: "'name' must be a non-empty string",
          },
          { status: 400 }
        );
      }
      updatePayload.name = body.name.trim();
    }

    // 5b. Regular Price
    let effectivePrice = existingTour.price;
    if (body.price !== undefined) {
      if (isNaN(Number(body.price)) || Number(body.price) < 0) {
        return NextResponse.json(
          {
            success: false,
            message: "Validation failed",
            error: "'price' must be a non-negative number",
          },
          { status: 400 }
        );
      }
      effectivePrice = parseFloat(Number(body.price).toFixed(2));
      updatePayload.price = effectivePrice;
    }

    // 5c. Discounted Price (accepts discounted_price or discount_price)
    const rawDiscount =
      body.discounted_price !== undefined ? body.discounted_price : body.discount_price;
    if (rawDiscount !== undefined) {
      if (rawDiscount === null || rawDiscount === "") {
        updatePayload.discounted_price = null;
      } else {
        if (isNaN(Number(rawDiscount)) || Number(rawDiscount) < 0) {
          return NextResponse.json(
            {
              success: false,
              message: "Validation failed",
              error: "'discounted_price' must be a non-negative number or null",
            },
            { status: 400 }
          );
        }
        const numericDiscount = parseFloat(Number(rawDiscount).toFixed(2));
        if (numericDiscount > effectivePrice) {
          return NextResponse.json(
            {
              success: false,
              message: "Validation failed",
              error: "'discounted_price' cannot be greater than 'price'",
            },
            { status: 400 }
          );
        }
        updatePayload.discounted_price = numericDiscount;
      }
    }

    // 5d. Slug
    if (body.slug !== undefined) {
      if (typeof body.slug !== "string" || !body.slug.trim()) {
        return NextResponse.json(
          {
            success: false,
            message: "Validation failed",
            error: "'slug' must be a non-empty string",
          },
          { status: 400 }
        );
      }
      const cleanSlug = slugify(body.slug);
      if (cleanSlug !== existingTour.slug) {
        // Check uniqueness excluding current tour
        const { data: duplicateTour } = await client
          .from("tours")
          .select("id")
          .eq("slug", cleanSlug)
          .neq("id", tourId)
          .maybeSingle();

        if (duplicateTour) {
          return NextResponse.json(
            {
              success: false,
              message: "Duplicate slug",
              error: `A tour with the slug '${cleanSlug}' already exists. Please choose a unique slug.`,
            },
            { status: 409 }
          );
        }
        updatePayload.slug = cleanSlug;
      }
    }

    // 5e. Duration
    if (body.days !== undefined) {
      const days = parseInt(String(body.days), 10);
      if (isNaN(days) || days < 1) {
        return NextResponse.json(
          {
            success: false,
            message: "Validation failed",
            error: "'days' must be an integer greater than or equal to 1",
          },
          { status: 400 }
        );
      }
      updatePayload.days = days;
    }

    if (body.nights !== undefined) {
      const nights = parseInt(String(body.nights), 10);
      if (isNaN(nights) || nights < 0) {
        return NextResponse.json(
          {
            success: false,
            message: "Validation failed",
            error: "'nights' must be an integer greater than or equal to 0",
          },
          { status: 400 }
        );
      }
      updatePayload.nights = nights;
    }

    // 5f. Travellers limits
    const effectiveMin =
      body.min_travellers !== undefined
        ? parseInt(String(body.min_travellers), 10)
        : existingTour.min_travellers || 1;
    const effectiveMax =
      body.max_travellers !== undefined
        ? parseInt(String(body.max_travellers), 10)
        : existingTour.max_travellers || 15;

    if (body.min_travellers !== undefined) {
      if (isNaN(effectiveMin) || effectiveMin < 1) {
        return NextResponse.json(
          {
            success: false,
            message: "Validation failed",
            error: "'min_travellers' must be an integer of at least 1",
          },
          { status: 400 }
        );
      }
      updatePayload.min_travellers = effectiveMin;
    }

    if (body.max_travellers !== undefined) {
      if (isNaN(effectiveMax) || effectiveMax < effectiveMin) {
        return NextResponse.json(
          {
            success: false,
            message: "Validation failed",
            error: "'max_travellers' must be an integer greater than or equal to 'min_travellers'",
          },
          { status: 400 }
        );
      }
      updatePayload.max_travellers = effectiveMax;
    }

    if (body.available_seats !== undefined) {
      const seats = parseInt(String(body.available_seats), 10);
      if (isNaN(seats) || seats < 0) {
        return NextResponse.json(
          {
            success: false,
            message: "Validation failed",
            error: "'available_seats' must be a non-negative integer",
          },
          { status: 400 }
        );
      }
      updatePayload.available_seats = seats;
    }

    // 5g. Status
    if (body.status !== undefined) {
      const validStatuses = ["published", "draft"];
      const s = String(body.status).toLowerCase();
      if (!validStatuses.includes(s)) {
        return NextResponse.json(
          {
            success: false,
            message: "Validation failed",
            error: "'status' must be either 'published' or 'draft'",
          },
          { status: 400 }
        );
      }
      updatePayload.status = s;
    }

    // 5h. Destination ID
    if (body.destination_id !== undefined) {
      if (body.destination_id === null || body.destination_id === "") {
        updatePayload.destination_id = null;
      } else {
        if (!isValidUUID(body.destination_id)) {
          return NextResponse.json(
            {
              success: false,
              message: "Validation failed",
              error: "'destination_id' must be a valid UUID",
            },
            { status: 400 }
          );
        }
        const { data: destData, error: destError } = await client
          .from("destinations")
          .select("id, name, state")
          .eq("id", body.destination_id)
          .maybeSingle();

        if (destError || !destData) {
          return NextResponse.json(
            {
              success: false,
              message: "Validation failed",
              error: `Destination with ID '${body.destination_id}' was not found`,
            },
            { status: 400 }
          );
        }
        updatePayload.destination_id = destData.id;
        if (body.state === undefined && destData.state) {
          updatePayload.state = destData.state;
        }
      }
    }

    // 5i. Dates
    if (body.start_date !== undefined) {
      if (body.start_date === null || body.start_date === "") {
        updatePayload.start_date = null;
      } else {
        if (!isValidDateString(body.start_date)) {
          return NextResponse.json(
            {
              success: false,
              message: "Validation failed",
              error: "'start_date' must be a valid date string (e.g. YYYY-MM-DD)",
            },
            { status: 400 }
          );
        }
        updatePayload.start_date = String(body.start_date).split("T")[0];
      }
    }

    if (body.end_date !== undefined) {
      if (body.end_date === null || body.end_date === "") {
        updatePayload.end_date = null;
      } else {
        if (!isValidDateString(body.end_date)) {
          return NextResponse.json(
            {
              success: false,
              message: "Validation failed",
              error: "'end_date' must be a valid date string (e.g. YYYY-MM-DD)",
            },
            { status: 400 }
          );
        }
        updatePayload.end_date = String(body.end_date).split("T")[0];
      }
    }

    // Cross-validate dates
    const effectiveStart = updatePayload.start_date ?? existingTour.start_date;
    const effectiveEnd = updatePayload.end_date ?? existingTour.end_date;
    if (effectiveStart && effectiveEnd && new Date(effectiveEnd as string) < new Date(effectiveStart as string)) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          error: "'end_date' cannot be earlier than 'start_date'",
        },
        { status: 400 }
      );
    }

    // 5j. Array fields
    const arrayFields = [
      "gallery_images",
      "highlights",
      "itinerary",
      "inclusions",
      "exclusions",
    ] as const;

    for (const field of arrayFields) {
      if (body[field] !== undefined) {
        if (!Array.isArray(body[field])) {
          return NextResponse.json(
            {
              success: false,
              message: "Validation failed",
              error: `'${field}' must be an array`,
            },
            { status: 400 }
          );
        }
        updatePayload[field] = body[field];
      }
    }

    // 5k. Other text / boolean fields
    const directStringFields = [
      "short_description",
      "description",
      "state",
      "category",
      "tour_type",
      "cover_image",
      "tour_availability",
      "pickup_location",
      "drop_location",
      "cancellation_policy",
      "payment_terms",
      "terms",
      "important_notes",
      "meta_title",
      "meta_description",
      "meta_keywords",
    ] as const;

    for (const field of directStringFields) {
      if (body[field] !== undefined) {
        updatePayload[field] =
          body[field] === null ? null : String(body[field]).trim();
      }
    }

    if (body.featured !== undefined) {
      updatePayload.featured = Boolean(body.featured);
    }

    // 6. Execute update on public.tours
    const { data: updatedTour, error: updateError } = await client
      .from("tours")
      .update(updatePayload)
      .eq("id", tourId)
      .select("*, destination:destinations(id, name, slug, state)")
      .single();

    if (updateError) {
      const isUniqueViolation = updateError.code === "23505";
      return NextResponse.json(
        {
          success: false,
          message: isUniqueViolation ? "Duplicate record" : "Failed to update tour",
          error: updateError.message,
        },
        { status: isUniqueViolation ? 409 : 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Tour updated successfully",
      data: updatedTour,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: message,
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/tours/[id]
 * Delete a tour using its UUID.
 * Verifies existence first, safely checks related booking records.
 * Requires admin authentication and authorization.
 */
export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    // 1. Extract and Console.log Bearer Token for Debugging/Verification
    const authHeader =
      request.headers.get("authorization") || request.headers.get("Authorization");
    const bearerToken =
      authHeader && authHeader.toLowerCase().startsWith("bearer ")
        ? authHeader.substring(7).trim()
        : null;

    console.log("Bearer token:", bearerToken);

    // 2. Validate UUID format
    if (!id || !isValidUUID(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid tour ID format",
          error: `The provided tour ID '${id}' is not a valid UUID`,
        },
        { status: 400 }
      );
    }

    // 2. Verify Admin Authentication and Authorization
    const authResult = await verifyAdminAuth(request);
    if (!authResult.isAdmin) {
      return NextResponse.json(
        {
          success: false,
          message:
            authResult.statusCode === 403 ? "Forbidden" : "Authentication required",
          error: authResult.error || "Administrator privileges required",
        },
        { status: authResult.statusCode || 401 }
      );
    }

    const { client } = getSupabaseApiClient();
    if (!client) {
      return NextResponse.json(
        {
          success: false,
          message: "Database connection failed",
          error: "Supabase client not initialized",
        },
        { status: 500 }
      );
    }

    const tourId = id.trim();

    // 3. Verify record exists first
    const { data: existingTour, error: checkError } = await client
      .from("tours")
      .select("id, name, slug")
      .eq("id", tourId)
      .maybeSingle();

    if (checkError) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to verify tour",
          error: checkError.message,
        },
        { status: 500 }
      );
    }

    if (!existingTour) {
      return NextResponse.json(
        {
          success: false,
          message: "Tour not found",
          error: `No tour exists with the provided ID '${tourId}'`,
        },
        { status: 404 }
      );
    }

    // 4. Safely check foreign-key constraints & related booking records
    const { count: bookingCount, error: bookingCheckError } = await client
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("tour_id", tourId);

    if (bookingCheckError) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to check booking constraints",
          error: bookingCheckError.message,
        },
        { status: 500 }
      );
    }

    if (bookingCount && bookingCount > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Cannot delete tour",
          error: `This tour package has ${bookingCount} existing booking record(s). Cannot delete a tour with associated customer bookings without an explicit business rule.`,
        },
        { status: 409 }
      );
    }

    // 5. Execute deletion
    const { error: deleteError } = await client
      .from("tours")
      .delete()
      .eq("id", tourId);

    if (deleteError) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to delete tour",
          error: deleteError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Tour deleted successfully",
      data: {
        id: existingTour.id,
        name: existingTour.name,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: message,
      },
      { status: 500 }
    );
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

