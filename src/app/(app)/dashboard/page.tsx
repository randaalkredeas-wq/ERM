"use client";

import {
  AlertTriangle,
  CheckSquare,
  FilePlus2,
  Gauge,
  ShieldAlert,
  ShieldPlus,
} from "lucide-react";
import Link from "next/link";

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
import {
  incidentStatusTone,
  riskScore,
  severityFromScore,
  severityTone,
} from "@/lib/domain";
import { approvals } from "@/lib/mock-data/approvals";
import { incidents } from "@/lib/mock-data/incidents";
import { riskCategoryBreakdown, riskTrend, risks } from "@/lib/mock-data/risks";
import { formatDate } from "@/lib/utils";
import { useLocale } from "@/providers/locale-provider";

const donutColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "#f472b6",
];

export default function DashboardPage() {
  const { dict, locale } = useLocale();

  const openIncidents = incidents.filter((i) => i.status !== "resolved");
  const pendingApprovals = approvals.filter((a) => a.status === "pending");
  const topRisks = [...risks]
    .sort((a, b) => riskScore(b) - riskScore(a))
    .slice(0, 5);
  const recentIncidents = [...incidents]
    .sort((a, b) => (a.reportedAt < b.reportedAt ? 1 : -1))
    .slice(0, 5);

  const categoryData = riskCategoryBreakdown.map((c, i) => ({
    name: c.label,
    value: c.value,
    color: donutColors[i % donutColors.length],
  }));

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
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={dict.dashboard.kpi.totalRisks}
          value={String(risks.length)}
          icon={ShieldAlert}
          tone="primary"
          delta={{
            value: "+4",
            direction: "up",
            positive: false,
            caption: dict.common.thisMonth,
          }}
        />
        <StatCard
          label={dict.dashboard.kpi.openIncidents}
          value={String(openIncidents.length)}
          icon={AlertTriangle}
          tone="danger"
          delta={{
            value: "-2",
            direction: "down",
            positive: true,
            caption: dict.common.thisMonth,
          }}
        />
        <StatCard
          label={dict.dashboard.kpi.pendingApprovals}
          value={String(pendingApprovals.length)}
          icon={CheckSquare}
          tone="warning"
          delta={{
            value: "+1",
            direction: "up",
            positive: false,
            caption: dict.common.thisWeek,
          }}
        />
        <StatCard
          label={dict.dashboard.kpi.complianceScore}
          value="87%"
          icon={Gauge}
          tone="success"
          delta={{
            value: "+3%",
            direction: "up",
            positive: true,
            caption: dict.common.thisQuarter,
          }}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <ChartCard
          title={dict.dashboard.riskTrend}
          subtitle={dict.dashboard.riskTrendSubtitle}
          className="lg:col-span-2"
        >
          <TrendAreaChart data={riskTrend} />
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
                      {risk.title}
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
