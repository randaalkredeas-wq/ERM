"use client";

import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  Paperclip,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { use, useState } from "react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Textarea } from "@/components/ui/Textarea";
import { severityTone } from "@/lib/domain";
import { incidentRecordStatusTone } from "@/lib/grc-domain";
import { formatDate } from "@/lib/utils";
import { useLocale } from "@/providers/locale-provider";

import { useIncidents } from "../incidents-context";

export default function IncidentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { dict } = useLocale();
  const router = useRouter();
  const {
    getIncident,
    startInvestigation,
    updateInvestigation,
    addCorrectiveAction,
    addPreventiveAction,
    resolveIncident,
    approveClosure,
    addAttachment,
    removeIncident,
  } = useIncidents();

  const [investigation, setInvestigation] = useState("");
  const [correctiveInput, setCorrectiveInput] = useState("");
  const [preventiveInput, setPreventiveInput] = useState("");
  const [attachmentName, setAttachmentName] = useState("");
  const [leaving, setLeaving] = useState(false);

  const incident = getIncident(id);
  if (!incident) {
    if (!leaving) notFound();
    return null;
  }

  return (
    <div className="space-y-6">
      <Link
        href="/incidents"
        className="text-muted hover:text-foreground print:hidden flex w-fit items-center gap-1.5 text-sm transition-colors"
      >
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
        {dict.incidents.backToList}
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-muted font-mono text-xs">{incident.id}</span>
            <Badge tone={incidentRecordStatusTone[incident.status]} dot>
              {dict.incidents.enums.status[incident.status]}
            </Badge>
            <Badge tone={severityTone[incident.severity]}>{dict.common[incident.severity]}</Badge>
            {incident.regulatoryImpact && (
              <Badge tone="danger">{dict.incidents.regulatoryImpact}</Badge>
            )}
          </div>
          <h1 className="text-foreground mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            {incident.title}
          </h1>
          <p className="text-muted mt-1.5 text-sm">
            {incident.category} · {incident.department}
          </p>
        </div>
        <div className="print:hidden flex shrink-0 flex-wrap items-center gap-2">
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              setLeaving(true);
              router.push("/incidents");
              removeIncident(incident.id);
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
          <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <Row label={dict.incidents.columns.reportedBy} value={incident.reportedBy} />
            <Row label={dict.incidents.assignedOwner} value={incident.assignedOwner} />
            <Row label={dict.incidents.columns.date} value={formatDate(incident.reportedAt, dict.meta.locale)} />
            <Row label={dict.incidents.impactLevel} value={dict.incidents.enums.impactLevel[incident.impactLevel]} />
            <Row
              label={dict.incidents.financialLoss}
              value={incident.financialLoss > 0 ? `$${incident.financialLoss.toLocaleString()}` : "—"}
            />
            <Row
              label={dict.incidents.columns.status}
              value={dict.incidents.enums.status[incident.status]}
            />
          </dl>
          <div className="border-border space-y-3 border-t pt-3">
            <div>
              <p className="text-muted text-xs font-medium">{dict.incidents.rootCause}</p>
              <p className="text-foreground mt-1 text-sm">{incident.rootCause}</p>
            </div>
            <div>
              <p className="text-muted text-xs font-medium">{dict.incidents.impactDescription}</p>
              <p className="text-foreground mt-1 text-sm">{incident.impactDescription}</p>
            </div>
            {incident.regulatoryImpact && incident.regulatoryImpactNotes && (
              <div>
                <p className="text-muted text-xs font-medium">{dict.incidents.regulatoryImpactNotes}</p>
                <p className="text-foreground mt-1 text-sm">{incident.regulatoryImpactNotes}</p>
              </div>
            )}
          </div>
        </Card>

        <Card className="space-y-3">
          <CardTitle>{dict.incidents.closureApproval}</CardTitle>
          {incident.closureApproved ? (
            <div className="flex items-start gap-2 text-sm">
              <CheckCircle2 className="text-success mt-0.5 h-4 w-4 shrink-0" />
              <p className="text-muted">
                {dict.incidents.closedBy.replace("{name}", incident.closureApprovedBy ?? "")}{" "}
                {formatDate(incident.closureApprovedAt ?? "", dict.meta.locale)}
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {incident.status === "open" && (
                <Button size="sm" onClick={() => startInvestigation(incident.id)}>
                  {dict.incidents.startInvestigation}
                </Button>
              )}
              {incident.status === "investigating" && (
                <Button size="sm" onClick={() => resolveIncident(incident.id)}>
                  {dict.incidents.markResolved}
                </Button>
              )}
              {incident.status === "resolved" && (
                <Button size="sm" variant="success" onClick={() => approveClosure(incident.id)}>
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {dict.incidents.approveClosure}
                </Button>
              )}
              {incident.status === "open" && (
                <p className="text-muted text-xs">{dict.incidents.closureHint}</p>
              )}
            </div>
          )}
        </Card>
      </div>

      <Tabs defaultValue="investigation">
        <TabsList className="flex-wrap">
          <TabsTrigger value="investigation">{dict.incidents.investigation}</TabsTrigger>
          <TabsTrigger value="actions">{dict.incidents.correctiveActions}</TabsTrigger>
          <TabsTrigger value="attachments">
            {dict.incidents.attachments} ({incident.attachments.length})
          </TabsTrigger>
          <TabsTrigger value="timeline">{dict.incidents.timeline}</TabsTrigger>
        </TabsList>

        <TabsContent value="investigation" className="space-y-3">
          <Card className="space-y-3">
            <p className="text-foreground text-sm">
              {incident.investigationSummary || dict.incidents.noInvestigation}
            </p>
            {incident.status !== "closed" && (
              <div className="border-border space-y-2 border-t pt-3">
                <Textarea
                  rows={3}
                  value={investigation}
                  onChange={(e) => setInvestigation(e.target.value)}
                  placeholder={dict.incidents.investigationPlaceholder}
                />
                <Button
                  size="sm"
                  onClick={() => {
                    updateInvestigation(incident.id, investigation);
                    setInvestigation("");
                  }}
                  disabled={!investigation.trim()}
                >
                  {dict.common.save}
                </Button>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="actions" className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Card className="space-y-3">
            <CardTitle>{dict.incidents.correctiveActions}</CardTitle>
            <ul className="space-y-1.5 text-sm">
              {incident.correctiveActions.map((action, i) => (
                <li key={i} className="text-foreground flex items-start gap-2">
                  <CheckCircle2 className="text-success mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {action}
                </li>
              ))}
              {incident.correctiveActions.length === 0 && (
                <li className="text-muted">{dict.incidents.noActions}</li>
              )}
            </ul>
            {incident.status !== "closed" && (
              <div className="border-border flex gap-2 border-t pt-3">
                <Input
                  value={correctiveInput}
                  onChange={(e) => setCorrectiveInput(e.target.value)}
                  placeholder={dict.incidents.addActionPlaceholder}
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    addCorrectiveAction(incident.id, correctiveInput);
                    setCorrectiveInput("");
                  }}
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </Card>
          <Card className="space-y-3">
            <CardTitle>{dict.incidents.preventiveActions}</CardTitle>
            <ul className="space-y-1.5 text-sm">
              {incident.preventiveActions.map((action, i) => (
                <li key={i} className="text-foreground flex items-start gap-2">
                  <CheckCircle2 className="text-success mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {action}
                </li>
              ))}
              {incident.preventiveActions.length === 0 && (
                <li className="text-muted">{dict.incidents.noActions}</li>
              )}
            </ul>
            {incident.status !== "closed" && (
              <div className="border-border flex gap-2 border-t pt-3">
                <Input
                  value={preventiveInput}
                  onChange={(e) => setPreventiveInput(e.target.value)}
                  placeholder={dict.incidents.addActionPlaceholder}
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    addPreventiveAction(incident.id, preventiveInput);
                    setPreventiveInput("");
                  }}
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="attachments">
          <Card className="space-y-3 p-0">
            {incident.attachments.length === 0 ? (
              <EmptyState icon={Paperclip} title={dict.incidents.noAttachments} />
            ) : (
              <div className="divide-border divide-y">
                {incident.attachments.map((att) => (
                  <div key={att.id} className="flex items-center justify-between gap-3 p-4">
                    <div className="flex items-center gap-3">
                      <Paperclip className="text-muted h-4 w-4" />
                      <div>
                        <p className="text-foreground text-sm font-medium">{att.name}</p>
                        <p className="text-muted text-xs">
                          {att.uploadedBy} · {formatDate(att.uploadedAt, dict.meta.locale)}
                        </p>
                      </div>
                    </div>
                    <span className="text-muted text-xs">{att.size}</span>
                  </div>
                ))}
              </div>
            )}
            {incident.status !== "closed" && (
              <div className="flex gap-2 p-4 pt-0">
                <Input
                  value={attachmentName}
                  onChange={(e) => setAttachmentName(e.target.value)}
                  placeholder={dict.incidents.attachmentNamePlaceholder}
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    addAttachment(incident.id, attachmentName);
                    setAttachmentName("");
                  }}
                >
                  <Plus className="h-3.5 w-3.5" />
                  {dict.common.upload}
                </Button>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="timeline">
          <Card className="space-y-3">
            {incident.timeline.map((entry) => (
              <div key={entry.id} className="flex items-start gap-3">
                <span className="bg-primary-container text-on-primary-container flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
                  <Search className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-foreground text-sm font-medium">
                    {entry.action} · {entry.actor}
                  </p>
                  <p className="text-muted text-xs">
                    {formatDate(entry.timestamp, dict.meta.locale)}
                  </p>
                  <p className="text-muted mt-1 text-sm">{entry.details}</p>
                </div>
              </div>
            ))}
            {incident.timeline.length === 0 && (
              <EmptyState icon={FileText} title={dict.incidents.noTimeline} />
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
