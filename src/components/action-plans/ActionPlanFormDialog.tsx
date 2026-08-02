"use client";

import { useState } from "react";

import { useActionPlans, type ActionPlanInput } from "@/app/(app)/action-plans/action-plans-context";
import { Badge } from "@/components/ui/Badge";
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
import { Textarea } from "@/components/ui/Textarea";
import { RISK_OWNERS } from "@/constants/risk-register";
import { useLocale } from "@/providers/locale-provider";
import type { ActionSourceModule } from "@/types";

const SOURCE_MODULES: ActionSourceModule[] = [
  "risk-register",
  "rcsa",
  "incident",
  "issue",
  "vendor",
  "bcm",
  "compliance",
];

function emptyForm(): ActionPlanInput {
  return {
    title: "",
    description: "",
    sourceModule: "risk-register",
    sourceRef: "",
    owner: RISK_OWNERS[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    dependencies: [],
  };
}

interface ActionPlanFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ActionPlanFormDialog({ open, onOpenChange }: ActionPlanFormDialogProps) {
  const { dict } = useLocale();
  const { actions, createAction } = useActionPlans();
  const [form, setForm] = useState<ActionPlanInput>(emptyForm());
  const [touched, setTouched] = useState(false);

  const isValid = form.title.trim().length > 2 && form.sourceRef.trim().length > 1;

  function patch(next: Partial<ActionPlanInput>) {
    setForm((prev) => ({ ...prev, ...next }));
  }

  function toggleDependency(id: string, title: string) {
    const exists = form.dependencies.some((d) => d.actionId === id);
    patch({
      dependencies: exists
        ? form.dependencies.filter((d) => d.actionId !== id)
        : [...form.dependencies, { actionId: id, title }],
    });
  }

  function handleSubmit() {
    setTouched(true);
    if (!isValid) return;
    createAction(form);
    setForm(emptyForm());
    setTouched(false);
    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setForm(emptyForm());
          setTouched(false);
        }
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{dict.actionPlans.addAction}</DialogTitle>
        </DialogHeader>

        <DialogBody className="max-h-[65vh] space-y-4">
          <div>
            <label className="text-foreground mb-1.5 block text-sm font-medium">
              {dict.actionPlans.columns.title}
            </label>
            <Input
              value={form.title}
              onChange={(e) => patch({ title: e.target.value })}
              placeholder={dict.actionPlans.titlePlaceholder}
            />
            {touched && form.title.trim().length <= 2 && (
              <p className="text-danger mt-1 text-xs">{dict.common.required}</p>
            )}
          </div>

          <div>
            <label className="text-foreground mb-1.5 block text-sm font-medium">
              {dict.controlsLibrary.description}
            </label>
            <Textarea
              rows={2}
              value={form.description}
              onChange={(e) => patch({ description: e.target.value })}
              placeholder={dict.actionPlans.descriptionPlaceholder}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-foreground mb-1.5 block text-sm font-medium">
                {dict.actionPlans.columns.source}
              </label>
              <Select
                value={form.sourceModule}
                onChange={(e) => patch({ sourceModule: e.target.value as ActionSourceModule })}
              >
                {SOURCE_MODULES.map((m) => (
                  <option key={m} value={m}>
                    {dict.actionPlans.enums.sourceModule[m]}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-foreground mb-1.5 block text-sm font-medium">
                {dict.actionPlans.sourceRef}
              </label>
              <Input
                value={form.sourceRef}
                onChange={(e) => patch({ sourceRef: e.target.value })}
                placeholder={dict.actionPlans.sourceRefPlaceholder}
              />
              {touched && form.sourceRef.trim().length <= 1 && (
                <p className="text-danger mt-1 text-xs">{dict.common.required}</p>
              )}
            </div>
            <div>
              <label className="text-foreground mb-1.5 block text-sm font-medium">
                {dict.common.owner}
              </label>
              <Select value={form.owner} onChange={(e) => patch({ owner: e.target.value })}>
                {RISK_OWNERS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-foreground mb-1.5 block text-sm font-medium">
                {dict.actionPlans.columns.dueDate}
              </label>
              <Input
                type="date"
                value={form.dueDate}
                onChange={(e) => patch({ dueDate: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="text-foreground mb-1.5 block text-sm font-medium">
              {dict.actionPlans.columns.dependencies}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {actions.slice(0, 12).map((a) => (
                <button key={a.id} type="button" onClick={() => toggleDependency(a.id, a.title)}>
                  <Badge tone={form.dependencies.some((d) => d.actionId === a.id) ? "primary" : "neutral"}>
                    {a.id}
                  </Badge>
                </button>
              ))}
            </div>
          </div>
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {dict.common.cancel}
          </Button>
          <Button onClick={handleSubmit}>{dict.actionPlans.addAction}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
