"use client";

import { ArrowLeft, ClipboardList, FileText, Plus, ShieldAlert, Trash2 } from "lucide-react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { use, useState } from "react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { RISK_OWNERS } from "@/constants/risk-register";
import { severityTone } from "@/lib/domain";
import { vendorAssessmentStatusTone, vendorClassificationTone } from "@/lib/grc-domain";
import { formatDate } from "@/lib/utils";
import { useLocale } from "@/providers/locale-provider";
import type { VendorAssessmentStatus } from "@/types";

import { useVendorRisk } from "../vendor-risk-context";

export default function VendorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { dict } = useLocale();
  const router = useRouter();
  const { getVendor, addAssessment, addDocument, removeVendor } = useVendorRisk();

  const [assessmentType, setAssessmentType] = useState("");
  const [assessmentDate, setAssessmentDate] = useState(new Date().toISOString().slice(0, 10));
  const [assessmentStatus, setAssessmentStatus] = useState<VendorAssessmentStatus>("scheduled");
  const [assessmentAssessor, setAssessmentAssessor] = useState<string>(RISK_OWNERS[0]);
  const [documentName, setDocumentName] = useState("");
  const [leaving, setLeaving] = useState(false);

  const vendor = getVendor(id);
  if (!vendor) {
    if (!leaving) notFound();
    return null;
  }

  return (
    <div className="space-y-6">
      <Link
        href="/vendor-risk"
        className="text-muted hover:text-foreground print:hidden flex w-fit items-center gap-1.5 text-sm transition-colors"
      >
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
        {dict.vendorRisk.backToList}
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-muted font-mono text-xs">{vendor.id}</span>
            <Badge tone={vendorClassificationTone[vendor.classification]}>
              {dict.common[vendor.classification]}
            </Badge>
            <Badge tone={severityTone[vendor.riskRating]}>{dict.common[vendor.riskRating]}</Badge>
          </div>
          <h1 className="text-foreground mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            {vendor.name}
          </h1>
          <p className="text-muted mt-1.5 text-sm">{vendor.category}</p>
        </div>
        <div className="print:hidden flex shrink-0 flex-wrap items-center gap-2">
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              setLeaving(true);
              router.push("/vendor-risk");
              removeVendor(vendor.id);
            }}
          >
            <Trash2 className="h-4 w-4" />
            {dict.common.delete}
          </Button>
        </div>
      </div>

      <Card>
        <CardTitle className="mb-4">{dict.rcsa.overview}</CardTitle>
        <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <Row label={dict.common.owner} value={vendor.owner} />
          <Row label={dict.vendorRisk.slaCompliance} value={`${vendor.slaCompliance}%`} />
          <Row
            label={dict.vendorRisk.columns.contractExpiry}
            value={formatDate(vendor.contractExpiry, dict.meta.locale)}
          />
          <Row label={dict.vendorRisk.lastDueDiligence} value={formatDate(vendor.lastDueDiligence, dict.meta.locale)} />
          <Row label={dict.vendorRisk.nextDueDiligence} value={formatDate(vendor.nextDueDiligence, dict.meta.locale)} />
        </dl>
      </Card>

      <Tabs defaultValue="assessments">
        <TabsList className="flex-wrap">
          <TabsTrigger value="assessments">
            {dict.vendorRisk.assessments} ({vendor.assessments.length})
          </TabsTrigger>
          <TabsTrigger value="incidents">
            {dict.vendorRisk.vendorIncidents} ({vendor.incidents.length})
          </TabsTrigger>
          <TabsTrigger value="documents">
            {dict.vendorRisk.documents} ({vendor.documents.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assessments" className="space-y-3">
          <Card className="p-0">
            {vendor.assessments.length === 0 ? (
              <EmptyState icon={ClipboardList} title={dict.vendorRisk.noAssessments} />
            ) : (
              <div className="divide-border divide-y">
                {vendor.assessments.map((a) => (
                  <div key={a.id} className="flex items-center justify-between gap-3 p-4">
                    <div>
                      <p className="text-foreground text-sm font-medium">{a.type}</p>
                      <p className="text-muted text-xs">
                        {formatDate(a.date, dict.meta.locale)} · {a.assessor}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {a.score > 0 && <span className="text-muted text-sm">{a.score}/100</span>}
                      <Badge tone={vendorAssessmentStatusTone[a.status]} dot>
                        {dict.vendorRisk.enums.assessmentStatus[a.status]}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
          <Card className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <Input
              value={assessmentType}
              onChange={(e) => setAssessmentType(e.target.value)}
              placeholder={dict.vendorRisk.assessmentTypePlaceholder}
            />
            <Input
              type="date"
              value={assessmentDate}
              onChange={(e) => setAssessmentDate(e.target.value)}
            />
            <Select
              value={assessmentAssessor}
              onChange={(e) => setAssessmentAssessor(e.target.value)}
            >
              {RISK_OWNERS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </Select>
            <div className="flex gap-2">
              <Select
                value={assessmentStatus}
                onChange={(e) => setAssessmentStatus(e.target.value as VendorAssessmentStatus)}
              >
                <option value="scheduled">{dict.vendorRisk.enums.assessmentStatus.scheduled}</option>
                <option value="in-progress">{dict.vendorRisk.enums.assessmentStatus["in-progress"]}</option>
                <option value="completed">{dict.vendorRisk.enums.assessmentStatus.completed}</option>
              </Select>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (!assessmentType.trim()) return;
                  addAssessment(vendor.id, {
                    type: assessmentType,
                    date: assessmentDate,
                    status: assessmentStatus,
                    score: 0,
                    assessor: assessmentAssessor,
                  });
                  setAssessmentType("");
                }}
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="incidents">
          <Card className="p-0">
            {vendor.incidents.length === 0 ? (
              <EmptyState icon={ShieldAlert} title={dict.vendorRisk.noVendorIncidents} />
            ) : (
              <div className="divide-border divide-y">
                {vendor.incidents.map((inc) => (
                  <div key={inc.id} className="flex items-center justify-between gap-3 p-4">
                    <div>
                      <p className="text-foreground text-sm font-medium">{inc.title}</p>
                      <p className="text-muted text-xs">{formatDate(inc.date, dict.meta.locale)}</p>
                    </div>
                    <Badge tone={severityTone[inc.severity]}>{dict.common[inc.severity]}</Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-3">
          <Card className="p-0">
            {vendor.documents.length === 0 ? (
              <EmptyState icon={FileText} title={dict.vendorRisk.noDocuments} />
            ) : (
              <div className="divide-border divide-y">
                {vendor.documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between gap-3 p-4">
                    <div className="flex items-center gap-3">
                      <FileText className="text-muted h-4 w-4" />
                      <p className="text-foreground text-sm font-medium">{doc.name}</p>
                    </div>
                    <p className="text-muted text-xs">
                      {formatDate(doc.uploadedAt, dict.meta.locale)}
                      {doc.expiresAt && ` · ${dict.vendorRisk.expires} ${formatDate(doc.expiresAt, dict.meta.locale)}`}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
          <Card className="flex gap-2">
            <Input
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              placeholder={dict.vendorRisk.documentNamePlaceholder}
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                addDocument(vendor.id, documentName, null);
                setDocumentName("");
              }}
            >
              <Plus className="h-3.5 w-3.5" />
              {dict.common.upload}
            </Button>
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
