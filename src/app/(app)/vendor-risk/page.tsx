"use client";

import { Building2, CalendarClock, Plus, ShieldAlert, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { PageHeader } from "@/components/layout/PageHeader";
import { VendorFormDialog } from "@/components/vendor-risk/VendorFormDialog";
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
import { VENDOR_CLASSIFICATION_OPTIONS } from "@/constants/grc";
import { severityTone } from "@/lib/domain";
import { isContractExpiringSoon, vendorClassificationTone } from "@/lib/grc-domain";
import { formatDate } from "@/lib/utils";
import { useLocale } from "@/providers/locale-provider";

import { useVendorRisk } from "./vendor-risk-context";

export default function VendorRiskPage() {
  const { dict } = useLocale();
  const { vendors, removeVendor } = useVendorRisk();
  const [query, setQuery] = useState("");
  const [classification, setClassification] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return vendors.filter((v) => {
      const matchesQuery =
        !q || v.id.toLowerCase().includes(q) || v.name.toLowerCase().includes(q);
      const matchesClassification = classification === "all" || v.classification === classification;
      return matchesQuery && matchesClassification;
    });
  }, [vendors, query, classification]);

  const criticalCount = vendors.filter((v) => v.classification === "critical").length;
  const expiringSoonCount = vendors.filter((v) => isContractExpiringSoon(v.contractExpiry)).length;
  const overdueAssessments = vendors.reduce(
    (acc, v) => acc + v.assessments.filter((a) => a.status === "overdue").length,
    0,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={dict.vendorRisk.title}
        subtitle={dict.vendorRisk.subtitle}
        actions={
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            {dict.vendorRisk.addVendor}
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Building2} label={dict.vendorRisk.totalVendors} value={String(vendors.length)} tone="primary" />
        <StatCard
          icon={ShieldAlert}
          label={dict.vendorRisk.criticalVendors}
          value={String(criticalCount)}
          tone="danger"
        />
        <StatCard
          icon={CalendarClock}
          label={dict.vendorRisk.contractsExpiringSoon}
          value={String(expiringSoonCount)}
          tone="warning"
        />
        <StatCard
          icon={ShieldAlert}
          label={dict.vendorRisk.overdueAssessments}
          value={String(overdueAssessments)}
          tone="danger"
        />
      </div>

      <Card className="print:hidden grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={dict.vendorRisk.searchPlaceholder}
          />
        </div>
        <div>
          <label className="text-muted mb-1.5 block text-xs font-medium">
            {dict.vendorRisk.columns.classification}
          </label>
          <Select value={classification} onChange={(e) => setClassification(e.target.value)}>
            <option value="all">{dict.common.all}</option>
            {VENDOR_CLASSIFICATION_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {dict.common[c]}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{dict.vendorRisk.columns.name}</TableHead>
            <TableHead>{dict.common.category}</TableHead>
            <TableHead>{dict.vendorRisk.columns.classification}</TableHead>
            <TableHead>{dict.vendorRisk.columns.riskRating}</TableHead>
            <TableHead>{dict.common.owner}</TableHead>
            <TableHead>{dict.vendorRisk.slaCompliance}</TableHead>
            <TableHead>{dict.vendorRisk.columns.contractExpiry}</TableHead>
            <TableHead className="text-end">{dict.common.actions}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((v) => (
            <TableRow key={v.id}>
              <TableCell className="text-foreground max-w-56 truncate font-medium">
                <Link href={`/vendor-risk/${v.id}`} className="hover:text-primary hover:underline">
                  {v.name}
                </Link>
                <p className="text-muted font-mono text-xs font-normal">{v.id}</p>
              </TableCell>
              <TableCell className="text-muted">{v.category}</TableCell>
              <TableCell>
                <Badge tone={vendorClassificationTone[v.classification]}>
                  {dict.common[v.classification]}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge tone={severityTone[v.riskRating]}>{dict.common[v.riskRating]}</Badge>
              </TableCell>
              <TableCell className="text-muted">{v.owner}</TableCell>
              <TableCell className="text-muted">{v.slaCompliance}%</TableCell>
              <TableCell
                className={isContractExpiringSoon(v.contractExpiry) ? "text-warning font-medium" : "text-muted"}
              >
                {formatDate(v.contractExpiry, dict.meta.locale)}
              </TableCell>
              <TableCell className="text-end">
                <Button variant="ghost" size="icon" onClick={() => removeVendor(v.id)}>
                  <Trash2 className="text-danger h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {filtered.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-muted py-10 text-center">
                {dict.common.noResults}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <VendorFormDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
