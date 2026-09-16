import { NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  projectId: z.string().min(1),
  type: z.enum(["purchase", "customization"]),
});

const clicks: Array<{ projectId: string; type: string; at: string }> = [];

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const data = bodySchema.parse(json);
    clicks.push({
      projectId: data.projectId,
      type: data.type,
      at: new Date().toISOString(),
    });
    if (clicks.length > 5000) clicks.splice(0, clicks.length - 5000);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({
    total: clicks.length,
    recent: clicks.slice(-20).reverse(),
  });
}
