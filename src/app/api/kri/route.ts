import { NextResponse, type NextRequest } from "next/server";

import { Prisma } from "@/generated/prisma/client";
import { handleApiError, requireApiUser } from "@/lib/api-utils";
import { requirePermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { serializeKri } from "@/lib/serializers/kri";
import { toUpperSnake } from "@/lib/serializers/risk";
import { paginate } from "@/lib/validation/common";
import { KriListQuerySchema } from "@/lib/validation/kri";

export async function GET(request: NextRequest) {
  try {
    const user = await requireApiUser();
    requirePermission(user.role, "kriKpi", "view");

    const query = KriListQuerySchema.parse(
      Object.fromEntries(request.nextUrl.searchParams),
    );

    const where: Prisma.KriIndicatorWhereInput = {
      ...(query.status ? { status: toUpperSnake(query.status) as never } : {}),
      ...(query.category ? { category: query.category } : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: "insensitive" } },
              { code: { contains: query.search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [total, rows] = await Promise.all([
      prisma.kriIndicator.count({ where }),
      prisma.kriIndicator.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
    ]);

    return NextResponse.json({
      data: rows.map(serializeKri),
      pagination: paginate(query.page, query.pageSize, total),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
