import { NextResponse, type NextRequest } from "next/server";

import { Prisma } from "@/generated/prisma/client";
import { handleApiError, requireApiUser } from "@/lib/api-utils";
import { requirePermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { serializeApproval } from "@/lib/serializers/approval";
import { toUpperSnake } from "@/lib/serializers/risk";
import { ApprovalListQuerySchema } from "@/lib/validation/approval";
import { paginate } from "@/lib/validation/common";

export async function GET(request: NextRequest) {
  try {
    const user = await requireApiUser();
    requirePermission(user.role, "approvals", "view");

    const query = ApprovalListQuerySchema.parse(
      Object.fromEntries(request.nextUrl.searchParams),
    );

    const where: Prisma.ApprovalWhereInput = {
      ...(query.status ? { status: toUpperSnake(query.status) as never } : {}),
      ...(query.priority ? { priority: toUpperSnake(query.priority) as never } : {}),
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
      prisma.approval.count({ where }),
      prisma.approval.findMany({
        where,
        include: { requestedBy: true, decidedBy: true },
        orderBy: { submittedAt: "desc" },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
    ]);

    return NextResponse.json({
      data: rows.map(serializeApproval),
      pagination: paginate(query.page, query.pageSize, total),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
