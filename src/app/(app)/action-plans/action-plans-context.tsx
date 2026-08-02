"use client";

import { createListStore } from "@/lib/create-list-store";
import { actionPlanItems } from "@/lib/mock-data/action-plans";
import type { ActionDependency, ActionPlanItem, ActionSourceModule } from "@/types";

const store = createListStore<ActionPlanItem>(actionPlanItems);

function nextId(existing: ActionPlanItem[]) {
  const max = existing.reduce((acc, a) => {
    const num = Number(a.id.replace("ACT-", ""));
    return Number.isFinite(num) ? Math.max(acc, num) : acc;
  }, 5000);
  return `ACT-${max + 1}`;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

export interface ActionPlanInput {
  title: string;
  description: string;
  sourceModule: ActionSourceModule;
  sourceRef: string;
  owner: string;
  dueDate: string;
  dependencies: ActionDependency[];
}

function createAction(input: ActionPlanInput): ActionPlanItem {
  const action: ActionPlanItem = {
    id: nextId(store.getSnapshot()),
    ...input,
    status: "not-started",
    progress: 0,
    createdAt: today(),
  };
  store.addItem(action);
  return action;
}

function updateProgress(id: string, progress: number) {
  const clamped = Math.max(0, Math.min(100, progress));
  store.updateItem(id, {
    progress: clamped,
    status: clamped >= 100 ? "completed" : clamped > 0 ? "in-progress" : "not-started",
  });
}

export function useActionPlans() {
  const actions = store.useItems();
  return {
    actions,
    getAction: (id: string) => actions.find((a) => a.id === id),
    createAction,
    updateProgress,
    removeAction: (id: string) => store.removeItem(id),
  };
}
