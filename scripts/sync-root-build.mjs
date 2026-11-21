import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const webNextDir = path.join(repoRoot, "apps", "web", ".next");
const rootNextDir = path.join(repoRoot, ".next");
const webPublicDir = path.join(repoRoot, "apps", "web", "public");
const rootPublicDir = path.join(repoRoot, "public");

console.log(`[sync-root-build] Script running for repo root: ${repoRoot}`);

// Ensure .next at root is populated from apps/web
if (fs.existsSync(webNextDir)) {
  if (path.resolve(webNextDir) !== path.resolve(rootNextDir)) {
    console.log(`[sync-root-build] Copying ${webNextDir} -> ${rootNextDir}`);
    fs.cpSync(webNextDir, rootNextDir, { recursive: true, force: true });
  }
} else {
  console.warn(`[sync-root-build] Warning: ${webNextDir} not found.`);
}

// Ensure static public assets are accessible at root
if (fs.existsSync(webPublicDir) && path.resolve(webPublicDir) !== path.resolve(rootPublicDir)) {
  console.log(`[sync-root-build] Copying ${webPublicDir} -> ${rootPublicDir}`);
  fs.cpSync(webPublicDir, rootPublicDir, { recursive: true, force: true });
}

// Verify routes-manifest.json exists in root .next
const manifestPath = path.join(rootNextDir, "routes-manifest.json");
if (fs.existsSync(manifestPath)) {
  console.log(`[sync-root-build] Success: ${manifestPath} is verified and ready for Vercel deployment.`);
} else {
  console.warn(`[sync-root-build] Warning: ${manifestPath} was not found.`);
}
