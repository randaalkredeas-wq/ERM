import type { BadgeTone } from "@/components/ui/Badge";
import type {
  ApprovalStatus,
  IncidentStatus,
  KriStatus,
  RiskItem,
  RiskStatus,
  Severity,
  UserStatus,
} from "@/types";

export function riskScore(risk: Pick<RiskItem, "likelihood" | "impact">) {
  return risk.likelihood * risk.impact;
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

export const riskStatusTone: Record<RiskStatus, BadgeTone> = {
  open: "warning",
  mitigating: "info",
  closed: "success",
};

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
