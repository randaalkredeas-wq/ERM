import { NextResponse, type NextRequest } from "next/server";

import { handleApiError, logAudit, NotFoundError, requireApiUser } from "@/lib/api-utils";
import { requirePermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { serializeUser } from "@/lib/serializers/user";
import { toUpperSnake } from "@/lib/serializers/risk";
import { UserUpdateSchema } from "@/lib/validation/user";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const actor = await requireApiUser();
    requirePermission(actor.role, "users", "manage");

    const { id } = await params;
    const body = UserUpdateSchema.parse(await request.json());

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("User not found.");

    const updated = await prisma.user.update({
      where: { id },
      data: {
        name: body.name,
        role: body.role,
        jobTitle: body.jobTitle,
        department: body.department,
        status: body.status ? (toUpperSnake(body.status) as never) : undefined,
      },
    });

    await logAudit({
      userId: actor.id,
      action: "Updated user",
      module: "Users",
      details: `${updated.name} (${updated.email})`,
    });

    return NextResponse.json({ data: serializeUser(updated) });
  } catch (error) {
    return handleApiError(error);
  }
}
