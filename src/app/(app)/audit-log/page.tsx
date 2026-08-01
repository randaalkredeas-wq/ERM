"use client";

import { FileDown, FileSpreadsheet, Printer, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { useAuditLog } from "@/lib/audit-log-store";
import {
  exportAuditLogToExcel,
  exportAuditLogToPdf,
} from "@/lib/audit-log-export";
import { useLocale } from "@/providers/locale-provider";

export default function AuditLogPage() {
  const { dict } = useLocale();
  const entries = useAuditLog();
  const [query, setQuery] = useState("");
  const [user, setUser] = useState("all");
  const [module, setModule] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [pdfExporting, setPdfExporting] = useState(false);

  const users = useMemo(
    () => Array.from(new Set(entries.map((e) => e.user))).sort(),
    [entries],
  );
  const modules = useMemo(
    () => Array.from(new Set(entries.map((e) => e.module))).sort(),
    [entries],
  );

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return entries.filter((entry) => {
      const matchesQuery =
        !q ||
        entry.user.toLowerCase().includes(q) ||
        entry.action.toLowerCase().includes(q) ||
        entry.module.toLowerCase().includes(q) ||
        entry.details.toLowerCase().includes(q);
      const matchesUser = user === "all" || entry.user === user;
      const matchesModule = module === "all" || entry.module === module;
      const entryDate = entry.timestamp.slice(0, 10);
      const matchesFrom = !dateFrom || entryDate >= dateFrom;
      const matchesTo = !dateTo || entryDate <= dateTo;
      return (
        matchesQuery &&
        matchesUser &&
        matchesModule &&
        matchesFrom &&
        matchesTo
      );
    });
  }, [entries, query, user, module, dateFrom, dateTo]);

  async function handleExportPdf() {
    setPdfExporting(true);
    try {
      await exportAuditLogToPdf(filtered);
    } finally {
      setPdfExporting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={dict.auditLog.title}
        subtitle={dict.auditLog.subtitle}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportAuditLogToExcel(filtered)}
            >
              <FileSpreadsheet className="h-4 w-4" />
              {dict.auditLog.exportExcel}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pdfExporting}
              onClick={handleExportPdf}
            >
              <FileDown className="h-4 w-4" />
              {dict.auditLog.exportPdf}
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="h-4 w-4" />
              {dict.auditLog.print}
            </Button>
          </>
        }
      />

      <Card className="print:hidden grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative lg:col-span-2">
          <Search className="text-muted absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={dict.auditLog.searchPlaceholder}
            className="ps-9"
          />
        </div>
        <div>
          <label className="text-muted mb-1.5 block text-xs font-medium">
            {dict.auditLog.filters.user}
          </label>
          <Select value={user} onChange={(e) => setUser(e.target.value)}>
            <option value="all">{dict.auditLog.allUsers}</option>
            {users.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <label className="text-muted mb-1.5 block text-xs font-medium">
            {dict.auditLog.filters.module}
          </label>
          <Select value={module} onChange={(e) => setModule(e.target.value)}>
            <option value="all">{dict.auditLog.allModules}</option>
            {modules.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <label className="text-muted mb-1.5 block text-xs font-medium">
            {dict.auditLog.filters.dateFrom}
          </label>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>
        <div>
          <label className="text-muted mb-1.5 block text-xs font-medium">
            {dict.auditLog.filters.dateTo}
          </label>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>
      </Card>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{dict.auditLog.columns.timestamp}</TableHead>
            <TableHead>{dict.auditLog.columns.user}</TableHead>
            <TableHead>{dict.auditLog.columns.action}</TableHead>
            <TableHead>{dict.auditLog.columns.module}</TableHead>
            <TableHead>{dict.auditLog.columns.details}</TableHead>
            <TableHead>{dict.auditLog.columns.ip}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell className="text-muted">{entry.timestamp}</TableCell>
              <TableCell className="text-foreground font-medium">
                {entry.user}
              </TableCell>
              <TableCell className="text-muted">{entry.action}</TableCell>
              <TableCell>
                <Badge tone="neutral">{entry.module}</Badge>
              </TableCell>
              <TableCell className="text-muted max-w-96 truncate">
                {entry.details}
              </TableCell>
              <TableCell className="text-muted font-mono text-xs">
                {entry.ip}
              </TableCell>
            </TableRow>
          ))}
          {filtered.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-muted py-10 text-center">
                {dict.common.noResults}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <p className="text-muted text-sm">
        {dict.auditLog.showingResults
          .replace("{count}", String(filtered.length))
          .replace("{total}", String(entries.length))}
      </p>
    </div>
  );
}
