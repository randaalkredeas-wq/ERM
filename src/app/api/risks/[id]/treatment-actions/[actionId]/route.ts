import { NextResponse, type NextRequest } from "next/server";

import { handleApiError, logAudit, NotFoundError, requireApiUser } from "@/lib/api-utils";
import { canActOnRisk, requirePermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { serializeRisk, toUpperSnake } from "@/lib/serializers/risk";
import {
  findRiskRowByCode,
  findRiskWithRelationsByCode,
  resolveUserIdByName,
} from "@/lib/server/risk-helpers";
import { TreatmentActionPatchSchema } from "@/lib/validation/risk";

type RouteParams = { params: Promise<{ id: string; actionId: string }> };

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireApiUser();
    const { id, actionId } = await params;
    const body = TreatmentActionPatchSchema.parse(await request.json());

    const existing = await findRiskRowByCode(id);
    if (!canActOnRisk(user, "edit", existing)) {
      requirePermission(user.role, "riskRegister", "edit");
    }

    const action = await prisma.treatmentAction.findFirst({
      where: { id: actionId, riskId: existing.id },
    });
    if (!action) throw new NotFoundError("Treatment action not found.");

    const ownerId = body.owner ? await resolveUserIdByName(body.owner) : undefined;

    await prisma.treatmentAction.update({
      where: { id: actionId },
      data: {
        title: body.title,
        ownerId,
        dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
        status: body.status ? (toUpperSnake(body.status) as never) : undefined,
        progress: body.progress,
      },
    });

    await prisma.risk.update({
      where: { id: existing.id },
      data: {
        auditTrail: {
          create: {
            userId: user.id,
            action: "Updated treatment action",
            details: body.title ?? action.title,
          },
        },
      },
    });

    await logAudit({
      userId: user.id,
      action: "Updated treatment action",
      module: "Risk Register",
      details: `${existing.code} — ${body.title ?? action.title}`,
    });

    const full = await findRiskWithRelationsByCode(existing.code);
    return NextResponse.json({ data: serializeRisk(full) });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireApiUser();
    const { id, actionId } = await params;

    const existing = await findRiskRowByCode(id);
    if (!canActOnRisk(user, "edit", existing)) {
      requirePermission(user.role, "riskRegister", "edit");
    }

    const action = await prisma.treatmentAction.findFirst({
      where: { id: actionId, riskId: existing.id },
    });
    if (!action) throw new NotFoundError("Treatment action not found.");

    await prisma.treatmentAction.delete({ where: { id: actionId } });

    await prisma.risk.update({
      where: { id: existing.id },
      data: {
        auditTrail: {
          create: {
            userId: user.id,
            action: "Removed treatment action",
            details: action.title,
          },
        },
      },
    });

    await logAudit({
      userId: user.id,
      action: "Removed treatment action",
      module: "Risk Register",
      details: `${existing.code} — ${action.title}`,
    });

    const full = await findRiskWithRelationsByCode(existing.code);
    return NextResponse.json({ data: serializeRisk(full) });
  } catch (error) {
    return handleApiError(error);
  }
}
