import { NextResponse, type NextRequest } from "next/server";

import { handleApiError, logAudit, requireApiUser } from "@/lib/api-utils";
import { canActOnRisk, requirePermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { serializeRisk, toUpperSnake } from "@/lib/serializers/risk";
import {
  findRiskRowByCode,
  findRiskWithRelationsByCode,
  resolveUserIdByName,
} from "@/lib/server/risk-helpers";
import { TreatmentActionSchema } from "@/lib/validation/risk";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireApiUser();
    const { id } = await params;
    const body = TreatmentActionSchema.parse(await request.json());

    const existing = await findRiskRowByCode(id);
    if (!canActOnRisk(user, "edit", existing)) {
      requirePermission(user.role, "riskRegister", "edit");
    }

    const ownerId = await resolveUserIdByName(body.owner);

    await prisma.risk.update({
      where: { id: existing.id },
      data: {
        treatmentPlans: {
          create: {
            title: body.title,
            ownerId,
            dueDate: new Date(body.dueDate),
            status: toUpperSnake(body.status) as never,
            progress: body.progress,
          },
        },
        auditTrail: {
          create: {
            userId: user.id,
            action: "Added treatment action",
            details: body.title,
          },
        },
      },
    });

    await logAudit({
      userId: user.id,
      action: "Added treatment action",
      module: "Risk Register",
      details: `${existing.code} — ${body.title}`,
    });

    const full = await findRiskWithRelationsByCode(existing.code);
    return NextResponse.json({ data: serializeRisk(full) }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
