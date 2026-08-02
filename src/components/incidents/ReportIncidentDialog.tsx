"use client";

import { useState } from "react";

import { useIncidents, type IncidentInput } from "@/app/(app)/incidents/incidents-context";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Switch } from "@/components/ui/Switch";
import { Textarea } from "@/components/ui/Textarea";
import { DEPARTMENTS, RISK_OWNERS } from "@/constants/risk-register";
import { INCIDENT_CATEGORIES, INCIDENT_IMPACT_LEVELS } from "@/constants/grc";
import { useLocale } from "@/providers/locale-provider";
import type { IncidentSeverityImpact, Severity } from "@/types";

function emptyForm(): IncidentInput {
  return {
    title: "",
    category: INCIDENT_CATEGORIES[0],
    department: DEPARTMENTS[0],
    severity: "medium",
    reportedBy: RISK_OWNERS[0],
    rootCause: "",
    impactDescription: "",
    impactLevel: "low",
    financialLoss: 0,
    regulatoryImpact: false,
    regulatoryImpactNotes: "",
    assignedOwner: RISK_OWNERS[1],
  };
}

interface ReportIncidentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReportIncidentDialog({ open, onOpenChange }: ReportIncidentDialogProps) {
  const { dict } = useLocale();
  const { createIncident } = useIncidents();
  const [form, setForm] = useState<IncidentInput>(emptyForm());
  const [touched, setTouched] = useState(false);

  const isValid = form.title.trim().length > 2 && form.rootCause.trim().length > 2;

  function patch(next: Partial<IncidentInput>) {
    setForm((prev) => ({ ...prev, ...next }));
  }

  function handleSubmit() {
    setTouched(true);
    if (!isValid) return;
    createIncident(form);
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
          <DialogTitle>{dict.incidents.reportIncident}</DialogTitle>
        </DialogHeader>

        <DialogBody className="max-h-[65vh] space-y-4">
          <div>
            <label className="text-foreground mb-1.5 block text-sm font-medium">
              {dict.incidents.columns.title}
            </label>
            <Input
              value={form.title}
              onChange={(e) => patch({ title: e.target.value })}
              placeholder={dict.incidents.titlePlaceholder}
            />
            {touched && form.title.trim().length <= 2 && (
              <p className="text-danger mt-1 text-xs">{dict.common.required}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-foreground mb-1.5 block text-sm font-medium">
                {dict.incidents.columns.category}
              </label>
              <Select value={form.category} onChange={(e) => patch({ category: e.target.value })}>
                {INCIDENT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-foreground mb-1.5 block text-sm font-medium">
                {dict.incidents.department}
              </label>
              <Select value={form.department} onChange={(e) => patch({ department: e.target.value })}>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-foreground mb-1.5 block text-sm font-medium">
                {dict.incidents.columns.severity}
              </label>
              <Select
                value={form.severity}
                onChange={(e) => patch({ severity: e.target.value as Severity })}
              >
                {(["low", "medium", "high", "critical"] as Severity[]).map((s) => (
                  <option key={s} value={s}>
                    {dict.common[s]}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-foreground mb-1.5 block text-sm font-medium">
                {dict.incidents.impactLevel}
              </label>
              <Select
                value={form.impactLevel}
                onChange={(e) => patch({ impactLevel: e.target.value as IncidentSeverityImpact })}
              >
                {INCIDENT_IMPACT_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {dict.incidents.enums.impactLevel[level]}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-foreground mb-1.5 block text-sm font-medium">
                {dict.incidents.columns.reportedBy}
              </label>
              <Select value={form.reportedBy} onChange={(e) => patch({ reportedBy: e.target.value })}>
                {RISK_OWNERS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-foreground mb-1.5 block text-sm font-medium">
                {dict.incidents.assignedOwner}
              </label>
              <Select value={form.assignedOwner} onChange={(e) => patch({ assignedOwner: e.target.value })}>
                {RISK_OWNERS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-foreground mb-1.5 block text-sm font-medium">
                {dict.incidents.financialLoss}
              </label>
              <Input
                type="number"
                min={0}
                value={form.financialLoss}
                onChange={(e) => patch({ financialLoss: Number(e.target.value) })}
              />
            </div>
            <div className="flex items-center justify-between gap-3 pt-6">
              <label className="text-foreground text-sm font-medium">
                {dict.incidents.regulatoryImpact}
              </label>
              <Switch
                checked={form.regulatoryImpact}
                onCheckedChange={(checked) => patch({ regulatoryImpact: checked })}
              />
            </div>
          </div>

          {form.regulatoryImpact && (
            <div>
              <label className="text-foreground mb-1.5 block text-sm font-medium">
                {dict.incidents.regulatoryImpactNotes}
              </label>
              <Textarea
                rows={2}
                value={form.regulatoryImpactNotes}
                onChange={(e) => patch({ regulatoryImpactNotes: e.target.value })}
                placeholder={dict.incidents.regulatoryImpactNotesPlaceholder}
              />
            </div>
          )}

          <div>
            <label className="text-foreground mb-1.5 block text-sm font-medium">
              {dict.incidents.rootCause}
            </label>
            <Textarea
              rows={2}
              value={form.rootCause}
              onChange={(e) => patch({ rootCause: e.target.value })}
              placeholder={dict.incidents.rootCausePlaceholder}
            />
            {touched && form.rootCause.trim().length <= 2 && (
              <p className="text-danger mt-1 text-xs">{dict.common.required}</p>
            )}
          </div>

          <div>
            <label className="text-foreground mb-1.5 block text-sm font-medium">
              {dict.incidents.impactDescription}
            </label>
            <Textarea
              rows={2}
              value={form.impactDescription}
              onChange={(e) => patch({ impactDescription: e.target.value })}
              placeholder={dict.incidents.impactDescriptionPlaceholder}
            />
          </div>
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {dict.common.cancel}
          </Button>
          <Button onClick={handleSubmit}>{dict.incidents.reportIncident}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
