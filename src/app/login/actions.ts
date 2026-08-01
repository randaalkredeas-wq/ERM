"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { verifyCredentials } from "@/lib/auth";
import { getCurrentUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { createSession, deleteSession } from "@/lib/session";

const LoginSchema = z.object({
  email: z.string().trim().min(1).max(200),
  password: z.string().min(1).max(200),
});

export type LoginErrorCode =
  | "validation_error"
  | "rate_limited"
  | "invalid_credentials";

export interface LoginState {
  errorCode?: LoginErrorCode;
}

export async function login(
  _state: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { errorCode: "validation_error" };
  }

  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const userAgent = headersList.get("user-agent") ?? undefined;

  const { allowed } = rateLimit(`login:${ip}`, {
    limit: 10,
    windowMs: 15 * 60 * 1000,
  });
  if (!allowed) {
    return { errorCode: "rate_limited" };
  }

  const user = await verifyCredentials(parsed.data.email, parsed.data.password);
  if (!user) {
    return { errorCode: "invalid_credentials" };
  }

  await createSession(user.id, { userAgent, ipAddress: ip });
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });
  await prisma.auditLogEntry.create({
    data: {
      userId: user.id,
      action: "Signed in",
      module: "Authentication",
      details: `${user.name} logged in`,
      ipAddress: ip,
    },
  });

  redirect("/dashboard");
}

export async function logout() {
  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const user = await getCurrentUser();

  if (user) {
    await prisma.auditLogEntry.create({
      data: {
        userId: user.id,
        action: "Signed out",
        module: "Authentication",
        details: `${user.name} logged out`,
        ipAddress: ip,
      },
    });
  }

  await deleteSession();
  redirect("/login");
}
