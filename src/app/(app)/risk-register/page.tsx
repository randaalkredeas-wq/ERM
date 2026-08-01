"use client";

import {
  AlertCircle,
  Archive,
  ArchiveRestore,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  Eye,
  FileDown,
  FileSpreadsheet,
  FileUp,
  MoreVertical,
  Pencil,
  Plus,
  Printer,
  Search,
  ShieldAlert,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";

import { PageHeader } from "@/components/layout/PageHeader";
import { RiskDeleteDialog } from "@/components/risk-register/RiskDeleteDialog";
import {
  emptyRiskFilters,
  RiskFiltersPanel,
  type RiskFilterState,
} from "@/components/risk-register/RiskFiltersPanel";
import { RiskFormDialog } from "@/components/risk-register/RiskFormDialog";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { Input } from "@/components/ui/Input";
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
  riskScore,
  riskStatusTone,
  severityFromScore,
  severityTone,
  workflowStatusTone,
} from "@/lib/domain";
import {
  exportRisksToExcel,
  exportRisksToPdf,
  parseRisksFromExcel,
  RiskImportError,
} from "@/lib/risk-export";
import { useSavedRiskFilters } from "@/lib/saved-filters";
import { cn, formatDate } from "@/lib/utils";
import { useLocale } from "@/providers/locale-provider";
import type { RiskItem } from "@/types";

import { useRiskRegister } from "./risk-register-context";

const PAGE_SIZE = 8;

export default function RiskRegisterPage() {
  const { dict } = useLocale();
  const { risks, deleteRisk, importRisks, duplicateRisk, archiveRisk, unarchiveRisk } =
    useRiskRegister();
  const { saved, save, remove } = useSavedRiskFilters();

  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<RiskFilterState>(emptyRiskFilters);
  const [showFilters, setShowFilters] = useState(false);
  const [showSavedFilters, setShowSavedFilters] = useState(false);
  const [saveFilterName, setSaveFilterName] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editingRisk, setEditingRisk] = useState<RiskItem | undefined>();
  const [formKey, setFormKey] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<RiskItem | null>(null);
  const [banner, setBanner] = useState<{
    tone: "success" | "danger";
    message: string;
  } | null>(null);
  const [pdfExporting, setPdfExporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return risks.filter((risk) => {
      if (!showArchived && risk.isArchived) return false;
      const matchesQuery =
        !q ||
        risk.title.toLowerCase().includes(q) ||
        risk.id.toLowerCase().includes(q) ||
        risk.owner.toLowerCase().includes(q);
      const matchesDept =
        filters.department === "all" || risk.department === filters.department;
      const matchesCategory =
        filters.category === "all" || risk.category === filters.category;
      const matchesSubcategory =
        filters.subcategory === "all" ||
        risk.subcategory === filters.subcategory;
      const matchesStatus =
        filters.status === "all" || risk.status === filters.status;
      const matchesWorkflow =
        filters.workflowStatus === "all" ||
        risk.workflowStatus === filters.workflowStatus;
      const matchesInherent =
        filters.inherentRisk === "all" ||
        risk.inherentRisk === filters.inherentRisk;
      const matchesResidual =
        filters.residualRisk === "all" ||
        severityFromScore(riskScore(risk)) === filters.residualRisk;
      const matchesOwner =
        filters.owner === "all" || risk.owner === filters.owner;
      const matchesDueFrom =
        !filters.dueDateFrom || risk.dueDate >= filters.dueDateFrom;
      const matchesDueTo =
        !filters.dueDateTo || risk.dueDate <= filters.dueDateTo;

      return (
        matchesQuery &&
        matchesDept &&
        matchesCategory &&
        matchesSubcategory &&
        matchesStatus &&
        matchesWorkflow &&
        matchesInherent &&
        matchesResidual &&
        matchesOwner &&
        matchesDueFrom &&
        matchesDueTo
      );
    });
  }, [risks, query, filters, showArchived]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const highCount = risks.filter((r) =>
    ["high", "critical"].includes(severityFromScore(riskScore(r))),
  ).length;
  const mediumCount = risks.filter(
    (r) => severityFromScore(riskScore(r)) === "medium",
  ).length;
  const lowCount = risks.filter(
    (r) => severityFromScore(riskScore(r)) === "low",
  ).length;

  function openCreate() {
    setEditingRisk(undefined);
    setFormKey((k) => k + 1);
    setFormOpen(true);
  }

  function openEdit(risk: RiskItem) {
    setEditingRisk(risk);
    setFormKey((k) => k + 1);
    setFormOpen(true);
  }

  async function handleImportFile(file: File) {
    try {
      const inputs = await parseRisksFromExcel(file);
      const count = await importRisks(inputs);
      setBanner({
        tone: "success",
        message: dict.riskRegister.importSuccess.replace(
          "{count}",
          String(count),
        ),
      });
    } catch (error) {
      setBanner({
        tone: "danger",
        message:
          error instanceof RiskImportError
            ? error.message
            : dict.riskRegister.importError,
      });
    }
  }

  async function handleExportPdf() {
    setPdfExporting(true);
    try {
      await exportRisksToPdf(filtered);
    } finally {
      setPdfExporting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={dict.riskRegister.title}
        subtitle={dict.riskRegister.subtitle}
        actions={
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleImportFile(file);
                e.target.value = "";
              }}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <FileUp className="h-4 w-4" />
              {dict.riskRegister.importExcel}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportRisksToExcel(filtered)}
            >
              <FileSpreadsheet className="h-4 w-4" />
              {dict.riskRegister.exportExcel}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pdfExporting}
              onClick={handleExportPdf}
            >
              <FileDown className="h-4 w-4" />
              {dict.riskRegister.exportPdf}
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="h-4 w-4" />
              {dict.riskRegister.print}
            </Button>
            <Button size="sm" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              {dict.riskRegister.addRisk}
            </Button>
          </>
        }
      />

      {banner && (
        <div
          className={cn(
            "flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm",
            banner.tone === "success"
              ? "border-success/30 bg-success-container text-success"
              : "border-danger/30 bg-danger-container text-danger",
          )}
        >
          <span className="flex items-center gap-2">
            {banner.tone === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" />
            )}
            {banner.message}
          </span>
          <button
            type="button"
            onClick={() => setBanner(null)}
            className="shrink-0 opacity-70 hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={dict.riskRegister.totalRisks}
          value={String(risks.length)}
          icon={ShieldAlert}
          tone="primary"
        />
        <StatCard
          label={dict.riskRegister.highSeverity}
          value={String(highCount)}
          icon={ShieldAlert}
          tone="danger"
        />
        <StatCard
          label={dict.riskRegister.mediumSeverity}
          value={String(mediumCount)}
          icon={ShieldAlert}
          tone="warning"
        />
        <StatCard
          label={dict.riskRegister.lowSeverity}
          value={String(lowCount)}
          icon={ShieldAlert}
          tone="success"
        />
      </div>

      <div className="print:hidden flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="text-muted absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder={dict.riskRegister.searchPlaceholder}
            className="ps-9"
          />
        </div>
        <label className="text-muted flex shrink-0 items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showArchived}
            onChange={(e) => {
              setShowArchived(e.target.checked);
              setPage(1);
            }}
            className="accent-primary h-4 w-4 rounded"
          />
          {dict.riskRegister.showArchived}
        </label>
        <Button
          variant={showFilters ? "primary" : "outline"}
          onClick={() => setShowFilters((v) => !v)}
        >
          <SlidersHorizontal className="h-4 w-4" />
          {dict.riskRegister.advancedFilters}
        </Button>
        <Button
          variant={showSavedFilters ? "primary" : "outline"}
          onClick={() => setShowSavedFilters((v) => !v)}
        >
          {dict.riskRegister.savedFilters.title}
        </Button>
      </div>

      {showFilters && (
        <div className="print:hidden">
          <RiskFiltersPanel
            filters={filters}
            onChange={(next) => {
              setFilters(next);
              setPage(1);
            }}
          />
        </div>
      )}

      {showSavedFilters && (
        <Card className="print:hidden space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              value={saveFilterName}
              onChange={(e) => setSaveFilterName(e.target.value)}
              placeholder={dict.riskRegister.savedFilters.namePlaceholder}
            />
            <Button
              variant="outline"
              disabled={!saveFilterName.trim()}
              onClick={() => {
                save(saveFilterName.trim(), filters);
                setSaveFilterName("");
              }}
            >
              {dict.riskRegister.savedFilters.save}
            </Button>
          </div>
          {saved.length === 0 ? (
            <p className="text-muted text-sm">
              {dict.riskRegister.savedFilters.empty}
            </p>
          ) : (
            <div className="space-y-2">
              {saved.map((entry) => (
                <div
                  key={entry.id}
                  className="border-border flex items-center justify-between gap-3 rounded-lg border px-3 py-2"
                >
                  <span className="text-foreground text-sm font-medium">
                    {entry.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setFilters(entry.filters);
                        setShowFilters(true);
                        setPage(1);
                      }}
                    >
                      {dict.riskRegister.savedFilters.apply}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-danger"
                      onClick={() => remove(entry.id)}
                    >
                      {dict.riskRegister.savedFilters.remove}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{dict.riskRegister.columns.id}</TableHead>
            <TableHead>{dict.riskRegister.columns.title}</TableHead>
            <TableHead>{dict.riskRegister.columns.department}</TableHead>
            <TableHead>{dict.riskRegister.columns.category}</TableHead>
            <TableHead>{dict.riskRegister.columns.owner}</TableHead>
            <TableHead>{dict.riskRegister.columns.inherentRisk}</TableHead>
            <TableHead>{dict.riskRegister.columns.residualRisk}</TableHead>
            <TableHead>{dict.riskRegister.columns.status}</TableHead>
            <TableHead>{dict.riskRegister.columns.workflowStatus}</TableHead>
            <TableHead>{dict.riskRegister.columns.dueDate}</TableHead>
            <TableHead className="print:hidden text-end">
              {dict.common.actions}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paged.map((risk) => {
            const score = riskScore(risk);
            const residual = severityFromScore(score);
            return (
              <TableRow key={risk.id}>
                <TableCell className="text-muted font-mono text-xs">
                  {risk.id}
                </TableCell>
                <TableCell className="text-foreground max-w-64 truncate font-medium">
                  <Link
                    href={`/risk-register/${risk.id}`}
                    className="hover:text-primary hover:underline"
                  >
                    {risk.title}
                  </Link>
                  {risk.isArchived && (
                    <Badge tone="neutral" className="ms-2">
                      {dict.common.archived}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-muted">{risk.department}</TableCell>
                <TableCell className="text-muted">{risk.category}</TableCell>
                <TableCell className="text-muted">{risk.owner}</TableCell>
                <TableCell>
                  <Badge tone={severityTone[risk.inherentRisk]}>
                    {dict.common[risk.inherentRisk]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge tone={severityTone[residual]}>
                    {dict.common[residual]} · {score}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge tone={riskStatusTone[risk.status]} dot>
                    {dict.common[risk.status === "mitigating" ? "inProgress" : risk.status]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge tone={workflowStatusTone[risk.workflowStatus]}>
                    {dict.riskRegister.enums.workflowStatus[risk.workflowStatus]}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted">
                  {formatDate(risk.dueDate, dict.meta.locale)}
                </TableCell>
                <TableCell className="print:hidden text-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">{dict.common.actions}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/risk-register/${risk.id}`}>
                          <Eye className="h-4 w-4" />
                          {dict.common.view}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openEdit(risk)}>
                        <Pencil className="h-4 w-4" />
                        {dict.common.edit}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          void duplicateRisk(risk.id).catch(console.error)
                        }
                      >
                        <Copy className="h-4 w-4" />
                        {dict.common.duplicate}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          void (risk.isArchived
                            ? unarchiveRisk(risk.id)
                            : archiveRisk(risk.id)
                          ).catch(console.error)
                        }
                      >
                        {risk.isArchived ? (
                          <ArchiveRestore className="h-4 w-4" />
                        ) : (
                          <Archive className="h-4 w-4" />
                        )}
                        {risk.isArchived
                          ? dict.common.unarchive
                          : dict.common.archive}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-danger"
                        onClick={() => setDeleteTarget(risk)}
                      >
                        <Trash2 className="h-4 w-4" />
                        {dict.common.delete}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
          {paged.length === 0 && (
            <TableRow>
              <TableCell colSpan={11} className="text-muted py-10 text-center">
                {dict.riskRegister.noRisksFound}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="text-muted flex items-center justify-between text-sm">
        <p>
          {dict.riskRegister.showingResults
            .replace("{count}", String(paged.length))
            .replace("{total}", String(filtered.length))}
        </p>
        <div className="print:hidden flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            disabled={currentPage === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
          </Button>
          <span className="min-w-16 text-center" dir="ltr">
            {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            disabled={currentPage === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            <ChevronRight className="h-4 w-4 rtl:rotate-180" />
          </Button>
        </div>
      </div>

      <RiskFormDialog
        key={formKey}
        open={formOpen}
        onOpenChange={setFormOpen}
        risk={editingRisk}
      />

      <RiskDeleteDialog
        risk={deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={(risk) => {
          void deleteRisk(risk.id).catch(console.error);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
