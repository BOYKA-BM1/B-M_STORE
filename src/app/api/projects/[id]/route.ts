import { NextResponse } from "next/server";
import { z } from "zod";
import { deleteProject, getProjectByIdAsync, updateProject } from "@/lib/data/store";
import { CATEGORIES } from "@/lib/data/projects";
import { requireAdmin } from "@/lib/require-admin";

const patchSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  slug: z.string().min(2).max(100).optional(),
  shortDescription: z.string().min(5).max(500).optional(),
  fullDescription: z.string().min(10).max(20000).optional(),
  priceEgp: z.number().positive().optional(),
  oldPriceEgp: z.number().positive().nullable().optional(),
  categorySlug: z.string().optional(),
  technologies: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
  requirements: z.string().optional().nullable(),
  version: z.string().optional(),
  framework: z.string().optional().nullable(),
  demoMode: z.enum(["AUTO", "EXTERNAL_URL", "DISABLED"]).optional(),
  demoUrl: z.string().optional().nullable(),
  status: z.enum(["DRAFT", "PRIVATE", "PUBLISHED", "ARCHIVED"]).optional(),
  isFeatured: z.boolean().optional(),
  coverImageUrl: z.string().optional().nullable(),
});

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const p = await getProjectByIdAsync(id);
  if (!p) return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  return NextResponse.json({ project: p });
}

export async function PATCH(req: Request, ctx: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { id } = await ctx.params;
    const body = await req.json();
    const data = patchSchema.parse(body);
    const patch: Record<string, unknown> = { ...data };
    if (data.categorySlug) {
      const cat = CATEGORIES.find((c) => c.slug === data.categorySlug);
      if (cat) {
        patch.categorySlug = cat.slug;
        patch.categoryName = cat.name;
      }
    }
    if (data.status === "PUBLISHED") {
      patch.publishedAt = new Date().toISOString();
    }
    // Always enable demo link generation
    if (data.demoMode === "DISABLED") {
      patch.demoMode = "EXTERNAL_URL";
    }
    const updated = await updateProject(id, patch as never);
    if (!updated) return NextResponse.json({ error: "غير موجود" }, { status: 404 });
    return NextResponse.json({ ok: true, project: updated });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "بيانات غير صالحة", details: e.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: "خطأ" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await ctx.params;
  const ok = await deleteProject(id);
  if (!ok) return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
