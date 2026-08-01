"use client";

import { ArchiveRestore, Archive, ArrowLeft, Copy, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { use, useState, type ReactNode } from "react";

import { RiskAttachmentsTab } from "@/components/risk-register/RiskAttachmentsTab";
import { RiskAuditTrailTab } from "@/components/risk-register/RiskAuditTrailTab";
import { RiskCommentsTab } from "@/components/risk-register/RiskCommentsTab";
import { RiskDeleteDialog } from "@/components/risk-register/RiskDeleteDialog";
import { RiskFormDialog } from "@/components/risk-register/RiskFormDialog";
import { RiskMatrixWidget } from "@/components/risk-register/RiskMatrixWidget";
import { RiskTreatmentTab } from "@/components/risk-register/RiskTreatmentTab";
import { RiskVersionsTab } from "@/components/risk-register/RiskVersionsTab";
import { RiskWorkflowTab } from "@/components/risk-register/RiskWorkflowTab";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import {
  controlEffectivenessTone,
  isReviewDue,
  riskAppetiteStatusOf,
  riskAppetiteTone,
  riskScore,
  riskStatusTone,
  riskTreatmentTone,
  severityFromScore,
  severityTone,
  workflowStatusTone,
} from "@/lib/domain";
import { formatDate } from "@/lib/utils";
import { useLocale } from "@/providers/locale-provider";

import { useRiskRegister } from "../risk-register-context";

export default function RiskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { dict } = useLocale();
  const { getRisk, deleteRisk, duplicateRisk, archiveRisk, unarchiveRisk, loading } =
    useRiskRegister();
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [editKey, setEditKey] = useState(0);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const risk = getRisk(id);
  if (!risk) {
    if (!loading && !leaving) {
      notFound();
    }
    return null;
  }

  const score = riskScore(risk);
  const residual = severityFromScore(score);
  const appetite = riskAppetiteStatusOf(risk);
  const reviewDue = isReviewDue(risk);

  return (
    <div className="space-y-6">
      <Link
        href="/risk-register"
        className="text-muted hover:text-foreground print:hidden flex w-fit items-center gap-1.5 text-sm transition-colors"
      >
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
        {dict.riskDetail.backToRegister}
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-muted font-mono text-xs">{risk.id}</span>
            <Badge tone={riskStatusTone[risk.status]} dot>
              {dict.common[risk.status === "mitigating" ? "inProgress" : risk.status]}
            </Badge>
            <Badge tone={workflowStatusTone[risk.workflowStatus]}>
              {dict.riskRegister.enums.workflowStatus[risk.workflowStatus]}
            </Badge>
            {risk.isArchived && (
              <Badge tone="neutral">{dict.common.archived}</Badge>
            )}
          </div>
          <h1 className="text-foreground mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            {risk.title}
          </h1>
          <p className="text-muted mt-1.5 text-sm">
            {risk.department} · {risk.category} › {risk.subcategory}
          </p>
        </div>
        <div className="print:hidden flex shrink-0 flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              void duplicateRisk(risk.id).then((duplicated) => {
                router.push(`/risk-register/${duplicated.id}`);
              });
            }}
          >
            <Copy className="h-4 w-4" />
            {dict.common.duplicate}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              void (risk.isArchived
                ? unarchiveRisk(risk.id)
                : archiveRisk(risk.id))
            }
          >
            {risk.isArchived ? (
              <ArchiveRestore className="h-4 w-4" />
            ) : (
              <Archive className="h-4 w-4" />
            )}
            {risk.isArchived ? dict.common.unarchive : dict.common.archive}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditKey((k) => k + 1);
              setEditOpen(true);
            }}
          >
            <Pencil className="h-4 w-4" />
            {dict.common.edit}
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
            {dict.common.delete}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview">
            {dict.riskDetail.tabs.overview}
          </TabsTrigger>
          <TabsTrigger value="workflow">
            {dict.riskDetail.tabs.workflow}
          </TabsTrigger>
          <TabsTrigger value="treatment">
            {dict.riskDetail.tabs.treatment} ({risk.treatmentPlans.length})
          </TabsTrigger>
          <TabsTrigger value="attachments">
            {dict.riskDetail.tabs.attachments} ({risk.attachments.length})
          </TabsTrigger>
          <TabsTrigger value="comments">
            {dict.riskDetail.tabs.comments} ({risk.comments.length})
          </TabsTrigger>
          <TabsTrigger value="timeline">
            {dict.riskDetail.tabs.timeline}
          </TabsTrigger>
          <TabsTrigger value="versions">
            {dict.riskDetail.tabs.versions}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardTitle className="mb-4">
                {dict.riskDetail.overview.riskDetails}
              </CardTitle>
              <dl className="space-y-3 text-sm">
                <Row
                  label={dict.riskRegister.form.department}
                  value={risk.department}
                />
                <Row
                  label={dict.riskRegister.form.category}
                  value={risk.category}
                />
                <Row
                  label={dict.riskRegister.form.subcategory}
                  value={risk.subcategory}
                />
                <Row
                  label={dict.riskRegister.form.riskSource}
                  value={risk.riskSource}
                />
                <Row
                  label={dict.riskRegister.form.riskType}
                  value={risk.riskType}
                />
                <Row
                  label={dict.riskRegister.form.strategicObjective}
                  value={risk.strategicObjective}
                />
                <Row
                  label={dict.riskRegister.form.rootCause}
                  value={risk.rootCause}
                />
                <Row
                  label={dict.riskRegister.form.consequences}
                  value={risk.consequences}
                />
                <Row
                  label={dict.riskRegister.form.existingControls}
                  value={risk.existingControls}
                />
                <Row
                  label={dict.riskRegister.form.controlEffectiveness}
                  value={
                    <Badge tone={controlEffectivenessTone[risk.controlEffectiveness]}>
                      {
                        dict.riskRegister.enums.controlEffectiveness[
                          risk.controlEffectiveness
                        ]
                      }
                    </Badge>
                  }
                />
              </dl>
            </Card>

            <Card>
              <CardTitle className="mb-4">
                {dict.riskDetail.overview.assessment}
              </CardTitle>
              <dl className="mb-4 space-y-3 text-sm">
                <Row
                  label={dict.riskRegister.columns.inherentRisk}
                  value={
                    <Badge tone={severityTone[risk.inherentRisk]}>
                      {dict.common[risk.inherentRisk]}
                    </Badge>
                  }
                />
                <Row
                  label={dict.riskRegister.columns.residualRisk}
                  value={
                    <Badge tone={severityTone[residual]}>
                      {dict.common[residual]} · {score}
                    </Badge>
                  }
                />
                <Row
                  label={dict.riskRegister.columns.targetRisk}
                  value={
                    <Badge tone={severityTone[risk.targetRisk]}>
                      {dict.common[risk.targetRisk]}
                    </Badge>
                  }
                />
                <Row
                  label={dict.riskDetail.overview.riskAppetite}
                  value={
                    <Badge tone={riskAppetiteTone[appetite]}>
                      {dict.riskRegister.enums.riskAppetite[appetite]}
                    </Badge>
                  }
                />
              </dl>
              <p className="text-muted mb-2 text-xs font-semibold tracking-wide">
                {dict.riskDetail.overview.matrix}
              </p>
              <RiskMatrixWidget
                current={{ likelihood: risk.likelihood, impact: risk.impact }}
                inherent={{
                  likelihood: risk.inherentLikelihood,
                  impact: risk.inherentImpact,
                }}
                target={{
                  likelihood: risk.targetLikelihood,
                  impact: risk.targetImpact,
                }}
                likelihoodLabel={dict.heatMap.likelihood}
                impactLabel={dict.heatMap.impact}
                currentLabel={dict.riskRegister.form.matrixCurrent}
                inherentLabel={dict.riskRegister.form.matrixInherent}
                targetLabel={dict.riskRegister.form.matrixTarget}
              />
            </Card>

            <Card>
              <CardTitle className="mb-4">
                {dict.riskDetail.overview.ownership}
              </CardTitle>
              <dl className="space-y-3 text-sm">
                <Row label={dict.riskRegister.form.owner} value={risk.owner} />
                <Row
                  label={dict.riskRegister.form.dueDate}
                  value={formatDate(risk.dueDate, dict.meta.locale)}
                />
                <Row label={dict.riskDetail.createdBy} value={risk.createdBy} />
                <Row
                  label={dict.riskDetail.createdOn}
                  value={formatDate(risk.createdAt, dict.meta.locale)}
                />
              </dl>
            </Card>

            <Card>
              <CardTitle className="mb-4">
                {dict.riskDetail.overview.governance}
              </CardTitle>
              <dl className="space-y-3 text-sm">
                <Row
                  label={dict.riskRegister.form.riskTreatment}
                  value={
                    <Badge tone={riskTreatmentTone[risk.riskTreatment]}>
                      {dict.riskRegister.enums.riskTreatment[risk.riskTreatment]}
                    </Badge>
                  }
                />
                <Row
                  label={dict.riskRegister.form.reviewFrequency}
                  value={
                    dict.riskRegister.enums.reviewFrequency[risk.reviewFrequency]
                  }
                />
                <Row
                  label={dict.riskDetail.overview.nextReview}
                  value={
                    <span className={reviewDue ? "text-warning font-medium" : undefined}>
                      {formatDate(risk.nextReviewDate, dict.meta.locale)}
                      {reviewDue && ` · ${dict.riskDetail.overview.reviewDue}`}
                    </span>
                  }
                />
              </dl>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="workflow">
          <RiskWorkflowTab risk={risk} />
        </TabsContent>
        <TabsContent value="treatment">
          <RiskTreatmentTab risk={risk} />
        </TabsContent>
        <TabsContent value="attachments">
          <RiskAttachmentsTab risk={risk} />
        </TabsContent>
        <TabsContent value="comments">
          <RiskCommentsTab risk={risk} />
        </TabsContent>
        <TabsContent value="timeline">
          <RiskAuditTrailTab risk={risk} />
        </TabsContent>
        <TabsContent value="versions">
          <RiskVersionsTab risk={risk} />
        </TabsContent>
      </Tabs>

      <RiskFormDialog
        key={editKey}
        open={editOpen}
        onOpenChange={setEditOpen}
        risk={risk}
      />

      <RiskDeleteDialog
        risk={deleteOpen ? risk : null}
        onOpenChange={(open) => setDeleteOpen(open)}
        onConfirm={(target) => {
          // Suppress notFound() while this now-stale instance re-renders
          // during the pending navigation away from the deleted risk.
          setLeaving(true);
          setDeleteOpen(false);
          router.push("/risk-register");
          void deleteRisk(target.id);
        }}
      />
    </div>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
      <dt className="text-muted shrink-0">{label}</dt>
      <dd className="text-foreground font-medium sm:text-end">{value}</dd>
    </div>
  );
}
