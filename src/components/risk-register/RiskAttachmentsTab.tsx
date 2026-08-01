"use client";

import {
  File,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  Paperclip,
  Presentation,
  Trash2,
  Upload,
  type LucideIcon,
} from "lucide-react";
import { useRef } from "react";

import { useRiskRegister } from "@/app/(app)/risk-register/risk-register-context";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils";
import { useLocale } from "@/providers/locale-provider";
import type { AttachmentType, RiskItem } from "@/types";

const typeMeta: Record<
  AttachmentType,
  { icon: LucideIcon; className: string }
> = {
  pdf: { icon: FileText, className: "bg-danger-container text-danger" },
  doc: { icon: FileText, className: "bg-info-container text-info" },
  xls: {
    icon: FileSpreadsheet,
    className: "bg-success-container text-success",
  },
  ppt: { icon: Presentation, className: "bg-warning-container text-warning" },
  image: {
    icon: ImageIcon,
    className: "bg-primary-container text-on-primary-container",
  },
  other: { icon: File, className: "bg-surface-2 text-muted" },
};

function inferType(fileName: string): AttachmentType {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "pdf") return "pdf";
  if (["doc", "docx"].includes(ext)) return "doc";
  if (["xls", "xlsx", "csv"].includes(ext)) return "xls";
  if (["ppt", "pptx"].includes(ext)) return "ppt";
  if (["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext))
    return "image";
  return "other";
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function RiskAttachmentsTab({ risk }: { risk: RiskItem }) {
  const { dict } = useLocale();
  const { addAttachment, removeAttachment } = useRiskRegister();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFiles(files: FileList | null) {
    if (!files) return;
    Array.from(files).forEach((file) => {
      addAttachment(risk.id, {
        name: file.name,
        type: inferType(file.name),
        size: formatSize(file.size),
        objectUrl: URL.createObjectURL(file),
      });
    });
  }

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-foreground text-sm font-semibold">
          {risk.attachments.length}
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <Button size="sm" onClick={() => inputRef.current?.click()}>
          <Upload className="h-4 w-4" />
          {dict.riskDetail.attachments.upload}
        </Button>
      </div>

      {risk.attachments.length === 0 ? (
        <EmptyState
          icon={Paperclip}
          title={dict.riskDetail.attachments.empty}
          description={dict.riskDetail.attachments.emptyHint}
        />
      ) : (
        <div className="space-y-2">
          {risk.attachments.map((attachment) => {
            const meta = typeMeta[attachment.type];
            const Icon = meta.icon;
            const body = (
              <>
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${meta.className}`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-foreground truncate text-sm font-medium">
                    {attachment.name}
                  </p>
                  <p className="text-muted text-xs">
                    {dict.riskDetail.attachments.uploadedBy}{" "}
                    {attachment.uploadedBy} ·{" "}
                    {formatDate(attachment.uploadedAt, dict.meta.locale)} ·{" "}
                    {attachment.size}
                  </p>
                </div>
              </>
            );
            return (
              <div
                key={attachment.id}
                className="border-border flex items-center gap-3 rounded-xl border p-3"
              >
                {attachment.objectUrl ? (
                  <a
                    href={attachment.objectUrl}
                    download={attachment.name}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-w-0 flex-1 items-center gap-3"
                  >
                    {body}
                  </a>
                ) : (
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    {body}
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeAttachment(risk.id, attachment.id)}
                >
                  <Trash2 className="text-danger h-4 w-4" />
                  <span className="sr-only">
                    {dict.riskDetail.attachments.remove}
                  </span>
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
