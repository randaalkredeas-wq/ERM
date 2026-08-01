"use client";

import { Check, X } from "lucide-react";
import { useState } from "react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { approvals as initialApprovals } from "@/lib/mock-data/approvals";
import { formatDate } from "@/lib/utils";
import { useLocale } from "@/providers/locale-provider";
import type { ApprovalItem, ApprovalStatus } from "@/types";

const priorityTone = {
  low: "neutral",
  medium: "warning",
  high: "danger",
} as const;

export default function ApprovalsPage() {
  const { dict } = useLocale();
  const [approvals, setApprovals] = useState<ApprovalItem[]>(initialApprovals);

  const updateStatus = (id: string, status: ApprovalStatus) => {
    setApprovals((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a)),
    );
  };

  const renderTable = (items: ApprovalItem[], showActions: boolean) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{dict.riskRegister.columns.title}</TableHead>
          <TableHead>{dict.approvals.requestType}</TableHead>
          <TableHead>{dict.approvals.requestedBy}</TableHead>
          <TableHead>{dict.approvals.dueDate}</TableHead>
          <TableHead>{dict.approvals.priority}</TableHead>
          {showActions && <TableHead>{dict.common.actions}</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((approval) => (
          <TableRow key={approval.id}>
            <TableCell className="text-foreground max-w-72 truncate font-medium">
              {approval.title}
            </TableCell>
            <TableCell className="text-muted">{approval.type}</TableCell>
            <TableCell className="text-muted">{approval.requestedBy}</TableCell>
            <TableCell className="text-muted">
              {formatDate(approval.dueDate, dict.meta.locale)}
            </TableCell>
            <TableCell>
              <Badge tone={priorityTone[approval.priority]}>
                {dict.common[approval.priority]}
              </Badge>
            </TableCell>
            {showActions && (
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="success"
                    onClick={() => updateStatus(approval.id, "approved")}
                  >
                    <Check className="h-3.5 w-3.5" />
                    {dict.common.approve}
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => updateStatus(approval.id, "rejected")}
                  >
                    <X className="h-3.5 w-3.5" />
                    {dict.common.reject}
                  </Button>
                </div>
              </TableCell>
            )}
          </TableRow>
        ))}
        {items.length === 0 && (
          <TableRow>
            <TableCell
              colSpan={showActions ? 6 : 5}
              className="text-muted py-10 text-center"
            >
              {dict.common.noResults}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  const pending = approvals.filter((a) => a.status === "pending");
  const approved = approvals.filter((a) => a.status === "approved");
  const rejected = approvals.filter((a) => a.status === "rejected");

  return (
    <div className="space-y-6">
      <PageHeader
        title={dict.approvals.title}
        subtitle={dict.approvals.subtitle}
      />

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            {dict.approvals.pending} ({pending.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            {dict.approvals.approved} ({approved.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            {dict.approvals.rejected} ({rejected.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="pending">{renderTable(pending, true)}</TabsContent>
        <TabsContent value="approved">
          {renderTable(approved, false)}
        </TabsContent>
        <TabsContent value="rejected">
          {renderTable(rejected, false)}
        </TabsContent>
      </Tabs>
    </div>
  );
}
