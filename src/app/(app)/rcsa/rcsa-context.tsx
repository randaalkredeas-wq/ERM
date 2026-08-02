"use client";

import { createListStore } from "@/lib/create-list-store";
import { CURRENT_USER, severityFromScore } from "@/lib/domain";
import { rcsaAssessments, rcsaCycles } from "@/lib/mock-data/rcsa";
import type {
  ControlEffectiveness,
  ControlType,
  RcsaAssessment,
  RcsaRiskLink,
  RcsaWorkflowStatus,
  Severity,
} from "@/types";

const store = createListStore<RcsaAssessment>(rcsaAssessments);

function nextId(existing: RcsaAssessment[]) {
  const max = existing.reduce((acc, a) => {
    const num = Number(a.id.replace("RCSA-", ""));
    return Number.isFinite(num) ? Math.max(acc, num) : acc;
  }, 4000);
  return `RCSA-${max + 1}`;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

export interface RcsaRiskInput {
  description: string;
  category: string;
  inherentLikelihood: number;
  inherentImpact: number;
  residualLikelihood: number;
  residualImpact: number;
  controlName: string;
  controlType: ControlType;
  controlEffectiveness: ControlEffectiveness;
  recommendation: string;
}

export interface RcsaAssessmentInput {
  cycleId: string;
  businessUnit: string;
  process: string;
  subProcess: string;
  owner: string;
  assessor: string;
  risks: RcsaRiskInput[];
}

function buildRisk(
  assessmentId: string,
  index: number,
  input: RcsaRiskInput,
): RcsaRiskLink {
  return {
    id: `${assessmentId}-R${index + 1}`,
    description: input.description,
    category: input.category,
    inherentLikelihood: input.inherentLikelihood,
    inherentImpact: input.inherentImpact,
    inherentRisk: severityFromScore(input.inherentLikelihood * input.inherentImpact),
    residualLikelihood: input.residualLikelihood,
    residualImpact: input.residualImpact,
    residualRisk: severityFromScore(input.residualLikelihood * input.residualImpact),
    controls: input.controlName.trim()
      ? [
          {
            id: `${assessmentId}-R${index + 1}-C1`,
            name: input.controlName,
            type: input.controlType,
            effectiveness: input.controlEffectiveness,
          },
        ]
      : [],
    recommendation: input.recommendation,
  };
}

const SEVERITY_ORDER: Severity[] = ["low", "medium", "high", "critical"];

function worstSeverity(risks: RcsaRiskLink[], key: "inherentRisk" | "residualRisk") {
  return risks.reduce<Severity>((worst, r) => {
    return SEVERITY_ORDER.indexOf(r[key]) > SEVERITY_ORDER.indexOf(worst)
      ? r[key]
      : worst;
  }, "low");
}

function createAssessment(input: RcsaAssessmentInput): RcsaAssessment {
  const id = nextId(store.getSnapshot());
  const risks = input.risks.map((r, i) => buildRisk(id, i, r));
  const assessment: RcsaAssessment = {
    id,
    cycleId: input.cycleId,
    businessUnit: input.businessUnit,
    process: input.process,
    subProcess: input.subProcess,
    owner: input.owner,
    assessor: input.assessor,
    status: "draft",
    risks,
    overallInherentRisk: worstSeverity(risks, "inherentRisk"),
    overallResidualRisk: worstSeverity(risks, "residualRisk"),
    actionRecommendations: risks.map((r) => r.recommendation).filter(Boolean),
    submittedAt: null,
    approvedAt: null,
    approvedBy: null,
    reviewHistory: [],
    versions: [
      {
        id: `${id}-V1`,
        version: 1,
        editedBy: CURRENT_USER.name,
        editedAt: today(),
        summary: "Assessment created",
      },
    ],
    updatedAt: today(),
  };
  store.addItem(assessment);
  return assessment;
}

const ALLOWED_TRANSITIONS: Record<RcsaWorkflowStatus, RcsaWorkflowStatus[]> = {
  draft: ["self-assessed"],
  "self-assessed": ["under-review"],
  "under-review": ["approved", "rejected"],
  approved: [],
  rejected: ["self-assessed"],
};

function transition(id: string, toStatus: RcsaWorkflowStatus, comment?: string) {
  const current = store.getSnapshot().find((a) => a.id === id);
  if (!current) return;
  if (!ALLOWED_TRANSITIONS[current.status].includes(toStatus)) return;

  const nextVersion = (current.versions[0]?.version ?? 0) + 1;
  const patch: Partial<RcsaAssessment> = {
    status: toStatus,
    updatedAt: today(),
    versions: [
      {
        id: `${id}-V${nextVersion}`,
        version: nextVersion,
        editedBy: CURRENT_USER.name,
        editedAt: today(),
        summary: `Status changed to ${toStatus.replace("-", " ")}`,
      },
      ...current.versions,
    ],
  };
  if (toStatus === "under-review") patch.submittedAt = today();
  if (toStatus === "approved") {
    patch.approvedAt = today();
    patch.approvedBy = CURRENT_USER.name;
  }
  if (comment?.trim() && toStatus !== "self-assessed") {
    patch.reviewHistory = [
      {
        id: `${id}-REV${current.reviewHistory.length + 1}`,
        reviewer: CURRENT_USER.name,
        date: today(),
        comment: comment.trim(),
        decision:
          toStatus === "approved"
            ? "approved"
            : toStatus === "rejected"
              ? "rejected"
              : "changes-requested",
      },
      ...current.reviewHistory,
    ];
  }
  store.updateItem(id, patch);
}

export function useRcsa() {
  const assessments = store.useItems();
  return {
    assessments,
    cycles: rcsaCycles,
    getAssessment: (id: string) => assessments.find((a) => a.id === id),
    createAssessment,
    completeSelfAssessment: (id: string) => transition(id, "self-assessed"),
    submitForReview: (id: string, comment?: string) =>
      transition(id, "under-review", comment),
    approve: (id: string, comment?: string) => transition(id, "approved", comment),
    reject: (id: string, comment?: string) => transition(id, "rejected", comment),
    resubmit: (id: string) => transition(id, "self-assessed"),
    removeAssessment: (id: string) => store.removeItem(id),
  };
}
