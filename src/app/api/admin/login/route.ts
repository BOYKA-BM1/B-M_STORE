import { NextResponse } from "next/server";
import { ADMIN_PASSWORD, ADMIN_COOKIE } from "@/lib/admin-auth";

export async function POST(req: Request) {
  try {
    const { password } = await req.json();
    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ ok: false, error: "كلمة السر غير صحيحة" }, { status: 401 });
    }
    const res = NextResponse.json({ ok: true });
    res.cookies.set(ADMIN_COOKIE, "1", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8, // 8 hours
      secure: process.env.NODE_ENV === "production" || process.env.VERCEL === "1",
    });
    return res;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
