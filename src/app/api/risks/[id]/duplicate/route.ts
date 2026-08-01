import { NextResponse, type NextRequest } from "next/server";

import { handleApiError, logAudit, requireApiUser } from "@/lib/api-utils";
import { requirePermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { serializeRisk } from "@/lib/serializers/risk";
import {
  findRiskWithRelationsByCode,
  generateNextRiskCode,
} from "@/lib/server/risk-helpers";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(_request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireApiUser();
    requirePermission(user.role, "riskRegister", "create");

    const { id } = await params;
    const source = await findRiskWithRelationsByCode(id);
    const newCode = await generateNextRiskCode();
    const title = `${source.title} (Copy)`;

    const duplicated = await prisma.risk.create({
      data: {
        code: newCode,
        title,
        description: source.description,
        department: source.department,
        category: source.category,
        subcategory: source.subcategory,
        riskSource: source.riskSource,
        riskType: source.riskType,
        strategicObjective: source.strategicObjective,
        rootCause: source.rootCause,
        consequences: source.consequences,
        existingControls: source.existingControls,
        controlEffectiveness: source.controlEffectiveness,
        inherentLikelihood: source.inherentLikelihood,
        inherentImpact: source.inherentImpact,
        inherentRisk: source.inherentRisk,
        likelihood: source.likelihood,
        impact: source.impact,
        targetLikelihood: source.targetLikelihood,
        targetImpact: source.targetImpact,
        targetRisk: source.targetRisk,
        riskTreatment: source.riskTreatment,
        reviewFrequency: source.reviewFrequency,
        nextReviewDate: source.nextReviewDate,
        ownerId: source.ownerId,
        status: "OPEN",
        workflowStatus: "DRAFT",
        dueDate: source.dueDate,
        createdById: user.id,
        auditTrail: {
          create: {
            userId: user.id,
            action: "Duplicated risk",
            details: `Duplicated from ${source.code}`,
          },
        },
        versions: {
          create: {
            version: 1,
            editedById: user.id,
            summary: `Duplicated from ${source.code}`,
            snapshot: {
              title,
              status: "open",
              workflowStatus: "draft",
              likelihood: source.likelihood,
              impact: source.impact,
              inherentRisk: source.inherentRisk.toLowerCase(),
              targetRisk: source.targetRisk.toLowerCase(),
            },
          },
        },
      },
    });

    await logAudit({
      userId: user.id,
      action: "Duplicated risk",
      module: "Risk Register",
      details: `${duplicated.code} — duplicated from ${source.code}`,
    });

    const full = await findRiskWithRelationsByCode(duplicated.code);
    return NextResponse.json({ data: serializeRisk(full) }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
