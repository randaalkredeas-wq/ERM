import "server-only";

import { cache } from "react";

import { redirect } from "next/navigation";

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

/**
 * Returns only the fields safe to expose to the client (a DTO) - never the
 * password hash. This is the function every page/API route should call.
 */
export const getCurrentUser = cache(async () => {
  const session = await verifySession();
  if (!session) return null;

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
