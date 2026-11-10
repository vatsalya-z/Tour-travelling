import { NextResponse } from "next/server";
import { getSupabaseApiClient } from "@/lib/supabase/api";
import { verifyAdminAuth, getRequesterAuth } from "@/lib/supabase/auth-guard";
import { slugify } from "@/lib/utils";

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
 * GET /api/tours
 * Fetch all tours from existing Supabase public.tours table.
 * Supports filtering, searching, sorting, and pagination.
 * Respects public visibility rules: public callers can ONLY view 'published' tours.
 */
export async function GET(request: Request) {
  try {
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

    const { searchParams } = new URL(request.url);
    const destination_id = searchParams.get("destination_id");
    const state = searchParams.get("state");
    const category = searchParams.get("category");
    const statusParam = searchParams.get("status");
    const featured = searchParams.get("featured");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "newest";

    // Pagination parameters
    const pageParam = parseInt(searchParams.get("page") || "1", 10);
    const page = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
    const limitParam = parseInt(searchParams.get("limit") || "20", 10);
    const limit = isNaN(limitParam) ? 20 : Math.min(Math.max(limitParam, 1), 100);
    const offset = (page - 1) * limit;

    // Determine requester privileges
    const requesterAuth = await getRequesterAuth(request);

    let query = client
      .from("tours")
      .select("*, destination:destinations(id, name, slug, state)", {
        count: "exact",
      });

    // Public visibility enforcement:
    // If requester is NOT an admin, only published tours can be returned.
    if (!requesterAuth.isAdmin) {
      query = query.eq("status", "published");
    } else if (statusParam && statusParam !== "all") {
      const validStatuses = ["published", "draft"];
      if (validStatuses.includes(statusParam.toLowerCase())) {
        query = query.eq("status", statusParam.toLowerCase());
      }
    }

    // Filter by destination_id
    if (destination_id) {
      if (!isValidUUID(destination_id)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid query parameter",
            error: "destination_id must be a valid UUID",
          },
          { status: 400 }
        );
      }
      query = query.eq("destination_id", destination_id);
    }

    // Filter by state
    if (state) {
      query = query.ilike("state", `%${state.trim()}%`);
    }

    // Filter by category
    if (category) {
      query = query.ilike("category", `%${category.trim()}%`);
    }

    // Filter by featured
    if (featured !== null && featured !== undefined && featured !== "") {
      query = query.eq("featured", featured === "true" || featured === "1");
    }

    // Search filter across name, state, and category
    if (search && search.trim()) {
      const q = search.trim();
      query = query.or(`name.ilike.%${q}%,state.ilike.%${q}%,category.ilike.%${q}%`);
    }

    // Sorting
    switch (sortBy) {
      case "price-asc":
        query = query.order("price", { ascending: true });
        break;
      case "price-desc":
        query = query.order("price", { ascending: false });
        break;
      case "name-asc":
      case "name":
        query = query.order("name", { ascending: true });
        break;
      case "name-desc":
        query = query.order("name", { ascending: false });
        break;
      case "duration-asc":
        query = query.order("days", { ascending: true });
        break;
      case "duration-desc":
        query = query.order("days", { ascending: false });
        break;
      case "oldest":
        query = query.order("created_at", { ascending: true });
        break;
      case "newest":
      default:
        query = query
          .order("featured", { ascending: false })
          .order("created_at", { ascending: false });
        break;
    }

    // Apply pagination range
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;

    if (error) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to fetch tours",
          error: error.message,
        },
        { status: 500 }
      );
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit) || 1;

    return NextResponse.json({
      success: true,
      message: "Tours retrieved successfully",
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
 * POST /api/tours
 * Creates a new tour package in public.tours table.
 * ONLY authenticated administrators can create tours.
 */
export async function POST(request: Request) {
  try {
    // 1. Extract and Console.log Bearer Token for Debugging/Verification
    const authHeader =
      request.headers.get("authorization") || request.headers.get("Authorization");
    const bearerToken =
      authHeader && authHeader.toLowerCase().startsWith("bearer ")
        ? authHeader.substring(7).trim()
        : null;

    console.log("Bearer token:", bearerToken);

    // 2. Strict Admin Authentication & Authorization Verification
    const authResult = await verifyAdminAuth(request);
    if (!authResult.isAdmin) {
      console.warn("[POST /api/tours] Access Denied: Caller is not an admin", {
        isAuthenticated: authResult.isAuthenticated,
        userId: authResult.userId,
        error: authResult.error,
      });

      return NextResponse.json(
        {
          success: false,
          message:
            authResult.statusCode === 403
              ? "Forbidden: Only administrators can create tours"
              : "Authentication required",
          error:
            authResult.error ||
            "Only administrators can create tours. Please provide a valid admin Bearer token.",
        },
        { status: authResult.statusCode || 401 }
      );
    }

    // 3. Parse Request Body
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

    const {
      name,
      slug,
      short_description,
      description,
      destination_id,
      state,
      category = "Family",
      tour_type = "Customized Tour",
      cover_image,
      gallery_images = [],
      price,
      discounted_price,
      discount_price, // Alias supported
      days = 1,
      nights = 0,
      max_travellers = 15,
      min_travellers = 1,
      available_seats = 20,
      start_date,
      end_date,
      tour_availability = "All Year Round",
      highlights = [],
      itinerary = [],
      inclusions = [],
      exclusions = [],
      pickup_location,
      drop_location,
      cancellation_policy,
      payment_terms,
      terms,
      important_notes,
      meta_title,
      meta_description,
      meta_keywords,
      featured = false,
      status = "published",
    } = body;

    // 4. Strict Field Validations
    // 4a. Name
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          error: "'name' is required and must be a non-empty string",
        },
        { status: 400 }
      );
    }

    // 4b. Price
    if (price === undefined || price === null || isNaN(Number(price)) || Number(price) < 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          error: "'price' is required and must be a non-negative number",
        },
        { status: 400 }
      );
    }
    const numericPrice = parseFloat(Number(price).toFixed(2));

    // 4c. Discounted Price
    const rawDiscount = discounted_price !== undefined ? discounted_price : discount_price;
    let numericDiscount: number | null = null;
    if (rawDiscount !== undefined && rawDiscount !== null && rawDiscount !== "") {
      if (isNaN(Number(rawDiscount)) || Number(rawDiscount) < 0) {
        return NextResponse.json(
          {
            success: false,
            message: "Validation failed",
            error: "'discounted_price' must be a non-negative number",
          },
          { status: 400 }
        );
      }
      numericDiscount = parseFloat(Number(rawDiscount).toFixed(2));
      if (numericDiscount > numericPrice) {
        return NextResponse.json(
          {
            success: false,
            message: "Validation failed",
            error: "'discounted_price' cannot be greater than regular 'price'",
          },
          { status: 400 }
        );
      }
    }

    // 4d. Duration
    const numericDays = parseInt(String(days), 10);
    if (isNaN(numericDays) || numericDays < 1) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          error: "'days' must be an integer greater than or equal to 1",
        },
        { status: 400 }
      );
    }

    const numericNights = parseInt(String(nights), 10);
    if (isNaN(numericNights) || numericNights < 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          error: "'nights' must be an integer greater than or equal to 0",
        },
        { status: 400 }
      );
    }

    // 4e. Travellers limits & seats
    const numericMinTravellers = parseInt(String(min_travellers), 10);
    const numericMaxTravellers = parseInt(String(max_travellers), 10);
    if (isNaN(numericMinTravellers) || numericMinTravellers < 1) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          error: "'min_travellers' must be an integer of at least 1",
        },
        { status: 400 }
      );
    }
    if (isNaN(numericMaxTravellers) || numericMaxTravellers < numericMinTravellers) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          error: "'max_travellers' must be an integer greater than or equal to 'min_travellers'",
        },
        { status: 400 }
      );
    }

    const numericSeats = parseInt(String(available_seats), 10);
    if (isNaN(numericSeats) || numericSeats < 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          error: "'available_seats' must be a non-negative integer",
        },
        { status: 400 }
      );
    }

    // 4f. Status
    const validStatuses = ["published", "draft"];
    if (status && !validStatuses.includes(String(status).toLowerCase())) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          error: "'status' must be either 'published' or 'draft'",
        },
        { status: 400 }
      );
    }
    const cleanStatus = (status ? String(status).toLowerCase() : "published") as
      | "published"
      | "draft";

    // 4g. Dates
    if (start_date && !isValidDateString(start_date)) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          error: "'start_date' must be a valid date string (e.g. YYYY-MM-DD)",
        },
        { status: 400 }
      );
    }
    if (end_date && !isValidDateString(end_date)) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          error: "'end_date' must be a valid date string (e.g. YYYY-MM-DD)",
        },
        { status: 400 }
      );
    }
    if (start_date && end_date && new Date(end_date) < new Date(start_date)) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          error: "'end_date' cannot be earlier than 'start_date'",
        },
        { status: 400 }
      );
    }

    // 4h. Array types
    if (!Array.isArray(gallery_images)) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          error: "'gallery_images' must be an array of image URL strings",
        },
        { status: 400 }
      );
    }
    if (!Array.isArray(highlights)) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          error: "'highlights' must be an array of strings",
        },
        { status: 400 }
      );
    }
    if (!Array.isArray(itinerary)) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          error: "'itinerary' must be an array of day objects",
        },
        { status: 400 }
      );
    }
    if (!Array.isArray(inclusions)) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          error: "'inclusions' must be an array of strings",
        },
        { status: 400 }
      );
    }
    if (!Array.isArray(exclusions)) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          error: "'exclusions' must be an array of strings",
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

    // 4i. Destination ID verification
    let resolvedState = state ? String(state).trim() : null;
    if (destination_id) {
      if (!isValidUUID(destination_id)) {
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
        .eq("id", destination_id)
        .maybeSingle();

      if (destError || !destData) {
        return NextResponse.json(
          {
            success: false,
            message: "Validation failed",
            error: `Destination with ID '${destination_id}' was not found in database`,
          },
          { status: 400 }
        );
      }
      if (!resolvedState && destData.state) {
        resolvedState = destData.state;
      }
    }

    // 5. Slug uniqueness check & resolution
    let cleanSlug: string;
    const isCustomSlug = Boolean(slug && typeof slug === "string" && slug.trim());

    if (isCustomSlug) {
      cleanSlug = slugify(slug);
      const { data: existingSlugTour } = await client
        .from("tours")
        .select("id")
        .eq("slug", cleanSlug)
        .maybeSingle();

      if (existingSlugTour) {
        return NextResponse.json(
          {
            success: false,
            message: "Duplicate slug",
            error: `A tour with the slug '${cleanSlug}' already exists. Please choose a unique slug.`,
          },
          { status: 409 }
        );
      }
    } else {
      const baseSlug = slugify(name);
      const { data: existingBase } = await client
        .from("tours")
        .select("id")
        .eq("slug", baseSlug)
        .maybeSingle();

      if (!existingBase) {
        cleanSlug = baseSlug;
      } else {
        cleanSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;
      }
    }

    // 6. Construct payload matching exact SQL schema columns
    const tourPayload = {
      name: name.trim(),
      slug: cleanSlug,
      short_description: short_description ? String(short_description).trim() : null,
      description: description ? String(description).trim() : null,
      destination_id: destination_id || null,
      state: resolvedState,
      category: String(category).trim(),
      tour_type: String(tour_type).trim(),
      cover_image: cover_image ? String(cover_image).trim() : null,
      gallery_images,
      price: numericPrice,
      discounted_price: numericDiscount,
      days: numericDays,
      nights: numericNights,
      max_travellers: numericMaxTravellers,
      min_travellers: numericMinTravellers,
      available_seats: numericSeats,
      start_date: start_date ? String(start_date).split("T")[0] : null,
      end_date: end_date ? String(end_date).split("T")[0] : null,
      tour_availability: tour_availability ? String(tour_availability).trim() : "All Year Round",
      highlights,
      itinerary,
      inclusions,
      exclusions,
      pickup_location: pickup_location ? String(pickup_location).trim() : null,
      drop_location: drop_location ? String(drop_location).trim() : null,
      cancellation_policy: cancellation_policy ? String(cancellation_policy).trim() : null,
      payment_terms: payment_terms ? String(payment_terms).trim() : null,
      terms: terms ? String(terms).trim() : null,
      important_notes: important_notes ? String(important_notes).trim() : null,
      meta_title: meta_title ? String(meta_title).trim() : null,
      meta_description: meta_description ? String(meta_description).trim() : null,
      meta_keywords: meta_keywords ? String(meta_keywords).trim() : null,
      featured: Boolean(featured),
      status: cleanStatus,
      created_by: authResult.userId, // Authenticated admin profile ID
    };

    // 7. Insert into public.tours
    const { data: newTour, error: insertError } = await client
      .from("tours")
      .insert(tourPayload)
      .select("*, destination:destinations(id, name, slug, state)")
      .single();

    if (insertError) {
      const isUniqueViolation = insertError.code === "23505";
      return NextResponse.json(
        {
          success: false,
          message: isUniqueViolation ? "Duplicate record" : "Failed to create tour",
          error: insertError.message,
        },
        { status: isUniqueViolation ? 409 : 500 }
      );
    }

    console.log(`[POST /api/tours] Tour created successfully: '${newTour.name}' (ID: ${newTour.id})`);

    return NextResponse.json(
      {
        success: true,
        message: "Tour created successfully",
        data: newTour,
      },
      { status: 201 }
    );
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
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
