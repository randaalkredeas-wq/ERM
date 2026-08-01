import { NextResponse, type NextRequest } from "next/server";

import { Prisma } from "@/generated/prisma/client";
import {
  handleApiError,
  logAudit,
  requireApiUser,
} from "@/lib/api-utils";
import { severityFromScore } from "@/lib/domain";
import { requirePermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import {
  riskInclude,
  serializeRisk,
  toUpperSnake,
} from "@/lib/serializers/risk";
import {
  generateNextRiskCode,
  resolveUserIdByName,
} from "@/lib/server/risk-helpers";
import { RiskFormSchema, RiskListQuerySchema } from "@/lib/validation/risk";

export async function GET(request: NextRequest) {
  try {
    const user = await requireApiUser();
    requirePermission(user.role, "riskRegister", "view");

    const query = RiskListQuerySchema.parse(
      Object.fromEntries(request.nextUrl.searchParams),
    );

    const where: Prisma.RiskWhereInput = {
      isArchived: query.archived ?? false,
      ...(query.department ? { department: query.department } : {}),
      ...(query.category ? { category: query.category } : {}),
      ...(query.status ? { status: toUpperSnake(query.status) as never } : {}),
      ...(query.workflowStatus
        ? { workflowStatus: toUpperSnake(query.workflowStatus) as never }
        : {}),
      ...(query.ownerId ? { ownerId: query.ownerId } : {}),
      ...(query.search
        ? {
            OR: [
              { title: { contains: query.search, mode: "insensitive" } },
              { code: { contains: query.search, mode: "insensitive" } },
              { description: { contains: query.search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [total, rows] = await Promise.all([
      prisma.risk.count({ where }),
      prisma.risk.findMany({
        where,
        include: riskInclude,
        orderBy: { createdAt: "desc" },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
    ]);

    return NextResponse.json({
      data: rows.map(serializeRisk),
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.ceil(total / query.pageSize) || 1,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireApiUser();
    requirePermission(user.role, "riskRegister", "create");

    const body = RiskFormSchema.parse(await request.json());
    const ownerId = await resolveUserIdByName(body.owner);
    const code = await generateNextRiskCode();

    const inherentRisk = severityFromScore(
      body.inherentLikelihood * body.inherentImpact,
    );
    const targetRisk = severityFromScore(body.targetLikelihood * body.targetImpact);

    const risk = await prisma.risk.create({
      data: {
        code,
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
        controlEffectiveness: toUpperSnake(
          body.controlEffectiveness,
        ) as never,
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
        workflowStatus: "DRAFT",
        dueDate: new Date(body.dueDate),
        createdById: user.id,
        auditTrail: {
          create: {
            userId: user.id,
            action: "Created risk",
            details: "Risk logged in the register",
          },
        },
        versions: {
          create: {
            version: 1,
            editedById: user.id,
            summary: "Created risk",
            snapshot: {
              title: body.title,
              status: body.status,
              workflowStatus: "draft",
              likelihood: body.likelihood,
              impact: body.impact,
              inherentRisk,
              targetRisk,
            },
          },
        },
      },
      include: riskInclude,
    });

    await logAudit({
      userId: user.id,
      action: "Created risk",
      module: "Risk Register",
      details: `${risk.code} — ${risk.title}`,
    });

    if (ownerId !== user.id) {
      await prisma.notification.create({
        data: {
          userId: ownerId,
          title: "New risk assigned",
          description: `${risk.code} — ${risk.title} was assigned to you.`,
          tone: "PRIMARY",
        },
      });
    }

    return NextResponse.json({ data: serializeRisk(risk) }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
