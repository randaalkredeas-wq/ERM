"use client";

import { Download, FileBarChart2 } from "lucide-react";
import { useEffect, useState } from "react";

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
import { formatDate } from "@/lib/utils";
import { useLocale } from "@/providers/locale-provider";
import type { GeneratedReportItem, ReportTemplateItem } from "@/types";

export default function ReportsPage() {
  const { dict } = useLocale();
  const [reportTemplates, setReportTemplates] = useState<ReportTemplateItem[]>([]);
  const [generatedReports, setGeneratedReports] = useState<GeneratedReportItem[]>([]);

  useEffect(() => {
    void apiClient
      .get<{ data: ReportTemplateItem[] }>("/api/reports/templates")
      .then((res) => setReportTemplates(res.data));
    void apiClient
      .get<{ data: GeneratedReportItem[] }>("/api/reports/generated?pageSize=50")
      .then((res) => setGeneratedReports(res.data));
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader title={dict.reports.title} subtitle={dict.reports.subtitle} />

      <div>
        <h2 className="text-foreground mb-4 text-lg font-semibold">
          {dict.reports.templates}
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reportTemplates.map((template) => (
            <Card key={template.id} className="flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <span className="bg-primary-container text-on-primary-container flex h-11 w-11 items-center justify-center rounded-xl">
                  <FileBarChart2 className="h-5 w-5" />
                </span>
                <Badge tone="neutral">{template.category}</Badge>
              </div>
              <div>
                <CardTitle>{template.name}</CardTitle>
                <CardDescription>{template.description}</CardDescription>
              </div>
              <Button size="sm" className="mt-auto w-full">
                {dict.common.generate}
              </Button>
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
