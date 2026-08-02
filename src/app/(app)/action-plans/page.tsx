"use client";

import { CheckCircle2, ListTodo, Plus, TriangleAlert, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import { ActionPlanFormDialog } from "@/components/action-plans/ActionPlanFormDialog";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Progress } from "@/components/ui/Progress";
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
import { actionPlanStatusTone, isActionPlanOverdue } from "@/lib/grc-domain";
import { formatDate } from "@/lib/utils";
import { useLocale } from "@/providers/locale-provider";

import { useActionPlans } from "./action-plans-context";

export default function ActionPlansPage() {
  const { dict } = useLocale();
  const { actions, updateProgress, removeAction } = useActionPlans();
  const [status, setStatus] = useState("all");
  const [sourceModule, setSourceModule] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);

  const filtered = useMemo(() => {
    return actions.filter((a) => {
      const matchesStatus = status === "all" || a.status === status;
      const matchesSource = sourceModule === "all" || a.sourceModule === sourceModule;
      return matchesStatus && matchesSource;
    });
  }, [actions, status, sourceModule]);

  const notStartedCount = actions.filter((a) => a.status === "not-started").length;
  const inProgressCount = actions.filter((a) => a.status === "in-progress").length;
  const completedCount = actions.filter((a) => a.status === "completed").length;
  const overdueCount = actions.filter(isActionPlanOverdue).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title={dict.actionPlans.title}
        subtitle={dict.actionPlans.subtitle}
        actions={
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            {dict.actionPlans.addAction}
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={ListTodo} label={dict.actionPlans.notStarted} value={String(notStartedCount)} tone="info" />
        <StatCard
          icon={ListTodo}
          label={dict.common.inProgress}
          value={String(inProgressCount)}
          tone="warning"
        />
        <StatCard
          icon={CheckCircle2}
          label={dict.common.completed}
          value={String(completedCount)}
          tone="success"
        />
        <StatCard
          icon={TriangleAlert}
          label={dict.actionPlans.overdue}
          value={String(overdueCount)}
          tone="danger"
        />
      </div>

      <Card className="print:hidden grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="text-muted mb-1.5 block text-xs font-medium">
            {dict.common.status}
          </label>
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">{dict.common.all}</option>
            <option value="not-started">{dict.actionPlans.notStarted}</option>
            <option value="in-progress">{dict.common.inProgress}</option>
            <option value="completed">{dict.common.completed}</option>
          </Select>
        </div>
        <div>
          <label className="text-muted mb-1.5 block text-xs font-medium">
            {dict.actionPlans.columns.source}
          </label>
          <Select value={sourceModule} onChange={(e) => setSourceModule(e.target.value)}>
            <option value="all">{dict.common.all}</option>
            <option value="risk-register">{dict.actionPlans.enums.sourceModule["risk-register"]}</option>
            <option value="rcsa">{dict.actionPlans.enums.sourceModule.rcsa}</option>
            <option value="incident">{dict.actionPlans.enums.sourceModule.incident}</option>
            <option value="issue">{dict.actionPlans.enums.sourceModule.issue}</option>
            <option value="vendor">{dict.actionPlans.enums.sourceModule.vendor}</option>
            <option value="bcm">{dict.actionPlans.enums.sourceModule.bcm}</option>
            <option value="compliance">{dict.actionPlans.enums.sourceModule.compliance}</option>
          </Select>
        </div>
      </Card>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{dict.actionPlans.columns.title}</TableHead>
            <TableHead>{dict.actionPlans.columns.source}</TableHead>
            <TableHead>{dict.common.owner}</TableHead>
            <TableHead>{dict.actionPlans.columns.dueDate}</TableHead>
            <TableHead>{dict.common.status}</TableHead>
            <TableHead className="w-48">{dict.actionPlans.columns.progress}</TableHead>
            <TableHead className="text-end">{dict.common.actions}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((a) => (
            <TableRow key={a.id}>
              <TableCell className="max-w-72">
                <p className="text-foreground truncate font-medium">{a.title}</p>
                <p className="text-muted font-mono text-xs">{a.id}</p>
                {a.dependencies.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {a.dependencies.map((d) => (
                      <Badge key={d.actionId} tone="neutral">
                        {dict.actionPlans.dependsOn} {d.actionId}
                      </Badge>
                    ))}
                  </div>
                )}
              </TableCell>
              <TableCell className="text-muted">
                {dict.actionPlans.enums.sourceModule[a.sourceModule]} · {a.sourceRef}
              </TableCell>
              <TableCell className="text-muted">{a.owner}</TableCell>
              <TableCell className={isActionPlanOverdue(a) ? "text-danger font-medium" : "text-muted"}>
                {formatDate(a.dueDate, dict.meta.locale)}
                {isActionPlanOverdue(a) && (
                  <Badge tone="danger" className="ms-2">
                    {dict.actionPlans.overdue}
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <Badge tone={actionPlanStatusTone[a.status]} dot>
                  {a.status === "not-started"
                    ? dict.actionPlans.notStarted
                    : a.status === "in-progress"
                      ? dict.common.inProgress
                      : dict.common.completed}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Progress value={a.progress} className="w-24" />
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={a.progress}
                    onChange={(e) => updateProgress(a.id, Number(e.target.value))}
                    className="h-8 w-16 px-2 text-xs"
                  />
                </div>
              </TableCell>
              <TableCell className="text-end">
                <Button variant="ghost" size="icon" onClick={() => removeAction(a.id)}>
                  <Trash2 className="text-danger h-4 w-4" />
                </Button>
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

      <ActionPlanFormDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
