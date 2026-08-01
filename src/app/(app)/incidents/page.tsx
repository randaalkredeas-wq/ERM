"use client";

import { AlertTriangle, CheckCircle2, Clock, Plus, Siren } from "lucide-react";
import { useEffect, useState } from "react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
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
import { incidentStatusTone, severityTone } from "@/lib/domain";
import { formatDate } from "@/lib/utils";
import { useLocale } from "@/providers/locale-provider";
import type { IncidentItem } from "@/types";

export default function IncidentsPage() {
  const { dict } = useLocale();
  const [incidents, setIncidents] = useState<IncidentItem[]>([]);

  useEffect(() => {
    void apiClient
      .get<{ data: IncidentItem[] }>("/api/incidents?pageSize=200")
      .then((res) => setIncidents(res.data))
      .catch(() => {});
  }, []);

  const open = incidents.filter((i) => i.status === "open").length;
  const inProgress = incidents.filter((i) => i.status === "in-progress").length;
  const resolved = incidents.filter((i) => i.status === "resolved").length;
  const critical = incidents.filter((i) => i.severity === "critical").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title={dict.incidents.title}
        subtitle={dict.incidents.subtitle}
        actions={
          <Button size="sm">
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
          value={String(inProgress)}
          icon={Clock}
          tone="warning"
        />
        <StatCard
          label={dict.incidents.resolvedCount}
          value={String(resolved)}
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
          {incidents.map((incident) => (
            <TableRow key={incident.id}>
              <TableCell className="text-muted font-mono text-xs">
                {incident.id}
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
              <TableCell className="text-muted">
                {incident.reportedBy}
              </TableCell>
              <TableCell className="text-muted">
                {formatDate(incident.reportedAt, dict.meta.locale)}
              </TableCell>
              <TableCell>
                <Badge tone={incidentStatusTone[incident.status]} dot>
                  {
                    dict.common[
                      incident.status === "in-progress"
                        ? "inProgress"
                        : incident.status
                    ]
                  }
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
