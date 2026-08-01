"use client";

import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { use, useState, type ReactNode } from "react";

import { RiskApprovalsTab } from "@/components/risk-register/RiskApprovalsTab";
import { RiskAttachmentsTab } from "@/components/risk-register/RiskAttachmentsTab";
import { RiskAuditTrailTab } from "@/components/risk-register/RiskAuditTrailTab";
import { RiskCommentsTab } from "@/components/risk-register/RiskCommentsTab";
import { RiskDeleteDialog } from "@/components/risk-register/RiskDeleteDialog";
import { RiskFormDialog } from "@/components/risk-register/RiskFormDialog";
import { RiskVersionsTab } from "@/components/risk-register/RiskVersionsTab";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import {
  riskScore,
  riskStatusTone,
  severityFromScore,
  severityTone,
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
  const { getRisk, deleteRisk } = useRiskRegister();
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [editKey, setEditKey] = useState(0);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const risk = getRisk(id);
  if (!risk) {
    if (!leaving) {
      notFound();
    }
    return null;
  }

  const score = riskScore(risk);
  const residual = severityFromScore(score);

  return (
    <div className="space-y-6">
      <Link
        href="/risk-register"
        className="text-muted hover:text-foreground flex w-fit items-center gap-1.5 text-sm transition-colors"
      >
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
        {dict.riskDetail.backToRegister}
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-muted font-mono text-xs">{risk.id}</span>
            <Badge tone={riskStatusTone[risk.status]} dot>
              {
                dict.common[
                  risk.status === "mitigating"
                    ? "inProgress"
                    : risk.status === "pending-approval"
                      ? "pending"
                      : risk.status
                ]
              }
            </Badge>
          </div>
          <h1 className="text-foreground mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            {risk.title}
          </h1>
          <p className="text-muted mt-1.5 text-sm">
            {risk.department} · {risk.category} › {risk.subcategory}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
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
        <TabsList>
          <TabsTrigger value="overview">
            {dict.riskDetail.tabs.overview}
          </TabsTrigger>
          <TabsTrigger value="attachments">
            {dict.riskDetail.tabs.attachments} ({risk.attachments.length})
          </TabsTrigger>
          <TabsTrigger value="comments">
            {dict.riskDetail.tabs.comments} ({risk.comments.length})
          </TabsTrigger>
          <TabsTrigger value="approvals">
            {dict.riskDetail.tabs.approvals}
          </TabsTrigger>
          <TabsTrigger value="audit">{dict.riskDetail.tabs.audit}</TabsTrigger>
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
                  label={dict.riskRegister.form.rootCause}
                  value={risk.rootCause}
                />
                <Row
                  label={dict.riskRegister.form.existingControls}
                  value={risk.existingControls}
                />
              </dl>
            </Card>

            <Card>
              <CardTitle className="mb-4">
                {dict.riskDetail.overview.assessment}
              </CardTitle>
              <dl className="space-y-3 text-sm">
                <Row
                  label={dict.riskRegister.form.inherentRisk}
                  value={
                    <Badge tone={severityTone[risk.inherentRisk]}>
                      {dict.common[risk.inherentRisk]}
                    </Badge>
                  }
                />
                <Row
                  label={dict.riskRegister.form.likelihood}
                  value={String(risk.likelihood)}
                />
                <Row
                  label={dict.riskRegister.form.impact}
                  value={String(risk.impact)}
                />
                <Row
                  label={dict.riskRegister.columns.residualRisk}
                  value={
                    <Badge tone={severityTone[residual]}>
                      {dict.common[residual]} · {score}
                    </Badge>
                  }
                />
              </dl>
            </Card>

            <Card className="lg:col-span-2">
              <CardTitle className="mb-4">
                {dict.riskDetail.overview.ownership}
              </CardTitle>
              <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
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
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="attachments">
          <RiskAttachmentsTab risk={risk} />
        </TabsContent>
        <TabsContent value="comments">
          <RiskCommentsTab risk={risk} />
        </TabsContent>
        <TabsContent value="approvals">
          <RiskApprovalsTab risk={risk} />
        </TabsContent>
        <TabsContent value="audit">
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
          deleteRisk(target.id);
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
