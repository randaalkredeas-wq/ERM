import type { BadgeTone } from "@/components/ui/Badge";
import type {
  ActionPlanItem,
  ActionPlanStatus,
  BcmCriticality,
  BcpTestResult,
  ComplianceStatus,
  ControlTestingStatus,
  ControlType,
  CrisisEventStatus,
  IncidentRecordStatus,
  IssueItem,
  IssuePriority,
  IssueStatus,
  RcsaCycleStatus,
  RcsaWorkflowStatus,
  VendorAssessmentStatus,
  VendorClassification,
} from "@/types";

export const rcsaCycleStatusTone: Record<RcsaCycleStatus, BadgeTone> = {
  planning: "neutral",
  "in-progress": "info",
  "under-review": "warning",
  approved: "success",
  closed: "neutral",
};

export const rcsaWorkflowStatusTone: Record<RcsaWorkflowStatus, BadgeTone> = {
  draft: "neutral",
  "self-assessed": "info",
  "under-review": "warning",
  approved: "success",
  rejected: "danger",
};

export const controlTypeTone: Record<ControlType, BadgeTone> = {
  preventive: "info",
  detective: "warning",
  corrective: "danger",
};

export const controlTestingStatusTone: Record<ControlTestingStatus, BadgeTone> = {
  "not-tested": "neutral",
  "in-progress": "info",
  passed: "success",
  failed: "danger",
};

export const incidentRecordStatusTone: Record<IncidentRecordStatus, BadgeTone> = {
  open: "danger",
  investigating: "warning",
  resolved: "info",
  closed: "success",
};

export const issuePriorityTone: Record<IssuePriority, BadgeTone> = {
  low: "neutral",
  medium: "info",
  high: "warning",
  critical: "danger",
};

export const issueStatusTone: Record<IssueStatus, BadgeTone> = {
  open: "danger",
  "in-progress": "warning",
  escalated: "danger",
  resolved: "info",
  closed: "success",
};

export const actionPlanStatusTone: Record<ActionPlanStatus, BadgeTone> = {
  "not-started": "neutral",
  "in-progress": "info",
  completed: "success",
};

export function isActionPlanOverdue(action: Pick<ActionPlanItem, "dueDate" | "status">) {
  if (action.status === "completed") return false;
  return new Date(action.dueDate).getTime() < Date.now();
}

export function isIssueOverdue(issue: Pick<IssueItem, "dueDate" | "status">) {
  if (issue.status === "closed" || issue.status === "resolved") return false;
  return new Date(issue.dueDate).getTime() < Date.now();
}

export const vendorClassificationTone: Record<VendorClassification, BadgeTone> = {
  critical: "danger",
  high: "warning",
  medium: "info",
  low: "neutral",
};

export const vendorAssessmentStatusTone: Record<VendorAssessmentStatus, BadgeTone> = {
  scheduled: "neutral",
  "in-progress": "info",
  completed: "success",
  overdue: "danger",
};

export const bcmCriticalityTone: Record<BcmCriticality, BadgeTone> = {
  critical: "danger",
  high: "warning",
  medium: "info",
  low: "neutral",
};

export const bcpTestResultTone: Record<BcpTestResult, BadgeTone> = {
  passed: "success",
  "passed-with-observations": "warning",
  failed: "danger",
  "not-tested": "neutral",
};

export const crisisEventStatusTone: Record<CrisisEventStatus, BadgeTone> = {
  active: "danger",
  contained: "warning",
  resolved: "success",
};

export const complianceStatusTone: Record<ComplianceStatus, BadgeTone> = {
  compliant: "success",
  "partially-compliant": "warning",
  "non-compliant": "danger",
  "not-assessed": "neutral",
};

export function isContractExpiringSoon(contractExpiry: string, withinDays = 90) {
  const diffMs = new Date(contractExpiry).getTime() - Date.now();
  const days = diffMs / (1000 * 60 * 60 * 24);
  return days >= 0 && days <= withinDays;
}

export function isReviewUpcoming(date: string, withinDays = 30) {
  const diffMs = new Date(date).getTime() - Date.now();
  const days = diffMs / (1000 * 60 * 60 * 24);
  return days >= 0 && days <= withinDays;
}
