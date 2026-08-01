"use client";

import { Download, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { auditLog } from "@/lib/mock-data/audit-log";
import { useLocale } from "@/providers/locale-provider";

export default function AuditLogPage() {
  const { dict } = useLocale();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return auditLog.filter(
      (entry) =>
        entry.user.toLowerCase().includes(q) ||
        entry.action.toLowerCase().includes(q) ||
        entry.module.toLowerCase().includes(q) ||
        entry.details.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={dict.auditLog.title}
        subtitle={dict.auditLog.subtitle}
        actions={
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4" />
            {dict.auditLog.exportLog}
          </Button>
        }
      />

      <div className="relative max-w-md">
        <Search className="text-muted absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={dict.auditLog.searchPlaceholder}
          className="ps-9"
        />
      </div>

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
    </div>
  );
}
