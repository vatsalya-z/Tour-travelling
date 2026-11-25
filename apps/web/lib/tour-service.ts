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
 * By default strictly enforces published status.
 * Set allowDraft = true for admin previews.
 */
export async function getTourBySlug(slug: string, allowDraft: boolean = false): Promise<Tour | null> {
  if (!slug || typeof slug !== "string") return null;
  const cleanSlug = slug.trim().toLowerCase();

  try {
    const { client } = getSupabaseApiClient();

    if (client) {
      let query = client
        .from("tours")
        .select("*, destination:destinations(*)")
        .eq("slug", cleanSlug);

      if (!allowDraft) {
        query = query.eq("status", "published");
      }

      const { data, error } = await query.maybeSingle();

      if (!error && data) {
        return normalizeTour(data);
      }
    }
  } catch (err) {
    console.warn("Could not fetch tour from Supabase, checking default data:", err);
  }

  // Fallback to local default data (if Supabase is unreachable or unconfigured)
  const fallback = DEFAULT_TOURS.find((t) => {
    const matchSlug = t.slug.toLowerCase() === cleanSlug;
    return allowDraft ? matchSlug : matchSlug && t.status === "published";
  });

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
 * Returns all genuine unique images for a package.
 * Gathers from:
 * 1. Package cover_image
 * 2. Package gallery_images
 * 3. Genuine itinerary day images
 * Does not repeat images and does not use unrelated destination images.
 */
export function getPackageGenuineImages(tour: Tour): string[] {
  const images: string[] = [];
  const seen = new Set<string>();

  const add = (url?: string | null) => {
    if (!url || typeof url !== "string") return;
    const clean = url.trim();
    if (!clean || seen.has(clean)) return;
    seen.add(clean);
    images.push(clean);
  };

  // 1. Main cover image
  add(tour.cover_image);

  // 2. Package gallery images
  if (Array.isArray(tour.gallery_images)) {
    for (const g of tour.gallery_images) {
      add(g);
    }
  }

  // 3. Genuine itinerary images
  if (Array.isArray(tour.itinerary)) {
    for (const day of tour.itinerary) {
      if (day.image) add(day.image);
    }
  }

  // Fallback only if no images exist at all and tour is specifically Kashmir or Odisha
  if (images.length === 0) {
    if (tour.destination?.cover_image) {
      add(tour.destination.cover_image);
    } else if ((tour.state || "").toLowerCase().includes("kashmir") || tour.name.toLowerCase().includes("kashmir")) {
      add("/images/packages/kashmir-4n5d-cover.webp");
    } else if ((tour.state || "").toLowerCase().includes("odisha") || tour.name.toLowerCase().includes("odisha")) {
      add("/images/packages/odisha-golden-triangle-cover.webp");
    }
  }

  return images;
}

export function getPackageFourImages(tour: Tour): string[] {
  return getPackageGenuineImages(tour);
}
