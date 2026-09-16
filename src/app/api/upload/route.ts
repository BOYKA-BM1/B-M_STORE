import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { ensureUploadsDir } from "@/lib/data/store";
import { requireAdmin } from "@/lib/require-admin";

export const runtime = "nodejs";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX = 5 * 1024 * 1024; // 5MB

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "ارفع صورة" }, { status: 400 });
    }
    const type = file.type || "";
    if (!ALLOWED.has(type)) {
      return NextResponse.json({ error: "الصورة يجب أن تكون JPG/PNG/WebP" }, { status: 400 });
    }
    if (file.size > MAX) {
      return NextResponse.json({ error: "الحد الأقصى للصورة 5 ميجا" }, { status: 400 });
    }
    await ensureUploadsDir();
    const ext = type === "image/png" ? "png" : type === "image/webp" ? "webp" : type === "image/gif" ? "gif" : "jpg";
    const name = `cover_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const dest = path.join(process.cwd(), "public", "uploads", name);
    const buf = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(dest, buf);
    return NextResponse.json({ ok: true, url: `/uploads/${name}` });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "فشل رفع الصورة" }, { status: 500 });
  }
}
