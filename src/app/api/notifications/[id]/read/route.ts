import { NextResponse, type NextRequest } from "next/server";

import { handleApiError, NotFoundError, requireApiUser } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(_request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireApiUser();
    const { id } = await params;

    const notification = await prisma.notification.findFirst({
      where: { id, userId: user.id },
    });
    if (!notification) throw new NotFoundError("Notification not found.");

    await prisma.notification.update({ where: { id }, data: { read: true } });

    return NextResponse.json({ data: { id, read: true } });
  } catch (error) {
    return handleApiError(error);
  }
}
