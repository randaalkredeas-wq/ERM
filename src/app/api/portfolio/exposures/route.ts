import { NextResponse, type NextRequest } from "next/server";

import { Prisma } from "@/generated/prisma/client";
import { handleApiError, requireApiUser } from "@/lib/api-utils";
import { requirePermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { serializeCreditExposure } from "@/lib/serializers/portfolio";
import { toUpperSnake } from "@/lib/serializers/risk";
import { paginate } from "@/lib/validation/common";
import { ExposureListQuerySchema } from "@/lib/validation/portfolio";

export async function GET(request: NextRequest) {
  try {
    const user = await requireApiUser();
    requirePermission(user.role, "portfolio", "view");

    const query = ExposureListQuerySchema.parse(
      Object.fromEntries(request.nextUrl.searchParams),
    );

    const where: Prisma.CreditExposureWhereInput = {
      ...(query.segment ? { segment: query.segment } : {}),
      ...(query.sector ? { sector: query.sector } : {}),
      ...(query.eclStage ? { eclStage: toUpperSnake(query.eclStage) as never } : {}),
      ...(query.collectionStatus
        ? { collectionStatus: toUpperSnake(query.collectionStatus) as never }
        : {}),
      ...(query.search
        ? {
            OR: [
              { customerName: { contains: query.search, mode: "insensitive" } },
              { code: { contains: query.search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [total, rows] = await Promise.all([
      prisma.creditExposure.count({ where }),
      prisma.creditExposure.findMany({
        where,
        include: { collector: true },
        orderBy: { outstandingBalance: "desc" },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
    ]);

    return NextResponse.json({
      data: rows.map(serializeCreditExposure),
      pagination: paginate(query.page, query.pageSize, total),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
