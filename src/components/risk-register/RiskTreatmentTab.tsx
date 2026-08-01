"use client";

import { ClipboardList, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { useRiskRegister } from "@/app/(app)/risk-register/risk-register-context";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Progress } from "@/components/ui/Progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { isTreatmentActionOverdue, treatmentActionStatusTone } from "@/lib/domain";
import { cn, formatDate } from "@/lib/utils";
import { useLocale } from "@/providers/locale-provider";
import type { RiskItem, TreatmentAction } from "@/types";

import { TreatmentActionDialog } from "./TreatmentActionDialog";

export function RiskTreatmentTab({ risk }: { risk: RiskItem }) {
  const { dict } = useLocale();
  const { addTreatmentAction, updateTreatmentAction, deleteTreatmentAction } =
    useRiskRegister();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<TreatmentAction | undefined>();

  function openCreate() {
    setEditing(undefined);
    setDialogOpen(true);
  }

  function openEdit(action: TreatmentAction) {
    setEditing(action);
    setDialogOpen(true);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-foreground text-sm font-semibold">
          {dict.riskDetail.treatment.title}
        </h3>
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          {dict.riskDetail.treatment.addAction}
        </Button>
      </div>

      {risk.treatmentPlans.length === 0 ? (
        <Card>
          <EmptyState
            icon={ClipboardList}
            title={dict.riskDetail.treatment.empty}
            description={dict.riskDetail.treatment.emptyHint}
            action={
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4" />
                {dict.riskDetail.treatment.addAction}
              </Button>
            }
          />
        </Card>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{dict.riskDetail.treatment.columns.title}</TableHead>
              <TableHead>{dict.riskDetail.treatment.columns.owner}</TableHead>
              <TableHead>{dict.riskDetail.treatment.columns.dueDate}</TableHead>
              <TableHead>{dict.riskDetail.treatment.columns.status}</TableHead>
              <TableHead>{dict.riskDetail.treatment.columns.progress}</TableHead>
              <TableHead className="text-end">{dict.common.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {risk.treatmentPlans.map((action) => {
              const overdue = isTreatmentActionOverdue(action);
              return (
                <TableRow key={action.id}>
                  <TableCell className="text-foreground max-w-56 truncate font-medium">
                    {action.title}
                  </TableCell>
                  <TableCell className="text-muted">{action.owner}</TableCell>
                  <TableCell
                    className={cn("text-muted", overdue && "text-danger font-medium")}
                  >
                    {formatDate(action.dueDate, dict.meta.locale)}
                    {overdue && ` · ${dict.riskDetail.treatment.overdue}`}
                  </TableCell>
                  <TableCell>
                    <Badge tone={treatmentActionStatusTone[action.status]}>
                      {dict.riskRegister.enums.treatmentActionStatus[action.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="min-w-32">
                    <div className="flex items-center gap-2">
                      <Progress value={action.progress} className="w-20" />
                      <span className="text-muted text-xs" dir="ltr">
                        {action.progress}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-end">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(action)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-danger"
                        onClick={() =>
                          void deleteTreatmentAction(risk.id, action.id).catch(
                            console.error,
                          )
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      <TreatmentActionDialog
        key={editing?.id ?? "new"}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        action={editing}
        onSubmit={(input) => {
          const result = editing
            ? updateTreatmentAction(risk.id, editing.id, input)
            : addTreatmentAction(risk.id, input);
          void result.catch(console.error);
        }}
      />
    </div>
  );
}
