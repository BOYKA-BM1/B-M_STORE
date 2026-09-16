import { promises as fs } from "fs";
import path from "path";
import AdmZip from "adm-zip";
import { validateZipBuffer } from "@/lib/security/zip-validator";

const DEMOS_ROOT = path.join(process.cwd(), "data", "demos");

export async function ensureDemosRoot() {
  await fs.mkdir(DEMOS_ROOT, { recursive: true });
}

function safeJoin(root: string, rel: string): string | null {
  const normalized = path.normalize(rel).replace(/^(\.\.(\/|\\|$))+/, "");
  if (normalized.includes("..") || path.isAbsolute(normalized)) return null;
  const full = path.join(root, normalized);
  if (!full.startsWith(root)) return null;
  return full;
}

/** Extract validated ZIP into data/demos/{folderId}/ */
export async function extractZipToDemo(
  buffer: Buffer,
  folderId: string
): Promise<{
  ok: boolean;
  errors: string[];
  entryFile: string | null;
  fileCount: number;
  folderId: string;
}> {
  const validation = validateZipBuffer(buffer);
  if (!validation.ok) {
    return { ok: false, errors: validation.errors, entryFile: null, fileCount: 0, folderId };
  }

  await ensureDemosRoot();
  const target = path.join(DEMOS_ROOT, folderId);
  // clean previous
  await fs.rm(target, { recursive: true, force: true });
  await fs.mkdir(target, { recursive: true });

  const zip = new AdmZip(buffer);
  const entries = zip.getEntries();
  let written = 0;

  for (const entry of entries) {
    const name = entry.entryName.replace(/\\/g, "/");
    if (entry.isDirectory) continue;
    const dest = safeJoin(target, name);
    if (!dest) continue;
    await fs.mkdir(path.dirname(dest), { recursive: true });
    await fs.writeFile(dest, entry.getData());
    written++;
  }

  const entryFile = await findEntryHtml(target);
  return { ok: true, errors: [], entryFile, fileCount: written, folderId };
}

async function findEntryHtml(root: string): Promise<string | null> {
  const candidates = [
    "index.html",
    "public/index.html",
    "dist/index.html",
    "build/index.html",
    "out/index.html",
    "www/index.html",
  ];
  for (const c of candidates) {
    try {
      await fs.access(path.join(root, c));
      return c;
    } catch {
      /* next */
    }
  }
  // shallow search
  try {
    const top = await fs.readdir(root, { withFileTypes: true });
    for (const d of top) {
      if (d.isFile() && d.name.toLowerCase() === "index.html") return d.name;
    }
    for (const d of top) {
      if (d.isDirectory() && !d.name.startsWith(".")) {
        try {
          await fs.access(path.join(root, d.name, "index.html"));
          return `${d.name}/index.html`;
        } catch {
          /* */
        }
      }
    }
  } catch {
    /* */
  }
  return null;
}

export async function moveDemoFolder(fromId: string, toId: string): Promise<boolean> {
  await ensureDemosRoot();
  const from = path.join(DEMOS_ROOT, fromId);
  const to = path.join(DEMOS_ROOT, toId);
  try {
    await fs.access(from);
  } catch {
    return false;
  }
  await fs.rm(to, { recursive: true, force: true });
  await fs.rename(from, to);
  return true;
}

export function getDemoRoot(slug: string) {
  return path.join(DEMOS_ROOT, slug);
}

export async function resolveDemoFile(
  slug: string,
  requestPath: string[]
): Promise<{ filePath: string; contentType: string } | null> {
  const root = path.join(DEMOS_ROOT, slug);
  let rel = requestPath.filter(Boolean).join("/") || "";

  // If empty, try entry points
  if (!rel) {
    const entry = await findEntryHtml(root);
    if (!entry) return null;
    rel = entry;
  }

  // If path is a directory, try index.html inside
  let full = safeJoin(root, rel);
  if (!full) return null;

  try {
    const st = await fs.stat(full);
    if (st.isDirectory()) {
      full = path.join(full, "index.html");
    }
  } catch {
    // SPA fallback: if file missing and no extension, serve nearest index.html
    if (!path.extname(rel)) {
      const entry = await findEntryHtml(root);
      if (!entry) return null;
      full = path.join(root, entry);
    } else {
      return null;
    }
  }

  try {
    await fs.access(full);
  } catch {
    const entry = await findEntryHtml(root);
    if (!entry) return null;
    full = path.join(root, entry);
  }

  // final path traversal check
  const resolved = path.resolve(full);
  if (!resolved.startsWith(path.resolve(root))) return null;

  return { filePath: resolved, contentType: mimeFor(resolved) };
}

function mimeFor(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const map: Record<string, string> = {
    ".html": "text/html; charset=utf-8",
    ".htm": "text/html; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".mjs": "application/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".ttf": "font/ttf",
    ".map": "application/json",
    ".txt": "text/plain; charset=utf-8",
    ".xml": "application/xml",
  };
  return map[ext] || "application/octet-stream";
}
