import fs from "fs";
import path from "path";
import sharp from "sharp";

async function main() {
  console.log("Generating realistic Odisha hero banners...");

  const baseImage = "apps/web/public/images/packages/odisha-golden-triangle-cover.jpg";
  const heritageImage = "apps/web/public/images/packages/odisha-grand-heritage-cover.jpg";
  const sunsetImage = "apps/web/public/images/packages/odisha-mangalajodi-wetland.jpg";

  if (!fs.existsSync(baseImage)) {
    console.error("Base image not found:", baseImage);
    return;
  }

  // 1. Panoramic Packages Hero Banner for Odisha (1920x800, 16:9 widescreen)
  // Sharp resize with cover and gentle contrast adjustment
  const packagesHeroWebp = "apps/web/public/images/packages/packages-hero-odisha.webp";
  const packagesHeroJpg = "apps/web/public/images/packages/packages-hero-odisha.jpg";

  await sharp(baseImage)
    .resize(1920, 800, { fit: "cover", position: "center" })
    .modulate({ brightness: 0.95, saturation: 1.1 })
    .webp({ quality: 90 })
    .toFile(packagesHeroWebp);

  await sharp(baseImage)
    .resize(1920, 800, { fit: "cover", position: "center" })
    .modulate({ brightness: 0.95, saturation: 1.1 })
    .jpeg({ quality: 90, mozjpeg: true })
    .toFile(packagesHeroJpg);

  console.log("Created packages hero odisha banner in web app");

  // Also copy to admin public
  fs.copyFileSync(packagesHeroWebp, "apps/admin/public/images/packages/packages-hero-odisha.webp");
  fs.copyFileSync(packagesHeroJpg, "apps/admin/public/images/packages/packages-hero-odisha.jpg");

  // 2. Desktop Hero (2170x725)
  const heroDesktopWebp = "apps/web/public/images/hero/hero-odisha-desktop.webp";
  const heroDesktopPng = "apps/web/public/images/hero/hero-odisha-desktop.png";

  await sharp(baseImage)
    .resize(2170, 725, { fit: "cover", position: "center" })
    .modulate({ brightness: 0.92, saturation: 1.15 })
    .webp({ quality: 90 })
    .toFile(heroDesktopWebp);

  await sharp(baseImage)
    .resize(2170, 725, { fit: "cover", position: "center" })
    .modulate({ brightness: 0.92, saturation: 1.15 })
    .png({ quality: 90 })
    .toFile(heroDesktopPng);

  console.log("Created desktop hero odisha banner in web app");

  // 3. Mobile Hero (800x960)
  const heroMobileWebp = "apps/web/public/images/hero/hero-odisha-mobile.webp";
  const heroMobilePng = "apps/web/public/images/hero/hero-odisha-mobile.png";

  await sharp(baseImage)
    .resize(800, 960, { fit: "cover", position: "center" })
    .modulate({ brightness: 0.92, saturation: 1.15 })
    .webp({ quality: 90 })
    .toFile(heroMobileWebp);

  await sharp(baseImage)
    .resize(800, 960, { fit: "cover", position: "center" })
    .modulate({ brightness: 0.92, saturation: 1.15 })
    .png({ quality: 90 })
    .toFile(heroMobilePng);

  console.log("Created mobile hero odisha banner in web app");

  // Also create a Kashmir specific banner if needed so it can switch cleanly
  const kashmirHeroWebp = "apps/web/public/images/packages/packages-hero-kashmir.webp";
  const kashmirHeroJpg = "apps/web/public/images/packages/packages-hero-kashmir.jpg";
  if (fs.existsSync("apps/web/public/images/packages/packages-hero-banner.jpg")) {
    await sharp("apps/web/public/images/packages/packages-hero-banner.jpg")
      .resize(1920, 800, { fit: "cover", position: "center" })
      .webp({ quality: 90 })
      .toFile(kashmirHeroWebp);

    await sharp("apps/web/public/images/packages/packages-hero-banner.jpg")
      .resize(1920, 800, { fit: "cover", position: "center" })
      .jpeg({ quality: 90, mozjpeg: true })
      .toFile(kashmirHeroJpg);

    fs.copyFileSync(kashmirHeroWebp, "apps/admin/public/images/packages/packages-hero-kashmir.webp");
    fs.copyFileSync(kashmirHeroJpg, "apps/admin/public/images/packages/packages-hero-kashmir.jpg");
    console.log("Created packages hero kashmir banner");
  }

  console.log("All realistic hero banners generated successfully!");
}

main().catch(console.error);
