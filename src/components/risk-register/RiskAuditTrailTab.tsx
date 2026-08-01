"use client";

import { History } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { useLocale } from "@/providers/locale-provider";
import type { RiskItem } from "@/types";

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
    <Card className="p-0">
      <div className="divide-border divide-y">
        {risk.auditTrail.map((entry) => (
          <div
            key={entry.id}
            className="flex flex-col gap-1 px-6 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="text-foreground text-sm font-medium">
                {entry.action}
              </p>
              <p className="text-muted text-xs">{entry.details}</p>
            </div>
            <div className="text-muted shrink-0 text-end text-xs">
              <p>{entry.user}</p>
              <p>{entry.timestamp}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
