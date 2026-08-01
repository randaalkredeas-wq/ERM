"use client";

import { ChevronDown, GitBranch, History } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { severityTone } from "@/lib/domain";
import { cn, formatDate } from "@/lib/utils";
import { useLocale } from "@/providers/locale-provider";
import type { RiskItem } from "@/types";

export function RiskVersionsTab({ risk }: { risk: RiskItem }) {
  const { dict } = useLocale();
  const [expanded, setExpanded] = useState<string | null>(null);

  if (risk.versions.length === 0) {
    return (
      <Card>
        <EmptyState icon={History} title={dict.riskDetail.versions.empty} />
      </Card>
    );
  }

  return (
    <Card className="space-y-3">
      {risk.versions.map((version, index) => {
        const isOpen = expanded === version.id;
        return (
          <div key={version.id} className="border-border rounded-xl border">
            <button
              type="button"
              onClick={() => setExpanded(isOpen ? null : version.id)}
              className="flex w-full items-center justify-between gap-3 p-3 text-start"
            >
              <div className="flex items-center gap-3">
                <span className="bg-primary-container text-on-primary-container flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                  <GitBranch className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-foreground flex items-center gap-2 text-sm font-medium">
                    v{version.version}
                    {index === 0 && (
                      <Badge tone="primary">
                        {dict.riskDetail.versions.current}
                      </Badge>
                    )}
                  </p>
                  <p className="text-muted text-xs">{version.summary}</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <div className="text-muted text-end text-xs">
                  <p>{version.editedBy}</p>
                  <p>{formatDate(version.editedAt, dict.meta.locale)}</p>
                </div>
                <ChevronDown
                  className={cn(
                    "text-muted h-4 w-4 transition-transform",
                    isOpen && "rotate-180",
                  )}
                />
              </div>
            </button>
            {isOpen && (
              <div className="border-border grid grid-cols-2 gap-3 border-t p-3 text-xs sm:grid-cols-4">
                <div>
                  <p className="text-muted">{dict.riskRegister.form.title}</p>
                  <p className="text-foreground mt-0.5 font-medium">
                    {version.snapshot.title}
                  </p>
                </div>
                <div>
                  <p className="text-muted">{dict.common.status}</p>
                  <p className="text-foreground mt-0.5 font-medium">
                    {
                      dict.common[
                        version.snapshot.status === "mitigating"
                          ? "inProgress"
                          : version.snapshot.status === "pending-approval"
                            ? "pending"
                            : version.snapshot.status
                      ]
                    }
                  </p>
                </div>
                <div>
                  <p className="text-muted">
                    {dict.riskRegister.form.likelihood} /{" "}
                    {dict.riskRegister.form.impact}
                  </p>
                  <p className="text-foreground mt-0.5 font-medium">
                    {version.snapshot.likelihood} / {version.snapshot.impact}
                  </p>
                </div>
                <div>
                  <p className="text-muted">
                    {dict.riskRegister.form.inherentRisk}
                  </p>
                  <Badge
                    tone={severityTone[version.snapshot.inherentRisk]}
                    className="mt-0.5"
                  >
                    {dict.common[version.snapshot.inherentRisk]}
                  </Badge>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </Card>
  );
}
