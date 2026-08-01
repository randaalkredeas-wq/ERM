"use client";

import { Check, GitPullRequest, RotateCcw, Send, X, XCircle } from "lucide-react";
import { useState } from "react";

import { useRiskRegister } from "@/app/(app)/risk-register/risk-register-context";
import { ApiError } from "@/lib/api-client";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";
import { workflowStatusTone } from "@/lib/domain";
import { formatDate } from "@/lib/utils";
import { useLocale } from "@/providers/locale-provider";
import type { RiskItem } from "@/types";

export function RiskWorkflowTab({ risk }: { risk: RiskItem }) {
  const { dict } = useLocale();
  const { submitForReview, approveRisk, rejectRisk, closeRisk, reopenRisk } =
    useRiskRegister();
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function withComment(
    action: (id: string, comment?: string) => Promise<RiskItem>,
  ) {
    setError(null);
    try {
      await action(risk.id, comment);
      setComment("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Action failed.");
    }
  }

  return (
    <div className="space-y-6">
      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-muted text-xs font-medium">
              {dict.riskDetail.workflow.currentStatus}
            </p>
            <Badge tone={workflowStatusTone[risk.workflowStatus]} dot className="mt-1">
              {dict.riskRegister.enums.workflowStatus[risk.workflowStatus]}
            </Badge>
          </div>
        </div>

        <Textarea
          rows={2}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={dict.riskDetail.workflow.commentPlaceholder}
        />

        {error && <p className="text-danger text-sm">{error}</p>}

        <div className="flex flex-wrap gap-2">
          {risk.workflowStatus === "draft" && (
            <Button size="sm" onClick={() => void withComment(submitForReview)}>
              <Send className="h-3.5 w-3.5" />
              {dict.riskDetail.workflow.submitForReview}
            </Button>
          )}
          {risk.workflowStatus === "under-review" && (
            <>
              <Button
                size="sm"
                variant="success"
                onClick={() => void withComment(approveRisk)}
              >
                <Check className="h-3.5 w-3.5" />
                {dict.riskDetail.workflow.approve}
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => void withComment(rejectRisk)}
              >
                <X className="h-3.5 w-3.5" />
                {dict.riskDetail.workflow.reject}
              </Button>
            </>
          )}
          {risk.workflowStatus === "approved" && (
            <>
              <Button size="sm" onClick={() => void withComment(closeRisk)}>
                <XCircle className="h-3.5 w-3.5" />
                {dict.riskDetail.workflow.close}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => void withComment(reopenRisk)}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                {dict.riskDetail.workflow.reopen}
              </Button>
            </>
          )}
          {risk.workflowStatus === "rejected" && (
            <>
              <Button size="sm" onClick={() => void withComment(submitForReview)}>
                <Send className="h-3.5 w-3.5" />
                {dict.riskDetail.workflow.submitForReview}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => void withComment(reopenRisk)}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                {dict.riskDetail.workflow.reopen}
              </Button>
            </>
          )}
          {risk.workflowStatus === "closed" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => void withComment(reopenRisk)}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {dict.riskDetail.workflow.reopen}
            </Button>
          )}
        </div>
      </Card>

      <Card className="p-0">
        <CardTitle className="p-6 pb-0">
          {dict.riskDetail.workflow.historyTitle}
        </CardTitle>
        {risk.workflowHistory.length === 0 ? (
          <p className="text-muted p-6 text-sm">
            {dict.riskDetail.workflow.noHistory}
          </p>
        ) : (
          <div className="space-y-0 p-6 pt-4">
            {risk.workflowHistory.map((transition, index) => (
              <div key={transition.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <span className="bg-primary-container text-on-primary-container flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                    <GitPullRequest className="h-4 w-4" />
                  </span>
                  {index < risk.workflowHistory.length - 1 && (
                    <span className="bg-border mt-1 h-full w-px flex-1" />
                  )}
                </div>
                <div className="flex-1 pb-6">
                  <p className="text-foreground text-sm font-medium">
                    {dict.riskRegister.enums.workflowStatus[transition.fromStatus]}
                    {" → "}
                    {dict.riskRegister.enums.workflowStatus[transition.toStatus]}
                  </p>
                  <p className="text-muted text-xs">
                    {transition.actor} · {formatDate(transition.timestamp, dict.meta.locale)}
                  </p>
                  {transition.comment && (
                    <p className="bg-surface-2 text-muted mt-2 rounded-lg p-2 text-xs">
                      {transition.comment}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
