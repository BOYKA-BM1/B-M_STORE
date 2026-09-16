import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_COOKIE = "bm_admin_session";

const PROTECTED_API_PREFIXES = [
  "/api/projects/analyze",
  "/api/upload",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const method = req.method.toUpperCase();
  const session = req.cookies.get(ADMIN_COOKIE)?.value;
  const isAdmin = session === "1";

  // Admin UI
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") {
      return NextResponse.next();
    }
    if (!isAdmin) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Protect write APIs (POST/PATCH/DELETE) under /api/projects
  if (pathname.startsWith("/api/projects")) {
    const isWrite =
      method === "POST" || method === "PATCH" || method === "DELETE" || method === "PUT";
    const isAnalyze = pathname.startsWith("/api/projects/analyze");
    const wantsAll = pathname === "/api/projects" && req.nextUrl.searchParams.get("all") === "1";

    if ((isWrite || isAnalyze || wantsAll) && !isAdmin) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }
  }

  for (const prefix of PROTECTED_API_PREFIXES) {
    if (pathname.startsWith(prefix) && method !== "GET" && !isAdmin) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }
  }

  const res = NextResponse.next();
  res.headers.set("X-Content-Type-Options", "nosniff");
  return res;
}

export const config = {
  matcher: ["/admin/:path*", "/api/projects/:path*", "/api/upload/:path*"],
};
