import { NextResponse } from "next/server";
import { z } from "zod";
import {
  getAllProjects,
  getPublishedProjectsAsync,
  upsertProject,
  slugifyAr,
  withDemoUrl,
} from "@/lib/data/store";
import { moveDemoFolder } from "@/lib/demo/extract";
import type { Project } from "@/lib/data/projects";
import { CATEGORIES } from "@/lib/data/projects";
import { requireAdmin } from "@/lib/require-admin";

const createSchema = z.object({
  name: z.string().min(2).max(200),
  slug: z.string().min(2).max(100).optional(),
  shortDescription: z.string().min(5).max(500),
  fullDescription: z.string().min(10).max(20000),
  priceEgp: z.number().positive(),
  oldPriceEgp: z.number().positive().optional().nullable(),
  categorySlug: z.string().min(1),
  technologies: z.array(z.string()).default([]),
  features: z.array(z.string()).default([]),
  requirements: z.string().optional(),
  version: z.string().default("1.0.0"),
  demoMode: z.enum(["AUTO", "EXTERNAL_URL", "DISABLED"]).default("DISABLED"),
  demoUrl: z.union([z.string().url(), z.literal(""), z.null()]).optional(),
  status: z.enum(["DRAFT", "PRIVATE", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  isFeatured: z.boolean().default(false),
  framework: z.string().optional(),
  coverImageUrl: z.string().optional().nullable(),
  pendingId: z.string().optional().nullable(),
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const all = searchParams.get("all") === "1";
  if (all) {
    const denied = await requireAdmin();
    if (denied) return denied;
  }
  const projects = all ? await getAllProjects() : await getPublishedProjectsAsync();
  return NextResponse.json({ projects });
}

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const body = await req.json();
    const data = createSchema.parse(body);

    const cat = CATEGORIES.find((c) => c.slug === data.categorySlug);
    if (!cat) {
      return NextResponse.json({ error: "تصنيف غير صالح" }, { status: 400 });
    }

    const slug = data.slug?.trim() || slugifyAr(data.name);
    const existing = await getAllProjects();
    if (existing.some((p) => p.slug === slug)) {
      return NextResponse.json({ error: "الـ slug مستخدم بالفعل" }, { status: 400 });
    }

    const now = new Date().toISOString();
    const project: Project = withDemoUrl({
      id: `proj_${Date.now().toString(36)}`,
      name: data.name,
      slug,
      shortDescription: data.shortDescription,
      fullDescription: data.fullDescription,
      status: data.status,
      priceEgp: data.priceEgp,
      oldPriceEgp: data.oldPriceEgp || undefined,
      categorySlug: data.categorySlug,
      categoryName: cat.name,
      technologies: data.technologies.filter(Boolean),
      features: data.features.filter(Boolean),
      requirements: data.requirements,
      version: data.version || "1.0.0",
      demoMode: data.demoUrl ? data.demoMode : "EXTERNAL_URL",
      demoUrl: data.demoUrl || undefined,
      framework: data.framework,
      isFeatured: data.isFeatured,
      viewCount: 0,
      whatsappClicks: 0,
      publishedAt: data.status === "PUBLISHED" ? now : undefined,
      updatedAt: now,
      coverImageUrl: (data as { coverImageUrl?: string }).coverImageUrl,
    });

    if (data.pendingId) {
      await moveDemoFolder(data.pendingId, slug);
    }
    // Force live demo path
    project.demoUrl = `/d/${slug}/`;
    project.demoMode = "EXTERNAL_URL";
    await upsertProject(project);
    return NextResponse.json({ ok: true, project }, { status: 201 });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "بيانات غير صالحة", details: e.flatten() }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
