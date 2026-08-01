import "server-only";

import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";

export async function verifyCredentials(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
  });

  if (!user || user.status !== "ACTIVE") return null;

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return null;

  return user;
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}
