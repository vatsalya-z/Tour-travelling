import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";

/**
 * POST /api/upload
 * Handles file uploads (covers, galleries) server-side using the admin client.
 * Bypasses browser storage RLS policies and guarantees public CDN image URLs.
 */
export async function POST(request: Request) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        {
          success: false,
          message: "Storage configuration missing",
          error: "Supabase credentials are not configured in environment (.env.local)",
        },
        { status: 500 }
      );
    }

    const adminClient = createAdminClient();
    if (!adminClient) {
      return NextResponse.json(
        {
          success: false,
          message: "Admin storage unavailable",
          error: "Supabase service role client could not be initialized",
        },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "tours";

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          error: "No file was provided in form data ('file' field required)",
        },
        { status: 400 }
      );
    }

    // Ensure 'tour-images' bucket exists
    const { data: buckets } = await adminClient.storage.listBuckets();
    const bucketExists = buckets?.some((b) => b.name === "tour-images");
    if (!bucketExists) {
      await adminClient.storage.createBucket("tour-images", {
        public: true,
        fileSizeLimit: 10485760, // 10MB
      });
    }

    const cleanFileName = file.name
      .replace(/[^\w\.-]/gi, "")
      .replace(/\s+/g, "-");
    const filePath = `${folder}/${Date.now()}-${cleanFileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data, error } = await adminClient.storage
      .from("tour-images")
      .upload(filePath, buffer, {
        contentType: file.type || "image/jpeg",
        cacheControl: "3600",
        upsert: true,
      });

    if (error) {
      console.error("[Upload API] Storage upload error:", error.message);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to upload image to storage",
          error: error.message,
        },
        { status: 500 }
      );
    }

    const { data: publicData } = adminClient.storage
      .from("tour-images")
      .getPublicUrl(data.path);

    console.log(`[Upload API] Image uploaded successfully to: ${publicData.publicUrl}`);

    return NextResponse.json(
      {
        success: true,
        message: "Image uploaded successfully",
        url: publicData.publicUrl,
        path: data.path,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("[Upload API] Exception:", message);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error during upload",
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
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

