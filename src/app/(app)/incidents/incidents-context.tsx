"use client";

import { createListStore } from "@/lib/create-list-store";
import { CURRENT_USER } from "@/lib/domain";
import { incidentRecords } from "@/lib/mock-data/incidents";
import type { IncidentRecord } from "@/types";

const store = createListStore<IncidentRecord>(incidentRecords);

function nextId(existing: IncidentRecord[]) {
  const max = existing.reduce((acc, i) => {
    const num = Number(i.id.replace("INC-", ""));
    return Number.isFinite(num) ? Math.max(acc, num) : acc;
  }, 3000);
  return `INC-${max + 1}`;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

export interface IncidentInput {
  title: string;
  category: string;
  department: string;
  severity: IncidentRecord["severity"];
  reportedBy: string;
  rootCause: string;
  impactDescription: string;
  impactLevel: IncidentRecord["impactLevel"];
  financialLoss: number;
  regulatoryImpact: boolean;
  regulatoryImpactNotes: string;
  assignedOwner: string;
}

function createIncident(input: IncidentInput): IncidentRecord {
  const id = nextId(store.getSnapshot());
  const incident: IncidentRecord = {
    id,
    ...input,
    status: "open",
    investigationSummary: "",
    correctiveActions: [],
    preventiveActions: [],
    attachments: [],
    timeline: [
      {
        id: `${id}-T1`,
        timestamp: new Date().toISOString(),
        actor: input.reportedBy,
        action: "Reported",
        details: "Incident logged in the register.",
      },
    ],
    closureApproved: false,
    closureApprovedBy: null,
    closureApprovedAt: null,
    reportedAt: today(),
    updatedAt: today(),
  };
  store.addItem(incident);
  return incident;
}

function addTimelineEntry(id: string, action: string, details: string) {
  const current = store.getSnapshot().find((i) => i.id === id);
  if (!current) return;
  store.updateItem(id, {
    timeline: [
      {
        id: `${id}-T${current.timeline.length + 1}`,
        timestamp: new Date().toISOString(),
        actor: CURRENT_USER.name,
        action,
        details,
      },
      ...current.timeline,
    ],
    updatedAt: today(),
  });
}

function startInvestigation(id: string) {
  const current = store.getSnapshot().find((i) => i.id === id);
  if (!current || current.status !== "open") return;
  store.updateItem(id, { status: "investigating", updatedAt: today() });
  addTimelineEntry(id, "Investigating", "Investigation started.");
}

function updateInvestigation(id: string, investigationSummary: string) {
  store.updateItem(id, { investigationSummary, updatedAt: today() });
}

function addCorrectiveAction(id: string, action: string) {
  const current = store.getSnapshot().find((i) => i.id === id);
  if (!current || !action.trim()) return;
  store.updateItem(id, {
    correctiveActions: [...current.correctiveActions, action.trim()],
    updatedAt: today(),
  });
}

function addPreventiveAction(id: string, action: string) {
  const current = store.getSnapshot().find((i) => i.id === id);
  if (!current || !action.trim()) return;
  store.updateItem(id, {
    preventiveActions: [...current.preventiveActions, action.trim()],
    updatedAt: today(),
  });
}

function resolveIncident(id: string) {
  const current = store.getSnapshot().find((i) => i.id === id);
  if (!current || current.status !== "investigating") return;
  store.updateItem(id, { status: "resolved", updatedAt: today() });
  addTimelineEntry(id, "Resolved", "Root cause addressed and corrective actions completed.");
}

function approveClosure(id: string) {
  const current = store.getSnapshot().find((i) => i.id === id);
  if (!current || current.status !== "resolved") return;
  store.updateItem(id, {
    status: "closed",
    closureApproved: true,
    closureApprovedBy: CURRENT_USER.name,
    closureApprovedAt: today(),
    updatedAt: today(),
  });
  addTimelineEntry(id, "Closed", "Closure approved.");
}

function addAttachment(id: string, name: string) {
  const current = store.getSnapshot().find((i) => i.id === id);
  if (!current || !name.trim()) return;
  store.updateItem(id, {
    attachments: [
      ...current.attachments,
      {
        id: `${id}-A${current.attachments.length + 1}`,
        name: name.trim(),
        type: "other",
        size: "—",
        uploadedBy: CURRENT_USER.name,
        uploadedAt: today(),
      },
    ],
    updatedAt: today(),
  });
}

export function useIncidents() {
  const incidents = store.useItems();
  return {
    incidents,
    getIncident: (id: string) => incidents.find((i) => i.id === id),
    createIncident,
    startInvestigation,
    updateInvestigation,
    addCorrectiveAction,
    addPreventiveAction,
    resolveIncident,
    approveClosure,
    addAttachment,
    removeIncident: (id: string) => store.removeItem(id),
  };
}
