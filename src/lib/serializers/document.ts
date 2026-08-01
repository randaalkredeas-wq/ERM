import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { toKebab } from "@/lib/serializers/risk";
import type { DocumentItem } from "@/types";

export type DocumentWithOwner = Prisma.DocumentGetPayload<{
  include: { owner: true };
}>;

function formatBytes(bytes: number): string {
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
  if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export function serializeDocument(document: DocumentWithOwner): DocumentItem {
  return {
    id: document.id,
    name: document.name,
    category: document.category,
    owner: document.owner.name,
    version: document.version,
    updatedAt: document.updatedAt.toISOString().slice(0, 10),
    size: formatBytes(document.size),
    fileType: toKebab(document.fileType),
  };
}
