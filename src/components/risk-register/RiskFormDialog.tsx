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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Textarea } from "@/components/ui/Textarea";
import { Input } from "@/components/ui/Input";
import {
  CATEGORY_SUBCATEGORIES,
  CONTROL_EFFECTIVENESS_OPTIONS,
  DEPARTMENTS,
  RISK_CATEGORIES,
  RISK_OWNERS,
  RISK_SOURCES,
  RISK_TREATMENT_OPTIONS,
  RISK_TYPES,
  REVIEW_FREQUENCY_OPTIONS,
  STRATEGIC_OBJECTIVES,
} from "@/constants/risk-register";
import {
  inherentScore,
  riskScore,
  severityFromScore,
  severityTone,
  targetScore,
} from "@/lib/domain";
import { useLocale } from "@/providers/locale-provider";
import type { RiskFormInput, RiskItem, RiskStatus } from "@/types";
import { useRiskRegister } from "@/app/(app)/risk-register/risk-register-context";

import { RiskMatrixWidget } from "./RiskMatrixWidget";

const editableStatuses: RiskStatus[] = ["open", "mitigating", "closed"];
const levels = [1, 2, 3, 4, 5];

function defaultNextReviewDate() {
  const d = new Date();
  d.setDate(d.getDate() + 90);
  return d.toISOString().slice(0, 10);
}

function emptyForm(): RiskFormInput {
  return {
    title: "",
    description: "",
    department: DEPARTMENTS[0],
    category: RISK_CATEGORIES[0],
    subcategory: CATEGORY_SUBCATEGORIES[RISK_CATEGORIES[0]][0],
    riskSource: RISK_SOURCES[0],
    riskType: RISK_TYPES[0],
    strategicObjective: STRATEGIC_OBJECTIVES[0],
    rootCause: "",
    consequences: "",
    existingControls: "",
    controlEffectiveness: "partially-effective",
    inherentLikelihood: 3,
    inherentImpact: 3,
    likelihood: 3,
    impact: 3,
    targetLikelihood: 2,
    targetImpact: 2,
    riskTreatment: "mitigate",
    reviewFrequency: "quarterly",
    nextReviewDate: defaultNextReviewDate(),
    owner: RISK_OWNERS[0],
    status: "open",
    dueDate: new Date().toISOString().slice(0, 10),
  };
}

function toFormInput(risk: RiskItem): RiskFormInput {
  return {
    title: risk.title,
    description: risk.description,
    department: risk.department,
    category: risk.category,
    subcategory: risk.subcategory,
    riskSource: risk.riskSource,
    riskType: risk.riskType,
    strategicObjective: risk.strategicObjective,
    rootCause: risk.rootCause,
    consequences: risk.consequences,
    existingControls: risk.existingControls,
    controlEffectiveness: risk.controlEffectiveness,
    inherentLikelihood: risk.inherentLikelihood,
    inherentImpact: risk.inherentImpact,
    likelihood: risk.likelihood,
    impact: risk.impact,
    targetLikelihood: risk.targetLikelihood,
    targetImpact: risk.targetImpact,
    riskTreatment: risk.riskTreatment,
    reviewFrequency: risk.reviewFrequency,
    nextReviewDate: risk.nextReviewDate,
    owner: risk.owner,
    status: risk.status,
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

  const inherentSev = severityFromScore(inherentScore(form));
  const residualSev = severityFromScore(riskScore(form));
  const targetSev = severityFromScore(targetScore(form));

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
      <DialogContent className="max-w-3xl">
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

        <DialogBody className="max-h-[65vh]">
          <Tabs defaultValue="basicInfo">
            <TabsList className="flex-wrap">
              <TabsTrigger value="basicInfo">
                {dict.riskRegister.form.sections.basicInfo}
              </TabsTrigger>
              <TabsTrigger value="classification">
                {dict.riskRegister.form.sections.classification}
              </TabsTrigger>
              <TabsTrigger value="analysis">
                {dict.riskRegister.form.sections.analysis}
              </TabsTrigger>
              <TabsTrigger value="assessment">
                {dict.riskRegister.form.sections.assessment}
              </TabsTrigger>
              <TabsTrigger value="treatment">
                {dict.riskRegister.form.sections.treatment}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basicInfo" className="space-y-4">
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
                  <p className="text-danger mt-1 text-xs">
                    {dict.common.required}
                  </p>
                )}
              </div>

              <div>
                <label className="text-foreground mb-1.5 block text-sm font-medium">
                  {dict.riskRegister.form.description}
                </label>
                <Textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  placeholder={dict.riskRegister.form.descriptionPlaceholder}
                />
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
              </div>
            </TabsContent>

            <TabsContent value="classification" className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                <div>
                  <label className="text-foreground mb-1.5 block text-sm font-medium">
                    {dict.riskRegister.form.riskSource}
                  </label>
                  <Select
                    value={form.riskSource}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, riskSource: e.target.value }))
                    }
                  >
                    {RISK_SOURCES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label className="text-foreground mb-1.5 block text-sm font-medium">
                    {dict.riskRegister.form.riskType}
                  </label>
                  <Select
                    value={form.riskType}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, riskType: e.target.value }))
                    }
                  >
                    {RISK_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-foreground mb-1.5 block text-sm font-medium">
                    {dict.riskRegister.form.strategicObjective}
                  </label>
                  <Select
                    value={form.strategicObjective}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        strategicObjective: e.target.value,
                      }))
                    }
                  >
                    {STRATEGIC_OBJECTIVES.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-4">
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
                  {dict.riskRegister.form.consequences}
                </label>
                <Textarea
                  rows={2}
                  value={form.consequences}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, consequences: e.target.value }))
                  }
                  placeholder={dict.riskRegister.form.consequencesPlaceholder}
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
                  placeholder={
                    dict.riskRegister.form.existingControlsPlaceholder
                  }
                />
              </div>
              <div>
                <label className="text-foreground mb-1.5 block text-sm font-medium">
                  {dict.riskRegister.form.controlEffectiveness}
                </label>
                <Select
                  value={form.controlEffectiveness}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      controlEffectiveness:
                        e.target.value as RiskFormInput["controlEffectiveness"],
                    }))
                  }
                >
                  {CONTROL_EFFECTIVENESS_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {dict.riskRegister.enums.controlEffectiveness[c]}
                    </option>
                  ))}
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="assessment" className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-foreground mb-1.5 block text-sm font-medium">
                    {dict.riskRegister.form.inherentLikelihood}
                  </label>
                  <Select
                    value={form.inherentLikelihood}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        inherentLikelihood: Number(e.target.value),
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
                    {dict.riskRegister.form.inherentImpact}
                  </label>
                  <Select
                    value={form.inherentImpact}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        inherentImpact: Number(e.target.value),
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
                    {dict.riskRegister.form.targetLikelihood}
                  </label>
                  <Select
                    value={form.targetLikelihood}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        targetLikelihood: Number(e.target.value),
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
                    {dict.riskRegister.form.targetImpact}
                  </label>
                  <Select
                    value={form.targetImpact}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        targetImpact: Number(e.target.value),
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
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={severityTone[inherentSev]}>
                  {dict.riskRegister.form.matrixInherent} ·{" "}
                  {dict.common[inherentSev]} · {inherentScore(form)}
                </Badge>
                <Badge tone={severityTone[residualSev]}>
                  {dict.riskRegister.form.matrixCurrent} ·{" "}
                  {dict.common[residualSev]} · {riskScore(form)}
                </Badge>
                <Badge tone={severityTone[targetSev]}>
                  {dict.riskRegister.form.matrixTarget} ·{" "}
                  {dict.common[targetSev]} · {targetScore(form)}
                </Badge>
              </div>

              <RiskMatrixWidget
                current={{ likelihood: form.likelihood, impact: form.impact }}
                inherent={{
                  likelihood: form.inherentLikelihood,
                  impact: form.inherentImpact,
                }}
                target={{
                  likelihood: form.targetLikelihood,
                  impact: form.targetImpact,
                }}
                onChange={(point) =>
                  setForm((f) => ({
                    ...f,
                    likelihood: point.likelihood,
                    impact: point.impact,
                  }))
                }
                likelihoodLabel={dict.heatMap.likelihood}
                impactLabel={dict.heatMap.impact}
                currentLabel={dict.riskRegister.form.matrixCurrent}
                inherentLabel={dict.riskRegister.form.matrixInherent}
                targetLabel={dict.riskRegister.form.matrixTarget}
              />
            </TabsContent>

            <TabsContent value="treatment" className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-foreground mb-1.5 block text-sm font-medium">
                    {dict.riskRegister.form.riskTreatment}
                  </label>
                  <Select
                    value={form.riskTreatment}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        riskTreatment:
                          e.target.value as RiskFormInput["riskTreatment"],
                      }))
                    }
                  >
                    {RISK_TREATMENT_OPTIONS.map((t) => (
                      <option key={t} value={t}>
                        {dict.riskRegister.enums.riskTreatment[t]}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label className="text-foreground mb-1.5 block text-sm font-medium">
                    {dict.riskRegister.form.reviewFrequency}
                  </label>
                  <Select
                    value={form.reviewFrequency}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        reviewFrequency:
                          e.target.value as RiskFormInput["reviewFrequency"],
                      }))
                    }
                  >
                    {REVIEW_FREQUENCY_OPTIONS.map((r) => (
                      <option key={r} value={r}>
                        {dict.riskRegister.enums.reviewFrequency[r]}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label className="text-foreground mb-1.5 block text-sm font-medium">
                    {dict.riskRegister.form.nextReviewDate}
                  </label>
                  <Input
                    type="date"
                    value={form.nextReviewDate}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        nextReviewDate: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
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
