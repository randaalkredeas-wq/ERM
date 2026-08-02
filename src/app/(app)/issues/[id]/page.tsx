"use client";

import { ArrowLeft, MessageSquare, ShieldCheck, TriangleAlert, Trash2 } from "lucide-react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { use, useState } from "react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { RISK_OWNERS } from "@/constants/risk-register";
import { issuePriorityTone, issueStatusTone } from "@/lib/grc-domain";
import { formatDate } from "@/lib/utils";
import { useLocale } from "@/providers/locale-provider";

import { useIssues } from "../issues-context";

export default function IssueDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { dict } = useLocale();
  const router = useRouter();
  const { getIssue, addComment, escalate, startProgress, resolve, close, removeIssue } =
    useIssues();

  const [comment, setComment] = useState("");
  const [escalateTo, setEscalateTo] = useState<string>(RISK_OWNERS[0]);
  const [closureEvidence, setClosureEvidence] = useState("");
  const [leaving, setLeaving] = useState(false);

  const issue = getIssue(id);
  if (!issue) {
    if (!leaving) notFound();
    return null;
  }

  return (
    <div className="space-y-6">
      <Link
        href="/issues"
        className="text-muted hover:text-foreground print:hidden flex w-fit items-center gap-1.5 text-sm transition-colors"
      >
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
        {dict.issues.backToList}
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-muted font-mono text-xs">{issue.id}</span>
            <Badge tone={issueStatusTone[issue.status]} dot>
              {dict.issues.enums.status[issue.status]}
            </Badge>
            <Badge tone={issuePriorityTone[issue.priority]}>{dict.common[issue.priority]}</Badge>
          </div>
          <h1 className="text-foreground mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            {issue.title}
          </h1>
          <p className="text-muted mt-1.5 text-sm">{dict.issues.enums.source[issue.source]}</p>
        </div>
        <div className="print:hidden flex shrink-0 flex-wrap items-center gap-2">
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              setLeaving(true);
              router.push("/issues");
              removeIssue(issue.id);
            }}
          >
            <Trash2 className="h-4 w-4" />
            {dict.common.delete}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 space-y-3">
          <CardTitle>{dict.rcsa.overview}</CardTitle>
          <p className="text-foreground text-sm">{issue.description}</p>
          <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <Row label={dict.common.owner} value={issue.owner} />
            <Row label={dict.issues.columns.dueDate} value={formatDate(issue.dueDate, dict.meta.locale)} />
            <Row
              label={dict.issues.columns.relatedRisk}
              value={
                issue.relatedRiskId ? (
                  <Link href="/risk-register" className="hover:text-primary hover:underline">
                    {issue.relatedRiskId}
                  </Link>
                ) : (
                  "—"
                )
              }
            />
            <Row
              label={dict.issues.columns.relatedIncident}
              value={
                issue.relatedIncidentId ? (
                  <Link
                    href={`/incidents/${issue.relatedIncidentId}`}
                    className="hover:text-primary hover:underline"
                  >
                    {issue.relatedIncidentId}
                  </Link>
                ) : (
                  "—"
                )
              }
            />
          </dl>
          {issue.escalated && (
            <div className="bg-danger-container text-danger flex items-start gap-2 rounded-lg p-3 text-sm">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                {dict.issues.escalatedTo.replace("{name}", issue.escalatedTo ?? "")}{" "}
                {formatDate(issue.escalatedAt ?? "", dict.meta.locale)}
              </p>
            </div>
          )}
          {issue.closureEvidence && (
            <div className="border-border border-t pt-3">
              <p className="text-muted text-xs font-medium">{dict.issues.closureEvidence}</p>
              <p className="text-foreground mt-1 text-sm">{issue.closureEvidence}</p>
            </div>
          )}
        </Card>

        <Card className="space-y-3">
          <CardTitle>{dict.rcsa.workflow}</CardTitle>
          <div className="flex flex-wrap gap-2">
            {issue.status === "open" && (
              <Button size="sm" onClick={() => startProgress(issue.id)}>
                {dict.issues.startProgress}
              </Button>
            )}
            {(issue.status === "open" || issue.status === "in-progress") && (
              <Button size="sm" variant="outline" onClick={() => resolve(issue.id)}>
                {dict.issues.markResolved}
              </Button>
            )}
          </div>

          {issue.status !== "closed" && issue.status !== "escalated" && (
            <div className="border-border space-y-2 border-t pt-3">
              <label className="text-muted block text-xs font-medium">
                {dict.issues.escalateTo}
              </label>
              <Select value={escalateTo} onChange={(e) => setEscalateTo(e.target.value)}>
                {RISK_OWNERS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </Select>
              <Button
                size="sm"
                variant="danger"
                className="w-full"
                onClick={() => escalate(issue.id, escalateTo)}
              >
                <TriangleAlert className="h-3.5 w-3.5" />
                {dict.issues.escalate}
              </Button>
            </div>
          )}

          {issue.status === "resolved" && (
            <div className="border-border space-y-2 border-t pt-3">
              <label className="text-muted block text-xs font-medium">
                {dict.issues.closureEvidence}
              </label>
              <Textarea
                rows={2}
                value={closureEvidence}
                onChange={(e) => setClosureEvidence(e.target.value)}
                placeholder={dict.issues.closureEvidencePlaceholder}
              />
              <Button
                size="sm"
                variant="success"
                className="w-full"
                disabled={!closureEvidence.trim()}
                onClick={() => close(issue.id, closureEvidence)}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                {dict.issues.closeIssue}
              </Button>
            </div>
          )}
        </Card>
      </div>

      <Card className="space-y-3 p-0">
        <CardTitle className="p-4 pb-0">
          {dict.issues.comments} ({issue.comments.length})
        </CardTitle>
        {issue.comments.length === 0 ? (
          <EmptyState icon={MessageSquare} title={dict.issues.noComments} />
        ) : (
          <div className="divide-border divide-y">
            {issue.comments.map((c) => (
              <div key={c.id} className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-foreground text-sm font-medium">{c.author}</p>
                  <p className="text-muted text-xs">{formatDate(c.createdAt, dict.meta.locale)}</p>
                </div>
                <p className="text-muted mt-1 text-sm">{c.message}</p>
              </div>
            ))}
          </div>
        )}
        {issue.status !== "closed" && (
          <div className="flex gap-2 p-4 pt-0">
            <Input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={dict.issues.commentPlaceholder}
            />
            <Button
              size="sm"
              onClick={() => {
                addComment(issue.id, comment);
                setComment("");
              }}
              disabled={!comment.trim()}
            >
              {dict.issues.postComment}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
      <dt className="text-muted shrink-0">{label}</dt>
      <dd className="text-foreground text-end font-medium">{value}</dd>
    </div>
  );
}
