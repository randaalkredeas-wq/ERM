import { NextResponse, type NextRequest } from "next/server";

import { handleApiError, logAudit, requireApiUser } from "@/lib/api-utils";
import { canActOnRisk, requirePermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { serializeRisk } from "@/lib/serializers/risk";
import {
  findRiskRowByCode,
  findRiskWithRelationsByCode,
} from "@/lib/server/risk-helpers";
import { ArchiveSchema } from "@/lib/validation/risk";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireApiUser();
    const { id } = await params;
    const { archived } = ArchiveSchema.parse(await request.json());

    const existing = await findRiskRowByCode(id);
    if (!canActOnRisk(user, "edit", existing)) {
      requirePermission(user.role, "riskRegister", "edit");
    }

    await prisma.risk.update({
      where: { id: existing.id },
      data: {
        isArchived: archived,
        auditTrail: {
          create: {
            userId: user.id,
            action: archived ? "Archived risk" : "Restored risk",
            details: archived
              ? "Risk moved to the archive"
              : "Risk restored from the archive",
          },
        },
      },
    });

    await logAudit({
      userId: user.id,
      action: archived ? "Archived risk" : "Restored risk",
      module: "Risk Register",
      details: existing.code,
    });

    const full = await findRiskWithRelationsByCode(existing.code);
    return NextResponse.json({ data: serializeRisk(full) });
  } catch (error) {
    return handleApiError(error);
  }
}
