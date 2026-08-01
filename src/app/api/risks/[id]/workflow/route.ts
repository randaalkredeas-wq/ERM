import { NextResponse, type NextRequest } from "next/server";

import { handleApiError, logAudit, requireApiUser } from "@/lib/api-utils";
import {
  canActOnRisk,
  canApproveWorkflow,
  ForbiddenError,
} from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { serializeRisk, toUpperSnake } from "@/lib/serializers/risk";
import {
  findRiskRowByCode,
  findRiskWithRelationsByCode,
} from "@/lib/server/risk-helpers";
import { WorkflowTransitionSchema } from "@/lib/validation/risk";
import type { RiskWorkflowStatus } from "@/types";

type RouteParams = { params: Promise<{ id: string }> };

const ALLOWED_TRANSITIONS: Record<RiskWorkflowStatus, RiskWorkflowStatus[]> = {
  draft: ["under-review"],
  "under-review": ["approved", "rejected"],
  approved: ["closed", "draft"],
  rejected: ["under-review", "draft"],
  closed: ["draft"],
};

const NOTIFICATIONS: Record<
  RiskWorkflowStatus,
  { title: string; describe: (code: string, title: string) => string; tone: string }
> = {
  draft: {
    title: "Risk reopened",
    describe: (code, title) => `${code} — ${title} was reopened for rework.`,
    tone: "INFO",
  },
  "under-review": {
    title: "Approval requested",
    describe: (code, title) => `${code} — ${title} was submitted for review.`,
    tone: "WARNING",
  },
  approved: {
    title: "Risk approved",
    describe: (code, title) => `${code} — ${title} was approved.`,
    tone: "SUCCESS",
  },
  rejected: {
    title: "Risk rejected",
    describe: (code, title) => `${code} — ${title} was rejected and returned for rework.`,
    tone: "DANGER",
  },
  closed: {
    title: "Risk closed",
    describe: (code, title) => `${code} — ${title} was closed.`,
    tone: "INFO",
  },
};

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireApiUser();
    const { id } = await params;
    const { toStatus, comment } = WorkflowTransitionSchema.parse(
      await request.json(),
    );

    const existing = await findRiskRowByCode(id);
    const currentStatus = existing.workflowStatus
      .toLowerCase()
      .replace(/_/g, "-") as RiskWorkflowStatus;

    if (!ALLOWED_TRANSITIONS[currentStatus].includes(toStatus)) {
      throw new ForbiddenError(
        `Cannot move risk from ${currentStatus} to ${toStatus}.`,
      );
    }

    const requiresApproval = toStatus === "approved" || toStatus === "rejected";
    const authorized = requiresApproval
      ? canApproveWorkflow(user.role)
      : canActOnRisk(user, "edit", existing);
    if (!authorized) {
      throw new ForbiddenError("You don't have permission to do that.");
    }

    await prisma.risk.update({
      where: { id: existing.id },
      data: {
        workflowStatus: toUpperSnake(toStatus) as never,
        status: toStatus === "closed" ? "CLOSED" : undefined,
        workflowHistory: {
          create: {
            fromStatus: toUpperSnake(currentStatus) as never,
            toStatus: toUpperSnake(toStatus) as never,
            actorId: user.id,
            comment: comment || null,
          },
        },
        auditTrail: {
          create: {
            userId: user.id,
            action: "Workflow status changed",
            details: `${currentStatus} → ${toStatus}`,
          },
        },
      },
    });

    await logAudit({
      userId: user.id,
      action: "Workflow status changed",
      module: "Risk Register",
      details: `${existing.code} — moved to ${toStatus.replace("-", " ")}`,
    });

    const notification = NOTIFICATIONS[toStatus];
    if (existing.ownerId !== user.id) {
      await prisma.notification.create({
        data: {
          userId: existing.ownerId,
          title: notification.title,
          description: notification.describe(existing.code, existing.title),
          tone: notification.tone as never,
        },
      });
    }

    const full = await findRiskWithRelationsByCode(existing.code);
    return NextResponse.json({ data: serializeRisk(full) });
  } catch (error) {
    return handleApiError(error);
  }
}
