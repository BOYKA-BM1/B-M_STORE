import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE } from "@/lib/admin-auth";

/** يتحقق من جلسة الأدمن عبر الكوكي — يُستخدم في API Routes */
export async function requireAdmin(): Promise<NextResponse | null> {
  const jar = await cookies();
  const session = jar.get(ADMIN_COOKIE)?.value;
  if (session !== "1") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }
  return null;
}
