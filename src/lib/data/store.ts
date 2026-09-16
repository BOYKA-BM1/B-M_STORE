import { promises as fs } from "fs";
import path from "path";
import { PROJECTS as SEED, type Project, CATEGORIES } from "./projects";
import { STORE_SETTINGS } from "@/lib/settings";

function resolveDataDir() {
  // على Vercel نظام الملفات للقراءة فقط ما عدا /tmp
  if (process.env.VERCEL || process.env.DATA_DIR === "tmp") {
    return path.join("/tmp", "bm-store-data");
  }
  return path.join(process.cwd(), "data");
}

const DATA_DIR = resolveDataDir();
const PROJECTS_FILE = path.join(DATA_DIR, "projects.json");
const UPLOADS_DIR =
  process.env.VERCEL || process.env.DATA_DIR === "tmp"
    ? path.join("/tmp", "bm-store-uploads")
    : path.join(process.cwd(), "public", "uploads");

/** مسار قراءة احتياطي من ملفات المشروع (seed / committed json) */
const BUNDLED_PROJECTS = path.join(process.cwd(), "data", "projects.json");

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

export async function loadProjects(): Promise<Project[]> {
  await ensureDataDir();
  // 1) جرب التخزين القابل للكتابة
  try {
    const raw = await fs.readFile(PROJECTS_FILE, "utf-8");
    const parsed = JSON.parse(raw) as Project[];
    if (Array.isArray(parsed)) return parsed;
  } catch {
    /* missing */
  }
  // 2) جرب الملف المرفق مع المشروع (مهم على Vercel)
  try {
    const raw = await fs.readFile(BUNDLED_PROJECTS, "utf-8");
    const parsed = JSON.parse(raw) as Project[];
    if (Array.isArray(parsed)) {
      // انسخ لـ /tmp لو ممكن عشان التعديلات أثناء التشغيل
      try {
        await saveProjects(parsed);
      } catch {
        /* read-only */
      }
      return parsed;
    }
  } catch {
    /* no bundled */
  }
  // 3) أول تشغيل: seed
  try {
    await saveProjects(SEED);
  } catch {
    /* read-only env */
  }
  return SEED.map((p) => ({ ...p }));
}

export async function saveProjects(projects: Project[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(PROJECTS_FILE, JSON.stringify(projects, null, 2), "utf-8");
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

/** Always attach internal demo URL for published projects */
export function withDemoUrl(project: Project): Project {
  // Live runnable demo served from extracted ZIP at /d/{slug}/
  const liveDemo = `/d/${project.slug}/`;
  return {
    ...project,
    demoMode: "EXTERNAL_URL",
    demoUrl: project.demoUrl?.startsWith("/d/") || project.demoUrl?.includes("/d/")
      ? project.demoUrl
      : liveDemo,
  };
}

export async function upsertProject(project: Project): Promise<Project> {
  const all = await loadProjects();
  // Auto demo link
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
