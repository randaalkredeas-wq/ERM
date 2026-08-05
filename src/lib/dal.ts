import "server-only";

import { cache } from "react";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getDemoAccountById } from "@/lib/mock-auth";
import { prisma } from "@/lib/prisma";
import { getSessionToken, hashToken } from "@/lib/session";

/** Optimistic-safe session lookup, memoized per request via React's cache(). */
export const verifySession = cache(async () => {
  const token = await getSessionToken();
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    select: { userId: true, expiresAt: true },
  });

  if (!session || session.expiresAt < new Date()) return null;

  return { userId: session.userId };
});

const MOCK_SESSION_COOKIE = "erm_session";

/**
 * Bridges the client-side-only mock login (src/lib/mock-auth.ts,
 * src/providers/mock-auth-provider.tsx) to the Prisma-backed API routes.
 * There is no real server session for a mock login - createMockSession()
 * stores the signed-in demo account id directly in the erm_session cookie
 * instead of a random token. Each demo account is bridged to one real seeded
 * Postgres user of the same role so foreign keys (e.g. Risk.ownerId,
 * AuditLogEntry.userId) stay valid; the returned identity (name/email/role)
 * is still the demo account's own. Remove this bridge once real
 * authentication replaces the mock login.
 *
 * The bridge resolves the real user BY ROLE AT REQUEST TIME rather than a
 * hardcoded id - Postgres assigns each seeded user a fresh `cuid()` id, so a
 * ready-made map of ids captured from one database (e.g. a local sandbox)
 * silently points at rows that don't exist in any other database (e.g. the
 * production database Vercel deploys against). That mismatch doesn't fail
 * the lookup itself - it fails later, as an opaque foreign-key violation the
 * first time the id is written (creating a risk, logging an audit entry,
 * etc.), surfacing to the user as a generic 500 "Something went wrong."
 */
async function getMockCurrentUser() {
  const cookieStore = await cookies();
  const mockAccountId = cookieStore.get(MOCK_SESSION_COOKIE)?.value;
  if (!mockAccountId) return null;

  const account = getDemoAccountById(mockAccountId);
  if (!account) return null;

  // Not filtered by status: this real user only anchors foreign keys, and
  // the demo persona's own (always-"ACTIVE") status is used for display
  // below regardless of the anchor row's actual seeded status.
  const realUser = await prisma.user.findFirst({
    where: { role: account.role },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  if (!realUser) return null;

  return {
    id: realUser.id,
    name: account.name,
    email: account.email,
    role: account.role,
    department: account.department,
    jobTitle: account.jobTitle,
    phone: account.phone,
    location: account.location,
    status: "ACTIVE" as const,
    lastLoginAt: account.lastLoginAt ? new Date(account.lastLoginAt) : null,
    createdAt: new Date(account.createdAt),
  };
}

/**
 * Returns only the fields safe to expose to the client (a DTO) - never the
 * password hash. This is the function every page/API route should call.
 */
export const getCurrentUser = cache(async () => {
  const session = await verifySession();
  if (!session) return getMockCurrentUser();

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      department: true,
      jobTitle: true,
      phone: true,
      location: true,
      status: true,
      lastLoginAt: true,
      createdAt: true,
    },
  });

  if (!user || user.status !== "ACTIVE") return null;

  return user;
});

export type CurrentUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

/** Use in Server Components / Route Handlers that require an authenticated user. */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
