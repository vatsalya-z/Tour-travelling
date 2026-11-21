import { Tour } from "@/types/tour";
import { DEFAULT_TOURS } from "./tour-default-data";
import { getSupabaseApiClient } from "./supabase/api";

/**
 * Normalizes a tour object from database or default data
 */
function normalizeTour(raw: any): Tour {
  return {
    ...raw,
    gallery_images: Array.isArray(raw.gallery_images) ? raw.gallery_images : [],
    highlights: Array.isArray(raw.highlights) ? raw.highlights : [],
    itinerary: Array.isArray(raw.itinerary) ? raw.itinerary : [],
    inclusions: Array.isArray(raw.inclusions) ? raw.inclusions : [],
    exclusions: Array.isArray(raw.exclusions) ? raw.exclusions : [],
    faqs: Array.isArray(raw.faqs) ? raw.faqs : [],
    destination: raw.destination || (raw.destinations ? raw.destinations : undefined),
  };
}

/**
 * Fetch a single tour by unique slug.
 * Strictly enforces published status (unpublished/draft tours return null -> 404).
 */
export async function getTourBySlug(slug: string): Promise<Tour | null> {
  if (!slug || typeof slug !== "string") return null;
  const cleanSlug = slug.trim().toLowerCase();

  try {
    const { client } = getSupabaseApiClient();

    if (client) {
      const { data, error } = await client
        .from("tours")
        .select("*, destination:destinations(*)")
        .eq("slug", cleanSlug)
        .eq("status", "published")
        .maybeSingle();

      if (!error && data) {
        return normalizeTour(data);
      }
    }
  } catch (err) {
    console.warn("Could not fetch tour from Supabase, checking default data:", err);
  }

  // Fallback to local default data (if Supabase is unreachable or unconfigured)
  const fallback = DEFAULT_TOURS.find(
    (t) => t.slug.toLowerCase() === cleanSlug && t.status === "published"
  );

  return fallback ? normalizeTour(fallback) : null;
}

/**
 * Fetch related published tours for a given tour.
 * Prioritizes tours from the same destination (destination_id or state),
 * then fills with other published tours up to the requested limit.
 * Excludes the current tour itself.
 */
export async function getRelatedTours(currentTour: Tour, limit: number = 3): Promise<Tour[]> {
  const currentId = currentTour.id;
  const destinationId = currentTour.destination_id;
  const state = currentTour.state;

  try {
    const { client } = getSupabaseApiClient();

    if (client) {
      // 1. Fetch from same destination
      let query = client
        .from("tours")
        .select("*, destination:destinations(id, name, slug, state)")
        .eq("status", "published")
        .neq("id", currentId)
        .limit(limit);

      if (destinationId) {
        query = query.eq("destination_id", destinationId);
      } else if (state) {
        query = query.ilike("state", `%${state}%`);
      }

      const { data: sameDestTours } = await query;
      const list = (sameDestTours || []).map(normalizeTour);

      // If we have enough, return them
      if (list.length >= limit) {
        return list.slice(0, limit);
      }

      // 2. Fetch other published tours to fill up to limit
      const existingIds = new Set(list.map((t) => t.id));
      existingIds.add(currentId);

      const { data: otherTours } = await client
        .from("tours")
        .select("*, destination:destinations(id, name, slug, state)")
        .eq("status", "published")
        .limit(limit * 2);

      const others = (otherTours || [])
        .map(normalizeTour)
        .filter((t) => !existingIds.has(t.id));

      return [...list, ...others].slice(0, limit);
    }
  } catch (err) {
    console.warn("Could not fetch related tours from Supabase, using default data:", err);
  }

  // Fallback from DEFAULT_TOURS
  const publishedDefaults = DEFAULT_TOURS.filter(
    (t) => t.id !== currentId && t.status === "published"
  ).map(normalizeTour);

  const sameDest = publishedDefaults.filter(
    (t) =>
      (destinationId && t.destination_id === destinationId) ||
      (state && t.state?.toLowerCase() === state.toLowerCase())
  );

  if (sameDest.length >= limit) {
    return sameDest.slice(0, limit);
  }

  const otherDefaults = publishedDefaults.filter((t) => !sameDest.some((s) => s.id === t.id));
  return [...sameDest, ...otherDefaults].slice(0, limit);
}

/**
 * Get all published tour slugs for sitemap generation.
 */
export async function getAllPublishedTourSlugs(): Promise<string[]> {
  try {
    const { client } = getSupabaseApiClient();

    if (client) {
      const { data, error } = await client
        .from("tours")
        .select("slug")
        .eq("status", "published");

      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map((d) => d.slug).filter(Boolean);
      }
    }
  } catch (err) {
    console.warn("Could not fetch published tour slugs from Supabase:", err);
  }

  return DEFAULT_TOURS.filter((t) => t.status === "published").map((t) => t.slug);
}

/**
 * Returns exactly four distinct images for a package gallery.
 * 1. Main cover image
 * 2. Destination cover or first gallery image
 * 3. Itinerary day image or second gallery image
 * 4. Experience/sightseeing image
 * Avoids duplicates; uses clean fallback images if fewer than 4 are provided.
 */
export function getPackageFourImages(tour: Tour): string[] {
  const images: string[] = [];
  const seen = new Set<string>();

  const add = (url?: string | null) => {
    if (!url || typeof url !== "string") return;
    const clean = url.trim();
    if (!clean || seen.has(clean)) return;
    seen.add(clean);
    images.push(clean);
  };

  // 1. Main cover
  add(tour.cover_image);

  // 2. Destination cover image
  add(tour.destination?.cover_image);

  // 3. Gallery images
  if (Array.isArray(tour.gallery_images)) {
    for (const g of tour.gallery_images) {
      if (images.length >= 4) break;
      add(g);
    }
  }

  // 4. Itinerary day images
  if (images.length < 4 && Array.isArray(tour.itinerary)) {
    for (const day of tour.itinerary) {
      if (images.length >= 4) break;
      if (day.image) add(day.image);
    }
  }

  // 5. Fallback pool if still fewer than 4 images
  const fallbackPool = [
    "/images/packages/kashmir-dal-lake-winter.webp",
    "/images/packages/kashmir-gulmarg-gondola-snow.webp",
    "/images/packages/kashmir-sonamarg-glacier-winter.webp",
    "/images/packages/kashmir-pahalgam-valley-winter.webp",
    "/images/packages/kashmir-houseboat-winter.webp",
    "/images/packages/himachal.jpg",
    "/images/packages/kerala.jpg",
    "/images/packages/rajasthan.jpg",
    "/images/packages/goa.jpg",
  ];

  for (const fb of fallbackPool) {
    if (images.length >= 4) break;
    add(fb);
  }

  return images.slice(0, 4);
}
