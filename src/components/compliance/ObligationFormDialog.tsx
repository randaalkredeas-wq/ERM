"use client";

import { useState } from "react";

import { useCompliance, type ObligationInput } from "@/app/(app)/compliance/compliance-context";
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
import { COMPLIANCE_JURISDICTIONS } from "@/constants/grc";
import { RISK_OWNERS } from "@/constants/risk-register";
import { useLocale } from "@/providers/locale-provider";
import type { ComplianceStatus, ObligationType } from "@/types";

function emptyForm(): ObligationInput {
  const start = new Date().toISOString().slice(0, 10);
  const next = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  return {
    title: "",
    type: "regulation",
    jurisdiction: COMPLIANCE_JURISDICTIONS[0],
    owner: RISK_OWNERS[0],
    status: "not-assessed",
    lastReview: start,
    nextReview: next,
  };
}

interface ObligationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ObligationFormDialog({ open, onOpenChange }: ObligationFormDialogProps) {
  const { dict } = useLocale();
  const { createObligation } = useCompliance();
  const [form, setForm] = useState<ObligationInput>(emptyForm());
  const [touched, setTouched] = useState(false);

  const isValid = form.title.trim().length > 2;

  function patch(next: Partial<ObligationInput>) {
    setForm((prev) => ({ ...prev, ...next }));
  }

  function handleSubmit() {
    setTouched(true);
    if (!isValid) return;
    createObligation(form);
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
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{dict.compliance.addObligation}</DialogTitle>
        </DialogHeader>

        <DialogBody className="space-y-4">
          <div>
            <label className="text-foreground mb-1.5 block text-sm font-medium">
              {dict.compliance.columns.title}
            </label>
            <Input
              value={form.title}
              onChange={(e) => patch({ title: e.target.value })}
              placeholder={dict.compliance.titlePlaceholder}
            />
            {touched && form.title.trim().length <= 2 && (
              <p className="text-danger mt-1 text-xs">{dict.common.required}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-foreground mb-1.5 block text-sm font-medium">
                {dict.compliance.columns.type}
              </label>
              <Select value={form.type} onChange={(e) => patch({ type: e.target.value as ObligationType })}>
                <option value="regulation">{dict.compliance.enums.type.regulation}</option>
                <option value="policy">{dict.compliance.enums.type.policy}</option>
                <option value="procedure">{dict.compliance.enums.type.procedure}</option>
              </Select>
            </div>
            <div>
              <label className="text-foreground mb-1.5 block text-sm font-medium">
                {dict.compliance.columns.jurisdiction}
              </label>
              <Select value={form.jurisdiction} onChange={(e) => patch({ jurisdiction: e.target.value })}>
                {COMPLIANCE_JURISDICTIONS.map((j) => (
                  <option key={j} value={j}>
                    {j}
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
                {dict.common.status}
              </label>
              <Select value={form.status} onChange={(e) => patch({ status: e.target.value as ComplianceStatus })}>
                <option value="compliant">{dict.compliance.enums.status.compliant}</option>
                <option value="partially-compliant">{dict.compliance.enums.status["partially-compliant"]}</option>
                <option value="non-compliant">{dict.compliance.enums.status["non-compliant"]}</option>
                <option value="not-assessed">{dict.compliance.enums.status["not-assessed"]}</option>
              </Select>
            </div>
            <div>
              <label className="text-foreground mb-1.5 block text-sm font-medium">
                {dict.compliance.columns.lastReview}
              </label>
              <Input type="date" value={form.lastReview} onChange={(e) => patch({ lastReview: e.target.value })} />
            </div>
            <div>
              <label className="text-foreground mb-1.5 block text-sm font-medium">
                {dict.compliance.columns.nextReview}
              </label>
              <Input type="date" value={form.nextReview} onChange={(e) => patch({ nextReview: e.target.value })} />
            </div>
          </div>
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {dict.common.cancel}
          </Button>
          <Button onClick={handleSubmit}>{dict.compliance.addObligation}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
