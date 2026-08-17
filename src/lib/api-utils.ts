import "server-only";

import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { getCurrentUser, type CurrentUser } from "@/lib/dal";
import { ForbiddenError } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

export class ApiAuthError extends Error {}

export class RateLimitError extends Error {
  constructor(message = "Too many requests. Please slow down.") {
    super(message);
    this.name = "RateLimitError";
  }
}

/**
 * Use at the top of every Route Handler that requires a signed-in user.
 * Also enforces a generous per-user rate limit across all API routes as a
 * defense-in-depth backstop against a runaway or abusive client.
 */
export async function requireApiUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) throw new ApiAuthError("Not authenticated.");

  const { allowed } = rateLimit(`api:${user.id}`, {
    limit: 300,
    windowMs: 60_000,
  });
  if (!allowed) throw new RateLimitError();

  return user;
}

export async function requestIp(): Promise<string> {
  const headersList = await headers();
  return headersList.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

export async function logAudit(params: {
  userId: string | null;
  action: string;
  module: string;
  details: string;
}) {
  const ip = await requestIp();
  await prisma.auditLogEntry.create({
    data: {
      userId: params.userId,
      action: params.action,
      module: params.module,
      details: params.details,
      ipAddress: ip,
    },
  });
}

/** Converts thrown errors from a route body into the right HTTP response. */
export function handleApiError(error: unknown): NextResponse {
  if (error instanceof ApiAuthError) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
  if (error instanceof ForbiddenError) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "Validation failed.", issues: error.flatten() },
      { status: 400 },
    );
  }
  if (error instanceof NotFoundError) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
  if (error instanceof BadRequestError) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  if (error instanceof RateLimitError) {
    return NextResponse.json({ error: error.message }, { status: 429 });
  }

  console.error(error);
  return NextResponse.json(
    {
      error: "Something went wrong. Please try again.",
      // TEMPORARY diagnostic aid while tracking down the production 500 on
      // /api/risks: safe to keep (credentials redacted, no stack trace) but
      // remove once the root cause is confirmed and fixed - this endpoint
      // shouldn't leak internals to clients long-term.
      detail: safeErrorDetail(error),
    },
    { status: 500 },
  );
}

/** Redacts any embedded connection-string credentials before an error's
 *  name/code/message can reach an HTTP response. Prisma errors put the
 *  actual cause (e.g. "Can't reach database server at `host`:`port`")
 *  *after* a large "Invalid `prisma.x.y()` invocation in <file>:<line>"
 *  header, so this takes the tail of the message rather than the head. */
function safeErrorDetail(
  error: unknown,
): { name: string; code?: string; message: string } | undefined {
  if (!(error instanceof Error)) return undefined;
  const redacted = error.message.replace(
    /(:\/\/[^:/@\s]+:)[^@\s]+(@)/g,
    "$1***$2",
  );
  const collapsed = redacted.replace(/\s+/g, " ").trim();
  const message = collapsed.slice(-400);
  const code = (error as { code?: unknown }).code;
  return {
    name: error.name,
    code: typeof code === "string" ? code : undefined,
    message,
  };
}

export class NotFoundError extends Error {
  constructor(message = "Not found.") {
    super(message);
    this.name = "NotFoundError";
  }
}

export class BadRequestError extends Error {
  constructor(message = "Invalid request.") {
    super(message);
    this.name = "BadRequestError";
  }
}
