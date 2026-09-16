import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
let ok = 0, fail = 0;

function check(name, cond) {
  if (cond) { console.log("OK", name); ok++; }
  else { console.log("FAIL", name); fail++; }
}

check("package.json", existsSync(join(root, "package.json")));
check("src/app/page.tsx", existsSync(join(root, "src/app/page.tsx")));
check("admin new form", existsSync(join(root, "src/app/admin/projects/new/page.tsx")));
check("api projects", existsSync(join(root, "src/app/api/projects/route.ts")));
check("store", existsSync(join(root, "src/lib/data/store.ts")));
check("settings WA", existsSync(join(root, "src/lib/settings.ts")));
check("whatsapp helper", existsSync(join(root, "src/lib/whatsapp.ts")));
check("zip validator", existsSync(join(root, "src/lib/security/zip-validator.ts")));

const settings = readFileSync(join(root, "src/lib/settings.ts"), "utf8");
check("WA number 201114342792", settings.includes("201114342792"));

const form = readFileSync(join(root, "src/app/admin/projects/new/page.tsx"), "utf8");
check("form posts to API", form.includes("/api/projects"));
check("form has price field", form.includes("priceEgp"));

const api = readFileSync(join(root, "src/app/api/projects/route.ts"), "utf8");
check("API uses zod", api.includes("z.object"));
check("API upserts project", api.includes("upsertProject"));

const product = readFileSync(join(root, "src/app/projects/[slug]/page.tsx"), "utf8");
check("product has WhatsApp buttons", product.includes("WhatsAppTrackButton"));

console.log("\nResult:", ok, "passed,", fail, "failed");
process.exit(fail ? 1 : 0);
