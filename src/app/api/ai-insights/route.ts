import { NextResponse, type NextRequest } from "next/server";

import { handleApiError, requireApiUser } from "@/lib/api-utils";
import { requirePermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { serializeAiInsight } from "@/lib/serializers/ai-insight";
import { paginate, PaginationQuerySchema } from "@/lib/validation/common";

export async function GET(request: NextRequest) {
  try {
    const user = await requireApiUser();
    requirePermission(user.role, "aiInsights", "view");

    const query = PaginationQuerySchema.parse(
      Object.fromEntries(request.nextUrl.searchParams),
    );

    const where = query.search
      ? { title: { contains: query.search, mode: "insensitive" as const } }
      : {};

    const [total, rows] = await Promise.all([
      prisma.aiInsight.count({ where }),
      prisma.aiInsight.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
    ]);

    return NextResponse.json({
      data: rows.map(serializeAiInsight),
      pagination: paginate(query.page, query.pageSize, total),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
