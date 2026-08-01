import { NextResponse, type NextRequest } from "next/server";

import { handleApiError, logAudit, NotFoundError, requireApiUser } from "@/lib/api-utils";
import { canActOnRisk, requirePermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { serializeRisk } from "@/lib/serializers/risk";
import { deleteStoredFile } from "@/lib/storage";
import {
  findRiskRowByCode,
  findRiskWithRelationsByCode,
} from "@/lib/server/risk-helpers";

type RouteParams = { params: Promise<{ id: string; attachmentId: string }> };

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireApiUser();
    const { id, attachmentId } = await params;

    const existing = await findRiskRowByCode(id);
    if (!canActOnRisk(user, "edit", existing)) {
      requirePermission(user.role, "riskRegister", "edit");
    }

    const attachment = await prisma.riskAttachment.findFirst({
      where: { id: attachmentId, riskId: existing.id },
    });
    if (!attachment) throw new NotFoundError("Attachment not found.");

    await prisma.riskAttachment.delete({ where: { id: attachmentId } });
    await deleteStoredFile(attachment.storageKey);

    await prisma.risk.update({
      where: { id: existing.id },
      data: {
        auditTrail: {
          create: {
            userId: user.id,
            action: "Removed attachment",
            details: attachment.name,
          },
        },
      },
    });

    await logAudit({
      userId: user.id,
      action: "Removed attachment",
      module: "Risk Register",
      details: `${existing.code} — ${attachment.name}`,
    });

    const full = await findRiskWithRelationsByCode(existing.code);
    return NextResponse.json({ data: serializeRisk(full) });
  } catch (error) {
    return handleApiError(error);
  }
}
