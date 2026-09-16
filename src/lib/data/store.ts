import { promises as fs } from "fs";
import path from "path";
import { PROJECTS as SEED, type Project, CATEGORIES } from "./projects";

const REDIS_KEY = "bm_store_projects";

function hasRedis() {
  return !!(
    process.env.UPSTASH_REDIS_REST_URL?.trim() &&
    process.env.UPSTASH_REDIS_REST_TOKEN?.trim()
  );
}

function isServerless() {
  return !!(process.env.VERCEL || process.env.DATA_DIR === "tmp");
}

function resolveDataDir() {
  if (isServerless()) return path.join("/tmp", "bm-store-data");
  return path.join(process.cwd(), "data");
}

const DATA_DIR = resolveDataDir();
const PROJECTS_FILE = path.join(DATA_DIR, "projects.json");
const UPLOADS_DIR = isServerless()
  ? path.join("/tmp", "bm-store-uploads")
  : path.join(process.cwd(), "public", "uploads");

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch {
    /* ignore */
  }
}

export async function ensureUploadsDir() {
  try {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
  } catch {
    /* ignore */
  }
}

async function redisGet(): Promise<Project[] | null> {
  if (!hasRedis()) return null;
  const base = process.env.UPSTASH_REDIS_REST_URL!.replace(/\/$/, "");
  const token = process.env.UPSTASH_REDIS_REST_TOKEN!;
  try {
    const res = await fetch(`${base}/get/${REDIS_KEY}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { result?: string | null };
    if (data.result == null) return null;
    const parsed = JSON.parse(data.result) as Project[];
    return Array.isArray(parsed) ? parsed : null;
  } catch (e) {
    console.error("[store] redisGet failed", e);
    return null;
  }
}

async function redisSet(projects: Project[]): Promise<void> {
  if (!hasRedis()) throw new Error("Redis not configured");
  const base = process.env.UPSTASH_REDIS_REST_URL!.replace(/\/$/, "");
  const token = process.env.UPSTASH_REDIS_REST_TOKEN!;
  const payload = JSON.stringify(projects);
  const res = await fetch(base, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(["SET", REDIS_KEY, payload]),
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Redis SET failed: ${res.status} ${text}`);
  }
}

async function loadFromFile(): Promise<Project[] | null> {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(PROJECTS_FILE, "utf-8");
    const parsed = JSON.parse(raw) as Project[];
    if (Array.isArray(parsed)) return parsed;
  } catch {
    /* missing */
  }
  return null;
}

async function saveToFile(projects: Project[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(PROJECTS_FILE, JSON.stringify(projects, null, 2), "utf-8");
}

export async function loadProjects(): Promise<Project[]> {
  if (hasRedis()) {
    const fromRedis = await redisGet();
    if (fromRedis) return fromRedis;
    const initial: Project[] = [];
    try {
      await redisSet(initial);
    } catch (e) {
      console.error("[store] redis init failed", e);
    }
    return initial;
  }

  const fromFile = await loadFromFile();
  if (fromFile) return fromFile;

  if (!isServerless()) {
    try {
      await saveToFile(SEED.map((p) => ({ ...p })));
    } catch {
      /* ignore */
    }
    return SEED.map((p) => ({ ...p }));
  }

  return [];
}

export async function saveProjects(projects: Project[]): Promise<void> {
  if (hasRedis()) {
    await redisSet(projects);
    return;
  }
  if (isServerless()) {
    try {
      await saveToFile(projects);
    } catch (e) {
      console.error("[store] serverless file save failed", e);
      throw new Error(
        "التخزين غير مفعّل. أضف UPSTASH_REDIS_REST_URL و UPSTASH_REDIS_REST_TOKEN في Vercel."
      );
    }
    return;
  }
  await saveToFile(projects);
}

export async function getAllProjects(): Promise<Project[]> {
  return loadProjects();
}

export async function getPublishedProjectsAsync(): Promise<Project[]> {
  const all = await loadProjects();
  return all.filter((p) => p.status === "PUBLISHED");
}

export async function getFeaturedProjectsAsync(): Promise<Project[]> {
  const all = await getPublishedProjectsAsync();
  return all.filter((p) => p.isFeatured);
}

export async function getProjectBySlugAsync(slug: string): Promise<Project | undefined> {
  const all = await loadProjects();
  return all.find((p) => p.slug === slug);
}

export async function getProjectByIdAsync(id: string): Promise<Project | undefined> {
  const all = await loadProjects();
  return all.find((p) => p.id === id);
}

export async function getProjectsByCategoryAsync(categorySlug: string): Promise<Project[]> {
  const all = await getPublishedProjectsAsync();
  return all.filter((p) => p.categorySlug === categorySlug);
}

export async function searchProjectsAsync(query: string): Promise<Project[]> {
  const q = query.trim().toLowerCase();
  const all = await getPublishedProjectsAsync();
  if (!q) return all;
  return all.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.shortDescription.toLowerCase().includes(q) ||
      p.fullDescription.toLowerCase().includes(q) ||
      p.categoryName.includes(q) ||
      p.technologies.some((t) => t.toLowerCase().includes(q))
  );
}

export function withDemoUrl(project: Project): Project {
  if (project.demoMode === "DISABLED") return project;
  if (project.demoUrl && project.demoUrl.startsWith("http")) return project;
  const liveDemo = `/d/${project.slug}/`;
  return {
    ...project,
    demoMode: project.demoMode || "EXTERNAL_URL",
    demoUrl: project.demoUrl?.startsWith("/d/") ? project.demoUrl : liveDemo,
  };
}

export async function upsertProject(project: Project): Promise<Project> {
  const all = await loadProjects();
  const enriched = withDemoUrl({
    ...project,
    updatedAt: new Date().toISOString(),
  });
  const idx = all.findIndex((p) => p.id === enriched.id || p.slug === enriched.slug);
  if (idx >= 0) {
    all[idx] = { ...all[idx], ...enriched };
  } else {
    all.push(enriched);
  }
  await saveProjects(all);
  return enriched;
}

export async function updateProject(
  id: string,
  patch: Partial<Project>
): Promise<Project | null> {
  const all = await loadProjects();
  const idx = all.findIndex((p) => p.id === id);
  if (idx < 0) return null;
  const next = withDemoUrl({
    ...all[idx],
    ...patch,
    id: all[idx].id,
    updatedAt: new Date().toISOString(),
  });
  all[idx] = next;
  await saveProjects(all);
  return next;
}

export async function deleteProject(id: string): Promise<boolean> {
  const all = await loadProjects();
  const next = all.filter((p) => p.id !== id);
  if (next.length === all.length) return false;
  await saveProjects(next);
  return true;
}

export function slugifyAr(text: string): string {
  const s = text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\u0600-\u06FF\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return s || `project-${Date.now()}`;
}

export { CATEGORIES };
export type { Project };
