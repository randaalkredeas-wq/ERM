"use client";

import {
  ArrowLeft,
  Check,
  FileCheck2,
  GitBranch,
  History,
  RotateCcw,
  Send,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { use, useState } from "react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Textarea } from "@/components/ui/Textarea";
import { severityTone } from "@/lib/domain";
import { rcsaWorkflowStatusTone } from "@/lib/grc-domain";
import { formatDate } from "@/lib/utils";
import { useLocale } from "@/providers/locale-provider";

import { useRcsa } from "../rcsa-context";

export default function RcsaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { dict } = useLocale();
  const router = useRouter();
  const {
    getAssessment,
    cycles,
    completeSelfAssessment,
    submitForReview,
    approve,
    reject,
    resubmit,
    removeAssessment,
  } = useRcsa();
  const [comment, setComment] = useState("");
  const [leaving, setLeaving] = useState(false);

  const assessment = getAssessment(id);
  if (!assessment) {
    if (!leaving) notFound();
    return null;
  }

  const cycle = cycles.find((c) => c.id === assessment.cycleId);

  function withComment(action: (id: string, comment?: string) => void) {
    action(assessment!.id, comment);
    setComment("");
  }

  return (
    <div className="space-y-6">
      <Link
        href="/rcsa"
        className="text-muted hover:text-foreground print:hidden flex w-fit items-center gap-1.5 text-sm transition-colors"
      >
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
        {dict.rcsa.backToList}
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-muted font-mono text-xs">{assessment.id}</span>
            <Badge tone={rcsaWorkflowStatusTone[assessment.status]} dot>
              {dict.rcsa.enums.workflowStatus[assessment.status]}
            </Badge>
            {cycle && <Badge tone="neutral">{cycle.period}</Badge>}
          </div>
          <h1 className="text-foreground mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            {assessment.process}
          </h1>
          <p className="text-muted mt-1.5 text-sm">
            {assessment.businessUnit} · {assessment.subProcess}
          </p>
        </div>
        <div className="print:hidden flex shrink-0 flex-wrap items-center gap-2">
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              setLeaving(true);
              router.push("/rcsa");
              removeAssessment(assessment.id);
            }}
          >
            <Trash2 className="h-4 w-4" />
            {dict.common.delete}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardTitle className="mb-4">{dict.rcsa.overview}</CardTitle>
          <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <Row label={dict.rcsa.processOwner} value={assessment.owner} />
            <Row label={dict.rcsa.assessor} value={assessment.assessor} />
            <Row
              label={dict.rcsa.columns.inherentRisk}
              value={
                <Badge tone={severityTone[assessment.overallInherentRisk]}>
                  {dict.common[assessment.overallInherentRisk]}
                </Badge>
              }
            />
            <Row
              label={dict.rcsa.columns.residualRisk}
              value={
                <Badge tone={severityTone[assessment.overallResidualRisk]}>
                  {dict.common[assessment.overallResidualRisk]}
                </Badge>
              }
            />
            <Row
              label={dict.rcsa.submitted}
              value={
                assessment.submittedAt
                  ? formatDate(assessment.submittedAt, dict.meta.locale)
                  : "—"
              }
            />
            <Row
              label={dict.rcsa.approved}
              value={
                assessment.approvedAt
                  ? `${formatDate(assessment.approvedAt, dict.meta.locale)} (${assessment.approvedBy})`
                  : "—"
              }
            />
          </dl>
        </Card>

        <Card className="space-y-3">
          <CardTitle>{dict.rcsa.workflow}</CardTitle>
          <Textarea
            rows={2}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={dict.rcsa.commentPlaceholder}
          />
          <div className="flex flex-wrap gap-2">
            {assessment.status === "draft" && (
              <Button size="sm" onClick={() => withComment(completeSelfAssessment)}>
                <ShieldCheck className="h-3.5 w-3.5" />
                {dict.rcsa.completeSelfAssessment}
              </Button>
            )}
            {assessment.status === "self-assessed" && (
              <Button size="sm" onClick={() => withComment(submitForReview)}>
                <Send className="h-3.5 w-3.5" />
                {dict.rcsa.submitForReview}
              </Button>
            )}
            {assessment.status === "under-review" && (
              <>
                <Button size="sm" variant="success" onClick={() => withComment(approve)}>
                  <Check className="h-3.5 w-3.5" />
                  {dict.common.approve}
                </Button>
                <Button size="sm" variant="danger" onClick={() => withComment(reject)}>
                  <X className="h-3.5 w-3.5" />
                  {dict.common.reject}
                </Button>
              </>
            )}
            {assessment.status === "rejected" && (
              <Button size="sm" variant="outline" onClick={() => withComment(resubmit)}>
                <RotateCcw className="h-3.5 w-3.5" />
                {dict.rcsa.resubmit}
              </Button>
            )}
            {assessment.status === "approved" && (
              <p className="text-muted text-sm">{dict.rcsa.workflowComplete}</p>
            )}
          </div>
        </Card>
      </div>

      <Tabs defaultValue="risks">
        <TabsList className="flex-wrap">
          <TabsTrigger value="risks">
            {dict.rcsa.risksAndControls} ({assessment.risks.length})
          </TabsTrigger>
          <TabsTrigger value="reviews">
            {dict.rcsa.reviewHistory} ({assessment.reviewHistory.length})
          </TabsTrigger>
          <TabsTrigger value="versions">
            {dict.rcsa.versionHistory} ({assessment.versions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="risks" className="space-y-4">
          {assessment.risks.map((risk, index) => (
            <Card key={risk.id} className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-muted text-xs font-semibold uppercase tracking-wide">
                    {dict.rcsa.riskNumber.replace("{n}", String(index + 1))} ·{" "}
                    {risk.category}
                  </p>
                  <p className="text-foreground mt-1 text-sm font-medium">
                    {risk.description}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge tone={severityTone[risk.inherentRisk]}>
                  {dict.rcsa.inherentRisk}: {dict.common[risk.inherentRisk]} (
                  {risk.inherentLikelihood}×{risk.inherentImpact})
                </Badge>
                <Badge tone={severityTone[risk.residualRisk]}>
                  {dict.rcsa.residualRisk}: {dict.common[risk.residualRisk]} (
                  {risk.residualLikelihood}×{risk.residualImpact})
                </Badge>
              </div>
              {risk.controls.length > 0 && (
                <div className="border-border space-y-2 border-t pt-3">
                  <p className="text-muted text-xs font-medium">
                    {dict.rcsa.controlsIdentified}
                  </p>
                  {risk.controls.map((control) => (
                    <div
                      key={control.id}
                      className="border-border flex flex-wrap items-center justify-between gap-2 rounded-lg border p-2.5 text-sm"
                    >
                      <span className="text-foreground font-medium">{control.name}</span>
                      <div className="flex gap-2">
                        <Badge tone="neutral">
                          {dict.controlsLibrary.enums.type[control.type]}
                        </Badge>
                        <Badge tone="info">
                          {dict.riskRegister.enums.controlEffectiveness[control.effectiveness]}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {risk.recommendation && (
                <p className="bg-surface-2 text-muted rounded-lg p-2.5 text-xs">
                  {dict.rcsa.actionRecommendation}: {risk.recommendation}
                </p>
              )}
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="reviews">
          <Card className="p-0">
            {assessment.reviewHistory.length === 0 ? (
              <EmptyState icon={FileCheck2} title={dict.rcsa.noReviews} />
            ) : (
              <div className="divide-border divide-y">
                {assessment.reviewHistory.map((review) => (
                  <div key={review.id} className="flex items-start gap-3 p-4">
                    <span className="bg-primary-container text-on-primary-container flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
                      <FileCheck2 className="h-4 w-4" />
                    </span>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-foreground text-sm font-medium">
                          {review.reviewer}
                        </p>
                        <Badge
                          tone={
                            review.decision === "approved"
                              ? "success"
                              : review.decision === "rejected"
                                ? "danger"
                                : "warning"
                          }
                        >
                          {dict.rcsa.enums.reviewDecision[review.decision]}
                        </Badge>
                      </div>
                      <p className="text-muted text-xs">
                        {formatDate(review.date, dict.meta.locale)}
                      </p>
                      <p className="text-muted mt-1.5 text-sm">{review.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="versions">
          <Card className="space-y-3">
            {assessment.versions.map((version, index) => (
              <div
                key={version.id}
                className="border-border flex items-center justify-between gap-3 rounded-xl border p-3"
              >
                <div className="flex items-center gap-3">
                  <span className="bg-primary-container text-on-primary-container flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                    <GitBranch className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-foreground flex items-center gap-2 text-sm font-medium">
                      v{version.version}
                      {index === 0 && <Badge tone="primary">{dict.rcsa.current}</Badge>}
                    </p>
                    <p className="text-muted text-xs">{version.summary}</p>
                  </div>
                </div>
                <div className="text-muted text-end text-xs">
                  <p>{version.editedBy}</p>
                  <p>{formatDate(version.editedAt, dict.meta.locale)}</p>
                </div>
              </div>
            ))}
            {assessment.versions.length === 0 && (
              <EmptyState icon={History} title={dict.rcsa.noVersions} />
            )}
          </Card>
        </TabsContent>
      </Tabs>
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
