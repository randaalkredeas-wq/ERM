import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Hosted Postgres (Vercel/Neon/Supabase/etc.) generally requires TLS, while
// the local sandbox Postgres used for development does not support it at
// all - forcing SSL on unconditionally would break every local connection
// instead. Opt in only for the deployed production runtime.
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  ...(process.env.NODE_ENV === "production"
    ? { ssl: { rejectUnauthorized: false } }
    : {}),
});

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
