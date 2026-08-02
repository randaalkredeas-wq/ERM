"use client";

import { Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useRcsa, type RcsaRiskInput } from "@/app/(app)/rcsa/rcsa-context";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
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
  RISK_CATEGORIES,
  RISK_OWNERS,
} from "@/constants/risk-register";
import { BUSINESS_UNITS, CONTROL_TYPE_OPTIONS, RCSA_PROCESSES } from "@/constants/grc";
import { severityFromScore, severityTone } from "@/lib/domain";
import { useLocale } from "@/providers/locale-provider";
import type { ControlEffectiveness, ControlType } from "@/types";

const LEVELS = [1, 2, 3, 4, 5];

function emptyRisk(): RcsaRiskInput {
  return {
    description: "",
    category: RISK_CATEGORIES[0],
    inherentLikelihood: 3,
    inherentImpact: 3,
    residualLikelihood: 2,
    residualImpact: 2,
    controlName: "",
    controlType: "preventive",
    controlEffectiveness: "partially-effective",
    recommendation: "",
  };
}

interface RcsaCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RcsaCreateDialog({ open, onOpenChange }: RcsaCreateDialogProps) {
  const { dict } = useLocale();
  const { cycles, createAssessment } = useRcsa();
  const router = useRouter();

  const activeCycle = cycles.find((c) => c.status !== "closed") ?? cycles[0];

  const [cycleId, setCycleId] = useState(activeCycle?.id ?? "");
  const [businessUnit, setBusinessUnit] = useState<string>(BUSINESS_UNITS[0]);
  const [process, setProcess] = useState(RCSA_PROCESSES[BUSINESS_UNITS[0]]?.[0] ?? "");
  const [subProcess, setSubProcess] = useState("");
  const [owner, setOwner] = useState<string>(RISK_OWNERS[0]);
  const [assessor, setAssessor] = useState<string>(RISK_OWNERS[1]);
  const [risks, setRisks] = useState<RcsaRiskInput[]>([emptyRisk()]);
  const [touched, setTouched] = useState(false);

  const isValid =
    subProcess.trim().length > 1 &&
    risks.every((r) => r.description.trim().length > 2);

  function updateRisk(index: number, patch: Partial<RcsaRiskInput>) {
    setRisks((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  function reset() {
    setCycleId(activeCycle?.id ?? "");
    setBusinessUnit(BUSINESS_UNITS[0]);
    setProcess(RCSA_PROCESSES[BUSINESS_UNITS[0]]?.[0] ?? "");
    setSubProcess("");
    setOwner(RISK_OWNERS[0]);
    setAssessor(RISK_OWNERS[1]);
    setRisks([emptyRisk()]);
    setTouched(false);
  }

  function handleSubmit() {
    setTouched(true);
    if (!isValid) return;
    const created = createAssessment({
      cycleId,
      businessUnit,
      process,
      subProcess,
      owner,
      assessor,
      risks,
    });
    reset();
    onOpenChange(false);
    router.push(`/rcsa/${created.id}`);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{dict.rcsa.newAssessment}</DialogTitle>
          <p className="text-muted text-sm">{dict.rcsa.newAssessmentSubtitle}</p>
        </DialogHeader>

        <DialogBody className="max-h-[65vh] space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-foreground mb-1.5 block text-sm font-medium">
                {dict.rcsa.cycle}
              </label>
              <Select value={cycleId} onChange={(e) => setCycleId(e.target.value)}>
                {cycles.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.period}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-foreground mb-1.5 block text-sm font-medium">
                {dict.rcsa.businessUnit}
              </label>
              <Select
                value={businessUnit}
                onChange={(e) => {
                  setBusinessUnit(e.target.value);
                  setProcess(RCSA_PROCESSES[e.target.value]?.[0] ?? "");
                }}
              >
                {BUSINESS_UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-foreground mb-1.5 block text-sm font-medium">
                {dict.rcsa.columns.process}
              </label>
              <Select value={process} onChange={(e) => setProcess(e.target.value)}>
                {(RCSA_PROCESSES[businessUnit] ?? []).map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-foreground mb-1.5 block text-sm font-medium">
                {dict.rcsa.subProcess}
              </label>
              <Input
                value={subProcess}
                onChange={(e) => setSubProcess(e.target.value)}
                placeholder={dict.rcsa.subProcessPlaceholder}
              />
              {touched && subProcess.trim().length <= 1 && (
                <p className="text-danger mt-1 text-xs">{dict.common.required}</p>
              )}
            </div>
            <div>
              <label className="text-foreground mb-1.5 block text-sm font-medium">
                {dict.rcsa.processOwner}
              </label>
              <Select value={owner} onChange={(e) => setOwner(e.target.value)}>
                {RISK_OWNERS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-foreground mb-1.5 block text-sm font-medium">
                {dict.rcsa.assessor}
              </label>
              <Select value={assessor} onChange={(e) => setAssessor(e.target.value)}>
                {RISK_OWNERS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-foreground text-sm font-semibold">
                {dict.rcsa.risksAndControls}
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRisks((prev) => [...prev, emptyRisk()])}
              >
                <Plus className="h-3.5 w-3.5" />
                {dict.rcsa.addRisk}
              </Button>
            </div>

            {risks.map((risk, index) => {
              const inherentSev = severityFromScore(
                risk.inherentLikelihood * risk.inherentImpact,
              );
              const residualSev = severityFromScore(
                risk.residualLikelihood * risk.residualImpact,
              );
              return (
                <Card key={index} className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-muted text-xs font-semibold uppercase tracking-wide">
                      {dict.rcsa.riskNumber.replace("{n}", String(index + 1))}
                    </p>
                    {risks.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setRisks((prev) => prev.filter((_, i) => i !== index))
                        }
                      >
                        <Trash2 className="text-danger h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <Textarea
                    rows={2}
                    value={risk.description}
                    onChange={(e) => updateRisk(index, { description: e.target.value })}
                    placeholder={dict.rcsa.riskDescriptionPlaceholder}
                  />
                  {touched && risk.description.trim().length <= 2 && (
                    <p className="text-danger -mt-2 text-xs">{dict.common.required}</p>
                  )}

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div>
                      <label className="text-muted mb-1 block text-xs">
                        {dict.common.category}
                      </label>
                      <Select
                        value={risk.category}
                        onChange={(e) => updateRisk(index, { category: e.target.value })}
                      >
                        {RISK_CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div>
                      <label className="text-muted mb-1 block text-xs">
                        {dict.rcsa.inherentLikelihood}
                      </label>
                      <Select
                        value={String(risk.inherentLikelihood)}
                        onChange={(e) =>
                          updateRisk(index, { inherentLikelihood: Number(e.target.value) })
                        }
                      >
                        {LEVELS.map((l) => (
                          <option key={l} value={l}>
                            {l}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div>
                      <label className="text-muted mb-1 block text-xs">
                        {dict.rcsa.inherentImpact}
                      </label>
                      <Select
                        value={String(risk.inherentImpact)}
                        onChange={(e) =>
                          updateRisk(index, { inherentImpact: Number(e.target.value) })
                        }
                      >
                        {LEVELS.map((l) => (
                          <option key={l} value={l}>
                            {l}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div className="flex items-end pb-1">
                      <Badge tone={severityTone[inherentSev]}>
                        {dict.rcsa.inherentRisk}: {dict.common[inherentSev]}
                      </Badge>
                    </div>
                    <div>
                      <label className="text-muted mb-1 block text-xs">
                        {dict.rcsa.residualLikelihood}
                      </label>
                      <Select
                        value={String(risk.residualLikelihood)}
                        onChange={(e) =>
                          updateRisk(index, { residualLikelihood: Number(e.target.value) })
                        }
                      >
                        {LEVELS.map((l) => (
                          <option key={l} value={l}>
                            {l}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div>
                      <label className="text-muted mb-1 block text-xs">
                        {dict.rcsa.residualImpact}
                      </label>
                      <Select
                        value={String(risk.residualImpact)}
                        onChange={(e) =>
                          updateRisk(index, { residualImpact: Number(e.target.value) })
                        }
                      >
                        {LEVELS.map((l) => (
                          <option key={l} value={l}>
                            {l}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div className="col-span-2 flex items-end pb-1">
                      <Badge tone={severityTone[residualSev]}>
                        {dict.rcsa.residualRisk}: {dict.common[residualSev]}
                      </Badge>
                    </div>
                  </div>

                  <div className="border-border grid grid-cols-1 gap-3 border-t pt-3 sm:grid-cols-3">
                    <div>
                      <label className="text-muted mb-1 block text-xs">
                        {dict.rcsa.controlName}
                      </label>
                      <Input
                        value={risk.controlName}
                        onChange={(e) => updateRisk(index, { controlName: e.target.value })}
                        placeholder={dict.rcsa.controlNamePlaceholder}
                      />
                    </div>
                    <div>
                      <label className="text-muted mb-1 block text-xs">
                        {dict.rcsa.controlType}
                      </label>
                      <Select
                        value={risk.controlType}
                        onChange={(e) =>
                          updateRisk(index, {
                            controlType: e.target.value as ControlType,
                          })
                        }
                      >
                        {CONTROL_TYPE_OPTIONS.map((t) => (
                          <option key={t} value={t}>
                            {dict.controlsLibrary.enums.type[t]}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div>
                      <label className="text-muted mb-1 block text-xs">
                        {dict.rcsa.controlEffectiveness}
                      </label>
                      <Select
                        value={risk.controlEffectiveness}
                        onChange={(e) =>
                          updateRisk(index, {
                            controlEffectiveness: e.target.value as ControlEffectiveness,
                          })
                        }
                      >
                        {CONTROL_EFFECTIVENESS_OPTIONS.map((eff) => (
                          <option key={eff} value={eff}>
                            {dict.riskRegister.enums.controlEffectiveness[eff]}
                          </option>
                        ))}
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="text-muted mb-1 block text-xs">
                      {dict.rcsa.actionRecommendation}
                    </label>
                    <Textarea
                      rows={2}
                      value={risk.recommendation}
                      onChange={(e) =>
                        updateRisk(index, { recommendation: e.target.value })
                      }
                      placeholder={dict.rcsa.actionRecommendationPlaceholder}
                    />
                  </div>
                </Card>
              );
            })}
          </div>
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {dict.common.cancel}
          </Button>
          <Button onClick={handleSubmit}>{dict.rcsa.createAssessment}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
