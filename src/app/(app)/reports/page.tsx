"use client";

import { Download, FileBarChart2, Printer } from "lucide-react";
import { useEffect, useState } from "react";

import { useCompliance } from "@/app/(app)/compliance/compliance-context";
import { useIncidents } from "@/app/(app)/incidents/incidents-context";
import { useRiskRegister } from "@/app/(app)/risk-register/risk-register-context";
import { useVendorRisk } from "@/app/(app)/vendor-risk/vendor-risk-context";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { apiClient } from "@/lib/api-client";
import { isTreatmentActionOverdue, riskScore, severityFromScore } from "@/lib/domain";
import { kris } from "@/lib/mock-data/kri";
import { exportReportToExcel, exportReportToPdf } from "@/lib/reports-export";
import { formatDate } from "@/lib/utils";
import { useLocale } from "@/providers/locale-provider";
import type { CreditExposure, GeneratedReportItem, ReportCategory } from "@/types";

const REPORT_CATEGORIES: ReportCategory[] = [
  "board",
  "executive",
  "department",
  "operational-risk",
  "credit-risk",
  "compliance",
  "incident",
  "vendor-risk",
  "kri",
];

export default function ReportsPage() {
  const { dict } = useLocale();
  const { risks } = useRiskRegister();
  const { incidents } = useIncidents();
  const { obligations } = useCompliance();
  const { vendors } = useVendorRisk();
  const [generatedReports, setGeneratedReports] = useState<GeneratedReportItem[]>([]);
  const [creditExposures, setCreditExposures] = useState<CreditExposure[]>([]);
  const [generating, setGenerating] = useState<string | null>(null);

  useEffect(() => {
    void apiClient
      .get<{ data: GeneratedReportItem[] }>("/api/reports/generated?pageSize=50")
      .then((res) => setGeneratedReports(res.data))
      .catch(() => {});
    void apiClient
      .get<{ data: CreditExposure[] }>("/api/portfolio/exposures?pageSize=200")
      .then((res) => setCreditExposures(res.data))
      .catch(() => {});
  }, []);

  const activeRisks = risks.filter((r) => !r.isArchived);

  function buildRows(category: ReportCategory): Record<string, string | number>[] {
    switch (category) {
      case "board": {
        return [
          { Metric: "Total Active Risks", Value: activeRisks.length },
          {
            Metric: "Critical Risks",
            Value: activeRisks.filter((r) => severityFromScore(riskScore(r)) === "critical").length,
          },
          { Metric: "Open Incidents", Value: incidents.filter((i) => i.status !== "closed").length },
          {
            Metric: "Non-Compliant Obligations",
            Value: obligations.filter((o) => o.status === "non-compliant").length,
          },
          {
            Metric: "Critical Vendors",
            Value: vendors.filter((v) => v.classification === "critical").length,
          },
          { Metric: "KRIs Breached", Value: kris.filter((k) => k.status === "breached").length },
        ];
      }
      case "executive": {
        return [
          { Section: "Risk Posture", Metric: "Total Active Risks", Value: activeRisks.length },
          {
            Section: "Risk Posture",
            Metric: "High + Critical Risks",
            Value: activeRisks.filter((r) =>
              ["high", "critical"].includes(severityFromScore(riskScore(r))),
            ).length,
          },
          {
            Section: "Actions",
            Metric: "Overdue Treatment Actions",
            Value: activeRisks.reduce(
              (sum, r) => sum + r.treatmentPlans.filter(isTreatmentActionOverdue).length,
              0,
            ),
          },
          { Section: "Incidents", Metric: "Open Incidents", Value: incidents.filter((i) => i.status !== "closed").length },
          {
            Section: "Compliance",
            Metric: "Compliant Obligations",
            Value: obligations.filter((o) => o.status === "compliant").length,
          },
          { Section: "KRIs", Metric: "On Track", Value: kris.filter((k) => k.status === "on-track").length },
        ];
      }
      case "department": {
        const counts = new Map<string, { risks: number; overdue: number }>();
        for (const risk of activeRisks) {
          if (risk.status === "closed") continue;
          const entry = counts.get(risk.department) ?? { risks: 0, overdue: 0 };
          entry.risks += 1;
          entry.overdue += risk.treatmentPlans.filter(isTreatmentActionOverdue).length;
          counts.set(risk.department, entry);
        }
        return Array.from(counts.entries()).map(([department, v]) => ({
          Department: department,
          "Open Risks": v.risks,
          "Overdue Actions": v.overdue,
        }));
      }
      case "operational-risk": {
        return activeRisks.map((r) => ({
          "Risk ID": r.id,
          Title: r.title,
          Category: r.category,
          Score: riskScore(r),
          Severity: severityFromScore(riskScore(r)),
          Owner: r.owner,
          Status: r.status,
        }));
      }
      case "credit-risk": {
        return creditExposures.map((e) => ({
          "Account ID": e.id,
          Customer: e.customerName,
          Segment: e.segment,
          "Outstanding Balance": e.outstandingBalance,
          "ECL Stage": e.eclStage,
          "Days Past Due": e.daysPastDue,
          Rating: e.riskRating,
        }));
      }
      case "compliance": {
        return obligations.map((o) => ({
          ID: o.id,
          Title: o.title,
          Type: o.type,
          Jurisdiction: o.jurisdiction,
          Status: o.status,
          "Next Review": o.nextReview,
        }));
      }
      case "incident": {
        return incidents.map((i) => ({
          ID: i.id,
          Title: i.title,
          Category: i.category,
          Severity: i.severity,
          Status: i.status,
          "Financial Loss": i.financialLoss,
          "Regulatory Impact": i.regulatoryImpact ? "Yes" : "No",
        }));
      }
      case "vendor-risk": {
        return vendors.map((v) => ({
          ID: v.id,
          Name: v.name,
          Classification: v.classification,
          "Risk Rating": v.riskRating,
          "SLA Compliance": `${v.slaCompliance}%`,
          "Contract Expiry": v.contractExpiry,
        }));
      }
      case "kri": {
        return kris.map((k) => ({
          ID: k.id,
          Name: k.name,
          Current: k.current,
          Target: k.target,
          Unit: k.unit,
          Status: k.status,
        }));
      }
    }
  }

  async function handleGenerate(category: ReportCategory, format: "pdf" | "excel" | "print") {
    const rows = buildRows(category);
    if (rows.length === 0) return;
    const title = dict.reports.categories[category];
    setGenerating(`${category}-${format}`);
    try {
      if (format === "excel") {
        exportReportToExcel(title, rows);
      } else {
        await exportReportToPdf(title, rows);
        if (format === "print") window.print();
      }
    } finally {
      setGenerating(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title={dict.reports.title} subtitle={dict.reports.subtitle} />

      <div>
        <h2 className="text-foreground mb-4 text-lg font-semibold">
          {dict.reports.templates}
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 print:hidden">
          {REPORT_CATEGORIES.map((category) => (
            <Card key={category} className="flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <span className="bg-primary-container text-on-primary-container flex h-11 w-11 items-center justify-center rounded-xl">
                  <FileBarChart2 className="h-5 w-5" />
                </span>
                <Badge tone="neutral">{dict.reports.categories[category]}</Badge>
              </div>
              <div>
                <CardTitle>{dict.reports.categories[category]}</CardTitle>
                <CardDescription>{dict.reports.categoryDescriptions[category]}</CardDescription>
              </div>
              <div className="mt-auto flex flex-wrap gap-2">
                <Button
                  size="sm"
                  className="flex-1"
                  disabled={generating === `${category}-pdf`}
                  onClick={() => handleGenerate(category, "pdf")}
                >
                  {dict.reports.exportPdf}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  disabled={generating === `${category}-excel`}
                  onClick={() => handleGenerate(category, "excel")}
                >
                  {dict.reports.exportExcel}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleGenerate(category, "print")}
                >
                  <Printer className="h-3.5 w-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-foreground mb-4 text-lg font-semibold">
          {dict.reports.recentReports}
        </h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{dict.reports.columns.name}</TableHead>
              <TableHead>{dict.reports.columns.generatedBy}</TableHead>
              <TableHead>{dict.reports.columns.date}</TableHead>
              <TableHead>{dict.reports.columns.format}</TableHead>
              <TableHead>{dict.common.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {generatedReports.map((report) => (
              <TableRow key={report.id}>
                <TableCell className="text-foreground max-w-72 truncate font-medium">
                  {report.name}
                </TableCell>
                <TableCell className="text-muted">
                  {report.generatedBy}
                </TableCell>
                <TableCell className="text-muted">
                  {formatDate(report.date, dict.meta.locale)}
                </TableCell>
                <TableCell>
                  <Badge tone="info">{report.format}</Badge>
                </TableCell>
                <TableCell>
                  <Button size="sm" variant="ghost">
                    <Download className="h-3.5 w-3.5" />
                    {dict.common.download}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
