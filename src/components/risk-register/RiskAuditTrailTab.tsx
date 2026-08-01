"use client";

import {
  Archive,
  ClipboardList,
  FilePlus,
  GitPullRequest,
  History,
  MessageSquare,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";

import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { useLocale } from "@/providers/locale-provider";
import type { RiskAuditEntry, RiskItem } from "@/types";

type TimelineIconKey =
  | "created"
  | "comment"
  | "attachment"
  | "workflow"
  | "treatment"
  | "archive"
  | "delete"
  | "edit";

function iconKeyFor(action: string): TimelineIconKey {
  const a = action.toLowerCase();
  if (a.includes("created")) return "created";
  if (a.includes("comment")) return "comment";
  if (a.includes("attachment")) return "attachment";
  if (a.includes("workflow")) return "workflow";
  if (a.includes("treatment")) return "treatment";
  if (a.includes("archived") || a.includes("restored")) return "archive";
  if (a.includes("deleted") || a.includes("removed")) return "delete";
  return "edit";
}

function TimelineIcon({ iconKey }: { iconKey: TimelineIconKey }) {
  switch (iconKey) {
    case "created":
      return <Plus className="h-4 w-4" />;
    case "comment":
      return <MessageSquare className="h-4 w-4" />;
    case "attachment":
      return <FilePlus className="h-4 w-4" />;
    case "workflow":
      return <GitPullRequest className="h-4 w-4" />;
    case "treatment":
      return <ClipboardList className="h-4 w-4" />;
    case "archive":
      return <Archive className="h-4 w-4" />;
    case "delete":
      return <Trash2 className="h-4 w-4" />;
    case "edit":
      return <Pencil className="h-4 w-4" />;
  }
}

function TimelineEntry({
  entry,
  isLast,
}: {
  entry: RiskAuditEntry;
  isLast: boolean;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <span className="bg-primary-container text-on-primary-container flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
          <TimelineIcon iconKey={iconKeyFor(entry.action)} />
        </span>
        {!isLast && <span className="bg-border mt-1 h-full w-px flex-1" />}
      </div>
      <div className="flex-1 pb-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-foreground text-sm font-medium">
            {entry.action}
          </p>
          <p className="text-muted shrink-0 text-xs">{entry.timestamp}</p>
        </div>
        <p className="text-muted text-xs">{entry.details}</p>
        <p className="text-muted mt-1 text-xs font-medium">{entry.user}</p>
      </div>
    </div>
  );
}

export function RiskAuditTrailTab({ risk }: { risk: RiskItem }) {
  const { dict } = useLocale();

  if (risk.auditTrail.length === 0) {
    return (
      <Card>
        <EmptyState icon={History} title={dict.riskDetail.audit.empty} />
      </Card>
    );
  }

  return (
    <Card>
      {risk.auditTrail.map((entry, index) => (
        <TimelineEntry
          key={entry.id}
          entry={entry}
          isLast={index === risk.auditTrail.length - 1}
        />
      ))}
    </Card>
  );
}
