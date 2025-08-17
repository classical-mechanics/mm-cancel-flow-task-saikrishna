import { NextResponse } from "next/server";

const CSRF_COOKIE = "csrfToken";

// Quick random (good enough for CSRF token)
function token() {
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}

export function middleware(req: Request) {
  const res = NextResponse.next();
  // Only set on GET (safe methods)
  if ((req as any).method === "GET") {
    const has = (req.headers.get("cookie") || "").includes(`${CSRF_COOKIE}=`);
    if (!has) {
      res.cookies.set(CSRF_COOKIE, token(), {
        httpOnly: false,          // client reads to echo in header
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
      });
    }
  }
  return res;
}

// Run on all routes (or narrow if you want)
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};