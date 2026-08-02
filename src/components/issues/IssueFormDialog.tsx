"use client";

import { useState } from "react";

import { useIssues, type IssueInput } from "@/app/(app)/issues/issues-context";
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
import { ISSUE_SOURCE_OPTIONS } from "@/constants/grc";
import { incidentRecords } from "@/lib/mock-data/incidents";
import { risks } from "@/lib/mock-data/risks";
import { useLocale } from "@/providers/locale-provider";
import type { IssuePriority, IssueSource } from "@/types";

function emptyForm(): IssueInput {
  return {
    title: "",
    description: "",
    source: "self-identified",
    relatedRiskId: null,
    relatedIncidentId: null,
    priority: "medium",
    owner: RISK_OWNERS[0],
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  };
}

interface IssueFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function IssueFormDialog({ open, onOpenChange }: IssueFormDialogProps) {
  const { dict } = useLocale();
  const { createIssue } = useIssues();
  const [form, setForm] = useState<IssueInput>(emptyForm());
  const [touched, setTouched] = useState(false);

  const isValid = form.title.trim().length > 2 && form.description.trim().length > 2;

  function patch(next: Partial<IssueInput>) {
    setForm((prev) => ({ ...prev, ...next }));
  }

  function handleSubmit() {
    setTouched(true);
    if (!isValid) return;
    createIssue(form);
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
          <DialogTitle>{dict.issues.logIssue}</DialogTitle>
        </DialogHeader>

        <DialogBody className="max-h-[65vh] space-y-4">
          <div>
            <label className="text-foreground mb-1.5 block text-sm font-medium">
              {dict.issues.columns.title}
            </label>
            <Input
              value={form.title}
              onChange={(e) => patch({ title: e.target.value })}
              placeholder={dict.issues.titlePlaceholder}
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
              rows={3}
              value={form.description}
              onChange={(e) => patch({ description: e.target.value })}
              placeholder={dict.issues.descriptionPlaceholder}
            />
            {touched && form.description.trim().length <= 2 && (
              <p className="text-danger mt-1 text-xs">{dict.common.required}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-foreground mb-1.5 block text-sm font-medium">
                {dict.issues.columns.source}
              </label>
              <Select
                value={form.source}
                onChange={(e) => patch({ source: e.target.value as IssueSource })}
              >
                {ISSUE_SOURCE_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {dict.issues.enums.source[s]}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-foreground mb-1.5 block text-sm font-medium">
                {dict.common.priority}
              </label>
              <Select
                value={form.priority}
                onChange={(e) => patch({ priority: e.target.value as IssuePriority })}
              >
                {(["low", "medium", "high", "critical"] as IssuePriority[]).map((p) => (
                  <option key={p} value={p}>
                    {dict.common[p]}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-foreground mb-1.5 block text-sm font-medium">
                {dict.issues.columns.relatedRisk}
              </label>
              <Select
                value={form.relatedRiskId ?? ""}
                onChange={(e) => patch({ relatedRiskId: e.target.value || null })}
              >
                <option value="">{dict.common.all}</option>
                {risks.slice(0, 12).map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.id} — {r.title}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-foreground mb-1.5 block text-sm font-medium">
                {dict.issues.columns.relatedIncident}
              </label>
              <Select
                value={form.relatedIncidentId ?? ""}
                onChange={(e) => patch({ relatedIncidentId: e.target.value || null })}
              >
                <option value="">{dict.common.all}</option>
                {incidentRecords.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.id} — {i.title}
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
                {dict.issues.columns.dueDate}
              </label>
              <Input
                type="date"
                value={form.dueDate}
                onChange={(e) => patch({ dueDate: e.target.value })}
              />
            </div>
          </div>
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {dict.common.cancel}
          </Button>
          <Button onClick={handleSubmit}>{dict.issues.logIssue}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
