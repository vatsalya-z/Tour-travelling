import fs from "fs";
import path from "path";
import sharp from "sharp";

const IMAGES = [
  {
    name: "odisha-golden-triangle-cover",
    url: "https://upload.wikimedia.org/wikipedia/commons/e/e9/Konark_Wheel_in_Konark_Temple.jpg",
    destinations: ["packages"],
  },
  {
    name: "odisha-art-craft-cover",
    url: "https://upload.wikimedia.org/wikipedia/commons/3/35/Pattachitra_Painting_%2817042370365%29.jpg",
    destinations: ["packages"],
  },
  {
    name: "odisha-textile-cover",
    url: "https://upload.wikimedia.org/wikipedia/commons/6/67/Sambalpuri_saree.jpg",
    destinations: ["packages"],
  },
  {
    name: "odisha-tribal-cover",
    url: "https://upload.wikimedia.org/wikipedia/commons/b/b9/Deomali_by_Santanu_Mahapatra%2C_Koraput_-_panoramio.jpg",
    destinations: ["packages"],
  },
  {
    name: "odisha-wildlife-cover",
    url: "https://upload.wikimedia.org/wikipedia/commons/5/50/Mangalajodi_Sunset_%2819835295319%29.jpg",
    destinations: ["packages"],
  },
  {
    name: "odisha-grand-heritage-cover",
    url: "https://upload.wikimedia.org/wikipedia/commons/1/1d/PXL_20250609_064243183_Siddheswara_Temple_and_Mukteswara_Temple_Bhubaneswar%2C_Odisha_16.jpg",
    destinations: ["packages"],
  },
  {
    name: "odisha-konark-wheel",
    url: "https://upload.wikimedia.org/wikipedia/commons/1/16/Wheel_engraved_in_the_13th_century_built_Konark_Sun_Temple_in_Orissa%2C_India.jpg",
    destinations: ["packages"],
  },
  {
    name: "odisha-temples-heritage",
    url: "https://upload.wikimedia.org/wikipedia/commons/7/7e/PXL_20250609_064243183_Siddheswara_Temple_and_Mukteswara_Temple_Bhubaneswar%2C_Odisha_18.jpg",
    destinations: ["packages"],
  },
  {
    name: "odisha-pattachitra-art",
    url: "https://upload.wikimedia.org/wikipedia/commons/3/3a/Pattachitra_Painting_%2817041543331%29.jpg",
    destinations: ["packages"],
  },
  {
    name: "odisha-pipili-applique",
    url: "https://upload.wikimedia.org/wikipedia/commons/3/3c/%E0%A4%9A%E0%A4%82%E0%A4%A6%E0%A5%81%E0%A4%86_%E0%A4%B2%E0%A4%BE%E0%A4%B2%E0%A4%9F%E0%A5%87%E0%A4%A8%2C_%E0%A4%95%E0%A4%B2%E0%A4%BE_%E0%A4%AD%E0%A5%82%E0%A4%AE%E0%A4%BF_%E0%A4%93%E0%A4%A1%E0%A4%BF%E0%A4%B6%E0%A4%BE_%E0%A4%B6%E0%A4%BF%E0%A4%B2%E0%A5%8D%E0%A4%AA_%E0%A4%B8%E0%A4%82%E0%A4%97%E0%A5%8D%E0%A4%B0%E0%A4%B9%E0%A4%BE%E0%A4%B2%E0%A4%AF.jpg",
    destinations: ["packages"],
  },
  {
    name: "odisha-dhokra-craft",
    url: "https://upload.wikimedia.org/wikipedia/commons/2/24/Metalcrafts.jpg",
    destinations: ["packages"],
  },
  {
    name: "odisha-sambalpuri-ikat",
    url: "https://upload.wikimedia.org/wikipedia/commons/5/5b/Sambalpuri_saree1.jpg",
    destinations: ["packages"],
  },
  {
    name: "odisha-sambalpuri-pallu",
    url: "https://upload.wikimedia.org/wikipedia/commons/1/15/Sambalpuri_saree_pallu.jpg",
    destinations: ["packages"],
  },
  {
    name: "odisha-deomali-hills",
    url: "https://upload.wikimedia.org/wikipedia/commons/b/b9/Deomali_by_Santanu_Mahapatra%2C_Koraput_-_panoramio.jpg",
    destinations: ["packages"],
  },
  {
    name: "odisha-tribal-motifs",
    url: "https://upload.wikimedia.org/wikipedia/commons/2/27/Geometric_motif_on_a_wall_in_Tribal_Museum%2C_Koraput%2C_Odisha%2C_India.jpg",
    destinations: ["packages"],
  },
  {
    name: "odisha-mangalajodi-wetland",
    url: "https://upload.wikimedia.org/wikipedia/commons/5/51/Mangalajodi_View_%2819834389150%29.jpg",
    destinations: ["packages"],
  },
  {
    name: "odisha-chilika-boats",
    url: "https://upload.wikimedia.org/wikipedia/commons/d/dd/Chilika_lake_fishing_boats.jpg",
    destinations: ["packages"],
  },
  {
    name: "odisha-bhitarkanika-mangroves",
    url: "https://upload.wikimedia.org/wikipedia/commons/c/c0/Bhitarkanika_lakeride_sunset.jpg",
    destinations: ["packages"],
  },
  {
    name: "odisha",
    url: "https://upload.wikimedia.org/wikipedia/commons/e/e9/Konark_Wheel_in_Konark_Temple.jpg",
    destinations: ["destinations"],
  },
];

const TARGET_DIRS = [
  "apps/web/public/images",
  "apps/admin/public/images",
];

async function downloadAndProcess() {
  console.log(`Starting download of ${IMAGES.length} realistic Odisha images...`);

  for (const item of IMAGES) {
    console.log(`Downloading: ${item.name} from ${item.url.slice(0, 70)}...`);
    try {
      const res = await fetch(item.url, {
        headers: {
          "User-Agent": "TourTripHolidaysBot/1.0 (contact@tourtripholidays.com)",
        },
      });

      if (!res.ok) {
        console.error(`Failed to download ${item.name}: status ${res.status}`);
        continue;
      }

      const rawBuffer = Buffer.from(await res.arrayBuffer());

      // Generate optimized WebP
      const webpBuffer = await sharp(rawBuffer)
        .resize(1200, 800, { fit: "cover", position: "center" })
        .webp({ quality: 85 })
        .toBuffer();

      // Generate optimized JPG
      const jpgBuffer = await sharp(rawBuffer)
        .resize(1200, 800, { fit: "cover", position: "center" })
        .jpeg({ quality: 85, mozjpeg: true })
        .toBuffer();

      for (const baseDir of TARGET_DIRS) {
        for (const destSub of item.destinations) {
          const folder = path.join(process.cwd(), baseDir, destSub);
          if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder, { recursive: true });
          }

          const webpPath = path.join(folder, `${item.name}.webp`);
          const jpgPath = path.join(folder, `${item.name}.jpg`);

          fs.writeFileSync(webpPath, webpBuffer);
          fs.writeFileSync(jpgPath, jpgBuffer);
        }
      }

      console.log(`  ✓ Saved ${item.name}.webp (${Math.round(webpBuffer.length / 1024)} KB) and .jpg (${Math.round(jpgBuffer.length / 1024)} KB)`);
    } catch (err) {
      console.error(`  ✗ Error processing ${item.name}:`, err.message);
    }
  }

  console.log("Image processing complete!");
}

downloadAndProcess();
