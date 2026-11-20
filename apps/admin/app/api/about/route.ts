import { NextResponse } from "next/server";
import { getAboutContent } from "@/lib/about-service";

export async function GET() {
  try {
    const data = await getAboutContent();
    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

