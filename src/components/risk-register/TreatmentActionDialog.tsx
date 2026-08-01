"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { RISK_OWNERS } from "@/constants/risk-register";
import { useLocale } from "@/providers/locale-provider";
import type { TreatmentAction, TreatmentActionStatus } from "@/types";

const statuses: TreatmentActionStatus[] = [
  "not-started",
  "in-progress",
  "completed",
];

function emptyForm(): Omit<TreatmentAction, "id"> {
  return {
    title: "",
    owner: RISK_OWNERS[0],
    dueDate: new Date().toISOString().slice(0, 10),
    status: "not-started",
    progress: 0,
  };
}

interface TreatmentActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action?: TreatmentAction;
  onSubmit: (input: Omit<TreatmentAction, "id">) => void;
}

export function TreatmentActionDialog({
  open,
  onOpenChange,
  action,
  onSubmit,
}: TreatmentActionDialogProps) {
  const { dict } = useLocale();
  const isEdit = Boolean(action);
  const [form, setForm] = useState<Omit<TreatmentAction, "id">>(
    () => action ?? emptyForm(),
  );
  const [touched, setTouched] = useState(false);

  const isValid = form.title.trim().length > 2 && form.owner && form.dueDate;

  function handleSubmit() {
    setTouched(true);
    if (!isValid) return;
    onSubmit(form);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit
              ? dict.riskDetail.treatment.editAction
              : dict.riskDetail.treatment.addAction}
          </DialogTitle>
        </DialogHeader>

        <DialogBody className="space-y-4">
          <div>
            <label className="text-foreground mb-1.5 block text-sm font-medium">
              {dict.riskDetail.treatment.columns.title}
            </label>
            <Input
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              placeholder={dict.riskDetail.treatment.titlePlaceholder}
            />
            {touched && form.title.trim().length <= 2 && (
              <p className="text-danger mt-1 text-xs">{dict.common.required}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-foreground mb-1.5 block text-sm font-medium">
                {dict.riskDetail.treatment.columns.owner}
              </label>
              <Select
                value={form.owner}
                onChange={(e) =>
                  setForm((f) => ({ ...f, owner: e.target.value }))
                }
              >
                {RISK_OWNERS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-foreground mb-1.5 block text-sm font-medium">
                {dict.riskDetail.treatment.columns.dueDate}
              </label>
              <Input
                type="date"
                value={form.dueDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, dueDate: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="text-foreground mb-1.5 block text-sm font-medium">
                {dict.riskDetail.treatment.columns.status}
              </label>
              <Select
                value={form.status}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    status: e.target.value as TreatmentActionStatus,
                    progress:
                      e.target.value === "completed" ? 100 : f.progress,
                  }))
                }
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {dict.riskRegister.enums.treatmentActionStatus[s]}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-foreground mb-1.5 block text-sm font-medium">
                {dict.riskDetail.treatment.columns.progress}
              </label>
              <Input
                type="number"
                min={0}
                max={100}
                step={5}
                value={form.progress}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    progress: Math.min(100, Math.max(0, Number(e.target.value))),
                  }))
                }
              />
            </div>
          </div>
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {dict.common.cancel}
          </Button>
          <Button onClick={handleSubmit}>{dict.common.save}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
