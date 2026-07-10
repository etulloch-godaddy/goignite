import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pnpmDir = join(root, "node_modules", ".pnpm");
const vendorDir = join(root, "vendor", "uxcore");

rmSync(vendorDir, { recursive: true, force: true });
mkdirSync(vendorDir, { recursive: true });

const seen = new Set();

for (const entry of readdirSync(pnpmDir)) {
  if (!entry.startsWith("@ux+")) continue;

  const uxDir = join(pnpmDir, entry, "node_modules", "@ux");
  if (!existsSync(uxDir)) continue;

  for (const pkgName of readdirSync(uxDir)) {
    const pkgPath = join(uxDir, pkgName);
    const pkgJsonPath = join(pkgPath, "package.json");
    if (!existsSync(pkgJsonPath)) continue;

    const pkgJson = JSON.parse(readFileSync(pkgJsonPath, "utf8"));
    const key = `${pkgJson.name}@${pkgJson.version}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const target = join(vendorDir, `${pkgName}@${pkgJson.version}`);
    cpSync(pkgPath, target, { recursive: true, dereference: true });
    console.log(`vendored ${key}`);
  }
}

console.log(`\nVendored ${seen.size} UX Core packages to vendor/uxcore/`);
