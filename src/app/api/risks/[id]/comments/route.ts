import { NextResponse, type NextRequest } from "next/server";

import { handleApiError, logAudit, requireApiUser } from "@/lib/api-utils";
import { requirePermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { serializeRisk } from "@/lib/serializers/risk";
import {
  findRiskRowByCode,
  findRiskWithRelationsByCode,
} from "@/lib/server/risk-helpers";
import { CommentSchema } from "@/lib/validation/risk";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireApiUser();
    requirePermission(user.role, "riskRegister", "view");

    const { id } = await params;
    const { message } = CommentSchema.parse(await request.json());
    const existing = await findRiskRowByCode(id);

    await prisma.risk.update({
      where: { id: existing.id },
      data: {
        comments: { create: { authorId: user.id, message } },
        auditTrail: {
          create: {
            userId: user.id,
            action: "Added comment",
            details: message.slice(0, 80),
          },
        },
      },
    });

    await logAudit({
      userId: user.id,
      action: "Added comment",
      module: "Risk Register",
      details: `${existing.code} — ${message.slice(0, 80)}`,
    });

    const full = await findRiskWithRelationsByCode(existing.code);
    return NextResponse.json({ data: serializeRisk(full) }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
