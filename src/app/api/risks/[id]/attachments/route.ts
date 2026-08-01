import { NextResponse, type NextRequest } from "next/server";

import {
  BadRequestError,
  handleApiError,
  logAudit,
  requireApiUser,
} from "@/lib/api-utils";
import { canActOnRisk, requirePermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { serializeRisk, toUpperSnake } from "@/lib/serializers/risk";
import {
  detectAttachmentType,
  MAX_UPLOAD_BYTES,
  saveUploadedFile,
} from "@/lib/storage";
import {
  findRiskRowByCode,
  findRiskWithRelationsByCode,
} from "@/lib/server/risk-helpers";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireApiUser();
    requirePermission(user.role, "riskRegister", "view");

    const { id } = await params;
    const risk = await findRiskWithRelationsByCode(id);
    return NextResponse.json({ data: serializeRisk(risk).attachments });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireApiUser();
    const { id } = await params;

    const existing = await findRiskRowByCode(id);
    if (!canActOnRisk(user, "edit", existing)) {
      requirePermission(user.role, "riskRegister", "edit");
    }

    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      throw new BadRequestError("No file provided.");
    }
    if (file.size === 0) {
      throw new BadRequestError("The file is empty.");
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      throw new BadRequestError("File exceeds the 20 MB upload limit.");
    }
    const detectedType = detectAttachmentType(file.name, file.type);
    if (!detectedType) {
      throw new BadRequestError(
        "Unsupported file type. Allowed: PDF, Word, Excel, PowerPoint, images.",
      );
    }

    const { storageKey, size } = await saveUploadedFile(file, existing.code);

    await prisma.risk.update({
      where: { id: existing.id },
      data: {
        attachments: {
          create: {
            name: file.name,
            type: toUpperSnake(detectedType) as never,
            size,
            storageKey,
            uploadedById: user.id,
          },
        },
        auditTrail: {
          create: {
            userId: user.id,
            action: "Uploaded attachment",
            details: file.name,
          },
        },
      },
    });

    await logAudit({
      userId: user.id,
      action: "Uploaded attachment",
      module: "Risk Register",
      details: `${existing.code} — ${file.name}`,
    });

    const full = await findRiskWithRelationsByCode(existing.code);
    return NextResponse.json({ data: serializeRisk(full) }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
