"use client";

import { createListStore } from "@/lib/create-list-store";
import { complianceCalendar, complianceObligations, nonComplianceEntries } from "@/lib/mock-data/compliance";
import type {
  ComplianceObligation,
  ComplianceStatus,
  NonComplianceEntry,
  ObligationType,
} from "@/types";

const obligationStore = createListStore<ComplianceObligation>(complianceObligations);
const nonComplianceStore = createListStore<NonComplianceEntry>(nonComplianceEntries);

function nextObligationId(existing: ComplianceObligation[]) {
  const max = existing.reduce((acc, o) => {
    const num = Number(o.id.replace("OBL-", ""));
    return Number.isFinite(num) ? Math.max(acc, num) : acc;
  }, 8000);
  return `OBL-${max + 1}`;
}

export interface ObligationInput {
  title: string;
  type: ObligationType;
  jurisdiction: string;
  owner: string;
  status: ComplianceStatus;
  lastReview: string;
  nextReview: string;
}

function createObligation(input: ObligationInput): ComplianceObligation {
  const obligation: ComplianceObligation = {
    id: nextObligationId(obligationStore.getSnapshot()),
    ...input,
    mappedRisks: [],
    mappedControls: [],
  };
  obligationStore.addItem(obligation);
  return obligation;
}

function updateObligationStatus(id: string, status: ComplianceStatus) {
  obligationStore.updateItem(id, { status });
}

function updateNonComplianceStatus(id: string, status: NonComplianceEntry["status"]) {
  nonComplianceStore.updateItem(id, { status });
}

export function useCompliance() {
  const obligations = obligationStore.useItems();
  const nonComplianceRegister = nonComplianceStore.useItems();
  return {
    obligations,
    nonComplianceRegister,
    calendar: complianceCalendar,
    createObligation,
    updateObligationStatus,
    updateNonComplianceStatus,
    removeObligation: (id: string) => obligationStore.removeItem(id),
  };
}
