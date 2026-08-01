import { NextResponse, type NextRequest } from "next/server";

import { handleApiError, logAudit, NotFoundError, requireApiUser } from "@/lib/api-utils";
import { requirePermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { serializeApproval } from "@/lib/serializers/approval";
import { toUpperSnake } from "@/lib/serializers/risk";
import { ApprovalDecisionSchema } from "@/lib/validation/approval";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireApiUser();
    requirePermission(user.role, "approvals", "approve");

    const { id } = await params;
    const { status } = ApprovalDecisionSchema.parse(await request.json());

    const existing = await prisma.approval.findUnique({ where: { code: id } });
    if (!existing) throw new NotFoundError(`Approval ${id} not found.`);

    const updated = await prisma.approval.update({
      where: { id: existing.id },
      data: {
        status: toUpperSnake(status) as never,
        decidedAt: new Date(),
        decidedById: user.id,
      },
      include: { requestedBy: true, decidedBy: true },
    });

    await logAudit({
      userId: user.id,
      action: status === "approved" ? "Approved request" : "Rejected request",
      module: "Approvals",
      details: `${updated.code} — ${updated.title}`,
    });

    return NextResponse.json({ data: serializeApproval(updated) });
  } catch (error) {
    return handleApiError(error);
  }
}
