"use client";

import { useCallback, useSyncExternalStore } from "react";

import {
  CHIEF_RISK_OFFICER,
  DEPARTMENT_HEADS,
} from "@/constants/risk-register";
import { CURRENT_USER } from "@/lib/domain";
import { risks as seedRisks } from "@/lib/mock-data/risks";
import type {
  RiskApprovalStep,
  RiskAttachment,
  RiskFormInput,
  RiskItem,
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

function buildRisk(
  id: string,
  input: RiskFormInput,
  summary: string,
): RiskItem {
  return {
    id,
    ...input,
    createdBy: CURRENT_USER.name,
    createdAt: today(),
    updatedAt: today(),
    attachments: [],
    comments: [],
    approvals: [],
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
          likelihood: input.likelihood,
          impact: input.impact,
          inherentRisk: input.inherentRisk,
        },
      },
    ],
  };
}

function createRisk(input: RiskFormInput): RiskItem {
  const id = nextId(risks);
  const created = buildRisk(id, input, "Created risk");
  mutate((prev) => [created, ...prev]);
  return created;
}

function updateRisk(id: string, input: RiskFormInput) {
  mutate((prev) =>
    prev.map((risk) => {
      if (risk.id !== id) return risk;
      const nextVersion = (risk.versions[0]?.version ?? 0) + 1;
      return {
        ...risk,
        ...input,
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
            snapshot: {
              title: input.title,
              status: input.status,
              likelihood: input.likelihood,
              impact: input.impact,
              inherentRisk: input.inherentRisk,
            },
          },
          ...risk.versions,
        ],
      };
    }),
  );
}

function deleteRisk(id: string) {
  mutate((prev) => prev.filter((r) => r.id !== id));
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

function submitForApproval(id: string) {
  mutate((prev) =>
    prev.map((risk) => {
      if (risk.id !== id || risk.approvals.length > 0) return risk;
      const deptHead = DEPARTMENT_HEADS[risk.department] ?? CHIEF_RISK_OFFICER;
      const steps: RiskApprovalStep[] = [
        {
          id: `APR-${id}-1`,
          role: "Department Head Approval",
          approver: deptHead,
          status: "pending",
        },
        {
          id: `APR-${id}-2`,
          role: "Chief Risk Officer Sign-off",
          approver: CHIEF_RISK_OFFICER,
          status: "waiting",
        },
      ];
      return {
        ...risk,
        status: "pending-approval",
        updatedAt: today(),
        approvals: steps,
        auditTrail: [
          {
            id: `AUD-${id}-${risk.auditTrail.length + 1}`,
            timestamp: now(),
            user: CURRENT_USER.name,
            action: "Submitted for approval",
            details: "Approval workflow started",
          },
          ...risk.auditTrail,
        ],
      };
    }),
  );
}

function actionApprovalStep(
  id: string,
  stepId: string,
  decision: "approved" | "rejected",
  comment?: string,
) {
  mutate((prev) =>
    prev.map((risk) => {
      if (risk.id !== id) return risk;
      const stepIndex = risk.approvals.findIndex((s) => s.id === stepId);
      if (stepIndex === -1) return risk;

      const approvals = risk.approvals.map((step, index) => {
        if (index === stepIndex) {
          return {
            ...step,
            status: decision,
            date: today(),
            comment: comment?.trim() || step.comment,
          };
        }
        if (
          decision === "approved" &&
          index === stepIndex + 1 &&
          step.status === "waiting"
        ) {
          return { ...step, status: "pending" as const };
        }
        return step;
      });

      const isLastStep = stepIndex === approvals.length - 1;
      const nextStatus =
        decision === "rejected" ? "open" : isLastStep ? "closed" : risk.status;

      return {
        ...risk,
        status: nextStatus,
        updatedAt: today(),
        approvals,
        auditTrail: [
          {
            id: `AUD-${id}-${risk.auditTrail.length + 1}`,
            timestamp: now(),
            user: CURRENT_USER.name,
            action:
              decision === "approved"
                ? "Approved workflow step"
                : "Rejected workflow step",
            details: risk.approvals[stepIndex].role,
          },
          ...risk.auditTrail,
        ],
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
    addComment,
    addAttachment,
    removeAttachment,
    submitForApproval,
    actionApprovalStep,
    importRisks,
  };
}
