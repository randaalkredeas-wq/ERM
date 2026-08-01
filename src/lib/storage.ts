import "server-only";

import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

import type { AttachmentType } from "@/types";

/**
 * Local-disk file storage, kept behind this module so a future swap to
 * cloud object storage (S3/Azure Blob) only touches this file - callers
 * only deal with opaque `storageKey` strings.
 */
const UPLOADS_ROOT = path.resolve(process.cwd(), process.env.UPLOADS_DIR ?? "./uploads");

const EXTENSION_BY_TYPE: Record<Exclude<AttachmentType, "other">, string[]> = {
  pdf: [".pdf"],
  doc: [".doc", ".docx"],
  xls: [".xls", ".xlsx"],
  ppt: [".ppt", ".pptx"],
  image: [".png", ".jpg", ".jpeg", ".gif", ".webp"],
};

const MIME_BY_TYPE: Record<Exclude<AttachmentType, "other">, string[]> = {
  pdf: ["application/pdf"],
  doc: [
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  xls: [
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ],
  ppt: [
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ],
  image: ["image/png", "image/jpeg", "image/gif", "image/webp"],
};

export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024; // 20 MB

export function mimeTypeFor(type: AttachmentType): string {
  if (type === "other") return "application/octet-stream";
  return MIME_BY_TYPE[type][0];
}

/** Infers the attachment type from a file's extension/MIME, or null if unsupported. */
export function detectAttachmentType(
  filename: string,
  mimeType: string,
): Exclude<AttachmentType, "other"> | null {
  const ext = path.extname(filename).toLowerCase();
  for (const type of Object.keys(EXTENSION_BY_TYPE) as (keyof typeof EXTENSION_BY_TYPE)[]) {
    if (EXTENSION_BY_TYPE[type].includes(ext) || MIME_BY_TYPE[type].includes(mimeType)) {
      return type;
    }
  }
  return null;
}

export async function saveUploadedFile(
  file: File,
  subdir: string,
): Promise<{ storageKey: string; size: number }> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = path.extname(file.name).toLowerCase();
  const safeName = `${randomUUID()}${ext}`;
  const relativeDir = subdir;
  const dir = path.join(UPLOADS_ROOT, relativeDir);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, safeName), buffer);
  return { storageKey: path.join(relativeDir, safeName), size: buffer.byteLength };
}

export function resolveStoragePath(storageKey: string): string {
  const resolved = path.resolve(UPLOADS_ROOT, storageKey);
  if (!resolved.startsWith(UPLOADS_ROOT)) {
    throw new Error("Invalid storage key.");
  }
  return resolved;
}

export async function deleteStoredFile(storageKey: string): Promise<void> {
  try {
    await unlink(resolveStoragePath(storageKey));
  } catch {
    // Best-effort: a missing file on disk shouldn't block deleting the record.
  }
}
