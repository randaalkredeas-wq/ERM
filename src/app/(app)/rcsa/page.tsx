"use client";

import { ClipboardCheck, Plus, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { PageHeader } from "@/components/layout/PageHeader";
import { RcsaCreateDialog } from "@/components/rcsa/RcsaCreateDialog";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Progress } from "@/components/ui/Progress";
import { Select } from "@/components/ui/Select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { BUSINESS_UNITS } from "@/constants/grc";
import { severityTone } from "@/lib/domain";
import { rcsaCycleStatusTone, rcsaWorkflowStatusTone } from "@/lib/grc-domain";
import { formatDate } from "@/lib/utils";
import { useLocale } from "@/providers/locale-provider";

import { useRcsa } from "./rcsa-context";

export default function RcsaPage() {
  const { dict } = useLocale();
  const { assessments, cycles, removeAssessment } = useRcsa();
  const [query, setQuery] = useState("");
  const [businessUnit, setBusinessUnit] = useState("all");
  const [cycleId, setCycleId] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return assessments.filter((a) => {
      const matchesQuery =
        !q ||
        a.id.toLowerCase().includes(q) ||
        a.process.toLowerCase().includes(q) ||
        a.businessUnit.toLowerCase().includes(q) ||
        a.owner.toLowerCase().includes(q);
      const matchesUnit = businessUnit === "all" || a.businessUnit === businessUnit;
      const matchesCycle = cycleId === "all" || a.cycleId === cycleId;
      return matchesQuery && matchesUnit && matchesCycle;
    });
  }, [assessments, query, businessUnit, cycleId]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={dict.rcsa.title}
        subtitle={dict.rcsa.subtitle}
        actions={
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            {dict.rcsa.newAssessment}
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cycles.map((cycle) => (
          <Card key={cycle.id} className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-foreground text-sm font-semibold">{cycle.period}</p>
                <p className="text-muted text-xs">{cycle.name}</p>
              </div>
              <Badge tone={rcsaCycleStatusTone[cycle.status]}>
                {dict.rcsa.enums.cycleStatus[cycle.status]}
              </Badge>
            </div>
            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted">{dict.rcsa.completionRate}</span>
                <span className="text-foreground font-medium">{cycle.completionRate}%</span>
              </div>
              <Progress value={cycle.completionRate} className="mt-1.5" />
            </div>
            <p className="text-muted text-xs">
              {cycle.assessmentsCount} {dict.rcsa.assessmentsAcrossUnits.replace(
                "{count}",
                String(cycle.businessUnitsCount),
              )}
            </p>
          </Card>
        ))}
      </div>

      <Card className="print:hidden grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative lg:col-span-2">
          <Search className="text-muted absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={dict.rcsa.searchPlaceholder}
            className="ps-9"
          />
        </div>
        <div>
          <label className="text-muted mb-1.5 block text-xs font-medium">
            {dict.rcsa.businessUnit}
          </label>
          <Select value={businessUnit} onChange={(e) => setBusinessUnit(e.target.value)}>
            <option value="all">{dict.common.all}</option>
            {BUSINESS_UNITS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <label className="text-muted mb-1.5 block text-xs font-medium">
            {dict.rcsa.cycle}
          </label>
          <Select value={cycleId} onChange={(e) => setCycleId(e.target.value)}>
            <option value="all">{dict.common.all}</option>
            {cycles.map((c) => (
              <option key={c.id} value={c.id}>
                {c.period}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{dict.rcsa.columns.id}</TableHead>
            <TableHead>{dict.rcsa.businessUnit}</TableHead>
            <TableHead>{dict.rcsa.columns.process}</TableHead>
            <TableHead>{dict.common.owner}</TableHead>
            <TableHead>{dict.common.status}</TableHead>
            <TableHead>{dict.rcsa.columns.inherentRisk}</TableHead>
            <TableHead>{dict.rcsa.columns.residualRisk}</TableHead>
            <TableHead>{dict.rcsa.columns.updated}</TableHead>
            <TableHead className="text-end">{dict.common.actions}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((a) => (
            <TableRow key={a.id}>
              <TableCell className="text-muted font-mono text-xs">
                <Link href={`/rcsa/${a.id}`} className="hover:text-primary hover:underline">
                  {a.id}
                </Link>
              </TableCell>
              <TableCell className="text-foreground">{a.businessUnit}</TableCell>
              <TableCell className="text-muted max-w-56 truncate">{a.process}</TableCell>
              <TableCell className="text-muted">{a.owner}</TableCell>
              <TableCell>
                <Badge tone={rcsaWorkflowStatusTone[a.status]} dot>
                  {dict.rcsa.enums.workflowStatus[a.status]}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge tone={severityTone[a.overallInherentRisk]}>
                  {dict.common[a.overallInherentRisk]}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge tone={severityTone[a.overallResidualRisk]}>
                  {dict.common[a.overallResidualRisk]}
                </Badge>
              </TableCell>
              <TableCell className="text-muted">
                {formatDate(a.updatedAt, dict.meta.locale)}
              </TableCell>
              <TableCell className="text-end">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeAssessment(a.id)}
                >
                  <Trash2 className="text-danger h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {filtered.length === 0 && (
            <TableRow>
              <TableCell colSpan={9} className="text-muted py-10 text-center">
                <div className="flex flex-col items-center gap-2">
                  <ClipboardCheck className="text-muted h-8 w-8" />
                  {dict.common.noResults}
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <RcsaCreateDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
