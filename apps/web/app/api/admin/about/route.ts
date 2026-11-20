import { NextResponse } from "next/server";
import { verifyAdminAuth } from "@/lib/supabase/auth-guard";
import { getAboutContent, saveAboutContent } from "@/lib/about-service";

export async function GET(request: Request) {
  try {
    const auth = await verifyAdminAuth(request);
    if (!auth.isAdmin) {
      return NextResponse.json(
        { success: false, error: auth.error || "Forbidden: Administrator access required" },
        { status: auth.statusCode || 403 }
      );
    }

    const data = await getAboutContent();
    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await verifyAdminAuth(request);
    if (!auth.isAdmin) {
      return NextResponse.json(
        { success: false, error: auth.error || "Forbidden: Administrator access required" },
        { status: auth.statusCode || 403 }
      );
    }

    const body = await request.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid request payload" },
        { status: 400 }
      );
    }

    const updated = await saveAboutContent(body);
    return NextResponse.json({
      success: true,
      message: "About page content saved successfully",
      data: updated,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

