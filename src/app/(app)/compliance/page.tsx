"use client";

import { CalendarClock, FileWarning, Plus, ScrollText, Trash2 } from "lucide-react";
import { useState } from "react";

import { PageHeader } from "@/components/layout/PageHeader";
import { ObligationFormDialog } from "@/components/compliance/ObligationFormDialog";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
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
import { severityTone } from "@/lib/domain";
import { complianceStatusTone, isReviewUpcoming } from "@/lib/grc-domain";
import { formatDate } from "@/lib/utils";
import { useLocale } from "@/providers/locale-provider";

import { useCompliance } from "./compliance-context";

export default function CompliancePage() {
  const { dict } = useLocale();
  const { obligations, nonComplianceRegister, calendar, updateNonComplianceStatus, removeObligation } =
    useCompliance();
  const [createOpen, setCreateOpen] = useState(false);

  const compliantCount = obligations.filter((o) => o.status === "compliant").length;
  const nonCompliantCount = obligations.filter((o) => o.status === "non-compliant").length;
  const upcomingReviews = obligations.filter((o) => isReviewUpcoming(o.nextReview)).length;
  const openNonCompliance = nonComplianceRegister.filter((n) => n.status !== "resolved").length;

  const upcomingCalendar = [...calendar].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={dict.compliance.title}
        subtitle={dict.compliance.subtitle}
        actions={
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            {dict.compliance.addObligation}
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={ScrollText} label={dict.compliance.compliantObligations} value={String(compliantCount)} tone="success" />
        <StatCard
          icon={FileWarning}
          label={dict.compliance.nonCompliantObligations}
          value={String(nonCompliantCount)}
          tone="danger"
        />
        <StatCard
          icon={CalendarClock}
          label={dict.compliance.upcomingReviews}
          value={String(upcomingReviews)}
          tone="warning"
        />
        <StatCard
          icon={FileWarning}
          label={dict.compliance.openNonCompliance}
          value={String(openNonCompliance)}
          tone="danger"
        />
      </div>

      <Tabs defaultValue="obligations">
        <TabsList className="flex-wrap">
          <TabsTrigger value="obligations">{dict.compliance.obligations}</TabsTrigger>
          <TabsTrigger value="calendar">{dict.compliance.calendar}</TabsTrigger>
          <TabsTrigger value="nonCompliance">
            {dict.compliance.nonComplianceRegister} ({nonComplianceRegister.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="obligations">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{dict.compliance.columns.title}</TableHead>
                <TableHead>{dict.compliance.columns.type}</TableHead>
                <TableHead>{dict.compliance.columns.jurisdiction}</TableHead>
                <TableHead>{dict.common.owner}</TableHead>
                <TableHead>{dict.common.status}</TableHead>
                <TableHead>{dict.compliance.columns.nextReview}</TableHead>
                <TableHead className="text-end">{dict.common.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {obligations.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="text-foreground max-w-64 truncate font-medium">{o.title}</TableCell>
                  <TableCell className="text-muted">{dict.compliance.enums.type[o.type]}</TableCell>
                  <TableCell className="text-muted">{o.jurisdiction}</TableCell>
                  <TableCell className="text-muted">{o.owner}</TableCell>
                  <TableCell>
                    <Badge tone={complianceStatusTone[o.status]} dot>
                      {dict.compliance.enums.status[o.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className={isReviewUpcoming(o.nextReview) ? "text-warning font-medium" : "text-muted"}>
                    {formatDate(o.nextReview, dict.meta.locale)}
                  </TableCell>
                  <TableCell className="text-end">
                    <Button variant="ghost" size="icon" onClick={() => removeObligation(o.id)}>
                      <Trash2 className="text-danger h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-3">
          {upcomingCalendar.map((entry) => (
            <Card key={entry.id} className="flex items-center justify-between gap-3">
              <div>
                <p className="text-foreground text-sm font-medium">{entry.title}</p>
                <p className="text-muted text-xs">{dict.compliance.enums.calendarType[entry.type]}</p>
              </div>
              <Badge tone={isReviewUpcoming(entry.date) ? "warning" : "neutral"}>
                {formatDate(entry.date, dict.meta.locale)}
              </Badge>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="nonCompliance">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{dict.compliance.columns.title}</TableHead>
                <TableHead>{dict.common.category}</TableHead>
                <TableHead>{dict.common.owner}</TableHead>
                <TableHead>{dict.compliance.identifiedDate}</TableHead>
                <TableHead>{dict.compliance.targetResolutionDate}</TableHead>
                <TableHead>{dict.common.status}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {nonComplianceRegister.map((n) => (
                <TableRow key={n.id}>
                  <TableCell className="max-w-64">
                    <p className="text-foreground truncate font-medium">{n.title}</p>
                    <p className="text-muted text-xs">{n.description}</p>
                  </TableCell>
                  <TableCell>
                    <Badge tone={severityTone[n.severity]}>{dict.common[n.severity]}</Badge>
                  </TableCell>
                  <TableCell className="text-muted">{n.owner}</TableCell>
                  <TableCell className="text-muted">{formatDate(n.identifiedDate, dict.meta.locale)}</TableCell>
                  <TableCell className="text-muted">{formatDate(n.targetResolutionDate, dict.meta.locale)}</TableCell>
                  <TableCell>
                    <select
                      value={n.status}
                      onChange={(e) =>
                        updateNonComplianceStatus(n.id, e.target.value as typeof n.status)
                      }
                      className="border-border bg-surface text-foreground rounded-md border px-2 py-1 text-xs"
                    >
                      <option value="open">{dict.compliance.enums.nonComplianceStatus.open}</option>
                      <option value="remediating">{dict.compliance.enums.nonComplianceStatus.remediating}</option>
                      <option value="resolved">{dict.compliance.enums.nonComplianceStatus.resolved}</option>
                    </select>
                  </TableCell>
                </TableRow>
              ))}
              {nonComplianceRegister.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-muted py-10 text-center">
                    {dict.common.noResults}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>

      <ObligationFormDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
