"use client";

import { useState } from "react";

import { useVendorRisk, type VendorInput } from "@/app/(app)/vendor-risk/vendor-risk-context";
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
import { VENDOR_CATEGORIES, VENDOR_CLASSIFICATION_OPTIONS } from "@/constants/grc";
import { useRouter } from "next/navigation";
import { useLocale } from "@/providers/locale-provider";
import type { Severity, VendorClassification } from "@/types";

function emptyForm(): VendorInput {
  const start = new Date().toISOString().slice(0, 10);
  const expiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  return {
    name: "",
    category: VENDOR_CATEGORIES[0],
    classification: "medium",
    riskRating: "medium",
    owner: RISK_OWNERS[0],
    contractStart: start,
    contractExpiry: expiry,
    slaCompliance: 100,
    lastDueDiligence: start,
    nextDueDiligence: expiry,
  };
}

interface VendorFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VendorFormDialog({ open, onOpenChange }: VendorFormDialogProps) {
  const { dict } = useLocale();
  const { createVendor } = useVendorRisk();
  const router = useRouter();
  const [form, setForm] = useState<VendorInput>(emptyForm());
  const [touched, setTouched] = useState(false);

  const isValid = form.name.trim().length > 2;

  function patch(next: Partial<VendorInput>) {
    setForm((prev) => ({ ...prev, ...next }));
  }

  function handleSubmit() {
    setTouched(true);
    if (!isValid) return;
    const created = createVendor(form);
    setForm(emptyForm());
    setTouched(false);
    onOpenChange(false);
    router.push(`/vendor-risk/${created.id}`);
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
          <DialogTitle>{dict.vendorRisk.addVendor}</DialogTitle>
        </DialogHeader>

        <DialogBody className="max-h-[65vh] space-y-4">
          <div>
            <label className="text-foreground mb-1.5 block text-sm font-medium">
              {dict.vendorRisk.columns.name}
            </label>
            <Input
              value={form.name}
              onChange={(e) => patch({ name: e.target.value })}
              placeholder={dict.vendorRisk.namePlaceholder}
            />
            {touched && form.name.trim().length <= 2 && (
              <p className="text-danger mt-1 text-xs">{dict.common.required}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-foreground mb-1.5 block text-sm font-medium">
                {dict.common.category}
              </label>
              <Select value={form.category} onChange={(e) => patch({ category: e.target.value })}>
                {VENDOR_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-foreground mb-1.5 block text-sm font-medium">
                {dict.vendorRisk.columns.classification}
              </label>
              <Select
                value={form.classification}
                onChange={(e) => patch({ classification: e.target.value as VendorClassification })}
              >
                {VENDOR_CLASSIFICATION_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {dict.common[c]}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-foreground mb-1.5 block text-sm font-medium">
                {dict.vendorRisk.columns.riskRating}
              </label>
              <Select
                value={form.riskRating}
                onChange={(e) => patch({ riskRating: e.target.value as Severity })}
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
                {dict.vendorRisk.columns.contractExpiry}
              </label>
              <Input
                type="date"
                value={form.contractExpiry}
                onChange={(e) => patch({ contractExpiry: e.target.value })}
              />
            </div>
            <div>
              <label className="text-foreground mb-1.5 block text-sm font-medium">
                {dict.vendorRisk.slaCompliance}
              </label>
              <Input
                type="number"
                min={0}
                max={100}
                step={0.1}
                value={form.slaCompliance}
                onChange={(e) => patch({ slaCompliance: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="text-foreground mb-1.5 block text-sm font-medium">
                {dict.vendorRisk.lastDueDiligence}
              </label>
              <Input
                type="date"
                value={form.lastDueDiligence}
                onChange={(e) => patch({ lastDueDiligence: e.target.value })}
              />
            </div>
            <div>
              <label className="text-foreground mb-1.5 block text-sm font-medium">
                {dict.vendorRisk.nextDueDiligence}
              </label>
              <Input
                type="date"
                value={form.nextDueDiligence}
                onChange={(e) => patch({ nextDueDiligence: e.target.value })}
              />
            </div>
          </div>
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {dict.common.cancel}
          </Button>
          <Button onClick={handleSubmit}>{dict.vendorRisk.addVendor}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
