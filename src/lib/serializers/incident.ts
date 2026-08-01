import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { toKebab } from "@/lib/serializers/risk";
import type { IncidentItem } from "@/types";

export type IncidentWithReporter = Prisma.IncidentGetPayload<{
  include: { reportedBy: true };
}>;

export function serializeIncident(incident: IncidentWithReporter): IncidentItem {
  return {
    id: incident.code,
    title: incident.title,
    category: incident.category,
    severity: toKebab(incident.severity),
    reportedBy: incident.reportedBy.name,
    reportedAt: incident.createdAt.toISOString().slice(0, 10),
    status: toKebab(incident.status),
  };
}
