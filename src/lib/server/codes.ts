import "server-only";

import { prisma } from "@/lib/prisma";

/**
 * Atomically generates the next sequential `${prefix}-####` code.
 *
 * `INSERT ... ON CONFLICT DO UPDATE ... RETURNING` advances the counter row
 * for this prefix in a single statement, so Postgres serializes concurrent
 * callers via the row's lock - two requests can never be handed the same
 * code, unlike computing max(existing) + 1 from a snapshot of current rows.
 */
export async function nextCode(prefix: string): Promise<string> {
  const rows = await prisma.$queryRaw<{ value: number }[]>`
    INSERT INTO "CodeSequence" ("prefix", "value")
    VALUES (${prefix}, 1001)
    ON CONFLICT ("prefix") DO UPDATE SET "value" = "CodeSequence"."value" + 1
    RETURNING "value";
  `;
  return `${prefix}-${rows[0].value}`;
}
