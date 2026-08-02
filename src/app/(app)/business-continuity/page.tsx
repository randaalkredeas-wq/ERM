"use client";

import { AlertTriangle, CheckCircle2, ClipboardList, Plus, ShieldAlert, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { CrisisEventDialog } from "@/components/business-continuity/CrisisEventDialog";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import {
  bcmCriticalityTone,
  bcpTestResultTone,
  crisisEventStatusTone,
} from "@/lib/grc-domain";
import { formatDate } from "@/lib/utils";
import { useLocale } from "@/providers/locale-provider";

import { useBusinessContinuity } from "./business-continuity-context";

export default function BusinessContinuityPage() {
  const { dict } = useLocale();
  const { processes, crises, updateCrisisStatus, removeCrisisEvent } = useBusinessContinuity();
  const [crisisOpen, setCrisisOpen] = useState(false);

  const criticalCount = processes.filter((p) => p.criticality === "critical").length;
  const untestedCount = processes.filter((p) => p.testResult === "not-tested" || p.testResult === "failed").length;
  const activeCrises = crises.filter((c) => c.status === "active").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title={dict.businessContinuity.title}
        subtitle={dict.businessContinuity.subtitle}
        actions={
          <Button size="sm" variant="danger" onClick={() => setCrisisOpen(true)}>
            <Plus className="h-4 w-4" />
            {dict.businessContinuity.logCrisisEvent}
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={ClipboardList}
          label={dict.businessContinuity.totalProcesses}
          value={String(processes.length)}
          tone="primary"
        />
        <StatCard
          icon={ShieldAlert}
          label={dict.businessContinuity.criticalProcesses}
          value={String(criticalCount)}
          tone="danger"
        />
        <StatCard
          icon={AlertTriangle}
          label={dict.businessContinuity.testingGaps}
          value={String(untestedCount)}
          tone="warning"
        />
        <StatCard
          icon={AlertTriangle}
          label={dict.businessContinuity.activeCrises}
          value={String(activeCrises)}
          tone="danger"
        />
      </div>

      <Tabs defaultValue="processes">
        <TabsList>
          <TabsTrigger value="processes">{dict.businessContinuity.businessProcesses}</TabsTrigger>
          <TabsTrigger value="crises">
            {dict.businessContinuity.crisisEvents} ({crises.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="processes">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{dict.businessContinuity.columns.process}</TableHead>
                <TableHead>{dict.riskRegister.columns.department}</TableHead>
                <TableHead>{dict.businessContinuity.columns.criticality}</TableHead>
                <TableHead>{dict.businessContinuity.mtd}</TableHead>
                <TableHead>{dict.businessContinuity.rto}</TableHead>
                <TableHead>{dict.businessContinuity.rpo}</TableHead>
                <TableHead>{dict.businessContinuity.columns.lastTested}</TableHead>
                <TableHead>{dict.businessContinuity.columns.testResult}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {processes.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="text-foreground max-w-56 truncate font-medium">
                    <Link href={`/business-continuity/${p.id}`} className="hover:text-primary hover:underline">
                      {p.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted">{p.department}</TableCell>
                  <TableCell>
                    <Badge tone={bcmCriticalityTone[p.criticality]}>
                      {dict.common[p.criticality]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted">{p.mtd}</TableCell>
                  <TableCell className="text-muted">{p.rto}</TableCell>
                  <TableCell className="text-muted">{p.rpo}</TableCell>
                  <TableCell className="text-muted">{formatDate(p.lastTested, dict.meta.locale)}</TableCell>
                  <TableCell>
                    <Badge tone={bcpTestResultTone[p.testResult]} dot>
                      {dict.businessContinuity.enums.testResult[p.testResult]}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="crises">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{dict.businessContinuity.columns.title}</TableHead>
                <TableHead>{dict.businessContinuity.triggeredAt}</TableHead>
                <TableHead>{dict.common.status}</TableHead>
                <TableHead>{dict.businessContinuity.affectedProcesses}</TableHead>
                <TableHead className="text-end">{dict.common.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {crises.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="max-w-72">
                    <p className="text-foreground truncate font-medium">{c.title}</p>
                    <p className="text-muted text-xs">{c.description}</p>
                  </TableCell>
                  <TableCell className="text-muted">
                    {formatDate(c.triggeredAt, dict.meta.locale)}
                  </TableCell>
                  <TableCell>
                    <Badge tone={crisisEventStatusTone[c.status]} dot>
                      {dict.businessContinuity.enums.crisisStatus[c.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted">{c.affectedProcesses.length}</TableCell>
                  <TableCell className="text-end">
                    <div className="flex justify-end gap-1">
                      {c.status !== "resolved" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            updateCrisisStatus(c.id, c.status === "active" ? "contained" : "resolved")
                          }
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          {c.status === "active"
                            ? dict.businessContinuity.contain
                            : dict.businessContinuity.resolve}
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => removeCrisisEvent(c.id)}>
                        <Trash2 className="text-danger h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {crises.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted py-10 text-center">
                    {dict.common.noResults}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>

      <CrisisEventDialog open={crisisOpen} onOpenChange={setCrisisOpen} />
    </div>
  );
}
