import { NextResponse } from "next/server";
import { getTourBySlug } from "@/lib/tour-service";

interface RouteContext {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * GET /api/tours/slug/[slug]
 * Fetches a single published tour by its URL slug.
 * Draft or unpublished tours return 404.
 */
export async function GET(request: Request, context: RouteContext) {
  try {
    const { slug } = await context.params;

    if (!slug || typeof slug !== "string" || !slug.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid tour slug parameter",
        },
        { status: 400 }
      );
    }

    const tour = await getTourBySlug(slug.trim());

    if (!tour) {
      return NextResponse.json(
        {
          success: false,
          message: "Tour package not found",
          error: `No published tour found with slug '${slug}'`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Tour package retrieved successfully",
      data: tour,
    });
  } catch (error: any) {
    console.error("GET /api/tours/slug/[slug] error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to retrieve tour package",
        error: error.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}
