import { NextResponse, type NextRequest } from "next/server";

import { Prisma } from "@/generated/prisma/client";
import {
  BadRequestError,
  handleApiError,
  logAudit,
  requireApiUser,
} from "@/lib/api-utils";
import { requirePermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { serializeDocument } from "@/lib/serializers/document";
import { toUpperSnake } from "@/lib/serializers/risk";
import {
  detectAttachmentType,
  MAX_UPLOAD_BYTES,
  saveUploadedFile,
} from "@/lib/storage";
import { paginate } from "@/lib/validation/common";
import { DocumentListQuerySchema } from "@/lib/validation/document";

export async function GET(request: NextRequest) {
  try {
    const user = await requireApiUser();
    requirePermission(user.role, "documents", "view");

    const query = DocumentListQuerySchema.parse(
      Object.fromEntries(request.nextUrl.searchParams),
    );

    const where: Prisma.DocumentWhereInput = {
      ...(query.category ? { category: query.category } : {}),
      ...(query.search
        ? { name: { contains: query.search, mode: "insensitive" } }
        : {}),
    };

    const [total, rows] = await Promise.all([
      prisma.document.count({ where }),
      prisma.document.findMany({
        where,
        include: { owner: true },
        orderBy: { updatedAt: "desc" },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
    ]);

    return NextResponse.json({
      data: rows.map(serializeDocument),
      pagination: paginate(query.page, query.pageSize, total),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireApiUser();
    requirePermission(user.role, "documents", "create");

    const formData = await request.formData();
    const file = formData.get("file");
    const category = formData.get("category");
    if (!(file instanceof File)) throw new BadRequestError("No file provided.");
    if (typeof category !== "string" || !category.trim()) {
      throw new BadRequestError("A category is required.");
    }
    if (file.size === 0) throw new BadRequestError("The file is empty.");
    if (file.size > MAX_UPLOAD_BYTES) {
      throw new BadRequestError("File exceeds the 20 MB upload limit.");
    }

    const detectedType = detectAttachmentType(file.name, file.type);
    if (!detectedType || detectedType === "image") {
      throw new BadRequestError(
        "Unsupported file type. Allowed: PDF, Word, Excel, PowerPoint.",
      );
    }

    const { storageKey, size } = await saveUploadedFile(file, "documents");

    const document = await prisma.document.create({
      data: {
        name: file.name,
        category: category.trim(),
        ownerId: user.id,
        version: "1.0",
        storageKey,
        size,
        fileType: toUpperSnake(detectedType) as never,
      },
      include: { owner: true },
    });

    await logAudit({
      userId: user.id,
      action: "Uploaded document",
      module: "Documents",
      details: document.name,
    });

    return NextResponse.json({ data: serializeDocument(document) }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
