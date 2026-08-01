import { NextResponse, type NextRequest } from "next/server";

import { handleApiError, requireApiUser } from "@/lib/api-utils";
import { requirePermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { serializeGeneratedReport } from "@/lib/serializers/report";
import { paginate, PaginationQuerySchema } from "@/lib/validation/common";

export async function GET(request: NextRequest) {
  try {
    const user = await requireApiUser();
    requirePermission(user.role, "reports", "view");

    const query = PaginationQuerySchema.parse(
      Object.fromEntries(request.nextUrl.searchParams),
    );

    const where = query.search
      ? { name: { contains: query.search, mode: "insensitive" as const } }
      : {};

    const [total, rows] = await Promise.all([
      prisma.generatedReport.count({ where }),
      prisma.generatedReport.findMany({
        where,
        include: { generatedBy: true },
        orderBy: { createdAt: "desc" },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
    ]);

    return NextResponse.json({
      data: rows.map(serializeGeneratedReport),
      pagination: paginate(query.page, query.pageSize, total),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
