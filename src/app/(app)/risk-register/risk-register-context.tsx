"use client";

import { useCallback, useSyncExternalStore } from "react";

import { addAuditEntry } from "@/lib/audit-log-store";
import { CURRENT_USER, severityFromScore } from "@/lib/domain";
import { risks as seedRisks } from "@/lib/mock-data/risks";
import { addNotification } from "@/lib/notifications-store";
import type {
  RiskAttachment,
  RiskFormInput,
  RiskItem,
  RiskWorkflowStatus,
  TreatmentAction,
  WorkflowTransition,
} from "@/types";

/**
 * Plain module-level store (not React state) so risk-register data survives
 * route transitions. The animated PageTransition wrapper in the shell layout
 * keys its subtree by pathname, which remounts every nested layout on
 * navigation — a React-state-based store here would silently reset on every
 * navigation into or out of /risk-register/[id].
 */
let risks: RiskItem[] = seedRisks;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function mutate(updater: (prev: RiskItem[]) => RiskItem[]) {
  risks = updater(risks);
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return risks;
}

function nextId(existing: RiskItem[]) {
  const max = existing.reduce((acc, risk) => {
    const num = Number(risk.id.replace("RSK-", ""));
    return Number.isFinite(num) ? Math.max(acc, num) : acc;
  }, 1000);
  return `RSK-${max + 1}`;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function now() {
  const d = new Date();
  return `${d.toISOString().slice(0, 10)} ${d.toTimeString().slice(0, 5)}`;
}

function logGlobal(riskId: string, action: string, details: string) {
  addAuditEntry({
    timestamp: now(),
    user: CURRENT_USER.name,
    action,
    module: "Risk Register",
    details: details ? `${riskId} — ${details}` : riskId,
  });
}

function snapshotOf(id: string, risk: RiskItem, input: RiskFormInput) {
  return {
    title: input.title,
    status: input.status,
    workflowStatus: risk.workflowStatus,
    likelihood: input.likelihood,
    impact: input.impact,
    inherentRisk: severityFromScore(
      input.inherentLikelihood * input.inherentImpact,
    ),
    targetRisk: severityFromScore(input.targetLikelihood * input.targetImpact),
  };
}

function buildRisk(id: string, input: RiskFormInput, summary: string): RiskItem {
  const inherentRisk = severityFromScore(
    input.inherentLikelihood * input.inherentImpact,
  );
  const targetRisk = severityFromScore(
    input.targetLikelihood * input.targetImpact,
  );
  return {
    id,
    ...input,
    inherentRisk,
    targetRisk,
    workflowStatus: "draft",
    workflowHistory: [],
    isArchived: false,
    createdBy: CURRENT_USER.name,
    createdAt: today(),
    updatedAt: today(),
    attachments: [],
    comments: [],
    treatmentPlans: [],
    auditTrail: [
      {
        id: `AUD-${id}-1`,
        timestamp: now(),
        user: CURRENT_USER.name,
        action: summary,
        details: "Risk logged in the register",
      },
    ],
    versions: [
      {
        id: `VER-${id}-1`,
        version: 1,
        editedBy: CURRENT_USER.name,
        editedAt: today(),
        summary,
        snapshot: {
          title: input.title,
          status: input.status,
          workflowStatus: "draft",
          likelihood: input.likelihood,
          impact: input.impact,
          inherentRisk,
          targetRisk,
        },
      },
    ],
  };
}

function createRisk(input: RiskFormInput): RiskItem {
  const id = nextId(risks);
  const created = buildRisk(id, input, "Created risk");
  mutate((prev) => [created, ...prev]);
  logGlobal(id, "Created risk", input.title);
  return created;
}

function updateRisk(id: string, input: RiskFormInput) {
  mutate((prev) =>
    prev.map((risk) => {
      if (risk.id !== id) return risk;
      const nextVersion = (risk.versions[0]?.version ?? 0) + 1;
      const inherentRisk = severityFromScore(
        input.inherentLikelihood * input.inherentImpact,
      );
      const targetRisk = severityFromScore(
        input.targetLikelihood * input.targetImpact,
      );
      return {
        ...risk,
        ...input,
        inherentRisk,
        targetRisk,
        updatedAt: today(),
        auditTrail: [
          {
            id: `AUD-${id}-${risk.auditTrail.length + 1}`,
            timestamp: now(),
            user: CURRENT_USER.name,
            action: "Updated risk details",
            details: `Risk details updated (v${nextVersion})`,
          },
          ...risk.auditTrail,
        ],
        versions: [
          {
            id: `VER-${id}-${nextVersion}`,
            version: nextVersion,
            editedBy: CURRENT_USER.name,
            editedAt: today(),
            summary: "Risk details updated",
            snapshot: snapshotOf(id, risk, input),
          },
          ...risk.versions,
        ],
      };
    }),
  );
  logGlobal(id, "Updated risk details", input.title);
}

function deleteRisk(id: string) {
  const target = risks.find((r) => r.id === id);
  mutate((prev) => prev.filter((r) => r.id !== id));
  if (target) logGlobal(id, "Deleted risk", target.title);
}

function duplicateRisk(id: string): RiskItem | undefined {
  const source = risks.find((r) => r.id === id);
  if (!source) return undefined;
  const newId = nextId(risks);
  const duplicated: RiskItem = {
    ...source,
    id: newId,
    title: `${source.title} (Copy)`,
    workflowStatus: "draft",
    workflowHistory: [],
    status: "open",
    isArchived: false,
    createdBy: CURRENT_USER.name,
    createdAt: today(),
    updatedAt: today(),
    attachments: [],
    comments: [],
    treatmentPlans: [],
    auditTrail: [
      {
        id: `AUD-${newId}-1`,
        timestamp: now(),
        user: CURRENT_USER.name,
        action: "Duplicated risk",
        details: `Duplicated from ${source.id}`,
      },
    ],
    versions: [
      {
        id: `VER-${newId}-1`,
        version: 1,
        editedBy: CURRENT_USER.name,
        editedAt: today(),
        summary: `Duplicated from ${source.id}`,
        snapshot: {
          title: `${source.title} (Copy)`,
          status: "open",
          workflowStatus: "draft",
          likelihood: source.likelihood,
          impact: source.impact,
          inherentRisk: source.inherentRisk,
          targetRisk: source.targetRisk,
        },
      },
    ],
  };
  mutate((prev) => [duplicated, ...prev]);
  logGlobal(newId, "Duplicated risk", `Duplicated from ${source.id}`);
  return duplicated;
}

function setArchived(id: string, archived: boolean) {
  mutate((prev) =>
    prev.map((risk) => {
      if (risk.id !== id) return risk;
      return {
        ...risk,
        isArchived: archived,
        updatedAt: today(),
        auditTrail: [
          {
            id: `AUD-${id}-${risk.auditTrail.length + 1}`,
            timestamp: now(),
            user: CURRENT_USER.name,
            action: archived ? "Archived risk" : "Restored risk",
            details: archived
              ? "Risk moved to the archive"
              : "Risk restored from the archive",
          },
          ...risk.auditTrail,
        ],
      };
    }),
  );
  logGlobal(id, archived ? "Archived risk" : "Restored risk", "");
}

function addComment(id: string, message: string) {
  if (!message.trim()) return;
  mutate((prev) =>
    prev.map((risk) => {
      if (risk.id !== id) return risk;
      return {
        ...risk,
        updatedAt: today(),
        comments: [
          ...risk.comments,
          {
            id: `CMT-${id}-${risk.comments.length + 1}`,
            author: CURRENT_USER.name,
            authorInitials: CURRENT_USER.initials,
            message: message.trim(),
            createdAt: today(),
          },
        ],
        auditTrail: [
          {
            id: `AUD-${id}-${risk.auditTrail.length + 1}`,
            timestamp: now(),
            user: CURRENT_USER.name,
            action: "Added comment",
            details: message.trim().slice(0, 80),
          },
          ...risk.auditTrail,
        ],
      };
    }),
  );
  logGlobal(id, "Added comment", message.trim().slice(0, 80));
}

function addAttachment(
  id: string,
  attachment: Omit<RiskAttachment, "id" | "uploadedBy" | "uploadedAt">,
) {
  mutate((prev) =>
    prev.map((risk) => {
      if (risk.id !== id) return risk;
      return {
        ...risk,
        updatedAt: today(),
        attachments: [
          ...risk.attachments,
          {
            ...attachment,
            id: `ATT-${id}-${risk.attachments.length + 1}`,
            uploadedBy: CURRENT_USER.name,
            uploadedAt: today(),
          },
        ],
        auditTrail: [
          {
            id: `AUD-${id}-${risk.auditTrail.length + 1}`,
            timestamp: now(),
            user: CURRENT_USER.name,
            action: "Uploaded attachment",
            details: attachment.name,
          },
          ...risk.auditTrail,
        ],
      };
    }),
  );
  logGlobal(id, "Uploaded attachment", attachment.name);
}

function removeAttachment(id: string, attachmentId: string) {
  mutate((prev) =>
    prev.map((risk) => {
      if (risk.id !== id) return risk;
      const target = risk.attachments.find((a) => a.id === attachmentId);
      return {
        ...risk,
        updatedAt: today(),
        attachments: risk.attachments.filter((a) => a.id !== attachmentId),
        auditTrail: target
          ? [
              {
                id: `AUD-${id}-${risk.auditTrail.length + 1}`,
                timestamp: now(),
                user: CURRENT_USER.name,
                action: "Removed attachment",
                details: target.name,
              },
              ...risk.auditTrail,
            ]
          : risk.auditTrail,
      };
    }),
  );
}

const ALLOWED_TRANSITIONS: Record<RiskWorkflowStatus, RiskWorkflowStatus[]> = {
  draft: ["under-review"],
  "under-review": ["approved", "rejected"],
  approved: ["closed", "draft"],
  rejected: ["under-review", "draft"],
  closed: ["draft"],
};

function transitionWorkflow(
  id: string,
  toStatus: RiskWorkflowStatus,
  comment: string | undefined,
  notify: (risk: RiskItem) => { title: string; description: string; tone: "primary" | "success" | "warning" | "danger" | "info" },
) {
  let updatedRisk: RiskItem | undefined;
  mutate((prev) =>
    prev.map((risk) => {
      if (risk.id !== id) return risk;
      if (!ALLOWED_TRANSITIONS[risk.workflowStatus].includes(toStatus)) {
        return risk;
      }
      const transition: WorkflowTransition = {
        id: `WFT-${id}-${risk.workflowHistory.length + 1}`,
        fromStatus: risk.workflowStatus,
        toStatus,
        actor: CURRENT_USER.name,
        comment: comment?.trim() || undefined,
        timestamp: now(),
      };
      updatedRisk = {
        ...risk,
        workflowStatus: toStatus,
        status: toStatus === "closed" ? "closed" : risk.status,
        updatedAt: today(),
        workflowHistory: [transition, ...risk.workflowHistory],
        auditTrail: [
          {
            id: `AUD-${id}-${risk.auditTrail.length + 1}`,
            timestamp: now(),
            user: CURRENT_USER.name,
            action: "Workflow status changed",
            details: `${risk.workflowStatus} → ${toStatus}`,
          },
          ...risk.auditTrail,
        ],
      };
      return updatedRisk;
    }),
  );
  if (updatedRisk) {
    logGlobal(
      id,
      "Workflow status changed",
      `Moved to ${toStatus.replace("-", " ")}`,
    );
    const { title, description, tone } = notify(updatedRisk);
    addNotification({ title, description, tone });
  }
}

function submitForReview(id: string, comment?: string) {
  transitionWorkflow(id, "under-review", comment, (risk) => ({
    title: "Approval requested",
    description: `${risk.id} — ${risk.title} was submitted for review.`,
    tone: "warning",
  }));
}

function approveRisk(id: string, comment?: string) {
  transitionWorkflow(id, "approved", comment, (risk) => ({
    title: "Risk approved",
    description: `${risk.id} — ${risk.title} was approved.`,
    tone: "success",
  }));
}

function rejectRisk(id: string, comment?: string) {
  transitionWorkflow(id, "rejected", comment, (risk) => ({
    title: "Risk rejected",
    description: `${risk.id} — ${risk.title} was rejected and returned for rework.`,
    tone: "danger",
  }));
}

function closeRisk(id: string, comment?: string) {
  transitionWorkflow(id, "closed", comment, (risk) => ({
    title: "Risk closed",
    description: `${risk.id} — ${risk.title} was closed.`,
    tone: "info",
  }));
}

function reopenRisk(id: string, comment?: string) {
  transitionWorkflow(id, "draft", comment, (risk) => ({
    title: "Risk reopened",
    description: `${risk.id} — ${risk.title} was reopened for rework.`,
    tone: "info",
  }));
}

function addTreatmentAction(id: string, input: Omit<TreatmentAction, "id">) {
  mutate((prev) =>
    prev.map((risk) => {
      if (risk.id !== id) return risk;
      const action: TreatmentAction = {
        ...input,
        id: `ACT-${id}-${risk.treatmentPlans.length + 1}`,
      };
      return {
        ...risk,
        updatedAt: today(),
        treatmentPlans: [...risk.treatmentPlans, action],
        auditTrail: [
          {
            id: `AUD-${id}-${risk.auditTrail.length + 1}`,
            timestamp: now(),
            user: CURRENT_USER.name,
            action: "Added treatment action",
            details: input.title,
          },
          ...risk.auditTrail,
        ],
      };
    }),
  );
  logGlobal(id, "Added treatment action", input.title);
}

function updateTreatmentAction(
  id: string,
  actionId: string,
  patch: Partial<Omit<TreatmentAction, "id">>,
) {
  mutate((prev) =>
    prev.map((risk) => {
      if (risk.id !== id) return risk;
      return {
        ...risk,
        updatedAt: today(),
        treatmentPlans: risk.treatmentPlans.map((action) =>
          action.id === actionId ? { ...action, ...patch } : action,
        ),
        auditTrail: [
          {
            id: `AUD-${id}-${risk.auditTrail.length + 1}`,
            timestamp: now(),
            user: CURRENT_USER.name,
            action: "Updated treatment action",
            details:
              risk.treatmentPlans.find((a) => a.id === actionId)?.title ?? "",
          },
          ...risk.auditTrail,
        ],
      };
    }),
  );
}

function deleteTreatmentAction(id: string, actionId: string) {
  mutate((prev) =>
    prev.map((risk) => {
      if (risk.id !== id) return risk;
      const target = risk.treatmentPlans.find((a) => a.id === actionId);
      return {
        ...risk,
        updatedAt: today(),
        treatmentPlans: risk.treatmentPlans.filter((a) => a.id !== actionId),
        auditTrail: target
          ? [
              {
                id: `AUD-${id}-${risk.auditTrail.length + 1}`,
                timestamp: now(),
                user: CURRENT_USER.name,
                action: "Removed treatment action",
                details: target.title,
              },
              ...risk.auditTrail,
            ]
          : risk.auditTrail,
      };
    }),
  );
}

function importRisks(inputs: RiskFormInput[]) {
  if (inputs.length === 0) return 0;
  mutate((prev) => {
    let cursor = prev;
    const created: RiskItem[] = [];
    for (const input of inputs) {
      const id = nextId(cursor);
      const risk = buildRisk(id, input, "Imported risk");
      created.push(risk);
      cursor = [risk, ...cursor];
    }
    return [...created, ...prev];
  });
  logGlobal("Bulk import", "Imported risks", `${inputs.length} risk(s)`);
  return inputs.length;
}

export function useRiskRegister() {
  const risks = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const getRisk = useCallback(
    (id: string) => risks.find((r) => r.id === id),
    [risks],
  );

  return {
    risks,
    getRisk,
    createRisk,
    updateRisk,
    deleteRisk,
    duplicateRisk,
    archiveRisk: (id: string) => setArchived(id, true),
    unarchiveRisk: (id: string) => setArchived(id, false),
    addComment,
    addAttachment,
    removeAttachment,
    submitForReview,
    approveRisk,
    rejectRisk,
    closeRisk,
    reopenRisk,
    addTreatmentAction,
    updateTreatmentAction,
    deleteTreatmentAction,
    importRisks,
  };
}
