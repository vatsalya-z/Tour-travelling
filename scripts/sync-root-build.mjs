import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const webNextDir = path.join(rootDir, "apps", "web", ".next");
const rootNextDir = path.join(rootDir, ".next");
const webPublicDir = path.join(rootDir, "apps", "web", "public");
const rootPublicDir = path.join(rootDir, "public");

// Ensure .next at root is populated from the main customer web application
if (fs.existsSync(webNextDir)) {
  console.log(`[sync-root-build] Copying ${webNextDir} -> ${rootNextDir}`);
  fs.cpSync(webNextDir, rootNextDir, { recursive: true, force: true });
} else {
  console.error(`[sync-root-build] Error: Source build directory not found at ${webNextDir}`);
  process.exit(1);
}

// Ensure static public assets are accessible at root if needed
if (fs.existsSync(webPublicDir) && !fs.existsSync(rootPublicDir)) {
  console.log(`[sync-root-build] Copying ${webPublicDir} -> ${rootPublicDir}`);
  fs.cpSync(webPublicDir, rootPublicDir, { recursive: true, force: true });
}

// Verify routes-manifest.json exists in root .next
const manifestPath = path.join(rootNextDir, "routes-manifest.json");
if (fs.existsSync(manifestPath)) {
  console.log(`[sync-root-build] Success: ${manifestPath} is verified and ready for Vercel deployment.`);
} else {
  console.error(`[sync-root-build] Error: ${manifestPath} could not be generated.`);
  process.exit(1);
}
