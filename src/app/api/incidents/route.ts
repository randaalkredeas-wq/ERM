import { NextResponse, type NextRequest } from "next/server";

import { Prisma } from "@/generated/prisma/client";
import { handleApiError, logAudit, requireApiUser } from "@/lib/api-utils";
import { requirePermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { toUpperSnake } from "@/lib/serializers/risk";
import { serializeIncident } from "@/lib/serializers/incident";
import { nextCode } from "@/lib/server/codes";
import { paginate } from "@/lib/validation/common";
import {
  IncidentCreateSchema,
  IncidentListQuerySchema,
} from "@/lib/validation/incident";

export async function GET(request: NextRequest) {
  try {
    const user = await requireApiUser();
    requirePermission(user.role, "incidents", "view");

    const query = IncidentListQuerySchema.parse(
      Object.fromEntries(request.nextUrl.searchParams),
    );

    const where: Prisma.IncidentWhereInput = {
      ...(query.status ? { status: toUpperSnake(query.status) as never } : {}),
      ...(query.severity ? { severity: toUpperSnake(query.severity) as never } : {}),
      ...(query.category ? { category: query.category } : {}),
      ...(query.search
        ? {
            OR: [
              { title: { contains: query.search, mode: "insensitive" } },
              { code: { contains: query.search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [total, rows] = await Promise.all([
      prisma.incident.count({ where }),
      prisma.incident.findMany({
        where,
        include: { reportedBy: true },
        orderBy: { createdAt: "desc" },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
    ]);

    return NextResponse.json({
      data: rows.map(serializeIncident),
      pagination: paginate(query.page, query.pageSize, total),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireApiUser();
    requirePermission(user.role, "incidents", "create");

    const body = IncidentCreateSchema.parse(await request.json());
    const existingCodes = await prisma.incident.findMany({ select: { code: true } });
    const code = nextCode(existingCodes.map((r) => r.code), "INC");

    const incident = await prisma.incident.create({
      data: {
        code,
        title: body.title,
        category: body.category,
        severity: toUpperSnake(body.severity) as never,
        status: toUpperSnake(body.status) as never,
        reportedById: user.id,
      },
      include: { reportedBy: true },
    });

    await logAudit({
      userId: user.id,
      action: "Reported incident",
      module: "Incidents",
      details: `${incident.code} — ${incident.title}`,
    });

    return NextResponse.json({ data: serializeIncident(incident) }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
