import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { toKebab } from "@/lib/serializers/risk";
import type { ApprovalItem } from "@/types";

export type ApprovalWithRelations = Prisma.ApprovalGetPayload<{
  include: { requestedBy: true; decidedBy: true };
}>;

export function serializeApproval(approval: ApprovalWithRelations): ApprovalItem {
  return {
    id: approval.code,
    title: approval.title,
    type: approval.type,
    requestedBy: approval.requestedBy.name,
    submittedAt: approval.submittedAt.toISOString().slice(0, 10),
    dueDate: approval.dueDate.toISOString().slice(0, 10),
    priority: toKebab(approval.priority),
    status: toKebab(approval.status),
  };
}
