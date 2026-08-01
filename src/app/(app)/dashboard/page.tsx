"use client";

import {
  AlertOctagon,
  AlertTriangle,
  ClipboardX,
  FilePlus2,
  Flame,
  Printer,
  ShieldAlert,
  ShieldPlus,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { useRiskRegister } from "@/app/(app)/risk-register/risk-register-context";
import { CategoryBarChart } from "@/components/charts/CategoryBarChart";
import { ChartCard, ChartLegendItem } from "@/components/charts/ChartCard";
import { DonutChart } from "@/components/charts/DonutChart";
import { TrendAreaChart } from "@/components/charts/TrendAreaChart";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { apiClient } from "@/lib/api-client";
import {
  incidentStatusTone,
  isTreatmentActionOverdue,
  riskScore,
  severityFromScore,
  severityTone,
} from "@/lib/domain";
import {
  riskTrend,
  riskTrendQuarterly,
  riskTrendYearly,
} from "@/lib/mock-data/risks";
import { cn, formatDate } from "@/lib/utils";
import { useLocale } from "@/providers/locale-provider";
import type { ApprovalItem, IncidentItem } from "@/types";

const donutColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "#f472b6",
];

const periods = ["monthly", "quarterly", "yearly"] as const;
type Period = (typeof periods)[number];

export default function DashboardPage() {
  const { dict, locale } = useLocale();
  const { risks } = useRiskRegister();
  const [period, setPeriod] = useState<Period>("monthly");
  const [incidents, setIncidents] = useState<IncidentItem[]>([]);
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);

  useEffect(() => {
    // Some roles (e.g. Employee, Read-only Executive) can't view incidents
    // or approvals - the dashboard still renders fine with an empty list.
    void apiClient
      .get<{ data: IncidentItem[] }>("/api/incidents?pageSize=200")
      .then((res) => setIncidents(res.data))
      .catch(() => {});
    void apiClient
      .get<{ data: ApprovalItem[] }>("/api/approvals?status=pending&pageSize=200")
      .then((res) => setApprovals(res.data))
      .catch(() => {});
  }, []);

  const activeRisks = risks.filter((r) => !r.isArchived);
  const openIncidents = incidents.filter((i) => i.status !== "resolved");
  const pendingApprovals = approvals.filter((a) => a.status === "pending");
  const topRisks = [...activeRisks]
    .sort((a, b) => riskScore(b) - riskScore(a))
    .slice(0, 5);
  const recentIncidents = [...incidents]
    .sort((a, b) => (a.reportedAt < b.reportedAt ? 1 : -1))
    .slice(0, 5);

  const highCount = activeRisks.filter(
    (r) => severityFromScore(riskScore(r)) === "high",
  ).length;
  const criticalCount = activeRisks.filter(
    (r) => severityFromScore(riskScore(r)) === "critical",
  ).length;
  const overdueActionsCount = activeRisks.reduce(
    (sum, r) =>
      sum + r.treatmentPlans.filter(isTreatmentActionOverdue).length,
    0,
  );

  const categoryCounts = new Map<string, number>();
  for (const risk of activeRisks) {
    categoryCounts.set(
      risk.category,
      (categoryCounts.get(risk.category) ?? 0) + 1,
    );
  }
  const categoryData = Array.from(categoryCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([name, value], i) => ({
      name,
      value,
      color: donutColors[i % donutColors.length],
    }));

  const departmentCounts = new Map<string, number>();
  for (const risk of activeRisks) {
    if (risk.status === "closed") continue;
    departmentCounts.set(
      risk.department,
      (departmentCounts.get(risk.department) ?? 0) + 1,
    );
  }
  const departmentData = Array.from(departmentCounts.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);

  const trendData =
    period === "monthly"
      ? riskTrend
      : period === "quarterly"
        ? riskTrendQuarterly
        : riskTrendYearly;

  return (
    <div className="space-y-6">
      <PageHeader
        title={dict.dashboard.title}
        subtitle={dict.dashboard.subtitle}
        actions={
          <>
            <Button variant="outline" size="sm" asChild>
              <Link href="/risk-register">
                <ShieldPlus className="h-4 w-4" />
                {dict.dashboard.newRisk}
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/incidents">
                <AlertTriangle className="h-4 w-4" />
                {dict.dashboard.newIncident}
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/reports">
                <FilePlus2 className="h-4 w-4" />
                {dict.dashboard.generateReport}
              </Link>
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="h-4 w-4" />
              {dict.riskRegister.print}
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          label={dict.dashboard.kpi.totalRisks}
          value={String(activeRisks.length)}
          icon={ShieldAlert}
          tone="primary"
        />
        <StatCard
          label={dict.dashboard.kpi.highRisks}
          value={String(highCount)}
          icon={Flame}
          tone="warning"
        />
        <StatCard
          label={dict.dashboard.kpi.criticalRisks}
          value={String(criticalCount)}
          icon={AlertOctagon}
          tone="danger"
        />
        <StatCard
          label={dict.dashboard.kpi.overdueActions}
          value={String(overdueActionsCount)}
          icon={ClipboardX}
          tone="danger"
        />
        <StatCard
          label={dict.dashboard.kpi.openIncidents}
          value={String(openIncidents.length)}
          icon={AlertTriangle}
          tone="warning"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <ChartCard
          title={dict.dashboard.riskTrend}
          subtitle={dict.dashboard.riskTrendSubtitle}
          className="lg:col-span-2"
          actions={
            <div className="border-border bg-surface-2 print:hidden inline-flex items-center gap-1 rounded-lg border p-1">
              {periods.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPeriod(p)}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                    period === p
                      ? "bg-surface text-foreground shadow-sm"
                      : "text-muted hover:text-foreground",
                  )}
                >
                  {dict.dashboard.period[p]}
                </button>
              ))}
            </div>
          }
        >
          <TrendAreaChart data={trendData} />
        </ChartCard>
        <ChartCard
          title={dict.dashboard.riskByCategory}
          subtitle={dict.dashboard.riskByCategorySubtitle}
          legend={categoryData.map((c) => (
            <ChartLegendItem key={c.name} color={c.color} label={c.name} />
          ))}
        >
          <DonutChart data={categoryData} />
        </ChartCard>
      </div>

      <ChartCard
        title={dict.dashboard.riskByDepartment}
        subtitle={dict.dashboard.riskByDepartmentSubtitle}
      >
        <CategoryBarChart data={departmentData} horizontal color="var(--chart-2)" />
      </ChartCard>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-0">
          <CardHeader className="p-6 pb-0">
            <CardTitle>{dict.dashboard.recentIncidents}</CardTitle>
          </CardHeader>
          <Table className="mt-4 rounded-none border-0 border-t">
            <TableHeader>
              <TableRow>
                <TableHead>{dict.incidents.columns.title}</TableHead>
                <TableHead>{dict.common.status}</TableHead>
                <TableHead>{dict.incidents.columns.date}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentIncidents.map((incident) => (
                <TableRow key={incident.id}>
                  <TableCell className="text-foreground max-w-56 truncate font-medium">
                    {incident.title}
                  </TableCell>
                  <TableCell>
                    <Badge tone={incidentStatusTone[incident.status]}>
                      {
                        dict.common[
                          incident.status === "in-progress"
                            ? "inProgress"
                            : incident.status
                        ]
                      }
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted">
                    {formatDate(incident.reportedAt, dict.meta.locale)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <Card className="p-0">
          <CardHeader className="p-6 pb-0">
            <CardTitle>{dict.dashboard.topRisks}</CardTitle>
          </CardHeader>
          <Table className="mt-4 rounded-none border-0 border-t">
            <TableHeader>
              <TableRow>
                <TableHead>{dict.riskRegister.columns.title}</TableHead>
                <TableHead>{dict.riskRegister.columns.score}</TableHead>
                <TableHead>{dict.riskRegister.columns.owner}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topRisks.map((risk) => {
                const score = riskScore(risk);
                return (
                  <TableRow key={risk.id}>
                    <TableCell className="text-foreground max-w-56 truncate font-medium">
                      <Link
                        href={`/risk-register/${risk.id}`}
                        className="hover:text-primary hover:underline"
                      >
                        {risk.title}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge tone={severityTone[severityFromScore(score)]}>
                        {score}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted">{risk.owner}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{dict.dashboard.upcomingApprovals}</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/approvals">{dict.common.viewAll}</Link>
          </Button>
        </CardHeader>
        <div className="divide-border divide-y">
          {pendingApprovals.map((approval) => (
            <div
              key={approval.id}
              className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-foreground text-sm font-medium">
                  {approval.title}
                </p>
                <p className="text-muted text-xs">
                  {dict.approvals.requestedBy} {approval.requestedBy} ·{" "}
                  {dict.approvals.dueDate}{" "}
                  {formatDate(
                    approval.dueDate,
                    locale === "ar" ? "ar-SA" : "en-US",
                  )}
                </p>
              </div>
              <Badge
                tone={
                  approval.priority === "high"
                    ? "danger"
                    : approval.priority === "medium"
                      ? "warning"
                      : "neutral"
                }
              >
                {dict.common[approval.priority]}
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
