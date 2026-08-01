import { NextResponse } from "next/server";

import { handleApiError, requireApiUser } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const user = await requireApiUser();

    await prisma.notification.updateMany({
      where: { userId: user.id, read: false },
      data: { read: true },
    });

    return NextResponse.json({ data: { ok: true } });
  } catch (error) {
    return handleApiError(error);
  }
}
