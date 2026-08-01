import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "erm_session";
const PUBLIC_PATHS = ["/login"];
const UNSAFE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/**
 * Rejects cross-site state-changing API requests. SameSite=Lax cookies
 * already stop the session cookie from being attached to most cross-site
 * requests; this is defense-in-depth for the rest. A request with no
 * Origin header (server-to-server calls, e.g. the cron-secret path on
 * /api/notifications/check-due) is allowed through unchanged.
 */
function isCrossSiteApiRequest(request: NextRequest): boolean {
  if (!UNSAFE_METHODS.has(request.method)) return false;
  const origin = request.headers.get("origin");
  if (!origin) return false;
  return origin !== request.nextUrl.origin;
}

/**
 * Optimistic auth check only (cookie presence, no DB lookup) - Proxy runs on
 * every request including prefetches, so the authoritative check lives in
 * the Data Access Layer (see src/lib/dal.ts) instead.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/")) {
    if (isCrossSiteApiRequest(request)) {
      return NextResponse.json({ error: "Cross-site request rejected." }, { status: 403 });
    }
    return NextResponse.next();
  }

  const hasSessionCookie = Boolean(request.cookies.get(SESSION_COOKIE)?.value);
  const isPublicPath = PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  if (!isPublicPath && !hasSessionCookie) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (isPublicPath && hasSessionCookie) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
