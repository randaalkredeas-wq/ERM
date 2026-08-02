"use client";

import { useState } from "react";

import { useControlsLibrary } from "@/app/(app)/controls-library/controls-library-context";
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
import {
  CONTROL_EFFECTIVENESS_OPTIONS,
  RISK_OWNERS,
} from "@/constants/risk-register";
import { CONTROL_FREQUENCY_OPTIONS, CONTROL_TYPE_OPTIONS, REGULATIONS } from "@/constants/grc";
import { risks } from "@/lib/mock-data/risks";
import { useLocale } from "@/providers/locale-provider";
import type { ControlEffectiveness, ControlFrequency, ControlItem, ControlTestingStatus, ControlType } from "@/types";

const TESTING_STATUS_OPTIONS: ControlTestingStatus[] = [
  "not-tested",
  "in-progress",
  "passed",
  "failed",
];

function todayPlus(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function emptyForm(): Omit<ControlItem, "id"> {
  return {
    name: "",
    description: "",
    type: "preventive",
    frequency: "quarterly",
    owner: RISK_OWNERS[0],
    linkedRisks: [],
    linkedRegulations: [],
    testingStatus: "not-tested",
    effectiveness: "partially-effective",
    lastReview: new Date().toISOString().slice(0, 10),
    nextReview: todayPlus(90),
  };
}

interface ControlFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  controlId?: string;
}

export function ControlFormDialog({ open, onOpenChange, controlId }: ControlFormDialogProps) {
  const { dict } = useLocale();
  const { getControl, createControl, updateControl } = useControlsLibrary();
  const editing = controlId ? getControl(controlId) : undefined;

  const [form, setForm] = useState<Omit<ControlItem, "id">>(
    editing ? { ...editing } : emptyForm(),
  );
  const [touched, setTouched] = useState(false);

  const isValid = form.name.trim().length > 2 && form.description.trim().length > 2;

  function patch(next: Partial<Omit<ControlItem, "id">>) {
    setForm((prev) => ({ ...prev, ...next }));
  }

  function toggleRisk(riskId: string) {
    patch({
      linkedRisks: form.linkedRisks.includes(riskId)
        ? form.linkedRisks.filter((id) => id !== riskId)
        : [...form.linkedRisks, riskId],
    });
  }

  function toggleRegulation(regulation: string) {
    patch({
      linkedRegulations: form.linkedRegulations.includes(regulation)
        ? form.linkedRegulations.filter((r) => r !== regulation)
        : [...form.linkedRegulations, regulation],
    });
  }

  function handleSubmit() {
    setTouched(true);
    if (!isValid) return;
    if (editing) {
      updateControl(editing.id, form);
    } else {
      createControl(form);
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editing ? dict.controlsLibrary.editControl : dict.controlsLibrary.addControl}
          </DialogTitle>
        </DialogHeader>

        <DialogBody className="max-h-[65vh] space-y-4">
          <div>
            <label className="text-foreground mb-1.5 block text-sm font-medium">
              {dict.controlsLibrary.columns.name}
            </label>
            <Input
              value={form.name}
              onChange={(e) => patch({ name: e.target.value })}
              placeholder={dict.controlsLibrary.namePlaceholder}
            />
            {touched && form.name.trim().length <= 2 && (
              <p className="text-danger mt-1 text-xs">{dict.common.required}</p>
            )}
          </div>

          <div>
            <label className="text-foreground mb-1.5 block text-sm font-medium">
              {dict.controlsLibrary.description}
            </label>
            <Textarea
              rows={3}
              value={form.description}
              onChange={(e) => patch({ description: e.target.value })}
              placeholder={dict.controlsLibrary.descriptionPlaceholder}
            />
            {touched && form.description.trim().length <= 2 && (
              <p className="text-danger mt-1 text-xs">{dict.common.required}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-foreground mb-1.5 block text-sm font-medium">
                {dict.controlsLibrary.columns.type}
              </label>
              <Select
                value={form.type}
                onChange={(e) => patch({ type: e.target.value as ControlType })}
              >
                {CONTROL_TYPE_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {dict.controlsLibrary.enums.type[t]}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-foreground mb-1.5 block text-sm font-medium">
                {dict.controlsLibrary.columns.frequency}
              </label>
              <Select
                value={form.frequency}
                onChange={(e) => patch({ frequency: e.target.value as ControlFrequency })}
              >
                {CONTROL_FREQUENCY_OPTIONS.map((f) => (
                  <option key={f} value={f}>
                    {dict.controlsLibrary.enums.frequency[f]}
                  </option>
                ))}
              </Select>
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
                {dict.controlsLibrary.columns.testingStatus}
              </label>
              <Select
                value={form.testingStatus}
                onChange={(e) => patch({ testingStatus: e.target.value as ControlTestingStatus })}
              >
                {TESTING_STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {dict.controlsLibrary.enums.testingStatus[s]}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-foreground mb-1.5 block text-sm font-medium">
                {dict.controlsLibrary.columns.effectiveness}
              </label>
              <Select
                value={form.effectiveness}
                onChange={(e) => patch({ effectiveness: e.target.value as ControlEffectiveness })}
              >
                {CONTROL_EFFECTIVENESS_OPTIONS.map((eff) => (
                  <option key={eff} value={eff}>
                    {dict.riskRegister.enums.controlEffectiveness[eff]}
                  </option>
                ))}
              </Select>
            </div>
            <div />
            <div>
              <label className="text-foreground mb-1.5 block text-sm font-medium">
                {dict.controlsLibrary.columns.lastReview}
              </label>
              <Input
                type="date"
                value={form.lastReview}
                onChange={(e) => patch({ lastReview: e.target.value })}
              />
            </div>
            <div>
              <label className="text-foreground mb-1.5 block text-sm font-medium">
                {dict.controlsLibrary.columns.nextReview}
              </label>
              <Input
                type="date"
                value={form.nextReview}
                onChange={(e) => patch({ nextReview: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="text-foreground mb-1.5 block text-sm font-medium">
              {dict.controlsLibrary.columns.linkedRisks}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {risks.slice(0, 12).map((r) => (
                <button key={r.id} type="button" onClick={() => toggleRisk(r.id)}>
                  <Badge tone={form.linkedRisks.includes(r.id) ? "primary" : "neutral"}>
                    {r.id}
                  </Badge>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-foreground mb-1.5 block text-sm font-medium">
              {dict.controlsLibrary.columns.linkedRegulations}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {REGULATIONS.map((reg) => (
                <button key={reg} type="button" onClick={() => toggleRegulation(reg)}>
                  <Badge tone={form.linkedRegulations.includes(reg) ? "primary" : "neutral"}>
                    {reg}
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
          <Button onClick={handleSubmit}>
            {editing ? dict.common.save : dict.controlsLibrary.addControl}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
