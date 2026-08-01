import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import type { AuditLogEntry } from "@/types";

export type AuditLogEntryWithUser = Prisma.AuditLogEntryGetPayload<{
  include: { user: true };
}>;

export function serializeAuditLogEntry(entry: AuditLogEntryWithUser): AuditLogEntry {
  return {
    id: entry.id,
    timestamp: `${entry.createdAt.toISOString().slice(0, 10)} ${entry.createdAt
      .toISOString()
      .slice(11, 16)}`,
    user: entry.user?.name ?? "System",
    action: entry.action,
    module: entry.module,
    details: entry.details,
    ip: entry.ipAddress,
  };
}
