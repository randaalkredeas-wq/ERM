import { NextResponse, type NextRequest } from "next/server";

import { handleApiError, logAudit, requireApiUser } from "@/lib/api-utils";
import { severityFromScore } from "@/lib/domain";
import { canActOnRisk, requirePermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { serializeRisk, toUpperSnake } from "@/lib/serializers/risk";
import {
  findRiskRowByCode,
  findRiskWithRelationsByCode,
  resolveUserIdByName,
} from "@/lib/server/risk-helpers";
import { RiskFormSchema } from "@/lib/validation/risk";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireApiUser();
    requirePermission(user.role, "riskRegister", "view");

    const { id } = await params;
    const risk = await findRiskWithRelationsByCode(id);
    return NextResponse.json({ data: serializeRisk(risk) });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireApiUser();
    const { id } = await params;

    const existing = await findRiskRowByCode(id);
    if (!canActOnRisk(user, "edit", existing)) {
      requirePermission(user.role, "riskRegister", "edit");
    }

    const body = RiskFormSchema.parse(await request.json());
    const ownerId = await resolveUserIdByName(body.owner);
    const ownerChanged = ownerId !== existing.ownerId;

    const inherentRisk = severityFromScore(
      body.inherentLikelihood * body.inherentImpact,
    );
    const targetRisk = severityFromScore(body.targetLikelihood * body.targetImpact);

    const latestVersion = await prisma.riskVersion.findFirst({
      where: { riskId: existing.id },
      orderBy: { version: "desc" },
      select: { version: true },
    });
    const nextVersion = (latestVersion?.version ?? 0) + 1;
    const currentWorkflowStatus = existing.workflowStatus
      .toLowerCase()
      .replace(/_/g, "-");

    const updated = await prisma.risk.update({
      where: { id: existing.id },
      data: {
        title: body.title,
        description: body.description,
        department: body.department,
        category: body.category,
        subcategory: body.subcategory,
        riskSource: body.riskSource,
        riskType: body.riskType,
        strategicObjective: body.strategicObjective,
        rootCause: body.rootCause,
        consequences: body.consequences,
        existingControls: body.existingControls,
        controlEffectiveness: toUpperSnake(body.controlEffectiveness) as never,
        inherentLikelihood: body.inherentLikelihood,
        inherentImpact: body.inherentImpact,
        inherentRisk: toUpperSnake(inherentRisk) as never,
        likelihood: body.likelihood,
        impact: body.impact,
        targetLikelihood: body.targetLikelihood,
        targetImpact: body.targetImpact,
        targetRisk: toUpperSnake(targetRisk) as never,
        riskTreatment: toUpperSnake(body.riskTreatment) as never,
        reviewFrequency: toUpperSnake(body.reviewFrequency) as never,
        nextReviewDate: new Date(body.nextReviewDate),
        ownerId,
        status: toUpperSnake(body.status) as never,
        dueDate: new Date(body.dueDate),
        auditTrail: {
          create: {
            userId: user.id,
            action: "Updated risk details",
            details: `Risk details updated (v${nextVersion})`,
          },
        },
        versions: {
          create: {
            version: nextVersion,
            editedById: user.id,
            summary: "Risk details updated",
            snapshot: {
              title: body.title,
              status: body.status,
              workflowStatus: currentWorkflowStatus,
              likelihood: body.likelihood,
              impact: body.impact,
              inherentRisk,
              targetRisk,
            },
          },
        },
      },
      include: { owner: true },
    });

    await logAudit({
      userId: user.id,
      action: "Updated risk details",
      module: "Risk Register",
      details: `${updated.code} — ${updated.title}`,
    });

    if (ownerChanged) {
      await prisma.notification.create({
        data: {
          userId: ownerId,
          title: "New risk assigned",
          description: `${updated.code} — ${updated.title} was assigned to you.`,
          tone: "PRIMARY",
        },
      });
    }

    const full = await findRiskWithRelationsByCode(updated.code);
    return NextResponse.json({ data: serializeRisk(full) });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireApiUser();
    const { id } = await params;

    const existing = await findRiskRowByCode(id);
    requirePermission(user.role, "riskRegister", "delete");

    await prisma.risk.delete({ where: { id: existing.id } });

    await logAudit({
      userId: user.id,
      action: "Deleted risk",
      module: "Risk Register",
      details: `${existing.code} — ${existing.title}`,
    });

    return NextResponse.json({ data: { id: existing.code } });
  } catch (error) {
    return handleApiError(error);
  }
}
