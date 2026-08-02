"use client";

import { createListStore } from "@/lib/create-list-store";
import { businessProcesses, crisisEvents } from "@/lib/mock-data/business-continuity";
import type { BcpTestResult, BusinessProcess, CrisisEvent, CrisisEventStatus } from "@/types";

const processStore = createListStore<BusinessProcess>(businessProcesses);
const crisisStore = createListStore<CrisisEvent>(crisisEvents);

function nextCrisisId(existing: CrisisEvent[]) {
  const max = existing.reduce((acc, c) => {
    const num = Number(c.id.replace("CRS-", ""));
    return Number.isFinite(num) ? Math.max(acc, num) : acc;
  }, 9000);
  return `CRS-${max + 1}`;
}

function addTest(
  id: string,
  input: { date: string; type: string; result: BcpTestResult; notes: string },
) {
  const current = processStore.getSnapshot().find((p) => p.id === id);
  if (!current) return;
  processStore.updateItem(id, {
    tests: [{ id: `${id}-T${current.tests.length + 1}`, ...input }, ...current.tests],
    lastTested: input.date,
    testResult: input.result,
  });
}

export interface CrisisEventInput {
  title: string;
  description: string;
  affectedProcesses: string[];
  responseTeam: string[];
}

function logCrisisEvent(input: CrisisEventInput): CrisisEvent {
  const event: CrisisEvent = {
    id: nextCrisisId(crisisStore.getSnapshot()),
    ...input,
    status: "active",
    triggeredAt: new Date().toISOString(),
    resolvedAt: null,
  };
  crisisStore.addItem(event);
  return event;
}

function updateCrisisStatus(id: string, status: CrisisEventStatus) {
  crisisStore.updateItem(id, {
    status,
    resolvedAt: status === "resolved" ? new Date().toISOString() : null,
  });
}

export function useBusinessContinuity() {
  const processes = processStore.useItems();
  const crises = crisisStore.useItems();
  return {
    processes,
    crises,
    getProcess: (id: string) => processes.find((p) => p.id === id),
    addTest,
    logCrisisEvent,
    updateCrisisStatus,
    removeProcess: (id: string) => processStore.removeItem(id),
    removeCrisisEvent: (id: string) => crisisStore.removeItem(id),
  };
}
