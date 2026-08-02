import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "erm_session";
const AUTH_ENTRY_PATH = "/login";
const PUBLIC_PATHS = [
  "/login",
  "/forgot-password",
  "/reset-password",
  "/session-expired",
  "/access-denied",
];
const UNSAFE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function matchesPath(pathname: string, path: string) {
  return pathname === path || pathname.startsWith(`${path}/`);
}

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
 * Presence-only cookie check for the current mock authentication system
 * (see src/lib/mock-auth.ts / src/lib/mock-session.ts / src/providers/
 * mock-auth-provider.tsx). There is no server session store to look up
 * yet - the client sets/clears this cookie itself alongside its localStorage
 * session record. Real, server-verified authentication will replace this in
 * a later phase.
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
  const isPublicPath = PUBLIC_PATHS.some((path) => matchesPath(pathname, path));

  if (!isPublicPath && !hasSessionCookie) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (matchesPath(pathname, AUTH_ENTRY_PATH) && hasSessionCookie) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
