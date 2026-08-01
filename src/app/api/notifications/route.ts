import { NextResponse } from "next/server";

import { handleApiError, requireApiUser } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";
import { serializeNotification } from "@/lib/serializers/notification";

export async function GET() {
  try {
    const user = await requireApiUser();

    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ data: notifications.map(serializeNotification) });
  } catch (error) {
    return handleApiError(error);
  }
}
