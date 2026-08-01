import { NextResponse, type NextRequest } from "next/server";

import {
  handleApiError,
  logAudit,
  NotFoundError,
  requireApiUser,
} from "@/lib/api-utils";
import { can, ForbiddenError } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { deleteStoredFile } from "@/lib/storage";

type RouteParams = { params: Promise<{ id: string }> };

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireApiUser();
    const { id } = await params;

    const existing = await prisma.document.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Document not found.");

    const isOwner = existing.ownerId === user.id;
    if (!isOwner && !can(user.role, "documents", "delete")) {
      throw new ForbiddenError();
    }

    await prisma.document.delete({ where: { id } });
    await deleteStoredFile(existing.storageKey);

    await logAudit({
      userId: user.id,
      action: "Deleted document",
      module: "Documents",
      details: existing.name,
    });

    return NextResponse.json({ data: { id } });
  } catch (error) {
    return handleApiError(error);
  }
}
