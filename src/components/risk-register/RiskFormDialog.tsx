"use client";

import { useMemo, useState } from "react";

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
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Input } from "@/components/ui/Input";
import {
  CATEGORY_SUBCATEGORIES,
  DEPARTMENTS,
  RISK_CATEGORIES,
  RISK_OWNERS,
} from "@/constants/risk-register";
import { severityFromScore, severityTone } from "@/lib/domain";
import { useLocale } from "@/providers/locale-provider";
import type { RiskFormInput, RiskItem, RiskStatus, Severity } from "@/types";
import { useRiskRegister } from "@/app/(app)/risk-register/risk-register-context";

const severities: Severity[] = ["low", "medium", "high", "critical"];
const editableStatuses = ["open", "mitigating", "closed"] as const;
const levels = [1, 2, 3, 4, 5];

function emptyForm(): RiskFormInput {
  return {
    title: "",
    department: DEPARTMENTS[0],
    category: RISK_CATEGORIES[0],
    subcategory: CATEGORY_SUBCATEGORIES[RISK_CATEGORIES[0]][0],
    rootCause: "",
    existingControls: "",
    inherentRisk: "medium",
    owner: RISK_OWNERS[0],
    likelihood: 3,
    impact: 3,
    status: "open",
    dueDate: new Date().toISOString().slice(0, 10),
  };
}

function toFormInput(risk: RiskItem): RiskFormInput {
  return {
    title: risk.title,
    department: risk.department,
    category: risk.category,
    subcategory: risk.subcategory,
    rootCause: risk.rootCause,
    existingControls: risk.existingControls,
    inherentRisk: risk.inherentRisk,
    owner: risk.owner,
    likelihood: risk.likelihood,
    impact: risk.impact,
    status: risk.status === "pending-approval" ? "mitigating" : risk.status,
    dueDate: risk.dueDate,
  };
}

interface RiskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  risk?: RiskItem;
  onSaved?: (risk: RiskItem) => void;
}

export function RiskFormDialog({
  open,
  onOpenChange,
  risk,
  onSaved,
}: RiskFormDialogProps) {
  const { dict } = useLocale();
  const { createRisk, updateRisk, getRisk } = useRiskRegister();
  const isEdit = Boolean(risk);

  const [form, setForm] = useState<RiskFormInput>(() =>
    risk ? toFormInput(risk) : emptyForm(),
  );
  const [touched, setTouched] = useState(false);

  const subcategoryOptions = CATEGORY_SUBCATEGORIES[form.category] ?? [];

  const residualScore = form.likelihood * form.impact;
  const residualSeverity = severityFromScore(residualScore);

  const isValid = useMemo(
    () =>
      form.title.trim().length > 2 &&
      form.department &&
      form.category &&
      form.owner &&
      form.dueDate,
    [form],
  );

  function handleSubmit() {
    setTouched(true);
    if (!isValid) return;
    if (isEdit && risk) {
      updateRisk(risk.id, form);
      onSaved?.(getRisk(risk.id) ?? risk);
    } else {
      const created = createRisk(form);
      onSaved?.(created);
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit
              ? dict.riskRegister.form.editTitle
              : dict.riskRegister.form.createTitle}
          </DialogTitle>
          <p className="text-muted text-sm">
            {isEdit
              ? dict.riskRegister.form.editSubtitle
              : dict.riskRegister.form.createSubtitle}
          </p>
        </DialogHeader>

        <DialogBody className="max-h-[60vh] space-y-4">
          <div>
            <label className="text-foreground mb-1.5 block text-sm font-medium">
              {dict.riskRegister.form.title}
            </label>
            <Input
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              placeholder={dict.riskRegister.form.titlePlaceholder}
            />
            {touched && form.title.trim().length <= 2 && (
              <p className="text-danger mt-1 text-xs">{dict.common.required}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-foreground mb-1.5 block text-sm font-medium">
                {dict.riskRegister.form.department}
              </label>
              <Select
                value={form.department}
                onChange={(e) =>
                  setForm((f) => ({ ...f, department: e.target.value }))
                }
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-foreground mb-1.5 block text-sm font-medium">
                {dict.riskRegister.form.owner}
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
                {dict.riskRegister.form.category}
              </label>
              <Select
                value={form.category}
                onChange={(e) => {
                  const category = e.target.value;
                  const options = CATEGORY_SUBCATEGORIES[category] ?? [];
                  setForm((f) => ({
                    ...f,
                    category,
                    subcategory: options[0] ?? "",
                  }));
                }}
              >
                {RISK_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-foreground mb-1.5 block text-sm font-medium">
                {dict.riskRegister.form.subcategory}
              </label>
              <Select
                value={form.subcategory}
                onChange={(e) =>
                  setForm((f) => ({ ...f, subcategory: e.target.value }))
                }
              >
                {subcategoryOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div>
            <label className="text-foreground mb-1.5 block text-sm font-medium">
              {dict.riskRegister.form.rootCause}
            </label>
            <Textarea
              rows={2}
              value={form.rootCause}
              onChange={(e) =>
                setForm((f) => ({ ...f, rootCause: e.target.value }))
              }
              placeholder={dict.riskRegister.form.rootCausePlaceholder}
            />
          </div>

          <div>
            <label className="text-foreground mb-1.5 block text-sm font-medium">
              {dict.riskRegister.form.existingControls}
            </label>
            <Textarea
              rows={2}
              value={form.existingControls}
              onChange={(e) =>
                setForm((f) => ({ ...f, existingControls: e.target.value }))
              }
              placeholder={dict.riskRegister.form.existingControlsPlaceholder}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-foreground mb-1.5 block text-sm font-medium">
                {dict.riskRegister.form.inherentRisk}
              </label>
              <Select
                value={form.inherentRisk}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    inherentRisk: e.target.value as Severity,
                  }))
                }
              >
                {severities.map((s) => (
                  <option key={s} value={s}>
                    {dict.common[s]}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-foreground mb-1.5 block text-sm font-medium">
                {dict.riskRegister.form.status}
              </label>
              <Select
                value={form.status}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    status: e.target.value as RiskStatus,
                  }))
                }
              >
                {editableStatuses.map((s) => (
                  <option key={s} value={s}>
                    {dict.common[s === "mitigating" ? "inProgress" : s]}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-foreground mb-1.5 block text-sm font-medium">
                {dict.riskRegister.form.likelihood}
              </label>
              <Select
                value={form.likelihood}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    likelihood: Number(e.target.value),
                  }))
                }
              >
                {levels.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-foreground mb-1.5 block text-sm font-medium">
                {dict.riskRegister.form.impact}
              </label>
              <Select
                value={form.impact}
                onChange={(e) =>
                  setForm((f) => ({ ...f, impact: Number(e.target.value) }))
                }
              >
                {levels.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-foreground mb-1.5 block text-sm font-medium">
                {dict.riskRegister.form.dueDate}
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
              <span className="text-foreground mb-1.5 block text-sm font-medium">
                {dict.riskRegister.form.residualRiskPreview}
              </span>
              <div className="flex h-10 items-center">
                <Badge tone={severityTone[residualSeverity]}>
                  {dict.common[residualSeverity]} · {residualScore}
                </Badge>
              </div>
            </div>
          </div>
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {dict.common.cancel}
          </Button>
          <Button onClick={handleSubmit}>
            {isEdit
              ? dict.riskRegister.form.submitEdit
              : dict.riskRegister.form.submitCreate}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
