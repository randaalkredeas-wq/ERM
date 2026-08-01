import type { BadgeTone } from "@/components/ui/Badge";
import type {
  ApprovalStatus,
  CollectionStatus,
  ControlEffectiveness,
  CreditExposure,
  EclStage,
  IncidentStatus,
  KriStatus,
  RiskAppetiteStatus,
  RiskItem,
  RiskStatus,
  RiskTreatmentStrategy,
  RiskWorkflowStatus,
  Severity,
  TreatmentAction,
  TreatmentActionStatus,
  UserStatus,
} from "@/types";

export const CURRENT_USER = {
  name: "Layla Haddad",
  initials: "LH",
  role: "Chief Risk Officer",
};

export function riskScore(risk: Pick<RiskItem, "likelihood" | "impact">) {
  return risk.likelihood * risk.impact;
}

export function inherentScore(
  risk: Pick<RiskItem, "inherentLikelihood" | "inherentImpact">,
) {
  return risk.inherentLikelihood * risk.inherentImpact;
}

export function targetScore(
  risk: Pick<RiskItem, "targetLikelihood" | "targetImpact">,
) {
  return risk.targetLikelihood * risk.targetImpact;
}

export function severityFromScore(score: number): Severity {
  if (score >= 20) return "critical";
  if (score >= 12) return "high";
  if (score >= 6) return "medium";
  return "low";
}

export const severityTone: Record<Severity, BadgeTone> = {
  low: "success",
  medium: "warning",
  high: "danger",
  critical: "danger",
};

export const severityColor: Record<Severity, string> = {
  low: "var(--success)",
  medium: "var(--warning)",
  high: "#f97316",
  critical: "var(--danger)",
};

export const riskStatusTone: Record<RiskStatus, BadgeTone> = {
  open: "warning",
  mitigating: "info",
  closed: "success",
};

export const workflowStatusTone: Record<RiskWorkflowStatus, BadgeTone> = {
  draft: "neutral",
  "under-review": "warning",
  approved: "success",
  rejected: "danger",
  closed: "info",
};

export function riskAppetiteStatusOf(
  risk: Pick<RiskItem, "likelihood" | "impact">,
): RiskAppetiteStatus {
  const severity = severityFromScore(riskScore(risk));
  if (severity === "critical") return "exceeds-appetite";
  if (severity === "high") return "near-limit";
  return "within-appetite";
}

export const riskAppetiteTone: Record<RiskAppetiteStatus, BadgeTone> = {
  "within-appetite": "success",
  "near-limit": "warning",
  "exceeds-appetite": "danger",
};

export const controlEffectivenessTone: Record<ControlEffectiveness, BadgeTone> = {
  ineffective: "danger",
  "partially-effective": "warning",
  effective: "info",
  "highly-effective": "success",
};

export const riskTreatmentTone: Record<RiskTreatmentStrategy, BadgeTone> = {
  accept: "neutral",
  mitigate: "info",
  transfer: "warning",
  avoid: "danger",
};

export const treatmentActionStatusTone: Record<
  TreatmentActionStatus,
  BadgeTone
> = {
  "not-started": "neutral",
  "in-progress": "info",
  completed: "success",
};

export function isTreatmentActionOverdue(action: TreatmentAction) {
  if (action.status === "completed") return false;
  return new Date(action.dueDate).getTime() < Date.now();
}

export function isReviewDue(risk: Pick<RiskItem, "nextReviewDate">, withinDays = 14) {
  const due = new Date(risk.nextReviewDate).getTime();
  const now = Date.now();
  return due - now <= withinDays * 24 * 60 * 60 * 1000;
}

export const incidentStatusTone: Record<IncidentStatus, BadgeTone> = {
  open: "danger",
  "in-progress": "warning",
  resolved: "success",
};

export const kriStatusTone: Record<KriStatus, BadgeTone> = {
  "on-track": "success",
  "at-risk": "warning",
  breached: "danger",
};

export const approvalStatusTone: Record<ApprovalStatus, BadgeTone> = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
};

export const userStatusTone: Record<UserStatus, BadgeTone> = {
  active: "success",
  inactive: "neutral",
  invited: "info",
};

export const eclStageTone: Record<EclStage, BadgeTone> = {
  "stage-1": "success",
  "stage-2": "warning",
  "stage-3": "danger",
};

export const collectionStatusTone: Record<CollectionStatus, BadgeTone> = {
  current: "success",
  "in-collections": "warning",
  restructured: "info",
  legal: "danger",
  "written-off": "neutral",
  recovered: "primary",
};

export function isNpl(exposure: Pick<CreditExposure, "eclStage" | "daysPastDue">) {
  return exposure.eclStage === "stage-3" || exposure.daysPastDue >= 90;
}
