import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import { resolveDemoFile } from "@/lib/demo/extract";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ slug: string; path?: string[] }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { slug, path: parts = [] } = await ctx.params;
  if (!slug || slug.startsWith("pending_") || slug.includes("..")) {
    return new NextResponse("Not found", { status: 404 });
  }

  const resolved = await resolveDemoFile(slug, parts);
  if (!resolved) {
    return new NextResponse(
      `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="utf-8"/><title>Demo</title>
      <style>body{font-family:system-ui;display:flex;min-height:100vh;align-items:center;justify-content:center;background:#0f1115;color:#eee;padding:2rem;text-align:center}
      a{color:#8b5cf6}</style></head><body>
      <div><h1>تعذر تشغيل الـ Demo</h1>
      <p>لم يتم العثور على ملفات تشغيل (مثل index.html).<br/>ارفع ZIP يحتوي على الواجهة المبنية (static / dist / out).</p>
      <p><a href="/projects/${slug}">العودة للمنتج</a></p></div></body></html>`,
      { status: 404, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  const data = await fs.readFile(resolved.filePath);
  return new NextResponse(data, {
    status: 200,
    headers: {
      "Content-Type": resolved.contentType,
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      // Allow demo to run as top-level document
      "X-Frame-Options": "SAMEORIGIN",
    },
  });
}
