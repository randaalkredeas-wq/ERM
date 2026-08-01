"use client";

import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  ShieldAlert,
} from "lucide-react";
import { useMemo, useState } from "react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
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
import {
  riskScore,
  riskStatusTone,
  severityFromScore,
  severityTone,
} from "@/lib/domain";
import { risks } from "@/lib/mock-data/risks";
import { formatDate } from "@/lib/utils";
import { useLocale } from "@/providers/locale-provider";

const PAGE_SIZE = 6;

export default function RiskRegisterPage() {
  const { dict } = useLocale();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);

  const categories = useMemo(
    () => Array.from(new Set(risks.map((r) => r.category))),
    [],
  );

  const filtered = useMemo(() => {
    return risks.filter((risk) => {
      const matchesQuery = risk.title
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchesCategory = category === "all" || risk.category === category;
      const matchesStatus = status === "all" || risk.status === status;
      return matchesQuery && matchesCategory && matchesStatus;
    });
  }, [query, category, status]);

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

  return (
    <div className="space-y-6">
      <PageHeader
        title={dict.riskRegister.title}
        subtitle={dict.riskRegister.subtitle}
        actions={
          <Button size="sm">
            <Plus className="h-4 w-4" />
            {dict.riskRegister.addRisk}
          </Button>
        }
      />

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

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
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
        <Select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
          className="sm:w-48"
        >
          <option value="all">{dict.common.all}</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
        <Select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="sm:w-44"
        >
          <option value="all">{dict.common.all}</option>
          <option value="open">{dict.common.open}</option>
          <option value="mitigating">{dict.common.inProgress}</option>
          <option value="closed">{dict.common.closed}</option>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{dict.riskRegister.columns.id}</TableHead>
            <TableHead>{dict.riskRegister.columns.title}</TableHead>
            <TableHead>{dict.riskRegister.columns.category}</TableHead>
            <TableHead>{dict.riskRegister.columns.owner}</TableHead>
            <TableHead>{dict.riskRegister.columns.score}</TableHead>
            <TableHead>{dict.riskRegister.columns.status}</TableHead>
            <TableHead>{dict.riskRegister.columns.updated}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paged.map((risk) => {
            const score = riskScore(risk);
            return (
              <TableRow key={risk.id}>
                <TableCell className="text-muted font-mono text-xs">
                  {risk.id}
                </TableCell>
                <TableCell className="text-foreground max-w-72 truncate font-medium">
                  {risk.title}
                </TableCell>
                <TableCell className="text-muted">{risk.category}</TableCell>
                <TableCell className="text-muted">{risk.owner}</TableCell>
                <TableCell>
                  <Badge tone={severityTone[severityFromScore(score)]}>
                    {score}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge tone={riskStatusTone[risk.status]} dot>
                    {
                      dict.common[
                        risk.status === "mitigating"
                          ? "inProgress"
                          : risk.status
                      ]
                    }
                  </Badge>
                </TableCell>
                <TableCell className="text-muted">
                  {formatDate(risk.updatedAt, dict.meta.locale)}
                </TableCell>
              </TableRow>
            );
          })}
          {paged.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-muted py-10 text-center">
                {dict.common.noResults}
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
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            disabled={currentPage === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
          </Button>
          <span className="min-w-16 text-center">
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
    </div>
  );
}
