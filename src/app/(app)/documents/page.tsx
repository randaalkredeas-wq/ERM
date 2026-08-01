"use client";

import {
  FileSpreadsheet,
  FileText,
  Presentation,
  Upload,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState } from "react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { documentCategories, documents } from "@/lib/mock-data/documents";
import { cn, formatDate } from "@/lib/utils";
import { useLocale } from "@/providers/locale-provider";
import type { DocumentItem } from "@/types";

const fileTypeMeta: Record<
  DocumentItem["fileType"],
  { icon: LucideIcon; className: string }
> = {
  pdf: { icon: FileText, className: "bg-danger-container text-danger" },
  doc: { icon: FileText, className: "bg-info-container text-info" },
  xls: {
    icon: FileSpreadsheet,
    className: "bg-success-container text-success",
  },
  ppt: {
    icon: Presentation,
    className: "bg-warning-container text-warning",
  },
};

export default function DocumentsPage() {
  const { dict } = useLocale();
  const [category, setCategory] = useState("All");

  const filtered = useMemo(
    () =>
      category === "All"
        ? documents
        : documents.filter((d) => d.category === category),
    [category],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={dict.documents.title}
        subtitle={dict.documents.subtitle}
        actions={
          <Button size="sm">
            <Upload className="h-4 w-4" />
            {dict.documents.uploadDocument}
          </Button>
        }
      />

      <div className="flex flex-wrap gap-2">
        {documentCategories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
              category === c
                ? "border-primary bg-primary-container text-on-primary-container"
                : "border-border text-muted hover:bg-surface-2",
            )}
          >
            {c === "All" ? dict.documents.allDocuments : c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((doc) => {
          const meta = fileTypeMeta[doc.fileType];
          const Icon = meta.icon;
          return (
            <Card key={doc.id} className="flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <span
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-xl",
                    meta.className,
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <Badge tone="neutral">{doc.category}</Badge>
              </div>
              <div>
                <p className="text-foreground line-clamp-2 text-sm font-semibold">
                  {doc.name}
                </p>
                <p className="text-muted mt-1 text-xs">
                  v{doc.version} · {doc.size}
                </p>
              </div>
              <div className="border-border text-muted mt-auto flex items-center justify-between border-t pt-3 text-xs">
                <span>{doc.owner}</span>
                <span>{formatDate(doc.updatedAt, dict.meta.locale)}</span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
