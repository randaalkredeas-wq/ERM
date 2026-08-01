import { readFile } from "node:fs/promises";

import { NextResponse, type NextRequest } from "next/server";

import { handleApiError, NotFoundError, requireApiUser } from "@/lib/api-utils";
import { requirePermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { mimeTypeFor, resolveStoragePath } from "@/lib/storage";
import { toKebab } from "@/lib/serializers/risk";
import { findRiskRowByCode } from "@/lib/server/risk-helpers";
import type { AttachmentType } from "@/types";

type RouteParams = { params: Promise<{ id: string; attachmentId: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireApiUser();
    requirePermission(user.role, "riskRegister", "view");

    const { id, attachmentId } = await params;
    const existing = await findRiskRowByCode(id);
    const attachment = await prisma.riskAttachment.findFirst({
      where: { id: attachmentId, riskId: existing.id },
    });
    if (!attachment) throw new NotFoundError("Attachment not found.");

    const buffer = await readFile(resolveStoragePath(attachment.storageKey));
    const type = toKebab<AttachmentType>(attachment.type);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": mimeTypeFor(type),
        "Content-Disposition": `attachment; filename="${encodeURIComponent(attachment.name)}"`,
        "Content-Length": String(buffer.byteLength),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
