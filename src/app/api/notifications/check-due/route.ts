import { NextResponse, type NextRequest } from "next/server";

import { ApiAuthError, handleApiError, requireApiUser } from "@/lib/api-utils";
import {
  overdueTreatmentEmail,
  upcomingReviewEmail,
} from "@/lib/email-templates";
import { prisma } from "@/lib/prisma";
import { notifyUser } from "@/lib/server/notify";

const REVIEW_LOOKAHEAD_DAYS = 7;

/**
 * Scans for overdue treatment actions and risks due for review soon, and
 * notifies each owner. Intended to be invoked once daily by an external
 * scheduler (cron, Vercel Cron, etc.) - see README/deployment notes for how
 * to wire that up. Callable either as a signed-in admin/CRO, or headlessly
 * with `Authorization: Bearer <CRON_SECRET>` when CRON_SECRET is set.
 */
export async function POST(request: NextRequest) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = request.headers.get("authorization");
    const isCron = Boolean(cronSecret) && authHeader === `Bearer ${cronSecret}`;

    if (!isCron) {
      const user = await requireApiUser();
      if (user.role !== "SYSTEM_ADMIN" && user.role !== "CRO") {
        throw new ApiAuthError("Not authorized to trigger this check.");
      }
    }

    const now = new Date();
    const lookahead = new Date(now.getTime() + REVIEW_LOOKAHEAD_DAYS * 24 * 60 * 60 * 1000);

    const overdueActions = await prisma.treatmentAction.findMany({
      where: { status: { not: "COMPLETED" }, dueDate: { lt: now } },
      include: { risk: true },
    });

    for (const action of overdueActions) {
      await notifyUser(
        action.ownerId,
        {
          title: "Treatment action overdue",
          description: `${action.risk.code} — "${action.title}" was due ${action.dueDate.toISOString().slice(0, 10)}.`,
          tone: "DANGER",
        },
        overdueTreatmentEmail(
          action.risk.code,
          action.risk.title,
          action.title,
          action.dueDate.toISOString().slice(0, 10),
        ),
      );
    }

    const dueSoonRisks = await prisma.risk.findMany({
      where: {
        isArchived: false,
        workflowStatus: { not: "CLOSED" },
        nextReviewDate: { gte: now, lte: lookahead },
      },
    });

    for (const risk of dueSoonRisks) {
      await notifyUser(
        risk.ownerId,
        {
          title: "Risk review coming up",
          description: `${risk.code} — "${risk.title}" is due for review on ${risk.nextReviewDate.toISOString().slice(0, 10)}.`,
          tone: "WARNING",
        },
        upcomingReviewEmail(
          risk.code,
          risk.title,
          risk.nextReviewDate.toISOString().slice(0, 10),
        ),
      );
    }

    return NextResponse.json({
      data: {
        overdueActionsNotified: overdueActions.length,
        upcomingReviewsNotified: dueSoonRisks.length,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
