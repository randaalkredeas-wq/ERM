"use client";

import { Check, ClipboardCheck, X } from "lucide-react";
import { useState } from "react";

import { useRiskRegister } from "@/app/(app)/risk-register/risk-register-context";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Textarea } from "@/components/ui/Textarea";
import { approvalStepStatusTone } from "@/lib/domain";
import { cn, formatDate } from "@/lib/utils";
import { useLocale } from "@/providers/locale-provider";
import type { RiskItem } from "@/types";

export function RiskApprovalsTab({ risk }: { risk: RiskItem }) {
  const { dict } = useLocale();
  const { submitForApproval, actionApprovalStep } = useRiskRegister();
  const [note, setNote] = useState("");

  if (risk.approvals.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={ClipboardCheck}
          title={dict.riskDetail.approvals.empty}
          action={
            <Button onClick={() => submitForApproval(risk.id)}>
              {dict.riskDetail.approvals.startWorkflow}
            </Button>
          }
        />
      </Card>
    );
  }

  return (
    <Card className="space-y-4">
      {risk.approvals.map((step, index) => (
        <div key={step.id} className="flex gap-4">
          <div className="flex flex-col items-center">
            <span
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                step.status === "approved" &&
                  "bg-success-container text-success",
                step.status === "rejected" && "bg-danger-container text-danger",
                step.status === "pending" &&
                  "bg-warning-container text-warning",
                step.status === "waiting" && "bg-surface-2 text-muted",
              )}
            >
              {index + 1}
            </span>
            {index < risk.approvals.length - 1 && (
              <span className="bg-border mt-1 h-full w-px flex-1" />
            )}
          </div>
          <div className="flex-1 pb-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-foreground text-sm font-semibold">
                  {step.role}
                </p>
                <p className="text-muted text-xs">{step.approver}</p>
              </div>
              <Badge tone={approvalStepStatusTone[step.status]}>
                {dict.common[
                  step.status === "waiting" ? "waiting" : step.status
                ] ?? step.status}
              </Badge>
            </div>
            {step.date && (
              <p className="text-muted mt-1 text-xs">
                {formatDate(step.date, dict.meta.locale)}
              </p>
            )}
            {step.comment && (
              <p className="bg-surface-2 text-muted mt-2 rounded-lg p-2 text-xs">
                {step.comment}
              </p>
            )}
            {step.status === "pending" && (
              <div className="mt-3 space-y-2">
                <Textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={dict.riskDetail.approvals.commentPlaceholder}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="success"
                    onClick={() => {
                      actionApprovalStep(risk.id, step.id, "approved", note);
                      setNote("");
                    }}
                  >
                    <Check className="h-3.5 w-3.5" />
                    {dict.riskDetail.approvals.approveStep}
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => {
                      actionApprovalStep(risk.id, step.id, "rejected", note);
                      setNote("");
                    }}
                  >
                    <X className="h-3.5 w-3.5" />
                    {dict.riskDetail.approvals.rejectStep}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </Card>
  );
}
