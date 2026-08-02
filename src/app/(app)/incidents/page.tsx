"use client";

import { AlertTriangle, CheckCircle2, Clock, Plus, Siren } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { TrendAreaChart } from "@/components/charts/TrendAreaChart";
import { PageHeader } from "@/components/layout/PageHeader";
import { ReportIncidentDialog } from "@/components/incidents/ReportIncidentDialog";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { StatCard } from "@/components/ui/StatCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { incidentTrend } from "@/lib/mock-data/incidents";
import { severityTone } from "@/lib/domain";
import { incidentRecordStatusTone } from "@/lib/grc-domain";
import { formatDate } from "@/lib/utils";
import { useLocale } from "@/providers/locale-provider";

import { useIncidents } from "./incidents-context";

export default function IncidentsPage() {
  const { dict } = useLocale();
  const { incidents } = useIncidents();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [reportOpen, setReportOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return incidents.filter((i) => {
      const matchesQuery =
        !q || i.id.toLowerCase().includes(q) || i.title.toLowerCase().includes(q);
      const matchesStatus = status === "all" || i.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [incidents, query, status]);

  const open = incidents.filter((i) => i.status === "open").length;
  const investigating = incidents.filter((i) => i.status === "investigating").length;
  const closed = incidents.filter((i) => i.status === "closed" || i.status === "resolved").length;
  const critical = incidents.filter((i) => i.severity === "critical").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title={dict.incidents.title}
        subtitle={dict.incidents.subtitle}
        actions={
          <Button size="sm" onClick={() => setReportOpen(true)}>
            <Plus className="h-4 w-4" />
            {dict.incidents.reportIncident}
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={dict.incidents.openCount}
          value={String(open)}
          icon={AlertTriangle}
          tone="danger"
        />
        <StatCard
          label={dict.incidents.inProgressCount}
          value={String(investigating)}
          icon={Clock}
          tone="warning"
        />
        <StatCard
          label={dict.incidents.resolvedCount}
          value={String(closed)}
          icon={CheckCircle2}
          tone="success"
        />
        <StatCard
          label={dict.incidents.criticalCount}
          value={String(critical)}
          icon={Siren}
          tone="danger"
        />
      </div>

      <Card>
        <CardTitle className="mb-4">{dict.incidents.trendTitle}</CardTitle>
        <TrendAreaChart data={incidentTrend} color="var(--chart-3)" />
      </Card>

      <Card className="print:hidden grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={dict.incidents.searchPlaceholder}
          />
        </div>
        <div>
          <label className="text-muted mb-1.5 block text-xs font-medium">
            {dict.common.status}
          </label>
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">{dict.common.all}</option>
            <option value="open">{dict.common.open}</option>
            <option value="investigating">{dict.incidents.enums.status.investigating}</option>
            <option value="resolved">{dict.common.resolved}</option>
            <option value="closed">{dict.common.closed}</option>
          </Select>
        </div>
      </Card>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{dict.incidents.columns.id}</TableHead>
            <TableHead>{dict.incidents.columns.title}</TableHead>
            <TableHead>{dict.incidents.columns.category}</TableHead>
            <TableHead>{dict.incidents.columns.severity}</TableHead>
            <TableHead>{dict.incidents.columns.reportedBy}</TableHead>
            <TableHead>{dict.incidents.columns.date}</TableHead>
            <TableHead>{dict.incidents.columns.status}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((incident) => (
            <TableRow key={incident.id}>
              <TableCell className="text-muted font-mono text-xs">
                <Link
                  href={`/incidents/${incident.id}`}
                  className="hover:text-primary hover:underline"
                >
                  {incident.id}
                </Link>
              </TableCell>
              <TableCell className="text-foreground max-w-72 truncate font-medium">
                {incident.title}
              </TableCell>
              <TableCell className="text-muted">{incident.category}</TableCell>
              <TableCell>
                <Badge tone={severityTone[incident.severity]}>
                  {dict.common[incident.severity]}
                </Badge>
              </TableCell>
              <TableCell className="text-muted">{incident.reportedBy}</TableCell>
              <TableCell className="text-muted">
                {formatDate(incident.reportedAt, dict.meta.locale)}
              </TableCell>
              <TableCell>
                <Badge tone={incidentRecordStatusTone[incident.status]} dot>
                  {dict.incidents.enums.status[incident.status]}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
          {filtered.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-muted py-10 text-center">
                {dict.common.noResults}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <ReportIncidentDialog open={reportOpen} onOpenChange={setReportOpen} />
    </div>
  );
}
