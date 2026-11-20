import { createClient } from "./client";
import { isSupabaseConfigured } from "./config";

/**
 * Uploads a tour image file.
 * Prioritizes the server-side API route (/api/upload) to avoid browser storage RLS blocks,
 * with graceful fallback to direct client-side storage.
 */
export async function uploadTourImage(
  file: File,
  folder: string = "tours"
): Promise<{ url: string | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return {
      url: URL.createObjectURL(file),
      error: null,
    };
  }

  // 1. Primary: Server-side API upload via /api/upload
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const json = await res.json();
    if (res.ok && json.success && json.url) {
      return { url: json.url, error: null };
    }

    if (json.error) {
      console.warn("[uploadTourImage] /api/upload returned error:", json.error);
    }
  } catch (apiErr) {
    console.warn("[uploadTourImage] Failed to reach /api/upload, attempting client upload fallback:", apiErr);
  }

  // 2. Fallback: Direct Client Storage Upload
  try {
    const supabase = createClient();
    const cleanFileName = file.name
      .replace(/[^\w\.-]/gi, "")
      .replace(/\s+/g, "-");
    const filePath = `${folder}/${Date.now()}-${cleanFileName}`;

    const { data, error } = await supabase.storage
      .from("tour-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) {
      return { url: null, error: error.message };
    }

    const { data: publicData } = supabase.storage
      .from("tour-images")
      .getPublicUrl(data.path);

    return { url: publicData.publicUrl, error: null };
  } catch (err: unknown) {
    return {
      url: null,
      error: err instanceof Error ? err.message : "Failed to upload image",
    };
  }
}
