import fs from "fs";
import path from "path";
import { AboutPageContent } from "@/types/about";
import { DEFAULT_ABOUT_CONTENT } from "./about-default-data";
import { getSupabaseApiClient } from "./supabase/api";

const DATA_FILE = path.join(process.cwd(), "data", "about-content.json");

export async function getAboutContent(): Promise<AboutPageContent> {
  // 1. Try reading from local data file
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed && parsed.hero) {
        return {
          ...DEFAULT_ABOUT_CONTENT,
          ...parsed,
          hero: { ...DEFAULT_ABOUT_CONTENT.hero, ...parsed.hero },
          who_we_are: { ...DEFAULT_ABOUT_CONTENT.who_we_are, ...parsed.who_we_are },
          mission_vision: { ...DEFAULT_ABOUT_CONTENT.mission_vision, ...parsed.mission_vision },
          why_choose_us: { ...DEFAULT_ABOUT_CONTENT.why_choose_us, ...parsed.why_choose_us },
          explore_india: { ...DEFAULT_ABOUT_CONTENT.explore_india, ...parsed.explore_india },
          travel_approach: { ...DEFAULT_ABOUT_CONTENT.travel_approach, ...parsed.travel_approach },
          faqs: { ...DEFAULT_ABOUT_CONTENT.faqs, ...parsed.faqs },
          cta: { ...DEFAULT_ABOUT_CONTENT.cta, ...parsed.cta },
        };
      }
    }
  } catch (err) {
    console.warn("[getAboutContent] Error reading local data file:", err);
  }

  // 2. Try Supabase site_settings table if configured
  try {
    const { client } = getSupabaseApiClient();
    if (client) {
      const { data, error } = await client
        .from("site_settings")
        .select("value")
        .eq("key", "about_page_content")
        .maybeSingle();

      if (!error && data?.value && data.value.hero) {
        return {
          ...DEFAULT_ABOUT_CONTENT,
          ...data.value,
        };
      }
    }
  } catch (err) {
    // Supabase query failed / table not present
  }

  return DEFAULT_ABOUT_CONTENT;
}

export async function saveAboutContent(content: Partial<AboutPageContent>): Promise<AboutPageContent> {
  const current = await getAboutContent();
  const updated: AboutPageContent = {
    ...current,
    ...content,
    hero: { ...current.hero, ...(content.hero || {}) },
    who_we_are: { ...current.who_we_are, ...(content.who_we_are || {}) },
    mission_vision: { ...current.mission_vision, ...(content.mission_vision || {}) },
    why_choose_us: { ...current.why_choose_us, ...(content.why_choose_us || {}) },
    explore_india: { ...current.explore_india, ...(content.explore_india || {}) },
    travel_approach: { ...current.travel_approach, ...(content.travel_approach || {}) },
    faqs: { ...current.faqs, ...(content.faqs || {}) },
    cta: { ...current.cta, ...(content.cta || {}) },
    updated_at: new Date().toISOString(),
  };

  // 1. Save to local data file
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(updated, null, 2), "utf-8");
  } catch (err) {
    console.error("[saveAboutContent] Error writing local data file:", err);
  }

  // 2. Try saving to Supabase site_settings if available
  try {
    const { client } = getSupabaseApiClient();
    if (client) {
      await client
        .from("site_settings")
        .upsert({
          key: "about_page_content",
          value: updated,
          updated_at: new Date().toISOString(),
        }, { onConflict: "key" });
    }
  } catch (err) {
    // Silently continue if Supabase table doesn't exist
  }

  return updated;
}

