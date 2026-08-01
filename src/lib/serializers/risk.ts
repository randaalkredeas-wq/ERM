import "server-only";

import { Prisma } from "@/generated/prisma/client";
import type {
  RiskAttachment,
  RiskComment,
  RiskItem,
  RiskAuditEntry as RiskItemAuditEntry,
  RiskVersion,
  TreatmentAction,
  WorkflowTransition,
} from "@/types";
import { getInitials } from "@/lib/utils";

/** DB enums are UPPER_SNAKE_CASE; the frontend types use kebab-case strings. */
export function toKebab<T extends string>(value: string): T {
  return value.toLowerCase().replace(/_/g, "-") as T;
}

export function toUpperSnake(value: string): string {
  return value.toUpperCase().replace(/-/g, "_");
}

function dateOnly(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function timestamp(d: Date): string {
  return `${d.toISOString().slice(0, 10)} ${d.toISOString().slice(11, 16)}`;
}

function formatBytes(bytes: number): string {
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
  if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export const riskInclude = {
  owner: true,
  createdBy: true,
  attachments: { include: { uploadedBy: true }, orderBy: { uploadedAt: "asc" } },
  comments: { include: { author: true }, orderBy: { createdAt: "asc" } },
  treatmentPlans: { include: { owner: true }, orderBy: { createdAt: "asc" } },
  auditTrail: { include: { user: true }, orderBy: { createdAt: "desc" } },
  versions: { include: { editedBy: true }, orderBy: { version: "desc" } },
  workflowHistory: { include: { actor: true }, orderBy: { createdAt: "desc" } },
} satisfies Prisma.RiskInclude;

export type RiskWithRelations = Prisma.RiskGetPayload<{ include: typeof riskInclude }>;

export function serializeRisk(risk: RiskWithRelations): RiskItem {
  return {
    id: risk.code,
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
    controlEffectiveness: toKebab(risk.controlEffectiveness),
    inherentLikelihood: risk.inherentLikelihood,
    inherentImpact: risk.inherentImpact,
    inherentRisk: toKebab(risk.inherentRisk),
    likelihood: risk.likelihood,
    impact: risk.impact,
    targetLikelihood: risk.targetLikelihood,
    targetImpact: risk.targetImpact,
    targetRisk: toKebab(risk.targetRisk),
    riskTreatment: toKebab(risk.riskTreatment),
    reviewFrequency: toKebab(risk.reviewFrequency),
    nextReviewDate: dateOnly(risk.nextReviewDate),
    owner: risk.owner.name,
    status: toKebab(risk.status),
    workflowStatus: toKebab(risk.workflowStatus),
    workflowHistory: risk.workflowHistory.map(serializeWorkflowTransition),
    dueDate: dateOnly(risk.dueDate),
    isArchived: risk.isArchived,
    createdBy: risk.createdBy.name,
    createdAt: dateOnly(risk.createdAt),
    updatedAt: dateOnly(risk.updatedAt),
    attachments: risk.attachments.map(serializeAttachment),
    comments: risk.comments.map(serializeComment),
    treatmentPlans: risk.treatmentPlans.map(serializeTreatmentAction),
    auditTrail: risk.auditTrail.map(serializeAuditEntry),
    versions: risk.versions.map(serializeVersion),
  };
}

function serializeAttachment(
  a: RiskWithRelations["attachments"][number],
): RiskAttachment {
  return {
    id: a.id,
    name: a.name,
    type: toKebab(a.type),
    size: formatBytes(a.size),
    uploadedBy: a.uploadedBy.name,
    uploadedAt: dateOnly(a.uploadedAt),
  };
}

function serializeComment(
  c: RiskWithRelations["comments"][number],
): RiskComment {
  return {
    id: c.id,
    author: c.author.name,
    authorInitials: getInitials(c.author.name),
    message: c.message,
    createdAt: dateOnly(c.createdAt),
  };
}

function serializeTreatmentAction(
  t: RiskWithRelations["treatmentPlans"][number],
): TreatmentAction {
  return {
    id: t.id,
    title: t.title,
    owner: t.owner.name,
    dueDate: dateOnly(t.dueDate),
    status: toKebab(t.status),
    progress: t.progress,
  };
}

function serializeAuditEntry(
  e: RiskWithRelations["auditTrail"][number],
): RiskItemAuditEntry {
  return {
    id: e.id,
    timestamp: timestamp(e.createdAt),
    user: e.user?.name ?? "System",
    action: e.action,
    details: e.details,
  };
}

function serializeVersion(
  v: RiskWithRelations["versions"][number],
): RiskVersion {
  return {
    id: v.id,
    version: v.version,
    editedBy: v.editedBy.name,
    editedAt: dateOnly(v.createdAt),
    summary: v.summary,
    snapshot: v.snapshot as RiskVersion["snapshot"],
  };
}

function serializeWorkflowTransition(
  w: RiskWithRelations["workflowHistory"][number],
): WorkflowTransition {
  return {
    id: w.id,
    fromStatus: toKebab(w.fromStatus),
    toStatus: toKebab(w.toStatus),
    actor: w.actor.name,
    comment: w.comment ?? undefined,
    timestamp: timestamp(w.createdAt),
  };
}
