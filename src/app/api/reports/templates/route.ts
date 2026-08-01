import { NextResponse } from "next/server";

import { handleApiError, requireApiUser } from "@/lib/api-utils";
import { requirePermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { serializeReportTemplate } from "@/lib/serializers/report";

export async function GET() {
  try {
    const user = await requireApiUser();
    requirePermission(user.role, "reports", "view");

    const templates = await prisma.reportTemplate.findMany({ orderBy: { name: "asc" } });
    return NextResponse.json({ data: templates.map(serializeReportTemplate) });
  } catch (error) {
    return handleApiError(error);
  }
}
