"use client";

import { createListStore } from "@/lib/create-list-store";
import { vendorItems } from "@/lib/mock-data/vendors";
import type { Severity, VendorAssessmentStatus, VendorClassification, VendorItem } from "@/types";

const store = createListStore<VendorItem>(vendorItems);

function nextId(existing: VendorItem[]) {
  const max = existing.reduce((acc, v) => {
    const num = Number(v.id.replace("VEN-", ""));
    return Number.isFinite(num) ? Math.max(acc, num) : acc;
  }, 6000);
  return `VEN-${max + 1}`;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

export interface VendorInput {
  name: string;
  category: string;
  classification: VendorClassification;
  riskRating: Severity;
  owner: string;
  contractStart: string;
  contractExpiry: string;
  slaCompliance: number;
  lastDueDiligence: string;
  nextDueDiligence: string;
}

function createVendor(input: VendorInput): VendorItem {
  const vendor: VendorItem = {
    id: nextId(store.getSnapshot()),
    ...input,
    assessments: [],
    incidents: [],
    documents: [],
  };
  store.addItem(vendor);
  return vendor;
}

function addAssessment(
  id: string,
  input: { type: string; date: string; status: VendorAssessmentStatus; score: number; assessor: string },
) {
  const current = store.getSnapshot().find((v) => v.id === id);
  if (!current) return;
  store.updateItem(id, {
    assessments: [
      { id: `${id}-A${current.assessments.length + 1}`, ...input },
      ...current.assessments,
    ],
  });
}

function addDocument(id: string, name: string, expiresAt: string | null) {
  const current = store.getSnapshot().find((v) => v.id === id);
  if (!current || !name.trim()) return;
  store.updateItem(id, {
    documents: [
      {
        id: `${id}-D${current.documents.length + 1}`,
        name: name.trim(),
        type: "other",
        uploadedAt: today(),
        expiresAt,
      },
      ...current.documents,
    ],
  });
}

export function useVendorRisk() {
  const vendors = store.useItems();
  return {
    vendors,
    getVendor: (id: string) => vendors.find((v) => v.id === id),
    createVendor,
    addAssessment,
    addDocument,
    removeVendor: (id: string) => store.removeItem(id),
  };
}
