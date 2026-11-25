import { createClient } from "@supabase/supabase-js";
import fs from "fs";

// Read .env manually
const envContent = fs.readFileSync(".env", "utf-8");
const env = {};
envContent.split("\n").forEach((line) => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
    const idx = trimmed.indexOf("=");
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim();
    env[key] = val;
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE credentials in environment");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const TOUR_IMAGE_UPDATES = [
  {
    slug: "odisha-golden-triangle-tour",
    cover_image: "/images/packages/odisha-golden-triangle-cover.webp",
    gallery_images: [
      "/images/packages/odisha-golden-triangle-cover.webp",
      "/images/packages/odisha-konark-wheel.webp",
      "/images/packages/odisha-temples-heritage.webp",
      "/images/packages/odisha-pipili-applique.webp",
      "/images/packages/odisha-pattachitra-art.webp",
    ],
  },
  {
    slug: "odisha-art-craft-tour",
    cover_image: "/images/packages/odisha-art-craft-cover.webp",
    gallery_images: [
      "/images/packages/odisha-art-craft-cover.webp",
      "/images/packages/odisha-pattachitra-art.webp",
      "/images/packages/odisha-pipili-applique.webp",
      "/images/packages/odisha-dhokra-craft.webp",
      "/images/packages/odisha-konark-wheel.webp",
    ],
  },
  {
    slug: "odisha-textile-tour",
    cover_image: "/images/packages/odisha-textile-cover.webp",
    gallery_images: [
      "/images/packages/odisha-textile-cover.webp",
      "/images/packages/odisha-sambalpuri-ikat.webp",
      "/images/packages/odisha-sambalpuri-pallu.webp",
      "/images/packages/odisha-pattachitra-art.webp",
    ],
  },
  {
    slug: "odisha-tribal-tour",
    cover_image: "/images/packages/odisha-tribal-cover.webp",
    gallery_images: [
      "/images/packages/odisha-tribal-cover.webp",
      "/images/packages/odisha-deomali-hills.webp",
      "/images/packages/odisha-tribal-motifs.webp",
      "/images/packages/odisha-dhokra-craft.webp",
    ],
  },
  {
    slug: "odisha-wildlife-tour",
    cover_image: "/images/packages/odisha-wildlife-cover.webp",
    gallery_images: [
      "/images/packages/odisha-wildlife-cover.webp",
      "/images/packages/odisha-mangalajodi-wetland.webp",
      "/images/packages/odisha-chilika-boats.webp",
      "/images/packages/odisha-bhitarkanika-mangroves.webp",
    ],
  },
  {
    slug: "complete-odisha-tour",
    cover_image: "/images/packages/odisha-grand-heritage-cover.webp",
    gallery_images: [
      "/images/packages/odisha-grand-heritage-cover.webp",
      "/images/packages/odisha-konark-wheel.webp",
      "/images/packages/odisha-temples-heritage.webp",
      "/images/packages/odisha-pattachitra-art.webp",
      "/images/packages/odisha-mangalajodi-wetland.webp",
      "/images/packages/odisha-sambalpuri-ikat.webp",
    ],
  },
];

async function updateTours() {
  console.log("Updating Odisha tours in Supabase database...");

  // 1. Update Destination Odisha cover image
  const { data: destData, error: destErr } = await supabase
    .from("destinations")
    .update({
      cover_image: "/images/destinations/odisha.jpg",
      gallery_images: [
        "/images/packages/odisha-golden-triangle-cover.webp",
        "/images/packages/odisha-mangalajodi-wetland.webp",
        "/images/packages/odisha-pattachitra-art.webp",
      ],
    })
    .eq("slug", "odisha")
    .select("id, name, slug, cover_image");

  if (destErr) {
    console.error("Error updating destination Odisha:", destErr.message);
  } else {
    console.log("Updated destination Odisha:", destData);
  }

  // 2. Update each of the 6 Odisha Tours
  for (const item of TOUR_IMAGE_UPDATES) {
    const { data, error } = await supabase
      .from("tours")
      .update({
        cover_image: item.cover_image,
        gallery_images: item.gallery_images,
      })
      .eq("slug", item.slug)
      .select("id, name, slug, cover_image");

    if (error) {
      console.error(`Failed to update ${item.slug}:`, error.message);
    } else {
      console.log(`✓ Updated tour ${item.slug}: cover_image = ${item.cover_image} (${item.gallery_images.length} gallery images)`);
    }
  }

  console.log("All tour image updates completed!");
}

updateTours();
