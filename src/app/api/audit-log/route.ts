import { NextResponse, type NextRequest } from "next/server";

import { Prisma } from "@/generated/prisma/client";
import { handleApiError, requireApiUser } from "@/lib/api-utils";
import { requirePermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { serializeAuditLogEntry } from "@/lib/serializers/audit-log";
import { AuditLogQuerySchema } from "@/lib/validation/audit-log";
import { paginate } from "@/lib/validation/common";

export async function GET(request: NextRequest) {
  try {
    const user = await requireApiUser();
    requirePermission(user.role, "auditLog", "view");

    const query = AuditLogQuerySchema.parse(
      Object.fromEntries(request.nextUrl.searchParams),
    );

    const where: Prisma.AuditLogEntryWhereInput = {
      ...(query.module ? { module: query.module } : {}),
      ...(query.userId ? { userId: query.userId } : {}),
      ...(query.dateFrom || query.dateTo
        ? {
            createdAt: {
              ...(query.dateFrom ? { gte: new Date(query.dateFrom) } : {}),
              ...(query.dateTo
                ? { lte: new Date(`${query.dateTo}T23:59:59.999Z`) }
                : {}),
            },
          }
        : {}),
      ...(query.search
        ? {
            OR: [
              { action: { contains: query.search, mode: "insensitive" } },
              { details: { contains: query.search, mode: "insensitive" } },
              { module: { contains: query.search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [total, rows] = await Promise.all([
      prisma.auditLogEntry.count({ where }),
      prisma.auditLogEntry.findMany({
        where,
        include: { user: true },
        orderBy: { createdAt: "desc" },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
    ]);

    return NextResponse.json({
      data: rows.map(serializeAuditLogEntry),
      pagination: paginate(query.page, query.pageSize, total),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
