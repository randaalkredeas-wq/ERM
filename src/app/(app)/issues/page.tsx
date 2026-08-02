"use client";

import { AlertOctagon, CheckCircle2, Flag, Plus, Search, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { IssueFormDialog } from "@/components/issues/IssueFormDialog";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
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
import { isIssueOverdue, issuePriorityTone, issueStatusTone } from "@/lib/grc-domain";
import { formatDate } from "@/lib/utils";
import { useLocale } from "@/providers/locale-provider";

import { useIssues } from "./issues-context";

export default function IssuesPage() {
  const { dict } = useLocale();
  const { issues } = useIssues();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return issues.filter((i) => {
      const matchesQuery =
        !q || i.id.toLowerCase().includes(q) || i.title.toLowerCase().includes(q);
      const matchesStatus = status === "all" || i.status === status;
      const matchesPriority = priority === "all" || i.priority === priority;
      return matchesQuery && matchesStatus && matchesPriority;
    });
  }, [issues, query, status, priority]);

  const openCount = issues.filter((i) => i.status === "open" || i.status === "in-progress").length;
  const escalatedCount = issues.filter((i) => i.status === "escalated").length;
  const closedCount = issues.filter((i) => i.status === "closed" || i.status === "resolved").length;
  const overdueCount = issues.filter(isIssueOverdue).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title={dict.issues.title}
        subtitle={dict.issues.subtitle}
        actions={
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            {dict.issues.logIssue}
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Flag} label={dict.issues.openIssues} value={String(openCount)} tone="warning" />
        <StatCard
          icon={TriangleAlert}
          label={dict.issues.escalatedIssues}
          value={String(escalatedCount)}
          tone="danger"
        />
        <StatCard
          icon={CheckCircle2}
          label={dict.issues.closedIssues}
          value={String(closedCount)}
          tone="success"
        />
        <StatCard
          icon={AlertOctagon}
          label={dict.issues.overdueIssues}
          value={String(overdueCount)}
          tone="danger"
        />
      </div>

      <Card className="print:hidden grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative lg:col-span-2">
          <Search className="text-muted absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={dict.issues.searchPlaceholder}
            className="ps-9"
          />
        </div>
        <div>
          <label className="text-muted mb-1.5 block text-xs font-medium">
            {dict.common.status}
          </label>
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">{dict.common.all}</option>
            <option value="open">{dict.common.open}</option>
            <option value="in-progress">{dict.common.inProgress}</option>
            <option value="escalated">{dict.issues.enums.status.escalated}</option>
            <option value="resolved">{dict.common.resolved}</option>
            <option value="closed">{dict.common.closed}</option>
          </Select>
        </div>
        <div>
          <label className="text-muted mb-1.5 block text-xs font-medium">
            {dict.common.priority}
          </label>
          <Select value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="all">{dict.common.all}</option>
            <option value="low">{dict.common.low}</option>
            <option value="medium">{dict.common.medium}</option>
            <option value="high">{dict.common.high}</option>
            <option value="critical">{dict.common.critical}</option>
          </Select>
        </div>
      </Card>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{dict.issues.columns.id}</TableHead>
            <TableHead>{dict.issues.columns.title}</TableHead>
            <TableHead>{dict.issues.columns.source}</TableHead>
            <TableHead>{dict.common.priority}</TableHead>
            <TableHead>{dict.common.status}</TableHead>
            <TableHead>{dict.common.owner}</TableHead>
            <TableHead>{dict.issues.columns.dueDate}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((issue) => (
            <TableRow key={issue.id}>
              <TableCell className="text-muted font-mono text-xs">
                <Link href={`/issues/${issue.id}`} className="hover:text-primary hover:underline">
                  {issue.id}
                </Link>
              </TableCell>
              <TableCell className="text-foreground max-w-72 truncate font-medium">
                {issue.title}
              </TableCell>
              <TableCell className="text-muted">{dict.issues.enums.source[issue.source]}</TableCell>
              <TableCell>
                <Badge tone={issuePriorityTone[issue.priority]}>{dict.common[issue.priority]}</Badge>
              </TableCell>
              <TableCell>
                <Badge tone={issueStatusTone[issue.status]} dot>
                  {dict.issues.enums.status[issue.status]}
                </Badge>
              </TableCell>
              <TableCell className="text-muted">{issue.owner}</TableCell>
              <TableCell
                className={isIssueOverdue(issue) ? "text-danger font-medium" : "text-muted"}
              >
                {formatDate(issue.dueDate, dict.meta.locale)}
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

      <IssueFormDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
