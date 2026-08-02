"use client";

import { CheckCircle2, LibraryBig, Plus, Search, ShieldCheck, Trash2, XCircle } from "lucide-react";
import { useMemo, useState } from "react";

import { PageHeader } from "@/components/layout/PageHeader";
import { ControlFormDialog } from "@/components/controls-library/ControlFormDialog";
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
import { CONTROL_TYPE_OPTIONS } from "@/constants/grc";
import { controlTestingStatusTone, controlTypeTone, isReviewUpcoming } from "@/lib/grc-domain";
import { formatDate } from "@/lib/utils";
import { useLocale } from "@/providers/locale-provider";

import { useControlsLibrary } from "./controls-library-context";

export default function ControlsLibraryPage() {
  const { dict } = useLocale();
  const { controls, removeControl } = useControlsLibrary();
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [testingStatus, setTestingStatus] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>(undefined);
  const [formKey, setFormKey] = useState(0);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return controls.filter((c) => {
      const matchesQuery =
        !q ||
        c.id.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.owner.toLowerCase().includes(q);
      const matchesType = type === "all" || c.type === type;
      const matchesTesting = testingStatus === "all" || c.testingStatus === testingStatus;
      return matchesQuery && matchesType && matchesTesting;
    });
  }, [controls, query, type, testingStatus]);

  const passedCount = controls.filter((c) => c.testingStatus === "passed").length;
  const failedCount = controls.filter((c) => c.testingStatus === "failed").length;
  const dueForReviewCount = controls.filter((c) => isReviewUpcoming(c.nextReview)).length;

  function openCreate() {
    setEditingId(undefined);
    setFormKey((k) => k + 1);
    setFormOpen(true);
  }

  function openEdit(id: string) {
    setEditingId(id);
    setFormKey((k) => k + 1);
    setFormOpen(true);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={dict.controlsLibrary.title}
        subtitle={dict.controlsLibrary.subtitle}
        actions={
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            {dict.controlsLibrary.addControl}
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={LibraryBig}
          label={dict.controlsLibrary.totalControls}
          value={String(controls.length)}
          tone="primary"
        />
        <StatCard
          icon={CheckCircle2}
          label={dict.controlsLibrary.testsPassed}
          value={String(passedCount)}
          tone="success"
        />
        <StatCard
          icon={XCircle}
          label={dict.controlsLibrary.testsFailed}
          value={String(failedCount)}
          tone="danger"
        />
        <StatCard
          icon={ShieldCheck}
          label={dict.controlsLibrary.dueForReview}
          value={String(dueForReviewCount)}
          tone="warning"
        />
      </div>

      <Card className="print:hidden grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative lg:col-span-2">
          <Search className="text-muted absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={dict.controlsLibrary.searchPlaceholder}
            className="ps-9"
          />
        </div>
        <div>
          <label className="text-muted mb-1.5 block text-xs font-medium">
            {dict.controlsLibrary.columns.type}
          </label>
          <Select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="all">{dict.common.all}</option>
            {CONTROL_TYPE_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {dict.controlsLibrary.enums.type[t]}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <label className="text-muted mb-1.5 block text-xs font-medium">
            {dict.controlsLibrary.columns.testingStatus}
          </label>
          <Select value={testingStatus} onChange={(e) => setTestingStatus(e.target.value)}>
            <option value="all">{dict.common.all}</option>
            <option value="not-tested">{dict.controlsLibrary.enums.testingStatus["not-tested"]}</option>
            <option value="in-progress">{dict.controlsLibrary.enums.testingStatus["in-progress"]}</option>
            <option value="passed">{dict.controlsLibrary.enums.testingStatus.passed}</option>
            <option value="failed">{dict.controlsLibrary.enums.testingStatus.failed}</option>
          </Select>
        </div>
      </Card>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{dict.controlsLibrary.columns.id}</TableHead>
            <TableHead>{dict.controlsLibrary.columns.name}</TableHead>
            <TableHead>{dict.controlsLibrary.columns.type}</TableHead>
            <TableHead>{dict.controlsLibrary.columns.frequency}</TableHead>
            <TableHead>{dict.common.owner}</TableHead>
            <TableHead>{dict.controlsLibrary.columns.testingStatus}</TableHead>
            <TableHead>{dict.controlsLibrary.columns.effectiveness}</TableHead>
            <TableHead>{dict.controlsLibrary.columns.nextReview}</TableHead>
            <TableHead className="text-end">{dict.common.actions}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((c) => (
            <TableRow
              key={c.id}
              className="hover:bg-surface-2/60 cursor-pointer"
              onClick={() => openEdit(c.id)}
            >
              <TableCell className="text-muted font-mono text-xs">{c.id}</TableCell>
              <TableCell className="text-foreground max-w-64 truncate">{c.name}</TableCell>
              <TableCell>
                <Badge tone={controlTypeTone[c.type]}>
                  {dict.controlsLibrary.enums.type[c.type]}
                </Badge>
              </TableCell>
              <TableCell className="text-muted">
                {dict.controlsLibrary.enums.frequency[c.frequency]}
              </TableCell>
              <TableCell className="text-muted">{c.owner}</TableCell>
              <TableCell>
                <Badge tone={controlTestingStatusTone[c.testingStatus]} dot>
                  {dict.controlsLibrary.enums.testingStatus[c.testingStatus]}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge tone="info">
                  {dict.riskRegister.enums.controlEffectiveness[c.effectiveness]}
                </Badge>
              </TableCell>
              <TableCell className={isReviewUpcoming(c.nextReview) ? "text-warning font-medium" : "text-muted"}>
                {formatDate(c.nextReview, dict.meta.locale)}
              </TableCell>
              <TableCell className="text-end">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeControl(c.id);
                  }}
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
                  <LibraryBig className="text-muted h-8 w-8" />
                  {dict.common.noResults}
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <ControlFormDialog
        key={formKey}
        open={formOpen}
        onOpenChange={setFormOpen}
        controlId={editingId}
      />
    </div>
  );
}
